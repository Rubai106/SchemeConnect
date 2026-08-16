const express = require("express");
const router = express.Router();
const { getAuditLogs, createAuditLog } = require("../controllers/auditLogController");

router.get("/", getAuditLogs);
router.post("/", createAuditLog);

module.exports = router;
