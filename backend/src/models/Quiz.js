const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        thumbnail: { type: String, default: '' }, // URL/Emoji
        questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isPublic: { type: Boolean, default: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
