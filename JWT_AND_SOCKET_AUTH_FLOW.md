  # QuizStorm: Complete JWT + Socket.IO Authentication Flow

## 🚀 Server Startup Sequence

### **What Happens When You Run `npm start`**

```
1. Node.js starts → Executes server.js
2. Load environment variables (.env file)
3. Import and initialize Express app
4. Connect to MongoDB database
5. Create HTTP server
6. Initialize Socket.IO server
7. Start listening on port 5000
```

---

### **File Execution Order**

```javascript
// 1. server.js (Entry Point)
require('dotenv').config();  // Load .env variables
const app = require('./src/app');           // Import Express app
const connectDB = require('./src/config/db'); // Import DB connector
const initSocket = require('./src/config/socket'); // Import Socket.IO setup
const http = require('http');

async function start() {
  await connectDB();                    // Connect to MongoDB
  const server = http.createServer(app); // Create HTTP server with Express
  initSocket(server);                   // Attach Socket.IO to HTTP server
  server.listen(5000);                  // Start listening
}
start();

// 2. src/app.js (Express App Setup)
const express = require('express');
const app = express();
app.use(express.json());              // Parse JSON bodies
app.use(cors());                      // Enable CORS
app.use('/api/auth', authRoutes);     // Register auth routes
app.use('/api/game', gameRoutes);     // Register game routes
module.exports = app;

// 3. src/config/db.js (Database Connection)
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

// 4. src/config/socket.js (Socket.IO Setup)
const io = new Server(httpServer);
io.use(jwtAuthMiddleware);            // JWT verification for sockets
io.on('connection', registerGameSocket);
```

---

## 🔐 Part 1: JWT Authentication (HTTP Requests)

### **Flow 1: User Registration**

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: Frontend Sends Registration Request                 │
└──────────────────────────────────────────────────────────────┘

POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "JohnDoe",
  "email": "john@example.com",
  "password": "password123"
}

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 2: app.js Routes Request                                │
└──────────────────────────────────────────────────────────────┘

File: src/app.js (Line 30)
app.use('/api/auth', authRoutes);
// Routes all /api/auth/* requests to auth.routes.js

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 3: auth.routes.js Matches Route                         │
└──────────────────────────────────────────────────────────────┘

File: src/routes/auth.routes.js (Line 7)
router.post('/register', (req, res, next) => {
  Promise.resolve(register(req, res)).catch(next);
});
// Calls register() function from auth.controller.js

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 4: auth.controller.js Processes Registration            │
└──────────────────────────────────────────────────────────────┘

File: src/controllers/auth.controller.js

async function register(req, res) {
  const { username, email, password } = req.body;
  
  // Validate input (Line 21-23)
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  
  // Check if email already exists (Line 26-29)
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  
  // Hash password with bcrypt (Line 31)
  const passwordHash = await bcrypt.hash(password, 10);
  // "password123" → "$2a$10$XYZ..." (irreversible one-way encryption)
  
  // Create user in MongoDB (Line 33-39)
  const user = await User.create({
    username: "JohnDoe",
    email: "john@example.com",
    passwordHash: "$2a$10$XYZ...",
    role: "user",
    stats: { wins: 0, gamesPlayed: 0, totalPoints: 0 }
  });
  // MongoDB generates _id: "507f1f77bcf86cd799439011"
  
  // Generate JWT token (Line 41)
  const token = signToken(user);
}

// signToken function (Line 6-16)
function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),        // "507f1f77bcf86cd799439011"
      username: user.username,        // "JohnDoe"
      email: user.email               // "john@example.com"
    },
    process.env.JWT_SECRET,          // Secret key from .env
    { expiresIn: '7d' }              // Token expires in 7 days
  );
}
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2..."

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 5: Send Response to Frontend                            │
└──────────────────────────────────────────────────────────────┘

