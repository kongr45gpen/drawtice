port module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onSubmit, onInput)
import Json.Encode as JE
import Json.Decode as JD
import Url
import Dict exposing (Dict)
import Debug
import Time
import Task
import Random
import Array
import PortFunnel.WebSocket as WebSocket exposing (Response(..))
import PortFunnel.LocalStorage as LocalStorage
import PortFunnels exposing (FunnelDict, Handler(..), State)
import Protocol exposing (SocketCommand(..), PlayerStatus(..), GameStatus(..), WorkPackage(..), Workload, WorkPackageDetails, PackageSource(..))
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
wsUrl = "ws://localhost:3030/ws"
imageUrl : String
imageUrl = "http://localhost:3030/images/"

-- PORTS

port errorPort : String -> Cmd msg

port confirmPort : (String, Int) -> Cmd msg

port confirmReturnPort : ((Bool, Int) -> msg) -> Sub msg

port canvasPort : (String, Maybe String) -> Cmd msg

port canvasReturnPort : ((String, String) -> msg) -> Sub msg

cmdPort : JE.Value -> Cmd Msg
cmdPort =
    PortFunnels.getCmdPort Receive "" False


handlers : List (Handler Model Msg)
handlers =
    [ WebSocketHandler socketHandler
    , LocalStorageHandler storageHandler
    ]


funnelDict : FunnelDict Model Msg
funnelDict =
    PortFunnels.makeFunnelDict handlers (\_ _ -> cmdPort)


-- MODEL

type FormField
  = GameIdField
  | UsernameField
  | UsernamePlaceholder
  | TextField

type Direction
  = Forward
  | Backward

type alias Player =
  {
    username : String,
    image : String,
    status : PlayerStatus,
    isMe : Bool,
    isAdministrator: Bool,
    deadline : Maybe Time.Posix
  }

type alias FormFields =
  {
    gameId : String,
    username : String,
    usernamePlaceholder : String,
    text : String
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
  , previousPackage : Maybe WorkPackage
  , workloads : Maybe (Array.Array Workload)
  , currentWorkload : Int
  , showingGameoverSelf : Bool
  , gameKey : Maybe String
  , funnelState : PortFunnels.State
  , formFields : FormFields
  , pendingDialogs : Dict Int Msg
  , nextDialogId : Int
  , error : Maybe String
  }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
  let
    formFields : FormFields
    formFields = {
      gameId = case getURLGameId url of
        Just f -> f
        Nothing -> ""
      ,
      username = "",
      usernamePlaceholder = "",
      text = ""
      }

    model = Model
      key url NoGame Nothing False Nothing
      Array.empty Nothing Nothing Nothing Nothing 0 True Nothing
      (PortFunnels.initialState "drawtice") formFields Dict.empty 0 Nothing
  in
    ( model, Cmd.batch [
      Task.perform Tick Time.now,
      Random.generate (SetField UsernamePlaceholder) Names.generator,
      getLocalStorageString model "username"
    ]
    )



-- UPDATE


