const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');
const Question = require('../src/models/Question');
require('dotenv').config();

const QUIZZES = [
    // 0. Showcase - Full Project Architecture (Viva Level)
    {
        title: 'QuizStorm Architecture ⛈️',
        description: 'System Design & Scalability. Viva-ready questions.',
        thumbnail: '🏗️',
        difficulty: 'hard',
        questions: [
            { q: "How do we prevent a Race Condition where two users answer at the exact same millisecond?", o: ["We can't", "By using a magical mutex", "Node.js Event Loop processes events sequentially 🧵", "By blocking the database"], a: 2, mediaType: 'none' },
            { q: "Answer Locking: Why must the SERVER also check if an answer is locked?", o: ["Because logic is copy-pasted", "Never trust the client; verify inputs shield 🕵️‍♂️", "To save bandwidth", "Client might be offline"], a: 1, mediaType: 'none' },
            { q: "Why did we choose a 'Hybrid' Flow (Timer vs Manual)?", o: ["To accommodate competitive & instructional modes ⏱️", "We couldn't decide", "Timers are buggy", "Complexity for fun"], a: 0, mediaType: 'none' },
            { q: "What is the algorithmic complexity of our Leaderboard sort?", o: ["O(1)", "O(n)", "O(n log n) 📉", "O(n^2)"], a: 2, mediaType: 'none' },
            { q: "If we migrated to Microservices, which component moves first?", o: ["CSS", "Frontend", "Game Engine (Socket Server) 🧩", "User Profile"], a: 2, mediaType: 'none' }
        ]
    },
    // 0. Showcase - Frontend (React & Vite)
    {
        title: 'Frontend Fury 🎨',
        description: 'React Internals, Hooks, and Performance.',
        thumbnail: '⚛️',
        difficulty: 'hard',
        questions: [
            { q: "Why use `useCallback` for `submitAnswer` in Context?", o: ["Prevent function recreation on render 🧠", "Run faster", "Socket requirement", "Allow async"], a: 0, mediaType: 'none' },
            { q: "Why is `Timer` wrapped in `React.memo`?", o: ["Fix CSS bug", "Prevent re-renders on parent state change ⚡️", "Access global clock", "Not necessary"], a: 1, mediaType: 'none' },
            { q: "How does Vite's HMR differ from Webpack?", o: ["Rebuilds whole bundle", "Swaps changed ES modules instantly 🚀", "Requires restart", "Slower but safer"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Vitejs-logo.svg/800px-Vitejs-logo.svg.png' },
            { q: "Purpose of `useEffect` dependency array `[socket]`?", o: ["Run once", "Run every loop", "Re-run only when socket changes 🔄", "Disconnect user"], a: 2, mediaType: 'none' },
            { q: "When would you choose `useLayoutEffect`?", o: ["Incorrect measurements", "Update DOM synchronously before paint 👁️", "Async data fetching", "Standard logic"], a: 1, mediaType: 'none' }
        ]
    },
    // 0. Showcase - Backend (Node & System)
    {
        title: 'Backend Brains ⚙️',
        description: 'Event Loop, Sockets, and Database Design.',
        thumbnail: '🧠',
        difficulty: 'hard',
        questions: [
            { q: "Trade-off of storing `liveGames` in-memory (Map)?", o: ["Too slow", "Hard to scale horizontally (Statelessness) ⚖️", "CPU intensive", "Maps can't store Objects"], a: 1, mediaType: 'none' },
            { q: "Why use `io.to(room).emit` vs `socket.emit`?", o: ["Deprecated", "Server-only", "Broadcast to ALL clients in room 📢", "Faster"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Socket-io.svg/800px-Socket-io.svg.png' },
            { q: "Relationship between Question and Quiz schema?", o: ["Embedded", "Referenced Documents (ObjectId) 🔗", "SQL Tables", "None"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/800px-MongoDB_Logo.svg.png' },
            { q: "What handles late answers (after timer)?", o: ["Client crash", "Server rejects via `acceptingAnswers` check 🛡️", "Accepted with 0 pts", "Timer resets"], a: 1, mediaType: 'none' },
            { q: "Role of `authMiddleware` in handshake?", o: ["Verify JWT token before connection 🔑", "Encrypt stream", "Route to port", "Save to DB"], a: 0, mediaType: 'none' }
        ]
    },
    // 1. Coding - JavaScript
    {
        title: 'JavaScript Jujutsu 🥋',
        description: 'Master the arts of the web. Type coercion, closures, and ES6+.',
        thumbnail: '⚡',
        difficulty: 'hard',
        questions: [
            { q: "What is `typeof NaN`?", o: ["'number'", "'NaN'", "'undefined'", "'object'"], a: 0, mediaType: 'none' },
            { q: "What is the result of `[] + []`?", o: ["'' (Empty String)", "'[object Object]'", "0", "undefined"], a: 0, mediaType: 'none' },
            { q: "Which React hook handles side effects?", o: ["useState", "useEffect", "useReducer", "useContext"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png' },
            { q: "Output of `console.log(0.1 + 0.2 === 0.3)`?", o: ["true", "false", "undefined", "NaN"], a: 1, mediaType: 'none' },
            { q: "Which method adds an element to the end of an array?", o: ["push()", "pop()", "shift()", "unshift()"], a: 0, mediaType: 'none' },
            { q: "What does `===` check?", o: ["Value only", "Value and Type", "Type only", "Reference"], a: 1, mediaType: 'none' },
            { q: "Which symbol is used for IDs in CSS?", o: [".", "#", "$", "@"], a: 1, mediaType: 'none' },
            { q: "Who created JavaScript?", o: ["Brendan Eich", "Bill Gates", "Tim Berners-Lee", "Mark Zuckerberg"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Brendan_Eich_Mozilla_Foundation_official_photo.jpg' },
            { q: "What is a Closure?", o: ["Function inside function", "Block scope", "Global variable", "Loop"], a: 0, mediaType: 'none' },
            { q: "Which of these is NOT a valid variable declaration?", o: ["var", "let", "const", "set"], a: 3, mediaType: 'none' }
        ]
    },
    // 2. Entertainment - Bollywood
    {
        title: 'Bollywood Bonanza 🎬',
        description: 'From classic dialogues to blockbusters. Are you a true filmy fan?',
        thumbnail: '🎥',
        difficulty: 'medium',
        questions: [
            { q: "Who is known as the 'King of Romance'?", o: ["Salman Khan", "Shah Rukh Khan", "Aamir Khan", "Akshay Kumar"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg/800px-Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg' },
            { q: "Complete the dialogue: 'Mogambo ______'", o: ["Khush Hua", "Gussa Aaya", "Ro Diya", "So Gaya"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/2/23/Mr._India_%281987_film_poster%29.jpg' },
            { q: "Who directed '3 Idiots'?", o: ["Karan Johar", "Rajkumar Hirani", "Sanjay Leela Bhansali", "Rohit Shetty"], a: 1, mediaType: 'none' },
            { q: "Which movie features the song 'Naatu Naatu'?", o: ["Baahubali", "Pushpa", "RRR", "KGF"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg' },
            { q: "In 'Sholay', what was the name of the villain?", o: ["Kaalia", "Gabbar Singh", "Shakaal", "Mogambo"], a: 1, mediaType: 'none' },
            { q: "The 'Dhak Dhak' girl of Bollywood is...", o: ["Sridevi", "Juhi Chawla", "Madhuri Dixit", "Kajol"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Madhuri_Dixit_promoting_Total_Dhamaal_in_2019.jpg/800px-Madhuri_Dixit_promoting_Total_Dhamaal_in_2019.jpg' },
            { q: "Year DDLJ was released?", o: ["1990", "1995", "1998", "2000"], a: 1, mediaType: 'none' },
            { q: "Who played 'Geet' in Jab We Met?", o: ["Deepika Padukone", "Kareena Kapoor", "Katrina Kaif", "Priyanka Chopra"], a: 1, mediaType: 'none' },
            { q: "First Indian Sound Movie?", o: ["Raja Harishchandra", "Alam Ara", "Mother India", "Mughal-e-Azam"], a: 1, mediaType: 'none' },
            { q: "Identify this actor.", o: ["Ranbir Kapoor", "Ranveer Singh", "Varun Dhawan", "Sidharth Malhotra"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ranveer_Singh_promoting_Befikre_in_2016.jpg/800px-Ranveer_Singh_promoting_Befikre_in_2016.jpg' }
        ]
    },
    // 3. Geography - Travel
    {
        title: 'World Traveler 🌍',
        description: 'Pack your bags! Can you identify these famous places?',
        thumbnail: '✈️',
        difficulty: 'medium',
        questions: [
            { q: "Where is the Eiffel Tower located?", o: ["London", "Rome", "Paris", "Berlin"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/800px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg' },
            { q: "Which country is home to the Taj Mahal?", o: ["Pakistan", "Bangladesh", "India", "Nepal"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg' },
            { q: "This statue is in which city?", o: ["New York", "Washington DC", "Los Angeles", "Chicago"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/800px-Statue_of_Liberty_7.jpg' },
            { q: "What is the capital of Japan?", o: ["Osaka", "Kyoto", "Tokyo", "Seoul"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/800px-Skyscrapers_of_Shinjuku_2009_January.jpg' },
            { q: "Where can you find the Pyramids of Giza?", o: ["Mexico", "Egypt", "Peru", "Sudan"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/800px-Kheops-Pyramid.jpg' },
            { q: "Machu Picchu is in...", o: ["Chile", "Brazil", "Peru", "Argentina"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/800px-Machu_Picchu%2C_Peru.jpg' },
            { q: "Which city is known for its canals?", o: ["Amsterdam", "Venice", "Both", "None"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Venice_%2827721598762%29.jpg/800px-Venice_%2827721598762%29.jpg' },
            { q: "The Great Barrier Reef is off the coast of...", o: ["Australia", "Florida", "Maldives", "Thailand"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Coral_Outcrop_Flynn_Reef.jpg/800px-Coral_Outcrop_Flynn_Reef.jpg' },
            { q: "Christ the Redeemer overlooks which city?", o: ["Lima", "Rio de Janeiro", "Buenos Aires", "Bogota"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Rio_de_Janeiro%2C_Brazil.jpg/800px-Christ_the_Redeemer_-_Rio_de_Janeiro%2C_Brazil.jpg' },
            { q: "Identify this famous bridge.", o: ["Golden Gate", "Tower Bridge", "Brooklyn Bridge", "Sydney Harbour"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateBridge-001.jpg/800px-GoldenGateBridge-001.jpg' }
        ]
    },
    // 4. General - Logos
    {
        title: 'Brand Masters 🏦',
        description: 'Guess the brand from the logo. A visual quiz.',
        thumbnail: '🎨',
        difficulty: 'easy',
        questions: [
            { q: "Which brand is this?", o: ["Nike", "Adidas", "Puma", "Reebok"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/800px-Logo_NIKE.svg.png' },
            { q: "Name this fast food giant.", o: ["KFC", "Burger King", "McDonald's", "Wendy's"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/800px-McDonald%27s_Golden_Arches.svg.png' },
            { q: "Which tech company uses this apple?", o: ["Apple", "Samsung", "Dell", "HP"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png' },
            { q: "Who owns this bird logo?", o: ["Facebook", "Twitter / X", "Snapchat", "TikTok"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/800px-Logo_of_Twitter.svg.png' },
            { q: "Identify the car brand.", o: ["Ferrari", "Porsche", "Lamborghini", "Mustang"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Ferrari-Logo.svg/800px-Ferrari-Logo.svg.png' },
            { q: "This mascot belongs to...", o: ["Android", "Linux", "Duolingo", "Reddit"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/800px-Android_robot.svg.png' },
            { q: "Coffee anyone?", o: ["Costa", "Starbucks", "Dunkin", "Tim Hortons"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/800px-Starbucks_Corporation_Logo_2011.svg.png' },
            { q: "Which superhero is this?", o: ["Superman", "Batman", "Spider-Man", "Flash"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/The_Dark_Knight_Logo.svg/800px-The_Dark_Knight_Logo.svg.png' },
            { q: "Which social app is this?", o: ["Instagram", "Snapchat", "Pinterest", "WhatsApp"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/800px-Instagram_logo_2016.svg.png' },
            { q: "Search engine giant.", o: ["Yahoo", "Bing", "Google", "DuckDuckGo"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/800px-Google_2015_logo.svg.png' }
        ]
    },
    // 5. Tech - History
    {
        title: 'Tech History 🏛️',
        description: 'Know your roots. Founders, inventions, and dates.',
        thumbnail: '💾',
        difficulty: 'medium',
        questions: [
            { q: "Who is considered the 'Father of the Computer'?", o: ["Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Charles_Babbage_-_1860.jpg/800px-Charles_Babbage_-_1860.jpg' },
            { q: "Who co-founded Microsoft?", o: ["Mark Zuckerberg", "Jeff Bezos", "Bill Gates", "Elon Musk"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bill_Gates_in_2012_cropped.jpg/800px-Bill_Gates_in_2012_cropped.jpg' },
            { q: "What year was the first iPhone released?", o: ["2005", "2007", "2008", "2010"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/IPhone_2G_PSD_Mockup.png/800px-IPhone_2G_PSD_Mockup.png' },
            { q: "Who invented the World Wide Web?", o: ["Tim Berners-Lee", "Vint Cerf", "Larry Page", "Steve Wozniak"], a: 0, mediaType: 'none' },
            { q: "Who is widely considered the first programmer?", o: ["Grace Hopper", "Ada Lovelace", "Margaret Hamilton", "Katherine Johnson"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/800px-Ada_Lovelace_portrait.jpg' }
        ]
    },
    // 6. Lifestyle - Food
    {
        title: 'Foodie\'s Paradise 🍕',
        description: 'Yum! Guess the dish and its origin.',
        thumbnail: '🌮',
        difficulty: 'easy',
        questions: [
            { q: "Which country is famous for Sushi?", o: ["China", "Thailand", "Japan", "Korea"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/800px-Sushi_platter.jpg' },
            { q: "Where does Pizza originate from?", o: ["USA", "France", "Italy", "Spain"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/800px-Eq_it-na_pizza-margherita_sep2005_sml.jpg' },
            { q: "Main ingredient in Guacamole?", o: ["Tomato", "Onion", "Avocado", "Pepper"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Guacomole.jpg/800px-Guacomole.jpg' },
            { q: "Identify this spicy rice dish.", o: ["Fried Rice", "Biryani", "Risotto", "Paella"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Chicken_Biryani.JPG/800px-Chicken_Biryani.JPG' },
            { q: "Tacos are a traditional dish from...", o: ["Brazil", "Mexico", "Cuba", "Argentina"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/001_Tacos_de_carnitas%2C_carne_asada_y_al_pastor.jpg/800px-001_Tacos_de_carnitas%2C_carne_asada_y_al_pastor.jpg' }
        ]
    },
    // 7. Coding - Python
    {
        title: 'Python Prestige 🐍',
        description: 'Snake your way to victory. Lists, loops, and libs.',
        thumbnail: '🖥️',
        difficulty: 'medium',
        questions: [
            { q: "What file extension implies a Python script?", o: [".java", ".py", ".js", ".cpp"], a: 1, mediaType: 'none' },
            { q: "Keyword to define a function?", o: ["func", "function", "def", "lambda"], a: 2, mediaType: 'none' },
            { q: "Are Lists in Python mutable?", o: ["Yes", "No", "Sometimes", "Only if integer"], a: 0, mediaType: 'none' },
            { q: "Which library is popular for Data Science?", o: ["React", "Pandas", "jQuery", "Laravel"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Pandas_logo.svg/800px-Pandas_logo.svg.png' },
            { q: "Output of `print('Hi' * 3)`?", o: ["Hi3", "HiHiHi", "Error", "Hi Hi Hi"], a: 1, mediaType: 'none' }
        ]
    },
    // 8. Geography - Flags
    {
        title: 'Flags of the World 🏳️',
        description: 'Vexillology time. Name the country!',
        thumbnail: '⛳',
        difficulty: 'hard',
        questions: [
            { q: "Identify this flag.", o: ["USA", "UK", "Australia", "Liberia"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png' },
            { q: "Which country's flag is this?", o: ["France", "Italy", "Ireland", "India"], a: 3, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/800px-Flag_of_India.svg.png' },
            { q: "Red circle on white background.", o: ["Bangladesh", "Japan", "Palau", "Greenland"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/800px-Flag_of_Japan.svg.png' },
            { q: "Identify this maple leaf.", o: ["Canada", "USA", "Mexico", "Peru"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/800px-Flag_of_Canada_%28Pantone%29.svg.png' },
            { q: "Green, Yellow, Blue.", o: ["Argentina", "Brazil", "Colombia", "Sweden"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/800px-Flag_of_Brazil.svg.png' },
            { q: "Union Jack.", o: ["UK", "Australia", "New Zealand", "Fiji"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/800px-Flag_of_the_United_Kingdom.svg.png' },
            { q: "Black, Red, Gold.", o: ["Germany", "Belgium", "France", "Netherlands"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/800px-Flag_of_Germany.svg.png' },
            { q: "Which flag is this?", o: ["North Korea", "South Korea", "China", "Vietnam"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/800px-Flag_of_South_Korea.svg.png' },
            { q: "White cross on red.", o: ["Denmark", "Switzerland", "Norway", "Finland"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Switzerland.svg/800px-Flag_of_Switzerland.svg.png' },
            { q: "Rainbow nation.", o: ["Kenya", "South Africa", "Nigeria", "Ghana"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Flag_of_South_Africa.svg/800px-Flag_of_South_Africa.svg.png' }
        ]
    },
    // 9. Science
    {
        title: 'Science & Space 🚀',
        description: 'To infinity and beyond! Physics, Biology, and Astronomy.',
        thumbnail: '🧪',
        difficulty: 'medium',
        questions: [
            { q: "Which planet is the Red Planet?", o: ["Venus", "Mars", "Jupiter", "Saturn"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/800px-OSIRIS_Mars_true_color.jpg' },
            { q: "Hardest natural substance on Earth?", o: ["Gold", "Iron", "Diamond", "Platinum"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Rough_Diamond.jpg/800px-Rough_Diamond.jpg' },
            { q: "Powerhouse of the cell?", o: ["Nucleus", "Ribosome", "Mitochondria", "Cytoplasm"], a: 2, mediaType: 'none' },
            { q: "Atomic symbol for Gold?", o: ["Ag", "Au", "Fe", "Go"], a: 1, mediaType: 'none' },
            { q: "Approximate speed of light?", o: ["300,000 km/s", "150,000 km/s", "1,000 km/s", "Infinite"], a: 0, mediaType: 'none' }
        ]
    },
    // 10. Fun - Memes
    {
        title: 'The Meme Exam 🐸',
        description: 'Are you chronically online? Prove it.',
        thumbnail: '😂',
        difficulty: 'easy',
        questions: [
            { q: "What breed of dog is Doge?", o: ["Pug", "Golden Retriever", "Shiba Inu", "Husky"], a: 2, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Original_Doge_meme.jpg' },
            { q: "Who is this?", o: ["Grumpy Cat", "Happy Cat", "Sad Cat", "Angry Cat"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Grumpy_Cat_by_Gage_Skidmore.jpg/800px-Grumpy_Cat_by_Gage_Skidmore.jpg' },
            { q: "This kid is known as...", o: ["Disaster Girl", "Success Kid", "Bad Luck Brian", "Scumbag Steve"], a: 1, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/f/ff/SuccessKid.jpg' },
            { q: "What does this dog say?", o: ["This is fine", "Help", "Everything is okay", "Fire!"], a: 0, mediaType: 'image', mediaUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/This_is_fine_original_2016_comic_strip.jpg' },
            { q: "Bonus Video Question!", o: ["Rick Rolling", "Dancing Baby", "Numa Numa", "Chocolate Rain"], a: 0, mediaType: 'video', mediaUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' }
        ]
    }
];

async function seed() {
    try {
        // Load env vars if not already loaded (e.g. if running from a different directory)
        // Adjust path if necessary or rely on pre-loaded env

        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizstorm';
        console.log('Connecting to:', uri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Localhost');

        await mongoose.connect(uri);
        console.log('🌱 Connected to MongoDB');

        await Quiz.deleteMany({});
        await Question.deleteMany({});

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
                    mediaType: q.mediaType || 'none'
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
