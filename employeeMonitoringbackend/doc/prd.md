Product Requirements Document
Employee Monitoring System (EMS)
Derived from: Full frontend codebase analysis of employeeMonitoringfrontend Date: February 24, 2026 Status: Ready for Backend Implementation

1. Project Overview
The Employee Monitoring System (EMS) is a multi-role SaaS web application that enables organizations to monitor, manage, and analyze employee productivity and compliance. It provides real-time tracking of work hours, screenshots, location data, application usage, tasks, payroll, and compliance — all from a centralized dashboard.

Company context in mock data: Shoppeal Tech Private Limited (142/200 seats, Enterprise plan)

2. User Roles
Role	Route Prefix	Access Level	Description
Admin	/admin	Full access	Manages all employees, settings, payroll, reports, compliance.
Manager	/manager	Department access	Views/manages assigned team members; limited admin capabilities.
Employee	/employee	Own data only	Views their own stats, time logs, screenshots, tasks, payslips.
Role-specific Dashboard Differences
Admin Dashboard: Total employees, active now, avg productivity, attendance rate; all-team charts; quick actions (add employee, approve leave, generate report, bulk alert).
Manager Dashboard: Team-specific: total team members, on-time rate, avg team hours, active alerts for their team.
Employee Dashboard: Personal: today's hours, productivity score, tasks completed, streak; own performance, screenshot thumbnail, time entry.
3. Functional Modules
3.1 Authentication
Email + password login
Role-based redirect on login (admin → /admin/dashboard, manager → /manager/dashboard, employee → /employee/dashboard)
JWT-based session management
Optional 2FA (TOTP/QR code via Google Authenticator or Microsoft Auth)
"Forgot password" flow (email reset)
Session termination / logout-all-devices
Fields: email, password, role, 2fa_enabled, 2fa_secret

3.2 Employee Management
Full CRUD: add, edit, deactivate, delete employees
Fields per employee:
employeeId (auto-generated, e.g. EMP-001)
name, email, phone, department, position
status (Active / On Leave / Remote / Terminated)
avatar/photo, joinDate, salary (base rate)
role (admin / manager / employee)
managerId (FK to manager)
workHours (today), productivity (%), tasksCompleted
Pagination (8 per page by default)
Search + filter by status/department
Privacy controls per employee:
screenshotsBlurred (bool)
locationTracking (bool)
activityLogging (bool)
Transparency modal: employees can see what data is being collected about them
Bulk actions: activate, deactivate, delete selected
Business Rule: Managers can only view/edit employees in their assigned department. Admin sees all.

3.3 Attendance
Four sub-views:

Calendar View
Monthly calendar, each day shows attendance status per employee
Statuses: Present, Late, Absent, Remote, Holiday
Schedule View (Shift Management)
Shift slots: name, start/end time, days (Mon–Sun toggles)
Multiple shift types per employee
Published/draft state
Leave Management
Leave types: Sick Leave, Casual Leave, Earned Leave, Maternity/Paternity Leave, Unpaid
Leave request: employeeId, type, startDate, endDate, reason, status
Approval workflow: Pending → Approved / Rejected (by manager or admin)
Leave balance tracking per type
Holiday Management
Company-wide holidays: name, 
date
, type (National/Regional/Company), description
Year-based filtering
QR Check-in
Each employee has a unique QR code
Scan to clock in/out with timestamp and location
attendanceRecord: employeeId, 
date
, checkIn, checkOut, method (QR/Manual/Auto), location
3.4 Time Tracking
Timer: Start, Pause, Stop — persisted via global state
Manual entry: title, project, start/end time, description
Visual timeline bar showing sessions for the day
Activity heatmap (hourly grid, colored by productivity score)
Daily summary: totalHours, activeTime, idleTime, overtimeHours
timeEntry: employeeId, 
date
, startTime, endTime, title, project, description, durationSeconds, source (timer / manual)
Business Rule: Overtime = hours > standard workday (8h). Flagged in alerts if threshold exceeded.