File: src/controllers/auth.controller.js (Line 43-54)
return res.status(201).json({
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "507f1f77bcf86cd799439011",
    username: "JohnDoe",
    email: "john@example.com",
    role: "user",
    stats: { wins: 0, gamesPlayed: 0, totalPoints: 0 }
  }
});

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 6: Frontend Stores JWT Token                            │
└──────────────────────────────────────────────────────────────┘

localStorage.setItem('jwtToken', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
localStorage.setItem('user', JSON.stringify(user));
```

---

### **Flow 2: User Login (Similar Flow)**

```javascript
// Frontend Request
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Backend: src/controllers/auth.controller.js (Line 57-89)
async function login(req, res) {
  const { email, password } = req.body;
  
  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Compare password with stored hash
  const ok = await bcrypt.compare(password, user.passwordHash);
  // bcrypt.compare("password123", "$2a$10$XYZ...") → true/false
  
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate JWT token
  const token = signToken(user);
  
  // Send response
  return res.json({
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: { id, username, email, role, stats }
  });
}
```

---

### **Flow 3: Protected HTTP Route (Using JWT)**

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: Frontend Makes Authenticated Request                 │
└──────────────────────────────────────────────────────────────┘

const token = localStorage.getItem('jwtToken');

POST http://localhost:5000/api/game/create
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "quizId": "abc123",
  "settings": { "timeLimit": 20 }
}

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 2: game.routes.js Has authMiddleware                    │
└──────────────────────────────────────────────────────────────┘

File: src/routes/game.routes.js (Line 8)
router.post('/create', authMiddleware, (req, res) => {
  createRoom(req, res);
});
//                     ↑ This runs BEFORE createRoom

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 3: authMiddleware Verifies JWT                          │
└──────────────────────────────────────────────────────────────┘

File: src/middleware/auth.middleware.js

function authMiddleware(req, res, next) {
  // Extract Authorization header (Line 5)
  const header = req.headers.authorization;
  // header = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  // Check if header exists and starts with "Bearer " (Line 6-8)
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }
  
  // Extract token (Line 10)
  const token = header.slice('Bearer '.length);
  // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  // Verify and decode JWT (Line 11)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // If invalid/expired, throws error → caught by catch block
  // If valid, returns decoded payload:
  // decoded = {
  //   id: "507f1f77bcf86cd799439011",
  //   username: "JohnDoe",
  //   email: "john@example.com",
  //   iat: 1639632000,  // Issued at timestamp
  //   exp: 1640236800   // Expiration timestamp
  // }
  
  // Attach user info to request object (Line 13-17)
  req.user = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email
  };
  
  // Continue to next middleware/controller (Line 19)
  return next();
}

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 4: Controller Can Access req.user                       │
└──────────────────────────────────────────────────────────────┘

File: src/controllers/game.controller.js (Line 44-86)

async function createRoom(req, res) {
  // req.user is now available! Set by authMiddleware
  
  const room = await GameRoom.create({
    roomCode: "ABC123",
    hostId: req.user.id,  // ← From JWT! "507f1f77bcf86cd799439011"
    players: [],
    settings: req.body.settings,
    status: 'waiting'
  });
  
  // If host is playing, add them to players
  if (settings.isHostPlaying) {
    room.players.push({ 
      userId: req.user.id,  // ← Again using JWT user ID
      score: 0 
    });
  }
  
  return res.json(room);
}
```

---

## 🔌 Part 2: Socket.IO Authentication

### **Flow 4: Socket.IO Connection with JWT**

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: Frontend Connects to Socket.IO with JWT              │
└──────────────────────────────────────────────────────────────┘

const token = localStorage.getItem('jwtToken');
const socket = io('http://localhost:5000', {
  auth: {
    token: token  // ← JWT sent during handshake
  }
});

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 2: Socket.IO Middleware Runs (BEFORE connection)        │
└──────────────────────────────────────────────────────────────┘

File: src/config/socket.js (Line 23-39)

io.use((socket, next) => {
  try {
    // Extract token from handshake (Line 25)
    const token = socket.handshake?.auth?.token;
    // This is the token from frontend's io({auth: {token}})
    
    if (!token) {
      return next(new Error('Missing auth token'));
      // Connection will be rejected!
    }
    
    // Verify JWT (Line 28)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = {
    //   id: "507f1f77bcf86cd799439011",
    //   username: "JohnDoe",
    //   email: "john@example.com",
    //   iat: 1639632000,
    //   exp: 1640236800
    // }
    
    // Attach user to socket (Line 29-33)
    socket.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };
    // Now socket.user is available in ALL event handlers!
    
    // Allow connection (Line 35)
    return next();
    
  } catch (err) {
    // JWT verification failed (invalid/expired)
    return next(new Error('Invalid auth token'));
    // Connection will be rejected!
  }
});

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 3: Connection Established, Handlers Registered          │
└──────────────────────────────────────────────────────────────┘

