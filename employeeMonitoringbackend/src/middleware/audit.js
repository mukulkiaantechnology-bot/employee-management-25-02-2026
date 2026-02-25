const { prisma } = require('../config/database');

const auditAction = (action) => {
    return (req, res, next) => {
        res.on('finish', () => {
            if (res.statusCode < 400 && req.companyId) {
                prisma.auditLog
                    .create({
                        data: {
                            companyId: req.companyId,
                            userId: req.user?.userId ?? null,
                            action,
                            ip: req.ip ?? null,
                            userAgent: req.headers['user-agent'] ?? null,
                            status: 'success',
                            metadata: { method: req.method, path: req.path },
                        },
                    })
                    .catch(console.error);
            }
        });
        next();
    };
};

module.exports = { auditAction };
