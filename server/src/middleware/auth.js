const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Login required' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ error: 'Not allowed for your role' });
}

module.exports = { authenticate, requireRole };