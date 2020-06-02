extern crate chrono;
extern crate uuid;
extern crate rand;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use rand::{Rng, thread_rng};
use rand::distributions::Alphanumeric;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::names;

use std::vec::Vec;
use std::iter;

#[derive(Serialize, Debug, Clone)]
pub enum PlayerStatus {
    Stuck,
    Done,
    Working,
    Uploading
}

#[derive(Serialize, Debug)]
pub enum GameStatus {
    Lobby,
    Drawing,
    Understanding,
    GameOver
}

#[derive(Serialize, Debug, Clone)]
pub struct Player {
    #[serde(skip_serializing)]
    pub uuid: Uuid,
    #[serde(skip_serializing)]
    pub user_id: usize,

    pub username: String,
    image_url: String,
    pub status: PlayerStatus,

    #[serde(skip_serializing)]
    deadline: Option<DateTime<Utc>>,

    pub is_admin: bool,
}

#[derive(Serialize, Debug)]
pub struct Game {
    #[serde(skip_serializing)]
    pub id: usize,

    pub alias: String,
    pub game_status: GameStatus,
    pub players: Vec<Player>,
}

impl Player {
    pub fn new(uuid: Uuid, user_id: usize, username: &str, is_admin: bool) -> Player {
        Player {
            uuid,
            user_id,
            username: username.to_string(),
            image_url: format!("https://avatars.dicebear.com/api/human/dt_5gajr_{}.svg?background=%23559", username),
            status: PlayerStatus::Done,
            deadline: None,
            is_admin
        }
    }
}

impl Game {
    pub fn new(id: usize) -> Game {
        // Generate random name
        let alias: String = names::generate_random_name();

        Game {
            id,
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

    /// Remove one player from the game by ID, if exists
    /// Warning: This function reassigns all player IDs
    pub fn remove_player(&mut self, player_id: usize) {
        if player_id < self.players.len() {
            self.players.remove(player_id);
        }
    }

    pub fn get_player_uuids(&self) -> HashMap<Uuid, usize> {
        self.players
            .iter()
            .enumerate()
            .map(|player| (player.1.uuid, player.0))
            .collect()
    }

    /// End the game, removing all players
    pub fn end(&mut self) {
        self.players.clear();
    }

    /// Return whether the game has ended
    pub fn is_over(&self) -> bool {
        return self.players.is_empty()
    }
}
