const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema(
  {
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application'},
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },

    name: { type: String, required: true },
    nationalId: { type: String, required: true },
    contactNumber: { type: String, required: true },

    // Matches the "Region" column in the Beneficiary Records screen.
    // NOTE: this replaces the old `district` field name. Application.district
    // (set at registration) is a separate, earlier-stage field and is left as-is.
    region: { type: String, required: true },

    // Matches the four statuses shown in the Figma table exactly.
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'flagged'],
      default: 'pending'
    },
    flaggedReason: { type: String, default: null }, // set when status = 'flagged'

    // Verification case timing, used to compute "Avg Verification Time"
    // and to detect overdue cases for the Compliance Score.
    caseOpenedAt: { type: Date, default: null }, // set when a verification case is opened
    verificationDeadline: { type: Date, default: null }, // from Field Inspection Assignment
    verifiedAt: { type: Date, default: null }, // auto-stamped below when status -> 'verified'

    approvedAt: { type: Date, default: Date.now },

    disbursements: [
      {
        amount: Number,
        transactionRef: String,
        method: { type: String, default: 'bKash' },
        disbursedAt: Date,
        status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }
      }
    ]
  },
  { timestamps: true } // updatedAt backs the "Last Updated" column in the UI
);


beneficiarySchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'verified' && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }
  next();
});

beneficiarySchema.index({ region: 1 });
beneficiarySchema.index({ schemeId: 1 });
beneficiarySchema.index({ status: 1 });

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
