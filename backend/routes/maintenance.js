const express = require("express");
const router = express.Router();
const Asset = require("../models/Asset");
const MaintenanceTask = require("../models/MaintenanceTask");
const nodemailer = require("nodemailer");
const OngoingMaintenance = require('../models/OngoingMaintenance');

// Fetch upcoming maintenance tasks (based on scheduledMaintenance date in the future)
router.get("/upcoming-maintenance", async (req, res) => {
  try {
    const today = new Date();

    const assets = await Asset.find({
      scheduledMaintenance: { $gte: today },
    }).populate("assignedTo", "firstName lastName email companyName");

    res.json(assets);
  } catch (error) {
    console.error("Error fetching upcoming maintenance:", error);
    res.status(500).json({ message: "Server error while fetching maintenance" });
  }
});

// Save maintenance type and notes into MaintenanceTask collection
router.patch("/:id/update", async (req, res) => {
  try {
    const { maintenanceType, maintenanceNotes } = req.body;
    const assetId = req.params.id;

    // 1. Find asset and populate assigned user
    const asset = await Asset.findById(assetId).populate("assignedTo");
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // 2. Create maintenance task document
    const newTask = new MaintenanceTask({
      asset: asset._id,
      type: maintenanceType,
      notes: maintenanceNotes,
      scheduledDate: asset.scheduledMaintenance,
      assignedTo: asset.assignedTo?._id || null,
    });

    await newTask.save();

    // 3. Send email to assigned user (if exists)
    if (asset.assignedTo && asset.assignedTo.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Kings Property Portal" <${process.env.EMAIL_USER}>`,
        to: asset.assignedTo.email,
        subject: "🛠️ New Maintenance Task Assigned",
        text: `Hello ${asset.assignedTo.firstName},

A new maintenance task has been added for the asset: ${asset.assetName}.

🗓️ Date: ${asset.scheduledMaintenance.toDateString()}
🧰 Type: ${maintenanceType}
📝 Notes: ${maintenanceNotes || "No additional notes"}

Please log in to your dashboard to view details.

- Kings Property Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log("📧 Maintenance email sent to:", asset.assignedTo.email);
    }

    res.json({ message: "✅ Maintenance saved & email sent", task: newTask });
  } catch (error) {
    console.error("❌ Error saving maintenance task:", error);
    res.status(500).json({ message: "Server error while saving task" });
  }
});

// GET all saved maintenance tasks
router.get("/all", async (req, res) => {
    try {
      const tasks = await MaintenanceTask.find()
        .populate("asset", "assetName location status")
        .populate("assignedTo", "firstName lastName email");
  
      res.json(tasks);
    } catch (err) {
      console.error("Error fetching maintenance tasks:", err);
      res.status(500).json({ message: "Server error fetching tasks" });
    }
  });

  // Get all maintenance task logs
router.get("/logs", async (req, res) => {
    try {
      const logs = await MaintenanceTask.find()
        .populate("asset", "assetName location")
        .populate("assignedTo", "firstName lastName");
      res.json(logs);
    } catch (err) {
      console.error("Error fetching maintenance logs:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // GET all ongoing maintenance
router.get('/ongoing-maintenance', async (req, res) => {
  try {
    const records = await OngoingMaintenance.find()
      .populate('assignedTo', 'firstName lastName role email') 
      .sort({ updatedAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ongoing maintenance tasks.' });
  }
});


// GET all ongoing maintenacne 
router.get("/ongoing-maintenance/by-assigned-task/:assignedTaskId", async (req, res) => {
  try {
    const assignedTaskId = req.params.assignedTaskId;

    // Find the assigned task to extract key fields
    const assignedTask = await require("../models/AssignedTask").findById(assignedTaskId);
    if (!assignedTask) return res.status(404).json({ message: "Assigned task not found" });

    // Now find the matching ongoingmaintenance entry
    const ongoing = await require("../models/OngoingMaintenance").findOne({
      assetName: assignedTask.assetName,
      assetType: assignedTask.assetType,
      location: assignedTask.location,
      assignedTo: assignedTask.assignedTo,
      task: assignedTask.note,
    });

    if (!ongoing) return res.status(404).json({ message: "Ongoing maintenance not found" });

    res.json(ongoing);
  } catch (err) {
    console.error("Error finding ongoing maintenance by task:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



// PATCH update status or priority or estimatedCompletion
router.patch('/ongoing-maintenance/:id', async (req, res) => {
  try {
    const updateFields = {};

    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.priority) updateFields.priority = req.body.priority;
    if (req.body.estimatedCompletion) updateFields.estimatedCompletion = req.body.estimatedCompletion;

    updateFields.updatedAt = new Date();

    const result = await OngoingMaintenance.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!result) return res.status(404).json({ message: 'Maintenance task not found' });

    res.json({ message: 'Updated successfully', data: result });
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(500).json({ message: 'Failed to update maintenance task' });
  }
});

module.exports = router;
