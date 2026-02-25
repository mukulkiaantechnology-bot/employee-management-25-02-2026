const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { auditAction } = require('../../middleware/audit');
const { sendSuccess, sendError } = require('../../utils/response');
const { getPagination, buildMeta } = require('../../utils/pagination');

const router = Router();
router.use(authenticate);

// GET /attendance/calendar
router.get('/calendar', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const { month, year, employeeId } = req.query;
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);
        const records = await prisma.attendanceRecord.findMany({
            where: {
                employee: { companyId: req.companyId },
                date: { gte: startDate, lte: endDate },
                ...(employeeId && { employeeId }),
            },
            include: { employee: { select: { id: true, name: true, employeeId: true } } },
        });
        sendSuccess(res, records);
    } catch (error) { sendError(res, 'Failed to fetch calendar'); }
});

// GET /attendance/records
router.get('/records', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page) });
        const { date, employeeId, status } = req.query;
        const where = {
            employee: { companyId: req.companyId },
            ...(date && { date: new Date(date) }),
            ...(employeeId && { employeeId }),
            ...(status && { status }),
        };
        const [records, total] = await Promise.all([
            prisma.attendanceRecord.findMany({ where, skip, take, include: { employee: { select: { id: true, name: true } } }, orderBy: { date: 'desc' } }),
            prisma.attendanceRecord.count({ where }),
        ]);
        sendSuccess(res, records, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch attendance records'); }
});

// POST /attendance/qr-checkin
router.post('/qr-checkin', requireRole('employee'), auditAction('qr_checkin'), async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const existing = await prisma.attendanceRecord.findFirst({ where: { employeeId: req.user.userId, date: today } });
        if (existing?.checkIn && !existing.checkOut) {
            const record = await prisma.attendanceRecord.update({ where: { id: existing.id }, data: { checkOut: new Date(), lat, lng } });
            sendSuccess(res, { record, action: 'check-out' });
        } else {
            const record = await prisma.attendanceRecord.upsert({
                where: { employeeId_date: { employeeId: req.user.userId, date: today } },
                create: { employeeId: req.user.userId, date: today, checkIn: new Date(), status: 'present', method: 'qr', lat, lng },
                update: { checkIn: new Date(), status: 'present', method: 'qr', lat, lng },
            });
            sendSuccess(res, { record, action: 'check-in' });
        }
    } catch (error) { sendError(res, 'QR check-in failed'); }
});

// POST /attendance/manual
router.post('/manual', requireRole('admin', 'manager'), auditAction('manual_attendance'), async (req, res) => {
    try {
        const { employeeId, date, checkIn, checkOut, status, notes } = req.body;
        const record = await prisma.attendanceRecord.upsert({
            where: { employeeId_date: { employeeId, date: new Date(date) } },
            create: { employeeId, date: new Date(date), checkIn: checkIn ? new Date(checkIn) : null, checkOut: checkOut ? new Date(checkOut) : null, status, method: 'manual', notes },
            update: { checkIn: checkIn ? new Date(checkIn) : null, checkOut: checkOut ? new Date(checkOut) : null, status, notes },
        });
        sendSuccess(res, record);
    } catch (error) { sendError(res, 'Manual attendance failed'); }
});

// Leaves sub-routes
// GET /attendance/leaves
router.get('/leaves', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const { employeeId, status, year } = req.query;
        const leaves = await prisma.leave.findMany({
            where: {
                employee: { companyId: req.companyId },
                ...(employeeId && { employeeId }),
                ...(status && { status }),
                ...(year && { startDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } }),
            },
            include: { employee: { select: { id: true, name: true } }, approver: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        sendSuccess(res, leaves);
    } catch (error) { sendError(res, 'Failed to fetch leaves'); }
});

router.get('/leaves/my', async (req, res) => {
    try {
        const leaves = await prisma.leave.findMany({ where: { employeeId: req.user.userId }, orderBy: { createdAt: 'desc' } });
        sendSuccess(res, leaves);
    } catch (error) { sendError(res, 'Failed to fetch leaves'); }
});

router.post('/leaves', requireRole('employee', 'manager'), async (req, res) => {
    try {
        const leave = await prisma.leave.create({ data: { ...req.body, employeeId: req.user.userId, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) } });
        sendSuccess(res, leave, 201);
    } catch (error) { sendError(res, 'Failed to submit leave'); }
});

router.patch('/leaves/:id/status', requireRole('admin', 'manager'), auditAction('approve_leave'), async (req, res) => {
    try {
        const { status, rejectionNote } = req.body;
        const leave = await prisma.leave.update({
            where: { id: req.params.id },
            data: { status, rejectionNote, approverId: req.user.userId, ...(status === 'approved' && { approvedAt: new Date() }) },
        });
        sendSuccess(res, leave);
    } catch (error) { sendError(res, 'Failed to update leave status'); }
});

// Holidays
router.get('/holidays', async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();
        const holidays = await prisma.holiday.findMany({ where: { companyId: req.companyId, year }, orderBy: { date: 'asc' } });
        sendSuccess(res, holidays);
    } catch (error) { sendError(res, 'Failed to fetch holidays'); }
});

router.post('/holidays', requireRole('admin'), auditAction('create_holiday'), async (req, res) => {
    try {
        const { name, date, type, description } = req.body;
        const holiday = await prisma.holiday.create({ data: { name, date: new Date(date), type, description, year: new Date(date).getFullYear(), companyId: req.companyId } });
        sendSuccess(res, holiday, 201);
    } catch (error) { sendError(res, 'Failed to create holiday'); }
});

router.delete('/holidays/:id', requireRole('admin'), async (req, res) => {
    try {
        await prisma.holiday.delete({ where: { id: req.params.id } });
        sendSuccess(res, { message: 'Holiday deleted' });
    } catch (error) { sendError(res, 'Failed to delete holiday'); }
});

// Shifts
router.get('/shifts', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const shifts = await prisma.shift.findMany({
            where: { employee: { companyId: req.companyId }, ...(req.query.employeeId && { employeeId: req.query.employeeId }) },
            include: { employee: { select: { id: true, name: true } } },
        });
        sendSuccess(res, shifts);
    } catch (error) { sendError(res, 'Failed to fetch shifts'); }
});

router.post('/shifts', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const shift = await prisma.shift.create({ data: req.body });
        sendSuccess(res, shift, 201);
    } catch (error) { sendError(res, 'Failed to create shift'); }
});

router.patch('/shifts/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const shift = await prisma.shift.update({ where: { id: req.params.id }, data: req.body });
        sendSuccess(res, shift);
    } catch (error) { sendError(res, 'Failed to update shift'); }
});

router.delete('/shifts/:id', requireRole('admin'), async (req, res) => {
    try {
        await prisma.shift.delete({ where: { id: req.params.id } });
        sendSuccess(res, { message: 'Shift deleted' });
    } catch (error) { sendError(res, 'Failed to delete shift'); }
});

module.exports = router;
