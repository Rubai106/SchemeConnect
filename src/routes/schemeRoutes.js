const express = require("express");
const router = express.Router();

const {
    createScheme,
    getSchemes,
    getSchemeById,
    updateScheme,
    getBudgetSummary
} = require("../controllers/schemeController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

// Only Administrators configure schemes.
// Finance Officers and Auditors still need to VIEW schemes/budgets,
// so read routes allow those roles too.
router.post("/", protect, authorizeRoles(ROLES.ADMINISTRATOR), createScheme);
router.get(
    "/",
    protect,
    authorizeRoles(ROLES.ADMINISTRATOR, ROLES.FINANCE_OFFICER, ROLES.AUDITOR),
    getSchemes
);
router.get(
    "/:id",
    protect,
    authorizeRoles(ROLES.ADMINISTRATOR, ROLES.FINANCE_OFFICER, ROLES.AUDITOR),
    getSchemeById
);
router.put("/:id", protect, authorizeRoles(ROLES.ADMINISTRATOR), updateScheme);
router.get(
    "/:id/budget",
    protect,
    authorizeRoles(ROLES.ADMINISTRATOR, ROLES.FINANCE_OFFICER, ROLES.AUDITOR),
    getBudgetSummary
);

module.exports = router;
