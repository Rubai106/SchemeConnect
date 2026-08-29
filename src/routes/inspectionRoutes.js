const express = require("express");
const router = express.Router();
const FieldInspection = require("../models/FieldInspection.js");
 
// POST /field-inspections
// Supervisor assigns a new field inspection to an officer
router.post("/field-inspections", async (req, res) => {
  try {
    const { caseId, applicantName, scheme, assignedOfficer, inspectionDeadline } = req.body;
    if (!caseId || !applicantName || !scheme || !assignedOfficer || !inspectionDeadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const inspection = await FieldInspection.create({
      caseId,
      applicantName,
      scheme,
      assignedOfficer,
      inspectionDeadline,
      status: "Scheduled"
    });
    res.status(201).json(inspection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// GET /field-inspections
// Supervisor view: all inspections, optionally filtered by status or officer
// Query params: ?status=Overdue  or  ?officer=Karim
router.get("/field-inspections", async (req, res) => {
  try {
    const { status, officer } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (officer) filter.assignedOfficer = officer;
 
    const inspections = await FieldInspection.find(filter).sort({ inspectionDeadline: 1 });
    res.status(200).json(inspections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// GET /field-inspections/overdue
// Convenience endpoint: inspections past their deadline and not completed
router.get("/field-inspections/overdue", async (req, res) => {
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
 
// GET /field-inspections/:id
// Full detail of one inspection
router.get("/field-inspections/:id", async (req, res) => {
  try {
    const inspection = await FieldInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }
    res.status(200).json(inspection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// PUT /field-inspections/:id/outcome
// Officer records the visit outcome after completing a field visit
router.put("/field-inspections/:id/outcome", async (req, res) => {
  try {
    const { visitOutcome } = req.body;
    const allowed = ["Verified", "Discrepancy Found", "Unable to Locate"];
    if (!allowed.includes(visitOutcome)) {
      return res.status(400).json({ error: "Invalid visit outcome value" });
    }
    const updated = await FieldInspection.findByIdAndUpdate(
      req.params.id,
      { visitOutcome, status: "Completed" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Inspection not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// POST /field-inspections/:id/evidence
// Officer attaches evidence (photo/document reference) collected during the visit
router.post("/field-inspections/:id/evidence", async (req, res) => {
  try {
    const { description, fileUrl } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Evidence description is required" });
    }
    const updated = await FieldInspection.findByIdAndUpdate(
      req.params.id,
      { $push: { evidence: { description, fileUrl } } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Inspection not found" });
    }
    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;
 