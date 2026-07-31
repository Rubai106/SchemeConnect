const express = require("express");
const router = express.Router();

const {
    createProfile,
    getMyProfile,
    updateProfile,
    deleteProfile
} = require("../controllers/eligibilityController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

router.use(protect);
router.use(authorizeRoles(ROLES.CITIZEN));

router.post("/", createProfile);
router.get("/me", getMyProfile);
router.put("/", updateProfile);
router.delete("/", deleteProfile);

module.exports = router;