3.5 Screenshot Monitoring
Automatic captures at configurable intervals (1–60 minutes)
Fields: employeeId, timestamp, imageUrl, appName, activityScore, isBlurred, isDeleted
Views: Grid, List
Slideshow player: play/pause, skip forward/back, speed control (0.5x–4x)
Bulk select + delete
Mark as flagged/reviewed
Privacy blur: admin can blur screenshots for individual employees (setting in Employee Management)
Capture settings per employee from Settings page: interval, blur toggle
3.6 Activity Monitoring
App usage tracking: appName, category, usageTimeSeconds, usagePercent
Website tracking: domain, category, visitCount, usageTimeSeconds
Categories: Productive, Neutral, Distracting
Productivity score (0–100) calculated from weighted app categories
Privacy Mode toggle: blurs/hides sensitive app/website names in UI
Charts: Donut (productivity breakdown), Pie (active vs idle), Bar (category split), Area (activity pulse hourly)
3.7 Location Tracking
Three tabs:

Live Map
Real-time employee positions (animated on a map canvas)
Employee status: moving, idle
Click employee → show info popup (name, status, address, last seen)
Today's total distance, active node count
History Replay
Playback system with scrubber (0–100%), timeline 12:00 PM–4:30 PM
Route drawn as SVG polyline
Progress indicator as animated car icon
Geofencing
Zone CRUD: name, radius (200m / 500m / 1km), enabled (bool), color
Toggle zone active/inactive
Geo-logs feed: check-in / check-out events with employee name, time, zone
Fields: geofence: 
id
, name, radius, color, enabled, companyId locationLog: 
id
, employeeId, geofenceId, type (in/out), timestamp, lat, lng

3.8 Tasks & Projects
Two views:

Kanban Board
Columns: To Do, In Progress, In Review, Done
Drag-and-drop between columns
Cards show: title, priority badge (urgent/high/medium/low), assignees, due date, comment count
List View
Table with sort/filter
Task fields: 
id
, title, description, status, priority, projectId, assigneeIds[], dueDate, tags[], estimatedHours, actualHours, attachments[], comments[]

Project fields: 
id
, name, description, status (Active/Completed/On Hold), startDate, endDate, progress (%), teamIds[], milestones[], budget, spent

Milestones: title, dueDate, completed (bool)

Business Rules:

Only Admin/Manager can create projects and assign tasks
Employees can update task status and log hours on assigned tasks
Task status drives progress % on project
3.9 Payroll
Salary calculation: baseSalary = baseRate × hoursWorked
Tax deduction: 20% fixed rate
Overtime rate: 1.5× base hourly rate for hours > 8/day
Net pay formula: netPay = baseSalary + overtimePay - taxDeduction - deductions
Payslip generation (per employee per month)
Payroll status: Draft → Processed → Paid
Integrations: QuickBooks, Xero, Paychex (OAuth-based, toggle connect/disconnect)
Payroll record fields: 
id
, employeeId, month, year, baseSalary, overtimePay, taxDeduction, deductions, netPay, status, paidAt

Business Rules:

Only Admin can process and approve payroll
Managers can view team payroll summaries (not individual net pay)
Employees can view only their own payslips
Tax rate configurable in Settings (default 20%)
3.10 Reports
Export formats: PDF, Excel (.xlsx), CSV, PNG (screenshot)

Report types:

Productivity Report — app usage, scores, categories per employee/team
Time & Attendance Report — hours logged, leave summary, late arrivals
Screenshots Report — screenshot gallery export with timestamps
Location Report — distance traveled, geofence events
Payroll Summary — salary breakdown per period
Custom Report — user-defined date range, metric selection
Filters: employee, department, date range, metric type Charts included: Bar (weekly hours), Heatmap (activity by hour/day), Pie (app category split)

3.11 Alerts & Notifications
Alerts (Configuration)
5 alert types, each individually toggleable + configurable threshold:

Alert Type	Default	Threshold
Employee Idle Timeout	ON	30 min (range: 5–120 min)
Unusual Activity Detection (AI)	ON	Sensitivity: Low/Medium/High
Missed Shift	ON	Grace period: 15 min (range: 5–60 min)
Geofence Violation	OFF	Zone selection
Overtime Threshold	ON	Daily limit: 9h (range: 8–14h)
Notification channels (toggleable):

