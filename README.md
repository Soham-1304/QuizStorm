# QuizStorm – Real-Time Multiplayer Trivia Game

An academic MERN stack project demonstrating real-time synchronization, backend-authoritative game logic, and clean separation of concerns in a multiplayer game platform.

---

## 🎯 Project Overview

QuizStorm is **NOT** a production-grade system, but a clean, well-architected MVP that demonstrates:

- ✅ Real-time WebSocket synchronization
- ✅ Backend-authoritative game logic
- ✅ Clean separation of frontend, backend, and socket layers
- ✅ Practical use of MongoDB, Express, React, and Socket.IO
- ✅ How latency-sensitive multiplayer games handle state using WebSockets

### Core Philosophy

**The backend is AUTHORITATIVE.** It controls:

- Question order and content
- Game timer (runs server-side)
- Answer validation
- Score calculation
- All authoritative state transitions

The frontend is a **dumb renderer** that:

- Displays state sent by backend
- Emits user actions
- Never calculates scores or timers

---

## 🛠 Technology Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| **Frontend** | React.js, Socket.IO Client, CSS                    |
| **Backend**  | Node.js, Express.js, Socket.IO                     |
| **Database** | MongoDB (Mongoose), In-memory state for live games |
| **Auth**     | JWT                                                |

---

## 🏗 System Architecture

```
React Client  ── REST ──▶ Express API ──▶ MongoDB
     ▲                         │
     │                         │
     └────── Socket.IO ◀───────┘
         (Game State & Timer)
```

**Data Flow:**

- **REST APIs**: Authentication, room setup, question fetch
- **Socket.IO**: Game lifecycle, real-time events, timer updates, answer validation

---

## 📁 Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── socket.js        # Socket.IO initialization
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── GameRoom.js
│   │   └── GameResult.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── game.routes.js
│   │   └── question.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── game.controller.js
│   │   └── question.controller.js
│   │
│   ├── sockets/
│   │   └── game.socket.js   # ALL real-time game logic lives here
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   │
│   └── app.js
│
├── server.js
└── package.json
```

---

## 📁 Frontend Folder Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Lobby.jsx
│   │   ├── GameRoom.jsx
│   │   └── Result.jsx
│   │
│   ├── components/
│   │   ├── QuestionCard.jsx
│   │   ├── OptionButton.jsx
│   │   ├── Timer.jsx
│   │   └── ScoreBoard.jsx
│   │
│   ├── socket/
│   │   └── socket.js
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   └── App.jsx
```

---

## 📊 MongoDB Data Models

### User

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  totalScore: Number,
  createdAt: Date
}
```

### Question

```javascript
{
  _id: ObjectId,
  questionText: String,
  options: [String],          // e.g., ["Option A", "Option B", "Option C", "Option D"]
  correctOptionIndex: Number, // 0-3
  category: String,
  difficulty: String,         // "easy", "medium", "hard"
}
```

### GameRoom

```javascript
{
  _id: ObjectId,
  roomCode: String,           // Unique identifier visible to players
  hostId: ObjectId,           // Reference to User
  players: [
    {
      userId: ObjectId,
      username: String,
      score: Number,
      joinedAt: Date
    }
  ],
  currentQuestionIndex: Number,
  status: String,             // "waiting", "live", "finished"
  createdAt: Date
}
```

### GameResult (Optional for MVP)

```javascript
{
  _id: ObjectId,
  roomCode: String,
  players: Array,             // Final scores
  winner: ObjectId,
  playedAt: Date
}
```

---

## 🔌 REST API Specification

### Authentication

| Method | Endpoint             | Purpose           |
| ------ | -------------------- | ----------------- |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login`    | Login and get JWT |

### Game Setup

| Method | Endpoint              | Purpose                |
| ------ | --------------------- | ---------------------- |
| `POST` | `/api/game/create`    | Create a new game room |
| `POST` | `/api/game/join`      | Join an existing room  |
| `GET`  | `/api/game/:roomCode` | Fetch room details     |

### Questions

| Method | Endpoint                | Purpose                |
| ------ | ----------------------- | ---------------------- |
| `GET`  | `/api/questions/random` | Fetch random questions |

### ⚠️ REST APIs MUST NOT:

- ❌ Handle timers
- ❌ Check answers
- ❌ Update scores
- ❌ Manage game state transitions

---

## 🔌 Socket.IO Event Specification

### Client → Server Events

```javascript
// Join a game room
socket.emit("join-room", {
  roomCode: String,
  userId: String,
  username: String,
});

// Submit an answer
socket.emit("submit-answer", {
  roomCode: String,
  userId: String,
  selectedOptionIndex: Number,
  timeRemaining: Number,
});
```

### Server → Client Events

```javascript
// New player joined
socket.on("player-joined", {
  username: String,
  totalPlayers: Number,
  players: Array,
});

// Host started the game
socket.on("game-started", {
  roomCode: String,
});

// New question sent to players
socket.on("new-question", {
  questionIndex: Number,
  questionText: String,
  options: [String],
  timeLimit: Number,
});

// Timer tick update
socket.on("timer-update", {
  timeRemaining: Number, // seconds
});

// Answer validation result
socket.on("answer-result", {
  userId: String,
  isCorrect: Boolean,
  correctOptionIndex: Number,
  pointsEarned: Number,
});

// Score update
socket.on("score-update", {
  leaderboard: [{ userId, username, score }],
});

// Game finished
socket.on("game-ended", {
  winner: { userId, username, score },
  finalLeaderboard: Array,
});
```

---

## ⏱ Timer Rules (Critical)

1. **Timer runs ONLY on backend** – Never on frontend
2. **Backend emits `timer-update` every second** with remaining time
3. **When timer hits zero:**
   - Lock all answer submissions
   - Compute scores for this question
   - Emit `answer-result` for all players
   - Emit `score-update` with new leaderboard
   - Move to next question or end game
4. **Frontend just displays the timer** received from backend

---

## 🎮 Gameplay Flow (End-to-End)

1. **User logs in** via `/api/auth/login` → receives JWT
2. **User creates or joins room** via REST API (`/api/game/create` or `/api/game/join`)
3. **Frontend establishes Socket.IO connection** with auth token
4. **Other players join** → backend emits `player-joined` events
5. **Host clicks "Start Game"** → backend initializes game
6. **Backend emits first question** + 30-second timer
7. **Players submit answers** via `submit-answer` event
8. **Timer hits zero** → backend validates all answers, updates scores
9. **Backend emits `answer-result`** + correct answer reveal
10. **Backend emits next question** or `game-ended` if done
11. **Game finishes** → display leaderboard and results

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/quizstorm" > .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "PORT=5000" >> .env

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000" > .env
echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> .env

npm start
```

---
