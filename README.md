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

## 📋 Frontend Responsibilities

### Frontend MUST:

- ✅ Render questions, options, timer, scores
- ✅ Emit answer submissions
- ✅ Handle and display socket events
- ✅ Manage UI state (which button is pressed, loading states)
- ✅ Show leaderboard at end

### Frontend MUST NOT:

- ❌ Calculate scores
- ❌ Decide if answer is correct
- ❌ Control the timer
- ❌ Validate game logic
- ❌ Determine question order

---

## 📋 Backend Responsibilities

### Backend MUST:

- ✅ Generate and manage game questions
- ✅ Control question order and timing
- ✅ Run the authoritative timer
- ✅ Validate all answers
- ✅ Calculate scores correctly
- ✅ Manage game state transitions
- ✅ Broadcast state to all players
- ✅ Persist game results to MongoDB

### Backend MUST NOT:

- ❌ Trust frontend timer
- ❌ Trust frontend answer validation
- ❌ Accept score calculations from frontend
- ❌ Allow players to advance beyond their turn

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

## 📝 Coding Guidelines

When generating code:

1. **Follow folder structure strictly** – No exceptions
2. **Keep logic simple and readable** – Prefer clarity over cleverness
3. **Add comments explaining intent** – Especially in socket handlers
4. **Validate on backend always** – Never trust frontend
5. **Use consistent error handling** – All sockets emit errors gracefully

### Code Style Checklist

- ✅ Use ES6+ (async/await, destructuring, arrow functions)
- ✅ Meaningful variable names
- ✅ Comments on complex logic
- ✅ No magic numbers (use constants)
- ✅ Proper error handling with try/catch
- ✅ Log important events on backend

---

## 🔒 Security Considerations

- ✅ JWT authentication on all protected routes
- ✅ Socket.IO middleware to verify JWT on connection
- ✅ Backend validates ALL user input
- ✅ Backend never trusts frontend timers or scores
- ✅ Rate limiting on socket events (optional for MVP)
- ✅ Sanitize database queries

---

## ✅ MVP Scope (What to Build)

**Phase 1 – Core Gameplay:**

- User registration & login
- Room creation & joining
- Questions with 4 options
- Real-time question delivery
- Timer system (15-30 seconds per question)
- Score calculation
- Simple leaderboard
- Game result persistence

**Phase 2+ – Future Enhancements (OUT OF SCOPE):**

- Question categories/difficulty filters
- Multiplayer spectator mode
- Question difficulty ranking
- Replay/analysis mode
- Social features (friend lists, etc.)
- Mobile app

---

## ❌ What NOT to Do

- ❌ Don't use production frameworks (like NextAuth, stripe, etc.)
- ❌ Don't optimize prematurely (no caching, CDN, clustering)
- ❌ Don't add unnecessary features
- ❌ Don't create complex abstractions for reusability
- ❌ Don't use TypeScript (keep it simple with JavaScript)
- ❌ Don't add multiple databases
- ❌ Don't implement features you can't explain

---

## 📚 Key Principles to Remember

1. **Backend is King** – All game logic lives there
2. **Real-Time First** – Use Socket.IO, not REST for gameplay
3. **Clear Events** – Each socket event has a clear purpose
4. **Fail Gracefully** – Handle disconnections, timeouts, edge cases
5. **Log Everything** – Backend should log important events
6. **Test Manually** – Simulate multiple players, network delays
7. **Lean & Mean** – MVP first, features later

---

## 🆘 Common Pitfalls to Avoid

| Pitfall                            | Why Bad                    | Solution                                     |
| ---------------------------------- | -------------------------- | -------------------------------------------- |
| Frontend calculates timer          | Out of sync across players | Timer only on backend, emitted to frontend   |
| REST API checks answers            | Cheating possible          | Answer validation ONLY on backend via Socket |
| Score stored in frontend state     | Can be manipulated         | Store scores on backend, only render them    |
| No validation of socket data       | Broken game logic          | Always re-validate user input on backend     |
| Tight coupling of frontend/backend | Hard to change             | Clear event contracts, versioned API         |

---

## 📞 Questions During Development

**If unsure about a feature, ask yourself:**

1. Is this critical to demonstrate the core concept?
2. Can it be done with existing architecture?
3. Does it violate any design principles?
4. Can I explain it clearly to someone?

If the answer to #1 is "no", skip it for MVP.

---

## 📄 License

Academic project – open source for educational purposes.

---

**Last Updated:** December 15, 2025

---

_This README serves as the single source of truth for QuizStorm architecture and requirements. All code should align with this specification._

---

## ✅ Implementation Plan (Next Steps + Execution Order)

This section is the step-by-step plan we will follow. The goal is to build **backend first**, then build the frontend against stable REST + Socket contracts.

### Phase A — Backend (Authoritative)

1. **Scaffold backend structure** (folders + entrypoints)

- Ensure `backend/server.js` boots Express and Socket.IO
- Ensure `backend/src/app.js` mounts REST routes
- Outcome: backend starts and serves `/health`

2. **MongoDB models (Mongoose)**

- Create: `User`, `Question`, `GameRoom`, `GameResult`
- Outcome: canonical schema exists exactly as defined in this README

3. **JWT authentication (REST)**

- Implement `POST /api/auth/register` and `POST /api/auth/login`
- Add `auth.middleware.js` for protected routes
- Outcome: login returns JWT; protected endpoints require `Authorization: Bearer <token>`

4. **Game setup REST APIs (NO gameplay logic here)**

- Implement:
  - `POST /api/game/create`
  - `POST /api/game/join`
  - `GET /api/game/:roomCode`
- Outcome: rooms can be created/joined; DB persists room membership

5. **Questions REST API (NO correct answer leakage)**

- Implement `GET /api/questions/random`
- Outcome: returns questions **without** `correctOptionIndex`

6. **Socket.IO initialization + auth**

- Validate JWT during socket handshake (backend authoritative)
- Outcome: only authenticated sockets can connect

7. **Socket.IO game engine (ALL real-time gameplay here)**

- Implement events:
  - Client → Server: `join-room`, `submit-answer`
  - Server → Client: `player-joined`, `game-started`, `new-question`, `timer-update`, `answer-result`, `score-update`, `game-ended`
- Timer is backend-only:
  - emit `timer-update` every second
  - lock answers at 0
  - score + advance questions
- Outcome: deterministic multiplayer flow driven by server state

8. **Local sanity checks**

- Start backend with `npm run dev`
- Verify `/health`
- Verify auth + create/join room
- Verify sockets connect with JWT and timer ticks

### Phase B — Frontend (Renderer)

9. **React scaffold + API client**

- Implement Auth context and `services/api.js`

10. **Socket client + pages/components**

- Pages: `Login`, `Lobby`, `GameRoom`, `Result`
- Components: `QuestionCard`, `OptionButton`, `Timer`, `ScoreBoard`
- Outcome: frontend only renders server state and emits user actions

### Phase C — Adjustments / Polish

11. **Edge cases (MVP-safe)**

- Disconnections (simple handling)
- Host-only start (if needed)
- Basic validations and user feedback

---
