const { prisma } = require('../../config/database');
const { hashPassword, comparePassword } = require('../../utils/bcrypt');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { generateEmployeeId } = require('../../utils/employeeId');

const registerCompany = async (data) => {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new Error('Email already registered');

    const company = await prisma.company.create({
        data: {
            name: data.companyName,
            settings: {
                create: {},
            },
        },
    });

    const passwordHash = await hashPassword(data.password);
    const employeeId = await generateEmployeeId(company.id);

    const user = await prisma.user.create({
        data: {
            employeeId,
            name: data.name,
            email: data.email,
            passwordHash,
            role: 'admin',
            companyId: company.id,
        },
        select: { id: true, name: true, email: true, role: true, companyId: true },
    });

    // Seed default alert configs
    await prisma.alertConfig.createMany({
        data: [
            { companyId: company.id, type: 'idle_timeout', enabled: true, threshold: 30 },
            { companyId: company.id, type: 'unusual_activity', enabled: true, sensitivity: 'medium' },
            { companyId: company.id, type: 'missed_shift', enabled: true, threshold: 15 },
            { companyId: company.id, type: 'geofence_violation', enabled: false },
            { companyId: company.id, type: 'overtime_threshold', enabled: true, threshold: 9 },
        ],
    });

    return { company, user };
};

const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true, name: true, email: true, role: true, companyId: true,
            passwordHash: true, twoFactorEnabled: true,
        },
    });
    if (!user) throw new Error('Invalid credentials');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    if (user.twoFactorEnabled) {
        const tempToken = signAccessToken({ userId: user.id, role: user.role, companyId: user.companyId });
        return { requires2FA: true, tempToken };
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role, companyId: user.companyId });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role, companyId: user.companyId });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    const { passwordHash: _, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
};

const refreshUserToken = async (token) => {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findFirst({
        where: { id: payload.userId, refreshToken: token },
    });
    if (!user) throw new Error('Invalid refresh token');

    const accessToken = signAccessToken({ userId: user.id, role: user.role, companyId: user.companyId });
    const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role, companyId: user.companyId });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

    return { accessToken, refreshToken: newRefreshToken };
};

const logoutUser = async (userId) => {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
};

module.exports = {
    registerCompany,
    loginUser,
    refreshUserToken,
    logoutUser,
};