type Msg
  = LinkClicked Browser.UrlRequest
  | UrlChanged Url.Url
  | Tick Time.Posix
  | NoAction
  | NewGame
  | JoinGame
  | StartGame
  | LeaveGame
  | KickPlayer Int
  | NextRound
  | ExtendDeadline Float
  | SubmitText PackageSource
  | SubmitImage PackageSource
  | SetField FormField String
  | MoveWorkload Direction
  | RestartGame
  | Send JE.Value
  | Receive JE.Value
  | SocketReceive Protocol.Response
  | StorageReceive String (Maybe String)
  | ShowError String
  | RemoveError
  | ShowConfirmDialog String Msg
  | ShownConfirmDialog (Bool, Int)
  | SendImage String PackageSource
  | ShowLightbox String
  | CloseSelfSummary


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
      let
        mdl = case getURLGameId url of
          Just f ->
            model |> setField GameIdField f
          Nothing ->
            model
      in
        ( { mdl | url = url }, Cmd.none )

    Tick newTime ->
      ( { model | lastUpdate = Just newTime, players =
        case model.lastUpdate of
          Nothing ->
            model.players

          Just lastUpdate ->
            Array.map (updatePlayerTime newTime) model.players
      }
      , if WebSocket.isConnected wsKey model.funnelState.websocket then
          Cmd.none
        else
          Cmd.none
      )

    NoAction ->
      (model, Cmd.none)

    NewGame ->
      (model, Cmd.batch [
        sendSocketCommand (NewGameCommand model.formFields.username),
        putLocalStorageString model "username" model.formFields.username
      ])

    JoinGame ->
      (model, Cmd.batch [
        sendSocketCommand (JoinCommand model.formFields.gameId model.formFields.username),
        putLocalStorageString model "username" model.formFields.username
      ])

    StartGame ->
      (model, sendSocketCommand StartCommand)

    LeaveGame ->
      leaveGame model |> Cmd.Extra.addCmd (sendSocketCommand LeaveCommand)

    SubmitText source ->
      (model, sendSocketCommand <| TextPackageCommand model.formFields.text source )

    SubmitImage source ->
      (model, canvasPort ("snap", Just <| Protocol.packageSourceToString source))

    KickPlayer value ->
      (model, sendSocketCommand <| KickCommand value)

    NextRound ->
      (model, sendSocketCommand <| NextRoundCommand)

    ExtendDeadline value ->
      let
        secs = round (value * 60)
      in
        (model, sendSocketCommand <| ExtendDeadlineCommand secs)

    SetField field value ->
      ( setField field value model, Cmd.none )

    RestartGame ->
      (model, sendSocketCommand <| RestartGameCommand)

    MoveWorkload dir ->
      let
        workload = case dir of
          Forward ->
            model.currentWorkload + 1
          Backward ->
            model.currentWorkload - 1
        workload2 = if workload < 0 then 0 else workload
        maxWorkload = Array.length (model.workloads |> Maybe.withDefault Array.empty) - 1
        workload3 = if workload2 > maxWorkload then maxWorkload else workload2
      in
        ({ model | currentWorkload = workload3}, Cmd.none)

    Send value ->
      (model, cmdPort value)

    Receive value ->
      case
          PortFunnels.processValue funnelDict value model.funnelState model
      of
          Err error ->
              (model, errorLog error)

          Ok res ->
            let
              modul = JD.decodeValue (JD.field "module" JD.string) value |> Result.withDefault "none"
            in
              if modul == "WebSocket" then
                case JD.decodeValue (JD.field "tag" JD.string) value of
                  -- When the PortFunnels have all started, we can initiate connection with WebSocket
                  Ok("startup") ->
                    res
                      |> Cmd.Extra.addCmd (WebSocket.makeOpenWithKey wsKey wsUrl |> sendWebSocket)
                  _ ->
                    res
              else
                res

    StorageReceive key value ->
      case key of
        "username" ->
          (model |> setField UsernameField (value |> Maybe.withDefault ""), Cmd.none)
        "uuid" ->
          case value of
            Just uuid ->
              ({ model | uuid = Just uuid}, sendSocketCommand <| UuidCommand uuid)
            Nothing ->
              (model, Cmd.none)
        _ ->
          (model, Cmd.none)

    SocketReceive value ->
      case value of
        Protocol.GameDetailsResponse details ->
          let
            playerCreator : Int -> Protocol.PlayerDetails -> Player
            playerCreator id player =
              {
                username = player.username,
                image = player.imageUrl,
                status = if player.stuck then Stuck else player.status,
                isMe = model.myId |> Maybe.map (\i -> i == id) |> Maybe.withDefault False,
                isAdministrator = player.isAdmin,
                deadline = if player.deadline == 0 then Nothing else Just <| Time.millisToPosix (player.deadline * 1000)
              }
            players = Array.indexedMap playerCreator (Array.fromList details.players)
            me = model.myId |> Maybe.andThen (\id -> Array.get id players)
            username = Maybe.map (\p -> p.username) me
            showingGameoverSelf = model.showingGameoverSelf || (details.status == GameOver && model.status /= GameOver)
            mdl = { model
              | gameId = Just details.alias
              , gameKey = Just <| details.uuid ++ "-" ++ String.fromInt details.currentStage
              , status = details.status
              , players = players
              , showingGameoverSelf = showingGameoverSelf } |> maybeSetField UsernameField username
          in
            ( mdl,
                Cmd.batch
                [ me |> Maybe.map (\p -> putLocalStorageString mdl "username" p.username) |> Maybe.withDefault Cmd.none
                , if mdl.url == getGameLink mdl then
                    Cmd.none
                  else
                    Nav.pushUrl mdl.key (getGameLink mdl |> Url.toString)
                ]
            )
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
          ({model | uuid = Just uuid}, putLocalStorageString model "uuid" uuid)
        Protocol.LeftGameResponse ->
          leaveGame model
        Protocol.PreviousTextPackageResponse text ->
          ({model | previousPackage = Just <| TextPackage text}, Cmd.none)
        Protocol.PreviousImagePackageResponse path ->
          ({model | previousPackage = Just <| ImagePackage (imageUrl ++ path)}, Cmd.none)
        Protocol.AllWorkloadsResponse workloads ->
          let
            correctURL data = case data of
              Just (ImagePackage url) ->
                Just <| ImagePackage (imageUrl ++ url)
              _ ->
                data
            correctionInner workpackage = { workpackage | data = correctURL workpackage.data }
            correctionOuter workload = List.map correctionInner workload
            correctURLs workloads_ = Array.map correctionOuter workloads_
          in
            ({model | workloads = Just <| correctURLs workloads}, Cmd.none)


    ShowError value ->
      ({ model | error = Just value}, Cmd.none)

    RemoveError ->
      ({ model | error = Nothing }, Cmd.none)

    ShowConfirmDialog message newMsg ->
      let
        nextDialogId = model.nextDialogId
        dict = model.pendingDialogs |> Dict.insert nextDialogId newMsg
      in
        (
          { model | pendingDialogs = dict, nextDialogId = nextDialogId + 1 },
          confirmPort (message, nextDialogId)
        )

    ShownConfirmDialog (pressed, dialogId) ->
      let
        dict = model.pendingDialogs |> Dict.remove dialogId
        newMsg = model.pendingDialogs |> Dict.get dialogId
        mdl = { model | pendingDialogs = dict }
      in
        if pressed then
          case newMsg of
            Just m ->
              update m mdl
            Nothing ->
              (mdl, Cmd.none)
        else
          (mdl, Cmd.none)

    SendImage value source ->
      (model, sendSocketCommand <| ImagePackageCommand value source)

    ShowLightbox value ->
      (model, canvasPort ("lightbox", Just value))

    CloseSelfSummary ->
      ({ model | showingGameoverSelf = False}, Cmd.none)

