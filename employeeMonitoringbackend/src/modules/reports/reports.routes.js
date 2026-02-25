const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { sendSuccess, sendError } = require('../../utils/response');

const router = Router();
router.use(authenticate);

// GET /reports/overview (admin dashboard stats)
router.get('/overview', requireRole('admin'), async (req, res) => {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const [totalEmployees, activeToday, screenshotsToday, avgProductivity] = await Promise.all([
            prisma.user.count({ where: { companyId: req.companyId, status: { not: 'terminated' } } }),
            prisma.attendanceRecord.count({ where: { employee: { companyId: req.companyId }, date: today, status: { not: 'absent' } } }),
            prisma.screenshot.count({ where: { employee: { companyId: req.companyId }, timestamp: { gte: today }, isDeleted: false } }),
            prisma.activityLog.aggregate({ where: { employee: { companyId: req.companyId }, date: today }, _avg: { productivityScore: true } }),
        ]);
        sendSuccess(res, {
            totalEmployees,
            activeToday,
            screenshotsToday,
            avgProductivity: Math.round(avgProductivity._avg.productivityScore ?? 0),
        });
    } catch (error) { sendError(res, 'Failed to fetch overview'); }
});

// GET /reports/department-productivity
router.get('/department-productivity', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        date.setHours(0, 0, 0, 0);
        const departments = await prisma.department.findMany({
            where: { companyId: req.companyId },
            include: {
                employees: {
                    select: { id: true, name: true },
                    where: { status: 'active' },
                },
            },
        });
        const results = await Promise.all(departments.map(async (dept) => {
            const avgAct = await prisma.activityLog.aggregate({
                where: { employeeId: { in: dept.employees.map(e => e.id) }, date },
                _avg: { productivityScore: true },
            });
            return { department: dept.name, headcount: dept.employees.length, avgProductivity: Math.round(avgAct._avg.productivityScore ?? 0) };
        }));
        sendSuccess(res, results);
    } catch (error) { sendError(res, 'Failed to fetch department productivity'); }
});

module.exports = router;
