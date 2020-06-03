module Protocol exposing (..)

import Json.Decode exposing (..)
import Json.Encode as JE

-- BASIC DEFINITIONS

type SocketCommand
  = Ping
  | NewGameCommand String
  | JoinCommand String String
  | KickCommand Int
  | StartCommand
  | LeaveCommand
  | UuidCommand String

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
  , isAdmin: Bool
  }

type alias PersonalDetails =
  { myId: Int
  , amAdministrator: Bool
  }

-- JSON RESPONSE, COMMAND

type Response
  = ErrorResponse String
  | PongResponse
  | GameDetailsResponse GameDetails
  | PersonalDetailsResponse PersonalDetails
  | UuidResponse String
  | LeftGameResponse

-- JSON COMMAND ENCODERS
prepareSocketCommand : SocketCommand -> JE.Value
prepareSocketCommand command =
  case command of
    Ping ->
      prepareSocketCommandJson "ping" Nothing
    NewGameCommand username ->
      prepareSocketCommandJson "new_game" (Just (JE.object
        [ ( "username", JE.string username ) ]
      ))
    LeaveCommand ->
      prepareSocketCommandJson "leave_game" Nothing
    JoinCommand gameId username ->
      prepareSocketCommandJson "join_game" (Just (JE.object
        [ ( "game_id", JE.string gameId)
        , ( "username", JE.string username )
        ]
      ))
    StartCommand ->
      prepareSocketCommandJson "start_game" Nothing
    KickCommand playerId ->
      prepareSocketCommandJson "kick_player" (Just (JE.object
        [ ( "player_id", JE.int playerId ) ]
      ))
    UuidCommand uuid ->
      prepareSocketCommandJson "my_uuid" (Just (JE.string
        uuid
      ))


prepareSocketCommandJson : String -> Maybe JE.Value -> JE.Value
prepareSocketCommandJson commandType data =
  case data of
    Nothing ->
      JE.object [ ( "type", JE.string commandType ) ]
    Just d ->
      JE.object
        [ ( "type", JE.string commandType ),
        ( "data", d )
        ]


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
  map4 PlayerDetails
    (field "username" string)
    (field "image_url" string)
    (field "status" (map playerStatusFromString string))
    (field "is_admin" bool)

personalDetailsParser : (Decoder PersonalDetails, PersonalDetails -> Response)
personalDetailsParser =
  (
    map2 PersonalDetails
      (field "my_id" int)
      (field "am_administrator" bool)
    ,
    \v -> PersonalDetailsResponse v
  )

uuidParser : (Decoder String, String -> Response)
uuidParser =
  (string, \s -> UuidResponse s)

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
