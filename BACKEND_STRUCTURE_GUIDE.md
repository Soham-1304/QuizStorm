# QuizStorm Backend Structure - Complete Guide

## 📂 Backend Folder Structure

```
backend/
├── src/                    # Main source code directory
│   ├── app.js             # Express application setup and middleware configuration
│   ├── config/            # Configuration files
│   ├── controllers/       # Business logic handlers
│   ├── middleware/        # Custom middleware functions
│   ├── models/            # Database schema definitions (MongoDB/Mongoose)
│   ├── routes/            # API endpoint route definitions
│   └── sockets/           # WebSocket/Socket.IO handlers
├── scripts/               # Utility scripts
├── server.js              # Entry point - starts the server
├── seed.js                # Database seeding script
├── package.json           # Project dependencies and scripts
├── .env                   # Environment variables (not committed to git)
└── .env.example           # Template for environment variables
```

---

## 📁 Detailed Folder Breakdown

### **1. `/src` - Source Code Root**
Contains all the application source code organized by responsibility.

### **2. `/src/config` - Configuration Files**
**Purpose:** Centralize application configuration and setup

**Files:**
- **`db.js`** - MongoDB database connection configuration
- **`socket.js`** - Socket.IO server initialization and configuration

**What it does:**
- Manages MongoDB connection using Mongoose
- Configures Socket.IO for real-time communication
- Exports configured instances for use across the app

---

### **3. `/src/controllers` - Business Logic Layer**
**Purpose:** Handle business logic and process requests from routes

**Files:**
- **`admin.controller.js`** - Admin-specific operations (user management, quiz moderation)
- **`auth.controller.js`** - Authentication logic (login, signup, password management)
- **`game.controller.js`** - Game room management and gameplay logic
- **`question.controller.js`** - Question retrieval and management
- **`quiz.controller.js`** - Quiz CRUD operations
- **`user.controller.js`** - User profile and statistics management

**What it does:**
- Receives data from routes
- Validates and processes data
- Interacts with database models
- Returns formatted responses
- Handles errors and edge cases

---

### **4. `/src/middleware` - Middleware Functions**
**Purpose:** Intercept and process requests before they reach controllers

**Files:**
- **`auth.middleware.js`** - JWT token verification and user authentication
- **`isAdmin.js`** - Checks if user has admin privileges
- **`role.middleware.js`** - Role-based access control (RBAC)

**What it does:**
- Verifies JWT tokens from request headers
- Extracts user information from tokens
- Protects routes from unauthorized access
- Validates user roles and permissions

---

### **5. `/src/models` - Database Models**
**Purpose:** Define database schema and structure using Mongoose

**Files:**
- **`User.js`** - User schema (username, email, password, role, stats)
- **`Quiz.js`** - Quiz schema (title, description, category, difficulty)
- **`Question.js`** - Question schema (text, options, correct answer, points)
- **`GameRoom.js`** - Game room schema (code, host, players, status)
- **`GameResult.js`** - Game results schema (scores, rankings, answers)

**What it does:**
- Defines data structure for MongoDB collections
- Enforces data validation rules
- Creates relationships between collections
- Provides methods for database operations

---

### **6. `/src/routes` - API Route Definitions**
**Purpose:** Define API endpoints and map them to appropriate controllers

**Files:**
- **`auth.routes.js`** - `/api/auth` - Login, signup, logout endpoints
- **`user.routes.js`** - `/api/users` - User profile and statistics
- **`quiz.routes.js`** - `/api/quizzes` - Quiz listing and details
- **`question.routes.js`** - `/api/questions` - Question retrieval
- **`game.routes.js`** - `/api/games` - Game room operations
- **`admin.routes.js`** - `/api/admin` - Admin-only operations

**What it does:**
- Maps HTTP methods (GET, POST, PUT, DELETE) to URLs
- Applies middleware to routes (authentication, authorization)
- Connects routes to controller functions
- Organizes API structure

---

### **7. `/src/sockets` - WebSocket Handlers**
**Purpose:** Handle real-time communication for multiplayer functionality

**Files:**
- **`game.socket.js`** - Real-time game logic (player actions, score updates, chat)

**What it does:**
- Manages WebSocket connections
- Handles real-time events (join room, answer question, chat messages)
- Broadcasts updates to all players in a game room
- Syncs game state across all connected clients
- Manages player disconnections and reconnections

---

### **8. Root Level Files**

- **`server.js`** - Entry point that starts the Express and Socket.IO servers
- **`seed.js`** - Populates database with initial/sample data
- **`package.json`** - Project metadata and dependency management
- **`.env`** - Environment variables (MongoDB URI, JWT secret, port)
- **`.env.example`** - Template showing required environment variables

---

## 📦 Installed Libraries & Dependencies

### **Core Framework**

#### **1. express** (v5.2.1)
**What it does:**
- Web application framework for Node.js
- Handles HTTP requests and responses
- Provides routing mechanisms
- Middleware support

