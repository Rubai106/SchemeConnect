const requestLogger = (req, res, next) => {
    const startedAt = Date.now();

    res.on("finish", () => {
        const responseTime = Date.now() - startedAt;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`);
    });

    next();
};

module.exports = requestLogger;
