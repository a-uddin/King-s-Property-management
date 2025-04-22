require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: "smanowar.uddin@gmail.com",
  subject: "Test Email",
  text: "✅ If you receive this, your credentials work!",
}, (err, info) => {
  if (err) {
    console.error("❌ Error:", err);
  } else {
    console.log("✅ Email sent:", info.response);
  }
});
