const express = require('express');

const authMiddleware = require('../middleware/auth.middleware');
const { getRandomQuestions } = require('../controllers/question.controller');

const router = express.Router();

router.get('/random', authMiddleware, (req, res, next) => {
  Promise.resolve(getRandomQuestions(req, res)).catch(next);
});

module.exports = router;
