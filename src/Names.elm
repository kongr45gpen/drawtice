module Names exposing (..)

import Array
import Random

names : Array.Array String
names = Array.fromList [
  "Mary",
  "John",
  "Aliakmonas",
  "Alkistis",
  "alej",
  "virr",
  "dojo",
  "doggo",
  "hojo",
  "baktu",
  "James",
  "Jamie",
  "Alex",
  "Antidisestablishmentarianism",
  "Llanfair­pwllgwyngyll­gogery­chwyrn­drobwll­llan­tysilio­gogo­goch",
  "L",
  "Professor",
  "admin",
  "user",
  "Nameless",
  "Horan",
  "Dolores",
  "root",
  "Picasso",
  "Caesar",
  "Gleich",
  "Mash"
  ]

generator : Random.Generator String
generator =
  Random.map (\n -> Array.get n names |> Maybe.withDefault "Null") (Random.int 0 (Array.length names - 1))
