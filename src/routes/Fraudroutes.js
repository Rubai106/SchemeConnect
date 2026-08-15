const express = require("express");
const router = express.Router();
const FlaggedApplication = require("../models/FlaggedApplication");
const { analyzeApplication } = require("../services/geminiService");

// GET /flagged-applications
// Returns the list of all flagged applications (Screen A - Fraud Review List)
router.get("/flagged-applications", async (req, res) => {
  try {
    const applications = await FlaggedApplication.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /flagged-applications/:id
// Returns one flagged application's full detail (Screen B - Risk Detail)
router.get("/flagged-applications/:id", async (req, res) => {
  try {
    const application = await FlaggedApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /flagged-applications/:id/analyze
// Calls Grok to (re)generate the riskLevel and aiExplanation for this application.
// The AI never sets a decision — that stays fully in the officer's hands.
router.post("/flagged-applications/:id/analyze", async (req, res) => {
  try {
    const application = await FlaggedApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const result = await analyzeApplication({
      applicantName: application.applicantName,
      scheme: application.scheme,
      reason: application.reason,
      comparison: application.comparison
    });

    application.riskLevel = result.riskLevel;
    application.aiExplanation = result.explanation;
    await application.save();

    res.status(200).json(application);
  } catch (err) {
    if (err.code === "MISSING_API_KEY") {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /flagged-applications/:id/decision
// Officer submits Approve / Reject / Escalate decision
router.put("/flagged-applications/:id/decision", async (req, res) => {
  try {
    const { decision } = req.body;
    const allowed = ["Approved", "Rejected", "Escalated"];
    if (!allowed.includes(decision)) {
      return res.status(400).json({ error: "Invalid decision value" });
    }
    const updated = await FlaggedApplication.findByIdAndUpdate(
      req.params.id,
      { decision },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
