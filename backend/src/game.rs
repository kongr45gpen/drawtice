extern crate chrono;
extern crate uuid;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use std::vec::Vec;

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
    uuid: Uuid,
    username: String,
    image_url: String,
    status: PlayerStatus,
    deadline: DateTime<Utc>,
    is_admin: bool,
}

pub struct Game {
    alias: String,
    game_status: GameStatus,
    players: Vec<Player>,
}
