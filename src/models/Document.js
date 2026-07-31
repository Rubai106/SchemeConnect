const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    documentType: {
        type: String,
        required: true
    },

    fileName: {
        type: String,
        required: true
    },

    verificationStatus: {
        type: String,
        enum: ["Verified", "Pending", "Rejected", "Missing"],
        default: "Pending"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Document", documentSchema);
