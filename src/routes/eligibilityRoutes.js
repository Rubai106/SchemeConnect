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

router.use(protect);
router.use(authorizeRoles("Citizen"));

router.post("/", createProfile);
router.get("/me", getMyProfile);
router.put("/", updateProfile);
router.delete("/", deleteProfile);

module.exports = router;
