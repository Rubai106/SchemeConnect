const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
 
require("dotenv").config();
const mongoose = require("mongoose");
const FlaggedApplication = require("./models/FlaggedApplication");
const VerificationCase = require("./models/VerificationCase");
const FieldInspection = require("./models/FieldInspection");
 
async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected. Seeding data...");
 
    await FlaggedApplication.deleteMany({ applicantName: { $in: ["Abdul Karim", "Rahim Sharif", "Jamal Uddin"] } });
    await VerificationCase.deleteMany({ caseId: { $in: ["VC-1042", "VC-1043", "VC-1044"] } });
    await FieldInspection.deleteMany({ caseId: { $in: ["VC-1042", "VC-1043", "VC-1044"] } });
 
    await FlaggedApplication.insertMany([
        {
            applicantName: "Abdul Karim",
            scheme: "Education Stipend",
            riskLevel: "High",
            reason: "Duplicate NID",
            aiExplanation: "Same NID found on 2 active applications. Declared income differs by 40 percent between forms.",
            comparison: { applicationA: "Income: 8,000 BDT", applicationB: "Income: 14,000 BDT" }
        },
        {
            applicantName: "Rahim Sharif",
            scheme: "NID Verification",
            riskLevel: "Medium",
            reason: "No Birth Certificate",
            aiExplanation: "Applicant did not upload a birth certificate for age verification."
        },
        {
            applicantName: "Jamal Uddin",
            scheme: "SME Grant",
            riskLevel: "Low",
            reason: "Household Overlap",
            aiExplanation: "Household address overlaps with another applicant, but details are consistent."
        }
    ]);
 
    await VerificationCase.insertMany([
        {
            caseId: "VC-1042",
            applicantName: "Fariha Alam",
            scheme: "Housing",
            status: "Under review",
            timeline: [
                { type: "Status Change", text: "Status changed to Under review" },
                { type: "Finding", text: "Site visit scheduled" },
                { type: "Clarification Request", text: "Requested clarification on income proof" }
            ]
        },
        {
            caseId: "VC-1043",
            applicantName: "Kaushik Das",
            scheme: "Healthcare",
            status: "Assigned",
            timeline: [
                { type: "Status Change", text: "Status changed to Assigned" }
            ]
        },
        {
            caseId: "VC-1044",
            applicantName: "Nasrin Akhter",
            scheme: "Healthcare",
            status: "Verified",
            timeline: [
                { type: "Finding", text: "Field visit completed" },
                { type: "Status Change", text: "Status changed to Verified" }
            ]
        }
    ]);
 
    await FieldInspection.insertMany([
        {
            caseId: "VC-1042",
            applicantName: "Fariha Alam",
            scheme: "Housing",
            assignedOfficer: "Officer Karim",
            inspectionDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            status: "Scheduled"
        },
        {
            caseId: "VC-1043",
            applicantName: "Kaushik Das",
            scheme: "Healthcare",
            assignedOfficer: "Officer Rahman",
            inspectionDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: "Pending"
        },
        {
            caseId: "VC-1044",
            applicantName: "Nasrin Akhter",
            scheme: "Healthcare",
            assignedOfficer: "Officer Karim",
            inspectionDeadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: "Completed",
            visitOutcome: "Verified"
        }
    ]);
 
    console.log("Seed data inserted successfully.");
    await mongoose.disconnect();
}
 
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
 