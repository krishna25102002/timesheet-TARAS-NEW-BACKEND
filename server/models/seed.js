// Initialize the database with test data 
// Actually this is test base data, not real data.
// This script is used to seed the database with test data for development purposes.
// This script should not be used in production.
// This script will create two test users in the database.
// BUt the datas which is taken from the real database from the the sql libaray which is running in the local machine.

const bcrypt = require("bcryptjs");
const User = require("./models/User");
const sequelize = require("./config/database").sequelize;

// Define test data
const testUsers = [
  {
    employeeId: "DUMMY001",
    email: "dummyemployee1@example.com",
    password: "dummyPassword", // Plain text password for testing
    role: "employee",
    managerEmail: "dummymanager@example.com",
    hierarchyManagerEmail: "dummyhierarchymanager@example.com",
  },
  {
    employeeId: "DUMMY002",
    email: "dummyemployee2@example.com",
    password: "dummyPassword", // Plain text password for testing
    role: "employee",
    managerEmail: "dummymanager@example.com",
    hierarchyManagerEmail: "dummyhierarchymanager@example.com",
  },
];

// Seed the database
const seedDatabase = async () => {
  await sequelize.sync({ force: true }); // Reset the database
  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10); // Hash the password
    await User.create({
      ...userData,
      password: hashedPassword, // Store the hashed password
    });
  }
  console.log("Database seeded successfully");
};

seedDatabase()
  .then(() => process.exit())
  .catch((error) => {
    console.error("Failed to seed the database", error);
    process.exit(1);
  });
