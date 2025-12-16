const express = require('express');

const authMiddleware = require('../middleware/auth.middleware');
const { createRoom, joinRoom, getRoom } = require('../controllers/game.controller');

const router = express.Router();

router.post('/create', authMiddleware, (req, res, next) => {
  Promise.resolve(createRoom(req, res)).catch(next);
});

router.post('/join', authMiddleware, (req, res, next) => {
  Promise.resolve(joinRoom(req, res)).catch(next);
});

router.get('/:roomCode', authMiddleware, (req, res, next) => {
  Promise.resolve(getRoom(req, res)).catch(next);
});

module.exports = router;
