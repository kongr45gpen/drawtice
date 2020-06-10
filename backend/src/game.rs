extern crate chrono;
extern crate uuid;
extern crate rand;

pub mod latin_matrix;

use chrono::{DateTime, Utc};
use chrono::prelude::*;
use std::time::{Duration, SystemTime};
use uuid::Uuid;
use rand::{Rng, thread_rng};
use rand::distributions::Alphanumeric;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::option::Option;
use crate::names;
use crate::protocol;
use enum_kinds;
use log::debug;

use std::vec::Vec;
use std::iter;
use std::ops::Add;

#[derive(Serialize, Debug, Clone, PartialEq)]
pub enum PlayerStatus {
    Done,
    Working,
    Uploading,
}

#[derive(Serialize, Debug, PartialEq)]
pub enum GameStatus {
    Lobby,
    Starting,
    Drawing,
    Understanding,
    GameOver,
}

#[derive(Serialize, Deserialize, Debug, Clone, EnumKind)]
#[enum_kind(WorkPackageDataKind)]
#[serde(tag = "type")]
pub enum WorkPackageData {
    TextPackage(TextPackage),
    ImagePackage(ImagePackage),
}

#[derive(Serialize, Debug, Clone)]
pub struct WorkPackage {
    pub player_id: usize,
    pub workload_id: usize,

    #[serde(skip_serializing)]
    kind: WorkPackageDataKind,

    pub data: Option<WorkPackageData>,

    pub filled_automatically: bool,
}

