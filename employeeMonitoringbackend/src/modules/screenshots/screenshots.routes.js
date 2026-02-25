const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { auditAction } = require('../../middleware/audit');
const { sendSuccess, sendError } = require('../../utils/response');
const { getPagination, buildMeta } = require('../../utils/pagination');

const router = Router();
router.use(authenticate);

// GET /screenshots
router.get('/', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page), pageSize: Number(req.query.pageSize) || 20 });
        const { employeeId, date } = req.query;
        const where = {
            isDeleted: false,
            employee: { companyId: req.companyId },
            ...(employeeId && { employeeId }),
            ...(date && { timestamp: { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) } }),
        };
        const [screenshots, total] = await Promise.all([
            prisma.screenshot.findMany({ where, skip, take, orderBy: { timestamp: 'desc' }, include: { employee: { select: { id: true, name: true, screenshotsBlurred: true } } } }),
            prisma.screenshot.count({ where }),
        ]);
        sendSuccess(res, screenshots, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch screenshots'); }
});

// GET /screenshots/my
router.get('/my', async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page) });
        const screenshots = await prisma.screenshot.findMany({
            where: { employeeId: req.user.userId, isDeleted: false },
            skip, take, orderBy: { timestamp: 'desc' },
        });
        sendSuccess(res, screenshots, 200, buildMeta(page, pageSize, await prisma.screenshot.count({ where: { employeeId: req.user.userId, isDeleted: false } })));
    } catch (error) { sendError(res, 'Failed to fetch screenshots'); }
});

// POST /screenshots (from desktop agent)
router.post('/', async (req, res) => {
    try {
        const { employeeId, imageUrl, thumbnailUrl, appName, activityScore, timestamp } = req.body;
        const screenshot = await prisma.screenshot.create({
            data: { employeeId, imageUrl, thumbnailUrl, appName, activityScore, timestamp: new Date(timestamp) },
        });
        sendSuccess(res, screenshot, 201);
    } catch (error) { sendError(res, 'Failed to save screenshot'); }
});

// PATCH /screenshots/:id/blur
router.patch('/:id/blur', requireRole('admin'), auditAction('blur_screenshot'), async (req, res) => {
    try {
        const s = await prisma.screenshot.update({ where: { id: req.params.id }, data: { isBlurred: req.body.isBlurred } });
        sendSuccess(res, s);
    } catch (error) { sendError(res, 'Failed to update blur'); }
});

// PATCH /screenshots/:id/flag
router.patch('/:id/flag', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const s = await prisma.screenshot.update({ where: { id: req.params.id }, data: { isFlagged: req.body.isFlagged, isReviewed: true } });
        sendSuccess(res, s);
    } catch (error) { sendError(res, 'Failed to update flag'); }
});

// DELETE /screenshots/:id
router.delete('/:id', requireRole('admin'), auditAction('delete_screenshot'), async (req, res) => {
    try {
        await prisma.screenshot.update({ where: { id: req.params.id }, data: { isDeleted: true, deletedAt: new Date() } });
        sendSuccess(res, { message: 'Screenshot deleted' });
    } catch (error) { sendError(res, 'Failed to delete screenshot'); }
});

// DELETE /screenshots/bulk
router.delete('/bulk', requireRole('admin'), auditAction('bulk_delete_screenshots'), async (req, res) => {
    try {
        const { ids } = req.body;
        await prisma.screenshot.updateMany({ where: { id: { in: ids } }, data: { isDeleted: true, deletedAt: new Date() } });
        sendSuccess(res, { message: `${ids.length} screenshots deleted` });
    } catch (error) { sendError(res, 'Bulk delete failed'); }
});

module.exports = router;
