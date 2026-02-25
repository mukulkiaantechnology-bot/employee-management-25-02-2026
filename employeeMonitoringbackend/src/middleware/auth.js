const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        sendError(res, 'No token provided', 401, 'UNAUTHORIZED');
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        req.companyId = payload.companyId;
        next();
    } catch {
        sendError(res, 'Invalid or expired token', 401, 'UNAUTHORIZED');
    }
};

module.exports = { authenticate };
