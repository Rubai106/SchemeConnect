const express = require("express");
const router = express.Router();

const {
    getOffices,
    getOfficeById,
    getNearbyOffices
} = require("../controllers/officeController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All office routes require authentication and Citizen role
router.use(protect);
router.use(authorizeRoles("Citizen"));

// IMPORTANT: /nearby must come before /:id
router.get("/nearby", getNearbyOffices);
router.get("/", getOffices);
router.get("/:id", getOfficeById);

module.exports = router;
