// #![deny(warnings)]
use std::collections::HashMap;
use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc,
};

use futures::{FutureExt, StreamExt};
use tokio::sync::{mpsc, Mutex};
use warp::ws::{Message, WebSocket};
use warp::http::header::{HeaderMap, HeaderValue};
use warp::Filter;
use uuid::Uuid;
use std::iter;
use std::env;

use log::{trace,debug,info,warn,error};

pub(crate) mod game;
pub(crate) mod protocol;
pub(crate) mod names;

use game::{Player,Game};

struct User {
    uuid: Uuid,
    tx: mpsc::UnboundedSender<Result<Message, warp::Error>>,
    /// IDs of the game and the player in the game
    game: Option<(usize, usize)>
}

/// Our global unique user id counter.
static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
static NEXT_GAME_ID: AtomicUsize = AtomicUsize::new(1);

/// Our state of currently connected users.
///
/// - Key is their id
/// - Value is a sender of `warp::ws::Message` or a game
type Users = HashMap<usize, User>;
type UsersMutex = Arc<Mutex<Users>>;

/// Currently active games
type Games = HashMap<usize, Game>;
type GamesMutex = Arc<Mutex<Games>>;

impl User {
    //noinspection RsNeedlessLifetimes
    fn fetch_game<'a>(self: &User, games: &'a Games) -> protocol::Result<&'a Game> {
        self.game
            .and_then(|g| games.get(&(g.0)))
            .ok_or(protocol::Error::new("User not in an active game".to_string()))
    }

    //noinspection RsNeedlessLifetimes
    fn fetch_game_mut<'a>(self: &User, games: &'a mut Games) -> protocol::Result<&'a mut Game> {
        self.game
            .and_then(move |g| games.get_mut(&(g.0)))
            .ok_or(protocol::Error::new("User not in an active game".to_string()))
    }

    fn fetch_player<'a>(self: &User, game: &'a Game) -> protocol::Result<(&'a Player, usize)> {
        self.game
            .and_then(move |g| game.players
                .get(g.1)// Get the player from the game based on their index
                .map(|p| (p, g.1))
            )
            .ok_or(protocol::Error::new("Could not find user in their game".to_string()))
    }

    fn fetch_by_player<'a>(users: &'a mut Users, player: &Player) -> protocol::Result<&'a mut User> {
        users.get_mut(&player.user_id)
            .ok_or(protocol::Error::from("Could not find user for player"))
    }

    fn fetch_many_by_player<'a>(users: &'a mut Users, player: &Player) -> HashMap<&'a usize, &'a mut User> {
        let uuid = player.uuid;

        users.iter_mut()
            .filter(|u| u.1.uuid == uuid)
            .collect()
    }

    async fn tx_direct(self: &User, response: protocol::Response<'_>) {
        let response = protocol::encode(response);
        match response {
            Ok(r) => self.tx_direct_str(r).await,
            Err(e) => return error!("Could not encode message: {:?}", e),
        };
    }

    async fn tx_direct_str(self: &User, response: String) {
        let send = self.tx.send(Ok(Message::text(response)));

        if let Err(e) = send {
            error!("Could not transmit message to {}: {:?}", self.uuid, e);
        }
    }
}

impl Player {
    #[must_use]
    fn expect_admin(self: &Player) -> Result<(), protocol::Error> {
        match self.is_admin {
            true => Ok(()),
            false => Err(protocol::Error::from("You do not have the permission to perform this action"))
        }
    }
}

impl Game {
    async fn tx_game(self: &Game, users: &Users, my_id: usize, response: protocol::Response<'_>, inclusive: bool) {
        tx_game(users, my_id, self.id, response, inclusive).await
    }

    async fn tx_game_details(self: &Game, users: &Users, include_personal_details: bool) {
        let response_game = protocol::encode(protocol::Response::GameDetails(self));
        let response_game = match response_game {
            Ok(r) => r,
            Err(e) => return error!("Could not encode message: {:?}", e),
        };

        for (&uid, user) in users.iter() {
            let game = user.game;

            if let Some(g) = game {
                if g.0 == self.id {
                    user.tx_direct_str(response_game.clone()).await;

                    if include_personal_details {
                        let player = self.players.get(g.1);
                        if let Some(p) = player {
                            let response_details = protocol::Response::PersonalDetails(
                                protocol::PersonalDetailsResponse::new(g.1, p)
                            );
                            user.tx_direct(response_details).await;
                        }
                    }
                }
            }
        }
    }

