const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    occupation: {
        type: String,
        required: true
    },

    monthlyIncome: {
        type: Number,
        required: true
    },

    educationLevel: {
        type: String,
        required: true
    },

    familySize: {
        type: Number,
        required: true
    },

    disabilityStatus: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Citizen", citizenSchema);
