const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },

    // Denormalized fields kept in sync with the scheme at submission time.

    category: {
      type: String,
      required: true,
      enum: ['agriculture', 'education', 'healthcare', 'disability', 'women', 'sme', 'housing']
    },
    district: { type: String, required: true },

    documents: [
      {
        name: String,
        fileUrl: String
      }
    ],

    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending'
    },

    verificationCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'VerificationCase' },

    submittedAt: { type: Date, default: Date.now, required: true },
    decisionAt: { type: Date, default: null }, // set when status becomes approved/rejected
    decisionNotes: { type: String }
  },
  { timestamps: true }
);

// Whenever status flips to approved/rejected and decisionAt hasn't been set yet,
// stamp it automatically so getProcessingTime doesn't need every caller to remember.
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && ['approved', 'rejected'].includes(this.status) && !this.decisionAt) {
    this.decisionAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
