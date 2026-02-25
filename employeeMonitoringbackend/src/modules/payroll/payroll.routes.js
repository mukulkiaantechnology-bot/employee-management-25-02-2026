const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { auditAction } = require('../../middleware/audit');
const { sendSuccess, sendError } = require('../../utils/response');
const { getPagination, buildMeta } = require('../../utils/pagination');
const { calculatePayroll } = require('../../utils/payroll');

const router = Router();
router.use(authenticate);

// GET /payroll (admin)
router.get('/', requireRole('admin'), async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page) });
        const { month, year, status } = req.query;
        const where = {
            employee: { companyId: req.companyId },
            ...(month && { month: Number(month) }),
            ...(year && { year: Number(year) }),
            ...(status && { status }),
        };
        const [payrolls, total] = await Promise.all([
            prisma.payroll.findMany({ where, skip, take, include: { employee: { select: { id: true, name: true, employeeId: true, department: true } } }, orderBy: { createdAt: 'desc' } }),
            prisma.payroll.count({ where }),
        ]);
        sendSuccess(res, payrolls, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch payrolls'); }
});

// GET /payroll/my (employee)
router.get('/my', async (req, res) => {
    try {
        const payrolls = await prisma.payroll.findMany({ where: { employeeId: req.user.userId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] });
        sendSuccess(res, payrolls);
    } catch (error) { sendError(res, 'Failed to fetch payslips'); }
});

// GET /payroll/team (manager)
router.get('/team', requireRole('manager'), async (req, res) => {
    try {
        const { month, year } = req.query;
        const payrolls = await prisma.payroll.findMany({
            where: {
                employee: { managerId: req.user.userId },
                ...(month && { month: Number(month) }),
                ...(year && { year: Number(year) }),
            },
            select: { id: true, employeeId: true, month: true, year: true, status: true, baseSalary: true, employee: { select: { id: true, name: true } } },
        });
        sendSuccess(res, payrolls);
    } catch (error) { sendError(res, 'Failed to fetch team payroll'); }
});

// POST /payroll/generate (bulk generate)
router.post('/generate', requireRole('admin'), auditAction('generate_payroll'), async (req, res) => {
    try {
        const { month, year } = req.body;
        const settings = await prisma.companySettings.findUnique({ where: { companyId: req.companyId } });
        const taxRate = settings?.taxRate ?? 0.2;

        const employees = await prisma.user.findMany({ where: { companyId: req.companyId, status: 'active', NOT: { role: 'admin' } } });

        const results = await Promise.all(employees.map(async (emp) => {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0);
            const entries = await prisma.timeEntry.findMany({ where: { employeeId: emp.id, date: { gte: start, lte: end } } });
            const totalSeconds = entries.reduce((s, e) => s + e.durationSeconds, 0);
            const hoursWorked = totalSeconds / 3600;
            const standardHours = 8 * 22; // 22 working days
            const overtimeHours = Math.max(0, hoursWorked - standardHours);

            const calc = calculatePayroll({ baseRate: emp.baseRate, hoursWorked, overtimeHours, taxRate });

            return prisma.payroll.upsert({
                where: { employeeId_month_year: { employeeId: emp.id, month, year } },
                create: { employeeId: emp.id, month, year, hoursWorked, baseRate: emp.baseRate, overtimeHours, ...calc, taxRate },
                update: { hoursWorked, baseRate: emp.baseRate, overtimeHours, ...calc, taxRate },
            });
        }));

        sendSuccess(res, { generated: results.length, payrolls: results });
    } catch (error) { sendError(res, 'Payroll generation failed'); }
});

// GET /payroll/:id
router.get('/:id', async (req, res) => {
    try {
        const payroll = await prisma.payroll.findUnique({ where: { id: req.params.id }, include: { employee: { select: { id: true, name: true, employeeId: true, position: true } } } });
        if (!payroll) { sendError(res, 'Not found', 404, 'NOT_FOUND'); return; }
        if (req.user?.role === 'employee' && payroll.employeeId !== req.user.userId) { sendError(res, 'Forbidden', 403, 'FORBIDDEN'); return; }
        sendSuccess(res, payroll);
    } catch (error) { sendError(res, 'Failed to fetch payroll'); }
});

// PATCH /payroll/:id/status
router.patch('/:id/status', requireRole('admin'), auditAction('update_payroll_status'), async (req, res) => {
    try {
        const { status } = req.body;
        const payroll = await prisma.payroll.update({
            where: { id: req.params.id },
            data: { status, ...(status === 'paid' && { paidAt: new Date() }) },
        });
        sendSuccess(res, payroll);
    } catch (error) { sendError(res, 'Failed to update payroll status'); }
});

module.exports = router;