In-app Push — dashboard popups
Email Digest — daily summary
SMS Alerts — critical only
Notifications (Feed)
Types: alert, success, info
Fields: 
id
, title, description, type, category, 
date
, time, unread (bool), recipientId
Actions: mark read, delete, bulk mark-all-read, bulk delete-all
Filters: All / Unread / Alerts / Success / System
3.12 Compliance & Security
6 feature cards:

RBAC — per-role permission toggles: View / Edit / Export / Manage data
Data Encryption — AES-256 toggle, master key display (masked)
GDPR — data retention period (90d / 1y / 3y / 7y), region block, bulk data purge
Employee Consent Forms — digital consent tracking, broadcast new policy, resend to pending
Audit Logs — immutable log of all system actions (action, user, IP, timestamp, status)
Status values: Success / Warning / Denied
Export to CSV
Two-Factor Authentication — TOTP QR code setup, enable/disable per admin account
Audit log fields: 
id
, action, userId, 
ip
, timestamp, status (Success/Warning/Denied)

3.13 Settings
Persisted to localStorage (frontend) → must be persisted to DB in backend.

Config sections:

Section	Settings
Company Profile	name, address, country, logo
Role-Based Access	per-role permission matrix
Billing & Plans	plan tier, seat count, billing date, payment method
Integrations	Slack, Jira, G-Workspace toggles
Global Policy	screenshot interval (1–60 min), blur toggle, AI detection
Privacy Controls	data purge cycle (30–365 days), secure deletion
Map & Geofence	geofence detection radius (meters)
Appearance	theme (Dark/Light), font size
My Profile	name, email, avatar
Device Sync	authorized mobile devices
Activity History	internal security/admin action logs
4. RBAC Matrix
Module	Admin	Manager	Employee
Dashboard	✅ Full	✅ Team-only	✅ Own data
Employee Management	✅ CRUD	✅ Read + edit dept	❌
Attendance	✅ All	✅ Team	✅ Own
Time Tracking	✅ All	✅ Team	✅ Own
Screenshot Monitoring	✅ All + delete/blur	✅ Team	✅ Own only
Activity Monitoring	✅ All	✅ Team	✅ Own
Location Tracking	✅ All	✅ Team	❌
Tasks & Projects	✅ CRUD	✅ Create/assign	✅ Update status
Payroll	✅ Full	✅ View summary	✅ Own payslips
Reports	✅ All types + export	✅ Team reports	✅ Own reports
Alerts Config	✅ Full	✅ View + ack	❌
Notifications	✅ All	✅ All	✅ Own
Compliance	✅ Full	✅ View logs	❌
Settings	✅ Full	✅ Limited	✅ Profile + appearance
5. Business Rules
Payroll Tax: Fixed 20% deduction. Configurable in Settings.
Overtime Trigger: >8 hours/day, calculated at 1.5× hourly rate.
Screenshot Blur: If employee.screenshotsBlurred = true, all screenshots for that employee are blurred in all views.
Manager Scope: Manager can only see/edit employees in their departmentId.
Leave Approvals: Manager approves/rejects. Admin can override.
Task Progress: Project progress % is auto-calculated from completed vs total tasks.
Audit Log Immutability: Audit logs cannot be deleted (only exported).
Consent Required: New employees must acknowledge monitoring consent before data collection begins.
GDPR Purge: After retention period expires, personal data is auto-purged (screenshots, location logs).
Alert Firing: Alert events are auto-added to Notifications feed and to Audit Log.
2FA Enforcement: If 2FA is enabled in Compliance, all admin accounts must complete 2FA on login.
Screenshot Capture: Capture interval set globally in Settings but overridable per-employee in Employee Management.
6. Non-Functional Requirements
Requirement	Specification
Performance	API response < 200ms for list endpoints; < 500ms for reports
Scalability	Multi-tenant ready; company-scoped all queries
Security	JWT Auth, bcrypt passwords, role guards on every route
Data Privacy	GDPR compliant; AES-256 for screenshots at rest
Availability	99.9% uptime target
Audit Trail	Every mutating action logged to audit_logs
Pagination	All list endpoints paginated (default 10/page)
File Storage	Screenshots stored in cloud storage (S3/Cloudinary), URL saved in DB
Real-time	Socket.IO for live location & notifications
