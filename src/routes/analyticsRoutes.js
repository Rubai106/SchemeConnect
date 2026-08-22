const express = require("express");
const router = express.Router();

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
router.get("/overview", getOverview);
router.get("/region-distribution", getRegionDistribution);
router.get("/budget-utilization", getBudgetUtilization);
router.get("/processing-time", getProcessingTime);
router.get("/scheme-popularity", getSchemePopularity);
router.get("/dashboard", getDashboard);
router.get("/scheme-analytics", getSchemeAnalytics);
router.get("/schemes", getSchemesList);
module.exports = router;