**Where it's used:**
- `src/app.js` - Main application setup
- All route files in `src/routes/`
- `server.js` - Server initialization

---

### **Database & ODM**

#### **2. mongoose** (v9.0.1)
**What it does:**
- MongoDB Object Data Modeling (ODM) library
- Schema-based data modeling
- Data validation
- Query building
- Middleware (hooks)

**Where it's used:**
- `src/config/db.js` - Database connection
- All files in `src/models/` - Schema definitions
- All controllers - Database operations

---

### **Authentication & Security**

#### **3. jsonwebtoken** (v9.0.3)
**What it does:**
- Creates and verifies JSON Web Tokens (JWT)
- Stateless authentication
- Token signing and verification
- Payload encryption

**Where it's used:**
- `src/controllers/auth.controller.js` - Token generation on login/signup
- `src/middleware/auth.middleware.js` - Token verification
- `src/middleware/isAdmin.js` - Admin token validation

#### **4. bcryptjs** (v3.0.3)
**What it does:**
- Password hashing library
- Secure password storage
- Password comparison
- Salt generation

**Where it's used:**
- `src/controllers/auth.controller.js` - Password hashing during signup
- `src/controllers/auth.controller.js` - Password verification during login
- `src/models/User.js` - Password schema and pre-save hooks

---

### **Environment Configuration**

#### **5. dotenv** (v17.2.3)
**What it does:**
- Loads environment variables from `.env` file
- Keeps sensitive data out of source code
- Different configs for dev/production

**Where it's used:**
- `server.js` - Loaded at application startup
- `src/config/db.js` - MongoDB connection string
- Throughout app via `process.env.VARIABLE_NAME`

---

### **Cross-Origin & Security**

#### **6. cors** (v2.8.5)
**What it does:**
- Cross-Origin Resource Sharing middleware
- Allows frontend (different domain) to access backend API
- Configures allowed origins, methods, headers

**Where it's used:**
- `src/app.js` - Applied globally to all routes
- Enables frontend-backend communication

---

### **Real-Time Communication**

#### **7. socket.io** (v4.8.1)
**What it does:**
- Real-time bidirectional event-based communication
- WebSocket protocol with fallbacks
- Room-based broadcasting
- Event handling

**Where it's used:**
- `src/config/socket.js` - Socket.IO server configuration
- `src/sockets/game.socket.js` - Real-time game events
- `server.js` - Attached to HTTP server
- Frontend connects for multiplayer features

---

### **Development Dependencies**

#### **8. nodemon** (v3.1.11) - DevDependency
**What it does:**
- Auto-restarts Node.js application on file changes
- Development convenience tool
- Watches file system for changes

**Where it's used:**
- `package.json` scripts: `npm run dev`
- Only used during development
- Not needed in production

---

## 🔄 How It All Works Together

### **Request Flow:**

```
1. Client sends HTTP request
   ↓
2. Express receives request in app.js
   ↓
3. CORS middleware checks origin
   ↓
4. Request matched to route (src/routes/)
   ↓
5. Auth middleware verifies JWT (if protected route)
   ↓
6. Role middleware checks permissions (if admin route)
   ↓
7. Controller processes business logic
   ↓
8. Mongoose model interacts with MongoDB
   ↓
9. Response sent back to client
```

### **WebSocket Flow (Real-time Game):**

```
1. Client connects via Socket.IO
   ↓
2. Socket.IO server (src/config/socket.js) accepts connection
   ↓
3. Client emits event (e.g., "joinRoom")
   ↓
4. Event handler in src/sockets/game.socket.js processes
   ↓
5. Business logic executed (update game state in DB)
   ↓
6. Server broadcasts update to all clients in room
   ↓
7. Clients receive real-time updates
```

---

## 🚀 npm Scripts

- **`npm run dev`** - Starts development server with nodemon (auto-restart)
- **`npm start`** - Starts production server with node

---

## 🗄️ Database Collections (MongoDB)

- **users** - User accounts and profiles
- **quizzes** - Quiz metadata and settings
- **questions** - Individual quiz questions
- **gamerooms** - Active game sessions
- **gameresults** - Completed game scores and stats

---

## 🔐 Environment Variables (.env)

```
MONGODB_URI=         # MongoDB connection string
JWT_SECRET=          # Secret key for JWT signing
PORT=                # Server port (default 5000)
NODE_ENV=            # Environment (development/production)
```

---

## 📝 Summary

The QuizStorm backend is a **full-stack real-time multiplayer quiz platform** built with:

- **Express** for REST API
- **MongoDB + Mongoose** for database
- **Socket.IO** for real-time multiplayer
- **JWT + bcrypt** for secure authentication
- **MVC architecture** for clean code organization

Each library serves a specific purpose in creating a secure, scalable, and real-time quiz gaming experience.
