const createError = require("../utils/appError");

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(createError("Authentication required", 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(createError("Access denied", 403));
        }

        next();
    };
};

module.exports = {
    authorizeRoles
};
