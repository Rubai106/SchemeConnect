const express = require("express");
const router = express.Router();

const {
    createScheme,
    getSchemes,
    getSchemeById,
    getRecommendedSchemes,
    updateScheme,
    getBudgetSummary
} = require("../controllers/schemeController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

// All scheme routes require authentication
router.use(protect);

// Roles that may READ schemes:
//   Citizens  -> Welfare Opportunity Explorer (my Feature 3)
//   Staff     -> Scheme Configuration Studio (Mahima's feature)
const READ_ROLES = [
    ROLES.CITIZEN,
    ROLES.ADMINISTRATOR,
    ROLES.FINANCE_OFFICER,
    ROLES.AUDITOR
];

// IMPORTANT: /recommended must come BEFORE /:id

// MY FEATURE 3 — Citizen personalized recommendations
router.get("/recommended", authorizeRoles(ROLES.CITIZEN), getRecommendedSchemes);

// SHARED — list schemes (getSchemes is role-aware: staff see all, citizens see non-Draft)
router.get("/", authorizeRoles(...READ_ROLES), getSchemes);

// MAHIMA'S FEATURE — admin creates a scheme
router.post("/", authorizeRoles(ROLES.ADMINISTRATOR), createScheme);

// MAHIMA'S FEATURE — budget summary (staff only). Kept before /:id for clarity.
router.get("/:id/budget", authorizeRoles(ROLES.ADMINISTRATOR, ROLES.FINANCE_OFFICER, ROLES.AUDITOR), getBudgetSummary);

// SHARED — get one scheme
router.get("/:id", authorizeRoles(...READ_ROLES), getSchemeById);

// MAHIMA'S FEATURE — admin edits a scheme / changes status
router.put("/:id", authorizeRoles(ROLES.ADMINISTRATOR), updateScheme);

module.exports = router;
