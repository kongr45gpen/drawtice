use serde::{Deserialize, Serialize};
use serde_json::{Result, Value, from_value};

use std::io::{Error, ErrorKind};
use log::{trace, debug, info, warn, error};
use serde_json::Map;

#[derive(Debug)]
pub enum Command {
    Ping,
    StartGame,
    JoinGame(JoinCommand),
    LeaveGame,
}

#[derive(Deserialize, Debug)]
pub struct JoinCommand {
    game_id: String,
}

pub fn parse(msg: &str) -> std::io::Result<(Command)> {
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
        "start_game" => Command::StartGame,
        "join_game" => Command::JoinGame(JoinCommand::deserialize(data?)?),
        "leave_game" => Command::LeaveGame,
        _ => return Err(std::io::Error::new(ErrorKind::Other, "Unknown command type"))
    };

    debug!("Parsed command: {:?}", command);

    Ok((command))
}
