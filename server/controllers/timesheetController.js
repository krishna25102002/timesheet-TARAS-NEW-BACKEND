const User = require("../models/User");
const { sendEmail } = require("../utils/common");

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

  await sendEmail({
    from: '"Timesheet Portal" <no-reply@example.com>',
    to: employee.managerEmail,
    subject: "Timesheet Approval Request",
    html: `<p>Employee ID: ${employeeId} has submitted their timesheet for approval.</p>
           <p>Click below to approve or reject the timesheet:</p>
           <a href="http://your-application-url/email/approve-timesheet?employeeId=${employeeId}&timesheetId=${result.insertedId}" style="margin-right: 10px; padding: 10px; background-color: green; color: white; text-decoration: none;">Accept</a>
           <a href="http://your-application-url/email/reject-timesheet?employeeId=${employeeId}&timesheetId=${result.insertedId}" style="margin-left: 10px; padding: 10px; background-color: red; color: white; text-decoration: none;">Reject</a>`,
  });

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

  await sendEmail({
    from: '"Timesheet Portal" <no-reply@example.com>',
    to: [employee.email, employee.managerEmail, employee.hierarchyManagerEmail],
    subject: `Timesheet Approved`,
    text: `The timesheet has been approved by the manager.\n\nTimesheet Data:\n${JSON.stringify(
      timesheet.timesheetData,
      null,
      2
    )}`,
  });

  res.json({ message: "Timesheet approved successfully" });
}

module.exports = { submitTimesheet, approveTimesheet };