maybeSetField : FormField -> Maybe String -> (Model -> Model)
maybeSetField field value =
  case value of
    Just v ->
      setField field v
    Nothing ->
      identity

setField : FormField -> String -> Model -> Model
setField field value model =
  let
    oldForm = model.formFields
    newForm = case field of
      GameIdField ->
        { oldForm | gameId = value }
      UsernameField ->
        { oldForm | username = value }
      UsernamePlaceholder ->
        { oldForm | usernamePlaceholder = value }
      TextField ->
        { oldForm | text = value }
  in
    { model | formFields = newForm }


posixTimeDifferenceSeconds : Time.Posix -> Time.Posix -> Float
posixTimeDifferenceSeconds a b =
  toFloat (Time.posixToMillis a - Time.posixToMillis b) / 1000

updatePlayerTime : Time.Posix -> Player -> Player
updatePlayerTime currentTime player =
  case player.status of
    Working timeLeft ->
      { player | status = player.deadline
                        |> Maybe.map (\d -> posixTimeDifferenceSeconds d currentTime)
                        |> Maybe.withDefault 0
                        |> Working
      }
    _ ->
      player

leaveGame : Model -> (Model, Cmd Msg)
leaveGame model =
  let
    url0 = model.url
    url = { url0 | fragment = Nothing }
  in
    ({model | status = NoGame
          , gameId = Nothing
          , gameKey = Nothing
          , players = Array.empty
          , myId = Nothing
          , previousPackage = Nothing
          , workloads = Nothing
          , currentWorkload = 0
          , showingGameoverSelf = False
          , url = url
    }, Nav.pushUrl model.key (Url.toString url))

getMe : Model -> Maybe Player
getMe model =
  model.myId |> Maybe.andThen (\i -> Array.get i model.players)

amDone : Model -> Bool
amDone model =
  case getMe model of
    Just me ->
      isGameRunning model && me.status == Done
    Nothing ->
      False

isGameRunning : Model -> Bool
isGameRunning model =
  case model.status of
    NoGame -> False
    Lobby -> False
    GameOver -> False
    Starting -> True
    Drawing -> True
    Understanding -> True

