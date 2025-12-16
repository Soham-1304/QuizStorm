const GameRoom = require('../models/GameRoom');

/* Helper to format room response with usernames */
async function getPopulatedRoom(roomDocument) {
  // We need to re-fetch or populate the document to ensure we have username
  // If roomDocument is already a query result, we can populate it. 
  // But safest is often to just re-fetch with populate if we're not sure of state, 
  // or use execPopulate (deprecated) / populate() on the doc.
  // Since we are returning standard JSON, let's just make sure we populate.

  await roomDocument.populate('players.userId', 'username');
  await roomDocument.populate('quizId', 'title thumbnail'); // Populate basic quiz info

  // Transform to clean format
  return {
    roomCode: roomDocument.roomCode,
    hostId: roomDocument.hostId,
    quiz: roomDocument.quizId ? {
      title: roomDocument.quizId.title,
      thumbnail: roomDocument.quizId.thumbnail
    } : null,
    settings: roomDocument.settings,
    players: roomDocument.players.map(p => ({
      userId: p.userId._id || p.userId, // Handle both populated and unpopulated cases safely
      username: p.userId.username || 'Unknown',
      score: p.score
    })),
    currentQuestionIndex: roomDocument.currentQuestionIndex,
    status: roomDocument.status,
    createdAt: roomDocument.createdAt,
  };
}

function generateRoomCode() {
  // Simple 6-char code (MVP). Collision chances are low; retry if needed.
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function createRoom(req, res) {
  try {
    const { quizId, settings } = req.body;

    // Default settings if not provided
    const roomSettings = {
      timeLimit: 20,
      isHostPlaying: true,
      ...settings
    };

    let roomCode = generateRoomCode();
    // Ensure roomCode is unique
    // eslint-disable-next-line no-await-in-loop
    while (await GameRoom.findOne({ roomCode })) {
      roomCode = generateRoomCode();
    }

    const room = await GameRoom.create({
      roomCode,
      hostId: req.user.id,
      players: [],
      quizId: quizId || null,
      settings: roomSettings,
      status: 'waiting',
      createdAt: new Date(),
    });

    // If host is playing, add them to players list
    if (roomSettings.isHostPlaying) {
      room.players.push({ userId: req.user.id, score: 0 });
      await room.save();
    }

    // Populate the room with user details before sending response
    const populatedRoom = await getPopulatedRoom(room);

    return res.status(201).json(populatedRoom);
  } catch (err) {
    console.error('Error creating room:', err);
    return res.status(500).json({ message: 'Error creating room', error: err.message });
  }
}

async function joinRoom(req, res) {
  const { roomCode } = req.body;
  const userId = req.user.id;

  if (!roomCode) {
    return res.status(400).json({ message: 'roomCode is required' });
  }

  const normalizedRoomCode = roomCode.toUpperCase();
  const room = await GameRoom.findOne({ roomCode: normalizedRoomCode });

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (room.status !== 'waiting') {
    return res.status(409).json({ message: 'Game already started' });
  }

  const alreadyInRoom = room.players.some((p) => p.userId.toString() === userId);
  if (!alreadyInRoom) {
    room.players.push({ userId, score: 0 });
    await room.save();
  }

  const response = await getPopulatedRoom(room);
  return res.json(response);
}

async function getRoom(req, res) {
  const { roomCode } = req.params;

  const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const response = await getPopulatedRoom(room);
  return res.json(response);
}

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
};
