use serde::{Deserialize, Serialize};
use serde_json::{Value, from_value, json};

use std::io::{ErrorKind};
use log::{trace, debug, info, warn, error};
use serde_json::Map;
use crate::game;
use std::any::Any;
use std::fmt;

pub(crate) type Result<T> = std::result::Result<T, Error>;

// Define protocol error type
#[derive(Debug, Clone)]
pub(crate) struct Error {
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
    StartGame(StartCommand),
    JoinGame(JoinCommand),
    LeaveGame,
    KickPlayer(KickCommand)
}

#[derive(Debug)]
pub enum Response<'a> {
    Error(String),
    Pong,
    GameDetails(&'a game::Game),
    PersonalDetails(PersonalDetailsResponse),
    YourUuid(String),
    LeftGame
}

#[derive(Deserialize, Debug)]
pub struct JoinCommand {
    pub game_id: String,
    #[serde(deserialize_with = "de_validate_nonempty")]
    pub username: String
}

#[derive(Deserialize, Debug)]
pub struct StartCommand {
    #[serde(deserialize_with = "de_validate_nonempty")]
    pub username: String,
}

#[derive(Deserialize, Debug)]
pub struct KickCommand {
    pub player_id: usize
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
        "start_game" => Command::StartGame(StartCommand::deserialize(data?)?),
        "join_game" => Command::JoinGame(JoinCommand::deserialize(data?)?),
        "leave_game" => Command::LeaveGame,
        "kick_player" => Command::KickPlayer(KickCommand::deserialize(data?)?),
        _ => return Err(std::io::Error::new(ErrorKind::Other, "Unknown command type"))
    };

    debug!("Parsed command: {:?}", command);

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
    };

    let json = json!({
        "type": typename,
        "data": data
    });

    serde_json::to_string(&json)
}

fn de_validate_nonempty<'de, D>(d: D) -> std::result::Result<String, D::Error>
    where D: serde::de::Deserializer<'de>
{
    let value = String::deserialize(d)?;

    if value.is_empty() {
        return Err(serde::de::Error::invalid_value(serde::de::Unexpected::Str(value.as_str()),
                                            &"a non-empty username"));
    }

    Ok(value)
}
