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
import PortFunnels
import PortFunnel.WebSocket as WebSocket exposing (Response(..))
import PortFunnels exposing (FunnelDict, Handler(..), State)
import Protocol exposing (SocketCommand(..), PlayerStatus(..), GameStatus(..))
import Names

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
wsUrl = "ws://localhost:3030/ws"


-- PORTS

port errorPort : String -> Cmd msg

port cmdPort : JE.Value -> Cmd msg

port subPort : (JE.Value -> msg) -> Sub msg


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
    status : PlayerStatus
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
  , players : List Player
  , funnelState : PortFunnels.State
  , formFields : FormFields
  , error : Maybe String
  }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
  ( Model key url NoGame Nothing False Nothing [
    Player "kongr45gpen" "https://via.placeholder.com/150x300" (Working 225),
    Player "electrovesta" "https://via.placeholder.com/150x300" (Working 300),
    Player "marian" "https://via.placeholder.com/256" Done
  ] PortFunnels.initialState {
    gameId = "",
    username = "",
    usernamePlaceholder = ""
  } Nothing, Cmd.batch [
    Task.perform Tick Time.now,
    WebSocket.makeOpenWithKey wsKey wsUrl |> send,
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
            List.map (updatePlayerTime (posixTimeDifferenceSeconds newTime lastUpdate)) model.players }
      , if WebSocket.isConnected wsKey model.funnelState.websocket then
          sendSocketCommand Ping
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
      ({model | status = NoGame, gameId = Nothing, players = []}, sendSocketCommand LeaveCommand)

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
              res
      -- (model, Debug.log ("Receive " ++ JE.encode 0 value) Cmd.none)

    SocketReceive value ->
      case value of
        Protocol.GameDetailsResponse details ->
          let
            playerCreator : Protocol.PlayerDetails -> Player
            playerCreator player =
              {
                username = player.username,
                image = player.imageUrl,
                status = player.status
              }
            players = List.map playerCreator details.players
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
                _ ->
                  Protocol.ErrorResponse "Uknown response type received"

        in
          model |> update (SocketReceive (Debug.log "rcvMSG" received))

      WebSocket.ConnectedResponse r ->
          (model, Cmd.none)

      WebSocket.ClosedResponse { code, wasClean, expected } ->
          (model, Cmd.none)

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
  header [ class "game-header" ] ((case List.head model.players of
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
    ] ++ if List.isEmpty model.players
      then []
      else [ div [ class "player-list" ] (List.map (viewPlayer False) model.players) ]
    )
  ]

viewPlayer : Bool -> Player -> Html Msg
viewPlayer isMe player =
  div [ class ("player" ++ if isMe then " me" else "") ] [
    viewPlayerAvatar player,
    span [ class "username" ] [ text player.username ],
    span [] [ case player.status of
      Done ->
        (text "Done")
      Working timeLeft ->
        (text ("Working, " ++ String.fromInt (round timeLeft) ++ " s left"))
      Uploading fraction ->
        (text ("Uploading (" ++ String.fromFloat (fraction * 100) ++ "% done)"))
      Stuck ->
        (text "Hit a wall")
    ],
    a [ href "#" ] [ text "❌" ]
  ]

viewLanding : Model -> Html Msg
viewLanding model =
  section [ class "landing hall" ] [
    div [ class "landing-join" ] [
      label [] [ text "People usually call me:" ],
      input [ placeholder model.formFields.usernamePlaceholder, required True, onInput <| SetField UsernameField ] []
    ],
    button [ class "pure-button pure-button-primary landing-button", onClick StartGame ] [ text "Start a New Game" ],
    Html.form [ class "landing-join", onSubmit JoinGame ]  [
      button [ type_ "submit", class "pure-button pure-button-primary landing-button" ] [
        text "Join a running game"
      ],
      input [ placeholder "GameId", required True, onInput <| SetField GameIdField ] []
    ]
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
    button [ class "pure-button pure-button-danger landing-button", onClick LeaveGame ] [ text "Cancel Game" ]
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
