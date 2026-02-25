const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { sendSuccess, sendError } = require('../../utils/response');

const router = Router();
router.use(authenticate);

// GET /settings
router.get('/', requireRole('admin'), async (req, res) => {
    try {
        const settings = await prisma.companySettings.findUnique({ where: { companyId: req.companyId } });
        sendSuccess(res, settings);
    } catch (error) { sendError(res, 'Failed to fetch settings'); }
});

// PUT /settings (full update)
router.put('/', requireRole('admin'), async (req, res) => {
    try {
        const settings = await prisma.companySettings.upsert({
            where: { companyId: req.companyId },
            create: { companyId: req.companyId, ...req.body },
            update: req.body,
        });
        sendSuccess(res, settings);
    } catch (error) { sendError(res, 'Failed to update settings'); }
});

// PATCH /settings/monitoring
router.patch('/monitoring', requireRole('admin'), async (req, res) => {
    try {
        const settings = await prisma.companySettings.update({
            where: { companyId: req.companyId },
            data: { screenshotInterval: req.body.screenshotInterval, idleThreshold: req.body.idleThreshold, enableBlur: req.body.enableBlur, geoFenceRange: req.body.geoFenceRange },
        });
        sendSuccess(res, settings);
    } catch (error) { sendError(res, 'Failed to update monitoring settings'); }
});

// PATCH /settings/privacy
router.patch('/privacy', requireRole('admin'), async (req, res) => {
    try {
        const settings = await prisma.companySettings.update({ where: { companyId: req.companyId }, data: { dataRetentionDays: req.body.dataRetentionDays } });
        sendSuccess(res, settings);
    } catch (error) { sendError(res, 'Failed to update privacy settings'); }
});

// PATCH /settings/notifications
router.patch('/notifications', requireRole('admin'), async (req, res) => {
    try {
        const settings = await prisma.companySettings.update({
            where: { companyId: req.companyId },
            data: { emailNotifications: req.body.email, pushNotifications: req.body.push, smsNotifications: req.body.sms, weeklyDigest: req.body.weeklyDigest },
        });
        sendSuccess(res, settings);
    } catch (error) { sendError(res, 'Failed to update notification settings'); }
});

// PATCH /settings/appearance (any user can update their own theme)
router.patch('/appearance', async (req, res) => {
    try {
        const settings = await prisma.companySettings.update({ where: { companyId: req.companyId }, data: { theme: req.body.theme, fontSize: req.body.fontSize } });
        sendSuccess(res, settings);
    } catch (error) { sendError(res, 'Failed to update appearance'); }
});

// GET /settings/company
router.get('/company', requireRole('admin'), async (req, res) => {
    try {
        const company = await prisma.company.findUnique({ where: { id: req.companyId }, select: { id: true, name: true, address: true, country: true, logoUrl: true, plan: true, seatLimit: true, billingDate: true } });
        sendSuccess(res, company);
    } catch (error) { sendError(res, 'Failed to fetch company profile'); }
});

// PATCH /settings/company
router.patch('/company', requireRole('admin'), async (req, res) => {
    try {
        const company = await prisma.company.update({ where: { id: req.companyId }, data: { name: req.body.name, address: req.body.address, country: req.body.country } });
        sendSuccess(res, company);
    } catch (error) { sendError(res, 'Failed to update company profile'); }
});

// GET /settings/billing
router.get('/billing', requireRole('admin'), async (req, res) => {
    try {
        const company = await prisma.company.findUnique({ where: { id: req.companyId }, select: { plan: true, seatLimit: true, billingDate: true } });
        const usedSeats = await prisma.user.count({ where: { companyId: req.companyId, status: { not: 'terminated' } } });
        sendSuccess(res, { ...company, usedSeats });
    } catch (error) { sendError(res, 'Failed to fetch billing info'); }
});

module.exports = router;
