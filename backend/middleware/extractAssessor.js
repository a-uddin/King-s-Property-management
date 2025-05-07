const User = require("../models/User");

const extractAssessor = async (req, res, next) => {
  try {
    if (req.auth?.id) {
      req.assessorID = req.auth.id;
    } else if (req.auth?.sub) {
      // fallback: look up by unique auth field (email or sub)
      const user = await User.findOne({ auth0Id: req.auth.sub }); // Or adjust to match your token
      if (user) {
        req.assessorID = user._id;
        return next();
      }
    } else if (req.auth?.email) {
      const user = await User.findOne({ email: req.auth.email });
      if (user) {
        req.assessorID = user._id;
        return next();
      }
    }

    // Fallback failure
    req.assessorID = null;
    console.warn("⚠️ assessorID not found in token");
    return next();
  } catch (err) {
    console.error("❌ extractAssessor error:", err.message);
    req.assessorID = null;
    return next();
  }
};

module.exports = extractAssessor;
