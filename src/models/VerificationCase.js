
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
  // Every officer action (status changes, findings, clarification requests,
  // comments) lands in this single array so the whole case history renders
  // in one place, in order.
  timeline: [
    {
      type: {
        type: String,
        enum: ["Status Change", "Finding", "Clarification Request", "Comment"],
        required: true
      },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});
 
module.exports = mongoose.model("VerificationCase", verificationCaseSchema);