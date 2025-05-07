const mongoose = require('mongoose');

const assignedTaskSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: false  // Not mandatory for old records
    },
    assetName: { type: String, required: true },
    assetType: { type: String, required: true },
    location: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Staff or External Company name
    assignedFor: {
      type: String,
      enum: ['Maintenance', 'Assessment'],
      default: 'Maintenance',
    },
    note: { type: String },        // Admin's task note
    scheduledMaintenance: { type: Date },
    taskStatus: {
      type: String,
      enum: ['Pending', 'Ongoing', 'Paused', 'Review', 'Completed'], 
      default: 'Pending'
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model('AssignedTask', assignedTaskSchema);
