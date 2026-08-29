const { sendError } = require("../utils/apiResponse");

const getDuplicateField = (error) => {
    return Object.keys(error.keyPattern || error.keyValue || {})[0] || "field";
};

const normalizeError = (error) => {
    if (error.name === "ValidationError") {
        return {
            statusCode: 400,
            message: Object.values(error.errors).map((item) => item.message).join(", ")
        };
    }

    if (error.name === "CastError") {
        return {
            statusCode: 400,
            message: `Invalid ${error.path}: ${error.value}`
        };
    }

    if (error.code === 11000) {
        const duplicateField = getDuplicateField(error);

        return {
            statusCode: 409,
            message: `User with this ${duplicateField} already exists`
        };
    }

    if (error.name === "TokenExpiredError") {
        return {
            statusCode: 401,
            message: "Token has expired"
        };
    }

    if (error.name === "JsonWebTokenError") {
        return {
            statusCode: 401,
            message: "Invalid token"
        };
    }

    return {
        statusCode: error.statusCode || 500,
        message: error.message || "Internal server error"
    };
};

const notFound = (req, res, next) => {
    const error = new Error("Route not found.");
    error.statusCode = 404;
    next(error);
};

const errorHandler = (error, req, res, next) => {
    const environment = process.env.NODE_ENV || "development";
    const normalizedError = normalizeError(error);
    const isProduction = environment === "production";
    const statusCode = normalizedError.statusCode;
    const safeMessage = statusCode === 500 && isProduction
        ? "Internal server error"
        : normalizedError.message;

    if (isProduction) {
        return sendError(res, statusCode, safeMessage);
    }

    return res.status(statusCode).json({
        success: false,
        message: safeMessage,
        error: error.message,
        stack: error.stack
    });
};

module.exports = {
    notFound,
    errorHandler
};
