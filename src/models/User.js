const mongoose = require("mongoose");
const ROLES = require("../constants/roles");
const ACCOUNT_STATUS = require("../constants/accountStatus");

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
        enum: Object.values(ROLES),
        default: ROLES.CITIZEN
    },

    accountStatus: {
        type: String,
        enum: Object.values(ACCOUNT_STATUS),
        default: ACCOUNT_STATUS.ACTIVE
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
