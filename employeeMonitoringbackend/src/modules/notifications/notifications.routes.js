const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { sendSuccess, sendError } = require('../../utils/response');
const { getPagination, buildMeta } = require('../../utils/pagination');

const router = Router();
router.use(authenticate);

// GET /notifications
router.get('/', async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page) });
        const { filter, search } = req.query;
        const where = {
            recipientId: req.user.userId,
            deletedAt: null,
            ...(filter === 'unread' && { unread: true }),
            ...(filter === 'alerts' && { type: 'alert' }),
            ...(filter === 'success' && { type: 'success' }),
            ...(search && { OR: [{ title: { contains: search } }, { description: { contains: search } }] }),
        };
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({ where, skip, take, orderBy: { date: 'desc' } }),
            prisma.notification.count({ where }),
        ]);
        sendSuccess(res, notifications, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch notifications'); }
});

// GET /notifications/unread-count
router.get('/unread-count', async (req, res) => {
    try {
        const count = await prisma.notification.count({ where: { recipientId: req.user.userId, unread: true, deletedAt: null } });
        sendSuccess(res, { count });
    } catch (error) { sendError(res, 'Failed to fetch unread count'); }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req, res) => {
    try {
        const n = await prisma.notification.update({ where: { id: req.params.id }, data: { unread: false } });
        sendSuccess(res, n);
    } catch (error) { sendError(res, 'Failed to mark as read'); }
});

// PATCH /notifications/read-all
router.patch('/read-all', async (req, res) => {
    try {
        await prisma.notification.updateMany({ where: { recipientId: req.user.userId, unread: true }, data: { unread: false } });
        sendSuccess(res, { message: 'All notifications marked as read' });
    } catch (error) { sendError(res, 'Failed to mark all as read'); }
});

// DELETE /notifications/:id
router.delete('/:id', async (req, res) => {
    try {
        await prisma.notification.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
        sendSuccess(res, { message: 'Notification deleted' });
    } catch (error) { sendError(res, 'Failed to delete notification'); }
});

// DELETE /notifications/all
router.delete('/all', async (req, res) => {
    try {
        await prisma.notification.updateMany({ where: { recipientId: req.user.userId }, data: { deletedAt: new Date() } });
        sendSuccess(res, { message: 'All notifications deleted' });
    } catch (error) { sendError(res, 'Failed to delete notifications'); }
});

module.exports = router;
