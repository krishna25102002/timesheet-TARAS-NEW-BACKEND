const bcrypt = require('bcryptjs');
const mysql = require("mysql2/promise");

async function register(req, res) {
  const { employeeId, email, password, role, managerEmail, hierarchyManagerEmail } = req.body;

  if (!employeeId || !email || !password || !role || !managerEmail || !hierarchyManagerEmail) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const query = `
      INSERT INTO Users (employeeId, email, password, role, managerEmail, hierarchyManagerEmail)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [employeeId, email, hashedPassword, role, managerEmail, hierarchyManagerEmail]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error('Error during registration:', error); // Log the error details
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register };
