const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    getOverview,
    getRegionDistribution,
    getBudgetUtilization,
    getProcessingTime,
    getSchemePopularity,
    getDashboard,
    getSchemeAnalytics,
    getSchemesList
} = require("../controllers/analyticsController");

router.get("/overview", protect, getOverview);
router.get("/region-distribution", protect, getRegionDistribution);
router.get("/budget-utilization", protect, getBudgetUtilization);
router.get("/processing-time", protect, getProcessingTime);
router.get("/scheme-popularity", protect, getSchemePopularity);
router.get("/dashboard", protect, getDashboard);
router.get("/scheme-analytics", protect, getSchemeAnalytics);
router.get("/schemes", protect, getSchemesList);

module.exports = router;
