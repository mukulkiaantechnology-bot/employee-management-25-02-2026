API Design Reference
Employee Monitoring System
Base URL: http://localhost:5000/api/v1 All protected routes require: Authorization: Bearer <accessToken>

Auth
Method	Endpoint	Role	Body / Params	Description
POST	/auth/register	Public	{ companyName, name, email, password }	Register new company + admin
POST	/auth/login	Public	{ email, password }	Login, returns tokens
POST	/auth/logout	Auth	—	Invalidates refresh token
POST	/auth/refresh	Public	{ refreshToken }	Get new access token
POST	/auth/forgot-password	Public	{ email }	Send reset email
POST	/auth/reset-password	Public	{ token, newPassword }	Reset with token
GET	/auth/2fa/setup	Admin	—	Returns QR code URL
POST	/auth/2fa/verify	Auth	{ code, tempToken }	Verify TOTP code
POST	/auth/2fa/disable	Admin	{ password }	Disable 2FA
GET	/auth/me	Auth	—	Current user profile
Employees
Method	Endpoint	Role	Body / Params	Description
GET	/employees	Admin, Manager	?page&pageSize&status&department&search	Paginated list
GET	/employees/:id	Admin, Manager	—	Single employee detail
POST	/employees	Admin	Full employee object	Create employee
PATCH	/employees/:id	Admin	Partial update fields	Update employee
PATCH	/employees/:id/privacy	Admin	{ screenshotsBlurred, locationTracking, activityLogging, screenshotInterval }	Update privacy flags
DELETE	/employees/:id	Admin	—	Soft delete (sets status: terminated)
POST	/employees/bulk-action	Admin	{ action, ids[] }	Activate/deactivate/delete multiple
GET	/employees/:id/data-summary	Auth	—	Transparency view (own data for employee role)
GET	/employees/:id/stats	Admin, Manager	?date	Today's work hours, productivity, tasks
Departments
Method	Endpoint	Role	Body	Description
GET	/departments	Admin, Manager	—	List all departments
POST	/departments	Admin	{ name }	Create department
PATCH	/departments/:id	Admin	{ name }	Rename
DELETE	/departments/:id	Admin	—	Delete (unassigns employees)
Attendance
Method	Endpoint	Role	Params / Body	Description
GET	/attendance/calendar	Admin, Manager	?month&year&employeeId	Monthly calendar grid
GET	/attendance/records	Admin, Manager	?date&employeeId&status&page	Filter attendance records
POST	/attendance/qr-checkin	Employee	{ qrCode, lat, lng }	QR scan check-in/out
POST	/attendance/manual	Admin, Manager	{ employeeId, date, checkIn, checkOut, status }	Manual entry
PATCH	/attendance/:id	Admin	Partial update	Correct record
Shifts
Method	Endpoint	Role	Body	Description
GET	/shifts	Admin, Manager	?employeeId	List shifts
POST	/shifts	Admin, Manager	{ employeeId, name, startTime, endTime, days[], status }	Create shift
PATCH	/shifts/:id	Admin, Manager	Partial	Update shift
DELETE	/shifts/:id	Admin	—	Delete shift
Leaves
Method	Endpoint	Role	Body / Params	Description
GET	/leaves	Admin, Manager	?employeeId&status&year	List leave requests
GET	/leaves/my	Employee	?year	Own leave requests
POST	/leaves	Employee	{ type, startDate, endDate, reason }	Submit leave request
PATCH	/leaves/:id/status	Admin, Manager	{ status, rejectionNote }	Approve / Reject
GET	/leaves/balance/:employeeId	Admin, Manager, Employee(own)	?year	Leave balance per type
Holidays
Method	Endpoint	Role	Body / Params	Description
GET	/holidays	Auth	?year	List holidays
POST	/holidays	Admin	{ name, date, type, description }	Create holiday
PATCH	/holidays/:id	Admin	Partial	Update
DELETE	/holidays/:id	Admin	—	Delete
Time Tracking
Method	Endpoint	Role	Body / Params	Description
GET	/time-entries	Auth	?employeeId&date&page	List entries
GET	/time-entries/summary	Auth	?employeeId&date	Daily totals: total, active, idle, overtime
POST	/time-entries	Auth	{ date, startTime, title, projectId, source }	Start entry
PATCH	/time-entries/:id	Auth	{ endTime, description }	Update / stop
PATCH	/time-entries/:id/stop	Auth	{ endTime }	Stop running timer
DELETE	/time-entries/:id	Auth	—	Delete manual entry
Screenshots
Method	Endpoint	Role	Body / Params	Description
GET	/screenshots	Admin, Manager	?employeeId&date&page&pageSize&view	Paginated list
GET	/screenshots/my	Employee	?date&page	Own screenshots
POST	/screenshots	System/Agent	Multipart form with image	Upload screenshot
PATCH	/screenshots/:id/blur	Admin	{ isBlurred }	Toggle blur
PATCH	/screenshots/:id/flag	Admin, Manager	{ isFlagged }	Toggle flagged
DELETE	/screenshots/:id	Admin	—	Soft delete
DELETE	/screenshots/bulk	Admin	{ ids[] }	Bulk delete
Activity Monitoring
Method	Endpoint	Role	Params	Description
GET	/activity/summary	Auth	?employeeId&date	Activity log (active/idle/score)
GET	/activity/apps	Admin, Manager	?employeeId&date	App usage breakdown
GET	/activity/websites	Admin, Manager	?employeeId&date	Website usage breakdown
GET	/activity/apps/my	Employee	?date	Own app usage
GET	/activity/websites/my	Employee	?date	Own website usage
POST	/activity/sync	System/Agent	ActivityLog + usages[]	Batch sync from desktop agent
Location Tracking
Method	Endpoint	Role	Params / Body	Description
GET	/location/live	Admin, Manager	—	Current positions of all active employees
GET	/location/history	Admin, Manager	?employeeId&date	Route history points
POST	/location/update	Employee	{ lat, lng, speed }	Position update (also via Socket.IO)
GET	/geofences	Admin, Manager	—	List company geofences
POST	/geofences	Admin	{ name, radius, lat, lng, color }	Create geofence
PATCH	/geofences/:id	Admin	Partial	Update
PATCH	/geofences/:id/toggle	Admin	—	Enable/disable
DELETE	/geofences/:id	Admin	—	Delete
GET	/location/geologs	Admin, Manager	?page&employeeId	Check-in / check-out log
Tasks & Projects
Method	Endpoint	Role	Body / Params	Description
GET	/projects	Auth	?status&page	List company projects
GET	/projects/:id	Auth	—	Project detail with milestones
POST	/projects	Admin, Manager	Full project object	Create project
PATCH	/projects/:id	Admin, Manager	Partial	Update project
DELETE	/projects/:id	Admin	—	Delete project
GET	/projects/:id/tasks	Auth	?status&assigneeId	Tasks for project
GET	/tasks	Auth	?projectId&status&assigneeId&priority	Task list
POST	/tasks	Admin, Manager	Full task object	Create task
PATCH	/tasks/:id	Auth	Partial (status, position, hours)	Update task
PATCH	/tasks/:id/position	Auth	{ status, position }	Kanban drag-drop
DELETE	/tasks/:id	Admin, Manager	—	Delete task
POST	/tasks/:id/comments	Auth	{ content }	Add comment
GET	/tasks/:id/comments	Auth	—	List comments
POST	/milestones	Admin, Manager	{ projectId, title, dueDate }	Create milestone
PATCH	/milestones/:id	Admin, Manager	{ completed }	Toggle milestone
Payroll
Method	Endpoint	Role	Body / Params	Description
GET	/payroll	Admin	?month&year&status&page	All payroll records
GET	/payroll/my	Employee	?year	Own payslips
GET	/payroll/team	Manager	?month&year	Team summary (no net pay)
POST	/payroll/generate	Admin	{ month, year, companyId }	Bulk generate payroll
GET	/payroll/:id	Auth	—	Single payroll record
PATCH	/payroll/:id/status	Admin	{ status }	Advance status: draft→processed→paid
GET	/payroll/:id/payslip	Auth	—	Download payslip PDF
Reports
Method	Endpoint	Role	Params	Description
GET	/reports/productivity	Admin, Manager	?startDate&endDate&employeeId&department	Productivity analytics
GET	/reports/attendance	Admin, Manager	?startDate&endDate&employeeId	Attendance summary
GET	/reports/time	Admin, Manager	?startDate&endDate&employeeId	Time tracking summary
GET	/reports/screenshots	Admin	?startDate&endDate&employeeId	Screenshot gallery data
GET	/reports/location	Admin	?startDate&endDate&employeeId	Location + distance report
GET	/reports/payroll	Admin	?month&year	Payroll summary
POST	/reports/export	Admin, Manager	{ reportType, format, filters }	Export as CSV/Excel/PDF stream
Alerts & Notifications
Method	Endpoint	Role	Body / Params	Description
GET	/alerts/config	Admin	—	Get all alert configurations
PUT	/alerts/config	Admin	{ type, enabled, threshold, sensitivity, zones }[]	Update all alert configs
PATCH	/alerts/config/:type	Admin	{ enabled, threshold, ... }	Update single alert type
GET	/alerts/history	Admin, Manager	?type&page	Recent alert events
GET	/notifications	Auth	?filter&page&search	List notifications
GET	/notifications/unread-count	Auth	—	{ count: number }
PATCH	/notifications/:id/read	Auth	—	Mark as read
PATCH	/notifications/read-all	Auth	—	Mark all as read
DELETE	/notifications/:id	Auth	—	Delete notification
DELETE	/notifications/all	Auth	—	Delete all notifications
Compliance
Method	Endpoint	Role	Body / Params	Description
GET	/compliance/audit-logs	Admin	?search&status&page	Audit log list
GET	/compliance/audit-logs/export	Admin	?search&status	Export CSV stream
GET	/compliance/consent	Admin	?page	Consent status per employee
POST	/compliance/consent/broadcast	Admin	{ policyVersion, message }	Send consent to all employees
PATCH	/compliance/consent/:employeeId	Employee	{ accepted }	Employee accepts consent
GET	/compliance/status	Admin	—	Summary: encryption, gdpr, 2fa, consent stats
Settings
Method	Endpoint	Role	Body	Description
GET	/settings	Admin	—	Get company settings
PUT	/settings	Admin	Full settings object	Update all settings
PATCH	/settings/monitoring	Admin	{ screenshotInterval, idleThreshold, enableBlur, geoFenceRange }	Monitoring policy
PATCH	/settings/privacy	Admin	{ dataRetentionDays }	Privacy/retention
PATCH	/settings/notifications	Admin	{ email, push, sms, weeklyDigest }	Notification channels
PATCH	/settings/appearance	Auth	{ theme, fontSize }	Per-user UI preferences
PATCH	/settings/integrations	Admin	{ slackEnabled, jiraEnabled, ... }	Integration toggles
POST	/settings/integrations/connect	Admin	{ provider, code }	OAuth callback token exchange
DELETE	/settings/integrations/:provider	Admin	—	Disconnect integration
GET	/settings/billing	Admin	—	Billing info + seat usage
GET	/settings/company	Admin	—	Company profile
PATCH	/settings/company	Admin	{ name, address, country }	Update company profile
POST	/settings/company/logo	Admin	Multipart form	Upload company logo
