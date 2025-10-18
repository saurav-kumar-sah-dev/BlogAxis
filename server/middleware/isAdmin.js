module.exports = function isAdmin(req, res, next) {
  try {
    if (req.user?.role === 'admin') return next();
    // Some auth strategies put the full user; if not, allow a separate hydration layer to set role
    if (req.user && req.user.isAdmin) return next();
    return res.status(403).json({ error: 'Admin only' });
  } catch {
    return res.status(403).json({ error: 'Admin only' });
  }
};


