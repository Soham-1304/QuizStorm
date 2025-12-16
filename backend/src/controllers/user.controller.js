const User = require('../models/User');
const GameResult = require('../models/GameResult');

async function getProfile(req, res) {
    try {
        const { username } = req.params;
        console.log(`[DEBUG] getProfile raw request: "${username}"`);

        // Normalize: if username starts with @, remove it. 
        // We assume DB stores usernames WITHOUT @.
        const normalizedUsername = username.startsWith('@') ? username.slice(1) : username;
        console.log(`[DEBUG] Normalized username: "${normalizedUsername}"`);

        const user = await User.findOne({ username: normalizedUsername }).select('-passwordHash -email');

        if (!user) {
            console.log(`[DEBUG] User not found for: "${normalizedUsername}"`);
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch profile' });
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { bio, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { bio, avatar } },
            { new: true }
        ).select('-passwordHash');

        return res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update profile' });
    }
}

async function getHistory(req, res) {
    try {
        const userId = req.user.id;
        // Find games where this user was a player
        const history = await GameResult.find({ 'players.userId': userId })
            .sort({ playedAt: -1 })
            .limit(20)
            .populate('winner', 'username');

        return res.json(history);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch history' });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getHistory,
};
