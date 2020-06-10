extern crate base64;

use serde::{Deserialize, Serialize};
use serde_json::{Value, from_value, json};
use uuid::Uuid;

use std::io::{ErrorKind};
use log::{trace, debug, info, warn, error};
use serde_json::Map;
use crate::game;
use std::any::Any;
use std::fmt;

pub(crate) type Result<T> = std::result::Result<T, Error>;

// Define protocol error type
#[derive(Debug, Clone)]
pub struct Error {
    pub text: String,
}

impl Error {
    pub fn new(text: String) -> Self {
        Error { text }
    }
}

impl std::convert::From<&str> for Error {
    fn from(message: &str) -> Self {
        Error::new(message.to_string())
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(self.text.as_str())
    }
}

// Allow other errors to wrap this one.
impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

#[derive(Debug)]
pub enum Command {
    Ping,
    NewGame(NewGameCommand),
    JoinGame(JoinCommand),
    StartGame,
    LeaveGame,
    KickPlayer(KickCommand),
    MyUuid(String),
    TextPackage(RawTextPackage),
    ImagePackage(RawImagePackage),
    NextRound,
    ExtendDeadline(i32),
    RestartGame,
}

#[derive(Debug)]
pub enum Response<'a> {
    Error(String),
    Pong,
    GameDetails(&'a game::Game),
    PersonalDetails(PersonalDetailsResponse),
    YourUuid(String),
    LeftGame,
    PreviousTextPackage(game::TextPackage),
    PreviousImagePackage(game::ImagePackage),
    AllWorkloads(Vec<game::WorkLoad>),
    Rollcall
}

#[derive(Deserialize, Debug)]
pub struct JoinCommand {
    pub game_id: String,
    #[serde(deserialize_with = "de_validate_nonempty")]
    pub username: String
}

#[derive(Deserialize, Debug)]
pub struct NewGameCommand {
    #[serde(deserialize_with = "de_validate_nonempty")]
    pub username: String,
}

#[derive(Deserialize, Debug)]
pub struct KickCommand {
    pub player_id: usize
}

#[derive(Deserialize, Debug)]
pub struct RawTextPackage {
    pub text: String,
    pub source: game::WorkPackageSource
}


#[derive(Deserialize, Debug)]
pub struct RawImagePackage {
    #[serde(deserialize_with = "de_image_base64")]
    pub data: Vec<u8>,
    pub source: game::WorkPackageSource
}

#[derive(Serialize, Debug)]
pub struct PersonalDetailsResponse {
    my_id: usize,
    am_administrator: bool,
}

impl PersonalDetailsResponse {
    pub fn new(my_id: usize, player: &game::Player) -> Self {
        PersonalDetailsResponse {
            my_id,
            am_administrator: player.is_admin
        }
    }
}

pub fn parse(msg: &str) -> std::io::Result<Command> {
    let json: Map<String, Value> = serde_json::from_str(msg)?;
    trace!("Received JSON {:?}", json);

    let command = json.get("type").ok_or(
        std::io::Error::new(ErrorKind::Other, "Received command does not contain type")
    )?.as_str().ok_or(
        std::io::Error::new(ErrorKind::Other, "type is not a string")
    )?;

    let data = json.get("data").ok_or(
        std::io::Error::new(ErrorKind::Other, "Data doesn't exist in JSON")
    );

    let command = match command {
        "ping" => Command::Ping,
        "new_game" => Command::NewGame(NewGameCommand::deserialize(data?)?),
        "join_game" => Command::JoinGame(JoinCommand::deserialize(data?)?),
        "leave_game" => Command::LeaveGame,
        "start_game" => Command::StartGame,
        "kick_player" => Command::KickPlayer(KickCommand::deserialize(data?)?),
        "my_uuid" => Command::MyUuid(String::deserialize(data?)?),
        "text_package" => Command::TextPackage(RawTextPackage::deserialize(data?)?),
        "image_package" => {
            Command::ImagePackage(RawImagePackage::deserialize(data?)?)
        },
        "next_round" => Command::NextRound,
        "extend_deadline" => Command::ExtendDeadline(i32::deserialize(data?)?),
        "restart_game" => Command::RestartGame,
        _ => return Err(std::io::Error::new(ErrorKind::Other, "Unknown command type"))
    };

    // Debug but with long commands
    let parsed = format!("Parsed command: {:?}", command);
    let parsed = match parsed.char_indices().nth(200) {
        None => parsed.as_str(),
        Some((idx, _)) => &parsed[..idx],
    };
    debug!("{}", parsed);

    Ok(command)
}

pub fn encode(response: Response) -> serde_json::Result<String> {
    let (typename, data) = match response {
        Response::Error(e) => ("error", Some(json!(e))),
        Response::Pong => ("pong", None),
        Response::GameDetails(g) => ("game_details", Some(json!(g))),
        Response::PersonalDetails(r) => ("personal_details", Some(json!(r))),
        Response::YourUuid(s) => ("your_uuid", Some(json!(s))),
        Response::LeftGame => ("left_game", None),
        Response::PreviousTextPackage(p) => ("previous_text_package", Some(json!(p))),
        Response::PreviousImagePackage(p) => ("previous_image_package", Some(json!(p))),
        Response::AllWorkloads(w) => ("all_workloads", Some(json!(w))),
        Response::Rollcall => ("rollcall", None),
    };

    let json = json!({
        "type": typename,
        "data": data
    });

    serde_json::to_string(&json)
}

fn de_image_base64<'de, D>(d: D) -> std::result::Result<Vec<u8>, D::Error>
    where D: serde::de::Deserializer<'de>
{
    let base64_full = String::deserialize(d)?;
    let base64_image = base64_full.split(',').nth(1)
        .ok_or(serde::de::Error::custom("Invalid image data, does not contain type"))?;

    let result = base64::decode(base64_image)
        .map_err(|e| serde::de::Error::custom(
            "Invalid base64: ".to_string() + &e.to_string()))?;

    Ok(result)
}

fn de_validate_nonempty<'de, D>(d: D) -> std::result::Result<String, D::Error>
    where D: serde::de::Deserializer<'de>
{
    let value = String::deserialize(d)?;

    if value.is_empty() {
        return Err(serde::de::Error::custom(" Please give a non-empty username!"));
    }

    Ok(value)
}

pub fn de_validate_text_package<'de, D>(d: D) -> std::result::Result<String, D::Error>
    where D: serde::de::Deserializer<'de>
{
    let value = String::deserialize(d)?;

    if value.len() < 3 {
        return Err(serde::de::Error::invalid_length(value.len(),
                                                   &"a word longer than 2 characters"));
    } else if value.len() > 250 {
        return Err(serde::de::Error::invalid_length(value.len(),
                                               &"a smaller word"));
    }

    Ok(value)
}
