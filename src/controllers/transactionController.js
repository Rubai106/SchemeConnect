const Scheme = require("../models/Scheme");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");
const SCHEME_STATUS = require("../constants/schemeStatus");
const TRANSACTION_STATUS = require("../constants/transactionStatus");

const requiredDisburseFields = ["schemeId", "beneficiaryName", "beneficiaryPhone", "amount"];

const getMissingFields = (body, fields) => {
    return fields.filter((field) => {
        return body[field] === undefined || body[field] === null || String(body[field]).trim() === "";
    });
};

// -----------------------------------------------------------------------
// Stands in for a real call to the bKash Payment Gateway Checkout API.
// Swap this out for an actual fetch()/axios call once sandbox
// credentials are available — everything else in this file stays the same.
// -----------------------------------------------------------------------
const mockBkashGatewayCall = () => {
    const isSuccess = Math.random() > 0.1;

    return {
        success: isSuccess,
        reference: isSuccess ? `BK${Date.now()}${Math.floor(Math.random() * 1000)}` : null
    };
};

const getUtilizedBudget = async (schemeId) => {
    const result = await Transaction.aggregate([
        {
            $match: {
                scheme: schemeId,
                status: TRANSACTION_STATUS.SUCCESSFUL
            }
        },
        {
            $group: {
                _id: null,
                utilized: { $sum: "$amount" }
            }
        }
    ]);

    return result.length > 0 ? result[0].utilized : 0;
};

// FR 3.5 / 3.6 / 3.7 — Initiate, verify, and record a disbursement
const disburseFund = asyncHandler(async (req, res) => {
    const missingFields = getMissingFields(req.body, requiredDisburseFields);

    if (missingFields.length > 0) {
        throw createError(`Missing required fields: ${missingFields.join(", ")}`, 400);
    }

    const scheme = await Scheme.findById(req.body.schemeId);

    if (!scheme) {
        throw createError("Scheme not found", 404);
    }

    if (scheme.status !== SCHEME_STATUS.ACTIVE) {
        throw createError("Cannot disburse funds from a scheme that is not Active", 400);
    }

    if (Number(req.body.amount) <= 0) {
        throw createError("Disbursement amount must be greater than zero", 400);
    }

    const disbursementAmount = Number(req.body.amount);
    const utilizedBudget = await getUtilizedBudget(scheme._id);

    if (utilizedBudget + disbursementAmount > scheme.allocatedBudget) {
        throw createError("Disbursement exceeds remaining scheme budget", 400);
    }

    let transaction = await Transaction.create({
        scheme: scheme._id,
        beneficiaryName: req.body.beneficiaryName.trim(),
        beneficiaryPhone: req.body.beneficiaryPhone.trim(),
        amount: disbursementAmount,
        initiatedBy: req.user.userId,
        status: TRANSACTION_STATUS.PENDING
    });

    const gatewayResult = mockBkashGatewayCall();

    transaction.status = gatewayResult.success ? TRANSACTION_STATUS.SUCCESSFUL : TRANSACTION_STATUS.FAILED;
    transaction.gatewayReference = gatewayResult.reference;
    await transaction.save();

    const message = gatewayResult.success
        ? "Disbursement successful"
        : "Disbursement failed at the payment gateway";

    return sendSuccess(res, 201, message, { transaction });
});

// FR 3.8 / 3.9 — The financial ledger, filterable for auditing
const getLedger = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.schemeId) {
        filter.scheme = req.query.schemeId;
    }

    if (req.query.status) {
        filter.status = req.query.status;
    }

    const ledger = await Transaction.find(filter)
        .populate("scheme", "name category")
        .populate("initiatedBy", "fullName role")
        .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Ledger fetched successfully", { ledger });
});

module.exports = {
    disburseFund,
    getLedger
};
