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

use log::{trace,debug,info,warn,error};

pub(crate) mod game;
pub(crate) mod protocol;
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

#[tokio::main]
async fn main() {
    pretty_env_logger::init_timed();

    // Keep track of the current state of all games
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

    game_command(&mut users_locked, my_id,&mut games_locked, command).await;
}

async fn game_command(users: &mut Users, my_id: usize, games: &mut Games, command: protocol::Command) {
    trace!("Command {:?} to game_command", command);
    let user = users.get_mut(&my_id).unwrap();

    match command {
        protocol::Command::Ping => (),
        protocol::Command::StartGame(c) => {
            // Create the administrator player based on the current user
            let player = Player::new(user.uuid, c.username.as_str(), true);

            // Now create the game itself
            let game_id = NEXT_GAME_ID.fetch_add(1, Ordering::Relaxed);
            let mut game = Game::new();
            let player_id = game.add_player(player);
            info!("Created new game [{}] for {:?}", game.alias, user.uuid);

            // Add the game to the global list of games
            games.insert(game_id, game);
            let game = games.get(&game_id).unwrap();
            user.game = Some((game_id, player_id));

            // Respond to the user that the game was created
            let response = protocol::Response::GameDetails(game);
            tx_direct(users, my_id, response).await;
        },
        protocol::Command::JoinGame(c) => {
            let player = Player::new(user.uuid, c.username.as_str(), false);

            // Linear search of the game by the provided alias
            let mut game =
                games.iter_mut()
                    .filter(|g| g.1.alias == c.game_id)
                    .next();


            if let Some(game) = game {
                // Add the player to the game, if the game exists
                game.1.add_player(player);
                let response = protocol::Response::GameDetails(game.1);

                // Inform all the users of the new addition
                tx_broadcast(users, my_id, response, true).await;
            } else {
                let response = protocol::Response::Error("I can't find a game with this name!".to_string());
                tx_direct(users, my_id, response).await;
            };
        },
        protocol::Command::LeaveGame => ()
    }
}

async fn tx_direct(users: &Users, my_id: usize, response: protocol::Response<'_>) {
    let user = users.get(&my_id).unwrap();

    let response = protocol::encode(response);
    debug!("Time to transmit {:?}", response);
    match response {
        Ok(r) => user.tx.send(Ok(Message::text(r))),
        Err(e) => return error!("Could not transmit message: {:?}", e),
    };
}

async fn tx_broadcast(users: &Users, my_id: usize, response: protocol::Response<'_>, inclusive: bool) {
    let response = protocol::encode(response);
    debug!("Time to broadcast {:?}", response);

    match response {
        Ok(r) => {
            for (&uid, user) in users.iter() {
                if my_id != uid || inclusive {
                    if let Err(e) = user.tx.send(Ok(Message::text(r.clone()))) {
                        error!("Could not transmit message to {}: {}", user.uuid, e.to_string());
                    }
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
