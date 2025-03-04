const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function hashPasswords() {
  const users = [
    {
      employeeId: "e002",
      email: "bff@example.com",
      password: "hello", // Plain text password
      role: "gs",
      managerEmail: "gdsf@example.com",
      hierarchyManagerEmail: "fggs@example.com",
    },
    // Add more users as needed
  ];

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10); // Hash the password
    await connection.execute(
      "INSERT INTO Users (employeeId, email, password, role, managerEmail, hierarchyManagerEmail) VALUES (?, ?, ?, ?, ?, ?)",
      [
        user.employeeId,
        user.email,
        hashedPassword, // Store the hashed password
        user.role,
        user.managerEmail,
        user.hierarchyManagerEmail,
      ]
    );
  }

  console.log("Users inserted successfully");
  await connection.end();
}

hashPasswords().catch((error) => {
  console.error("Failed to insert users", error);
});
