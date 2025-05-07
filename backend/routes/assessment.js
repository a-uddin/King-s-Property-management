// backend/routes/assessment.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const AssignedTask = require("../models/AssignedTask");
const User = require("../models/User");
const Assessment = require("../models/Assessment");
const requireAuth = require("../middleware/requireAuth");
const extractAssessor = require("../middleware/extractAssessor");

router.use(requireAuth);

// @route   GET /api/assessments
// @desc    Fetch all assets with assignment data (future: assessment)
// @access  Protected
router.get("/", async (req, res) => {
  try {
    const assets = await Asset.find().lean();
    const assignedTasks = await AssignedTask.find().lean();
    const users = await User.find().lean();
    const assessments = await Assessment.find().lean();

    const result = assets.map((asset) => {
      const task = assignedTasks.find(
        (t) => t.assetName === asset.assetName && t.assignedTo
      );

      const assignedUserId = task?.assignedTo || asset.assignedTo;

      const assignedUser = users.find(
        (u) => u._id.toString() === assignedUserId?.toString()
      );

      const assetAssessments = assessments
        .filter((a) => a.assetID?.toString() === asset._id.toString())
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

      const assessment = assetAssessments[0]; // get the latest one

      return {
        _id: asset._id,
        assetName: asset.assetName,
        assetType: asset.assetType,
        location: asset.location,
        status: asset.status,
        purchaseDate: asset.purchaseDate,
        purchaseValue: asset.currentValue, // ✅ this is original price from Asset page
        assignedTo: assignedUser
          ? `${assignedUser.firstName} ${assignedUser.lastName}`
          : "Unassigned",
        currentValue: assessment?.marketValue || null,
        lastAssessedDate: assessment?.date || null,
        status: assessment?.status || null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("GET /api/assessments error:", err.message);
    res.status(500).json({ error: "Failed to fetch assessment data" });
  }
});

// @route   POST /api/assessments
// @desc    Add or update assessment (1 per asset)
// @access  Protected
// @route   POST /api/assessments
// @desc    Save a new assessment entry
router.post("/", extractAssessor, async (req, res) => {
  try {
    const { assetID, marketValue, remarks, status } = req.body;

    if (!assetID || !marketValue) {
      return res.status(400).json({ message: "Asset and value required." });
    }

    const assessorID = req.user.id;
    console.log("✅ assessorID from req.auth:", assessorID);

    if (!assessorID) {
      console.error("❌ assessorID missing – req.user:", req.user);
      return res
        .status(401)
        .json({ message: "Unauthorized: assessor not found" });
    }

    const assessment = await Assessment.create({
      assetID,
      assessorID,
      marketValue,
      remarks,
      status: status || "Reviewed", // default to Reviewed
      date: new Date(),
    });

    res.status(200).json({
      message: "✅ New assessment added",
      assessment,
    });
  } catch (err) {
    console.error("Error saving assessment:", err);
    res.status(500).json({ error: "Failed to save assessment" });
  }
});

// @route   GET /api/assessments/:assetID/history
// @desc    Get all assessments for a specific asset
// @access  Protected
router.get("/:assetID/history", async (req, res) => {
  const { assetID } = req.params;

  try {
    const assessments = await Assessment.find({ assetID })
  .sort({ date: -1 })
  .populate("assessorID", "firstName lastName email")
  .populate("assetID", "currentValue"); 

    res.status(200).json(assessments);
  } catch (err) {
    console.error("❌ Failed to fetch assessment history:", err.message);
    res.status(500).json({ error: "Failed to fetch assessment history" });
  }
});

// DELETE /api/assessments/:assetID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Assessment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


// GET /api/assessments/assigned-only
// Returns only assets assigned for Assessment tasks
router.get("/assigned-only", async (req, res) => {
  try {
    const assets = await Asset.find().lean();
    const assignedTasks = await AssignedTask.find({ assignedFor: "Assessment" }).lean();
    const users = await User.find().lean();
    const assessments = await Assessment.find().lean();

    const result = assets
      .filter((asset) =>
        assignedTasks.some((t) => t.assetName === asset.assetName)
      )
      .map((asset) => {
        const task = assignedTasks.find((t) => t.assetName === asset.assetName);
        const assignedUserId = task?.assignedTo || asset.assignedTo;

        const assignedUser = users.find(
          (u) => u._id.toString() === assignedUserId?.toString()
        );

        const assetAssessments = assessments
          .filter((a) => a.assetID?.toString() === asset._id.toString())
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        const assessment = assetAssessments[0];

        return {
          _id: asset._id,
          assetName: asset.assetName,
          assetType: asset.assetType,
          location: asset.location,
          status: asset.status,
          purchaseDate: asset.purchaseDate,
          purchaseValue: asset.currentValue,
          assignedTo: assignedUser
            ? `${assignedUser.firstName} ${assignedUser.lastName}`
            : "Unassigned",
          currentValue: assessment?.marketValue || null,
          lastAssessedDate: assessment?.date || null,
          status: assessment?.status || null,
        };
      });

    res.json(result);
  } catch (err) {
    console.error("GET /api/assessments/assigned-only error:", err.message);
    res.status(500).json({ error: "Failed to fetch assessment-assigned assets" });
  }
});


module.exports = router;
