const { Router } = require('express');
const { prisma } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { auditAction } = require('../../middleware/audit');
const { sendSuccess, sendError } = require('../../utils/response');

const router = Router();
router.use(authenticate);

// GET /departments
router.get('/', async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            where: { companyId: req.companyId },
            include: { _count: { select: { employees: true } } },
        });
        sendSuccess(res, departments);
    } catch (error) { sendError(res, 'Failed to fetch departments'); }
});

// POST /departments
router.post('/', requireRole('admin'), auditAction('create_department'), async (req, res) => {
    try {
        const dept = await prisma.department.create({ data: { name: req.body.name, companyId: req.companyId } });
        sendSuccess(res, dept, 201);
    } catch (error) { sendError(res, 'Failed to create department'); }
});

// PATCH /departments/:id
router.patch('/:id', requireRole('admin'), async (req, res) => {
    try {
        const dept = await prisma.department.update({ where: { id: req.params.id }, data: { name: req.body.name } });
        sendSuccess(res, dept);
    } catch (error) { sendError(res, 'Failed to update department'); }
});

// DELETE /departments/:id
router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
        await prisma.user.updateMany({ where: { departmentId: req.params.id }, data: { departmentId: null } });
        await prisma.department.delete({ where: { id: req.params.id } });
        sendSuccess(res, { message: 'Department deleted' });
    } catch (error) { sendError(res, 'Failed to delete department'); }
});

module.exports = router;
