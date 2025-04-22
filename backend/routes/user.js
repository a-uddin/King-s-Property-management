const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { expressjwt: jwt } = require("express-jwt");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const requireAuth = require("../middleware/requireAuth");


// ✅ Middleware for protected routes
/* const requireAuth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});
 */
// ✅ Pending approval route (existing - keep as-is)
router.get("/pending", async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false });
    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Approve user + assign role + send email (NEW block added safely)
router.patch("/:id/approve", requireAuth, async (req, res) => {
  try {
    const { role, message } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true, role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Send email using Nodemailer
    await sendEmail(
      updatedUser.email,
      "Your Registration Has Been Approved",
      `Hello ${updatedUser.firstName},\n\n${message}\n\nYour role: ${role}`
    );

    res.json({ message: "User approved and notified", user: updatedUser });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Server error during approval" });
  }
});

// ✅ Reject user and send rejection email (uses sendEmail.js + requireAuth)
router.patch("/:id/reject", requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    console.log("🧾 Received rejection message:", message || "[EMPTY]");

    const user = await User.findById(req.params.id);
    if (!user || !user.email) {
      console.error("❌ No valid recipient email address provided.");
      return res.status(400).json({ error: "Invalid or missing user email" });
    }

    // ✅ Send rejection email using sendEmail.js (your utility)
    await sendEmail(
      user.email,
      "❌ Registration Rejected - Kings Property Portal",
      `Hello ${user.firstName},\n\nWe regret to inform you that your registration was rejected.${
        message ? `\n\nReason:\n${message}` : ""
      }\n\nBest regards,\nKings Property Team`
    );

    // ✅ Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User rejected and email sent" });
  } catch (err) {
    console.error("❌ Rejection error:", err);
    res.status(500).json({ message: "Server error during rejection" });
  }
});


// ✅ Fetch all approved users (staff + external_company)
router.get("/approved-users", async (req, res) => {
  try {
    const users = await User.find({
      approved: true,
      role: { $in: ["staff", "external_company"] },
    }).select("firstName lastName role email"); // Keep it lightweight
    res.json(users);
  } catch (err) {
    console.error("Error fetching approved users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ CORRECT
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch all users:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ New PATCH route to update profile
// PATCH profile route
router.patch("/profile/update", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const userId = req.user.id;

    console.log("🔧 Updating user ID:", userId);

    const updatedFields = { firstName, lastName, email };
    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(userId, updatedFields);

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
