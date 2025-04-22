const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Your existing User model
const requireAuth = require("../middleware/requireAuth");
const checkRole = require("../middleware/checkRole");

// GET /api/all-members - Only admin can access all approved users
router.get("/approved", requireAuth, checkRole("admin"), async (req, res) => {
  try {
    const approvedUsers = await User.find({ approved: true }).select(
      "firstName lastName email role approved phone address"
    );
    res.status(200).json(approvedUsers);
  } catch (error) {
    console.error("Error fetching all approved members:", error);
    res.status(500).json({ message: "Server error fetching members" });
  }
});

// PUT /api/all-members/:id - Update user details
router.put("/:id", requireAuth, checkRole("admin"), async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, role } = req.body;
  
    try {
      const updated = await User.findByIdAndUpdate(
        id,
        {
          firstName,
          lastName,
          email,
          phone,
          address,
          role,
        },
        { new: true, runValidators: true }
      );
  
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "User updated successfully", user: updated });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Update failed", error: err });
    }
  });

  // DELETE /api/all-members/:id - Delete a user
router.delete("/:id", requireAuth, checkRole("admin"), async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Delete failed" });
    }
  });
  
  
module.exports = router;
