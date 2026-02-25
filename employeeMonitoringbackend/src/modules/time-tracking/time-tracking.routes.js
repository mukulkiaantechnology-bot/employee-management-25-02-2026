const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { sendSuccess, sendError } = require('../../utils/response');
const { getPagination, buildMeta } = require('../../utils/pagination');

const router = Router();
router.use(authenticate);

const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

// GET /time-entries
router.get('/', async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page) });
        const { date, employeeId } = req.query;
        const targetId = req.user?.role === 'employee' ? req.user.userId : (employeeId || undefined);
        const where = {
            employee: { companyId: req.companyId },
            ...(targetId && { employeeId: targetId }),
            ...(date && { date: new Date(date) }),
        };
        const [entries, total] = await Promise.all([
            prisma.timeEntry.findMany({ where, skip, take, orderBy: { startTime: 'desc' }, include: { project: { select: { id: true, name: true } } } }),
            prisma.timeEntry.count({ where }),
        ]);
        sendSuccess(res, entries, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch time entries'); }
});

// GET /time-entries/summary
router.get('/summary', async (req, res) => {
    try {
        const targetId = req.user?.role === 'employee' ? req.user.userId : (req.query.employeeId || req.user.userId);
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const entries = await prisma.timeEntry.findMany({ where: { employeeId: targetId, date } });
        const totalSeconds = entries.reduce((sum, e) => sum + e.durationSeconds, 0);
        const overtimeSeconds = Math.max(0, totalSeconds - 8 * 3600);
        sendSuccess(res, {
            totalSeconds,
            totalFormatted: formatDuration(totalSeconds),
            overtimeSeconds,
            entryCount: entries.length,
            isRunning: entries.some(e => e.isRunning),
        });
    } catch (error) { sendError(res, 'Failed to fetch summary'); }
});

// POST /time-entries (start timer)
router.post('/', async (req, res) => {
    try {
        const { title, projectId, description, source = 'timer' } = req.body;
        const now = new Date();
        const today = new Date(now); today.setHours(0, 0, 0, 0);
        // Stop any currently running entry
        await prisma.timeEntry.updateMany({
            where: { employeeId: req.user.userId, isRunning: true },
            data: { isRunning: false, endTime: now, durationSeconds: { increment: 0 } },
        });
        const entry = await prisma.timeEntry.create({
            data: { employeeId: req.user.userId, date: today, startTime: now, title, projectId, description, source, isRunning: true },
        });
        sendSuccess(res, entry, 201);
    } catch (error) { sendError(res, 'Failed to start timer'); }
});

// PATCH /time-entries/:id/stop
router.patch('/:id/stop', async (req, res) => {
    try {
        const existing = await prisma.timeEntry.findUnique({ where: { id: req.params.id } });
        if (!existing) { sendError(res, 'Entry not found', 404, 'NOT_FOUND'); return; }
        const endTime = new Date();
        const durationSeconds = Math.floor((endTime.getTime() - existing.startTime.getTime()) / 1000);
        const entry = await prisma.timeEntry.update({
            where: { id: req.params.id },
            data: { endTime, durationSeconds, isRunning: false },
        });
        sendSuccess(res, entry);
    } catch (error) { sendError(res, 'Failed to stop timer'); }
});

// PATCH /time-entries/:id
router.patch('/:id', async (req, res) => {
    try {
        const entry = await prisma.timeEntry.update({ where: { id: req.params.id }, data: req.body });
        sendSuccess(res, entry);
    } catch (error) { sendError(res, 'Failed to update entry'); }
});

// DELETE /time-entries/:id
router.delete('/:id', async (req, res) => {
    try {
        await prisma.timeEntry.delete({ where: { id: req.params.id } });
        sendSuccess(res, { message: 'Entry deleted' });
    } catch (error) { sendError(res, 'Failed to delete entry'); }
});

module.exports = router;
