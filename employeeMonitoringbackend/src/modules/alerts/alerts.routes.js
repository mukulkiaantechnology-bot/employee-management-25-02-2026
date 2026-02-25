const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { sendSuccess, sendError } = require('../../utils/response');

const router = Router();
router.use(authenticate);

// GET /alerts/config
router.get('/config', requireRole('admin'), async (req, res) => {
    try {
        const configs = await prisma.alertConfig.findMany({ where: { companyId: req.companyId } });
        sendSuccess(res, configs);
    } catch (error) { sendError(res, 'Failed to fetch alert configs'); }
});

// PUT /alerts/config (bulk update)
router.put('/config', requireRole('admin'), async (req, res) => {
    try {
        const configs = req.body;
        const results = await Promise.all(configs.map(cfg =>
            prisma.alertConfig.upsert({
                where: { companyId_type: { companyId: req.companyId, type: cfg.type } },
                create: { companyId: req.companyId, ...cfg },
                update: { enabled: cfg.enabled, threshold: cfg.threshold, sensitivity: cfg.sensitivity, zones: cfg.zones },
            })
        ));
        sendSuccess(res, results);
    } catch (error) { sendError(res, 'Failed to update alert configs'); }
});

// PATCH /alerts/config/:type
router.patch('/config/:type', requireRole('admin'), async (req, res) => {
    try {
        const config = await prisma.alertConfig.upsert({
            where: { companyId_type: { companyId: req.companyId, type: req.params.type } },
            create: { companyId: req.companyId, type: req.params.type, ...req.body },
            update: req.body,
        });
        sendSuccess(res, config);
    } catch (error) { sendError(res, 'Failed to update alert config'); }
});

// GET /alerts/history (recent audit log entries that are alerts)
router.get('/history', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { companyId: req.companyId, action: { startsWith: 'alert_' } },
            orderBy: { timestamp: 'desc' },
            take: 50,
        });
        sendSuccess(res, logs);
    } catch (error) { sendError(res, 'Failed to fetch alert history'); }
});

module.exports = router;
