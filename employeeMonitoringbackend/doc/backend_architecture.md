Backend Architecture Plan
Employee Monitoring System (EMS)
1. Tech Stack
Layer	Technology	Reason
Runtime	Node.js 20+ LTS	Industry standard, great ecosystem
Framework	Express.js 5	Lightweight, full control
ORM	Prisma v5	Type-safe, great schema migration DX
Database	MySQL 8	Relational data fits this domain well
Auth	JWT (access + refresh tokens)	Stateless, scalable
Real-time	Socket.IO	Live location + notifications
File Storage	Cloudinary (or AWS S3)	Screenshot image storage
Email	Nodemailer + SMTP	Notifications + invites
Validation	Zod	Runtime schema validation
Security	bcryptjs, helmet, cors, rate-limit	Standard hardening
Logging	Winston	Structured logs
Env	dotenv	Config management
Dev Tools	nodemon, tsx	Hot reload in development
2. Folder Structure
employeeMonitoringbackend/
├── prisma/
│   ├── schema.prisma           # Database schema (all models)
│   └── seed.ts                 # Seed initial admin + company
│
├── src/
│   ├── app.ts                  # Express app setup (middleware, routes)
│   ├── server.ts               # HTTP + Socket.IO server entry point
│   │
│   ├── config/
│   │   ├── database.ts         # Prisma client singleton
│   │   ├── cloudinary.ts       # File upload config
│   │   └── env.ts              # Validated env variables (Zod)
│   │
│   ├── middleware/
│   │   ├── auth.ts             # JWT verify → req.user
│   │   ├── role.ts             # Role guard factory: requireRole('admin')
│   │   ├── company.ts          # Company scope: all queries filtered by companyId
│   │   ├── validate.ts         # Zod body/query/param validation
│   │   ├── audit.ts            # Auto-logs mutating actions to audit_logs
│   │   └── upload.ts           # Multer middleware for screenshot uploads
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.schema.ts  # Zod schemas
│   │   │
│   │   ├── employees/
│   │   │   ├── employees.controller.ts
│   │   │   ├── employees.service.ts
│   │   │   ├── employees.routes.ts
│   │   │   └── employees.schema.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── attendance.controller.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── attendance.routes.ts
│   │   │   └── attendance.schema.ts
│   │   │
│   │   ├── time-tracking/
│   │   ├── screenshots/
│   │   ├── activity/
│   │   ├── location/
│   │   ├── tasks/
│   │   ├── payroll/
│   │   ├── reports/
│   │   ├── alerts/
│   │   ├── notifications/
│   │   ├── compliance/
│   │   └── settings/
│   │
│   ├── utils/
│   │   ├── jwt.ts              # signToken, verifyToken, refreshToken
│   │   ├── bcrypt.ts           # hashPassword, comparePassword
│   │   ├── pagination.ts       # Prisma pagination helper
│   │   ├── response.ts         # Standardized API response shape
│   │   ├── payroll.ts          # Payroll calculation formulas
│   │   └── employeeId.ts       # EMP-XXX auto-ID generator
│   │
│   └── sockets/
│       ├── index.ts            # Socket.IO setup + namespace routing
│       ├── location.socket.ts  # Live location broadcast
│       └── notifications.socket.ts # Real-time notification push
│
├── .env                        # Environment variables
├── .env.example                # Template
├── package.json
├── tsconfig.json
└── README.md
3. Authentication Design
JWT Token Strategy
Access token: 15 minutes, signed with JWT_SECRET
Refresh token: 7 days, stored in DB (refreshToken column on User)
Login Flow
POST /auth/login
  → Validate email/password
  → If 2FA enabled: return { requires2FA: true, tempToken }
  → Else: return { accessToken, refreshToken, user: { id, role, companyId } }
POST /auth/verify-2fa
  → Verify TOTP code using tempToken
  → Return { accessToken, refreshToken, user }
