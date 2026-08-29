const express = require("express");
const router = express.Router();
const VerificationCase = require("../models/VerificationCase");
 
// GET /verification-cases
// Returns list of all cases (Case List screen)
router.get("/verification-cases", async (req, res) => {
  try {
    const cases = await VerificationCase.find();
    res.status(200).json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// GET /verification-cases/:id
// Returns one case's full detail (Case Detail screen)
router.get("/verification-cases/:id", async (req, res) => {
  try {
    const oneCase = await VerificationCase.findById(req.params.id);
    if (!oneCase) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.status(200).json(oneCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// PUT /verification-cases/:id/status
// Officer updates the case's status. Logs a "Status Change" timeline entry
// automatically so the history stays complete without extra officer effort.
router.put("/verification-cases/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Assigned", "Under review", "Clarification requested", "Verified", "Rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    const updated = await VerificationCase.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { timeline: { type: "Status Change", text: `Status changed to ${status}` } }
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// POST /verification-cases/:id/notes
// Officer records an investigation finding, requests clarification from the
// applicant, or attaches a supporting comment — each is tagged with a type
// so they're distinguishable in the case timeline, per the spec.
router.post("/verification-cases/:id/notes", async (req, res) => {
  try {
    const { type, text } = req.body;
    const allowedTypes = ["Finding", "Clarification Request", "Comment"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid note type" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Note text is required" });
    }
    const updated = await VerificationCase.findByIdAndUpdate(
      req.params.id,
      { $push: { timeline: { type, text } } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;
 
