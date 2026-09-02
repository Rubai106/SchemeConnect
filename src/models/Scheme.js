const mongoose = require("mongoose");
const SCHEME_CATEGORY = require("../constants/schemeCategory");
const SCHEME_STATUS = require("../constants/schemeStatus");

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: Object.values(SCHEME_CATEGORY),
      required: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    eligibilityCriteria: {
      type: String,
      required: true,
      trim: true
    },

    eligibilityDetails: {
      minIncome: Number,
      maxIncome: Number,
      occupationTypes: [String],
      disabilityRequired: {
        type: Boolean,
        default: false
      },
      minEducation: String,
      maxFamilySize: Number,
      eligibleDistricts: [String]
    },

    requiredDocuments: [String],

    benefitAmount: {
      type: Number,
      required: true,
      min: 0
    },

    allocatedBudget: {
      type: Number,
      required: true,
      min: 0
    },

    budgetUtilized: {
      type: Number,
      default: 0,
      min: 0
    },

    applicationDeadline: {
      type: Date
    },

    status: {
      type: String,
      enum: Object.values(SCHEME_STATUS),
      default: SCHEME_STATUS.DRAFT
    },

    lowBudgetThresholdPercent: {
      type: Number,
      default: 15,
      min: 0,
      max: 100
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Scheme", schemeSchema);