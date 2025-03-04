require("dotenv").config();
const express = require("express");
const { sequelize } = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const emailRoutes = require("./routes/emailRoutes");
const connectDB = require("./config/db");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/timesheet", authenticateToken, timesheetRoutes);
app.use("/email", authenticateToken, emailRoutes);

const PORT = process.env.PORT || 6000;

connectDB()
  .then((db) => {
    app.locals.db = db;
    return sequelize.sync(); // Synchronize Sequelize models
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });
