const transporter = require("../config/nodemailer");
const User = require("../models/User");

async function approveTimesheet(req, res) {
  const { employeeId, timesheetId } = req.query;
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

async function rejectTimesheet(req, res) {
  const { employeeId, timesheetId } = req.query;
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
      .json({ error: "Timesheet not found or already rejected" });
  }

  const employee = await user.findByEmployeeId(employeeId);
  await timesheetCollection.updateOne(
    { _id: timesheet._id },
    { $set: { approvalStatus: "Rejected", rejectedAt: new Date() } }
  );

  await sendApprovalStatusNotification(
    employee.email,
    employee.managerEmail,
    employee.hierarchyManagerEmail,
    timesheet.timesheetData,
    "Rejected"
  );
  res.json({ message: "Timesheet rejected successfully" });
}
// For example, if your application is hosted at https://timesheet-portal.com, you should update the URLs as follows:


async function sendApprovalEmail(managerEmail, employeeId, timesheetId) {
  const acceptUrl = `http://your-application-url/email/approve-timesheet?employeeId=${employeeId}&timesheetId=${timesheetId}`;
  const rejectUrl = `http://your-application-url/email/reject-timesheet?employeeId=${employeeId}&timesheetId=${timesheetId}`;

  let info = await transporter.sendMail({
    from: '"Timesheet Portal" <no-reply@example.com>',
    to: managerEmail,
    subject: "Timesheet Approval Request",
    html: `<p>Employee ID: ${employeeId} has submitted their timesheet for approval.</p>
               <p>Click below to approve or reject the timesheet:</p>
               <a href="${acceptUrl}" style="margin-right: 10px; padding: 10px; background-color: green; color: white; text-decoration: none;">Accept</a>
               <a href="${rejectUrl}" style="margin-left: 10px; padding: 10px; background-color: red; color: white; text-decoration: none;">Reject</a>`,
  });

  console.log("Approval email sent: " + info.response);
}

async function sendApprovalStatusNotification(
  employeeEmail,
  managerEmail,
  hierarchyManagerEmail,
  timesheetData,
  status
) {
  let info = await transporter.sendMail({
    from: '"Timesheet Portal" <no-reply@example.com>',
    to: [employeeEmail, managerEmail, hierarchyManagerEmail],
    subject: `Timesheet ${status}`,
    text: `The timesheet has been ${status.toLowerCase()} by the manager.\n\nTimesheet Data:\n${JSON.stringify(
      timesheetData,
      null,
      2
    )}`,
  });

  console.log(`Approval status notification sent: ${info.response}`);
}

module.exports = {
  sendApprovalEmail,
  sendApprovalStatusNotification,
  approveTimesheet,
  rejectTimesheet,
};
