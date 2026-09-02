const mongoose = require("mongoose");
const SCHEME_CATEGORY = require("../constants/schemeCategory");
const SCHEME_STATUS = require("../constants/schemeStatus");

// ============================================================
// SHARED Scheme model — used by:
//   1. Mahima's Scheme Configuration Studio (admin create/edit + budget)
//   2. Fariha's Application feature (reads eligibilityDetails)
//   3. My Welfare Opportunity Explorer (citizen browse + recommendation)
//
// eligibilityCriteria (String) = short human-readable summary (Mahima)
// eligibilityDetails (object)  = structured matching fields (Fariha + mine)
// ============================================================
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

    // Mahima's field: simple text summary of who is eligible
    eligibilityCriteria: {
      type: String,
      required: true,
      trim: true
    },

    // Structured eligibility — shared by Fariha's Application matching
    // and my Citizen recommendation matching.
    // Easy to modify: add another condition here + in schemeController.isEligible
    eligibilityDetails: {
      minIncome: {
        type: Number,
        default: null
      },
      maxIncome: {
        type: Number,
        default: null
      },
      occupationTypes: {
        type: [String],
        default: []
      },
      disabilityRequired: {
        type: Boolean,
        default: false
      },
      minEducation: {
        type: String,
        trim: true,
        default: ""
      },
      maxFamilySize: {
        type: Number,
        default: null
      },
      eligibleDistricts: {
        type: [String],
        default: []
      },
      // Added for my Welfare Opportunity Explorer (additive, safe for teammates)
      district: {
        type: String,
        trim: true,
        default: ""
      },
      minimumFamilySize: {
        type: Number,
        default: null
      }
    },

    requiredDocuments: {
      type: [String],
      default: []
    },

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
      type: Date,
      default: null
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

    // Set by Mahima's admin createScheme (req.user.userId).
    // Relaxed to optional so DEMO seed data can exist without an admin user.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Scheme", schemeSchema);
