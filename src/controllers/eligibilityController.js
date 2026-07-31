const EligibilityProfile = require("../models/EligibilityProfile");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");

const allowedProfileFields = [
    "occupation",
    "monthlyIncome",
    "familySize",
    "disabilityStatus",
    "educationLevel",
    "maritalStatus",
    "division",
    "district"
];

const getProfileData = (body) => {
    const profileData = {};

    allowedProfileFields.forEach((field) => {
        if (body[field] !== undefined) {
            profileData[field] = body[field];
        }
    });

    return profileData;
};

const createProfile = asyncHandler(async (req, res) => {
    const existingProfile = await EligibilityProfile.findOne({ user: req.user.userId });

    if (existingProfile) {
        throw createError("Eligibility profile already exists", 409);
    }

    const profile = await EligibilityProfile.create({
        user: req.user.userId,
        ...getProfileData(req.body)
    });

    return sendSuccess(res, 201, "Eligibility profile created successfully", {
        profile
    });
});

const getMyProfile = asyncHandler(async (req, res) => {
    const profile = await EligibilityProfile.findOne({ user: req.user.userId });

    if (!profile) {
        throw createError("Eligibility profile not found", 404);
    }

    return sendSuccess(res, 200, "Eligibility profile fetched successfully", {
        profile
    });
});

const updateProfile = asyncHandler(async (req, res) => {
    const profile = await EligibilityProfile.findOneAndUpdate(
        { user: req.user.userId },
        getProfileData(req.body),
        { new: true, runValidators: true }
    );

    if (!profile) {
        throw createError("Eligibility profile not found", 404);
    }

    return sendSuccess(res, 200, "Eligibility profile updated successfully", {
        profile
    });
});

const deleteProfile = asyncHandler(async (req, res) => {
    const profile = await EligibilityProfile.findOneAndDelete({ user: req.user.userId });

    if (!profile) {
        throw createError("Eligibility profile not found", 404);
    }

    return sendSuccess(res, 200, "Eligibility profile deleted successfully", null);
});

module.exports = {
    createProfile,
    getMyProfile,
    updateProfile,
    deleteProfile
};
