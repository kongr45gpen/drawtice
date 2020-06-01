port module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onSubmit, onInput)
import Json.Encode as JE
import Json.Decode as JD
import Url
import Debug
import Time
import Task
import Random
import Array
import PortFunnels
import PortFunnel.WebSocket as WebSocket exposing (Response(..))
import PortFunnels exposing (FunnelDict, Handler(..), State)
import Protocol exposing (SocketCommand(..), PlayerStatus(..), GameStatus(..))
import Names
import Cmd.Extra

-- MAIN


main : Program () Model Msg
main =
  Browser.application
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    , onUrlChange = UrlChanged
    , onUrlRequest = LinkClicked
    }


-- CONSTANTS
wsKey : String
wsKey = "mainws"
wsUrl : String
wsUrl = "ws://192.168.1.11:3030/ws"


-- PORTS

port errorPort : String -> Cmd msg

cmdPort : JE.Value -> Cmd Msg
cmdPort =
    PortFunnels.getCmdPort Receive "" False


handlers : List (Handler Model Msg)
handlers =
    [ WebSocketHandler socketHandler
    ]


funnelDict : FunnelDict Model Msg
funnelDict =
    PortFunnels.makeFunnelDict handlers (\_ _ -> cmdPort)


-- MODEL

type FormField = GameIdField | UsernameField | UsernamePlaceholder

type alias Player =
  {
    username : String,
    image : String,
    status : PlayerStatus,
    isMe : Bool,
    isAdministrator: Bool
  }

type alias FormFields =
  {
    gameId : String,
    username : String,
    usernamePlaceholder : String
  }

type alias Model =
  { key : Nav.Key
  , url : Url.Url
  , status : GameStatus
  , gameId : Maybe String
  , amAdministrator : Bool
  , lastUpdate : Maybe Time.Posix
  , players : Array.Array Player
  , myId : Maybe Int
  , uuid : Maybe String
  , funnelState : PortFunnels.State
  , formFields : FormFields
  , error : Maybe String
  }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
  ( Model key url NoGame Nothing False Nothing Array.empty Nothing Nothing PortFunnels.initialState {
    gameId = "",
    username = "",
    usernamePlaceholder = ""
  } Nothing, Cmd.batch [
    Task.perform Tick Time.now,
    Random.generate (SetField UsernamePlaceholder) Names.generator
  ]
  )


reportError : String -> Model -> Model
reportError err model =
  case model.error of
    Nothing ->
      { model | error = Just err }
    Just _ ->
      model

-- UPDATE


type Msg
  = LinkClicked Browser.UrlRequest
  | UrlChanged Url.Url
  | Tick Time.Posix
  | NoAction
  | StartGame
  | JoinGame
  | LeaveGame
  | KickPlayer Int
  | SetField FormField String
  | Send JE.Value
  | Receive JE.Value
  | SocketReceive Protocol.Response
  | ShowError String
  | RemoveError


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    LinkClicked urlRequest ->
      case urlRequest of
        Browser.Internal url ->
          ( model, Nav.pushUrl model.key (Url.toString url) )

        Browser.External href ->
          ( model, Nav.load href )

    UrlChanged url ->
      ( { model | url = url }
      , Cmd.none
      )

    Tick newTime ->
      ( { model | lastUpdate = Just newTime, players =
        case model.lastUpdate of
          Nothing ->
            model.players

          Just lastUpdate ->
            Array.map (updatePlayerTime (posixTimeDifferenceSeconds newTime lastUpdate)) model.players }
      , if WebSocket.isConnected wsKey model.funnelState.websocket then
          Cmd.none
        else
          Cmd.none
      )

    NoAction ->
      (model, Cmd.none)

    StartGame ->
      (model, sendSocketCommand (StartCommand model.formFields.username))

    JoinGame ->
      (model, sendSocketCommand (JoinCommand model.formFields.gameId model.formFields.username))

    LeaveGame ->
      (leaveGame model, sendSocketCommand LeaveCommand)

    KickPlayer value ->
      (model, sendSocketCommand (KickCommand value))

    SetField field value ->
      ( setField model field value, Cmd.none )

    Send value ->
      (model, Debug.log ("Send " ++ JE.encode 0 value) (cmdPort value))

    Receive value ->
      case
          PortFunnels.processValue funnelDict value model.funnelState model
      of
          Err error ->
              (model, errorLog error)

          Ok res ->
              case JD.decodeValue (JD.field "tag" JD.string) value of
                -- When the PortFunnels have all started, we can initiate connection with WebSocket
                Ok("startup") ->
                  res |> Cmd.Extra.addCmd (WebSocket.makeOpenWithKey wsKey wsUrl |> send)
                _ ->
                  res

    SocketReceive value ->
      case value of
        Protocol.GameDetailsResponse details ->
          let
            playerCreator : Int -> Protocol.PlayerDetails -> Player
            playerCreator id player =
              {
                username = player.username,
                image = player.imageUrl,
                status = player.status,
                isMe = model.myId |> Maybe.map (\i -> i == id) |> Maybe.withDefault False,
                isAdministrator = player.isAdmin
              }
            players = Array.indexedMap playerCreator (Array.fromList details.players)
          in
            ({ model
              | gameId = Just details.alias
              , status = details.status
              , players = players }
            , Cmd.none)
        Protocol.ErrorResponse error ->
          (model, errorLog error)
        Protocol.PongResponse ->
          (model, Cmd.none)
        Protocol.PersonalDetailsResponse details ->
          ({ model
          | myId = Just details.myId
          , amAdministrator = details.amAdministrator
          , players = Array.indexedMap (\i -> \p -> { p | isMe = i == details.myId}) model.players
          }, Cmd.none)
        Protocol.UuidResponse uuid ->
          ({model | uuid = Just uuid}, Cmd.none)
        Protocol.LeftGameResponse ->
          (leaveGame model, Cmd.none)


    ShowError value ->
      ({ model | error = Just value}, Cmd.none)

    RemoveError ->
      ({ model | error = Nothing }, Cmd.none)

