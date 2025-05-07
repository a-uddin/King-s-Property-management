const express = require("express");
const router = express.Router();
const Asset = require("../models/Asset");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const AssignedTask = require("../models/AssignedTask");
const OngoingMaintenance = require('../models/OngoingMaintenance');


// GET all assets
router.get("/", async (req, res) => {
  try {
    const assets = await Asset.find().populate(
      "assignedTo",
      "firstName lastName email"
    );
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE a new asset
router.post("/", async (req, res) => {
  try {
    const {
      assetName,
      assetType,
      location,
      status,
      purchaseDate,
      currentValue,
      assignedTo,
      scheduledMaintenance,
    } = req.body;

    const newAsset = new Asset({
      assetName,
      assetType,
      location,
      status,
      purchaseDate,
      currentValue,
      assignedTo,
      scheduledMaintenance,
    });

    await newAsset.save();

    // 🛠️ Auto-create Assigned Task for new asset
    // it means from Asset page it will sync to Assigned Task page
    await AssignedTask.create({
      assetName: newAsset.assetName,
      assetType: newAsset.assetType,
      location: newAsset.location,
      assignedTo: newAsset.assignedTo || null, // optional
      note: "-", // default note
      taskStatus: "Pending", // default status
    });

    // 🔔 Send email to assigned user
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (user && user.email) {
        await sendEmail({
          to: user.email,
          subject: "🛠️ You've been assigned a new asset",
          text: `Hi ${user.firstName},\n\nYou have been assigned a new asset: ${assetName}. Please log into the portal to view the details.\n\nThanks,\nKings Property Team`,
        });
      }
    }

    res.status(201).json(newAsset);
  } catch (err) {
    console.error("Asset creation error:", err.message);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

// UPDATE asset
router.put("/:id", async (req, res) => {
  try {
    const {
      assetName,
      assetType,
      location,
      status,
      purchaseDate,
      currentValue,
      assignedTo,
      scheduledMaintenance,
    } = req.body;

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        assetName,
        assetType,
        location,
        status,
        purchaseDate,
        currentValue,
        assignedTo,
        scheduledMaintenance,
      },
      { new: true }
    );

    // 🔔 Email on reassignment
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (user && user.email) {
        await sendEmail({  
          to: user.email, // backend/utils/asset.js file is handling send email to assigned user.
          subject: "🛠️ You've been assigned a new asset",
          text: `Hi ${user.firstName},\n\nYou have been assigned a new asset: ${assetName}. Please log into the portal to view the details.\n\nThanks,\nKings Property Team`,
        });
      }
    }

    res.json(updatedAsset);
  } catch (err) {
    console.error("Asset update error:", err.message);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// DELETE asset
router.delete("/:id", async (req, res) => {
  try {
    const deletedAsset = await Asset.findByIdAndDelete(req.params.id);

    if (!deletedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // 🛠️ Also delete assigned tasks related to this asset
    await AssignedTask.deleteMany({ assetName: deletedAsset.assetName });

    await OngoingMaintenance.deleteMany({ assetName: deletedAsset.assetName });


    res.json({ message: "Asset and related assigned tasks deleted successfully" });

  } catch (err) {
    console.error("Error deleting asset:", err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});


// ✅ Assign asset to user AND send email
router.put('/:id/assign', async (req, res) => {
  try {
    const { assignedTo } = req.body;
    console.log("Incoming request to assign asset:", req.params.id, "to user:", assignedTo);

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    );

    // 🛠 Also update matching assigned task
if (asset && asset.assetName) {
  await AssignedTask.findOneAndUpdate(
    { assetName: asset.assetName },
    { assignedTo },
    { new: true }
  );
}

    const user = await User.findById(assignedTo);

    if (!user || !user.email) {
      console.log("❌ Assigned user email missing");
      return res.status(400).json({ error: 'User email not found. Cannot send email.' });
    }

    console.log("✅ Sending email to:", user.email);

    await sendEmail({
      to: user.email,
      subject: `🛠️ You've been assigned a new asset`,
      text: `Hi ${user.firstName},\n\nYou have been assigned a new asset: ${asset.assetName}. Please check your dashboard.`,
    });

    // Optionally re-fetch the updated asset with populated user if frontend needs full data
    const updatedAsset = await Asset.findById(req.params.id).populate('assignedTo', 'firstName lastName email');

    res.json({ message: "✅ Asset assigned and email sent", asset: updatedAsset });

  } catch (err) {
    console.error("❌ Assignment error:", err);
    res.status(500).json({ error: 'Failed to assign asset and send email' });
  }
});

  
// New Route to fetch all assets with assigned info
// This Api is for Assigned Task page. 
// with this Api it is featching all asset for Assigned task page

router.get("/assigned-tasks", async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(assets);
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

  
  

module.exports = router;
