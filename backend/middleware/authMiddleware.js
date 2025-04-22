const jwt = require('jsonwebtoken');

const checkRole = (roles) => {
  return (req, res, next) => {
    const user = req.user; // Will be populated by Auth0 middleware
    if (user && roles.includes(user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
};

module.exports = { checkRole };
