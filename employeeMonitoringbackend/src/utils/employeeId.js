const { prisma } = require('../config/database');

let counter = 0;

const generateEmployeeId = async (companyId) => {
    const count = await prisma.user.count({ where: { companyId } });
    const num = (count + 1 + counter++).toString().padStart(3, '0');
    return `EMP-${num}`;
};

module.exports = {
    generateEmployeeId,
};
