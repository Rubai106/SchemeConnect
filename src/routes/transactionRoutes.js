const express = require("express");
const router = express.Router();

const { disburseFund, confirmDisbursement, getTransactionById, getLedger } = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

// Only Finance Officers can move money.
router.post("/disburse", protect, authorizeRoles(ROLES.FINANCE_OFFICER), disburseFund);
router.post("/:transactionId/confirm", protect, authorizeRoles(ROLES.FINANCE_OFFICER), confirmDisbursement);

// Administrators, Finance Officers and Auditors can all read the ledger and individual receipts.
router.get(
    "/",
    protect,
    authorizeRoles(ROLES.ADMINISTRATOR, ROLES.FINANCE_OFFICER, ROLES.AUDITOR),
    getLedger
);
router.get(
    "/:transactionId",
    protect,
    authorizeRoles(ROLES.ADMINISTRATOR, ROLES.FINANCE_OFFICER, ROLES.AUDITOR),
    getTransactionById
);

module.exports = router;
