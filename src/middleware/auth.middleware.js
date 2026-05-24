exports.validateAuth = (req, res, next) => {
    // DEV MODE: Skip auth to maintain development speed during hackathon
    if (process.env.REQUIRE_STRICT_AUTH !== 'true') {
        req.user = { id: 'dev-user-uuid', email: 'dev@breakdown.os' };
        return next();
    }

    // TODO: Verify Bearer token with Firebase Admin or Clerk SDK
    return res.status(401).json({ error: 'Auth missing.' });
};