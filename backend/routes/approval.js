//This approval.js handles src/pages/PendingApproval.js for sending Email
// for both case either Approval user or Reject user.

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Approve user: update approved = true, assign role, send email
router.patch('/:id/approve', async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user || !user.email) {
      return res.status(404).json({ message: 'User or email not found' });
    }

    user.approved = true;
    user.role = role;
    await user.save();
    
    await transporter.sendMail({
      from: `"King's Admin" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Registration Approved',
      text: `Hello ${user.firstName},
      \n Your registration has been approved as ${user.role}. You can now log in 
      \n Welcome to the Team!!!.
      \n Best Regards
      \n King's Admin Team`,
    });

    res.json({ message: 'User approved and email sent' });
  } catch (err) {
    console.error('✅ Approve error:', err);
    res.status(500).json({ message: 'Approval failed' });
  }
});

// Reject user: delete from DB and send email
router.patch('/:id/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.email) {
      return res.status(404).json({ message: 'User or email not found' });
    }

    await transporter.sendMail({
      from: `"King's Admin" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '❌ Registration Rejected',
      text: `Hello ${user.firstName},
      \n We're sorry, your registration has been rejected.
      \n Please contact with Admin for Details.
      \n Best Regards
      \n King's Admin Team`,
    });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User rejected and email sent' });
  } catch (err) {
    console.error('❌ Rejection error:', err);
    res.status(500).json({ message: 'Rejection failed' });
  }
});

module.exports = router;
