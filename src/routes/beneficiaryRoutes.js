const express = require("express");
const router = express.Router();
const {
    getAllBeneficiaries,
    createBeneficiary,
    getBeneficiaryById,
    updateBeneficiary,
    deleteBeneficiary
} = require("../controllers/beneficiaryController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllBeneficiaries);
router.post("/", protect, createBeneficiary);
router.get("/:id", protect, getBeneficiaryById);
router.put("/:id", protect, updateBeneficiary);
router.delete("/:id", protect, deleteBeneficiary);

module.exports = router;
