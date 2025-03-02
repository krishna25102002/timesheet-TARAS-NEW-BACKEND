require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const emailRoutes = require("./routes/emailRoutes");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/timesheet", timesheetRoutes);
app.use("/email", emailRoutes);

const PORT = process.env.PORT || 6000;

connectDB()
  .then((db) => {
    app.locals.db = db;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });
