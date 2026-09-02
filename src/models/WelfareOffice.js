const mongoose = require("mongoose");

// Easy to modify: office types
const OFFICE_TYPES = [
    "Welfare Office",
    "Union Digital Center",
    "Service Center"
];

const welfareOfficeSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    officeType: {
        type: String,
        required: true,
        enum: OFFICE_TYPES
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    district: {
        type: String,
        required: true,
        trim: true
    },

    division: {
        type: String,
        required: true,
        trim: true
    },

    contactNumber: {
        type: String,
        required: true,
        trim: true
    },

    operatingHours: {
        type: String,
        required: true,
        trim: true
    },

    services: {
        type: [String],
        default: []
    },

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("WelfareOffice", welfareOfficeSchema);
module.exports.OFFICE_TYPES = OFFICE_TYPES;
