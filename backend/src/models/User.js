const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: 'Ready to storm the quiz!' },
    stats: {
      wins: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
    },
    // Left for backwards compatibility if needed, but stats.totalPoints is preferred now
    totalScore: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('User', userSchema);
