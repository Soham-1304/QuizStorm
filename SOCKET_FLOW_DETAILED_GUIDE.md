# Socket.IO Complete Flow - QuizStorm Deep Dive

## 🔐 Where Does `socket.handshake?.auth?.token` Come From?

### **The Frontend Connection (Client Side)**

When the frontend connects to Socket.IO, it sends the JWT token during the **handshake**:

```javascript
// Frontend: React/HTML/JavaScript
const token = localStorage.getItem('jwtToken');  // Get token from login

const socket = io('http://localhost:5000', {
  auth: {
    token: token  // ← This is where handshake.auth.token comes from!
  }
});
```

### **The Backend Receives It (Server Side)**

```javascript
// Backend: src/config/socket.js
io.use((socket, next) => {
  // socket.handshake.auth.token ← Contains the token from frontend!
  const token = socket.handshake?.auth?.token;
  
  if (!token) return next(new Error('Missing auth token'));
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.user = decoded;  // Attach user info to socket
  next();
});
```

### **Breakdown:**

| Part | What It Is | Example Value |
|------|------------|---------------|
| `socket` | The connected client's socket instance | `Socket {id: 'abc123'}` |
| `handshake` | Connection metadata object | `{auth: {...}, headers: {...}}` |
| `auth` | Custom authentication data from client | `{token: 'eyJhbGc...'}` |
| `token` | The JWT token string | `'eyJhbGc...'` actual JWT |
| `?.` | Optional chaining (safe access) | Prevents errors if undefined |

### **The Flow:**

```
1. User logs in → Backend returns JWT token
   ↓
2. Frontend stores token in localStorage
   ↓
3. Frontend connects via Socket.IO with {auth: {token}}
   ↓
4. Backend middleware reads socket.handshake.auth.token
   ↓
5. Backend verifies JWT and extracts user info
   ↓
6. Backend attaches user to socket.user
   ↓
7. Now every event handler can access socket.user
```

---

## 🌐 Complete Socket.IO Flow: Frontend ↔ Backend

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User clicks "Join Room"                             │  │
│  │  → socket.emit('join-room', {roomCode, userId})      │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────┘
                      │ WebSocket Connection
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  server.js                                           │  │
│  │  - Creates HTTP server                              │  │
│  │  - Calls initSocket(server)                         │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  src/config/socket.js                               │  │
│  │  - Creates io = new Server(httpServer)              │  │
│  │  - Adds JWT authentication middleware               │  │
│  │  - io.on('connection') calls registerGameSocket     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  src/sockets/game.socket.js                         │  │
│  │  - socket.on('join-room') → handle join             │  │
│  │  - Database operations                              │  │
│  │  - io.to(roomCode).emit('player-joined')            │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────┘
                      │ Broadcast to all in room
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    ALL CLIENTS IN ROOM                      │
│  socket.on('player-joined', (data) => {                    │
│    console.log('New player joined!', data);                │
│  });                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 game.socket.js - Complete Detailed Breakdown

### **Core Architecture**

`game.socket.js` exports a **registration function** that receives two parameters:

```javascript
module.exports = function registerGameSocket(io, socket) {
  // io = The Socket.IO server instance (manages all connections)
  // socket = Individual client connection
  
  socket.on('event-name', handler);
}
```

---

## 📊 Understanding `io` vs `socket`

### **`io` - The Server Broadcast System**

The `io` object is the **Socket.IO server instance** that manages **ALL connected clients**.

```javascript
// Broadcast to everyone in a room
io.to('ROOM123').emit('game-started', {data});

// Broadcast to EVERYONE connected
io.emit('server-announcement', {message: 'Maintenance in 5 min'});

// Get all sockets in a room
const socketsInRoom = await io.in('ROOM123').fetchSockets();
```

**Think of `io` as:** The radio tower broadcasting to multiple receivers

---

### **`socket` - Individual Client Connection**

The `socket` object represents **ONE specific client** connected to the server.

```javascript
// Send to THIS client only
socket.emit('error', {message: 'You are not the host'});

// Listen to events from THIS client
socket.on('join-room', (data) => {
  // This client wants to join a room
});

// Join THIS client to a room
socket.join('ROOM123');

// Access user info attached during auth
socket.user.id  // '507f1f77bcf86cd799439011'
socket.user.username  // 'JohnDoe'
```

**Think of `socket` as:** One person's walkie-talkie in a group chat

---

## 🔄 Frontend to Backend Communication Flow