File: src/config/socket.js (Line 41-43)

io.on('connection', (socket) => {
  // This socket has:
  // - socket.id = "Xy8zAbc123" (random, changes each connection)
  // - socket.user.id = "507f1f77bcf86cd799439011" (from JWT, persistent)
  
  // Register all game event handlers
  registerGameSocket(io, socket);
});

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ STEP 4: Event Handlers Can Access socket.user                │
└──────────────────────────────────────────────────────────────┘

File: src/sockets/game.socket.js

socket.on('join-room', async (payload) => {
  const userId = payload.userId;  // From frontend (untrusted)
  
  // SECURITY CHECK: Verify frontend userId matches JWT
  if (socket.user.id !== userId) {
    socket.emit('error', { message: 'User mismatch' });
    return;  // Prevent impersonation!
  }
  
  // Verified! Use socket.user.id for database queries
  const room = await GameRoom.findOne({ roomCode });
  
  gameState.players.set(socket.user.id, {
    userId: socket.user.id,      // From verified JWT
    username: socket.user.username, // From verified JWT
    score: 0
  });
});
```

---

## 🔄 Part 3: How Both Work Together

### **The Two Authentication Paths**

```
┌─────────────────────────────────────────────────────────┐
│          HTTP Requests (REST API)                       │
├─────────────────────────────────────────────────────────┤
│ 1. Frontend sends: Authorization: Bearer <JWT>         │
│ 2. Express middleware extracts JWT from header         │
│ 3. jwt.verify() validates and decodes                  │
│ 4. Attaches req.user to request                        │
│ 5. Controller uses req.user.id                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│          WebSocket (Socket.IO)                          │
├─────────────────────────────────────────────────────────┤
│ 1. Frontend sends: io(url, {auth: {token: JWT}})       │
│ 2. Socket.IO middleware extracts JWT from handshake    │
│ 3. jwt.verify() validates and decodes                  │
│ 4. Attaches socket.user to socket                      │
│ 5. Event handlers use socket.user.id                   │
└─────────────────────────────────────────────────────────┘
```

---

### **Real-World Example: Creating and Joining a Game**

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User creates room (HTTP)                                  │
└──────────────────────────────────────────────────────────────┘

Frontend:
const response = await fetch('/api/game/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ quizId: 'abc' })
});

Backend Flow:
1. Request → app.js → game.routes.js
2. authMiddleware runs → verifies JWT → sets req.user
3. createRoom() controller runs → uses req.user.id as hostId
4. Room created in MongoDB with roomCode "ABC123"
5. Response sent back

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ 2. User joins room via Socket.IO                             │
└──────────────────────────────────────────────────────────────┘

Frontend:
socket.emit('join-room', {
  roomCode: 'ABC123',
  userId: user.id,
  username: user.username
});

Backend Flow:
1. Event received by game.socket.js
2. Verifies socket.user.id === payload.userId (security!)
3. Adds player to game state
4. socket.join('ABC123') - joins Socket.IO room
5. io.to('ABC123').emit('player-joined') - broadcast to all

                      ↓

┌──────────────────────────────────────────────────────────────┐
│ Result: Same user, verified in both HTTP and Socket.IO       │
└──────────────────────────────────────────────────────────────┘

Both systems use THE SAME JWT token!
Both extract user.id = "507f1f77bcf86cd799439011"
Both verify cryptographic signature
Both attach user info for use in handlers
```

