const express = require("express");
const router = express.Router();

const { disburseFund, getLedger } = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

// Only Finance Officers can move money.
router.post("/disburse", protect, authorizeRoles(ROLES.FINANCE_OFFICER), disburseFund);

// Administrators, Finance Officers and Auditors can all read the ledger.
router.get(
    "/",
    protect,
    authorizeRoles(ROLES.ADMINISTRATOR, ROLES.FINANCE_OFFICER, ROLES.AUDITOR),
    getLedger
);

module.exports = router;
