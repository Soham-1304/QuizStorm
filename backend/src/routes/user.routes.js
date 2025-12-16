const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/profile/:username', userController.getProfile);

// Authenticated routes
router.use(authenticateToken);
router.get('/history', userController.getHistory);
router.put('/profile', userController.updateProfile);

module.exports = router;
