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
  | TextPackageCommand String
  | ImagePackageCommand String
  | NextRoundCommand

type PlayerStatus = Done | Working Float | Uploading Float | Stuck

type GameStatus = NoGame | Lobby | Starting | Drawing | Understanding | GameOver

-- JSON RESPONSE STRUCTURES

type alias GameDetails =
  { alias: String
  , status: GameStatus
  , players: List PlayerDetails
  , uuid: String
  , currentStage: Int
  }

type alias PlayerDetails =
  { username: String
  , imageUrl: String
  , status: PlayerStatus
  , isAdmin: Bool
  , deadline: Int
  , stuck: Bool
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
  | PreviousTextPackageResponse String
  | PreviousImagePackageResponse String

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
    TextPackageCommand text ->
      prepareSocketCommandJson "text_package" (Just (JE.object
        [ ( "text", JE.string text ) ]
      ))
    ImagePackageCommand image ->
      prepareSocketCommandJson "image_package" (Just (JE.object
        [ ( "data", JE.string image ) ]
      ))
    NextRoundCommand ->
      prepareSocketCommandJson "next_round" Nothing


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
    map5 GameDetails
      (field "alias" string)
      (field "game_status" (map gameStatusFromString string))
      (field "players" (list playerDecoder))
      (field "uuid" string)
      (field "current_stage" int)
    ,
    \v -> GameDetailsResponse v
  )

playerDecoder : Decoder PlayerDetails
playerDecoder =
  map6 PlayerDetails
    (field "username" string)
    (field "image_url" string)
    (field "status" (map playerStatusFromString string))
    (field "is_admin" bool)
    (field "deadline" int)
    (field "stuck" bool)

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

previousTextPackageParser : (Decoder String, String -> Response)
previousTextPackageParser =
  (
    field "text" string
    ,
    \v -> PreviousTextPackageResponse v
  )

previousImagePackageParser : (Decoder String, String -> Response)
previousImagePackageParser =
  (
    field "url" string
    ,
    \v -> PreviousImagePackageResponse v
  )

gameStatusFromString : String -> GameStatus
gameStatusFromString string =
  case string of
    "Lobby" -> Lobby
    "Starting" -> Starting
    "Drawing" -> Drawing
    "Understanding" -> Understanding
    "GameOver" -> GameOver
    _ -> Lobby

playerStatusFromString : String -> PlayerStatus
playerStatusFromString string =
  case string of
    "Done" -> Done
    "Working" -> Working 0
    "Uploading" -> Uploading 50
    _ -> Stuck
