const User = require('../models/User');
const GameRoom = require('../models/GameRoom');
const Question = require('../models/Question');
const GameResult = require('../models/GameResult');

async function getStats(req, res) {
    try {
        const totalUsers = await User.countDocuments();
        const totalGames = await GameResult.countDocuments();
        const activeRooms = await GameRoom.countDocuments({ status: { $ne: 'finished' } });
        const totalQuestions = await Question.countDocuments();

        return res.json({
            totalUsers,
            totalGames,
            activeRooms,
            totalQuestions,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch stats' });
    }
}

async function addQuestion(req, res) {
    try {
        const { questionText, options, correctOptionIndex, timeLimit } = req.body;

        if (!questionText || !options || options.length < 2 || correctOptionIndex === undefined) {
            return res.status(400).json({ message: 'Invalid question data' });
        }

        const question = await Question.create({
            questionText,
            options,
            correctOptionIndex,
            timeLimit: timeLimit || 20,
        });

        return res.status(201).json(question);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to add question' });
    }
}

async function deleteQuestion(req, res) {
    try {
        const { id } = req.params;
        await Question.findByIdAndDelete(id);
        return res.json({ message: 'Question deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete question' });
    }
}

async function getQuestions(req, res) {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        return res.json(questions);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch questions' });
    }
}

async function resetRoom(req, res) {
    try {
        const { roomCode } = req.params;
        await GameRoom.updateOne({ roomCode }, { $set: { status: 'finished' } });
        return res.json({ message: `Room ${roomCode} forced to finish` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to reset room' });
    }
}

module.exports = {
    getStats,
    addQuestion,
    deleteQuestion,
    getQuestions,
    resetRoom,
};
