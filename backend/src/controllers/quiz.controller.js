const Quiz = require('../models/Quiz');

async function getAllQuizzes(req, res) {
    try {
        const quizzes = await Quiz.find({ isPublic: true }).select('title description thumbnail difficulty questions');
        // Return question count for UI
        const result = quizzes.map(q => ({
            _id: q._id,
            title: q.title,
            description: q.description,
            thumbnail: q.thumbnail,
            difficulty: q.difficulty,
            questionCount: q.questions.length
        }));
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
}

async function getQuizById(req, res) {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id).populate('questions');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        return res.json(quiz);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch quiz' });
    }
}

module.exports = {
    getAllQuizzes,
    getQuizById
};
