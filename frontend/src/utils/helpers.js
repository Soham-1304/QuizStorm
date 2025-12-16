/**
 * Utility helper functions
 */

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get timer color based on remaining time
 * @param {number} timeRemaining - Remaining time in seconds
 * @param {number} totalTime - Total time in seconds
 * @returns {string} Color class or value
 */
export const getTimerColor = (timeRemaining, totalTime) => {
    const percentage = (timeRemaining / totalTime) * 100;

    if (percentage > 50) return 'green';
    if (percentage > 25) return 'yellow';
    return 'red';
};

/**
 * Sort leaderboard by score (descending)
 * @param {Array} leaderboard - Leaderboard array
 * @returns {Array} Sorted leaderboard
 */
export const sortLeaderboard = (leaderboard) => {
    return [...leaderboard].sort((a, b) => b.score - a.score);
};

/**
 * Get user rank in leaderboard
 * @param {Array} leaderboard - Sorted leaderboard
 * @param {string} userId - User ID
 * @returns {number} Rank (1-indexed)
 */
export const getUserRank = (leaderboard, userId) => {
    const sorted = sortLeaderboard(leaderboard);
    return sorted.findIndex((player) => player.userId === userId) + 1;
};
