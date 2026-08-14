const mongoose = require("mongoose");

const flaggedApplicationSchema = new mongoose.Schema({
    applicantName: { type: String, required: true },
    scheme: { type: String, required: true },
    riskLevel: { type: String, enum: ["Low", "Medium", "High"], required: true },
    reason: { type: String, required: true },
    aiExplanation: { type: String },
    comparison: {
        applicationA: { type: String },
        applicationB: { type: String }
    },
    decision: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Escalated"],
        default: "Pending"
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FlaggedApplication", flaggedApplicationSchema);