---

## 📋 File Reference Summary

### **Authentication Files**

| File | Purpose | Key Functions |
|------|---------|---------------|
| **src/controllers/auth.controller.js** | Login/signup logic | `register()`, `login()`, `signToken()` |
| **src/middleware/auth.middleware.js** | HTTP JWT verification | `authMiddleware()` |
| **src/config/socket.js** | Socket.IO JWT verification | `io.use()` middleware |
| **src/models/User.js** | User database schema | Mongoose model |
| **src/routes/auth.routes.js** | Auth route definitions | `/login`, `/register` |

---

### **Game Files (Using Auth)**

| File | Purpose | Uses Auth? |
|------|---------|------------|
| **src/controllers/game.controller.js** | Game room logic | ✅ Uses `req.user.id` |
| **src/routes/game.routes.js** | Game route definitions | ✅ Has `authMiddleware` |
| **src/sockets/game.socket.js** | Real-time game events | ✅ Uses `socket.user.id` |

---

## 🔑 Key Concepts

### **1. JWT Token Structure**

```javascript
// Header.Payload.Signature
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" + "." +
"eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInVzZXJuYW1lIjoiSm9obkRvZSJ9" + "." +
"SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

// Decoded Payload:
{
  "id": "507f1f77bcf86cd799439011",
  "username": "JohnDoe",
  "email": "john@example.com",
  "iat": 1639632000,  // Issued at
  "exp": 1640236800   // Expires at
}

// Signature = HMACSHA256(header + payload, JWT_SECRET)
// ↑ This makes it impossible to fake!
```

---

### **2. Why Both Methods Use Same JWT**

- **Consistency**: Same user identity across HTTP and WebSocket
- **Security**: Both verify with same secret key
- **Simplicity**: Frontend only needs to store one token
- **Stateless**: No session storage needed on server

---

### **3. What Gets Verified**

```javascript
// ✅ VERIFIED (from JWT)
socket.user.id        // Cryptographically guaranteed
req.user.id          // Cryptographically guaranteed

// ❌ NOT TRUSTED (from client)
payload.userId       // Could be faked by modified frontend
req.body.userId      // Could be faked in request

// Always check: socket.user.id === payload.userId
```

---

### **4. Token Refresh on Reconnect**

```javascript
// Scenario: User refreshes page

// Before refresh:
socket.id = "Abc123"
socket.user.id = "507f..." (from JWT)

// After refresh (new connection):
socket.id = "Xyz789"  // ← NEW
socket.user.id = "507f..." // ← SAME (from same JWT)

// Game state looks up by user.id, not socket.id
// So user's score persists!
```

---

## 🎯 Summary

### **When Backend Starts:**
1. `server.js` → Load environment
2. `connectDB()` → Connect to MongoDB
3. `app.js` → Set up Express with routes
4. `initSocket()` → Set up Socket.IO with JWT middleware
5. Start listening on port 5000

### **HTTP Authentication:**
1. User logs in → receives JWT
2. Frontend stores JWT in localStorage
3. Frontend sends `Authorization: Bearer <JWT>` header
4. `authMiddleware` verifies JWT → sets `req.user`
5. Controller uses `req.user.id`

### **Socket.IO Authentication:**
1. Frontend connects with `{auth: {token: JWT}}`
2. Socket.IO middleware verifies JWT → sets `socket.user`
3. Event handlers use `socket.user.id`
4. Security check: verify `socket.user.id === payload.userId`

### **Key Security Principle:**
**ALWAYS trust JWT-verified data (`req.user`, `socket.user`), NEVER trust client-provided data without verification!**
