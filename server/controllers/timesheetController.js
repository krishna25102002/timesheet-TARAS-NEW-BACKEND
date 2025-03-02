const User = require("../models/User");
const {
  sendApprovalEmail,
  sendApprovalStatusNotification,
} = require("./emailController");

async function submitTimesheet(req, res) {
  const { employeeId, timesheetData } = req.body;
  const db = req.app.locals.db;
  const timesheetCollection = db.collection("timesheets");
  const user = new User(db);

  const employee = await user.findByEmployeeId(employeeId);
  if (!employee) {
    return res.status(400).json({ error: "Employee not found" });
  }

  const result = await timesheetCollection.insertOne({
    employeeId,
    timesheetData,
    approvalStatus: "Pending",
    submittedAt: new Date(),
  });

  await sendApprovalEmail(employee.managerEmail, employeeId, result.insertedId);
  res.json({ message: "Timesheet submitted successfully" });
}

async function approveTimesheet(req, res) {
  const { employeeId, timesheetId } = req.body;
  const db = req.app.locals.db;
  const timesheetCollection = db.collection("timesheets");
  const user = new User(db);

  const timesheet = await timesheetCollection.findOne({
    _id: timesheetId,
    approvalStatus: "Pending",
  });
  if (!timesheet) {
    return res
      .status(400)
      .json({ error: "Timesheet not found or already approved" });
  }

  const employee = await user.findByEmployeeId(employeeId);
  await timesheetCollection.updateOne(
    { _id: timesheet._id },
    { $set: { approvalStatus: "Approved", approvedAt: new Date() } }
  );

  await sendApprovalStatusNotification(
    employee.email,
    employee.managerEmail,
    employee.hierarchyManagerEmail,
    timesheet.timesheetData,
    "Approved"
  );
  res.json({ message: "Timesheet approved successfully" });
}

module.exports = { submitTimesheet, approveTimesheet };
