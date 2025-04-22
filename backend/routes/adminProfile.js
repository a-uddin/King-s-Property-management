// routes/adminProfile.js
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");

// Custom middleware to extract user ID from token (assumes AuthContext stores _id in localStorage)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    req.userId = payload.userId || payload._id || payload.id;
    next();
  } catch (err) {
    console.error("Token decode failed:", err.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// PATCH /api/admin-profile/update
router.patch("/update", verifyToken, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const update = { firstName, lastName, email };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      update.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "Profile updated successfully ✅", updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Server error during profile update." });
  }
});

module.exports = router;