### **Event 1: JOIN ROOM**

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Player's Browser)                                │
└─────────────────────────────────────────────────────────────┘

const socket = io('http://localhost:5000', {
  auth: { token: jwtToken }
});

socket.emit('join-room', {
  roomCode: 'ABC123',
  userId: '507f1f77bcf86cd799439011',
  username: 'JohnDoe'
});

                      │
                      │ WebSocket Message
                      ▼

┌─────────────────────────────────────────────────────────────┐
│ BACKEND (game.socket.js Line 354)                          │
└─────────────────────────────────────────────────────────────┘

socket.on('join-room', async (payload = {}) => {
  // payload = {roomCode: 'ABC123', userId: '...', username: 'JohnDoe'}
  
  const roomCode = (payload.roomCode || '').toUpperCase();  // 'ABC123'
  const userId = payload.userId;
  const username = payload.username;
  
  // STEP 1: Validate request
  if (!roomCode || !userId) {
    socket.emit('error', {message: 'roomCode and userId required'});
    return;
  }
  
  // STEP 2: Security check - socket.user comes from JWT middleware
  if (socket.user.id !== userId) {
    socket.emit('error', {message: 'User mismatch'});
    return;
  }
  
  // STEP 3: Find room in database
  const room = await GameRoom.findOne({roomCode});
  if (!room) {
    socket.emit('error', {message: 'Room not found'});
    return;
  }
  
  // STEP 4: Join the Socket.IO room (like a chat room)
  socket.join(roomCode);  // ← Now this socket receives broadcasts to 'ABC123'
  
  // STEP 5: Get or create in-memory game state
  const gameState = getOrCreateGameState(roomCode);
  
  // STEP 6: Add player to game state
  gameState.players.set(userId, {
    userId,
    username,
    score: 0,
    socketId: socket.id  // Important for reconnections
  });
  
  // STEP 7: Broadcast to ALL players in this room
  io.to(roomCode).emit('player-joined', {
    username: username,
    totalPlayers: gameState.players.size,
    players: buildLeaderboard(gameState)
  });
});

                      │
                      │ Broadcast to all in room
                      ▼

┌─────────────────────────────────────────────────────────────┐
│ ALL FRONTENDS IN ROOM 'ABC123'                             │
└─────────────────────────────────────────────────────────────┘

socket.on('player-joined', (data) => {
  console.log(`${data.username} joined! Total: ${data.totalPlayers}`);
  // Update UI to show new player
  updatePlayerList(data.players);
});
```

---

### **Event 2: START GAME (Host Only)**

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Host's Browser)                                  │
└─────────────────────────────────────────────────────────────┘

socket.emit('start-game', {
  roomCode: 'ABC123'
});

                      │
                      ▼

┌─────────────────────────────────────────────────────────────┐
│ BACKEND (game.socket.js Line 410)                          │
└─────────────────────────────────────────────────────────────┘

socket.on('start-game', async (payload = {}) => {
  await startGame(io, socket, payload.roomCode);
});

// startGame function (Line 269)
async function startGame(io, socket, roomCode) {
  const normalizedRoomCode = (roomCode || '').toUpperCase();
  
  // STEP 1: Find room in database
  const room = await GameRoom.findOne({roomCode: normalizedRoomCode});
  if (!room) {
    socket.emit('error', {message: 'Room not found'});
    return;
  }
  
  // STEP 2: Verify caller is the host
  if (room.hostId.toString() !== socket.user.id) {
    socket.emit('error', {message: 'Only host can start game'});
    return;
  }
  
  // STEP 3: Check room status
  if (room.status !== 'waiting') {
    socket.emit('error', {message: 'Game already started'});
    return;
  }
  
  // STEP 4: Get game state
  const gameState = getOrCreateGameState(normalizedRoomCode);
  gameState.hostId = room.hostId.toString();
  gameState.timeLimitSec = room.settings?.timeLimit ?? 20;
  
  // STEP 5: Load players from database
  const User = require('../models/User');
  const playerIds = room.players.map(p => p.userId);
  const users = await User.find({_id: {$in: playerIds}}, 'username _id');
  
  // Populate game state players
  for (const p of room.players) {
    const userId = p.userId.toString();
    gameState.players.set(userId, {
      userId,
      username: users.find(u => u._id.toString() === userId)?.username,
      score: 0,
      socketId: null
    });
  }
  
  // STEP 6: Load questions
  let questions = [];
  if (room.quizId) {
    // Load from specific quiz
    const Quiz = require('../models/Quiz');
    const quiz = await Quiz.findById(room.quizId).populate('questions');
    questions = quiz.questions;
  } else {
    // Random questions
    questions = await Question.aggregate([{$sample: {size: 5}}]);
  }
  
  // STEP 7: Initialize game state
  gameState.questions = questions;
  gameState.currentQuestionIndex = 0;
  gameState.status = 'live';
  
  // STEP 8: Update database
  await GameRoom.updateOne(
    {roomCode: normalizedRoomCode},
    {$set: {status: 'live', currentQuestionIndex: 0}}
  );
  
  // STEP 9: Broadcast game started
  io.to(normalizedRoomCode).emit('game-started', {
    roomCode: normalizedRoomCode,
    totalQuestions: questions.length
  });
  
  // STEP 10: Start first question
  startQuestionPhase(io, gameState);
}

                      │
                      ▼

┌─────────────────────────────────────────────────────────────┐
│ ALL FRONTENDS IN ROOM                                      │
└─────────────────────────────────────────────────────────────┘

socket.on('game-started', (data) => {
  console.log('Game starting!', data.totalQuestions, 'questions');
  showGameScreen();
});

socket.on('new-question', (data) => {
  displayQuestion(data.questionText, data.options);
  startTimer(data.timeLimit);
});
```

