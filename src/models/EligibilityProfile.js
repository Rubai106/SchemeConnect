const mongoose = require("mongoose");

const eligibilityProfileSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    occupation: {
        type: String,
        required: true,
        trim: true
    },

    monthlyIncome: {
        type: Number,
        required: true,
        min: 0
    },

    familySize: {
        type: Number,
        required: true,
        min: 1
    },

    disabilityStatus: {
        type: Boolean,
        default: false
    },

    educationLevel: {
        type: String,
        required: true,
        trim: true
    },

    maritalStatus: {
        type: String,
        required: true,
        trim: true
    },

    division: {
        type: String,
        required: true,
        trim: true
    },

    district: {
        type: String,
        required: true,
        trim: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("EligibilityProfile", eligibilityProfileSchema);
