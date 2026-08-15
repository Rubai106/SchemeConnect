const mongoose = require('mongoose');

const circularSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true }, // Google Drive link
    publishedDate: { type: Date, required: true },
    syncedAt: { type: Date, default: Date.now },
    relatedSchemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' } // optional linkage
  },
  { timestamps: true }
);

module.exports = mongoose.model('Circular', circularSchema);
