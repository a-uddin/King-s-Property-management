// This email.js handles src/pages/AllMembers.js of sending Email to the user. 

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

require("dotenv").config();

router.post("/send", async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ message: "Missing email fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"King's Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    });

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;
