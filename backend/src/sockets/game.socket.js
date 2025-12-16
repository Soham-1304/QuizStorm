const GameRoom = require('../models/GameRoom');
const Question = require('../models/Question');
const GameResult = require('../models/GameResult');

// In-memory authoritative game state while a match is live.
const liveGames = new Map(); // roomCode -> gameState

const DEFAULT_QUESTION_COUNT = 5;
const DEFAULT_TIME_LIMIT_SEC = 20;

function buildLeaderboard(gameState) {
  return Array.from(gameState.players.values())
    .map((p) => ({ userId: p.userId, username: p.username, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

function getOrCreateGameState(roomCode) {
  if (!liveGames.has(roomCode)) {
    liveGames.set(roomCode, {
      roomCode,
      hostId: null,
      status: 'waiting',
      phase: 'waiting', // waiting | question | feedback | intermission | finished
      currentQuestionIndex: 0,
      questions: [],
      timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
      timeRemaining: DEFAULT_TIME_LIMIT_SEC,
      timerId: null,
      autoAdvanceTimeoutId: null, // Track timeouts for auto-advancing
      acceptingAnswers: false,
      players: new Map(),
      answersByQuestionIndex: new Map(),
      answersCount: 0,
    });
  }
  return liveGames.get(roomCode);
}

function clearTimer(gameState) {
  if (gameState.timerId) {
    clearInterval(gameState.timerId);
    gameState.timerId = null;
  }
}

function clearAutoAdvance(gameState) {
  if (gameState.autoAdvanceTimeoutId) {
    clearTimeout(gameState.autoAdvanceTimeoutId);
    gameState.autoAdvanceTimeoutId = null;
  }
}

// -------------------------------------------------------------
// PHASE TRANSITION HELPERS
// -------------------------------------------------------------

function startQuestionPhase(io, gameState) {
  clearTimer(gameState);
  clearAutoAdvance(gameState);

  const q = gameState.questions[gameState.currentQuestionIndex];
  if (!q) {
    void endGame(io, gameState);
    return;
  }

  gameState.phase = 'question';
  gameState.timeRemaining = gameState.timeLimitSec;
  gameState.acceptingAnswers = true;
  gameState.answersCount = 0;

  io.to(gameState.roomCode).emit('new-question', {
    questionIndex: gameState.currentQuestionIndex,
    questionText: q.questionText,
    options: q.options,
    timeLimit: gameState.timeLimitSec,
    mediaUrl: q.mediaUrl,
    mediaType: q.mediaType,
  });

  io.to(gameState.roomCode).emit('update-answer-count', {
    count: 0,
    totalPlayers: gameState.players.size
  });

  io.to(gameState.roomCode).emit('timer-update', {
    timeRemaining: gameState.timeRemaining,
  });

  // Only start timer if limit > 0
  if (gameState.timeLimitSec > 0) {
    gameState.timerId = setInterval(() => {
      gameState.timeRemaining -= 1;

      io.to(gameState.roomCode).emit('timer-update', {
        timeRemaining: gameState.timeRemaining,
      });

      if (gameState.timeRemaining <= 0) {
        // Time's up -> Auto move to Feedback
        startFeedbackPhase(io, gameState);
      }
    }, 1000);
  }
}

function startFeedbackPhase(io, gameState) {
  clearTimer(gameState);
  clearAutoAdvance(gameState);

  // Ensure scores are calculated
  calculateScores(io, gameState);

  gameState.phase = 'feedback';
  gameState.acceptingAnswers = false;

  const q = gameState.questions[gameState.currentQuestionIndex];
  io.to(gameState.roomCode).emit('round-ended', {
    correctOptionIndex: q ? q.correctOptionIndex : 0,
  });

  // AUTO-ADVANCE LOGIC
  // If timeLimit > 0, we auto-advance to Intermission after 3s.
  // If timeLimit == 0, we WAIT for host.
  if (gameState.timeLimitSec > 0) {
    gameState.autoAdvanceTimeoutId = setTimeout(() => {
      startIntermissionPhase(io, gameState);
    }, 3000);
  }
}

function startIntermissionPhase(io, gameState) {
  clearTimer(gameState);
  clearAutoAdvance(gameState);

  gameState.phase = 'intermission';

  io.to(gameState.roomCode).emit('score-update', {
    leaderboard: buildLeaderboard(gameState),
    isIntermission: true,
  });

  // AUTO-ADVANCE LOGIC
  // If timeLimit > 0, we auto-advance to Next Question after 5s.
  if (gameState.timeLimitSec > 0) {
    gameState.autoAdvanceTimeoutId = setTimeout(() => {
      startNextQuestion(io, gameState);
    }, 5000);
  }
}

function startNextQuestion(io, gameState) {
  gameState.currentQuestionIndex += 1;
  if (gameState.currentQuestionIndex >= gameState.questions.length) {
    void endGame(io, gameState);
    return;
  }
  startQuestionPhase(io, gameState);
}

// Helper to calculate score for the current round
function calculateScores(io, gameState) {
  const qIndex = gameState.currentQuestionIndex;
  const q = gameState.questions[qIndex];
  if (!q) return;

  const answerMap = gameState.answersByQuestionIndex.get(qIndex) || new Map();

  for (const player of gameState.players.values()) {
    const submission = answerMap.get(player.userId);
    const selectedOptionIndex = submission?.selectedOptionIndex;
    const timeRemainingAtSubmit = submission?.timeRemainingAtSubmit ?? 0;

    const isCorrect =
      typeof selectedOptionIndex === 'number' && selectedOptionIndex === q.correctOptionIndex;

    let pointsEarned = 0;
    if (isCorrect) {
      // Kahoot-style Scoring
      // Max: 1000, Min: 500 (decay over time)
      // If timeLimit is 0 (infinite mode), default to max points? Or fixed?
      // User said "based on time". If infinite time, timeRemaining implies chaos.
      // Let's assume infinite mode = full 1000 pts if correct.

      if (gameState.timeLimitSec <= 0) {
        pointsEarned = 1000;
      } else {
        const ratio = timeRemainingAtSubmit / gameState.timeLimitSec;
        // Ensure ratio is between 0 and 1 (just in case)
        const safeRatio = Math.max(0, Math.min(1, ratio));
        pointsEarned = Math.round(500 + (500 * safeRatio));
      }
    }

    player.score += pointsEarned;

    // We emit individual results here? Or previously we did.
    // Yes, client expects 'answer-result'.
    io.to(gameState.roomCode).emit('answer-result', {
      userId: player.userId,
      isCorrect,
      correctOptionIndex: q.correctOptionIndex,
      pointsEarned,
    });
  }
}

async function endGame(io, gameState) {
  clearTimer(gameState);
  clearAutoAdvance(gameState);
  gameState.status = 'finished';
  gameState.phase = 'finished';
  gameState.acceptingAnswers = false;

  const finalLeaderboard = buildLeaderboard(gameState);
  const winner = finalLeaderboard[0] || null;

  io.to(gameState.roomCode).emit('game-ended', {
    winner,
    finalLeaderboard,
  });

  // Persist final outcome
  try {
    const gameResult = await GameResult.create({
      roomCode: gameState.roomCode,
      players: finalLeaderboard.map(p => ({
        userId: p.userId,
        username: p.username,
        score: p.score
      })),
      winner: winner?.userId,
      playedAt: new Date(),
    });

    const User = require('../models/User');
    const bulkOps = finalLeaderboard.map(p => {
      const isWinner = winner && winner.userId === p.userId;
      return {
        updateOne: {
          filter: { _id: p.userId },
          update: {
            $inc: {
              'stats.gamesPlayed': 1,
              'stats.totalPoints': p.score,
              'stats.wins': isWinner ? 1 : 0
            }
          }
        }
      };
    });

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }

    await GameRoom.updateOne(
      { roomCode: gameState.roomCode },
      { $set: { status: 'finished', currentQuestionIndex: gameState.currentQuestionIndex } }
    );
  } catch (err) {
    console.error('Failed to persist game result:', err);
  } finally {
    liveGames.delete(gameState.roomCode);
  }
}
// -------------------------------------------------------------

async function startGame(io, socket, roomCode) {
  const normalizedRoomCode = (roomCode || '').toUpperCase();
  if (!normalizedRoomCode) {
    socket.emit('error', { message: 'roomCode is required' });
    return;
  }

  const room = await GameRoom.findOne({ roomCode: normalizedRoomCode });
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }

  if (room.hostId.toString() !== socket.user.id) {
    socket.emit('error', { message: 'Only host can start the game' });
    return;
  }

  if (room.status !== 'waiting') {
    socket.emit('error', { message: 'Game already started' });
    return;
  }

  const gameState = getOrCreateGameState(normalizedRoomCode);
  gameState.hostId = room.hostId.toString();

  const timeLimit = room.settings?.timeLimit !== undefined ? room.settings.timeLimit : DEFAULT_TIME_LIMIT_SEC;
  gameState.timeLimitSec = timeLimit;

  // Sync players from DB
  const User = require('../models/User');
  gameState.players.clear();

  if (room.players && room.players.length > 0) {
    const playerIds = room.players.map(p => p.userId);
    const users = await User.find({ _id: { $in: playerIds } }, 'username _id');
    const userMap = new Map(users.map(u => [u._id.toString(), u.username]));

    for (const p of room.players) {
      const userId = p.userId.toString();
      gameState.players.set(userId, {
        userId,
        username: userMap.get(userId) || userId,
        score: p.score || 0,
        socketId: null,
      });
    }
  }

  let questions = [];
  if (room.quizId) {
    const Quiz = require('../models/Quiz');
    const quiz = await Quiz.findById(room.quizId).populate('questions');
    if (quiz && quiz.questions.length > 0) {
      questions = quiz.questions;
    }
  } else {
    questions = await Question.aggregate([{ $sample: { size: DEFAULT_QUESTION_COUNT } }]);
  }

  if (!questions || questions.length === 0) {
    socket.emit('error', { message: 'No questions available' });
    return;
  }

  gameState.questions = questions;
  gameState.currentQuestionIndex = 0;
  gameState.status = 'live';
  gameState.answersByQuestionIndex.clear();

  await GameRoom.updateOne(
    { roomCode: normalizedRoomCode },
    { $set: { status: 'live', currentQuestionIndex: 0 } }
  );

  io.to(normalizedRoomCode).emit('game-started', {
    roomCode: normalizedRoomCode,
    totalQuestions: questions.length
  });

  // START!
  startQuestionPhase(io, gameState);
}

module.exports = function registerGameSocket(io, socket) {
  socket.on('join-room', async (payload = {}) => {
    try {
      const roomCode = (payload.roomCode || '').toUpperCase();
      const userId = payload.userId;
      const username = payload.username;

      console.log(`[SOCKET DEBUG] join-room request:`, { roomCode, userId, username, socketUser: socket.user.id });

      if (!roomCode || !userId) {
        socket.emit('error', { message: 'roomCode and userId are required' });
        return;
      }

      if (socket.user.id !== userId) {
        socket.emit('error', { message: 'User mismatch' });
        return;
      }

      const room = await GameRoom.findOne({ roomCode });
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      socket.join(roomCode);
      const gameState = getOrCreateGameState(roomCode);

      const existing = gameState.players.get(userId);
      if (existing) {
        existing.socketId = socket.id;
        if (username) existing.username = username;
      } else {
        gameState.players.set(userId, {
          userId,
          username: username || socket.user.username || userId,
          score: 0,
          socketId: socket.id,
        });
      }

      io.to(roomCode).emit('player-joined', {
        username: username || socket.user.username || userId,
        totalPlayers: gameState.players.size,
        players: buildLeaderboard(gameState),
      });

      // If late joiner, send current state info?
      // MVP: they might miss current question context.
      // Ideally we send 'sync-state' here.

    } catch (err) {
      console.error(err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('start-game', async (payload = {}) => {
    try {
      await startGame(io, socket, payload.roomCode);
    } catch (err) {
      console.error(err);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  socket.on('submit-answer', (payload = {}) => {
    try {
      const roomCode = (payload.roomCode || '').toUpperCase();
      const userId = payload.userId;
      const selectedOptionIndex = payload.selectedOptionIndex;

      if (!roomCode || !userId) return;

      const gameState = liveGames.get(roomCode);
      if (!gameState || gameState.status !== 'live') return;
      if (!gameState.acceptingAnswers) return;

      if (socket.user.id !== userId) return;

      const q = gameState.questions[gameState.currentQuestionIndex];
      if (!q) return;

      let answerMap = gameState.answersByQuestionIndex.get(gameState.currentQuestionIndex);
      if (!answerMap) {
        answerMap = new Map();
        gameState.answersByQuestionIndex.set(gameState.currentQuestionIndex, answerMap);
      }

      if (answerMap.has(userId)) return; // Already answered

      answerMap.set(userId, {
        selectedOptionIndex,
        timeRemainingAtSubmit: gameState.timeRemaining,
      });

      gameState.answersCount = (gameState.answersCount || 0) + 1;

      io.to(roomCode).emit('update-answer-count', {
        count: gameState.answersCount,
        totalPlayers: gameState.players.size
      });

      // CHECK: Have all players answered?
      // UNTIMED MODE ONLY (timeLimit <= 0):
      // If everyone has answered, there is no timer to wait for, so we should
      // automatically advance to the feedback phase (User Request).
      if (gameState.timeLimitSec <= 0 && gameState.answersCount >= gameState.players.size) {
        setTimeout(() => {
          if (gameState.phase === 'question') {
            startFeedbackPhase(io, gameState);
          }
        }, 1000); // Small delay to show selection
      }

    } catch (err) {
      console.error(err);
    }
  });

  socket.on('skip-timer', (payload = {}) => {
    // "End Question Manually"
    const roomCode = (payload.roomCode || '').toUpperCase();
    const gameState = liveGames.get(roomCode);
    if (!gameState) return;
    if (gameState.hostId && gameState.hostId !== socket.user.id) return;

    if (gameState.phase === 'question') {
      // Manually triggering end of question.
      // This should lead to Feedback.
      // Note: If Auto-Advance is enabled (timeLimit > 0),
      // startFeedbackPhase WILL schedule the auto-advance.
      // This is desired (Host skips the wait, but game flows on).
      startFeedbackPhase(io, gameState);
    }
  });

  socket.on('host-next-stage', (payload = {}) => {
    const roomCode = (payload.roomCode || '').toUpperCase();
    const gameState = liveGames.get(roomCode);
    if (!gameState) return;
    if (gameState.hostId && gameState.hostId !== socket.user.id) return;

    // Manual overrides for phases
    if (gameState.phase === 'question') {
      startFeedbackPhase(io, gameState);
      return;
    }

    if (gameState.phase === 'feedback') {
      startIntermissionPhase(io, gameState);
      return;
    }

    if (gameState.phase === 'intermission') {
      startNextQuestion(io, gameState);
      return;
    }
  });

  socket.on('disconnect', () => {
  });
};
