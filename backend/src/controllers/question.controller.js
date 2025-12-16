const Question = require('../models/Question');

async function getRandomQuestions(req, res) {
  const requested = parseInt(req.query.count || '5', 10);
  const count = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 20) : 5;

  const questions = await Question.aggregate([
    { $sample: { size: count } },
    {
      $project: {
        questionText: 1,
        options: 1,
        category: 1,
        difficulty: 1,
        // NEVER expose correctOptionIndex over REST
      },
    },
  ]);

  return res.json({ questions });
}

module.exports = {
  getRandomQuestions,
};