    fn reassign_users(self: &Game, users: &mut Users) {
        // Reassign player IDs#[serde(skip_serializing)]
        let uuids = self.get_player_uuids();

        // We need to reassign all user IDs when a user goes away!
        for (_, user) in users.iter_mut() {
            if let Some(g) = user.game {
                if g.0 == self.id { // only users that are in this game
                    let index = uuids.get(&user.uuid);
                    // Also makes sure to "None" users not belonging in the game anymore
                    user.game = index.map(|i| (g.0, *i));
                }
            }
        }
    }
}

// TODO: Cache the result of this
fn is_debug_mode() -> bool {
    env::var("DRAWTICE_DEBUG")
        .map(|s| !s.is_empty())
        .unwrap_or(false)
}

#[tokio::main]
async fn main() {
    pretty_env_logger::init_timed();

    let games : GamesMutex = Arc::new(Mutex::new(HashMap::new()));
    let games = warp::any().map(move || games.clone());

    // Keep track of all connected users, key is usize, value
    // is a websocket sender.
    let users = Arc::new(Mutex::new(HashMap::new()));
    // Turn our "state" into a new Filter...
    let users = warp::any().map(move || users.clone());

    // Prepare any headers to be added to the request
    let mut headers = HeaderMap::new();
    headers.insert("Access-Control-Allow-Origin", HeaderValue::from_static("*"));

    // GET /ws -> websocket upgrade
    let ws = warp::path("ws")
        // The `ws()` filter will prepare Websocket handshake...
        .and(warp::ws())
        .and(users)
        .and(games)
        .map(|ws: warp::ws::Ws, users, games| {
            // This will call our function if the handshake succeeds.
            ws.on_upgrade(move |socket| user_connected(socket, users, games))
        })
        .with(warp::reply::with::headers(headers));

    // GET / -> index html
    let index = warp::path::end().map(|| warp::reply::html(INDEX_HTML));

    let routes = index.or(ws);

    warp::serve(routes).run(([0, 0, 0, 0], 3030)).await;
}

async fn user_connected(ws: WebSocket, users: UsersMutex, games: GamesMutex) {
    // Use a counter to assign a new unique ID for this user.
    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);

    // Split the socket into a sender and receive of messages.
    let (user_ws_tx, mut user_ws_rx) = ws.split();

    // Use an unbounded channel to handle buffering and flushing of messages
    // to the websocket...
    let (tx, rx) = mpsc::unbounded_channel();
    tokio::task::spawn(rx.forward(user_ws_tx).map(|result| {
    }));

    // Save the sender in our list of connected users.
    let user = User { tx, uuid: Uuid::new_v4(), game: None };
    users.lock().await.insert(my_id, user);

    // Generate a uuid
    debug!("Time to create a new UUID! {}", Uuid::new_v4());

    // Return a `Future` that is basically a state machine managing
    // this specific user's connection.

    // Make an extra clone to give to our disconnection handler...
    let users2 = users.clone();

    // Every time the user sends a message, broadcast it to
    // all other users...
    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                break;
            }
        };
        user_message(my_id, msg, &users, &games).await;
    }

    // user_ws_rx stream will keep processing as long as the user stays
    // connected. Once they disconnect, then...
    user_disconnected(my_id, &users2).await;
}

async fn user_message(my_id: usize, msg: Message, users: &UsersMutex, games: &GamesMutex) {
    // Skip any non-Text messages...
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };

    let mut users_locked = users.lock().await;

    trace!("Received user [#{}] message {}", my_id, msg);
    let command = match protocol::parse(msg) {
        Err(e) => {
            error!("Error parsing JSON: {}", e);
            tx_direct(&users_locked, my_id,
                      protocol::Response::Error(format!("Invalid data: {}", e.to_string())))
                .await;
            return
        },
        Ok(c) => c,
    };

    let mut games_locked = games.lock().await;

    let result = game_command(&mut users_locked, my_id,&mut games_locked, command).await;
    if let Err(e) = result {
        let error_response = protocol::Response::Error(e.to_string());
        warn!("Sending error: {:?}", e);
        tx_direct(&users_locked, my_id, error_response).await;
    }
}

