const express = require("express");
const router = express.Router();
const Asset = require("../models/Asset");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

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
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: "Asset deleted successfully" });
  } catch (err) {
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

  
  
  
  

module.exports = router;
