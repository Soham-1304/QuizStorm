const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'options must be an array with at least 2 items',
      },
    },
    correctOptionIndex: { type: Number, required: true, min: 0 },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    category: { type: String, default: 'general' },
    difficulty: { type: String, default: 'easy' },
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Question', questionSchema);
