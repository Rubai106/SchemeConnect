const Circular = require('../models/Circular');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const createError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

// GET all synced circulars
exports.getCirculars = asyncHandler(async (req, res) => {
const circulars = await Circular.find().sort({ publishedDate: -1 });
return sendSuccess(res, 200, "Circulars fetched successfully", circulars);
});

// POST sync circulars (simulates pulling new circulars from Google Drive)
exports.syncCirculars = asyncHandler(async (req, res) => {
const { circulars } = req.body; // expects: [{ title, description, fileUrl, publishedDate }]
if (!circulars || !Array.isArray(circulars) || circulars.length === 0) {
throw createError('A non-empty "circulars" array is required in the request body', 400);
    }

const inserted = await Circular.insertMany(
circulars.map((c) => ({
...c,
syncedAt: new Date()
    }))
    );

await AuditLog.create({
action: 'CIRCULARS_SYNCED',
performedBy: req.user.email,
role: req.user.role,
targetType: 'Circular',
details: `${inserted.length} circular(s) synced from Google Drive`
    });

return sendSuccess(res, 201, `${inserted.length} circular(s) synced successfully`, {
circulars: inserted
    });
});

// DELETE a circular + logs the action
exports.deleteCircular = asyncHandler(async (req, res) => {
const deleted = await Circular.findByIdAndDelete(req.params.id);
if (!deleted) {
throw createError('Circular not found', 404);
    }

await AuditLog.create({
action: 'CIRCULAR_DELETED',
performedBy: req.user.email,
role: req.user.role,
targetType: 'Circular',
targetId: req.params.id,
details: `Circular removed: ${deleted.title}`
    });

return sendSuccess(res, 200, "Circular deleted successfully", null);
});
