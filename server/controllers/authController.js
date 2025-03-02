// filepath: /c:/Users/kd1812/Desktop/tarastimesheetportal/backend-timesheet/server/controllers/authController.js
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function login(req, res) {
  const { employeeId, password } = req.body;
  const db = req.app.locals.db;
  const user = new User(db);

  // Check MongoDB for user
  const foundUser = await user.findByEmployeeId(employeeId);
  if (!foundUser) {
    // Check MySQL for user
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      database: "employees",
    });
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE employeeId = ?",
      [employeeId]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid employee ID or password" });
    }
    const mysqlUser = rows[0];
    const validPassword = await bcrypt.compare(password, mysqlUser.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid employee ID or password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        employeeId: mysqlUser.employeeId,
        email: mysqlUser.email,
        role: mysqlUser.role,
        managerEmail: mysqlUser.managerEmail,
        hierarchyManagerEmail: mysqlUser.hierarchyManagerEmail,
      },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    ); 
    return res.json({
      token,
      employeeId: mysqlUser.employeeId,
      role: mysqlUser.role,
    });
  }

  const validPassword = await bcrypt.compare(password, foundUser.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid employee ID or password" });
  }

  const token = jwt.sign(
    {
      employeeId: foundUser.employeeId,
      email: foundUser.email,
      role: foundUser.role,
      managerEmail: foundUser.managerEmail,
      hierarchyManagerEmail: foundUser.hierarchyManagerEmail,
    },
    process.env.JWT_SECRET,
    { expiresIn: "4h" }
  );

  res.json({ token, employeeId: foundUser.employeeId, role: foundUser.role });
}

module.exports = { login };
