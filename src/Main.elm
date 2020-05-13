module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
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

type GameStatus = Starting | Drawing | Understanding | GameOver

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
  , lastUpdate : Maybe Time.Posix
  , players : List Player
  }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
  ( Model key url Starting Nothing [
    Player "kongr45gpen" "https://via.placeholder.com/150x300" (Working 253),
    Player "electrovesta" "https://via.placeholder.com/150x300" (Working 300),
    Player "marian" "https://via.placeholder.com/256" Done
  ], Task.perform Tick Time.now )



-- UPDATE


type Msg
  = LinkClicked Browser.UrlRequest
  | UrlChanged Url.Url
  | Tick Time.Posix


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
        text "Hello World",
        viewHeader model,
        aside [ class "sidebar" ] (List.map (viewPlayer False) model.players)
      ]
  }

viewHeader : Model -> Html Msg
viewHeader model =
  header [ class "player-header" ] ((case List.head model.players of
      Nothing ->
        []
      Just me ->
        [
          div [ class "player-header-me" ] [
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
          Starting -> "Starting…"
          Drawing -> "Drawing…"
          Understanding -> "Understanding…"
          GameOver -> "Game Over"
        )
      ]
    ]
  )

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


viewPlayerAvatar : Player -> Html msg
viewPlayerAvatar player =
  img [ class "avatar", alt (player.username ++ " Avatar"), src player.image ] []

formatTimeDifference : Int -> String
formatTimeDifference seconds =
  String.padLeft 2 '0' (String.fromInt (seconds // 60)) ++ ":" ++ String.padLeft 2 '0' (String.fromInt (modBy 60 seconds))