#[derive(Serialize, Debug, Clone)]
pub struct WorkLoad {
    pub packages: Vec<WorkPackage>,
    pub player_id: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TextPackage {
    #[serde(deserialize_with = "crate::protocol::de_validate_text_package")]
    pub text: String
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ImagePackage {
    pub url: String
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
    pub stuck: bool,

    #[serde(with = "posix_date_format")]
    deadline: Option<DateTime<Utc>>,

    pub is_admin: bool,
}

#[derive(Serialize, Debug)]
pub struct Game {
    #[serde(skip_serializing)]
    pub id: usize,

    pub uuid: Uuid,
    pub alias: String,
    pub game_status: GameStatus,
    pub players: Vec<Player>,

    #[serde(skip_serializing)]
    default_time: (Duration, Duration),

    pub workloads: Vec<WorkLoad>,
    pub current_stage: usize,
    pub total_stages: usize,
    pub stage_information_transmitted: bool,
}

impl Player {
    pub fn new(uuid: Uuid, user_id: usize, username: &str, is_admin: bool) -> Player {
        Player {
            uuid,
            user_id,
            username: username.to_string(),
            image_url: format!("https://avatars.dicebear.com/api/human/dt_5gajr_{}.svg?background=%23559&width=256", username),
            status: PlayerStatus::Done,
            stuck: false,
            deadline: None,
            is_admin,
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
            uuid: Uuid::new_v4(),
            game_status: GameStatus::Lobby,
            players: vec![],
            default_time: (Duration::new(60 * 2, 0), Duration::new(60, 0)),
            workloads: vec![],
            current_stage: 0,
            total_stages: 0,
            stage_information_transmitted: true,
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

    /// Start the game, letting all players play
    pub fn start(&mut self) {
        self.next_stage();
    }

    /// Returns if all players have successfully submitted their job
    fn is_everyone_done(&self) -> bool {
        self.players.iter()
            .all(|p| p.status == PlayerStatus::Done || p.stuck)
    }

    /// Returns if all player have submitted their job or are overtime
    pub fn is_round_done(&self) -> bool {
        if self.game_status == GameStatus::Lobby || self.game_status == GameStatus::GameOver {
            return false
        }

        self.players.iter()
            .all(|p| {
                let now: DateTime<Utc> = DateTime::from(SystemTime::now());
                p.status == PlayerStatus::Done
                    || p.stuck
                    || p.deadline.map_or(false,|d| d < now)
            })
    }

    /// Advance to the next game stage
    pub fn next_stage(&mut self) {
        if self.current_stage == 0 || self.current_stage < self.total_stages {
            // Game status state machine transitions
            if self.current_stage == 0 {
                // Game start
                self.game_status = GameStatus::Starting;
                self.total_stages = self.players.len();
                self.create_workloads();
            } else if self.current_stage < self.total_stages {
                if self.game_status == GameStatus::Drawing {
                    self.game_status = GameStatus::Understanding;
                } else {
                    self.game_status = GameStatus::Drawing;
                }

                self.stage_information_transmitted = false;
            }
            self.current_stage += 1;
        } else {
            self.game_status = GameStatus::GameOver;
            self.stage_information_transmitted = false;
        }

        for player in self.players.iter_mut()
            .filter(|p| !p.stuck)
        {
            player.status = if self.game_status == GameStatus::GameOver {
                PlayerStatus::Done
            } else {
                let duration = match game.status {
                    GameStatus::Understanding => self.default_time.1,
                    _ => self.default_time.0
                };
                let deadline = DateTime::from(SystemTime::now() + duration);
                player.deadline = Some(deadline);

                PlayerStatus::Working
            }
        }
    }

    /// Add a duration to all active deadlines
    pub fn extend_deadline(&mut self, duration: chrono::Duration) {
        for player in self.players.iter_mut() {
            if let Some(ref mut ddl) = player.deadline {
                *ddl = *ddl + duration;
            }
        }
    }

    pub fn provide_package(&mut self, player_id: usize, data: WorkPackageData) -> Result<(), protocol::Error>{
        // Find the player's current work package
        let package = self.search_current_package_mut(player_id)
            .ok_or(protocol::Error::from("No data package exists for you... Please try later"))?;

        if WorkPackageDataKind::from(&data) != package.kind {
            return Err(protocol::Error::from("You have provided an incorrect datatype for this round"))
        }

        package.data = Some(data);

        let player = self.players.get_mut(player_id)
            .ok_or(protocol::Error::from("Nonexistent players cannot provide packages"))?;
        player.status = PlayerStatus::Done;

        if self.is_everyone_done() {
            debug!("Moving to the next round because all players submitted their data");
            self.next_stage();
        }

        Ok(())
    }

    pub fn get_previous_package(&self, player_id: usize) -> Option<&WorkPackage> {
        let current_package = self.search_current_package(player_id)?;
        let workload = self.workloads.get(current_package.workload_id)?;

        if self.current_stage < 2 { return None }

        let previous_package = workload.packages.get(self.current_stage - 2)?;

        Some(previous_package)
    }

    fn search_current_package(&self, player_id: usize) -> Option<&WorkPackage> {
        if self.current_stage > self.total_stages || self.current_stage <= 0 {
            return None;
        }

        let current_stage = self.current_stage;

        self.workloads.iter()
            .map(|wl| wl.packages.get(current_stage - 1).unwrap())
            .find(|wp| wp.player_id == player_id)
    }

    fn search_current_package_mut(&mut self, player_id: usize) -> Option<&mut WorkPackage> {
        if self.current_stage > self.total_stages || self.current_stage <= 0 {
            return None;
        }

        let current_stage = self.current_stage;

        self.workloads.iter_mut()
            .map(|wl| wl.packages.get_mut(current_stage - 1).unwrap())
            .find(|wp| wp.player_id == player_id)
    }

    /// End the game, removing all players
    pub fn end(&mut self) {
        self.players.clear();
    }

    /// Return whether the game has ended
    pub fn is_over(&self) -> bool {
        return self.players.is_empty();
    }

    /// Mark a player as stuck, if they exist
    pub fn player_stuck(&mut self, player_id: usize, stuck: bool) {
        self.players
            .get_mut(player_id)
            .map(|player| player.stuck = stuck);

        //TODO: Move round if done
    }

    /// Populate the workloads array, creating and assigning the necessary workloads
    fn create_workloads(&mut self) {
        self.workloads.reserve_exact(self.total_stages);

        let latin_matrix = latin_matrix::generate_latin_matrix(self.total_stages);
        for (wl_id, wl) in latin_matrix.iter().enumerate() {
            let workload = WorkLoad {
                packages: wl.iter().enumerate().map(|(wp_id, wp_target)| WorkPackage {
                    player_id: *wp_target,
                    workload_id: wl_id,
                    kind: if wp_id % 2 == 0 { WorkPackageDataKind::TextPackage } else { WorkPackageDataKind::ImagePackage },
                    data: None,
                    filled_automatically: false
                }).collect(),
                player_id: wl.get(0).map(|x| * x).unwrap_or(0),
            };

            self.workloads.push(workload)
        }
    }
}

mod posix_date_format {
    use chrono::{DateTime, Utc, TimeZone};
    use serde::{self, Deserialize, Serializer, Deserializer};

    // The signature of a serialize_with function must follow the pattern:
    //
    //    fn serialize<S>(&T, S) -> Result<S::Ok, S::Error>
    //    where
    //        S: Serializer
    //
    // although it may also be generic over the input types T.
    pub fn serialize<S>(
        date: &Option<DateTime<Utc>>,
        serializer: S,
    ) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
    {
        match date {
            Some(d) => serializer.serialize_i64(d.timestamp()),
            None => serializer.serialize_i64(0),
        }
    }

    // The signature of a deserialize_with function must follow the pattern:
    //
    //    fn deserialize<'de, D>(D) -> Result<T, D::Error>
    //    where
    //        D: Deserializer<'de>
    //
    // although it may also be generic over the output types T.
    pub fn deserialize<'de, D>(
        deserializer: D,
    ) -> Result<Option<DateTime<Utc>>, D::Error>
        where
            D: Deserializer<'de>,
    {
        let timestamp = i64::deserialize(deserializer)?;

        match timestamp {
            0 => Ok(None),
            _ => Ok(Some(Utc.timestamp(timestamp, 0)))
        }
    }
}
