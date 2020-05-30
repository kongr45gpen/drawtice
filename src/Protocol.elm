module Protocol exposing (..)

import Json.Decode exposing (..)

-- BASIC DEFINITIONS

type SocketCommand = Ping | StartCommand | JoinCommand String | LeaveCommand

type PlayerStatus = Done | Working Float | Uploading Float | Stuck

type GameStatus = NoGame | Lobby | Drawing | Understanding | GameOver

-- JSON RESPONSE STRUCTURES

type alias GameDetails =
  { alias: String
  , status: GameStatus
  }

type alias PlayerDetails =
  {

  }

-- JSON RESPONSE, COMMAND

type Response
  = ErrorResponse String
  | PongResponse
  | GameDetailsResponse GameDetails (List PlayerDetails)


-- JSON RESPONSE PARSERS
errorParser : (Decoder String, String -> Response)
errorParser =
  (string, \s -> ErrorResponse s)

gameDetailsParser : (Decoder GameDetails, GameDetails -> Response)
gameDetailsParser =
  (
    map2 GameDetails
      (field "alias" string)
      (field "game_status" (map gameStatusFromString string))
    ,
    \v -> GameDetailsResponse v []
  )

gameStatusFromString : String -> GameStatus
gameStatusFromString string =
  case string of
    "lobby" -> Lobby
    "drawing" -> Drawing
    "understanding" -> Understanding
    "game_over" -> GameOver
    _ -> Lobby
