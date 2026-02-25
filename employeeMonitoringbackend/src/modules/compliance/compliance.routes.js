const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { sendSuccess, sendError } = require('../../utils/response');
const { getPagination, buildMeta } = require('../../utils/pagination');

const router = Router();
router.use(authenticate);

// GET /compliance/audit-logs
router.get('/audit-logs', requireRole('admin'), async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page) });
        const { search, status } = req.query;
        const where = {
            companyId: req.companyId,
            ...(status && { status }),
            ...(search && { OR: [{ action: { contains: search } }, { ip: { contains: search } }] }),
        };
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({ where, skip, take, orderBy: { timestamp: 'desc' }, include: { user: { select: { id: true, name: true, email: true } } } }),
            prisma.auditLog.count({ where }),
        ]);
        sendSuccess(res, logs, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch audit logs'); }
});

// GET /compliance/audit-logs/export (CSV)
router.get('/audit-logs/export', requireRole('admin'), async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { companyId: req.companyId },
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { name: true, email: true } } },
        });
        const csv = ['ID,Action,User,IP,Status,Timestamp',
            ...logs.map(l => `${l.id},${l.action},${l.user?.name ?? 'System'},${l.ip ?? ''},${l.status},${l.timestamp.toISOString()}`),
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        res.send(csv);
    } catch (error) { sendError(res, 'Export failed'); }
});

// GET /compliance/consent
router.get('/consent', requireRole('admin'), async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page) });
        const [consents, total] = await Promise.all([
            prisma.complianceConsent.findMany({ where: { companyId: req.companyId }, skip, take, orderBy: { sentAt: 'desc' } }),
            prisma.complianceConsent.count({ where: { companyId: req.companyId } }),
        ]);
        sendSuccess(res, consents, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch consent records'); }
});

// POST /compliance/consent/broadcast
router.post('/consent/broadcast', requireRole('admin'), async (req, res) => {
    try {
        const { policyVersion } = req.body;
        const employees = await prisma.user.findMany({ where: { companyId: req.companyId, status: 'active' } });
        const consents = await prisma.complianceConsent.createMany({
            data: employees.map(emp => ({ companyId: req.companyId, employeeId: emp.id, policyVersion })),
            skipDuplicates: true,
        });
        sendSuccess(res, { sent: consents.count, message: `Consent form sent to ${consents.count} employees` });
    } catch (error) { sendError(res, 'Failed to broadcast consent'); }
});

// PATCH /compliance/consent/:employeeId (employee accepts)
router.patch('/consent/:employeeId', async (req, res) => {
    try {
        if (req.user?.role === 'employee' && req.user.userId !== req.params.employeeId) {
            sendError(res, 'Forbidden', 403, 'FORBIDDEN'); return;
        }
        await prisma.complianceConsent.updateMany({
            where: { employeeId: req.params.employeeId },
            data: { consentGiven: req.body.accepted, givenAt: req.body.accepted ? new Date() : null, ipAddress: req.ip },
        });
        await prisma.user.update({ where: { id: req.params.employeeId }, data: { consentGiven: req.body.accepted, consentGivenAt: req.body.accepted ? new Date() : null } });
        sendSuccess(res, { message: 'Consent updated' });
    } catch (error) { sendError(res, 'Failed to update consent'); }
});

// GET /compliance/status
router.get('/status', requireRole('admin'), async (req, res) => {
    try {
        const settings = await prisma.companySettings.findUnique({ where: { companyId: req.companyId } });
        const totalEmployees = await prisma.user.count({ where: { companyId: req.companyId, status: 'active' } });
        const consentGiven = await prisma.user.count({ where: { companyId: req.companyId, consentGiven: true } });
        sendSuccess(res, {
            encryptionEnabled: settings?.encryptionEnabled ?? true,
            gdprRegionLock: settings?.gdprRegionLock ?? true,
            twoFactorRequired: settings?.twoFactorRequired ?? false,
            dataRetentionDays: settings?.dataRetentionDays ?? 365,
            consentStats: { total: totalEmployees, given: consentGiven, pending: totalEmployees - consentGiven },
        });
    } catch (error) { sendError(res, 'Failed to fetch compliance status'); }
});

module.exports = router;