errorLog : String -> Cmd Msg
errorLog message =
    Cmd.batch [
      errorPort message,
      Task.perform ShowError (Task.succeed message)
    ]

sendWebSocket : WebSocket.Message -> Cmd Msg
sendWebSocket message =
    WebSocket.send cmdPort message

sendLocalStorage : Model -> LocalStorage.Message -> Cmd Msg
sendLocalStorage model message =
    LocalStorage.send cmdPort message model.funnelState.storage

storageHandler : LocalStorage.Response -> PortFunnels.State -> Model -> ( Model, Cmd Msg )
storageHandler response state mdl =
  let
    model = { mdl | funnelState = state }
  in
  case response of
    LocalStorage.GetResponse { label, key, value } ->
      let
        string =
          case value of
            Nothing -> Nothing
            Just v -> Result.toMaybe <| JD.decodeValue JD.string v
      in
        update (StorageReceive key string) model
    _ -> (model, Cmd.none)

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
              "previous_text_package" ->
                decodeDataUsingParser Protocol.previousTextPackageParser
              "previous_image_package" ->
                decodeDataUsingParser Protocol.previousImagePackageParser
              "all_workloads" ->
                decodeDataUsingParser Protocol.workloadsParser
              _ ->
                Protocol.ErrorResponse "Unknown response type received"
      in
        model |> update (SocketReceive received)
        -- model |> update (SocketReceive (Debug.log "rcvMSG" received))

    WebSocket.ConnectedResponse _ ->
        (model, getLocalStorageString model "uuid")

    WebSocket.ClosedResponse { code } ->
        (model, errorLog ("Websocket connection closed: " ++ WebSocket.closedCodeToString code) )

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
  command |> Protocol.prepareSocketCommand |> JE.encode 0 |> WebSocket.makeSend wsKey |> sendWebSocket

getLocalStorageString : Model -> String -> Cmd Msg
getLocalStorageString model key =
  LocalStorage.get key |> sendLocalStorage model

putLocalStorageString : Model -> String -> String -> Cmd Msg
putLocalStorageString model key value =
  LocalStorage.put key (Just <| JE.string value) |> sendLocalStorage model

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch [
    Time.every 1000 Tick,
    PortFunnels.subscriptions Receive model,
    confirmReturnPort ShownConfirmDialog,
    canvasReturnPort (\r -> SendImage (Tuple.first r) (Protocol.packageSourceFromString <| Tuple.second r))
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
          main_ [ class "page" ] [
            case model.status of
              NoGame ->
                viewLanding model
              Lobby ->
                viewLobby model
              Starting ->
                viewStarting model
              Drawing ->
                viewDrawing model
              Understanding ->
                viewUnderstanding model
              GameOver ->
                if model.showingGameoverSelf then
                  viewSelfSummary model
                else
                  viewSummary model
          ],
          viewSidebar model
        ]
      ]
  }