---

### **Event 3: SUBMIT ANSWER**

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Player clicks answer)                            │
└─────────────────────────────────────────────────────────────┘

socket.emit('submit-answer', {
  roomCode: 'ABC123',
  userId: '507f1f77bcf86cd799439011',
  selectedOptionIndex: 2  // They clicked option 2
});

                      │
                      ▼

┌─────────────────────────────────────────────────────────────┐
│ BACKEND (game.socket.js Line 419)                          │
└─────────────────────────────────────────────────────────────┘

socket.on('submit-answer', (payload = {}) => {
  const roomCode = (payload.roomCode || '').toUpperCase();
  const userId = payload.userId;
  const selectedOptionIndex = payload.selectedOptionIndex;
  
  // STEP 1: Basic validation
  if (!roomCode || !userId) return;
  
  // STEP 2: Get game state
  const gameState = liveGames.get(roomCode);
  if (!gameState || gameState.status !== 'live') return;
  
  // STEP 3: Check if accepting answers
  if (!gameState.acceptingAnswers) return;
  
  // STEP 4: Security - verify user
  if (socket.user.id !== userId) return;
  
  // STEP 5: Get current question
  const q = gameState.questions[gameState.currentQuestionIndex];
  if (!q) return;
  
  // STEP 6: Get answer map for this question
  let answerMap = gameState.answersByQuestionIndex.get(
    gameState.currentQuestionIndex
  );
  if (!answerMap) {
    answerMap = new Map();
    gameState.answersByQuestionIndex.set(
      gameState.currentQuestionIndex,
      answerMap
    );
  }
  
  // STEP 7: Check if already answered
  if (answerMap.has(userId)) return;  // Can't answer twice
  
  // STEP 8: Store answer with timestamp
  answerMap.set(userId, {
    selectedOptionIndex,
    timeRemainingAtSubmit: gameState.timeRemaining  // For score calculation
  });
  
  // STEP 9: Increment answer count
  gameState.answersCount = (gameState.answersCount || 0) + 1;
  
  // STEP 10: Broadcast answer count update
  io.to(roomCode).emit('update-answer-count', {
    count: gameState.answersCount,
    totalPlayers: gameState.players.size
  });
  
  // STEP 11: Auto-advance if untimed and all answered
  if (gameState.timeLimitSec <= 0 && 
      gameState.answersCount >= gameState.players.size) {
    setTimeout(() => {
      if (gameState.phase === 'question') {
        startFeedbackPhase(io, gameState);
      }
    }, 1000);
  }
});

                      │
                      ▼

┌─────────────────────────────────────────────────────────────┐
│ ALL FRONTENDS                                              │
└─────────────────────────────────────────────────────────────┘

socket.on('update-answer-count', (data) => {
  updateUI(`${data.count}/${data.totalPlayers} answered`);
});

socket.on('round-ended', (data) => {
  highlightCorrectAnswer(data.correctOptionIndex);
});

