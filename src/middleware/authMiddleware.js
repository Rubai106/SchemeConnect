const jwt = require("jsonwebtoken");
const createError = require("../utils/appError");

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(createError("Authorization token is required", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return next(createError("Authorization token is required", 401));
    }

    if (!process.env.JWT_SECRET) {
        return next(createError("JWT secret is not configured", 500));
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    protect
};
