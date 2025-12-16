const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, index: true },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String },
        score: { type: Number, required: true },
      },
    ],
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('GameResult', gameResultSchema);
