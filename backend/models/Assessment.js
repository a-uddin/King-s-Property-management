const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    assetID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      //unique: true, // ⬅️ One assessment per asset for now
    },
    assessorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    marketValue: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Reviewed", "Pending", "Draft"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
