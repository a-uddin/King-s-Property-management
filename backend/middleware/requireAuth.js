// backend/middleware/requireAuth.js
const { expressjwt: jwt } = require("express-jwt");

// ✅ This version keeps your existing middleware working
const requireAuth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth", // default, this puts decoded data in req.auth
});

// ✅ Middleware to copy req.auth to req.user
const injectUser = (req, res, next) => {
  if (req.auth && req.auth.id) {
    req.user = { id: req.auth.id, role: req.auth.role };
  }
  next();
};

module.exports = [requireAuth, injectUser];