async fn game_command(users: &mut Users, my_id: usize, games: &mut Games, command: protocol::Command)
    -> protocol::Result<()> {
    trace!("Command {:?} to game_command", command);
    let user = users.get_mut(&my_id).unwrap();

    match command {
        protocol::Command::Ping => (),
        protocol::Command::NewGame(c) => {
            // Create the administrator player based on the current user
            let player = Player::new(user.uuid, my_id,c.username.as_str(), true);
            let player2 = player.clone();

            // Now create the game itself
            let game_id = NEXT_GAME_ID.fetch_add(1, Ordering::Relaxed);
            let mut game = Game::new(game_id);
            let player_id = game.add_player(player);
            info!("Created new game [{}] for {:?}", game.alias, user.uuid);

            // Add the game to the global list of games
            games.insert(game_id, game);
            let game = games.get(&game_id).unwrap();
            user.game = Some((game_id, player_id));

            // Respond to the user that the game was created
            let response = protocol::Response::GameDetails(game);
            tx_direct(users, my_id, response).await;

            // Respond to the user about some interesting personal information
            tx_direct(users, my_id,
                      protocol::Response::PersonalDetails(
                          protocol::PersonalDetailsResponse::new(player_id, &player2)
                      )
            ).await;
            tx_direct(users, my_id, protocol::Response::YourUuid(player2.uuid.to_string()))
                .await;
        },
        protocol::Command::JoinGame(c) => {
            let player = Player::new(user.uuid, my_id,c.username.as_str(), false);

            // Linear search of the game by the provided alias
            let game =
                games.iter_mut()
                    .filter(|g| g.1.alias == c.game_id)
                    .next()
                    .ok_or("Could not find a game with this name!")?;

            if game.1.game_status != game::GameStatus::Lobby {
                return Err(protocol::Error::from("I'm sorry, but this game is already running :/"));
            }

            // Add the player to the game, if the game exists
            let player2 = player.clone();
            let player_id = game.1.add_player(player);
            let response = protocol::Response::GameDetails(game.1);
            user.game = Some((*game.0, player_id));

            info!("User {:?} joined [{}]", user.uuid, game.1.alias);

            // Inform all the users of the new addition
            game.1.tx_game(users, my_id, response, true).await;
            tx_direct(users, my_id,
                      protocol::Response::PersonalDetails(
                          protocol::PersonalDetailsResponse::new(player_id, &player2)
                      )
            ).await;
            tx_direct(users, my_id, protocol::Response::YourUuid(player2.uuid.to_string()))
                .await;
        },
        protocol::Command::KickPlayer(c) => {
            let game = user.fetch_game_mut(games)?;
            let (kicker, _) = user.fetch_player(game)?;

            kicker.expect_admin()?;

            // Let the user(s) know they've been kicked
            // Alerts multiple user sessions
            let kicked = game.players.get(c.player_id)
                .ok_or(protocol::Error::from("Player not in the game"))?;
            for (_, user) in User::fetch_many_by_player(users, kicked) {
                user.tx_direct(protocol::Response::LeftGame).await;
            }

            game.remove_player(c.player_id);
            game.reassign_users(users);
            game.tx_game_details(users, true).await;
        }
        protocol::Command::LeaveGame => {
            let game = user.fetch_game_mut(games)?;
            let (player, player_id) = user.fetch_player(game)?;

            if player.is_admin {
                // Destroy the game
                game.tx_game(users, my_id, protocol::Response::LeftGame, true).await;
                game.end();
            } else {
                game.remove_player(player_id);
                user.tx_direct(protocol::Response::LeftGame).await;
            }

            game.reassign_users(users);
            game.tx_game_details(users, true).await;
        },
        protocol::Command::MyUuid(s) => {
            let uuid = Uuid::parse_str(s.as_str())
                .map_err(|_| protocol::Error::from("Invalid UUID provided"))?;
            user.uuid = uuid;

            // Search for this user in all our games
            'outer: for (&gid, game) in games.iter_mut() {
                for (pid, player) in game.players.iter_mut().enumerate() {
                    if player.uuid == uuid {
                        // Found the player!
                        player.user_id = my_id;
                        user.game = Some((gid, pid));

                        // Announce the game to the user
                        user.tx_direct(protocol::Response::PersonalDetails(
                            protocol::PersonalDetailsResponse::new(pid, &player)
                        )).await;
                        user.tx_direct(protocol::Response::GameDetails(game)).await;

                        return Ok(())
                    }
                }
            }

            // Reaching this point means the player is not in a game
            if is_debug_mode() {
                debug!("Debug mode player joining activated");

                // Debug mode. Place the user immediately into a game
                let mut game_search = games.iter_mut().next();
                let (game_id, game) = match game_search {
                    Some(g) => (*g.0, g.1),
                    None => {
                        // Create a game if none exists
                        let id = NEXT_GAME_ID.fetch_add(1, Ordering::Relaxed);
                        let mut game = Game::new(id);

                        // Add a fake stuck player to be able to start immediately
                        let mut stuck_player = Player::new(Uuid::new_v4(), usize::max_value(), "fake player", false);
                        stuck_player.status = game::PlayerStatus::Stuck;
                        game.add_player(stuck_player);

                        games.insert(id, game);

                        (id, games.get_mut(&id).unwrap())
                    }
                };

                let player = Player::new(user.uuid, my_id,names::generate_random_name().as_str(), true);
                let player_id = game.add_player(player);
                user.game = Some((game_id, player_id));

                game.tx_game_details(users, true).await;
            }
        },
        protocol::Command::StartGame => {
            let game = user.fetch_game_mut(games)?;
            let (player, _) = user.fetch_player(game)?;
            player.expect_admin()?;

            game.start();
            game.tx_game_details(users, false).await;
        },
        protocol::Command::TextPackage(c) => {
            let game = user.fetch_game_mut(games)?;

            game.provide_text_package(user.game.unwrap().1);
            game.tx_game_details(users, false).await;
        }
    }

    Ok(())
}

