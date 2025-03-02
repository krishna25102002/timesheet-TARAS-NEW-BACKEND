const express = require("express");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const {
  sendApprovalEmail,
  sendApprovalStatusNotification,
} = require("../config/nodemailer");

const uri = "YOUR_MONGODB_CONNECTION_URI";

// Submit timesheet and request approval
router.post("/submit-timesheet", async (req, res) => {
  const { employeeId, timesheetData } = req.body;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const database = client.db("your_database");
    const collection = database.collection("timesheets");

    const employee = await database
      .collection("employees")
      .findOne({ employeeId: employeeId });
    const managerEmail = employee.managerEmail;
    const timesheetId = await collection.insertOne({
      employeeId: employeeId,
      timesheetData: timesheetData,
      approvalStatus: "Pending",
      submittedAt: new Date(),
    });

    await sendApprovalEmail(managerEmail, employeeId, timesheetId.insertedId);
    res
      .status(200)
      .json({ message: "Timesheet submitted and approval email sent" });
  } finally {
    await client.close();
  }
});

const {
  approveTimesheet,
  rejectTimesheet,
} = require("../controllers/emailController");

router.get("/approve-timesheet", approveTimesheet);
router.get("/reject-timesheet", rejectTimesheet);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const nodemailer = require('nodemailer');
// const MongoClient = require('mongodb').MongoClient;

// const uri = 'YOUR_MONGODB_CONNECTION_URI';
// const jwtSecret = 'YOUR_SECRET_KEY';

// // Setup email transporter
// const transporter = nodemailer.createTransport({
//     service: 'your_email_service',
//     auth: {
//         user: 'your_email@example.com',
//         pass: 'your_email_password'
//     }
// });

// // Submit timesheet and request approval
// router.post('/submit-timesheet', async (req, res) => {
//     const { employeeId, timesheetData } = req.body;

//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//     try {
//         await client.connect();
//         const database = client.db('your_database');
//         const collection = database.collection('timesheets');

//         const employee = await database.collection('employees').findOne({ employeeId: employeeId });
//         const managerEmail = employee.managerEmail;

//         await collection.insertOne({
//             employeeId: employeeId,
//             timesheetData: timesheetData,
//             approvalStatus: 'Pending',
//             submittedAt: new Date()
//         });

//         await sendApprovalEmail(managerEmail, employeeId, timesheetData);
//         res.status(200).json({ message: 'Timesheet submitted and approval email sent' });
//     } finally {
//         await client.close();
//     }
// });

// // Send approval email
// // async function sendApprovalEmail(managerEmail, employeeId, timesheetData) {
// //     let info = await transporter.sendMail({
// //         from: '"Timesheet Portal" <no-reply@example.com>',
// //         to: managerEmail,
// //         subject: 'Timesheet Approval Request',
// //         text: `Employee ID: ${employeeId} has submitted their timesheet for approval.\n\nTimesheet Data:\n${JSON.stringify(timesheetData, null, 2)}\n\nPlease log in to approve or reject the timesheet.`
// //     });

// //     console.log('Approval email sent: ' + info.response);
// // }
// // Send approval email with embedded buttons
// async function sendApprovalEmail(managerEmail, employeeId, timesheetId) {
//     const acceptUrl = `http://your-application-url/email/approve-timesheet?employeeId=${employeeId}&timesheetId=${timesheetId}`;
//     const rejectUrl = `http://your-application-url/email/reject-timesheet?employeeId=${employeeId}&timesheetId=${timesheetId}`;

//     let info = await transporter.sendMail({
//         from: '"Timesheet Portal" <no-reply@example.com>',
//         to: managerEmail,
//         subject: 'Timesheet Approval Request',
//         html: `<p>Employee ID: ${employeeId} has submitted their timesheet for approval.</p>
//                <p>Click below to approve or reject the timesheet:</p>
//                <a href="${acceptUrl}" style="margin-right: 10px; padding: 10px; background-color: green; color: white; text-decoration: none;">Accept</a>
//                <a href="${rejectUrl}" style="margin-left: 10px; padding: 10px; background-color: red; color: white; text-decoration: none;">Reject</a>`
//     });

//     console.log('Approval email sent: ' + info.response);
// }

// // Approve timesheet and send status notification
// router.post('/approve-timesheet', async (req, res) => {
//     const { employeeId } = req.body;

//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//     try {
//         await client.connect();
//         const database = client.db('your_database');
//         const timesheetCollection = database.collection('timesheets');
//         const employeeCollection = database.collection('employees');

//         const timesheet = await timesheetCollection.findOne({ employeeId: employeeId, approvalStatus: 'Pending' });
//         const employee = await employeeCollection.findOne({ employeeId: employeeId });
//         const hierarchyManagerEmail = employee.hierarchyManagerEmail;
//         const managerEmail = employee.managerEmail;

//         if (!timesheet) {
//             return res.status(404).json({ message: 'Timesheet not found or already approved' });
//         }

//         await timesheetCollection.updateOne({ _id: timesheet._id }, { $set: { approvalStatus: 'Approved', approvedAt: new Date() } });

//         await sendApprovalStatusNotification(employee.email, managerEmail, hierarchyManagerEmail, timesheet.timesheetData);
//         res.status(200).json({ message: 'Timesheet approved and notification emails sent' });
//     } finally {
//         await client.close();
//     }
// });

// // Send approval status notification
// async function sendApprovalStatusNotification(employeeEmail, managerEmail, hierarchyManagerEmail, timesheetData) {
//     let info = await transporter.sendMail({
//         from: '"Timesheet Portal" <no-reply@example.com>',
//         to: [employeeEmail, managerEmail, hierarchyManagerEmail],
//         subject: 'Timesheet Approval Status',
//         text: `The timesheet has been approved by the manager.\n\nTimesheet Data:\n${JSON.stringify(timesheetData, null, 2)}`
//     });

//     console.log('Approval status notification sent: ' + info.response);
// }

// module.exports = router;
