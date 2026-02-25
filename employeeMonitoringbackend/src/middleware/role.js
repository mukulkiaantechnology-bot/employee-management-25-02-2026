const { sendError } = require('../utils/response');

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
            return;
        }
        if (!roles.includes(req.user.role)) {
            sendError(res, 'Insufficient permissions', 403, 'FORBIDDEN');
            return;
        }
        next();
    };
};

module.exports = { requireRole };