setField : Model -> FormField -> String -> Model
setField model field value =
  case field of
    GameIdField ->
      let
        oldForm = model.formFields
        newForm = { oldForm | gameId = value}
      in
        { model | formFields = newForm }
    UsernameField ->
      let
        oldForm = model.formFields
        newForm = { oldForm | username = value, usernamePlaceholder = value}
      in
        { model | formFields = newForm }
    UsernamePlaceholder ->
      let
        oldForm = model.formFields
        newForm = { oldForm | usernamePlaceholder = value}
      in
        { model | formFields = newForm }

posixTimeDifferenceSeconds : Time.Posix -> Time.Posix -> Float
posixTimeDifferenceSeconds a b =
  toFloat (Time.posixToMillis a - Time.posixToMillis b) / 1000

updatePlayerTime : Float -> Player -> Player
updatePlayerTime timeDifference player =
  case player.status of
    Working timeLeft ->
      { player | status = Working (timeLeft - timeDifference) }
    _ ->
      player

leaveGame : Model -> Model
leaveGame model =
  {model | status = NoGame, gameId = Nothing, players = Array.empty, myId = Nothing}

errorLog : String -> Cmd Msg
errorLog message =
    Cmd.batch [
      errorPort message,
      Task.perform ShowError (Task.succeed message)
    ]

send : WebSocket.Message -> Cmd Msg
send message =
    WebSocket.send cmdPort message

socketHandler : Response -> State -> Model -> ( Model, Cmd Msg )
socketHandler response state mdl =
  let
      model = { mdl | funnelState = state }
  in
  case response of
      WebSocket.MessageReceivedResponse { message } ->
        let
          typeDecoder = JD.field "type" JD.string
          decodeData decoder = JD.decodeString (JD.field "data" decoder) message
          decodeDataUsingParser parser = case decodeData (Tuple.first parser) of
            Err e ->
              Protocol.ErrorResponse (JD.errorToString e)
            Ok v ->
              Tuple.second parser v
          typeString = JD.decodeString typeDecoder message
          received = case typeString of
            Err e ->
              Protocol.ErrorResponse (JD.errorToString e)
            Ok s ->
              case s of
                "pong" ->
                  Protocol.ErrorResponse "ping"
                "error" ->
                  decodeDataUsingParser Protocol.errorParser
                "game_details" ->
                  decodeDataUsingParser Protocol.gameDetailsParser
                "personal_details" ->
                  decodeDataUsingParser Protocol.personalDetailsParser
                "your_uuid" ->
                  decodeDataUsingParser Protocol.uuidParser
                "left_game" ->
                  Protocol.LeftGameResponse
                _ ->
                  Protocol.ErrorResponse "Uknown response type received"
        in
          model |> update (SocketReceive (Debug.log "rcvMSG" received))

      WebSocket.ConnectedResponse r ->
          (model, Cmd.none)

      WebSocket.ClosedResponse { code, wasClean, expected } ->
          (model, errorLog "Websocket connection closed" )

      WebSocket.ErrorResponse error ->
          (model, errorLog (WebSocket.errorToString error))

      _ ->
          case WebSocket.reconnectedResponses response of
              [] ->
                  (model, Cmd.none)

              [ ReconnectedResponse r ] ->
                  (model, Cmd.none)

              list ->
                (model, Cmd.none)

