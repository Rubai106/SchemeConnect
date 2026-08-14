const mongoose = require("mongoose");

const verificationCaseSchema = new mongoose.Schema({
    caseId: { type: String, required: true, unique: true },
    applicantName: { type: String, required: true },
    scheme: { type: String, required: true },
    status: {
        type: String,
        enum: ["Assigned", "Under review", "Clarification requested", "Verified", "Rejected"],
        default: "Assigned"
    },
    timeline: [
        {
            event: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    notes: [
        {
            text: String,
            addedAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("VerificationCase", verificationCaseSchema);