const AuditLog = require('../models/AuditLog');

// GET audit logs (supports ?role=&action=&startDate=&endDate= filters)
exports.getAuditLogs = async (req, res) => {
  try {
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
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create a new audit log entry manually (e.g. for actions from other modules)
exports.createAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};