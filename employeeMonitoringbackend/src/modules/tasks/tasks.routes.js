const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { auditAction } = require('../../middleware/audit');
const { sendSuccess, sendError } = require('../../utils/response');
const { getPagination, buildMeta } = require('../../utils/pagination');

const router = Router();
router.use(authenticate);

// Helper
async function updateProjectProgress(projectId) {
    const [total, done] = await Promise.all([
        prisma.task.count({ where: { projectId } }),
        prisma.task.count({ where: { projectId, status: 'done' } }),
    ]);
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    await prisma.project.update({ where: { id: projectId }, data: { progress } });
}

// ── PROJECTS ──────────────────────────────────────────────────

// GET /tasks/projects
router.get('/projects', async (req, res) => {
    try {
        const { page, pageSize, skip, take } = getPagination({ page: Number(req.query.page) });
        const where = { companyId: req.companyId, ...(req.query.status && { status: req.query.status }) };
        const [projects, total] = await Promise.all([
            prisma.project.findMany({ where, skip, take, include: { milestones: true, members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } }, _count: { select: { tasks: true } } }, orderBy: { createdAt: 'desc' } }),
            prisma.project.count({ where }),
        ]);
        sendSuccess(res, projects, 200, buildMeta(page, pageSize, total));
    } catch (error) { sendError(res, 'Failed to fetch projects'); }
});

router.get('/projects/:id', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { milestones: true, members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } }, tasks: { include: { assignees: { include: { user: { select: { id: true, name: true } } } } } } } });
        if (!project) { sendError(res, 'Project not found', 404, 'NOT_FOUND'); return; }
        sendSuccess(res, project);
    } catch (error) { sendError(res, 'Failed to fetch project'); }
});

router.post('/projects', requireRole('admin', 'manager'), auditAction('create_project'), async (req, res) => {
    try {
        const { name, description, status, startDate, endDate, budget } = req.body;
        const project = await prisma.project.create({ data: { name, description, status, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, budget, companyId: req.companyId } });
        sendSuccess(res, project, 201);
    } catch (error) { sendError(res, 'Failed to create project'); }
});

router.patch('/projects/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const project = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
        sendSuccess(res, project);
    } catch (error) { sendError(res, 'Failed to update project'); }
});

router.delete('/projects/:id', requireRole('admin'), auditAction('delete_project'), async (req, res) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        sendSuccess(res, { message: 'Project deleted' });
    } catch (error) { sendError(res, 'Failed to delete project'); }
});

// Milestones
router.post('/milestones', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const m = await prisma.milestone.create({ data: { ...req.body, dueDate: new Date(req.body.dueDate) } });
        sendSuccess(res, m, 201);
    } catch (error) { sendError(res, 'Failed to create milestone'); }
});

router.patch('/milestones/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
        const m = await prisma.milestone.update({ where: { id: req.params.id }, data: { completed: req.body.completed, completedAt: req.body.completed ? new Date() : null } });
        sendSuccess(res, m);
    } catch (error) { sendError(res, 'Failed to update milestone'); }
});

// ── TASKS ─────────────────────────────────────────────────────

router.get('/', async (req, res) => {
    try {
        const { projectId, status, assigneeId, priority } = req.query;
        const tasks = await prisma.task.findMany({
            where: {
                project: { companyId: req.companyId },
                ...(projectId && { projectId }),
                ...(status && { status }),
                ...(priority && { priority }),
                ...(assigneeId && { assignees: { some: { userId: assigneeId } } }),
            },
            include: { assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } }, _count: { select: { comments: true } } },
            orderBy: [{ status: 'asc' }, { position: 'asc' }],
        });
        sendSuccess(res, tasks);
    } catch (error) { sendError(res, 'Failed to fetch tasks'); }
});

router.post('/', requireRole('admin', 'manager'), auditAction('create_task'), async (req, res) => {
    try {
        const { assigneeIds, dueDate, ...rest } = req.body;
        const task = await prisma.task.create({
            data: { ...rest, ...(dueDate && { dueDate: new Date(dueDate) }), assignees: assigneeIds?.length ? { create: assigneeIds.map((id) => ({ userId: id })) } : undefined },
            include: { assignees: true },
        });
        // Update project progress
        await updateProjectProgress(rest.projectId);
        sendSuccess(res, task, 201);
    } catch (error) { sendError(res, 'Failed to create task'); }
});

router.patch('/:id', async (req, res) => {
    try {
        const { assigneeIds, dueDate, ...rest } = req.body;
        const task = await prisma.task.update({ where: { id: req.params.id }, data: { ...rest, ...(dueDate && { dueDate: new Date(dueDate) }) } });
        await updateProjectProgress(task.projectId);
        sendSuccess(res, task);
    } catch (error) { sendError(res, 'Failed to update task'); }
});

router.patch('/:id/position', async (req, res) => {
    try {
        const task = await prisma.task.update({ where: { id: req.params.id }, data: { status: req.body.status, position: req.body.position } });
        await updateProjectProgress(task.projectId);
        sendSuccess(res, task);
    } catch (error) { sendError(res, 'Failed to update task position'); }
});

router.delete('/:id', requireRole('admin', 'manager'), auditAction('delete_task'), async (req, res) => {
    try {
        const task = await prisma.task.delete({ where: { id: req.params.id } });
        await updateProjectProgress(task.projectId);
        sendSuccess(res, { message: 'Task deleted' });
    } catch (error) { sendError(res, 'Failed to delete task'); }
});

// Comments
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await prisma.taskComment.findMany({ where: { taskId: req.params.id }, include: { author: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } });
        sendSuccess(res, comments);
    } catch (error) { sendError(res, 'Failed to fetch comments'); }
});

router.post('/:id/comments', async (req, res) => {
    try {
        const comment = await prisma.taskComment.create({ data: { taskId: req.params.id, authorId: req.user.userId, content: req.body.content }, include: { author: { select: { id: true, name: true } } } });
        sendSuccess(res, comment, 201);
    } catch (error) { sendError(res, 'Failed to add comment'); }
});

module.exports = router;
