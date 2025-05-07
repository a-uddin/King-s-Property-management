const mongoose = require("mongoose");
const AssignedTask = require("../models/AssignedTask");
const Asset = require("../models/Asset");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const OngoingMaintenance = require("../models/OngoingMaintenance");
const Assessment = require("../models/Assessment");

// @desc    Get all assigned tasks
// @route   GET /api/assigned-tasks
exports.getAllAssignedTasks = async (req, res) => {
  try {
    const tasks = await AssignedTask.find().populate("assignedTo");
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    res.status(500).json({ message: "Failed to fetch assigned tasks" });
  }
};

// @desc    Create a new assigned task
// @route   POST /api/assigned-tasks
exports.createAssignedTask = async (req, res) => {
  try {
    const {
      assetName,
      assetType,
      location,
      assignedTo,
      note,
      scheduledMaintenance,
      taskStatus,
      assignedFor,
    } = req.body;

    if (!assetName || !assignedTo) {
      return res
        .status(400)
        .json({ message: "Asset name and assigned user are required." });
    }

    const newTask = new AssignedTask({
      assetName,
      assetType: assetType || "Unknown",
      location: location || "Unknown",
      assignedTo,
      assignedFor: assignedFor || "Maintenance",
      note,
      scheduledMaintenance,
      taskStatus: taskStatus || "Pending",
    });

    await newTask.save();

    // Also update the corresponding Asset
    await Asset.findOneAndUpdate(
      { assetName: assetName },
      { assignedTo: assignedTo }
    );

    res
      .status(201)
      .json({ message: "Assigned task created successfully.", task: newTask });
  } catch (error) {
    console.error("Error creating assigned task:", error);
    res.status(500).json({ message: "Failed to create assigned task" });
  }
};

const sendAssignmentEmail = async (email, assetName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Kings Estate Agent" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Asset update for You",
      text: `There is an update to an asset: ${assetName}. Please check your dashboard for more details.`,
    });

    console.log("Assignment email sent successfully!");
  } catch (error) {
    console.error("Error sending assignment email:", error.message);
  }
};

// @desc    Update assigned task if exists, otherwise create new
// @route   PATCH /api/assigned-tasks/:id
exports.updateAssignedTask = async (req, res) => {
  try {
    const {
      assignedTo,
      note,
      assetName,
      assetType,
      location,
      taskStatus,
      assignedFor,
    } = req.body;

    if (!assetName || !assignedTo) {
      return res
        .status(400)
        .json({ message: "Asset name and assigned user are required." });
    }

    let assignedTask = await AssignedTask.findById(req.params.id);

    if (assignedTask) {
      // 🔄 Update existing assigned task
      assignedTask.assignedTo = assignedTo;
      assignedTask.note = note || assignedTask.note;
      assignedTask.taskStatus = taskStatus || assignedTask.taskStatus;
      assignedTask.assignedFor = assignedFor || assignedTask.assignedFor;
      await assignedTask.save();

      // 🛠 Sync to OngoingMaintenance collection
      if (taskStatus === "Ongoing") {
        const exists = await OngoingMaintenance.findOne({
          assetName: assignedTask.assetName,
        });

        if (!exists) {
          await OngoingMaintenance.create({
            assetName: assignedTask.assetName,
            assetType: assignedTask.assetType,
            location: assignedTask.location,
            assignedTo: assignedTask.assignedTo,
            task: assignedTask.note,
            status: "Ongoing", // default, redundant
          });
        }
      }
    } else {
      // ➕ Create new assigned task if not found
      assignedTask = new AssignedTask({
        assetName,
        assetType: assetType || "Unknown",
        location: location || "Unknown",
        assignedTo,
        note,
      });
      await assignedTask.save();
    }

    // 🔄 Always update Asset assignedTo field
    await Asset.findOneAndUpdate(
      { assetName: assetName },
      { assignedTo: assignedTo },
      { new: true } // return updated doc
    );

    // Fetch user's email and send assignment email
    const assignedUser = await User.findById(assignedTo);
    if (assignedUser && assignedUser.email) {
      await sendAssignmentEmail(assignedUser.email, assetName);
    }

    res.status(200).json({ message: "Task assigned successfully!" });
  } catch (error) {
    console.error("Error updating assigned task:", error);
    res.status(500).json({ message: "Server error updating assigned task" });
  }
};

// Update TaskStatus

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskStatus } = req.body;

    // Validate ObjectId format first
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task ID format." });
    }

    const updatedTask = await AssignedTask.findByIdAndUpdate(
      id,
      { taskStatus: taskStatus },
      { new: true }
    ).populate("assignedTo", "name");

    if (!updatedTask) {
      return res.status(404).json({ message: "Assigned Task not found." });
    }

    // 🛠 Sync to OngoingMaintenance collection

    // 🔄 Sync to OngoingMaintenance collection
    const match = await OngoingMaintenance.findOne({
      assetName: updatedTask.assetName,
      assetType: updatedTask.assetType,
      location: updatedTask.location,
      assignedTo: updatedTask.assignedTo,
      task: updatedTask.note,
    });

    if (match) {
      // ✅ Just update status
      match.status = taskStatus;
      await match.save();
    } else if (taskStatus === "Ongoing") {
      // 🆕 Create new only if status is 'Ongoing'
      await OngoingMaintenance.create({
        assetName: updatedTask.assetName,
        assetType: updatedTask.assetType,
        location: updatedTask.location,
        assignedTo: updatedTask.assignedTo,
        task: updatedTask.note,
        status: "Ongoing",
        startDate: new Date(),
      });
    }

    res
      .status(200)
      .json({ message: "Task status updated successfully.", updatedTask });
  } catch (error) {
    console.error("Error updating task status:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error updating task status." });
  }
};

exports.getAssignedTasksWithAssetDetails = async (req, res) => {
  try {
    const tasks = await AssignedTask.find().lean();
    const assets = await Asset.find();
    const assetMapByName = {};
    const assetMapById = {};

    assets.forEach((asset) => {
      assetMapByName[asset.assetName] = asset;
      assetMapById[asset._id.toString()] = asset.assetName;
    });

    const assessments = await Assessment.find().sort({ date: -1 }).lean();

    // Map latest assessment by assetName (not assetID) — safe fallback
    const latestAssessmentMap = {};
    for (const a of assessments) {
      const assetName = assetMapById[a.assetID?.toString()];
      if (assetName && !latestAssessmentMap[assetName]) {
        latestAssessmentMap[assetName] = a;
      }
    }

    const enrichedTasks = tasks.map((task) => {
      const assetInfo = assetMapByName[task.assetName] || {};
      const latest = latestAssessmentMap[task.assetName] || {};

      return {
        ...task,
        assetDetails: {
          purchaseDate: assetInfo.purchaseDate || null,
          value: assetInfo.currentValue || null,
        },
        assetID: assetInfo._id || null, // provide actual Asset ID for save/history
        currentValue: latest.marketValue || null,
        lastAssessedDate: latest.date || null,
        status: latest.status || null,
      };
    });

    res.json(enrichedTasks);
  } catch (error) {
    console.error("Error fetching enriched tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
