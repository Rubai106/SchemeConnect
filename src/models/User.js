const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    nationalId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    contactNumber: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["Citizen", "Admin", "Officer"],
        default: "Citizen"
    },

    accountStatus: {
        type: String,
        enum: ["Active", "Pending", "Suspended"],
        default: "Active"
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

module.exports = mongoose.model("User", userSchema);
