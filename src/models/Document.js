const mongoose = require("mongoose");

// Easy to modify: document types list
const DOCUMENT_TYPES = [
    "National ID",
    "Birth Certificate",
    "Income Certificate",
    "Disability Certificate",
    "Educational Record",
    "Other"
];

const documentSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    documentType: {
        type: String,
        required: true,
        enum: DOCUMENT_TYPES
    },

    documentNumber: {
        type: String,
        trim: true,
        default: ""
    },

    fileName: {
        type: String,
        required: true
    },

    filePath: {
        type: String,
        required: true
    },

    verificationStatus: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Document", documentSchema);
module.exports.DOCUMENT_TYPES = DOCUMENT_TYPES;
