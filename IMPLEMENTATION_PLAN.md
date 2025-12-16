# QuizStorm Implementation Plan (Working Document)

This document is a step-by-step execution guide. Update it as we complete each phase.

---

## Current Status

✅ **Backend scaffolding complete:**
- Express app running on port 4000
- MongoDB connected
- 10 sample questions seeded
- All models defined (User, Question, GameRoom, GameResult)
- Auth middleware + JWT signing
- REST routes for auth/game/questions
- Socket.IO initialized with JWT auth
- Game engine skeleton with all required events

❌ **Not yet done:**
- Test auth flow end-to-end
- Verify Socket.IO connections + events work
- Frontend React app
- Frontend pages + components
- Socket client wiring

---

## Phase 1: Finalize & Test Backend Auth + REST APIs

### 1.1 Auth Flow (REST)

**Register User**
```
POST /api/auth/register
Body: { username, email, password }
Response: { token, user: { id, username, email, totalScore } }
```

**Login User**
```
POST /api/auth/login
Body: { email, password }
Response: { token, user: { id, username, email, totalScore } }
```

**How JWT works:**
- Token is `sign(userId, username, email)` with 7-day expiry
- Frontend stores token in localStorage
- All protected requests: `Authorization: Bearer <token>`
- Socket.IO handshake: `socket.handshake.auth.token`

### 1.2 Game Setup Flow (REST + DB)

**Create Room (host)**
```
POST /api/game/create
Header: Authorization: Bearer <token>
Response: { roomCode, hostId, players, status: 'waiting', createdAt }
```
- Generates unique 6-char room code
- Host is first player
- Room saved to MongoDB

**Join Room (player)**
```
POST /api/game/join
Header: Authorization: Bearer <token>
Body: { roomCode }
Response: { roomCode, hostId, players, status: 'waiting', createdAt }
```
- Validates room exists + status is 'waiting'
- Adds player to room.players
- Broadcasts to WebSocket (handled in Socket.IO)

**Get Room (check state)**
```
GET /api/game/:roomCode
Header: Authorization: Bearer <token>
Response: { roomCode, hostId, players, status, currentQuestionIndex, createdAt }
```
- Frontend polls or uses REST for room state

### 1.3 Questions API (no answers leaked)

**Get Random Questions**
```
GET /api/questions/random?count=5
Header: Authorization: Bearer <token>
Response: { questions: [{ questionText, options, category, difficulty }] }
```
- **NO correctOptionIndex in response** (backend-only)
- Used for testing; actual gameplay uses Socket.IO

### 1.4 Socket.IO Auth + Game Events

**Connection (with JWT)**
```javascript
// Frontend
io('http://localhost:4000', {
  auth: { token: 'Bearer <jwt>' }
})

// Backend validates token in io.use() middleware
```

**Client → Server Events**
```
1. join-room { roomCode, userId, username }
   - Server adds socket to room
   - Emits player-joined to all in room

2. start-game { roomCode }
   - Only host can call
   - Loads 5 questions from DB
   - Status: waiting → live
   - Emits game-started + first new-question

3. submit-answer { roomCode, userId, selectedOptionIndex }
   - Server records answer
   - Validates before timer ends
   - First submission only
```

**Server → Client Events**
```
1. player-joined { username, totalPlayers, players }
   - Someone joined the room

2. game-started { roomCode }
   - Game has begun

3. new-question { questionIndex, questionText, options, timeLimit }
   - New question available
   - Options: array of 4 strings (NO correct index)

4. timer-update { timeRemaining }
   - Emitted every second
   - Frontend displays countdown
   - At 0: answers locked, scores computed

5. answer-result { userId, isCorrect, correctOptionIndex, pointsEarned }
   - Shows correct answer + how many points

6. score-update { leaderboard }
   - Updated scores: [{ userId, username, score }]

7. game-ended { winner, finalLeaderboard }
   - Game over; show results
```

### 1.5 Testing Backend Auth/Game (Manual)

**Test with curl or Postman:**

1. Register:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"pass123"}'
# Save token
```

2. Create room:
```bash
curl -X POST http://localhost:4000/api/game/create \
  -H "Authorization: Bearer <token>"
# Save roomCode
```

3. (Another user) Join room:
```bash
curl -X POST http://localhost:4000/api/game/join \
  -H "Authorization: Bearer <token2>" \
  -d '{"roomCode":"ABCDEF"}'
```

4. Get random questions (verify no answers leak):
```bash
curl -X GET "http://localhost:4000/api/questions/random?count=3" \
  -H "Authorization: Bearer <token>"
```

5. Socket.IO test:
   - Use a WebSocket client (e.g., Postman WebSocket, socket.io-client in Node)
   - Connect with auth token
   - Emit `join-room`, `start-game`, `submit-answer`
   - Verify events received

---

## Phase 2: Build Frontend React App

### 2.1 Frontend Folder Structure

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
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── services/
│   │   ├── api.js          # REST calls
│   │   └── socket.js       # Socket.IO client
│   │
│   ├── App.jsx
│   └── index.js
│
├── .env
└── package.json
```

### 2.2 Frontend Pages & What They Do

**Login Page**
- Form: email, password
- Calls `POST /api/auth/register` or `POST /api/auth/login`
- Stores JWT in localStorage
- Redirects to Lobby

