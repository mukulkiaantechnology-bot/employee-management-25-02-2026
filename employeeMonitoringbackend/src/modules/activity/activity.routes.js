const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { sendSuccess, sendError } = require('../../utils/response');

const router = Router();
router.use(authenticate);

const getDate = (d) => d ? new Date(d) : new Date();

// GET /activity/summary
router.get('/summary', async (req, res) => {
    try {
        const targetId = req.user?.role === 'employee' ? req.user.userId : (req.query.employeeId || req.user.userId);
        const log = await prisma.activityLog.findUnique({ where: { employeeId_date: { employeeId: targetId, date: getDate(req.query.date) } } });
        sendSuccess(res, log ?? { totalSeconds: 0, activeSeconds: 0, idleSeconds: 0, productivityScore: 0 });
    } catch (error) { sendError(res, 'Failed to fetch activity summary'); }
});

// GET /activity/apps
router.get('/apps', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const apps = await prisma.appUsage.findMany({
            where: { employee: { companyId: req.companyId }, ...(req.query.employeeId && { employeeId: req.query.employeeId }), date: getDate(req.query.date) },
            orderBy: { usageSeconds: 'desc' },
        });
        sendSuccess(res, apps);
    } catch (error) { sendError(res, 'Failed to fetch app usage'); }
});

// GET /activity/websites
router.get('/websites', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const sites = await prisma.websiteUsage.findMany({
            where: { employee: { companyId: req.companyId }, ...(req.query.employeeId && { employeeId: req.query.employeeId }), date: getDate(req.query.date) },
            orderBy: { usageSeconds: 'desc' },
        });
        sendSuccess(res, sites);
    } catch (error) { sendError(res, 'Failed to fetch website usage'); }
});

// GET /activity/apps/my
router.get('/apps/my', async (req, res) => {
    try {
        const apps = await prisma.appUsage.findMany({ where: { employeeId: req.user.userId, date: getDate(req.query.date) }, orderBy: { usageSeconds: 'desc' } });
        sendSuccess(res, apps);
    } catch (error) { sendError(res, 'Failed to fetch app usage'); }
});

// GET /activity/websites/my
router.get('/websites/my', async (req, res) => {
    try {
        const sites = await prisma.websiteUsage.findMany({ where: { employeeId: req.user.userId, date: getDate(req.query.date) }, orderBy: { usageSeconds: 'desc' } });
        sendSuccess(res, sites);
    } catch (error) { sendError(res, 'Failed to fetch website usage'); }
});

// POST /activity/sync (from desktop agent)
router.post('/sync', async (req, res) => {
    try {
        const { employeeId, date, totalSeconds, activeSeconds, idleSeconds, productivityScore, hourlyData, appUsages, websiteUsages } = req.body;
        const d = new Date(date);

        await prisma.activityLog.upsert({
            where: { employeeId_date: { employeeId, date: d } },
            create: { employeeId, date: d, totalSeconds, activeSeconds, idleSeconds, productivityScore, hourlyData },
            update: { totalSeconds, activeSeconds, idleSeconds, productivityScore, hourlyData },
        });

        if (appUsages?.length) {
            await prisma.appUsage.deleteMany({ where: { employeeId, date: d } });
            await prisma.appUsage.createMany({ data: appUsages.map((a) => ({ ...a, employeeId, date: d })) });
        }
        if (websiteUsages?.length) {
            await prisma.websiteUsage.deleteMany({ where: { employeeId, date: d } });
            await prisma.websiteUsage.createMany({ data: websiteUsages.map((w) => ({ ...w, employeeId, date: d })) });
        }

        sendSuccess(res, { message: 'Activity synced' });
    } catch (error) { sendError(res, 'Activity sync failed'); }
});

module.exports = router;