socket.on('answer-result', (data) => {
  if (data.userId === myUserId) {
    showFeedback(data.isCorrect, data.pointsEarned);
  }
});
```

---

## 🎯 Game State Management

### **In-Memory Game State (Line 6)**

```javascript
const liveGames = new Map(); // roomCode -> gameState
```

**Why in-memory?**
- Ultra-fast access during live gameplay
- No database latency during real-time events
- Cleared after game ends (saved to database then)

### **Game State Structure**

```javascript
{
  roomCode: 'ABC123',
  hostId: '507f1f77bcf86cd799439011',
  status: 'live',                    // waiting | live | finished
  phase: 'question',                 // waiting | question | feedback | intermission | finished
  currentQuestionIndex: 2,           // Currently on question 3
  questions: [...],                  // Array of question objects
  timeLimitSec: 20,                  // 20 seconds per question
  timeRemaining: 15,                 // 15 seconds left
  timerId: IntervalID,               // setInterval ID for countdown
  autoAdvanceTimeoutId: TimeoutID,   // setTimeout ID for auto-advance
  acceptingAnswers: true,            // Currently accepting answers?
  players: Map {                     // Map of userId -> player object
    '507f...' => {
      userId: '507f...',
      username: 'JohnDoe',
      score: 1500,
      socketId: 'Xy8z...'
    }
  },
  answersByQuestionIndex: Map {      // Map of questionIndex -> Map of userId -> answer
    0 => Map {
      '507f...' => {selectedOptionIndex: 2, timeRemainingAtSubmit: 18}
    },
    1 => Map {
      '507f...' => {selectedOptionIndex: 1, timeRemainingAtSubmit: 12}
    }
  },
  answersCount: 3                    // How many answered current question
}
```

---

## ⏱️ Game Phase System

### **Phase Transitions**

```
WAITING
  ↓ (Host clicks Start)
QUESTION (20 seconds)
  ↓ (Timer expires OR all answered OR host skips)
FEEDBACK (3 seconds) - Shows correct answer
  ↓ (Auto-advance)
INTERMISSION (5 seconds) - Shows leaderboard
  ↓ (Auto-advance)
QUESTION (next question)
  ↓ (Repeat until all questions done)
FINISHED - Final results
```

### **Phase Functions**

#### **1. startQuestionPhase (Line 57)**

```javascript
function startQuestionPhase(io, gameState) {
  clearTimer(gameState);           // Clear any existing timers
  clearAutoAdvance(gameState);     // Clear auto-advance timeouts
  
  const q = gameState.questions[gameState.currentQuestionIndex];
  if (!q) {
    endGame(io, gameState);        // No more questions = game over
    return;
  }
  
  gameState.phase = 'question';
  gameState.timeRemaining = gameState.timeLimitSec;
  gameState.acceptingAnswers = true;
  gameState.answersCount = 0;
  
  // Send question to all players
  io.to(gameState.roomCode).emit('new-question', {
    questionIndex: gameState.currentQuestionIndex,
    questionText: q.questionText,
    options: q.options,
    timeLimit: gameState.timeLimitSec,
    mediaUrl: q.mediaUrl,
    mediaType: q.mediaType
  });
  
  // Start countdown timer
  if (gameState.timeLimitSec > 0) {
    gameState.timerId = setInterval(() => {
      gameState.timeRemaining -= 1;
      
      // Broadcast tick
      io.to(gameState.roomCode).emit('timer-update', {
        timeRemaining: gameState.timeRemaining
      });
      
      // Time's up?
      if (gameState.timeRemaining <= 0) {
        startFeedbackPhase(io, gameState);
      }
    }, 1000);  // Every second
  }
}
```

#### **2. startFeedbackPhase (Line 107)**

```javascript
function startFeedbackPhase(io, gameState) {
  clearTimer(gameState);           // Stop question timer
  clearAutoAdvance(gameState);
  
  // Calculate scores for all players
  calculateScores(io, gameState);
  
  gameState.phase = 'feedback';
  gameState.acceptingAnswers = false;  // No more answers accepted
  
  const q = gameState.questions[gameState.currentQuestionIndex];
  
  // Show correct answer
  io.to(gameState.roomCode).emit('round-ended', {
    correctOptionIndex: q.correctOptionIndex
  });
  
  // Auto-advance to intermission after 3 seconds (if timed mode)
  if (gameState.timeLimitSec > 0) {
    gameState.autoAdvanceTimeoutId = setTimeout(() => {
      startIntermissionPhase(io, gameState);
    }, 3000);
  }
}
```

#### **3. calculateScores (Line 162)**

```javascript
function calculateScores(io, gameState) {
  const qIndex = gameState.currentQuestionIndex;
  const q = gameState.questions[qIndex];
  
  const answerMap = gameState.answersByQuestionIndex.get(qIndex) || new Map();
  
  // Loop through each player
  for (const player of gameState.players.values()) {
    const submission = answerMap.get(player.userId);
    const selectedOptionIndex = submission?.selectedOptionIndex;
    const timeRemainingAtSubmit = submission?.timeRemainingAtSubmit ?? 0;
    
    // Check if correct
    const isCorrect = 
      typeof selectedOptionIndex === 'number' && 
      selectedOptionIndex === q.correctOptionIndex;
    
    let pointsEarned = 0;
    
    if (isCorrect) {
      // Kahoot-style scoring: 500-1000 points based on speed
      if (gameState.timeLimitSec <= 0) {
        // Infinite time mode = always 1000
        pointsEarned = 1000;
      } else {
        // Faster answer = more points
        const ratio = timeRemainingAtSubmit / gameState.timeLimitSec;
        pointsEarned = Math.round(500 + (500 * ratio));
        // 20s limit, answered at 18s remaining: 500 + (500 * 0.9) = 950 points
        // 20s limit, answered at 2s remaining: 500 + (500 * 0.1) = 550 points
      }
    }
    
    player.score += pointsEarned;
    
    // Send individual result
    io.to(gameState.roomCode).emit('answer-result', {
      userId: player.userId,
      isCorrect,
      correctOptionIndex: q.correctOptionIndex,
      pointsEarned
    });
  }
}
```

---

## 🏆 Key Patterns & Best Practices

### **1. Room-Based Broadcasting**

```javascript
// Send to SPECIFIC room only
io.to('ABC123').emit('game-started', {});

