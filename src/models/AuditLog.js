const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. 'BENEFICIARY_UPDATED', 'CIRCULARS_SYNCED'
    performedBy: { type: String, required: true }, // name/id of the user who did it
    role: {
      type: String,
      required: true,
      enum: ['Citizen', 'Verification Officer', 'Finance Officer', 'Administrator', 'Auditor']
    },
    targetType: { type: String, required: true }, // e.g. 'Beneficiary', 'Circular', 'Scheme'
    targetId: { type: String }, // not always applicable (e.g. a bulk sync), so not required
    details: { type: String },
    timestamp: { type: Date, default: Date.now, required: true }
  },
  { timestamps: false } // timestamp field above is the source of truth, not createdAt/updatedAt
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ role: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
