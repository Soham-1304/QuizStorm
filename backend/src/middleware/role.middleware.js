// MVP placeholder: add role checks later if required.
function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!requiredRole) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = roleMiddleware;
