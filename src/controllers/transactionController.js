const Stripe = require("stripe");
const Scheme = require("../models/Scheme");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");
const SCHEME_STATUS = require("../constants/schemeStatus");
const TRANSACTION_STATUS = require("../constants/transactionStatus");

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const requiredDisburseFields = ["schemeId", "beneficiaryName", "beneficiaryPhone", "amount"];

const getMissingFields = (body, fields) => {
    return fields.filter((field) => {
        return body[field] === undefined || body[field] === null || String(body[field]).trim() === "";
    });
};

const stripeGatewayCall = async ({ amount, beneficiaryName, schemeName }) => {
    if (!stripe) {
        throw createError("Stripe is not configured. Please add STRIPE_SECRET_KEY in your .env file.", 500);
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "bdt",
        automatic_payment_methods: {
            enabled: true
        },
        metadata: {
            beneficiaryName,
            schemeName
        }
    });

    return {
        success: true,
        reference: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        gateway: "Stripe"
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
        const failedTransaction = await Transaction.create({
            scheme: scheme._id,
            beneficiaryName: req.body.beneficiaryName.trim(),
            beneficiaryPhone: req.body.beneficiaryPhone.trim(),
            amount: disbursementAmount,
            initiatedBy: req.user.userId,
            status: TRANSACTION_STATUS.FAILED,
            paymentGateway: "Stripe",
            gatewayReference: "budget_exceeded"
        });

        return sendSuccess(res, 400, "Disbursement exceeds remaining scheme budget", {
            transaction: failedTransaction
        });
    }

    let transaction = await Transaction.create({
        scheme: scheme._id,
        beneficiaryName: req.body.beneficiaryName.trim(),
        beneficiaryPhone: req.body.beneficiaryPhone.trim(),
        amount: disbursementAmount,
        initiatedBy: req.user.userId,
        status: TRANSACTION_STATUS.PENDING,
        paymentGateway: "Stripe"
    });

    const gatewayResult = await stripeGatewayCall({
        amount: disbursementAmount,
        beneficiaryName: req.body.beneficiaryName.trim(),
        schemeName: scheme.name
    });

    transaction.paymentGateway = gatewayResult.gateway;
    transaction.gatewayReference = gatewayResult.reference;

    if (gatewayResult.clientSecret) {
        transaction.status = TRANSACTION_STATUS.PENDING;
    } else {
        transaction.status = gatewayResult.success ? TRANSACTION_STATUS.SUCCESSFUL : TRANSACTION_STATUS.FAILED;
    }

    await transaction.save();

    const message = gatewayResult.clientSecret
        ? "Payment intent created successfully"
        : gatewayResult.success
            ? "Disbursement successful"
            : "Disbursement failed at the payment gateway";

    return sendSuccess(res, 201, message, {
        transaction,
        clientSecret: gatewayResult.clientSecret,
        paymentIntentId: gatewayResult.reference
    });
});

const confirmDisbursement = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { paymentIntentId, status = "succeeded" } = req.body;

    if (!transactionId) {
        throw createError("Transaction ID is required", 400);
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
        throw createError("Transaction not found", 404);
    }

    if (paymentIntentId) {
        transaction.gatewayReference = paymentIntentId;
    }

    transaction.status = status === "succeeded" ? TRANSACTION_STATUS.SUCCESSFUL : TRANSACTION_STATUS.FAILED;
    transaction.paymentGateway = "Stripe";
    await transaction.save();

    return sendSuccess(res, 200, "Payment confirmed successfully", { transaction });
});

const getTransactionById = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    if (!transactionId) {
        throw createError("Transaction ID is required", 400);
    }

    const transaction = await Transaction.findById(transactionId)
        .populate("scheme", "name category")
        .populate("initiatedBy", "fullName role");

    if (!transaction) {
        throw createError("Transaction not found", 404);
    }

    return sendSuccess(res, 200, "Transaction fetched successfully", { transaction });
});

// FR 3.8 / 3.9 — The financial ledger, filterable for auditing
const getLedger = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.schemeId) {
        filter.scheme = req.query.schemeId;
    }

    if (req.query.status) {
        filter.status = req.query.status;
    } else {
        filter.status = { $ne: TRANSACTION_STATUS.PENDING };
    }

    const ledger = await Transaction.find(filter)
        .populate("scheme", "name category")
        .populate("initiatedBy", "fullName role")
        .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Ledger fetched successfully", { ledger });
});

module.exports = {
    disburseFund,
    confirmDisbursement,
    getTransactionById,
    getLedger
};
