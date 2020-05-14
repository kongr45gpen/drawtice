module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Url
import Debug
import Time
import Task
import Array



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



-- MODEL

type PlayerStatus = Done | Working Float | Uploading Float | Stuck

type GameStatus = NoGame | Lobby | Drawing | Understanding | GameOver

type alias Player =
  {
    username : String,
    image : String,
    status : PlayerStatus
  }

type alias Model =
  { key : Nav.Key
  , url : Url.Url
  , status : GameStatus
  , gameId : Maybe String
  , lastUpdate : Maybe Time.Posix
  , players : List Player
  }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
  ( Model key url NoGame (Just "armadillo") Nothing [
    Player "kongr45gpen" "https://via.placeholder.com/150x300" (Working 225),
    Player "electrovesta" "https://via.placeholder.com/150x300" (Working 300),
    Player "marian" "https://via.placeholder.com/256" Done
  ], Task.perform Tick Time.now )



-- UPDATE


type Msg
  = LinkClicked Browser.UrlRequest
  | UrlChanged Url.Url
  | Tick Time.Posix
  | NoAction


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
      , Cmd.none
      )

    NoAction ->
      (model, Cmd.none)

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


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
  Time.every 1000 Tick



-- VIEW


view : Model -> Browser.Document Msg
view model =
  { title = "Drawtice"
  , body =
      [
        viewNav model,
        viewHeader model,
        viewSidebar model,
        main_ [ class "page" ] [ viewLanding ]
      ]
  }

viewNav : Model -> Html Msg
viewNav model =
  nav [ class "page-header pure-menu pure-menu-horizontal" ] [
    span [ class "pure-menu-heading" ] [ text "Drawtice" ],
    ul [ class "pure-menu-list" ] ([
      li [ class "pure-menu-item" ] [ span [ class "pure-menu-link" ] [ text "New Game" ] ],
      li [ class "pure-menu-item pure-menu-selected" ] [ span [ class "pure-menu-link" ] [ text "Current Game" ] ]
    ] ++ case model.gameId of
      Nothing -> []
      Just id ->
        [
          li [ class "pure-menu-item" ] [ span [ class "pure-menu-link" ] [ text "Share this link to invite other people to join:" ] ],
          let url = "https://game.dev/" ++ id
          in
            li [ class "pure-menu-item pure-menu-selected" ] [ a [ class "pure-menu-link", href url, onClick NoAction ] [ text url ] ]
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
    div [ class "gameId" ] [
      text "Game ID: ",
      case model.gameId of
        Nothing ->
          em [ class "text-muted" ] [ text "Not Started" ]
        Just id ->
          text id
    ],
    div [ class "player-list" ] (List.map (viewPlayer False) model.players)
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

viewLanding : Html Msg
viewLanding =
  section [ class "landing" ] [
    a [ class "pure-button pure-button-primary landing-button" ] [ text "Start a New Game" ],
    Html.form [ class "landing-join"]  [
      button [ type_ "submit", class "pure-button pure-button-primary landing-button" ] [
        text "Join a running game"
      ],
      input [ placeholder "GameId", required True ] []
    ]
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
