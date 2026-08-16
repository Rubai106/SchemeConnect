const Circular = require('../models/Circular');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const createError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');
const ROLES = require('../constants/roles');

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
        circulars.map((c) => ({ ...c, syncedAt: new Date() }))
    );

    await AuditLog.create({
        action: 'CIRCULARS_SYNCED',
        performedBy: req.body.syncedBy || ROLES.ADMINISTRATOR,
        role: ROLES.ADMINISTRATOR,
        targetType: 'Circular',
        details: `${inserted.length} circular(s) synced from Google Drive`
    });

    return sendSuccess(res, 201, `${inserted.length} circular(s) synced successfully`, {
        circulars: inserted
    });
});
