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
        const [totalEmployees, activeToday, screenshotsToday, avgProductivityRes] = await Promise.all([
            prisma.user.count({ where: { companyId: req.companyId, status: { not: 'terminated' } } }),
            prisma.attendanceRecord.count({ where: { employee: { companyId: req.companyId }, date: today, status: { not: 'absent' } } }),
            prisma.screenshot.count({ where: { employee: { companyId: req.companyId }, timestamp: { gte: today }, isDeleted: false } }),
            prisma.activityLog.aggregate({ where: { employee: { companyId: req.companyId }, date: today }, _avg: { productivityScore: true } }),
        ]);

        // Get Department Productivity
        const departments = await prisma.department.findMany({
            where: { companyId: req.companyId },
            include: { employees: { where: { status: 'active' }, select: { id: true } } }
        });

        const deptProductivity = await Promise.all(departments.map(async (dept) => {
            const avg = await prisma.activityLog.aggregate({
                where: { employeeId: { in: dept.employees.map(e => e.id) }, date: today },
                _avg: { productivityScore: true }
            });
            return {
                department: dept.name,
                avgProductivity: Math.round(avg._avg.productivityScore ?? 0),
                headcount: dept.employees.length
            };
        }));

        // Get Weekly Trend (Last 7 days)
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const avgTrend = await prisma.activityLog.aggregate({
                where: { employee: { companyId: req.companyId }, date: d },
                _avg: { productivityScore: true }
            });
            trend.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                productivity: Math.round(avgTrend._avg.productivityScore ?? 0)
            });
        }

        sendSuccess(res, {
            totalEmployees,
            activeToday,
            screenshotsToday,
            avgProductivity: Math.round(avgProductivityRes._avg.productivityScore ?? 0),
            deptProductivity,
            trend
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

// GET /reports/manager-overview
router.get('/manager-overview', requireRole('manager'), async (req, res) => {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const teamIds = (await prisma.user.findMany({
            where: { managerId: req.user.userId, status: { not: 'terminated' } },
            select: { id: true }
        })).map(u => u.id);

        const [totalTeam, activeToday, avgProductivityRes] = await Promise.all([
            prisma.user.count({ where: { managerId: req.user.userId, status: { not: 'terminated' } } }),
            prisma.attendanceRecord.count({ where: { employeeId: { in: teamIds }, date: today, status: { not: 'absent' } } }),
            prisma.activityLog.aggregate({ where: { employeeId: { in: teamIds }, date: today }, _avg: { productivityScore: true } }),
        ]);

        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const avgTrend = await prisma.activityLog.aggregate({
                where: { employeeId: { in: teamIds }, date: d },
                _avg: { productivityScore: true }
            });
            trend.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                productivity: Math.round(avgTrend._avg.productivityScore ?? 0)
            });
        }

        sendSuccess(res, {
            totalTeam,
            activeToday,
            avgProductivity: Math.round(avgProductivityRes._avg.productivityScore ?? 0),
            trend
        });
    } catch (error) { sendError(res, 'Failed to fetch manager overview'); }
});

// GET /reports/employee-overview
router.get('/employee-overview', requireRole('employee', 'manager'), async (req, res) => {
    try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const userId = req.user.userId;

        const [activityToday, timeEntriesToday, taskStats] = await Promise.all([
            prisma.activityLog.findUnique({ where: { employeeId_date: { employeeId: userId, date: today } } }),
            prisma.timeEntry.findMany({ where: { employeeId: userId, date: today } }),
            prisma.taskAssignee.count({ where: { userId, task: { status: { not: 'done' } } } }),
        ]);

        const totalSeconds = timeEntriesToday.reduce((acc, curr) => acc + curr.durationSeconds, 0);
        const hours = (totalSeconds / 3600).toFixed(1);

        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const log = await prisma.activityLog.findUnique({ where: { employeeId_date: { employeeId: userId, date: d } } });
            trend.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                productivity: log?.productivityScore ?? 0
            });
        }

        sendSuccess(res, {
            productivity: activityToday?.productivityScore ?? 0,
            hoursToday: hours,
            activeTasks: taskStats,
            trend
        });
    } catch (error) { sendError(res, 'Failed to fetch employee overview'); }
});

module.exports = router;
