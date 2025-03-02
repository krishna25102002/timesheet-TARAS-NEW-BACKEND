const express = require("express");
const {
  submitTimesheet,
  approveTimesheet,
} = require("../controllers/timesheetController");
const router = express.Router();

router.post("/submit", submitTimesheet);
router.post("/approve", approveTimesheet);

module.exports = router;
