const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Personal info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },

  // Company info (optional for staff, used for external companies)
  companyName: { type: String, default: null },
  //businessLicense: { type: String, default: null },
  companyRegNo: { type: String, default: null },
  //companyEmail: { type: String, default: null },
  //companyPhone: { type: String, default: null },
  //companyAddress: { type: String, default: null },

  // Admin control
  role: {
    type: String,
    enum: ['admin', 'staff', 'external_company'],
    default: null // assigned by admin after approval
  },
  approved: {
    type: Boolean,
    default: false // admin sets this to true upon verification
  }
}, {
  timestamps: true // adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema);