Middleware Chain (applied to every protected route)
auth.ts → role.ts → company.ts → handler
auth.ts — Verifies Bearer token, attaches req.user = { id, role, companyId }
role.ts — requireRole('admin', 'manager') guard
company.ts — Injects req.companyId and ensures all queries are scoped to it
Password Reset
POST /auth/forgot-password    → sends email with 1h reset link
POST /auth/reset-password     → validates token, updates passwordHash
4. Module Implementation Notes
4.1 Employee Management
GET /employees — paginated, filterable by status/department (company-scoped)
Manager filter: WHERE managerId = req.user.id OR departmentId = manager.departmentId
POST /employees — auto-generates employeeId (EMP-XXX)
Privacy flags (screenshotsBlurred, etc.) updated via PATCH /employees/:id/privacy
Transparency endpoint: GET /employees/:id/data-summary (for employee self-view)
4.2 Attendance
QR check-in: POST /attendance/qr-checkin — validates QR code, records lat/lng + timestamp
GET /attendance/calendar?month=2&year=2026 — returns status per employee per day
Leave approval: PATCH /leaves/:id/status — manager/admin only, creates AuditLog entry
Holiday CRUD: POST /holidays, admin-only
4.3 Time Tracking
Timer state managed client-side (RealTimeContext) but synced on stop/pause:
POST /time-entries — create new running entry
PATCH /time-entries/:id/stop — sets endTime, calculates durationSeconds
Manual entries: standard POST /time-entries with source: "manual"
GET /time-entries?date=2026-02-24 — daily summary for a user
4.4 Screenshot Monitoring
Upload: POST /screenshots — Multer → Cloudinary → save URL in DB
GET /screenshots?employeeId=&date=&page= — paginated, blurred if isBlurred
Bulk delete: DELETE /screenshots/bulk — body: { ids: string[] }
PATCH /screenshots/:id/flag — toggle isFlagged
4.5 Activity Monitoring
Activity data pushed from desktop agent (not in scope for this MVP — receive via POST /activity/sync)
GET /activity/summary?employeeId=&date= — returns ActivityLog
GET /activity/apps?employeeId=&date= — AppUsage[]
GET /activity/websites?employeeId=&date= — WebsiteUsage[]
4.6 Location Tracking
Real-time location: Socket.IO location:update event from client agent
GET /location/live?companyId= — returns latest position per active employee
GET /location/history?employeeId=&date= — returns LocationLog[] sorted by timestamp
GET /geofences — company geofences
POST /geofences — admin/manager only
4.7 Tasks & Projects
Project progress auto-calculated: progress = completedTasks / totalTasks * 100
Task position (Kanban order) updated via: PATCH /tasks/:id/position
Task drag-drop: PATCH /tasks/:id updates status + position
GET /tasks?projectId=&status=&assigneeId=
4.8 Payroll
Payroll calculation formula (in src/utils/payroll.ts):
ts
baseSalary = baseRate * hoursWorked
overtimePay = overtimeHours * baseRate * 1.5
taxDeduction = (baseSalary + overtimePay) * taxRate
netPay = baseSalary + overtimePay - taxDeduction - deductions
Tax rate from CompanySettings.taxRate (default 0.20)
POST /payroll/generate?month=2&year=2026 — bulk generate payroll for all employees
PATCH /payroll/:id/status — draft → processed → paid (admin only)
GET /payroll?employeeId= — employee self-view
4.9 Reports
GET /reports/productivity?startDate=&endDate=&employeeId=&department=
GET /reports/attendance?...
POST /reports/export — body: { type, format, filters } — generates CSV/Excel stream
CSV: use csv-writer npm package
Excel: use exceljs npm package
PDF: use puppeteer or pdfmake
4.10 Alerts & Notifications
Alert configs CRUD: GET/PUT /alerts/config — company-level
Alert firing (background job or triggered from activity sync):
Check threshold conditions
Create 
Notification
 record for relevant users
Emit Socket.IO notification:new event to recipient
Write to AuditLog
GET /notifications?filter=unread — paginated
PATCH /notifications/:id/read
DELETE /notifications/:id
4.11 Compliance
Audit logs: append-only, no DELETE endpoint
GET /compliance/audit-logs?search=&status= — paginated
GET /compliance/audit-logs/export — streams CSV
Consent: POST /compliance/consent/broadcast — creates ComplianceConsent records for all employees
2FA setup: GET /auth/2fa/setup → returns QR code (otpauth URL) using speakeasy
4.12 Settings
GET /settings — returns CompanySettings for the company
PUT /settings — admin only, updates all fields
Integration tokens stored encrypted in DB (use AES-256-CBC via Node crypto module)
5. Real-time Design (Socket.IO)
Namespaces:
  /location     — live employee position updates
  /notifications — push alerts to specific users
Events (server → client):
  location:positions     { employees: [{ id, lat, lng, status }] }
  notification:new       { notification: Notification }
Events (client → server):
  location:update        { lat, lng, speed, timestamp }  (from mobile/desktop agent)
Auth:
  Socket handshake includes JWT in auth.token
  Server validates token → attaches socket.data.user
  Server joins socket to room: companyId (for broadcast isolation)
6. API Response Standard
All endpoints return:

json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "pageSize": 10, "total": 142 }
}
Errors:

json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access denied",
    "details": []
  }
}
HTTP Status codes:

200 OK, 201 Created, 204 No Content
400 Bad Request (validation), 401 Unauthorized, 403 Forbidden, 404 Not Found
409 Conflict (duplicate), 422 Unprocessable, 429 Rate Limited
500 Internal Server Error
7. Audit Middleware
Applied automatically to all mutating routes (POST, PATCH, PUT, DELETE):

ts
// middleware/audit.ts
export const auditLog = (action: string) => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode < 400) {
      await prisma.auditLog.create({
        data: {
          companyId: req.companyId,
          userId: req.user?.id,
          action,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'success',
          metadata: { method: req.method, path: req.path }
        }
      });
    }
  });
  next();
};
8. Environment Variables
env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ems"
# JWT
JWT_SECRET="your-super-secret-key-32-chars-min"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"
# Server
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
# Cloudinary (Screenshot Storage)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@email.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="EMS System <noreply@ems.app>"
# Security
ENCRYPTION_KEY="32-char-key-for-aes-256"
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
9. Production Readiness Checklist
 All routes protected via auth middleware
 Role guards on every sensitive endpoint
 Company scope enforced on all data queries
 Input validation via Zod on all endpoints
 Passwords hashed with bcrypt (rounds ≥ 12)
 JWT secrets rotatable via env vars
 Rate limiting on auth endpoints (5 req/15min)
 helmet middleware for security headers
 cors configured to allowed origins only
 Audit logging on all mutating operations
 Pagination on all list endpoints
 Soft deletes for screenshots, employees
 GDPR purge job scheduled (cron)
 Error boundary — never expose stack traces in production
 Database connection pooling via Prisma
 Environment variable validation at startup