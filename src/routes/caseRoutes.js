const express = require("express");
const router = express.Router();
const VerificationCase = require("../models/VerificationCase");

router.get("/verification-cases", async (req, res) => {
    try {
        const cases = await VerificationCase.find();
        res.status(200).json(cases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/verification-cases/:id", async (req, res) => {
    try {
        const oneCase = await VerificationCase.findById(req.params.id);
        if (!oneCase) return res.status(404).json({ error: "Case not found" });
        res.status(200).json(oneCase);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/verification-cases/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["Assigned", "Under review", "Clarification requested", "Verified", "Rejected"];
        if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status value" });
        const updated = await VerificationCase.findByIdAndUpdate(
            req.params.id,
            { status, $push: { timeline: { event: `Status changed to ${status}` } } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Case not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/verification-cases/:id/notes", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Note text is required" });
        const updated = await VerificationCase.findByIdAndUpdate(
            req.params.id,
            { $push: { notes: { text } } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Case not found" });
        res.status(201).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;