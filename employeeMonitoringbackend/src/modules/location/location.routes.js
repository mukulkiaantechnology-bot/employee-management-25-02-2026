const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { auditAction } = require('../../middleware/audit');
const { sendSuccess, sendError } = require('../../utils/response');

const router = Router();
router.use(authenticate);

// GET /location/live
router.get('/live', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            where: { companyId: req.companyId, status: 'active', locationTracking: true },
            select: { id: true, name: true, avatarUrl: true, position: true },
        });
        const positions = await Promise.all(employees.map(async (emp) => {
            const latest = await prisma.locationLog.findFirst({ where: { employeeId: emp.id }, orderBy: { timestamp: 'desc' } });
            return { ...emp, lat: latest?.lat ?? null, lng: latest?.lng ?? null, lastSeen: latest?.timestamp ?? null, status: latest ? 'active' : 'offline' };
        }));
        sendSuccess(res, positions);
    } catch (error) { sendError(res, 'Failed to fetch live positions'); }
});

// GET /location/history
router.get('/history', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const { employeeId, date } = req.query;
        const start = new Date(date); start.setHours(0, 0, 0, 0);
        const end = new Date(date); end.setHours(23, 59, 59, 999);
        const logs = await prisma.locationLog.findMany({
            where: { employeeId, timestamp: { gte: start, lte: end } },
            orderBy: { timestamp: 'asc' },
        });
        sendSuccess(res, logs);
    } catch (error) { sendError(res, 'Failed to fetch location history'); }
});

// POST /location/update
router.post('/update', async (req, res) => {
    try {
        const { lat, lng, speed } = req.body;
        const log = await prisma.locationLog.create({
            data: { employeeId: req.user.userId, type: 'position', lat, lng, speed, timestamp: new Date() },
        });
        sendSuccess(res, log, 201);
    } catch (error) { sendError(res, 'Failed to log location'); }
});

// GET /location/geologs
router.get('/geologs', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const logs = await prisma.locationLog.findMany({
            where: { employee: { companyId: req.companyId }, type: { in: ['in', 'out'] }, ...(req.query.employeeId && { employeeId: req.query.employeeId }) },
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: { employee: { select: { id: true, name: true } }, geofence: { select: { id: true, name: true } } },
        });
        sendSuccess(res, logs);
    } catch (error) { sendError(res, 'Failed to fetch geo logs'); }
});

// Geofence CRUD
router.get('/geofences', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const geofences = await prisma.geofence.findMany({ where: { companyId: req.companyId } });
        sendSuccess(res, geofences);
    } catch (error) { sendError(res, 'Failed to fetch geofences'); }
});

router.post('/geofences', requireRole('admin'), auditAction('create_geofence'), async (req, res) => {
    try {
        const geofence = await prisma.geofence.create({ data: { ...req.body, companyId: req.companyId } });
        sendSuccess(res, geofence, 201);
    } catch (error) { sendError(res, 'Failed to create geofence'); }
});

router.patch('/geofences/:id', requireRole('admin'), async (req, res) => {
    try {
        const g = await prisma.geofence.update({ where: { id: req.params.id }, data: req.body });
        sendSuccess(res, g);
    } catch (error) { sendError(res, 'Failed to update geofence'); }
});

router.patch('/geofences/:id/toggle', requireRole('admin'), async (req, res) => {
    try {
        const g = await prisma.geofence.findUnique({ where: { id: req.params.id } });
        if (!g) { sendError(res, 'Not found', 404, 'NOT_FOUND'); return; }
        const updated = await prisma.geofence.update({ where: { id: req.params.id }, data: { enabled: !g.enabled } });
        sendSuccess(res, updated);
    } catch (error) { sendError(res, 'Failed to toggle geofence'); }
});

router.delete('/geofences/:id', requireRole('admin'), auditAction('delete_geofence'), async (req, res) => {
    try {
        await prisma.geofence.delete({ where: { id: req.params.id } });
        sendSuccess(res, { message: 'Geofence deleted' });
    } catch (error) { sendError(res, 'Failed to delete geofence'); }
});

module.exports = router;
