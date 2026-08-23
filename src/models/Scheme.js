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
        required: true,
        enum: Object.values(SCHEME_CATEGORY)
    },

    description: {
        type: String,
        trim: true,
        default: ""
    },

    // Structured eligibility criteria — used by Citizen Opportunity Explorer
    // Simple embedded object, easy to modify during the exam
    eligibilityCriteria: {
        minimumIncome: {
            type: Number,
            default: null
        },
        maximumIncome: {
            type: Number,
            default: null
        },
        district: {
            type: String,
            trim: true,
            default: ""
        },
        disabilityRequired: {
            type: Boolean,
            default: false
        },
        minimumFamilySize: {
            type: Number,
            default: null
        },
        // Extended criteria for future application matching
        occupationTypes: {
            type: [String],
            default: []
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
        }
    },

    benefitAmount: {
        type: Number,
        min: 0,
        default: null
    },

    applicationDeadline: {
        type: Date,
        default: null
    },

    requiredDocuments: {
        type: [String],
        default: []
    },

    // Scheme lifecycle status — shared with Scheme Configuration Studio
    status: {
        type: String,
        enum: Object.values(SCHEME_STATUS),
        default: SCHEME_STATUS.DRAFT
    },

    // Budget fields — used by Scheme Configuration Studio (Mahima's feature)
    allocatedBudget: {
        type: Number,
        min: 0,
        default: 0
    },

    lowBudgetThresholdPercent: {
        type: Number,
        default: 15
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Scheme", schemeSchema);
