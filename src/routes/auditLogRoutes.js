const express = require("express");
const router = express.Router();
const { getAuditLogs, createAuditLog } = require("../controllers/auditLogController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAuditLogs);
router.post("/", protect, createAuditLog);

module.exports = router;