sendSocketCommand : SocketCommand -> Cmd Msg
sendSocketCommand command =
  command |> prepareSocketCommand |> JE.encode 0 |> WebSocket.makeSend wsKey |> send

prepareSocketCommand : SocketCommand -> JE.Value
prepareSocketCommand command =
  case command of
    Ping ->
      prepareSocketCommandJson "ping" Nothing
    StartCommand username ->
      prepareSocketCommandJson "start_game" (Just (JE.object
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
    KickCommand playerId ->
      prepareSocketCommandJson "kick_player" (Just (JE.object
        [ ( "player_id", JE.int playerId ) ]
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


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch [
    Time.every 1000 Tick,
    PortFunnels.subscriptions Receive model
  ]



-- VIEW


view : Model -> Browser.Document Msg
view model =
  { title = "Drawtice"
  , body =
      [
        viewNav model,
        viewHeader model,
        div [ class "page-container" ] [
          viewSidebar model,
          main_ [ class "page" ] [
            case model.status of
              NoGame ->
                viewLanding model
              Lobby ->
                viewLobby model
              _ ->
                text "nothing"
          ]
        ]
      ]
  }

viewNav : Model -> Html Msg
viewNav model =
  nav [ class "page-header pure-menu pure-menu-horizontal" ] [
    span [ class "pure-menu-heading" ] [ text "Drawtice" ],
    ul [ class "pure-menu-list" ] ([
      li [ class ("pure-menu-item" ++ if not (hasGameStarted model) then " pure-menu-selected" else "") ] [ span [ class "pure-menu-link" ] [ text "New Game" ] ],
      li [ class ("pure-menu-item" ++ if hasGameStarted model then " pure-menu-selected" else "") ] [ span [ class "pure-menu-link" ] [ text "Current Game" ] ]
    ] ++ (case model.gameId of
      Nothing -> []
      Just id ->
        [
          li [ class "pure-menu-item" ] [ span [ class "pure-menu-link" ] [ text "Share this link to invite other people to join:" ] ],
          let url = id |> getGameLink |> Url.toString
          in
            li [ class "pure-menu-item pure-menu-selected" ] [ a [ class "pure-menu-link", href url, onClick NoAction ] [ text url ] ]
        ])
    ++ case model.error of
      Nothing -> []
      Just err ->
        [
          li [ class "pure-menu-item" ] [
            a [ class "pure-menu-link", onClick RemoveError, href "#", title "Hide error" ] [ text "❌" ]
          ],
          li [ class "pure-menu-item" ] [ span [ class "pure-menu-heading" ] [ text "Error:" ] ],
          li [ class "pure-menu-item" ] [ span [ class "pure-menu-link pure-menu-error" ] [ text err ] ]
        ]
    ),
    ul [ class "pure-menu-list page-header-fin" ] [
      li [ class "pure-menu-item" ] [ a [ class "pure-menu-link", href "https://github.com/kongr45gpen/drawtice/", target "_blank", rel "noopener noreferrer" ] [ text "Github" ] ]
    ]
  ]

viewHeader : Model -> Html Msg
viewHeader model =
  header [ class "game-header" ] ((case model.myId |> Maybe.andThen (\i -> Array.get i model.players) of
      Nothing ->
        []
      Just me ->
        [
          div [ class "game-header-me" ] [
            viewPlayerAvatar me,
            span [ class "my-username" ] [ text me.username ]
          ]
          ,div [ class "my-status" ] [
            case me.status of
              Done ->
                span [ class "status" ] [ text "Ready" ]
              Working timeLeft ->
                span [ class "big-scary-clock" ] [ text (formatTimeDifference (floor (Debug.log "timeLeft" timeLeft))) ]
              Uploading percentage ->
                span [ class "status" ] [ text (String.fromInt (floor (percentage * 100)) ++ "%") ]
              Stuck ->
                span [ class "status" ] [ text "Stuck" ]
          ]
        ]
    )
    ++ [
      div [ class "game-status" ] [ text (case model.status of
          NoGame -> "Ready"
          Lobby -> "Waiting for Players…"
          Drawing -> "Drawing…"
          Understanding -> "Understanding…"
          GameOver -> "Game Over"
        )
      ]
    ]
  )

viewSidebar : Model -> Html Msg
viewSidebar model =
  aside [ class "sidebar" ] [
    div [ class "gameId" ] ([
      text "Game ID: ",
      case model.gameId of
        Nothing ->
          em [ class "text-muted" ] [ text "Not Started" ]
        Just id ->
          text id
    ] ++ if Array.isEmpty model.players
      then []
      else [ div [ class "player-list" ] (Array.indexedMap (viewPlayer model) model.players |> Array.toList) ]
    )
  ]

viewPlayer : Model -> Int -> Player -> Html Msg
viewPlayer model id player =
  div [ class ("player" ++ if player.isMe then " me" else "") ] [
    viewPlayerAvatar player,
    span [ class "username" ] [ text player.username ],
    span [] ( (case player.status of
      Done ->
        (text "Done")
      Working timeLeft ->
        (text ("Working, " ++ String.fromInt (round timeLeft) ++ " s left"))
      Uploading fraction ->
        (text ("Uploading (" ++ String.fromFloat (fraction * 100) ++ "% done)"))
      Stuck ->
        (text "Hit a wall")
    ) :: (if model.amAdministrator then
      [ a [ href "#", onClick (KickPlayer id) ] [ text "❌" ] ]
      else []
    ))
  ]

viewLanding : Model -> Html Msg
viewLanding model =
  section [ class "landing hall" ] [
    div [ class "landing-join" ] [
      label [] [ text "People usually call me:" ],
      input [
        placeholder model.formFields.usernamePlaceholder,
        required True,
        onInput <| SetField UsernameField,
        autocomplete True
      ] []
    ],
    Html.form [ class "landing-join", onSubmit JoinGame ]  [
      button [ type_ "submit", class "pure-button pure-button-primary landing-button" ] [
        text "Join a running game"
      ],
      input [ placeholder "GameId", required True, onInput <| SetField GameIdField ] []
    ],
    button [ class "pure-button pure-button-primary landing-button", onClick StartGame ] [ text "Start a New Game" ]
  ]

viewLobby : Model -> Html Msg
viewLobby model =
  section [ class "lobby hall" ] [
    div [ class "game-link-presentation" ] [
      div [ class "text-muted" ] [ text "Share the following link to let other people join:" ],
      let
        url = getGameLink (Maybe.withDefault "???" model.gameId)
      in
        a [ class "game-link-large text-tt", href (Url.toString url), target "_blank", rel "noopener noreferrer" ] [
          span [ class "game-link-protocol" ] [ text (
            case url.protocol of
            Url.Http -> "http://"
            Url.Https -> "https://"
          ) ],
          span [ class "game-link-host" ] [ text url.host ],
          span [ class "game-link-path" ] [ text url.path ]
        ]
    ],
    if model.amAdministrator then
      button [ class "pure-button pure-button-danger landing-button", onClick LeaveGame ] [ text "Cancel Game" ]
    else
      button [ class "pure-button pure-button-danger landing-button", onClick LeaveGame ] [ text "Leave Game" ]
  ]

viewPlayerAvatar : Player -> Html msg
viewPlayerAvatar player =
  img [ class "avatar", alt (player.username ++ " Avatar"), src player.image ] []

formatTimeDifference : Int -> String
formatTimeDifference seconds =
  (if seconds < 0 then "-" else "")
  ++ String.padLeft 2 '0' (String.fromInt (seconds // 60 |> abs))
  ++ ":"
  ++ String.padLeft 2 '0' (String.fromInt (remainderBy 60 seconds |> abs))

getGameLink : String -> Url.Url
getGameLink gameId =
  ("https://game.dev/" ++ gameId) |> Url.fromString |> Maybe.withDefault (Url.Url Url.Https "" Nothing "" Nothing Nothing)

hasGameStarted : Model -> Bool
hasGameStarted model =
  case model.gameId of
    Nothing -> False
    Just _ -> True
