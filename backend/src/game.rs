extern crate chrono;
extern crate uuid;
extern crate rand;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use rand::{Rng, thread_rng};
use rand::distributions::Alphanumeric;

use std::vec::Vec;
use std::iter;

pub enum PlayerStatus {
    Stuck,
    Done,
    Working,
    Uploading
}

pub enum GameStatus {
    Lobby,
    Drawing,
    Understanding,
    GameOver
}

pub struct Player {
    pub uuid: Uuid,
    pub username: String,
    image_url: String,
    pub status: PlayerStatus,
    deadline: Option<DateTime<Utc>>,
    pub is_admin: bool,
}

pub struct Game {
    pub alias: String,
    pub game_status: GameStatus,
    pub players: Vec<Player>,
}

impl Player {
    pub fn new(uuid: Uuid, username: &str, is_admin: bool) -> Player {
        Player {
            uuid,
            username: username.to_string(),
            image_url: "https://via.placeholder.com/150x300".to_string(),
            status: PlayerStatus::Done,
            deadline: None,
            is_admin
        }
    }
}

impl Game {
    pub fn new() -> Game {
        // Generate random name
        let mut rng = thread_rng();
        let alias: String = iter::repeat(())
            .map(|()| rng.sample(Alphanumeric))
            .take(7)
            .collect();

        Game {
            alias,
            game_status: GameStatus::Lobby,
            players: vec![],
        }
    }

    /// Add one new player to the game
    pub fn add_player(&mut self, player: Player) -> usize {
        self.players.push(player);
        self.players.len() - 1
    }
}
