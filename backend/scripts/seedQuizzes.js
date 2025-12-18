const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');
const Question = require('../src/models/Question');
require('dotenv').config();

const QUIZZES = [
    // --- BATCH 1: THE "WAIT, WHAT?" COLLECTION (QUIRKY) --- 
    {
        title: 'The Mandela Effect 🤯',
        description: 'False memories or alternate reality? Test your brain.',
        thumbnail: '🌀',
        difficulty: 'medium',
        questions: [
            { q: "Does the Monopoly Man have a monocle?", o: ["Yes, of course!", "No, never had one", "Only in old versions", "He wears glasses"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Monopoly_game_logo.svg/800px-Monopoly_game_logo.svg.png' },
            { q: "What color is Pikachu's tail tip?", o: ["Black", "Yellow (Full tail)", "Brown", "Red"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a6/Pok%C3%A9mon_Pikachu_art.png' },
            { q: "Curious George: Does he have a tail?", o: ["Yes, a long one", "No tail", "A short stubby one", "Yes, a curly one"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Curious_George_ Rey.jpg' },
            { q: "Finish the Star Wars quote: '____, I am your father.'", o: ["Luke", "No", "Obi-Wan", "Yes"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/7/74/Anakin-Jedi.jpg' },
            { q: "The evil queen in Snow White says: '____, mirror on the wall.'", o: ["Mirror", "Magic", "Look", "Queen"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/The_Evil_Queen_%28Disney%29.png/220px-The_Evil_Queen_%28Disney%29.png' },
            { q: "Is it 'Looney Toons' or 'Looney Tunes'?", o: ["Looney Toons", "Looney Tunes", "Luney Toons", "Loony Tunes"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Looney_Tunes_logo.svg/800px-Looney_Tunes_logo.svg.png' },
            { q: "The Kit-Kat logo: Is there a hyphen?", o: ["Kit-Kat", "Kit Kat (No hyphen)", "KitKat (One word)", "Kit_Kat"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Kit_Kat_logo.svg/800px-Kit_Kat_logo.svg.png' },
            { q: "C-3PO's leg color in the original movies?", o: ["All Gold", "One Silver Leg", "One Red Leg", "One Black Leg"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5c/C-3PO_droid.png' },
            { q: "Does the Fruit of the Loom logo have a cornucopia?", o: ["Yes, behind the fruit", "No, just fruit", "It used to", "A basket"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/Fruit_of_the_Loom_logo.svg/800px-Fruit_of_the_Loom_logo.svg.png' },
            { q: "Mickey Mouse's suspenders?", o: ["He wears buttons, no suspenders", "Red suspenders", "Black suspenders", "White suspenders"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png' }
        ]
    },
    {
        title: 'Emoji Puzzles 🧩',
        description: 'Can you decode the message? Guess movies, concepts, and more.',
        thumbnail: '🤔',
        difficulty: 'easy',
        questions: [
            { q: "Guess the Movie: 🚢 🧊 💔", o: ["Frozen", "Titanic", "Ice Age", "The Polar Express"], a: 1, mediaType: 'none' },
            { q: "Guess the Movie: 🦁 👑", o: ["Tiger King", "Madagascar", "The Lion King", "Jungle Book"], a: 2, mediaType: 'none' },
            { q: "Guess the Country: 🍁 🏒", o: ["USA", "Russia", "Canada", "Sweden"], a: 2, mediaType: 'none' },
            { q: "Guess the Superhero: 🕷️ 🕸️ 👦", o: ["Superman", "Batman", "Spider-Man", "Iron Man"], a: 2, mediaType: 'none' },
            { q: "Guess the Job: 👨‍🚀 🚀 🌑", o: ["Pilot", "Astronomer", "Astronaut", "Alien"], a: 2, mediaType: 'none' },
            { q: "Guess the Food: 🍕 🇮🇹", o: ["Burger", "Pizza", "Pasta", "Tacos"], a: 1, mediaType: 'none' },
            { q: "Guess the Brand: 🍎 📱", o: ["Samsung", "Apple", "Microsoft", "Nokia"], a: 1, mediaType: 'none' },
            { q: "Guess the Animal: 🐼 🎋", o: ["Koala", "Grizzly Bear", "Panda", "Polar Bear"], a: 2, mediaType: 'none' },
            { q: "Guess the Movie: 🦖 🦕 🏝️", o: ["Jurassic Park", "Godzilla", "King Kong", "Land Before Time"], a: 0, mediaType: 'none' },
            { q: "Guess the Sport: 🏀 ⛹️‍♂️", o: ["Football", "Tennis", "Basketball", "Baseball"], a: 2, mediaType: 'none' }
        ]
    },
    {
        title: 'Optical Illusions 👁️',
        description: 'Trust nothing. Is it moving? What color is it?',
        thumbnail: '😵',
        difficulty: 'medium',
        questions: [
            { q: "Is this image moving?", o: ["Yes, definitely", "No, it's a static image", "It's a GIF", "My eyes are broken"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Golfer_illusion.jpg/800px-Golfer_illusion.jpg' },
            { q: "Which line is longer?", o: ["Top line", "Bottom line", "Both are same length", "Neither"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/M%C3%BCller-Lyer_illusion.svg/800px-M%C3%BCller-Lyer_illusion.svg.png' },
            { q: "Are the horizontal lines parallel?", o: ["No, they are crooked", "Yes, they are parallel", "They are zig-zags", "Hard to tell"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Grey_square_optical_illusion.PNG/800px-Grey_square_optical_illusion.PNG' },
            { q: "How many legs does this elephant have?", o: ["4", "5", "Infinite", "Confusing amount"], a: 3, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Elephant_illusion.jpg' },
            { q: "Are the circles moving?", o: ["Yes", "No", "Maybe", "Only the middle one"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Peripheral_drift_illusion_rotating_snakes.svg/800px-Peripheral_drift_illusion_rotating_snakes.svg.png' },
            { q: "What do you see first?", o: ["A Duck", "A Rabbit", "Both", "Neither"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Duck-Rabbit_illusion.jpg/800px-Duck-Rabbit_illusion.jpg' },
            { q: "Which orange circle is bigger?", o: ["Left one", "Right one", "Both are same size", "Depends on screen"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Ebbinghaus_illusion.svg/800px-Ebbinghaus_illusion.svg.png' },
            { q: "Is the grid distorted?", o: ["Yes, lines are curved", "No, lines are straight & parallel", "Only vertical lines", "Only horizontal lines"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hering_illusion.svg/800px-Hering_illusion.svg.png' },
            { q: "Kanizsa Triangle: Is there a white triangle?", o: ["Yes, physically drawn", "No, it's an illusion", "Only outline", "Blue triangle"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Kanizsa_triangle.svg/800px-Kanizsa_triangle.svg.png' },
            { q: "Are the A and B squares the same color?", o: ["No, A is darker", "No, B is darker", "Yes, exactly the same", "One is grey, one is white"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Grey_square_optical_illusion.PNG/800px-Grey_square_optical_illusion.PNG' }
        ]
    },
    {
        title: 'Weird But True 🤥',
        description: 'Random facts that sound fake but are 100% real.',
        thumbnail: '🤯',
        difficulty: 'medium',
        questions: [
            { q: "Where is a shrimp's heart located?", o: ["Chest", "Tail", "Head", "Legs"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Penaeus_monodon.jpg/800px-Penaeus_monodon.jpg' },
            { q: "Which animal has cube-shaped poop?", o: ["Vombat (Wombat)", "Koala", "Sloth", "Armadillo"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Vombatus_ursinus_-Maria_Island_National_Park.jpg/800px-Vombatus_ursinus_-Maria_Island_National_Park.jpg' },
            { q: "How long is a day on Venus?", o: ["24 hours", "Longer than its year", "10 hours", "365 days"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/800px-Venus-real_color.jpg' },
            { q: "Bananas are scientifically classified as...", o: ["Fruits", "Berries", "Herbs", "Vegetables"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Bananas_white_background_DS.jpg/800px-Bananas_white_background_DS.jpg' },
            { q: "It is impossible for pigs to...", o: ["Squeal", "Look up at the sky", "Swim", "Eat meat"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Pig_in_a_bucket.jpg/800px-Pig_in_a_bucket.jpg' },
            { q: "Which animal can hold its breath for 6 days?", o: ["Blue Whale", "Scorpion", "Hippo", "Sloth"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Scorpion_Photo.jpg/800px-Scorpion_Photo.jpg' },
            { q: "The shortest war in history lasted...", o: ["38 minutes", "1 day", "1 week", "1 hour"], a: 0, mediaType: 'none' },
            { q: "Humans share 60% of their DNA with...", o: ["Monkeys", "Bananas", "Cats", "Dogs"], a: 1, mediaType: 'none' },
            { q: "Octopuses have how many hearts?", o: ["1", "2", "3", "4"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Octopus.jpg/800px-Octopus.jpg' },
            { q: "The unicorn is the national animal of...", o: ["Ireland", "Scotland", "Wales", "Narnia"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/The_Unicorn_in_Captivity.jpg/800px-The_Unicorn_in_Captivity.jpg' }
        ]
    },
    {
        title: 'Urban Legends 👻',
        description: 'Myth vs Fact. Which of these popular beliefs are actually true?',
        thumbnail: '🔦',
        difficulty: 'medium',
        questions: [
            { q: "Do bulls hate the color red?", o: ["Yes, makes them angry", "No, they are colorblind", "Only bright red", "Yes, it signals danger"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Spanish_Bullfight.jpg/800px-Spanish_Bullfight.jpg' },
            { q: "Can we see the Great Wall of China from space?", o: ["Yes, easily", "No, it's too thin", "Only at night", "With binoculars"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/800px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg' },
            { q: "Does gum stay in your stomach for 7 years?", o: ["Yes, it sticks", "No, it passes through", "Only if swallowed whole", "5 years"], a: 1, mediaType: 'none' },
            { q: "Do we strictly use only 10% of our brains?", o: ["Yes", "No, we use all of it", "Only smart people", "While sleeping"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/MRI_brain.jpg/800px-MRI_brain.jpg' },
            { q: "Does shaving make hair grow back thicker?", o: ["Yes", "No, it's an illusion", "Only facial hair", "Only leg hair"], a: 1, mediaType: 'none' },
            { q: "Are bats blind?", o: ["Yes, totally", "No, they see well", "Only at night", "Only vampire bats"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Big_Eared_Bat.jpg/800px-Big_Eared_Bat.jpg' },
            { q: "Is the '5 Second Rule' safe?", o: ["Yes, germs are slow", "No, bacteria transfer instantly", "Only for dry food", "Depends on floor"], a: 1, mediaType: 'none' },
            { q: "Do goldfish have a 3-second memory?", o: ["Yes", "No, months long", "10 seconds", "1 minute"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Goldfish3.jpg/800px-Goldfish3.jpg' },
            { q: "Does cracking knuckles cause arthritis?", o: ["Yes", "No, harmless gas bubbles", "Only in old age", "Maybe"], a: 1, mediaType: 'none' },
            { q: "Do Vikings wear horned helmets?", o: ["Yes, always", "No, never found evidence", "Only leaders", "For rituals"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Gjermundbu_helmet_-_cropped.jpg/800px-Gjermundbu_helmet_-_cropped.jpg' }
        ]
    },

    // --- BATCH 2: POP CULTURE CHAOS (FUN) ---
    {
        title: 'Badly Explained Plots 🎬',
        description: 'Movies explained... spectacularly poorly. Can you guess them?',
        thumbnail: '🎥',
        difficulty: 'easy',
        questions: [
            { q: "A billionaire dedicates his fortune to cosplay and beating up the mentally ill.", o: ["Iron Man", "Batman", "Black Panther", "Green Arrow"], a: 1, mediaType: 'none' },
            { q: "A guy gets stuck in an airport for months because his country stops existing.", o: ["Catch Me If You Can", "The Terminal", "Cast Away", "Flight"], a: 1, mediaType: 'none' },
            { q: "A young girl travels to a colorful land and kills the first person she meets.", o: ["Alice in Wonderland", "The Wizard of Oz", "Narnia", "Tangled"], a: 1, mediaType: 'none' },
            { q: "A group of people walk for 9 hours to return some stolen jewelry.", o: ["Ocean's Eleven", "Lord of the Rings", "The Hobbit", "Reservoir Dogs"], a: 1, mediaType: 'none' },
            { q: "Puberty gives a shy boy sticky fingers and he fights his girlfriend's dad.", o: ["Teen Wolf", "Spider-Man: Homecoming", "Twilight", "Kick-Ass"], a: 1, mediaType: 'none' },
            { q: "An old man pretends to be a wizard to get a kid to kill a darker wizard.", o: ["Harry Potter", "Star Wars", "Gandalf", "Percy Jackson"], a: 0, mediaType: 'none' },
            { q: "Fish touches a boat, dad searches entire ocean to find him.", o: ["Jaws", "Finding Nemo", "Shark Tale", "Little Mermaid"], a: 1, mediaType: 'none' },
            { q: "A noseless guy stays obsessed with a teenage boy for 7 years.", o: ["Voldemort (Harry Potter)", "Joker", "Thanos", "Darth Vader"], a: 0, mediaType: 'none' },
            { q: "A family's vacation is ruined by dinosaurs that shouldn't exist.", o: ["Jurassic Park", "King Kong", "Journey to the Center of the Earth", "The Good Dinosaur"], a: 0, mediaType: 'none' },
            { q: "A man loves his car so much he kills the Russian mafia.", o: ["Fast & Furious", "John Wick", "Transporter", "Taken"], a: 1, mediaType: 'none' }
        ]
    },
    {
        title: 'Real or Fake? 🕵️',
        description: 'Fact or Fiction? Spot the lies among the truth.',
        thumbnail: '🤥',
        difficulty: 'medium',
        questions: [
            { q: "Strawberries are NOT actually berries, but bananas ARE.", o: ["Real", "Fake", "Both are berries", "Neither are berries"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bananas.jpg/800px-Bananas.jpg' },
            { q: "Humans swallow an average of 8 spiders a year in their sleep.", o: ["Real", "Fake", "It's actually 20", "Only in Australia"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Spider_wolf_Flickr.jpg/800px-Spider_wolf_Flickr.jpg' },
            { q: "The national animal of Scotland is the Unicorn.", o: ["Real", "Fake", "It's a Lion", "It's a Sheep"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Royal_Coat_of_Arms_of_the_United_Kingdom_%28Scotland%29.svg/800px-Royal_Coat_of_Arms_of_the_United_Kingdom_%28Scotland%29.svg.png' },
            { q: "Wombat poop is cube-shaped.", o: ["Real", "Fake", "It's spherical", "It's pyramid shaped"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Vombatus_ursinus_-Maria_Island_National_Park.jpg/800px-Vombatus_ursinus_-Maria_Island_National_Park.jpg' },
            { q: "Napoleon Bonaparte was extremely short.", o: ["Real (5'2)", "Fake (Average height)", "Fake (He was tall)", "Real (4'11)"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/table/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg' },
            { q: "Honey never spoils. Edible honey has been found in ancient Egyptian tombs.", o: ["Real", "Fake", "Only for 100 years", "Honey spoils in 1 year"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Runny_hunny.jpg/800px-Runny_hunny.jpg' },
            { q: "Octopuses have three hearts.", o: ["Real", "Fake", "They have 1", "They have 9"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Octopus_vulgaris_2.jpg/800px-Octopus_vulgaris_2.jpg' },
            { q: "The Great Wall of China is the only man-made object visible from space.", o: ["Real", "Fake (Not visible)", "Fake (Many are visible)", "Real (But only at night)"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/800px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg' },
            { q: "Elephants are the only mammals that cannot jump.", o: ["Real", "Fake (Rhinos can't)", "Fake (Hippos can't)", "Fake (Sloths can't)"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/800px-African_Bush_Elephant.jpg' },
            { q: "Cows have best friends and get stressed when separated.", o: ["Real", "Fake", "They hate everyone", "Only calves"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Cow_female_black_white.jpg/800px-Cow_female_black_white.jpg' }
        ]
    },
    {
        title: 'Logo Logic 🆔',
        description: 'How well do you know famous brands? Test your visual memory.',
        thumbnail: '🏢',
        difficulty: 'easy',
        questions: [
            { q: "What color are the arches in the McDonald's logo?", o: ["Red", "Golden/Yellow", "White", "Orange"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/800px-McDonald%27s_Golden_Arches.svg.png' },
            { q: "How many stars are in the Subaru logo?", o: ["4", "5", "6", "7"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Subaru_logo.svg/800px-Subaru_logo.svg.png' },
            { q: "Which animal is featured in the Porsche logo?", o: ["Lion", "Horse", "Bull", "Eagle"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Porsche_Wappen.svg/800px-Porsche_Wappen.svg.png' },
            { q: "What mythical creature is on the Starbucks logo?", o: ["Goddess", "Siren/Mermaid", "Angel", "Queen"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/800px-Starbucks_Corporation_Logo_2011.svg.png' },
            { q: "Which way is the Puma in the logo jumping?", o: ["Left", "Right", "Straight up", "Down"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Puma_SE_Logo.svg/800px-Puma_SE_Logo.svg.png' },
            { q: "What is missing from this Apple logo?", o: ["A leaf", "A bite", "A worm", "A stem"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png' },
            { q: "The Amazon logo has a smile from A to...?", o: ["X", "Z", "N", "M"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/800px-Amazon_logo.svg.png' },
            { q: "How many rings are in the Olympic flag?", o: ["4", "5", "6", "7"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympic_rings_without_rims.svg/800px-Olympic_rings_without_rims.svg.png' },
            { q: "Which company has a 'swoosh' logo?", o: ["Adidas", "Puma", "Nike", "Reebok"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/800px-Logo_NIKE.svg.png' },
            { q: "What color is the N in the Netflix logo?", o: ["Blue", "Red", "Black", "White"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png' }
        ]
    },
    {
        title: '90s Nostalgia Trip 🧸',
        description: 'Only 90s kids will remember. A blast from the past.',
        thumbnail: '📼',
        difficulty: 'medium',
        questions: [
            { q: "What is this digital pet called?", o: ["Digimon", "Tamagotchi", "Giga Pet", "Nano Pet"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ea/Tamagotchi01.jpg/800px-Tamagotchi01.jpg' },
            { q: "What object is this (used for movies)?", o: ["Betamax", "VHS Tape", "Cassette", "8-Track"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/VHS-cassette.jpg/800px-VHS-cassette.jpg' },
            { q: "This save icon is actually a picture of...", o: ["A TV", "A Floppy Disk", "A Hard Drive", "A CD"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Floppy_disk_3.5_inch.JPG/800px-Floppy_disk_3.5_inch.JPG' },
            { q: "What was the name of the paperclip assistant in Word?", o: ["Clippy", "Buddy", "Helper", "Paperboy"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Clippy-letter.PNG/220px-Clippy-letter.PNG' },
            { q: "Which portable console is this?", o: ["Sega Game Gear", "Game Boy", "Atari Lynx", "Nintendo DS"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Game-Boy-FL.jpg/800px-Game-Boy-FL.jpg' },
            { q: "Before Google, everyone used this search engine.", o: ["Bing", "Yahoo!", "DuckDuckGo", "Ask Jeeves"], a: 3, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Ask_Jeeves_Logo.svg/800px-Ask_Jeeves_Logo.svg.png' },
            { q: "What is the name of this toy?", o: ["Slinky", "Yo-Yo", "Furby", "Beanie Baby"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/9/91/Furby_picture.jpg' },
            { q: "Which Spice Girl is Geri Halliwell?", o: ["Posh Spice", "Scary Spice", "Baby Spice", "Ginger Spice"], a: 3, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Spice_Girls_Montreal2.jpg/800px-Spice_Girls_Montreal2.jpg' },
            { q: "What sound did you hear when connecting to the internet?", o: ["Dial-up tone", "Ringtone", "Siren", "Beep boop"], a: 0, mediaType: 'none' },
            { q: "Nickelodeon's green substance was called...", o: ["Goo", "Slime", "Ooze", "Muck"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Nickelodeon_Slime_Geyser.jpg/800px-Nickelodeon_Slime_Geyser.jpg' }
        ]
    },
    {
        title: 'Sitcom Trivia 📺',
        description: 'Friends, The Office, Brooklyn 99. Test your binge knowledge.',
        thumbnail: '☕',
        difficulty: 'easy',
        questions: [
            { q: "What is the name of Ross's pet monkey in Friends?", o: ["Marcel", "Abu", "George", "Bobo"], a: 0, mediaType: 'none' },
            { q: "Who started the fire in The Office?", o: ["Dwight", "Michael", "Ryan", "Kevin"], a: 2, mediaType: 'none' },
            { q: "What is the name of the bar in How I Met Your Mother?", o: ["Central Perk", "MacLaren's", "Paddy's Pub", "Cheers"], a: 1, mediaType: 'none' },
            { q: "What is Captain Holt's dog's name in B99?", o: ["Cheese", "Cheddar", "Gouda", "Brie"], a: 1, mediaType: 'none' },
            { q: "Sheldon Cooper's famous catchphrase?", o: ["Bazinga!", "Bingo!", "Eureka!", "Gotcha!"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Sheldon_Cooper.jpg/220px-Sheldon_Cooper.jpg' },
            { q: "In Friends, Joey doesn't share...?", o: ["Clothes", "Food", "Space", "Dates"], a: 1, mediaType: 'none' },
            { q: "Which paper company does Michael Scott work for?", o: ["Vance Refrigeration", "Dunder Mifflin", "Staples", "Wernham Hogg"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Dunder_Mifflin%2C_Inc.svg/800px-Dunder_Mifflin%2C_Inc.svg.png' },
            { q: "Who is the 'Cool... Cool, cool, cool' detective?", o: ["Jake Peralta", "Terry Jeffords", "Charles Boyle", "Rosa Diaz"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Brooklyn_Nine-Nine_Season_7.jpg/220px-Brooklyn_Nine-Nine_Season_7.jpg' },
            { q: "What is the name of the coffee shop in Friends?", o: ["Central Perk", "Java Joe's", "The Bean", "Coffee House"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Central_Perk_Logo.svg/800px-Central_Perk_Logo.svg.png' },
            { q: "In The Office, what does Dwight grow on his farm?", o: ["Corn", "Beets", "Potatoes", "Carrots"], a: 1, mediaType: 'none' }
        ]
    },

    // --- BATCH 3: BALANCED MIX (MAINSTREAM + FUN) ---
    {
        title: 'Bad Bollywood 💃',
        description: 'Hilariously bad explanations of famous Bollywood movies.',
        thumbnail: '🎬',
        difficulty: 'easy',
        questions: [
            { q: "Man kidnaps girl, they travel together, falls in love. Stockholm syndrome?", o: ["Highway", "Jab We Met", "Dilwale Dulhania Le Jayenge", "Chennai Express"], a: 0, mediaType: 'none' },
            { q: "40-year-old college students ruin their principal's life.", o: ["3 Idiots", "Student of the Year", "Main Hoon Na", "Mohabbatein"], a: 2, mediaType: 'none' },
            { q: "A man plays cricket to avoid paying taxes.", o: ["Lagaan", "Dhoni", "Iqbal", "Victory"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Lagaan_poster.jpg' },
            { q: "Rich girl leaves her wedding to chase a stranger on a train.", o: ["Jab We Met", "Dil Chahta Hai", "Yeh Jawaani Hai Deewani", "Kuch Kuch Hota Hai"], a: 0, mediaType: 'none' },
            { q: "Alien loves electricity and talks to God.", o: ["PK", "Koi Mil Gaya", "Ra.One", "Robot"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/PK_poster.jpg' },
            { q: "Two brothers fight over a wall, mom cries a lot.", o: ["Deewaar", "Sholay", "Karan Arjun", "Ram Lakhan"], a: 0, mediaType: 'none' },
            { q: "Ghost hates a king, so he turns the king's wife into a ghost.", o: ["Bhool Bhulaiyaa", "Stree", "Paheli", "1920"], a: 2, mediaType: 'none' },
            { q: "Robot falls in love with a girl, tries to kill creator.", o: ["Robot (Enthiran)", "Ra.One", "Krrish", "Attack"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/6/68/Enthiran_poster.jpg' },
            { q: "Three guys go to Goa, one falls for a French girl, one gets slapped.", o: ["Dil Chahta Hai", "Zindagi Na Milegi Dobara", "Go Goa Gone", "Dil Dhadakne Do"], a: 0, mediaType: 'none' },
            { q: "Talking parrot helps a man reunite with his dead reincarnation.", o: ["Om Shanti Om", "Karz", "Karan Arjun", "Housefull 4"], a: 0, mediaType: 'none' }
        ]
    },
    {
        title: 'World Geography 🗺️',
        description: 'Travel the world. Flags, capitals, and natural wonders.',
        thumbnail: '🌏',
        difficulty: 'medium',
        questions: [
            { q: "Which country has the most islands in the world?", o: ["Indonesia", "Sweden", "Philippines", "Canada"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Flag_of_Sweden.svg/800px-Flag_of_Sweden.svg.png' },
            { q: "What is the capital of Australia?", o: ["Sydney", "Melbourne", "Canberra", "Perth"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Parliament_House_Canberra_Dusk_Panorama.jpg/800px-Parliament_House_Canberra_Dusk_Panorama.jpg' },
            { q: "The 'Christ the Redeemer' statue is in which city?", o: ["Lisbon", "Sao Paulo", "Rio de Janeiro", "Buenos Aires"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Cristo_Redentor_-_Rio_de_Janeiro%2C_Brasil.jpg/800px-Cristo_Redentor_-_Rio_de_Janeiro%2C_Brasil.jpg' },
            { q: "Which is the largest desert in the world?", o: ["Sahara", "Gobi", "Antarctica", "Arabian"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Antarctica_geographical_map.svg/800px-Antarctica_geographical_map.svg.png' },
            { q: "Identify this famous landmark:", o: ["Petra", "Colosseum", "Machu Picchu", "Pyramids"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Treasury_petra_crop.jpeg/800px-Treasury_petra_crop.jpeg' },
            { q: "This flag belongs to which country?", o: ["Italy", "Mexico", "Ireland", "Hungary"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/800px-Flag_of_Mexico.svg.png' },
            { q: "Mount Everest is located in Nepal and...?", o: ["India", "Bhutan", "China (Tibet)", "Pakistan"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Everest_kalapatthar.jpg/800px-Everest_kalapatthar.jpg' },
            { q: "Which continent is the Sahara Desert in?", o: ["Asia", "South America", "Africa", "Australia"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Sahara_desert.jpg/800px-Sahara_desert.jpg' },
            { q: "What is the longest river in the world?", o: ["Amazon", "Nile", "Yangtze", "Mississippi"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Nile_River_and_delta_from_orbit.jpg/800px-Nile_River_and_delta_from_orbit.jpg' },
            { q: "Which country is shaped like a boot?", o: ["Spain", "France", "Italy", "Greece"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Italy_satellite_image.jpg/800px-Italy_satellite_image.jpg' }
        ]
    },
    {
        title: 'Animal Kingdom 🦁',
        description: 'Wild facts about cute and deadly creatures.',
        thumbnail: '🐯',
        difficulty: 'easy',
        questions: [
            { q: "Which is the fastest land animal?", o: ["Lion", "Cheetah", "Gazelle", "Leopard"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/TheCheethcat.jpg/800px-TheCheethcat.jpg' },
            { q: "What is a group of crows called?", o: ["Flock", "Murder", "School", "Pack"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Corvus_corone_-near_Canford_Cliffs%2C_Poole%2C_England-8.jpg/800px-Corvus_corone_-near_Canford_Cliffs%2C_Poole%2C_England-8.jpg' },
            { q: "Which animal sleeps standing up?", o: ["Horse", "Dog", "Cat", "Monkey"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Nokota_Horses_cropped.jpg/800px-Nokota_Horses_cropped.jpg' },
            { q: "What is the largest animal on Earth?", o: ["Elephant", "Blue Whale", "Giraffe", "Colossal Squid"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Blue_Whale_001_body_bw.jpg/800px-Blue_Whale_001_body_bw.jpg' },
            { q: "Which bird cannot fly?", o: ["Eagle", "Penguin", "Sparrow", "Hawk"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/South_Shetland-2016-Deception_Island%E2%80%93Chinstrap_penguin_%28Pygoscelis_antarctica%29_04.jpg/800px-South_Shetland-2016-Deception_Island%E2%80%93Chinstrap_penguin_%28Pygoscelis_antarctica%29_04.jpg' },
            { q: "A baby kangaroo is called a...", o: ["Cub", "Calf", "Joey", "Pup"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kangaroo_and_joey03.jpg/800px-Kangaroo_and_joey03.jpg' },
            { q: "Which animal has the strongest bite force?", o: ["Lion", "Shark", "Saltwater Crocodile", "Bear"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Nile_crocodile_head.jpg/800px-Nile_crocodile_head.jpg' },
            { q: "What is this animal?", o: ["Llama", "Alpaca", "Camel", "Sheep"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Alpaca_2005.jpg/800px-Alpaca_2005.jpg' },
            { q: "Pandas eat almost exclusively...", o: ["Meat", "Bamboo", "Fruit", "Fish"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/800px-Grosser_Panda.JPG' },
            { q: "Which animal is known to 'play dead'?", o: ["Opossum", "Raccoon", "Badger", "Fox"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Didelphis_virginiana.jpg/800px-Didelphis_virginiana.jpg' }
        ]
    },
    {
        title: 'Science Facts 🧪',
        description: 'Explore the universe, the human body, and physics.',
        thumbnail: '🔬',
        difficulty: 'medium',
        questions: [
            { q: "What is the hardest natural substance on Earth?", o: ["Gold", "Iron", "Diamond", "Platinum"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Rough_Diamond.jpg/800px-Rough_Diamond.jpg' },
            { q: "Which planet is known as the 'Red Planet'?", o: ["Venus", "Mars", "Jupiter", "Saturn"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/800px-OSIRIS_Mars_true_color.jpg' },
            { q: "What gas do plants absorb from the atmosphere?", o: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], a: 1, mediaType: 'none' },
            { q: "What is the powerhouse of the cell?", o: ["Nucleus", "Ribosome", "Mitochondria", "Cytoplasm"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mitochondrion_structure.svg/800px-Mitochondrion_structure.svg.png' },
            { q: "How many bones are in the adult human body?", o: ["206", "250", "195", "300"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Human_skeleton_front_en.svg/800px-Human_skeleton_front_en.svg.png' },
            { q: "What is the chemical symbol for Water?", o: ["HO", "H2O", "O2H", "WA"], a: 1, mediaType: 'none' },
            { q: "Which planet has the most moons?", o: ["Earth", "Mars", "Jupiter", "Saturn"], a: 3, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/800px-Saturn_during_Equinox.jpg' },
            { q: "What part of the plant conducts photosynthesis?", o: ["Root", "Stem", "Leaf", "Flower"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Leaf_1_web.jpg/800px-Leaf_1_web.jpg' },
            { q: "Who developed the Theory of Relativity?", o: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileo"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/800px-Albert_Einstein_Head.jpg' },
            { q: "At what temperature does water boil (Celsius)?", o: ["50°C", "90°C", "100°C", "150°C"], a: 2, mediaType: 'none' }
        ]
    },
    {
        title: 'Sports Trivia 🏆',
        description: 'Global sports challenge. Football, Tennis, Olympics, and more.',
        thumbnail: '⚽',
        difficulty: 'medium',
        questions: [
            { q: "Which country won the 2022 FIFA World Cup?", o: ["France", "Brazil", "Argentina", "Germany"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Lionel_Messi_holds_the_FIFA_World_Cup_Trohpy.jpg/800px-Lionel_Messi_holds_the_FIFA_World_Cup_Trohpy.jpg' },
            { q: "How many rings are in the Olympic logo?", o: ["4", "5", "6", "7"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympic_rings_without_rims.svg/800px-Olympic_rings_without_rims.svg.png' },
            { q: "Which sport uses a shuttlecock?", o: ["Tennis", "Badminton", "Table Tennis", "Squash"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Shuttlecock_01s.jpg/800px-Shuttlecock_01s.jpg' },
            { q: "Who is known as 'The Goat' in gymnastics?", o: ["Simone Biles", "Nadia Comaneci", "Sunisa Lee", "Mary Lou Retton"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Simone_Biles_at_the_2016_Olympics_all-around_gold_medal_podium_%2828945763952%29_%28cropped%29.jpg/800px-Simone_Biles_at_the_2016_Olympics_all-around_gold_medal_podium_%2828945763952%29_%28cropped%29.jpg' },
            { q: "In which sport would you perform a 'Slam Dunk'?", o: ["Volleyball", "Basketball", "Football", "Baseball"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Mullens_dunk.jpg/800px-Mullens_dunk.jpg' },
            { q: "What is the maximum score in 10-pin bowling?", o: ["200", "250", "300", "500"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Bowling_ball_and_skittle.jpg/800px-Bowling_ball_and_skittle.jpg' },
            { q: "Rafael Nadal is famous for playing...", o: ["Golf", "Tennis", "Cricket", "Football"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Rafael_Nadal_%2814467389279%29.jpg/800px-Rafael_Nadal_%2814467389279%29.jpg' },
            { q: "Which F1 team has the 'Prancing Horse' logo?", o: ["Mercedes", "McLaren", "Ferrari", "Red Bull"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Ferrari-Logo.svg/800px-Ferrari-Logo.svg.png' },
            { q: "How many players are on a standard football (soccer) team?", o: ["9", "10", "11", "12"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Football_in_Bloomington%2C_Indiana%2C_1996.jpg/800px-Football_in_Bloomington%2C_Indiana%2C_1996.jpg' },
            { q: "The Super Bowl is the final game of which sport?", o: ["Baseball", "Basketball", "American Football", "Hockey"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Super_Bowl_L_logo.svg/800px-Super_Bowl_L_logo.svg.png' }
        ]
    }
];

async function seed() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizstorm';
        console.log('Connecting to:', uri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Localhost');

        await mongoose.connect(uri);
        console.log('🌱 Connected to MongoDB');

        await Quiz.deleteMany({});
        await Question.deleteMany({});
        console.log('🗑️  Cleared existing quizzes for fresh seed.');

        for (const data of QUIZZES) {
            console.log(`Creating quiz: ${data.title}...`);

            const questionIds = [];
            for (const q of data.questions) {
                const newQ = await Question.create({
                    questionText: q.q,
                    options: q.o,
                    correctOptionIndex: q.a,
                    category: data.title,
                    difficulty: data.difficulty,
                    mediaUrl: q.mediaUrl || null,
                    mediaType: q.mediaUrl ? 'image' : 'none'
                });
                questionIds.push(newQ._id);
            }

            await Quiz.create({
                title: data.title,
                description: data.description,
                thumbnail: data.thumbnail,
                questions: questionIds,
                difficulty: data.difficulty,
                isPublic: true
            });
        }

        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
