// backend/models/MaintenanceTask.js
const mongoose = require('mongoose');

const maintenanceTaskSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  type: { type: String, required: true },
  notes: { type: String },
  scheduledDate: { type: Date, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MaintenanceTask', maintenanceTaskSchema);
