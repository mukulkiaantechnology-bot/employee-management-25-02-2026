const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response');

const register = async (req, res) => {
    try {
        const result = await authService.registerCompany(req.body);
        sendSuccess(res, result, 201);
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Registration failed';
        sendError(res, msg, 400, 'REGISTRATION_ERROR');
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        sendSuccess(res, result);
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        sendError(res, msg, 401, 'AUTH_ERROR');
    }
};

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) { sendError(res, 'Refresh token required', 400, 'MISSING_TOKEN'); return; }
        const result = await authService.refreshUserToken(refreshToken);
        sendSuccess(res, result);
    } catch (error) {
        sendError(res, 'Invalid refresh token', 401, 'UNAUTHORIZED');
    }
};

const logout = async (req, res) => {
    try {
        await authService.logoutUser(req.user.userId);
        sendSuccess(res, { message: 'Logged out' }, 200);
    } catch (error) {
        sendError(res, 'Logout failed', 500);
    }
};

const getMe = async (req, res) => {
    try {
        const { prisma } = require('../../config/database');
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, employeeId: true, name: true, email: true, role: true, avatarUrl: true, companyId: true, department: true, position: true },
        });
        if (!user) { sendError(res, 'User not found', 404, 'NOT_FOUND'); return; }
        sendSuccess(res, user);
    } catch (error) {
        sendError(res, 'Failed to fetch profile', 500);
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout,
    getMe,
};
