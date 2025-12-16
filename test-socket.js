const { io } = require("socket.io-client");

// Test tokens (from previous API tests)
const ALICE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2ZmODk1OGVhY2E0MGMxYTMzOWUwZCIsInVzZXJuYW1lIjoiYWxpY2UiLCJlbWFpbCI6ImFsaWNlQHRlc3QuY29tIiwiaWF0IjoxNzY1ODAwMDk1LCJleHAiOjE3NjY0MDQ4OTV9.AAljG8IkTWzS5V-fL4FKnTMUYVs5EAxRYKeQFwMXTwg";
const BOB_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2ZmOGExOGVhY2E0MGMxYTMzOWUxMSIsInVzZXJuYW1lIjoiYm9iIiwiZW1haWwiOiJib2JAdGVzdC5jb20iLCJpYXQiOjE3NjU4MDAwOTcsImV4cCI6MTc2NjQwNDg5N30.CmegOZfu0slRQyxVoTChNSYtvxWexJXwo8dEgUpSZgQ";

const ALICE_ID = "693ff8958eaca40c1a339e0d";
const BOB_ID = "693ff8a18eaca40c1a339e11";
const ROOM_CODE = "SDBVZ8";

// Connect Alice
const aliceSocket = io("http://localhost:4000", {
  auth: { token: ALICE_TOKEN }
});

// Connect Bob
const bobSocket = io("http://localhost:4000", {
  auth: { token: BOB_TOKEN }
});

// Alice event listeners
aliceSocket.on("connect", () => {
  console.log("✅ Alice connected to Socket.IO");

  // Alice joins room
  setTimeout(() => {
    console.log("\n🔹 Alice joining room...");
    aliceSocket.emit("join-room", {
      roomCode: ROOM_CODE,
      userId: ALICE_ID,
      username: "alice"
    });
  }, 500);
});

aliceSocket.on("player-joined", (data) => {
  console.log("✅ Alice received player-joined:", data);
});

aliceSocket.on("game-started", (data) => {
  console.log("✅ Alice received game-started:", data);
});

aliceSocket.on("new-question", (data) => {
  console.log("✅ Alice received new-question:", data);

  // Alice submits answer (option 1)
  setTimeout(() => {
    console.log("\n🔹 Alice submitting answer (option 1)...");
    aliceSocket.emit("submit-answer", {
      roomCode: ROOM_CODE,
      userId: ALICE_ID,
      selectedOptionIndex: 1
    });
  }, 1000);
});

aliceSocket.on("timer-update", (data) => {
  console.log("⏱️  Alice received timer-update:", data.timeRemaining);
});

aliceSocket.on("answer-result", (data) => {
  console.log("✅ Alice received answer-result:", data);
});

aliceSocket.on("score-update", (data) => {
  console.log("✅ Alice received score-update:", data);
});

aliceSocket.on("game-ended", (data) => {
  console.log("✅ Alice received game-ended:", data);

  // Cleanup
  setTimeout(() => {
    console.log("\n🛑 Disconnecting...");
    aliceSocket.disconnect();
    bobSocket.disconnect();
    process.exit(0);
  }, 1000);
});

aliceSocket.on("error", (error) => {
  console.error("❌ Alice error:", error);
});

// Bob event listeners
bobSocket.on("connect", () => {
  console.log("✅ Bob connected to Socket.IO");

  // Bob joins room
  setTimeout(() => {
    console.log("\n🔹 Bob joining room...");
    bobSocket.emit("join-room", {
      roomCode: ROOM_CODE,
      userId: BOB_ID,
      username: "bob"
    });
  }, 1000);
});

bobSocket.on("player-joined", (data) => {
  console.log("✅ Bob received player-joined:", data);

  // After Bob joins, Alice starts the game (host only)
  if (data.username === "bob") {
    setTimeout(() => {
      console.log("\n🔹 Alice (host) starting game...");
      aliceSocket.emit("start-game", {
        roomCode: ROOM_CODE
      });
    }, 1000);
  }
});

bobSocket.on("game-started", (data) => {
  console.log("✅ Bob received game-started:", data);
});

bobSocket.on("new-question", (data) => {
  console.log("✅ Bob received new-question:", data);

  // Bob submits answer (option 2)
  setTimeout(() => {
    console.log("\n🔹 Bob submitting answer (option 2)...");
    bobSocket.emit("submit-answer", {
      roomCode: ROOM_CODE,
      userId: BOB_ID,
      selectedOptionIndex: 2
    });
  }, 1500);
});

bobSocket.on("timer-update", (data) => {
  console.log("⏱️  Bob received timer-update:", data.timeRemaining);
});

bobSocket.on("answer-result", (data) => {
  console.log("✅ Bob received answer-result:", data);
});

bobSocket.on("score-update", (data) => {
  console.log("✅ Bob received score-update:", data);
});

bobSocket.on("game-ended", (data) => {
  console.log("✅ Bob received game-ended:", data);
});

bobSocket.on("error", (error) => {
  console.error("❌ Bob error:", error);
});

// Connection errors
aliceSocket.on("connect_error", (error) => {
  console.error("❌ Alice connection error:", error.message);
});

bobSocket.on("connect_error", (error) => {
  console.error("❌ Bob connection error:", error.message);
});
