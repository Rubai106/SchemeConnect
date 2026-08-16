const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET audit logs (supports ?role=&action=&startDate=&endDate= filters)
exports.getAuditLogs = asyncHandler(async (req, res) => {
    const { role, action, startDate, endDate } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (action) filter.action = action;
    if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 });
    return sendSuccess(res, 200, "Audit logs fetched successfully", logs);
});

// POST create a new audit log entry manually (e.g. for actions from other modules)
exports.createAuditLog = asyncHandler(async (req, res) => {
    const log = await AuditLog.create(req.body);
    return sendSuccess(res, 201, "Audit log created successfully", log);
});
