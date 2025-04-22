const nodemailer = require("nodemailer");

const sendApprovalEmail = async (to, name, role) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Kings Estate" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject: "Approval Confirmation",
    text: `Hello ${name},\n\nYour account has been approved as a ${role}. You can now log in.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendRejectionEmail = async (to, name) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Kings Estate" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject: "Registration Rejected",
    text: `Hello ${name},\n\nWe're sorry to inform you that your registration has been rejected.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
};
