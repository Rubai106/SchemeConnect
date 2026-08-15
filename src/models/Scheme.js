const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['agriculture', 'education', 'healthcare', 'disability', 'women', 'sme', 'housing']
    },
    eligibilityCriteria: {
      minIncome: Number,
      maxIncome: Number,
      occupationTypes: [String],
      disabilityRequired: { type: Boolean, default: false },
      minEducation: String,
      maxFamilySize: Number,
      eligibleDistricts: [String] // empty/omitted = all districts
    },
    requiredDocuments: [String], // e.g. ['National ID', 'Income Certificate']
    benefitAmount: { type: Number, required: true },
    applicationDeadline: { type: Date, required: true },
    budgetAllocated: { type: Number, required: true, default: 0 },
    budgetUtilized: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'closed'],
      default: 'active'
    },
    createdBy: { type: String } // administrator name/id who configured the scheme
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);