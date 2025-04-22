// This file is handling send emai to assigned user from pages/ShowAssets.js

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    // ✅ Sanity check before sending
    if (!to || typeof to !== 'string' || to.trim() === '') {
      console.error('❌ No valid recipient email address provided.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"King's Admin" <${process.env.EMAIL_USER}>`,
      to: to.trim(),
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Email sent to', to);
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
};

module.exports = sendEmail;
