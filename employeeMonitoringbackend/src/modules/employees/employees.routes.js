const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { auditAction } = require('../../middleware/audit');
const { sendSuccess, sendError } = require('../../utils/response');
const { getPagination, buildMeta } = require('../../utils/pagination');
const { generateEmployeeId } = require('../../utils/employeeId');
const { hashPassword } = require('../../utils/bcrypt');

const router = Router();
router.use(authenticate);

// GET /employees
router.get('/', async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page), pageSize: Number(req.query.pageSize) });
        const { status, department, search } = req.query;

        const where = {
            companyId: req.companyId,
            role: { not: 'admin' },
            ...(status && { status }),
            ...(department && { department: { name: department } }),
            ...(search && { OR: [{ name: { contains: search } }, { email: { contains: search } }, { employeeId: { contains: search } }] }),
            // Managers see only their dept
            ...(req.user?.role === 'manager' && { managerId: req.user.userId }),
        };

        const [employees, total] = await Promise.all([
            prisma.user.findMany({
                where, skip, take,
                select: { id: true, employeeId: true, name: true, email: true, phone: true, role: true, status: true, position: true, avatarUrl: true, joinDate: true, baseRate: true, department: true, screenshotsBlurred: true, locationTracking: true, activityLogging: true, screenshotInterval: true },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        sendSuccess(res, employees, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch employees'); }
});

// GET /employees/:id
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: req.params.id, companyId: req.companyId },
            select: { id: true, employeeId: true, name: true, email: true, phone: true, role: true, status: true, position: true, avatarUrl: true, joinDate: true, baseRate: true, department: true, manager: { select: { id: true, name: true } }, screenshotsBlurred: true, locationTracking: true, activityLogging: true, screenshotInterval: true, consentGiven: true },
        });
        if (!user) { sendError(res, 'Employee not found', 404, 'NOT_FOUND'); return; }
        sendSuccess(res, user);
    } catch (error) { sendError(res, 'Failed to fetch employee'); }
});

// POST /employees
router.post('/', requireRole('admin'), auditAction('create_employee'), async (req, res) => {
    try {
        const { name, email, phone, position, departmentId, managerId, role = 'employee', baseRate = 0, password = 'Welcome@123' } = req.body;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) { sendError(res, 'Email already exists', 409, 'CONFLICT'); return; }
        const passwordHash = await hashPassword(password);
        const employeeId = await generateEmployeeId(req.companyId);
        const user = await prisma.user.create({
            data: { employeeId, name, email, phone, position, departmentId, managerId, role, baseRate, passwordHash, companyId: req.companyId },
            select: { id: true, employeeId: true, name: true, email: true, role: true, department: true },
        });
        sendSuccess(res, user, 201);
    } catch (error) { sendError(res, 'Failed to create employee'); }
});

// PATCH /employees/:id
router.patch('/:id', requireRole('admin'), auditAction('update_employee'), async (req, res) => {
    try {
        const { name, phone, position, departmentId, managerId, status, baseRate } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { name, phone, position, departmentId, managerId, status, baseRate },
            select: { id: true, name: true, email: true, status: true },
        });
        sendSuccess(res, user);
    } catch (error) { sendError(res, 'Failed to update employee'); }
});

// PATCH /employees/:id/privacy
router.patch('/:id/privacy', requireRole('admin'), auditAction('update_privacy'), async (req, res) => {
    try {
        const { screenshotsBlurred, locationTracking, activityLogging, screenshotInterval } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { screenshotsBlurred, locationTracking, activityLogging, screenshotInterval },
        });
        sendSuccess(res, user);
    } catch (error) { sendError(res, 'Failed to update privacy settings'); }
});

// DELETE /employees/:id
router.delete('/:id', requireRole('admin'), auditAction('delete_employee'), async (req, res) => {
    try {
        await prisma.user.update({ where: { id: req.params.id }, data: { status: 'terminated' } });
        sendSuccess(res, { message: 'Employee deactivated' });
    } catch (error) { sendError(res, 'Failed to delete employee'); }
});

// POST /employees/bulk-action
router.post('/bulk-action', requireRole('admin'), async (req, res) => {
    try {
        const { action, ids } = req.body;
        const statusMap = { activate: 'active', deactivate: 'on_leave', delete: 'terminated' };
        await prisma.user.updateMany({ where: { id: { in: ids }, companyId: req.companyId }, data: { status: statusMap[action] } });
        sendSuccess(res, { message: `Bulk ${action} applied to ${ids.length} employees` });
    } catch (error) { sendError(res, 'Bulk action failed'); }
});

// GET /employees/:id/data-summary
router.get('/:id/data-summary', async (req, res) => {
    try {
        const targetId = req.params.id;
        if (req.user?.role === 'employee' && req.user.userId !== targetId) { sendError(res, 'Forbidden', 403, 'FORBIDDEN'); return; }
        const [screenshotCount, timeEntryCount, locationLogs] = await Promise.all([
            prisma.screenshot.count({ where: { employeeId: targetId, isDeleted: false } }),
            prisma.timeEntry.count({ where: { employeeId: targetId } }),
            prisma.locationLog.count({ where: { employeeId: targetId } }),
        ]);
        sendSuccess(res, { screenshotCount, timeEntryCount, locationLogs, message: 'Your data usage summary' });
    } catch (error) { sendError(res, 'Failed to fetch data summary'); }
});

module.exports = router;
