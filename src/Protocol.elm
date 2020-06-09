module Protocol exposing (..)

import Json.Decode exposing (..)
import Json.Encode as JE
import List
import Array

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
  | ExtendDeadlineCommand Int

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

type alias Workload = List WorkPackageDetails

type alias WorkPackageDetails =
  { playerId: Int
  , data: Maybe WorkPackage
  }

type WorkPackage
  = TextPackage String
  | ImagePackage String

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
  | AllWorkloadsResponse (Array.Array Workload)

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
    ExtendDeadlineCommand secs ->
      prepareSocketCommandJson "extend_deadline" (Just (JE.int
        secs
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

workloadsParser : (Decoder (Array.Array Workload), (Array.Array Workload) -> Response)
workloadsParser =
  (
    array workloadDecoder
    ,
    \v -> AllWorkloadsResponse v
  )

workloadDecoder : Decoder Workload
workloadDecoder =
  field "packages" (list workpackageDetailsDecoder)

workpackageDetailsDecoder : Decoder WorkPackageDetails
workpackageDetailsDecoder =
  map2 WorkPackageDetails
    (field "player_id" int)
    (field "data" (nullable workpackageDecoder))

workpackageDecoder : Decoder WorkPackage
workpackageDecoder =
  oneOf
    [ map TextPackage (field "text" string)
    , map ImagePackage (field "url" string)
    ]

-- HELPER FUNCTIONS
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
