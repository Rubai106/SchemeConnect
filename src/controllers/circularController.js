const Circular = require('../models/Circular');
const AuditLog = require('../models/AuditLog');

// GET all synced circulars
exports.getCirculars = async (req, res) => {
  try {
    const circulars = await Circular.find().sort({ publishedDate: -1 });
    res.status(200).json(circulars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST sync circulars (simulates pulling new circulars from Google Drive)
exports.syncCirculars = async (req, res) => {
  try {
    const { circulars } = req.body; // expects: [{ title, description, fileUrl, publishedDate }]
    if (!circulars || !Array.isArray(circulars) || circulars.length === 0) {
      return res.status(400).json({ error: 'A non-empty "circulars" array is required in the request body' });
    }

    const inserted = await Circular.insertMany(
      circulars.map((c) => ({ ...c, syncedAt: new Date() }))
    );

    await AuditLog.create({
      action: 'CIRCULARS_SYNCED',
      performedBy: req.body.syncedBy || 'Administrator',
      role: 'Administrator',
      targetType: 'Circular',
      details: `${inserted.length} circular(s) synced from Google Drive`
    });

    res.status(201).json({
      message: `${inserted.length} circular(s) synced successfully`,
      circulars: inserted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};