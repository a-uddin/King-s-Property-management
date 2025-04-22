// middleware/checkRole.js

const User = require('../models/User');

// Middleware to check user role from MongoDB
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { sub } = req.auth;

      const user = await User.findOne({ auth0Id: sub });

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied. Insufficient role.' });
      }

      // Attach full user to request for future use
      req.user = user;

      next();
    } catch (err) {
      console.error('Role check failed:', err);
      res.status(500).json({ message: 'Role verification error' });
    }
  };
};

module.exports = checkRole;
