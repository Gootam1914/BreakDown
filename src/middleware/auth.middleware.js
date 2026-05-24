exports.validateAuth = (req, res, next) => {
    if (process.env.REQUIRE_STRICT_AUTH !== 'true') {
        req.user = { id: 'dev-user-uuid', email: 'dev@breakdown.os' };
        return next();
    }
    return res.status(401).json({ error: 'Auth missing.' });
};