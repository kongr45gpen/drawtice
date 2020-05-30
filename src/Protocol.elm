module Protocol exposing (..)

import Json.Decode exposing (..)

-- BASIC DEFINITIONS

type SocketCommand
  = Ping
  | StartCommand String
  | JoinCommand String String
  | LeaveCommand

type PlayerStatus = Done | Working Float | Uploading Float | Stuck

type GameStatus = NoGame | Lobby | Drawing | Understanding | GameOver

-- JSON RESPONSE STRUCTURES

type alias GameDetails =
  { alias: String
  , status: GameStatus
  , players: List PlayerDetails
  }

type alias PlayerDetails =
  { username: String
  , imageUrl: String
  , status: PlayerStatus
  }

-- JSON RESPONSE, COMMAND

type Response
  = ErrorResponse String
  | PongResponse
  | GameDetailsResponse GameDetails


-- JSON RESPONSE PARSERS
errorParser : (Decoder String, String -> Response)
errorParser =
  (string, \s -> ErrorResponse s)

gameDetailsParser : (Decoder GameDetails, GameDetails -> Response)
gameDetailsParser =
  (
    map3 GameDetails
      (field "alias" string)
      (field "game_status" (map gameStatusFromString string))
      (field "players" (list playerDecoder))
    ,
    \v -> GameDetailsResponse v
  )

playerDecoder : Decoder PlayerDetails
playerDecoder =
  map3 PlayerDetails
    (field "username" string)
    (field "image_url" string)
    (field "status" (map playerStatusFromString string))

gameStatusFromString : String -> GameStatus
gameStatusFromString string =
  case string of
    "Lobby" -> Lobby
    "Drawing" -> Drawing
    "Understanding" -> Understanding
    "GameOver" -> GameOver
    _ -> Lobby

playerStatusFromString : String -> PlayerStatus
playerStatusFromString string =
  case string of
    "Stuck" -> Stuck
    "Done" -> Done
    "Working" -> Working 0.5
    "Uploading" -> Uploading 50
    _ -> Stuck
