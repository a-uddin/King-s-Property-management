const mongoose = require('mongoose');

const ongoingMaintenanceSchema = new mongoose.Schema({
  assetName: {
    type: String,
    required: true
  },
  assetType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Ongoing', 'Paused', 'Review', 'Completed', 'Canceled'],
    default: 'Ongoing'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  estimatedCompletion: {
    type: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ongoingMaintenanceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const OngoingMaintenance = mongoose.model('ongoingmaintenance', ongoingMaintenanceSchema);

module.exports = OngoingMaintenance;
