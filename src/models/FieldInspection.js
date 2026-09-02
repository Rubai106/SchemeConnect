
const mongoose = require("mongoose");
 
const fieldInspectionSchema = new mongoose.Schema({
  caseId: { type: String, required: true }, // links back to a VerificationCase.caseId
  applicantName: { type: String, required: true },
  scheme: { type: String, required: true },
  assignedOfficer: { type: String, required: true },
  inspectionDeadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Pending", "Scheduled", "Completed", "Overdue"],
    default: "Pending"
  },
  visitOutcome: {
    type: String,
    enum: ["Not Visited", "Verified", "Discrepancy Found", "Unable to Locate"],
    default: "Not Visited"
  },
  evidence: [
    {
      description: String,
      fileUrl: String, // placeholder for now — file upload isn't wired up yet
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  reminderSent: { type: Boolean, default: false }, // used later by Twilio SMS job
  createdAt: { type: Date, default: Date.now }
});
 
module.exports = mongoose.model("FieldInspection", fieldInspectionSchema);
 