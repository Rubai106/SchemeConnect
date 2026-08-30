const Scheme = require("../models/Scheme");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");
const SCHEME_CATEGORY = require("../constants/schemeCategory");
const TRANSACTION_STATUS = require("../constants/transactionStatus");

const requiredCreateFields = [
    "name",
    "category",
    "eligibilityCriteria",
    "benefitAmount",
    "allocatedBudget"
];

const getMissingFields = (body, fields) => {
    return fields.filter((field) => {
        return body[field] === undefined || body[field] === null || String(body[field]).trim() === "";
    });
};

// FR 3.1 — Administrator creates a new welfare scheme
const createScheme = asyncHandler(async (req, res) => {
    const schemeData = { ...req.body };
    delete schemeData.status;

    const missingFields = getMissingFields(schemeData, requiredCreateFields);

    if (missingFields.length > 0) {
        throw createError(`Missing required fields: ${missingFields.join(", ")}`, 400);
    }

    if (!Object.values(SCHEME_CATEGORY).includes(schemeData.category)) {
        throw createError("Invalid scheme category", 400);
    }

    if (Number(schemeData.benefitAmount) < 0 || Number(schemeData.allocatedBudget) < 0) {
        throw createError("Benefit amount and allocated budget must be positive numbers", 400);
    }

    const scheme = await Scheme.create({
        name: schemeData.name.trim(),
        category: schemeData.category,
        description: (schemeData.description || "").trim(),
        eligibilityCriteria: schemeData.eligibilityCriteria.trim(),
        benefitAmount: Number(schemeData.benefitAmount),
        allocatedBudget: Number(schemeData.allocatedBudget),
        lowBudgetThresholdPercent: schemeData.lowBudgetThresholdPercent || 15,
        createdBy: req.user.userId
    });

    return sendSuccess(res, 201, "Scheme created successfully", { scheme });
});

// List all schemes
const getSchemes = asyncHandler(async (req, res) => {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, "Schemes fetched successfully", { schemes });
});

// Get one scheme
const getSchemeById = asyncHandler(async (req, res) => {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
        throw createError("Scheme not found", 404);
    }

    return sendSuccess(res, 200, "Scheme fetched successfully", { scheme });
});

// FR 3.2 — Edit scheme details / change status
const updateScheme = asyncHandler(async (req, res) => {
    const allowedFields = [
        "name",
        "category",
        "description",
        "eligibilityCriteria",
        "benefitAmount",
        "allocatedBudget",
        "status",
        "lowBudgetThresholdPercent"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const scheme = await Scheme.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
    });

    if (!scheme) {
        throw createError("Scheme not found", 404);
    }

    return sendSuccess(res, 200, "Scheme updated successfully", { scheme });
});

// FR 3.3 / 3.4 — Budget monitoring + low-budget alert
const getBudgetSummary = asyncHandler(async (req, res) => {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
        throw createError("Scheme not found", 404);
    }

    const result = await Transaction.aggregate([
        {
            $match: {
                scheme: scheme._id,
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

    const utilizedBudget = result.length > 0 ? result[0].utilized : 0;
    const remainingBudget = scheme.allocatedBudget - utilizedBudget;
    const remainingPercent = scheme.allocatedBudget === 0
        ? 0
        : (remainingBudget / scheme.allocatedBudget) * 100;

    const lowBudgetAlert = remainingPercent < scheme.lowBudgetThresholdPercent;

    return sendSuccess(res, 200, "Budget summary fetched successfully", {
        schemeId: scheme._id,
        schemeName: scheme.name,
        allocatedBudget: scheme.allocatedBudget,
        utilizedBudget,
        remainingBudget,
        remainingPercent: Number(remainingPercent.toFixed(2)),
        lowBudgetAlert
    });
});

module.exports = {
    createScheme,
    getSchemes,
    getSchemeById,
    updateScheme,
    getBudgetSummary
};
