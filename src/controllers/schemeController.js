const Scheme = require("../models/Scheme");
const EligibilityProfile = require("../models/EligibilityProfile");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");
const SCHEME_CATEGORY = require("../constants/schemeCategory");
const SCHEME_STATUS = require("../constants/schemeStatus");
const TRANSACTION_STATUS = require("../constants/transactionStatus");
const ROLES = require("../constants/roles");

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const normalizeEligibilityDetails = (details = {}) => ({
    minIncome: hasValue(details.minIncome) ? Number(details.minIncome) : details.minimumIncome,
    maxIncome: hasValue(details.maxIncome) ? Number(details.maxIncome) : details.maximumIncome,
    occupationTypes: details.occupationTypes || [],
    disabilityRequired: details.disabilityRequired === true,
    minEducation: details.minEducation || "",
    maxFamilySize: hasValue(details.maxFamilySize) ? Number(details.maxFamilySize) : undefined,
    eligibleDistricts: details.eligibleDistricts || [],
    district: details.district || "",
    minimumFamilySize: hasValue(details.minimumFamilySize) ? Number(details.minimumFamilySize) : undefined
});

const normalizeSchemePayload = (body) => {
    const schemeData = { ...body };
    const rawCriteria = schemeData.eligibilityCriteria;
    const rawDetails = schemeData.eligibilityDetails;

    if (rawCriteria && typeof rawCriteria === "object" && !Array.isArray(rawCriteria)) {
        schemeData.eligibilityDetails = normalizeEligibilityDetails({
            ...rawCriteria,
            ...(rawDetails || {})
        });
        schemeData.eligibilityCriteria = schemeData.eligibilitySummary || "See structured eligibility details";
    } else if (rawDetails) {
        schemeData.eligibilityDetails = normalizeEligibilityDetails(rawDetails);
    }

    if (typeof schemeData.eligibilityCriteria === "string") {
        schemeData.eligibilityCriteria = schemeData.eligibilityCriteria.trim();
    }

    return schemeData;
};

// ============================================================
// MY FEATURE 3 — eligibility matching (Citizen Opportunity Explorer)
// Easy to modify: add another condition here + in Scheme.eligibilityDetails
// ============================================================

// Simple rule-based check: compare the citizen's profile against a scheme's
// structured eligibilityDetails. Returns true if the citizen appears eligible.
const isEligible = (profile, criteria) => {
    if (!profile || !criteria) {
        return false;
    }

    // Maximum income (citizen must earn at most this much)
    if (criteria.maxIncome !== null && criteria.maxIncome !== undefined) {
        if (profile.monthlyIncome > criteria.maxIncome) {
            return false;
        }
    }

    // Minimum income (citizen must earn at least this much)
    if (criteria.minIncome !== null && criteria.minIncome !== undefined) {
        if (profile.monthlyIncome < criteria.minIncome) {
            return false;
        }
    }

    // Single district match
    if (criteria.district && criteria.district.trim() !== "") {
        if (!profile.district || profile.district.toLowerCase() !== criteria.district.toLowerCase()) {
            return false;
        }
    }

    // Eligible districts list match
    if (criteria.eligibleDistricts && criteria.eligibleDistricts.length > 0) {
        const normalized = criteria.eligibleDistricts.map((d) => d.toLowerCase());
        if (!profile.district || !normalized.includes(profile.district.toLowerCase())) {
            return false;
        }
    }

    // Disability requirement
    if (criteria.disabilityRequired === true) {
        if (!profile.disabilityStatus) {
            return false;
        }
    }

    // Minimum family size
    if (criteria.minimumFamilySize !== null && criteria.minimumFamilySize !== undefined) {
        if (profile.familySize < criteria.minimumFamilySize) {
            return false;
        }
    }

    // Maximum family size
    if (criteria.maxFamilySize !== null && criteria.maxFamilySize !== undefined) {
        if (profile.familySize > criteria.maxFamilySize) {
            return false;
        }
    }

    return true;
};

// ============================================================
// MAHIMA'S FEATURE — Scheme Configuration Studio (admin)
// ============================================================

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
    const schemeData = normalizeSchemePayload(req.body);
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
        eligibilityCriteria: schemeData.eligibilityCriteria,
        eligibilityDetails: schemeData.eligibilityDetails,
        requiredDocuments: schemeData.requiredDocuments || [],
        benefitAmount: Number(schemeData.benefitAmount),
        allocatedBudget: Number(schemeData.allocatedBudget),
        applicationDeadline: schemeData.applicationDeadline,
        lowBudgetThresholdPercent: schemeData.lowBudgetThresholdPercent || 15,
        createdBy: req.user.userId
    });

    return sendSuccess(res, 201, "Scheme created successfully", { scheme });
});

// ============================================================
// SHARED READ — GET /api/schemes
// Role-aware: staff see ALL schemes (Studio); citizens see non-Draft (Explorer)
// ============================================================
const getSchemes = asyncHandler(async (req, res) => {
    // Staff (Administrator / Finance Officer / Auditor) — Scheme Configuration Studio
    if (req.user.role !== ROLES.CITIZEN) {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        return sendSuccess(res, 200, "Schemes fetched successfully", { schemes });
    }

    // Citizen — Welfare Opportunity Explorer: hide Draft, allow simple filters
    const filter = {
        status: { $ne: SCHEME_STATUS.DRAFT }
    };

    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (req.query.status) {
        filter.status = req.query.status;
    }

    const schemes = await Scheme.find(filter).sort({ applicationDeadline: 1 });

    return sendSuccess(res, 200, "Schemes fetched successfully", { schemes });
});

// SHARED READ — GET /api/schemes/:id
const getSchemeById = asyncHandler(async (req, res) => {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
        throw createError("Scheme not found", 404);
    }

    return sendSuccess(res, 200, "Scheme fetched successfully", { scheme });
});

// ============================================================
// MY FEATURE 3 — GET /api/schemes/recommended (Citizen only)
// Only Active schemes, matched against the citizen's EligibilityProfile
// ============================================================
const getRecommendedSchemes = asyncHandler(async (req, res) => {
    const profile = await EligibilityProfile.findOne({ user: req.user.userId });

    if (!profile) {
        return sendSuccess(res, 200, "Create your eligibility profile first to see recommended schemes.", {
            schemes: [],
            hasProfile: false
        });
    }

    const activeSchemes = await Scheme.find({ status: SCHEME_STATUS.ACTIVE });

    const recommended = activeSchemes.filter((scheme) => {
        return isEligible(profile, scheme.eligibilityDetails);
    });

    return sendSuccess(res, 200, "Recommended schemes fetched successfully", {
        schemes: recommended,
        hasProfile: true
    });
});

// ============================================================
// MAHIMA'S FEATURE — edit + budget monitoring (admin)
// ============================================================

// FR 3.2 — Edit scheme details / change status
const updateScheme = asyncHandler(async (req, res) => {
    const allowedFields = [
        "name",
        "category",
        "description",
        "eligibilityCriteria",
        "eligibilityDetails",
        "requiredDocuments",
        "benefitAmount",
        "allocatedBudget",
        "applicationDeadline",
        "status",
        "lowBudgetThresholdPercent"
    ];

    const schemeData = normalizeSchemePayload(req.body);
    const updates = {};

    allowedFields.forEach((field) => {
        if (schemeData[field] !== undefined) {
            updates[field] = schemeData[field];
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
    getRecommendedSchemes,
    updateScheme,
    getBudgetSummary
};
