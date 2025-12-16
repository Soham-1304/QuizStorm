const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/isAdmin');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// All routes require authentication AND admin role
router.use(authenticateToken);
router.use(isAdmin);

router.get('/stats', adminController.getStats);
router.get('/questions', adminController.getQuestions);
router.post('/questions', adminController.addQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);
router.post('/reset-game/:roomCode', adminController.resetRoom);

module.exports = router;
