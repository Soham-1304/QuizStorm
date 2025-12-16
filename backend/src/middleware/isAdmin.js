/**
 * Middleware to check if the authenticated user is an admin
 * Assumes authenticateToken middleware has already run and populated req.user
 */
function isAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // Check role from req.user (which comes from the JWT payload or DB lookup)
    // Ideally, we should check against the DB to be sure, but for MVP JWT payload is fast.
    // However, since we just updated the schema, existing tokens won't have the role.
    // So we might need to rely on the user object populated by a previous middleware 
    // or fetch it here if not present.

    // For safety in this "Enhancement Phase", let's assume req.user might just contain {id, username}
    // If we really want security, we fetch the full user.

    const User = require('../models/User');

    User.findById(req.user.id)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied: Mods only!' });
            }

            // Update req.user with full details including new schema fields
            req.user = user;
            next();
        })
        .catch(err => {
            console.error('Admin check error:', err);
            res.status(500).json({ message: 'Internal server error' });
        });
}

module.exports = isAdmin;
