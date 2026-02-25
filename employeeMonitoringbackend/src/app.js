require('dotenv/config');
require('./config/env'); // Validate env on startup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { env } = require('./config/env');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const employeeRoutes = require('./modules/employees/employees.routes');
const departmentRoutes = require('./modules/departments/departments.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const timeRoutes = require('./modules/time-tracking/time-tracking.routes');
const screenshotRoutes = require('./modules/screenshots/screenshots.routes');
const activityRoutes = require('./modules/activity/activity.routes');
const locationRoutes = require('./modules/location/location.routes');
const taskRoutes = require('./modules/tasks/tasks.routes');
const payrollRoutes = require('./modules/payroll/payroll.routes');
const alertRoutes = require('./modules/alerts/alerts.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const complianceRoutes = require('./modules/compliance/compliance.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const reportRoutes = require('./modules/reports/reports.routes');

const app = express();

// ── Core Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter limiter on auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── API Routes ───────────────────────────────────────────────
const API = '/api';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/employees`, employeeRoutes);
app.use(`${API}/departments`, departmentRoutes);
app.use(`${API}/attendance`, attendanceRoutes);
app.use(`${API}/time-entries`, timeRoutes);
app.use(`${API}/screenshots`, screenshotRoutes);
app.use(`${API}/activity`, activityRoutes);
app.use(`${API}/location`, locationRoutes);
app.use(`${API}/tasks`, taskRoutes);
app.use(`${API}/payroll`, payrollRoutes);
app.use(`${API}/alerts`, alertRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/compliance`, complianceRoutes);
app.use(`${API}/settings`, settingsRoutes);
app.use(`${API}/reports`, reportRoutes);

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` } });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: env.NODE_ENV === 'production' ? 'Something went wrong' : err.message } });
});

module.exports = app;
