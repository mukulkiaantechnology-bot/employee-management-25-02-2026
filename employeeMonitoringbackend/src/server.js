require('dotenv/config');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { env } = require('./config/env');
const { prisma } = require('./config/database');
const { verifyAccessToken } = require('./utils/jwt');

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// ── Socket.IO Auth Middleware ────────────────────────────────
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
        const payload = verifyAccessToken(token);
        socket.user = payload;
        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
});

// ── Location Namespace ───────────────────────────────────────
const locationNS = io.of('/location');
locationNS.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try { socket.user = verifyAccessToken(token); next(); } catch (error) { next(new Error('Invalid token')); }
});

locationNS.on('connection', (socket) => {
    const user = socket.user;
    socket.join(user.companyId);
    console.log(`📍 ${user.userId} connected to location namespace`);

    socket.on('position:update', (data) => {
        prisma.locationLog.create({
            data: { employeeId: user.userId, type: 'position', lat: data.lat, lng: data.lng, speed: data.speed, timestamp: new Date() },
        }).catch(console.error);
        // Broadcast to company room (admin/manager watching live map)
        locationNS.to(user.companyId).emit('position:updated', { employeeId: user.userId, ...data, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
        console.log(`📍 ${user.userId} disconnected from location namespace`);
    });
});

// ── Notifications Namespace ──────────────────────────────────
const notifNS = io.of('/notifications');
notifNS.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try { socket.user = verifyAccessToken(token); next(); } catch (error) { next(new Error('Invalid token')); }
});

notifNS.on('connection', (socket) => {
    const user = socket.user;
    socket.join(user.userId); // personal room
    socket.join(user.companyId); // company room
    console.log(`🔔 ${user.userId} connected to notifications namespace`);
});

// Export so other modules can emit notifications
const emitNotification = (userId, notification) => {
    notifNS.to(userId).emit('notification:new', notification);
};

// ── Start Server ─────────────────────────────────────────────
const start = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected');
        httpServer.listen(env.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${env.PORT}`);
            console.log(`🌐 Environment: ${env.NODE_ENV}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

// ── Graceful Shutdown ────────────────────────────────────────
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing connections...');
    await prisma.$disconnect();
    httpServer.close(() => process.exit(0));
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    httpServer.close(() => process.exit(0));
});

start();

module.exports = { emitNotification };
