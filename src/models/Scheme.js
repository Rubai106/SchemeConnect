const mongoose = require("mongoose");

// Easy to modify: scheme categories
const SCHEME_CATEGORIES = [
    "Agriculture",
    "Education",
    "Healthcare",
    "Disability",
    "Women",
    "SME",
    "Housing"
];

// Easy to modify: scheme statuses
const SCHEME_STATUSES = ["Open", "Closed"];

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
        enum: SCHEME_CATEGORIES
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

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
        }
    },

    applicationDeadline: {
        type: Date,
        required: true
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

    applicationStatus: {
        type: String,
        required: true,
        enum: SCHEME_STATUSES
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Scheme", schemeSchema);
module.exports.SCHEME_CATEGORIES = SCHEME_CATEGORIES;
module.exports.SCHEME_STATUSES = SCHEME_STATUSES;
