const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/common");

async function login(req, res) {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res
      .status(400)
      .json({ error: "Employee ID and password are required" });
  }

  try {
    // Check MySQL for user
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
    const [rows] = await connection.execute(
      "SELECT employeeId, email, password, role, managerEmail, hierarchyManagerEmail FROM Users WHERE employeeId = ?",
      [employeeId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid employee ID" });
    }

    const mysqlUser = rows[0];
    const validPassword = await bcrypt.compare(password, mysqlUser.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = generateToken({
      employeeId: mysqlUser.employeeId,
      email: mysqlUser.email,
      role: mysqlUser.role,
      managerEmail: mysqlUser.managerEmail,
      hierarchyManagerEmail: mysqlUser.hierarchyManagerEmail,
    });

    return res.json({
      token,
      employeeId: mysqlUser.employeeId,
      role: mysqlUser.role,
    });
  } catch (error) {
    console.error("Error during login:", error); // Log the error details
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { login };
