const express = require("express");
const router = express.Router();
const VerificationCase = require("../models/VerificationCase");
const FieldInspection = require("../models/FieldInspection");
 
// GET /dashboard/summary
// Top-level numbers for the supervisor dashboard: pending cases, overdue
// inspections, and total inspections in flight.
router.get("/dashboard/summary", async (req, res) => {
  try {
    const pendingCases = await VerificationCase.countDocuments({
      status: { $in: ["Assigned", "Under review"] }
    });
 
    const overdueInspections = await FieldInspection.countDocuments({
      inspectionDeadline: { $lt: new Date() },
      status: { $ne: "Completed" }
    });
 
    const totalInspections = await FieldInspection.countDocuments({});
    const completedInspections = await FieldInspection.countDocuments({ status: "Completed" });
 
    res.status(200).json({
      pendingCases,
      overdueInspections,
      totalInspections,
      completedInspections
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// GET /dashboard/officer-performance
// Per-officer breakdown: how many inspections assigned, completed, and overdue.
router.get("/dashboard/officer-performance", async (req, res) => {
  try {
    const performance = await FieldInspection.aggregate([
      {
        $group: {
          _id: "$assignedOfficer",
          totalAssigned: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$inspectionDeadline", new Date()] },
                    { $ne: ["$status", "Completed"] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          officer: "$_id",
          totalAssigned: 1,
          completed: 1,
          overdue: 1,
          completionRate: {
            $cond: [
              { $eq: ["$totalAssigned", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$completed", "$totalAssigned"] }, 100] }, 1] }
            ]
          }
        }
      },
      { $sort: { officer: 1 } }
    ]);
 
    res.status(200).json(performance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// GET /dashboard/pending-cases
// List view backing the "pending cases" number — used when a supervisor
// clicks through from the summary card to see the actual cases.
router.get("/dashboard/pending-cases", async (req, res) => {
  try {
    const cases = await VerificationCase.find({
      status: { $in: ["Assigned", "Under review"] }
    }).sort({ status: 1 });
    res.status(200).json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// GET /dashboard/overdue-inspections
// List view backing the "overdue inspections" number.
router.get("/dashboard/overdue-inspections", async (req, res) => {
  try {
    const overdue = await FieldInspection.find({
      inspectionDeadline: { $lt: new Date() },
      status: { $ne: "Completed" }
    }).sort({ inspectionDeadline: 1 });
    res.status(200).json(overdue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;
 