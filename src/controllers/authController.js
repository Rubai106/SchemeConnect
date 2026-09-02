const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");
const ROLES = require("../constants/roles");
const ACCOUNT_STATUS = require("../constants/accountStatus");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{10,15}$/;
const validNationalIdLengths = [10, 13, 17];

const requiredRegisterFields = [
    "fullName",
    "nationalId",
    "email",
    "contactNumber",
    "password",
    "division",
    "district"
];

const requiredLoginFields = [
    "email",
    "password"
];

const requiredChangePasswordFields = [
    "oldPassword",
    "newPassword"
];

const trimString = (value) => {
    return typeof value === "string" ? value.trim() : value;
};

const getMissingFields = (body, fields) => {
    return fields.filter((field) => {
        return !body[field] || String(body[field]).trim() === "";
    });
};

const sanitizeUser = (user) => {
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

const validateRegisterPayload = (body) => {
    const errors = [];
    const nationalId = trimString(body.nationalId);
    const email = trimString(body.email);
    const contactNumber = trimString(body.contactNumber);
    const password = trimString(body.password);

    if (email && !emailRegex.test(email)) {
        errors.push("Invalid email format");
    }

    if (password && password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (nationalId && !validNationalIdLengths.includes(nationalId.length)) {
        errors.push("National ID must be 10, 13, or 17 characters long");
    }

    if (contactNumber && !phoneRegex.test(contactNumber)) {
        errors.push("Contact number must contain 10 to 15 digits and may start with +");
    }

    return errors;
};

const validateEmailAndPassword = (email, password) => {
    const errors = [];

    if (email && !emailRegex.test(email)) {
        errors.push("Invalid email format");
    }

    if (password && password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    return errors;
};

const createToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const registerUser = asyncHandler(async (req, res) => {
    const missingFields = getMissingFields(req.body, requiredRegisterFields);

    if (missingFields.length > 0) {
        throw createError(`Missing required fields: ${missingFields.join(", ")}`, 400);
    }

    const validationErrors = validateRegisterPayload(req.body);

    if (validationErrors.length > 0) {
        throw createError(validationErrors.join(", "), 400);
    }

    const {
        fullName,
        nationalId,
        email,
        contactNumber,
        password,
        division,
        district
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNationalId = nationalId.trim();

    const existingUser = await User.findOne({
        $or: [
            { email: normalizedEmail },
            { nationalId: normalizedNationalId }
        ]
    });

    if (existingUser) {
        const duplicateField = existingUser.email === normalizedEmail ? "email" : "nationalId";
        throw createError(`User with this ${duplicateField} already exists`, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName: fullName.trim(),
        nationalId: normalizedNationalId,
        email: normalizedEmail,
        contactNumber: contactNumber.trim(),
        password: hashedPassword,
        role: ROLES.CITIZEN,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        division: division.trim(),
        district: district.trim()
    });

    return sendSuccess(res, 201, "User registered successfully", {
        user: sanitizeUser(user)
    });
});

const createStaffUser = asyncHandler(async (req, res) => {
    const requiredFields = ["fullName", "email", "password", "role", "division", "district"];
    const missingFields = getMissingFields(req.body, requiredFields);

    if (missingFields.length > 0) {
        throw createError(`Missing required fields: ${missingFields.join(", ")}`, 400);
    }

    const { fullName, email, password, role, division, district, nationalId, contactNumber } = req.body;
    const normalizedEmail = trimString(email).toLowerCase();
    const normalizedRole = trimString(role);

    if (!Object.values(ROLES).includes(normalizedRole)) {
        throw createError("Invalid role selected", 400);
    }

    const validationErrors = validateEmailAndPassword(normalizedEmail, trimString(password));

    if (validationErrors.length > 0) {
        throw createError(validationErrors.join(", "), 400);
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
        throw createError("User with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(trimString(password), 10);
    const staffUser = await User.create({
        fullName: trimString(fullName),
        nationalId: trimString(nationalId || "0000000000"),
        email: normalizedEmail,
        contactNumber: trimString(contactNumber || "+0000000000"),
        password: hashedPassword,
        role: normalizedRole,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        division: trimString(division),
        district: trimString(district)
    });

    return sendSuccess(res, 201, "Staff account created successfully", {
        user: sanitizeUser(staffUser)
    });
});

const getStaffUsers = asyncHandler(async (req, res) => {
    const users = await User.find({
        role: {
            $in: [ROLES.ADMINISTRATOR, ROLES.FINANCE_OFFICER, ROLES.VERIFICATION_OFFICER, ROLES.AUDITOR]
        }
    }).select("-password").sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Staff users fetched successfully", {
        users
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const missingFields = getMissingFields(req.body, requiredLoginFields);

    if (missingFields.length > 0) {
        throw createError("Email and password are required", 400);
    }

    const email = trimString(req.body.email).toLowerCase();
    const password = trimString(req.body.password);
    const validationErrors = validateEmailAndPassword(email, password);

    if (validationErrors.length > 0) {
        throw createError(validationErrors.join(", "), 400);
    }

    if (!process.env.JWT_SECRET) {
        throw createError("JWT secret is not configured", 500);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw createError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw createError("Invalid email or password", 401);
    }

    const token = createToken(user);

    return sendSuccess(res, 200, "Login successful", {
        token,
        user: sanitizeUser(user)
    });
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
        throw createError("User not found", 404);
    }

    return sendSuccess(res, 200, "Current user fetched successfully", {
        user
    });
});

const logoutUser = asyncHandler(async (req, res) => {
    return sendSuccess(res, 200, "Logged out successfully.", null);
});

const changePassword = asyncHandler(async (req, res) => {
    const missingFields = getMissingFields(req.body, requiredChangePasswordFields);

    if (missingFields.length > 0) {
        throw createError("Old password and new password are required", 400);
    }

    const oldPassword = trimString(req.body.oldPassword);
    const newPassword = trimString(req.body.newPassword);

    if (newPassword.length < 8) {
        throw createError("New password must be at least 8 characters long", 400);
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
        throw createError("User not found", 404);
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
        throw createError("Old password is incorrect", 401);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return sendSuccess(res, 200, "Password changed successfully", null);
});

module.exports = {
    registerUser,
    createStaffUser,
    getStaffUsers,
    loginUser,
    getCurrentUser,
    logoutUser,
    changePassword
};