**Lobby Page**
- Show: "Create Room" or "Join Room"
- Create: calls `POST /api/game/create`, gets roomCode
- Join: form input roomCode, calls `POST /api/game/join`
- Show list of players in room (poll `/api/game/:roomCode` every 2s OR use Socket)
- Host sees "Start Game" button
- Redirects to GameRoom when game starts (via socket `game-started` event)

**GameRoom Page**
- Receives socket events: `new-question`, `timer-update`, `answer-result`, `score-update`, `game-ended`
- Displays:
  - Question text + 4 option buttons
  - Timer (from server `timer-update`)
  - Leaderboard (from `score-update`)
- User clicks option → emits `submit-answer`
- Shows correct answer + points after timer ends
- Moves to next question automatically
- On `game-ended` → show Result page

**Result Page**
- Show final leaderboard
- Show winner
- Button to go back to Lobby

### 2.3 Frontend Services

**api.js**
```javascript
// REST API calls with JWT auth
export async function register(username, email, password) { ... }
export async function login(email, password) { ... }
export async function createRoom(token) { ... }
export async function joinRoom(token, roomCode) { ... }
export async function getRoom(token, roomCode) { ... }
export async function getRandomQuestions(token) { ... }
```

**socket.js**
```javascript
// Socket.IO client initialization
export function initSocket(token) {
  const socket = io('http://localhost:4000', {
    auth: { token }
  });
  return socket;
}

// Emit helpers
export function joinRoom(socket, roomCode, userId, username) {
  socket.emit('join-room', { roomCode, userId, username });
}

export function startGame(socket, roomCode) {
  socket.emit('start-game', { roomCode });
}

export function submitAnswer(socket, roomCode, userId, selectedOptionIndex) {
  socket.emit('submit-answer', { roomCode, userId, selectedOptionIndex });
}

// Event listeners
export function onPlayerJoined(socket, callback) {
  socket.on('player-joined', callback);
}
// ... etc
```

### 2.4 Frontend Context (Auth)

**AuthContext.jsx**
```javascript
// Stores: user, token, isLoggedIn
// Methods: register(), login(), logout()
// Syncs with localStorage
```

### 2.5 Frontend Components

**QuestionCard.jsx**
- Displays: questionText, 4 option buttons
- Props: question, onSelectOption, isAnswered, correctIndex

**OptionButton.jsx**
- Button for each option
- Shows if selected/disabled
- Shows if correct/incorrect after answer locked

**Timer.jsx**
- Props: timeRemaining (from socket)
- Displays countdown
- Color changes (green → yellow → red) as time runs out

**ScoreBoard.jsx**
- Props: leaderboard (from socket)
- Displays: [{ username, score }] sorted by score

---

## Phase 3: Backend + Frontend Integration Tests

### 3.1 Full Gameplay Test (Manual)

1. Start backend: `npm run dev` (in `backend/`)
2. Start frontend: `npm start` (in `frontend/`)
3. Open browser: `http://localhost:3000`

**Test steps:**
1. Register 2 users (alice, bob)
2. Alice creates room → gets roomCode
3. Bob joins with same roomCode
4. Room shows both players
5. Alice clicks "Start Game"
6. Both see first question + 20-second timer
7. Alice + Bob click options
8. Timer hits 0 → scores update
9. Next question appears (4 more times)
10. After 5 questions → results page
11. Verify leaderboard + winner

### 3.2 Edge Cases to Test

- [ ] Join non-existent room (error)
- [ ] Start game if not host (error)
- [ ] Submit answer after timer (locked)
- [ ] Disconnect mid-game (player stays, just no socket)
- [ ] Two players submit same answer (both scored)
- [ ] Re-join same room (socket re-connects)

---

## Execution Order (Next Steps)

### Step 1: Test Backend Auth + REST (Manual)
- Use curl/Postman to verify register, login, create room, join room
- Verify JWT works
- Verify room state in MongoDB

### Step 2: Create Frontend Scaffold
- `npx create-react-app frontend`
- Create folder structure (pages, components, services, context)
- Install socket.io-client, axios (or fetch)

### Step 3: Build Auth Pages + Context
- AuthContext (login/register)
- Login page
- Persist JWT to localStorage
- Redirect to Lobby

### Step 4: Build Game Setup Pages
- Lobby (create/join room)
- Show room state + players
- Host-only "Start Game" button

### Step 5: Build Game Room Page
- Listen to socket events (new-question, timer-update, answer-result, score-update)
- Display question + options
- Display timer
- Display leaderboard
- Emit submit-answer on option click

### Step 6: Build Result Page
- Display final leaderboard + winner
- "Back to Lobby" button

### Step 7: Full Integration Test
- Run both backend + frontend
- Test 2-player gameplay end-to-end

### Step 8: Polish & Edge Cases
- Error messages
- Loading states
- Disconnection handling
- UI styling (keep MVP simple)

---

## Notes

- **Backend auth is done.** Socket.IO auth is in place. All we need is REST + Socket tests.
- **Questions are seeded.** 10 sample questions in MongoDB ready to go.
- **Timer is server-only.** Frontend just displays what backend sends.
- **Scores are backend-only.** Frontend only renders them.
- **MVP scope:** Just make it work. No fancy UI, no animations.

---

**Last Updated:** December 15, 2025
