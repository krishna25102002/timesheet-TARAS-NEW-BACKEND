const nodemailer = require("nodemailer");

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: "your_email_service",
  auth: {
    user: "your_email@example.com",
    pass: "your_email_password",
  },
});

module.exports = transporter;
