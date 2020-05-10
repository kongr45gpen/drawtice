module Main exposing (main)

import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Url
import Debug



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

type alias Player =
  {
    username : String,
    image : String,
    status : PlayerStatus
  }

type alias Model =
  { key : Nav.Key
  , url : Url.Url
  , players : List Player
  }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
  ( Model key url [
    Player "electrovesta" "https://via.placeholder.com/150x300" (Working 300),
    Player "marian" "https://via.placeholder.com/256" Done
  ], Cmd.none )



-- UPDATE


type Msg
  = LinkClicked Browser.UrlRequest
  | UrlChanged Url.Url


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



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
  Sub.none



-- VIEW


view : Model -> Browser.Document Msg
view model =
  { title = "Drawtice"
  , body =
      [
        text "Hello World",
        aside [ class "sidebar" ] (List.map viewPlayer model.players)
      ]
  }

viewPlayer : Player -> Html Msg
viewPlayer player =
  div [ class "player" ] [
    img [ class "avatar", alt "Player Avatar", src player.image ] [],
    span [] [ text player.username ],
    span [] [ case player.status of
      Done ->
        (text "Done")
      Working timeLeft ->
        (text ("Working, " ++ String.fromFloat timeLeft ++ " s left"))
      Uploading fraction ->
        (text ("Uploading (" ++ String.fromFloat (fraction * 100) ++ "% done)"))
      Stuck ->
        (text "Hit a wall")
    ],
    text "❌"
  ]
