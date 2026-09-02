const express = require("express");
const router = express.Router();

const {
    registerUser,
    createStaffUser,
    getStaffUsers,
    loginUser,
    getCurrentUser,
    logoutUser,
    changePassword
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.get("/staff", protect, authorizeRoles(ROLES.ADMINISTRATOR), getStaffUsers);
router.post("/staff", protect, authorizeRoles(ROLES.ADMINISTRATOR), createStaffUser);
router.post("/logout", protect, logoutUser);
router.put("/change-password", protect, changePassword);

module.exports = router;
