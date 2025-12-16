const mongoose = require('mongoose');

const gameRoomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true, index: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    players: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          score: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }, // Optional for backward compat, but crucial for new flow
    settings: {
      timeLimit: { type: Number, enum: [0, 10, 15, 20, 30], default: 20 },
      isHostPlaying: { type: Boolean, default: true },
    },
    currentQuestionIndex: { type: Number, default: 0 },
    status: { type: String, enum: ['waiting', 'live', 'finished'], default: 'waiting' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('GameRoom', gameRoomSchema);
