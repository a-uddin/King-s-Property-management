const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetName: { type: String, required: true },
  assetType: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, default: 'available' },

  // 📅 New Fields
  purchaseDate: { type: Date },
  currentValue: { type: Number },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduledMaintenance: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