viewNav : Model -> Html Msg
viewNav model =
  nav [ class "page-header pure-menu pure-menu-horizontal" ] [
    span [ class "pure-menu-heading" ] [ text "Drawtice" ],
    ul [ class "pure-menu-list" ] ([
      li [ class ("pure-menu-item pure-menu-useless" ++ if not (hasGameStarted model) then " pure-menu-selected" else "") ] [ span [ class "pure-menu-link" ] [ text "New Game" ] ],
      li [ class ("pure-menu-item pure-menu-useless" ++ if hasGameStarted model then " pure-menu-selected" else "") ] [ span [ class "pure-menu-link" ] [ text "Current Game" ] ]
    ] ++ (case model.gameId of
      Nothing -> []
      Just _ ->
        [
          li [ class "pure-menu-item" ] [ span [ class "pure-menu-link" ] [ text "Share this link to invite other people to join:" ] ],
          let url = model |> getGameLink |> Url.toString
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
  header [
    class ("game-header" ++ if amDone model then " game-header-done" else "")
  ] ((case getMe model of
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
                span [ class "big-scary-clock" ] [ text (formatTimeDifference (round timeLeft)) ]
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
          Starting -> "Starting…"
          Drawing -> "Drawing…"
          Understanding -> "Understanding…"
          GameOver -> "Game Over"
        )
      ]
    ]
  )

viewSidebar : Model -> Html Msg
viewSidebar model =
  let
    gameId = div [ class "gameId" ] [
      case model.gameId of
        Nothing ->
          em [ class "text-muted" ] [ text "Not Started" ]
        Just id ->
          span [ class "text-tt" ] [ text id ]
     ]
    playerList = if Array.isEmpty model.players
      then []
      else [ div [ class "player-list" ] (Array.indexedMap (viewPlayer model) model.players |> Array.toList) ]
    adminActions = if model.amAdministrator && isGameRunning model
      then [
        div [ class "admin-actions" ] [
          button [ class "pure-button", onClick (ExtendDeadline 1) ] [ text "Add more time" ],
          button [ class "pure-button", onClick (LeaveGame |> ShowConfirmDialog "Are you sure you want to prematurely end this game for all players?") ] [ text "Cancel Game" ],
          button [ class "pure-button", onClick (NextRound |> ShowConfirmDialog "Are you sure you want to quickly end this round?") ] [ text "End Round" ]
        ]
      ]
      else []
    gameoverActions = if model.status == GameOver
      then [
        div [ class "admin-actions" ] [
          if model.amAdministrator then
            button [ class "pure-button", onClick RestartGame ] [ text "Restart game" ]
          else
            text ""
          , button [ class "pure-button pure-button-danger", onClick (LeaveGame |> ShowConfirmDialog "Are you sure you want to leave this game?") ] [ text "Leave Game" ]
        ]
      ]
      else []
  in
    aside [ class "sidebar" ] (gameId :: playerList ++ adminActions ++ gameoverActions)

viewPlayer : Model -> Int -> Player -> Html Msg
viewPlayer model id player =
  div [ class ("player" ++ if player.isMe then " me" else "") ] [
    viewPlayerAvatar player,
    span [ class "username" ] [ text player.username ],
    span [] ( (case player.status of
      Done ->
        (text "Done")
      Working timeLeft ->
        (text ("Working, " ++ formatTimeDifference (round timeLeft) ++ " left"))
      Uploading fraction ->
        (text ("Uploading (" ++ String.fromFloat (fraction * 100) ++ "% done)"))
      Stuck ->
        (text "Hit a wall")
    ) :: (if model.amAdministrator then
      [ a
        [ class "kick-button"
        , href "#"
        , onClick (KickPlayer id |> ShowConfirmDialog ("Are you sure you want to kick " ++ player.username ++ "?"))
         ] [ text "❌" ] ]
      else []
    ))
  ]

viewLanding : Model -> Html Msg
viewLanding model =
  let
    url = model.url
    form =
      case getURLGameId url of
        Just _ ->
          [
            button [ type_ "submit", class "pure-button pure-button-primary landing-button", onClick JoinGame ] [
              text "Join ",
              span [ class "text-tt" ] [ text model.formFields.gameId ] ,
              text " game"
            ],
            a [ class "pure-button", href <| Url.toString { url | fragment = Nothing}] [
              text "« Back"
            ]
          ]
        Nothing ->
          [
            Html.form [ class "landing-join landing-join-gameid", onSubmit JoinGame ]  [
              input [ placeholder "GameId", required True, onInput <| SetField GameIdField, value model.formFields.gameId, class "text-tt" ] [],
              button [ type_ "submit", class "pure-button pure-button-primary landing-button" ] [
                text "Join a running game"
              ]
            ],
            button [ class "pure-button pure-button-primary landing-button", onClick NewGame ] [ text "Start a New Game" ]
          ]
  in
    section [ class "landing hall" ] (
      div [ class "landing-join landing-join-username" ] [
        label [ for "username" ] [ text "People usually call me:" ],
        div [] [
          input [
            class "landing-username",
            name "username",
            placeholder model.formFields.usernamePlaceholder,
            required True,
            onInput <| SetField UsernameField,
            autocomplete True,
            value model.formFields.username
          ] [],
          span [ class "landing-username-icon", attribute "aria-hidden" "true" ] [ i [ class "fa fa-user-o"] [] ]
        ]
      ]
    :: form)

viewLobby : Model -> Html Msg
viewLobby model =
  section [ class "lobby hall" ] (
    div [ class "game-link-presentation" ] [
      div [ class "text-muted" ] [ text "Share the following link to let other people join:" ],
      let
        url = getGameLink model
      in
        a [ class "game-link-large text-tt", href (Url.toString url), target "_blank", rel "noopener noreferrer" ] [
          span [ class "game-link-protocol" ] [ text (
            case url.protocol of
            Url.Http -> "http://"
            Url.Https -> "https://"
          ) ],
          span [ class "game-link-host" ] [ text (url.host ++ (url.port_ |> Maybe.map (\p -> ":" ++ String.fromInt p) |> Maybe.withDefault "") ++ url.path ) ],
          span [ class "game-link-path" ] [ text ("#" ++ (url.fragment |> Maybe.withDefault "")) ]
        ]
    ]
   ::
    if model.amAdministrator then
      [
        button [ class "pure-button pure-button landing-button", onClick LeaveGame ] [ text "Cancel Game" ],
        button [ class "pure-button pure-button-success landing-button", disabled (Array.length model.players <= 1), onClick StartGame ] [ text "Start Game" ]
      ]
    else
      [ button [ class "pure-button pure-button-danger landing-button", onClick LeaveGame ] [ text "Leave Game" ] ]
  )


viewStarting : Model -> Html Msg
viewStarting model =
  section [ class "starting" ] [
    Html.form [ class "text-starting hall", action "#", onSubmitRaw (SubmitText Manual) ] [
      div [ class "text-starting-prompt" ] [ text "What do you want people to draw?" ],
      textarea [ class "text-starting-input", onInput <| SetField TextField ] [ ],
      button [ class "pure-button landing-button" ] [ text "Submit idea" ]
    ]
  ]


viewDrawing : Model -> Html Msg
viewDrawing model =
  section [ class "drawing hall" ] [
    div [ class "drawing-prompt" ] [
      div [ class "drawing-prompt-intro" ] [ text "You must draw:" ],
      div [ class "drawing-subject" ] [ text <| getWorkPackageText model ]
    ],
    node "drawing-canvas" [ class "drawing-canvas", attribute "key" (model.gameKey |> Maybe.withDefault "") ] [ ],
    button [ class "pure-button pure-button-success landing-button", onClick (SubmitImage Manual) ] [ text "I'm done!" ]
  ]

viewUnderstanding : Model -> Html Msg
viewUnderstanding model =
  section [ class "understanding hall" ] [
    div [ class "understanding-prompt" ] [
      div [ class "understanding-prompt-intro" ] [ text "Someone painted:" ],
      img [ class "understanding-image", src <| getWorkPackageImage model, alt "What the previous player drew" ] [ ]
    ],
    Html.form [ class "understanding-write", action "#", onSubmitRaw (SubmitText Manual)  ] [
      div [ class "understanding-write-intro" ] [ text "What is that?" ],
      textarea [ class "text-understanding-input", onInput <| SetField TextField ] [ ],
      button [ class "pure-button landing-button understanding-button" ] [ text "Submit explanation" ]
    ]
  ]

viewSelfSummary : Model -> Html Msg
viewSelfSummary model =
  let
    workloadFinder id = model.workloads
     |> Maybe.withDefault Array.empty
     |> Array.filter (\w -> (List.head w |> Maybe.map (\p -> p.playerId) |> Maybe.withDefault -1) == id)
     |> Array.get 0
    workload = model.myId |> Maybe.andThen workloadFinder
    firstPackage = workload |> Maybe.andThen List.head
    lastPackage = workload |> Maybe.andThen lastElem
  in
    section [ class "self-reflection hall" ] [
      div [ class "self-reflection-intro" ] [ text "This is what you wrote:" ],
      firstPackage |> Maybe.map (viewWorkpackage model -1 -2) |> Maybe.withDefault (text "???"),
      div [ class "self-reflection-intro" ] [ text "and this is what it turned into:" ],
      lastPackage |> Maybe.map (viewWorkpackage model -1 -2) |> Maybe.withDefault (text "???"),
      button [ class "pure-button pure-button-success landing-button", onClick CloseSelfSummary ] [ text "See more…" ]
    ]

viewSummary : Model -> Html Msg
viewSummary model =
  let
    workload = model.workloads |> Maybe.andThen (\a -> Array.get model.currentWorkload a)
                               |> Maybe.withDefault []
  in
    section [ class "summary hall" ] [
      a [ class ("summary-arrow summary-arrow-left" ++ if isAtWorkloadEnd model Backward then " summary-arrow-disabled" else "")
        , href "#"
        , onClick <| MoveWorkload Backward
        ] [ i [ class "fa fa-chevron-left" ] [] ],
      div [ class "summary-main" ] [
        h3 [ class "summary-header" ] [ text ("Series " ++ String.fromInt (model.currentWorkload + 1)) ],
        div [ class "summary-container" ] (List.indexedMap (viewWorkpackage model model.currentWorkload) workload)
      ],
    a [ class ("summary-arrow summary-arrow-right" ++ if isAtWorkloadEnd model Forward then " summary-arrow-disabled" else "")
        , href "#"
        , onClick <| MoveWorkload Forward
        ] [ i [ class "fa fa-chevron-right" ] [] ]
    ]

viewWorkpackage : Model -> Int -> Int -> WorkPackageDetails -> Html Msg
viewWorkpackage model loadId packageId package =
  let
    uniqId = "summary-image-" ++ String.fromInt loadId ++ "-" ++ String.fromInt packageId
    html = case package.data of
      Just (TextPackage t) ->
        p [ class "summary-package-text" ] [ text t ]
      Just (ImagePackage url) ->
        a [ id uniqId, href url, attribute "data-lightbox" uniqId, download "", onClickRaw <| ShowLightbox uniqId ] [
          img [ class "summary-package-image", src url, alt "Drawn image" ] [ ]
        ]
      Nothing ->
        div [ class "summary-package-nothing", title "The player didn't have time to complete this!" ] [ text "???" ]
    username = (Just model.players) |> Maybe.andThen (\a -> Array.get package.playerId a)
                                    |> Maybe.map (\p -> p.username)
                                    |> Maybe.withDefault "???"
  in
    div [ class "summary-package" ] [
      div [ class "summary-package-prompt" ] [ text ("by " ++ username ++ ":") ],
      html
    ]

viewPlayerAvatar : Player -> Html Msg
viewPlayerAvatar player =
  img [ class "avatar", alt (player.username ++ " Avatar"), src player.image ] []

formatTimeDifference : Int -> String
formatTimeDifference seconds =
  (if seconds < 0 then "-" else "")
  ++ String.padLeft 2 '0' (String.fromInt (seconds // 60 |> abs))
  ++ ":"
  ++ String.padLeft 2 '0' (String.fromInt (remainderBy 60 seconds |> abs))

getURLGameId : Url.Url -> Maybe String
getURLGameId url =
  Maybe.andThen (\f -> if f == "" then Nothing else Just f) url.fragment

getGameLink : Model -> Url.Url
getGameLink model =
  let
    url = model.url
  in
    case model.gameId of
      Just gameId ->
        if gameId == "" then
          url
        else
          { url | fragment = Just gameId }
      Nothing ->
        url

hasGameStarted : Model -> Bool
hasGameStarted model =
  case model.gameId of
    Nothing -> False
    Just _ -> True

getWorkPackageText : Model -> String
getWorkPackageText model =
  let
    previousPackage = model.previousPackage |> Maybe.withDefault (TextPackage "an armadillo")
  in
    case previousPackage of
      TextPackage t -> t
      _ -> "An error 500"

getWorkPackageImage : Model -> String
getWorkPackageImage model =
  let
    default = imageUrl ++ "dog.jpg"
    previousPackage = model.previousPackage |> Maybe.withDefault (ImagePackage default)
  in
    case previousPackage of
      ImagePackage p -> p
      _ -> default

isAtWorkloadEnd : Model -> Direction -> Bool
isAtWorkloadEnd model dir =
  if model.currentWorkload == 0 && dir == Backward then True
  else model.currentWorkload == Array.length (model.workloads |> Maybe.withDefault Array.empty) - 1 && dir == Forward

onClickRaw : msg -> Attribute msg
onClickRaw msg =
  Html.Events.preventDefaultOn "input" (JD.map alwaysPreventDefault (JD.succeed msg))

onSubmitRaw : msg -> Attribute msg
onSubmitRaw msg =
  Html.Events.preventDefaultOn "submit" (JD.map alwaysPreventDefault (JD.succeed msg))

alwaysPreventDefault : msg -> ( msg, Bool )
alwaysPreventDefault msg =
  ( msg, True )

lastElem : List a -> Maybe a
lastElem list =
    case list of
        [] ->
            Nothing
        [last] ->
            Just last
        head :: rest ->
            lastElem rest