// async fn game_function_single(users: &mut Users, my_id: usize, games: &mut Games, function: fn(&Game)) {
//     let game = user.game.and_then(|g| games.get(&(g.0)));
//
//     if let game = Some(game) {
//         function(game);
//     } else {
//         let response = protocol::Response::Error("User not in a game".to_string());
//         tx_direct(users, my_id, response).await;
//     }
// }

// async fn game_function_single_mut(users: &mut Users, my_id: usize, games: &mut Games, function: fn(&mut Users, usize, &mut Game)) {
//     let mut game = user.game.and_then(|g| games.get_mut(&(g.0)));
//     function(users, my_id, game);
// }

async fn tx_direct(users: &Users, my_id: usize, response: protocol::Response<'_>) {
    let user = users.get(&my_id).unwrap();

    debug!("Time to transmit {:?}", response);
    user.tx_direct(response).await;
}

async fn tx_game(users: &Users, my_id: usize, game_id: usize, response: protocol::Response<'_>, inclusive: bool) {
    debug!("Time to game-broadcast {:?}", response);
    let response = protocol::encode(response);

    match response {
        Ok(r) => {
            for (&uid, user) in users.iter() {
                let game = user.game;

                if let Some(g) = game {
                    if g.0 == game_id && (my_id != uid || inclusive) {
                        user.tx_direct_str(r.clone()).await;
                    }
                }
            }
        },
        Err(e) => return error!("Could not transmit message: {:?}", e),
    };
}

async fn tx_broadcast(users: &Users, my_id: usize, response: protocol::Response<'_>, inclusive: bool) {
    debug!("Time to broadcast {:?}", response);
    let response = protocol::encode(response);

    match response {
        Ok(r) => {
            for (&uid, user) in users.iter() {
                if my_id != uid || inclusive {
                    user.tx_direct_str(r.clone()).await;
                }
            }
        },
        Err(e) => return error!("Could not transmit message: {:?}", e),
    };
}

async fn user_disconnected(my_id: usize, users: &UsersMutex) {
    eprintln!("good bye user: {}", my_id);

    // Stream closed up, so remove from the user list
    users.lock().await.remove(&my_id);
}

static INDEX_HTML: &str = r#"
Hello world. These are not the droids you are looking for.
"#;
