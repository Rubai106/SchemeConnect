const express = require("express");
const router = express.Router();

const {
    getSchemes,
    getSchemeById,
    getRecommendedSchemes
} = require("../controllers/schemeController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Public scheme browsing (auth required for Citizen-only app)
router.use(protect);
router.use(authorizeRoles("Citizen"));

// IMPORTANT: /recommended must come before /:id
router.get("/recommended", getRecommendedSchemes);
router.get("/", getSchemes);
router.get("/:id", getSchemeById);

module.exports = router;
