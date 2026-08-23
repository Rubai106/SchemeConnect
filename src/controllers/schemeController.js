const Scheme = require("../models/Scheme");
const EligibilityProfile = require("../models/EligibilityProfile");
const SCHEME_STATUS = require("../constants/schemeStatus");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");

// ============================================================
// Easy to modify: eligibility matching
// ============================================================

// Simple eligibility check: compare profile fields against scheme criteria
// Returns true if the citizen appears eligible, false otherwise
const isEligible = (profile, criteria) => {
    if (!profile || !criteria) {
        return false;
    }

    // Check maximum income (citizen must earn at most this much)
    if (criteria.maximumIncome !== null && criteria.maximumIncome !== undefined) {
        if (profile.monthlyIncome > criteria.maximumIncome) {
            return false;
        }
    }

    // Check minimum income (citizen must earn at least this much)
    if (criteria.minimumIncome !== null && criteria.minimumIncome !== undefined) {
        if (profile.monthlyIncome < criteria.minimumIncome) {
            return false;
        }
    }

    // Check district (if scheme specifies a district, citizen must match)
    if (criteria.district && criteria.district.trim() !== "") {
        if (profile.district.toLowerCase() !== criteria.district.toLowerCase()) {
            return false;
        }
    }

    // Check eligible districts list (if scheme specifies a list, citizen's district must be in it)
    if (criteria.eligibleDistricts && criteria.eligibleDistricts.length > 0) {
        const normalized = criteria.eligibleDistricts.map((d) => d.toLowerCase());
        if (!normalized.includes(profile.district.toLowerCase())) {
            return false;
        }
    }

    // Check disability requirement
    if (criteria.disabilityRequired === true) {
        if (!profile.disabilityStatus) {
            return false;
        }
    }

    // Check minimum family size
    if (criteria.minimumFamilySize !== null && criteria.minimumFamilySize !== undefined) {
        if (profile.familySize < criteria.minimumFamilySize) {
            return false;
        }
    }

    // Check maximum family size
    if (criteria.maxFamilySize !== null && criteria.maxFamilySize !== undefined) {
        if (profile.familySize > criteria.maxFamilySize) {
            return false;
        }
    }

    return true;
};

// ============================================================
// GET /api/schemes — list schemes for Citizen browsing
// Excludes Draft schemes (not visible to citizens)
// ============================================================
const getSchemes = asyncHandler(async (req, res) => {
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

    return sendSuccess(res, 200, "Schemes fetched successfully", {
        schemes
    });
});

// ============================================================
// GET /api/schemes/:id — get one scheme
// ============================================================
const getSchemeById = asyncHandler(async (req, res) => {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
        throw createError("Scheme not found.", 404);
    }

    return sendSuccess(res, 200, "Scheme fetched successfully", {
        scheme
    });
});

// ============================================================
// GET /api/schemes/recommended — schemes the citizen may qualify for
// Only returns Active schemes
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
        return isEligible(profile, scheme.eligibilityCriteria);
    });

    return sendSuccess(res, 200, "Recommended schemes fetched successfully", {
        schemes: recommended,
        hasProfile: true
    });
});

module.exports = {
    getSchemes,
    getSchemeById,
    getRecommendedSchemes
};
