const express = require("express");
const router = express.Router();
const {
    getAllBeneficiaries,
    createBeneficiary,
    getBeneficiaryById,
    updateBeneficiary,
    deleteBeneficiary
} = require("../controllers/beneficiaryController");

router.get("/", getAllBeneficiaries);
router.post("/", createBeneficiary);
router.get("/:id", getBeneficiaryById);
router.put("/:id", updateBeneficiary);
router.delete("/:id", deleteBeneficiary);

module.exports = router;