// Send to EVERYONE (avoid unless needed)
io.emit('server-announcement', {});

// Send to THIS client only
socket.emit('error', {message: 'You are not host'});
```

### **2. Security Checks**

```javascript
// Always verify user identity
if (socket.user.id !== userId) {
  socket.emit('error', {message: 'User mismatch'});
  return;
}

// Always verify permissions
if (room.hostId.toString() !== socket.user.id) {
  socket.emit('error', {message: 'Only host can start game'});
  return;
}
```

### **3. Error Handling**

```javascript
try {
  await startGame(io, socket, payload.roomCode);
} catch (err) {
  console.error(err);
  socket.emit('error', {message: 'Failed to start game'});
}
```

---

## 📡 Complete Event Reference

| Event | Direction | Trigger | Purpose |
|-------|-----------|---------|---------|
| `join-room` | Frontend → Backend | Player joins | Add player to game room |
| `player-joined` | Backend → All in room | Someone joined | Update player list |
| `start-game` | Frontend → Backend | Host clicks start | Begin game |
| `game-started` | Backend → All in room | Game begins | Show game screen |
| `new-question` | Backend → All in room | Question timer | Display question |
| `timer-update` | Backend → All in room | Every second | Update countdown |
| `submit-answer` | Frontend → Backend | Player clicks option | Record answer |
| `update-answer-count` | Backend → All in room | Answer submitted | Show X/Y answered |
| `round-ended` | Backend → All in room | Timer expires | Show correct answer |
| `answer-result` | Backend → All in room | After round | Show individual score |
| `score-update` | Backend → All in room | Intermission | Show leaderboard |
| `game-ended` | Backend → All in room | Final question done | Show final results |
| `skip-timer` | Frontend → Backend | Host skips | End question early |
| `host-next-stage` | Frontend → Backend | Host advances | Manual phase control |
| `disconnect` | Automatic | Connection lost | Cleanup |

---

## 🎓 Summary

**Frontend → Backend:**
- Uses `socket.emit('event-name', data)` to send
- Backend receives with `socket.on('event-name', handler)`

**Backend → Frontend(s):**
- `socket.emit()` = Send to THIS client only
- `io.to(roomCode).emit()` = Send to ALL in room
- `io.emit()` = Send to EVERYONE

**Authentication:**
- Frontend sends token in `{auth: {token}}`
- Backend reads from `socket.handshake.auth.token`
- JWT decoded and attached to `socket.user`

**Game State:**
- In-memory Map for live performance
- Database for persistence
- Phase system controls game flow
- Timers and auto-advance for UX
