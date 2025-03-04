const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });
}

async function sendEmail(options) {
  let info = await transporter.sendMail(options);
  console.log("Email sent: " + info.response);
}

module.exports = {
  hashPassword,
  generateToken,
  sendEmail,
};
