use rand::seq::SliceRandom;

static NAMES: &'static [&'static str] = &[
    "Ant",
    "Ape",
    "Bat",
    "Bear",
    "Bee",
    "Bison",
    "Boar",
    "Camel",
    "Cat",
    "Clam",
    "Cobra",
    "Cod",
    "Crab",
    "Crane",
    "Crow",
    "Deer",
    "Dog",
    "Dove",
    "Duck",
    "Eagle",
    "Eel",
    "Eland",
    "Elk",
    "Emu",
    "Finch",
    "Fish",
    "Fly",
    "Fox",
    "Frog",
    "Gaur",
    "Gnat",
    "Gnu",
    "Goat",
    "Goose",
    "Gull",
    "Hare",
    "Hawk",
    "Heron",
    "Horse",
    "Human",
    "Hyena",
    "Ibex",
    "Ibis",
    "Jay",
    "Koala",
    "Kudu",
    "Lark",
    "Lemur",
    "Lion",
    "Llama",
    "Loris",
    "Louse",
    "Mink",
    "Mole",
    "Moose",
    "Mouse",
    "Mule",
    "Newt",
    "Okapi",
    "Oryx",
    "Otter",
    "Owl",
    "Pig",
    "Pony",
    "Quail",
    "Rail",
    "Ram",
    "Rat",
    "Raven",
    "Rook",
    "Seal",
    "Shark",
    "Sheep",
    "Shrew",
    "Skunk",
    "Snail",
    "Snake",
    "Squid",
    "Stork",
    "Swan",
    "Tapir",
    "Tiger",
    "Toad",
    "Trout",
    "Viper",
    "Wasp",
    "Whale",
    "Wolf",
    "Worm",
    "Wren",
    "Yak",
    "Zebra"
];

const ADJECTIVES: &'static [&'static str] = &[
    "red",
    "green",
    "blue",
    "white",
    "black",
    "magenta",
    "yellow",
    "brown",
    "cyan",
    "fancy",
    "dull",
    "cool",
    "big",
    "tiny",
    "pink",
    "tall",
];

const THINGS: &'static [&'static str] = &[
    "a fish",
    "a stick",
    "a straight line",
    "whatever you want",
    "a toast",
    "something in green",
    "an afdoijewrndas",
    "the Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch village",
    "excitement",
    "the Eiffel tower",
    "wolf",
    "a circle",
    "I don't know!!",
    "draw a joke",
    "a film review",
    "a tail",
];

pub fn generate_random_name() -> String {
    let animal = NAMES
        .choose(&mut rand::thread_rng())
        .map(|s| *s)
        .unwrap_or("fox")
        .to_lowercase();
    let adjective = ADJECTIVES
        .choose(&mut rand::thread_rng())
        .map(|s| *s)
        .unwrap_or("puzzled")
        .to_lowercase();

    format!("{}-{}", adjective, animal)
}

// For people who forgot to submit!
pub fn generate_random_thing() -> String {
    let thing = THINGS
        .choose(&mut rand::thread_rng())
        .map(|s| *s)
        .unwrap_or("a box with a question mark")
        .to_lowercase();

    thing
}
