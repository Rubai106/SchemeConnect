const express = require("express");
const router = express.Router();
const FlaggedApplication = require("../models/FlaggedApplication");

router.get("/flagged-applications", async (req, res) => {
    try {
        const applications = await FlaggedApplication.find().sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/flagged-applications/:id", async (req, res) => {
    try {
        const application = await FlaggedApplication.findById(req.params.id);
        if (!application) return res.status(404).json({ error: "Application not found" });
        res.status(200).json(application);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/flagged-applications/:id/decision", async (req, res) => {
    try {
        const { decision } = req.body;
        const allowed = ["Approved", "Rejected", "Escalated"];
        if (!allowed.includes(decision)) return res.status(400).json({ error: "Invalid decision value" });
        const updated = await FlaggedApplication.findByIdAndUpdate(req.params.id, { decision }, { new: true });
        if (!updated) return res.status(404).json({ error: "Application not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;