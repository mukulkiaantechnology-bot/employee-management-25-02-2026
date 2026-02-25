export const mockStats = {
    activeEmployees: 124,
    online: 82,
    idle: 12,
    offline: 30,
    totalHours: {
        today: '942h',
        week: '4,820h',
        month: '18,400h'
    },
    productivityTrend: [
        { name: 'Mon', productivity: 85, hours: 820 },
        { name: 'Tue', productivity: 88, hours: 840 },
        { name: 'Wed', productivity: 92, hours: 890 },
        { name: 'Thu', productivity: 84, hours: 810 },
        { name: 'Fri', productivity: 80, hours: 780 },
        { name: 'Sat', productivity: 40, hours: 210 },
        { name: 'Sun', productivity: 35, hours: 180 },
    ],
    departmentStats: [
        { name: 'Engineering', productivity: 92, active: 45, offline: 2 },
        { name: 'Product', productivity: 88, active: 12, offline: 1 },
        { name: 'Design', productivity: 94, active: 8, offline: 0 },
        { name: 'Marketing', productivity: 82, active: 15, offline: 3 },
        { name: 'Sales', productivity: 85, active: 22, offline: 5 },
    ],
    intradayActivity: [
        { time: '09:00', value: 30 },
        { time: '10:00', value: 65 },
        { time: '11:00', value: 85 },
        { time: '12:00', value: 92 },
        { time: '13:00', value: 40 }, // Lunch dip
        { time: '14:00', value: 88 },
        { time: '15:00', value: 95 },
        { time: '16:00', value: 80 },
        { time: '17:00', value: 60 },
    ]
};

export const employees = [
    { id: 1, name: 'John Doe', role: 'Senior Software Engineer', department: 'Engineering', status: 'online', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Jane Smith', role: 'Lead Product Manager', department: 'Product', status: 'idle', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Alex Johnson', role: 'Senior UI/UX Designer', department: 'Design', status: 'online', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Sarah Brown', role: 'DevOps Specialist', department: 'Engineering', status: 'offline', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: 'Michael Lee', role: 'QA Automation Lead', department: 'Engineering', status: 'online', avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: 6, name: 'David Wilson', role: 'Frontend Architect', department: 'Engineering', status: 'online', avatar: 'https://i.pravatar.cc/150?u=6' },
    { id: 7, name: 'Emma Davis', role: 'Backend Developer', department: 'Engineering', status: 'idle', avatar: 'https://i.pravatar.cc/150?u=7' },
    { id: 8, name: 'James Miller', role: 'VP of Marketing', department: 'Marketing', status: 'online', avatar: 'https://i.pravatar.cc/150?u=8' },
    { id: 9, name: 'Olivia Taylor', role: 'Account Executive', department: 'Sales', status: 'online', avatar: 'https://i.pravatar.cc/150?u=9' },
    { id: 10, name: 'Robert Moore', role: 'HR Director', department: 'Human Resources', status: 'offline', avatar: 'https://i.pravatar.cc/150?u=10' },
    { id: 11, name: 'Sophia White', role: 'Data Scientist', department: 'Engineering', status: 'online', avatar: 'https://i.pravatar.cc/150?u=12' },
    { id: 12, name: 'Liam Garcia', role: 'System Administrator', department: 'IT Operations', status: 'idle', avatar: 'https://i.pravatar.cc/150?u=13' },
    { id: 13, name: 'Isabella Chen', role: 'Content Strategist', department: 'Product', status: 'online', avatar: 'https://i.pravatar.cc/150?u=14' },
    { id: 14, name: 'Ethan Hunt', role: 'Security Analyst', department: 'IT Operations', status: 'offline', avatar: 'https://i.pravatar.cc/150?u=15' },
    { id: 15, name: 'Mia Wong', role: 'Customer Success', department: 'Support', status: 'online', avatar: 'https://i.pravatar.cc/150?u=16' },
    { id: 16, name: 'Noah Adams', role: 'Full Stack Dev', department: 'Engineering', status: 'online', avatar: 'https://i.pravatar.cc/150?u=17' },
    { id: 17, name: 'Ava Martinez', role: 'UI Designer', department: 'Design', status: 'online', avatar: 'https://i.pravatar.cc/150?u=18' },
    { id: 18, name: 'William Clark', role: 'Cloud Architect', department: 'Engineering', status: 'idle', avatar: 'https://i.pravatar.cc/150?u=19' },
    { id: 19, name: 'Charlotte King', role: 'Product Analyst', department: 'Product', status: 'online', avatar: 'https://i.pravatar.cc/150?u=20' },
    { id: 20, name: 'Lucas Scott', role: 'Sales Manager', department: 'Sales', status: 'online', avatar: 'https://i.pravatar.cc/150?u=21' },
    { id: 21, name: 'Amelia Young', role: 'HR Coordinator', department: 'Human Resources', status: 'offline', avatar: 'https://i.pravatar.cc/150?u=22' },
    { id: 22, name: 'Benjamin Hall', role: 'Network Engineer', department: 'IT Operations', status: 'online', avatar: 'https://i.pravatar.cc/150?u=23' },
    { id: 23, name: 'Evelyn Wright', role: 'Social Media Lead', department: 'Marketing', status: 'online', avatar: 'https://i.pravatar.cc/150?u=24' },
    { id: 24, name: 'Oliver Baker', role: 'Support Lead', department: 'Support', status: 'idle', avatar: 'https://i.pravatar.cc/150?u=25' },
    { id: 25, name: 'Abigail Perez', role: 'Mobile Dev', department: 'Engineering', status: 'online', avatar: 'https://i.pravatar.cc/150?u=26' }
];

export const activities = [
    { id: 1, employeeId: 1, activity: 'Started working on Task #102', time: '10:00 AM', duration: '2h 15m' },
    { id: 2, employeeId: 2, activity: 'Meeting with Client', time: '11:30 AM', duration: '1h 00m' },
    { id: 3, employeeId: 3, activity: 'Design Review', time: '01:00 PM', duration: '45m' },
    { id: 4, employeeId: 1, activity: 'Code Refactoring', time: '02:30 PM', duration: '1h 30m' },
];

export const topApps = [
    { name: 'Visual Studio Code', time: '4h 30m', category: 'Development', percent: 45, color: 'text-blue-500', icon: 'Monitor' },
    { name: 'Figma', time: '2h 20m', category: 'Design', percent: 25, color: 'text-pink-500', icon: 'Layout' },
    { name: 'Slack', time: '1h 15m', category: 'Communication', percent: 20, color: 'text-purple-500', icon: 'Zap' },
    { name: 'Postman', time: '1h 05m', category: 'Development', percent: 12, color: 'text-orange-500', icon: 'Shield' },
    { name: 'Discord', time: '45m', category: 'Communication', percent: 8, color: 'text-indigo-500', icon: 'Smartphone' },
    { name: 'Docker Desktop', time: '30m', category: 'Development', percent: 5, color: 'text-blue-600', icon: 'Monitor' },
    { name: 'Zoom', time: '1h 30m', category: 'Communication', percent: 15, color: 'text-blue-400', icon: 'Monitor' },
    { name: 'Notion', time: '2h 10m', category: 'Productivity', percent: 18, color: 'text-slate-700', icon: 'Layout' },
];

export const topWebsites = [
    { name: 'github.com', time: '3h 15m', category: 'Development', percent: 38, color: 'text-slate-900', icon: 'Globe' },
    { name: 'stackoverflow.com', time: '1h 45m', category: 'Development', percent: 22, color: 'text-orange-600', icon: 'Globe' },
    { name: 'notion.so', time: '2h 10m', category: 'Productivity', percent: 18, color: 'text-slate-700', icon: 'Globe' },
    { name: 'gmail.com', time: '55m', category: 'Communication', percent: 12, color: 'text-red-500', icon: 'Globe' },
    { name: 'jira.com', time: '1h 20m', category: 'Management', percent: 15, color: 'text-blue-600', icon: 'Globe' },
    { name: 'linkedin.com', time: '30m', category: 'Browsing', percent: 5, color: 'text-sky-700', icon: 'Globe' },
    { name: 'medium.com', time: '45m', category: 'Browsing', percent: 8, color: 'text-black', icon: 'Globe' },
    { name: 'youtube.com', time: '1h 05m', category: 'Entertainment', percent: 10, color: 'text-red-600', icon: 'Globe' },
];

export const screenshots = [
    { id: 1, employeeId: 1, time: '10:15 AM', url: 'https://picsum.photos/seed/1/400/225', blurred: false },
    { id: 2, employeeId: 1, time: '10:30 AM', url: 'https://picsum.photos/seed/2/400/225', blurred: false },
    { id: 3, employeeId: 1, time: '10:45 AM', url: 'https://picsum.photos/seed/3/400/225', blurred: true },
    { id: 4, employeeId: 2, time: '11:00 AM', url: 'https://picsum.photos/seed/4/400/225', blurred: false },
];

export const tasks = [
    { id: 1, title: 'Fix Layout Bugs', project: 'Admin Dashboard', status: 'In Progress', progress: 65, employee: 'John Doe' },
    { id: 2, title: 'API Integration', project: 'Mobile App', status: 'To Do', progress: 0, employee: 'Jane Smith' },
    { id: 3, title: 'Database Migration', project: 'Core API', status: 'Completed', progress: 100, employee: 'Sarah Brown' },
];

export const attendanceData = [
    { id: 1, date: '2026-02-01', status: 'holiday', type: 'Public Holiday', name: 'New Year (Observed)' },
    { id: 2, date: '2026-02-02', status: 'present', checkIn: '08:55 AM', checkOut: '06:05 PM', shift: 'Day Shift' },
    { id: 3, date: '2026-02-03', status: 'present', checkIn: '09:15 AM', checkOut: '06:10 PM', shift: 'Day Shift', late: true },
    { id: 4, date: '2026-02-04', status: 'present', checkIn: '09:00 AM', checkOut: '05:45 PM', shift: 'Day Shift', earlyLeave: true },
    { id: 5, date: '2026-02-05', status: 'leave', type: 'Sick Leave', statusText: 'Approved' },
    { id: 6, date: '2026-02-06', status: 'present', checkIn: '09:05 AM', checkOut: '06:00 PM', shift: 'Day Shift' },
    { id: 7, date: '2026-02-07', status: 'holiday', type: 'Public Holiday', name: 'Weekend' },
    { id: 8, date: '2026-02-08', status: 'holiday', type: 'Public Holiday', name: 'Weekend' },
    { id: 9, date: '2026-02-09', status: 'present', checkIn: '08:50 AM', checkOut: '06:15 PM', shift: 'Day Shift' },
    { id: 10, date: '2026-02-10', status: 'present', checkIn: '09:02 AM', checkOut: '06:00 PM', shift: 'Day Shift' },
];

export const shifts = [
    { id: 1, name: 'Day Shift', time: '09:00 AM - 06:00 PM', color: 'bg-blue-500' },
    { id: 2, name: 'Evening Shift', time: '02:00 PM - 11:00 PM', color: 'bg-purple-500' },
    { id: 3, name: 'Night Shift', time: '10:00 PM - 07:00 AM', color: 'bg-slate-700' },
];

export const leaveSummary = {
    total: 24,
    used: 8,
    pending: 2,
    available: 14,
};

export const locations = [
    { id: 1, employeeId: 1, name: 'John Doe', lat: 40.7128, lng: -74.0060, status: 'moving', lastSync: '2m ago', address: 'Broadway, New York, NY' },
    { id: 2, employeeId: 2, name: 'Jane Smith', lat: 40.7580, lng: -73.9855, status: 'stationary', lastSync: '5m ago', address: 'Times Square, New York, NY' },
    { id: 3, employeeId: 3, name: 'Alex Johnson', lat: 40.7484, lng: -73.9857, status: 'moving', lastSync: '1m ago', address: 'Empire State Building, NY' },
];

export const routeHistory = [
    { id: 1, time: '09:00 AM', lat: 40.7128, lng: -74.0060, speed: '12mph' },
    { id: 2, time: '09:15 AM', lat: 40.7200, lng: -74.0000, speed: '15mph' },
    { id: 3, time: '09:30 AM', lat: 40.7300, lng: -73.9900, speed: '8mph' },
    { id: 4, time: '09:45 AM', lat: 40.7400, lng: -73.9800, speed: '0mph' },
];

export const geofences = [
    { id: 1, name: 'Headquarters', radius: '500m', status: 'Active', color: 'border-blue-500 bg-blue-500/10' },
    { id: 2, name: 'Client Site A', radius: '200m', status: 'Active', color: 'border-purple-500 bg-purple-500/10' },
    { id: 3, name: 'Warehouse Beta', radius: '1km', status: 'Inactive', color: 'border-slate-500 bg-slate-500/10' },
];

export const travelStats = {
    totalDistance: '42.5 km',
    avgSpeed: '18 km/h',
    topSpeed: '45 km/h',
    totalTrips: 12,
};

export const projects = [
    { id: 1, name: 'Cloud Migration', client: 'Alpha Corp', progress: 75, status: 'On Track', color: 'bg-blue-500' },
    { id: 2, name: 'Mobile App Revamp', client: 'Beta Systems', progress: 40, status: 'At Risk', color: 'bg-amber-500' },
    { id: 3, name: 'Internal Audit UI', client: 'Internal', progress: 95, status: 'Completed', color: 'bg-emerald-500' },
];

export const detailedTasks = [
    { id: 1, title: 'Database Schema Design', project: 'Cloud Migration', priority: 'High', assignee: 'John Doe', status: 'Completed', timeSpent: '12h 30m', dueDate: '2026-02-10' },
    { id: 2, title: 'API Authentication Layer', project: 'Cloud Migration', priority: 'High', assignee: 'Jane Smith', status: 'In Progress', timeSpent: '8h 15m', dueDate: '2026-02-15' },
    { id: 3, title: 'UI Mockups for Dashboard', project: 'Mobile App Revamp', priority: 'Medium', assignee: 'Alex Johnson', status: 'In Progress', timeSpent: '15h 45m', dueDate: '2026-02-20' },
    { id: 4, title: 'Bug Fix: Login Loop', project: 'Internal Audit UI', priority: 'Critical', assignee: 'Sarah Brown', status: 'Completed', timeSpent: '4h 20m', dueDate: '2026-02-08' },
];

export const workLogs = [
    { id: 101, date: '2026-02-13', task: 'API Authentication Layer', employee: 'Jane Smith', duration: '4h 30m', description: 'Implemented JWT token rotation and added middleware.' },
    { id: 102, date: '2026-02-13', task: 'UI Mockups for Dashboard', employee: 'Alex Johnson', duration: '6h 00m', description: 'Completed high-fidelity mockups for the main tracking dashboard.' },
    { id: 103, date: '2026-02-12', task: 'Database Schema Design', employee: 'John Doe', duration: '5h 15m', description: 'Finalized the relational mapping for employee geolocation logs.' },
];

export const performanceKPIs = [
    { id: 1, employee: 'John Doe', reliability: 98, timeliness: 95, productivity: 92, overall: 95 },
    { id: 2, employee: 'Jane Smith', reliability: 94, timeliness: 90, productivity: 96, overall: 93 },
    { id: 3, employee: 'Alex Johnson', reliability: 88, timeliness: 85, productivity: 90, overall: 87 },
];

export const projectProductivity = [
    { name: 'Cloud Migration', timeSpent: 120, productivityScore: 92 },
    { name: 'Mobile App Revamp', timeSpent: 85, productivityScore: 78 },
    { name: 'Internal Audit UI', timeSpent: 45, productivityScore: 96 },
];

export const teamTimeReports = [
    { team: 'Engineering', active: 45, totalHours: '1,840h', productivity: 92 },
    { team: 'Product', active: 12, totalHours: '480h', productivity: 88 },
    { team: 'Design', active: 8, totalHours: '320h', productivity: 94 },
    { team: 'Marketing', active: 15, totalHours: '600h', productivity: 82 },
];

export const appUsageDetails = [
    { name: 'VS Code', users: 42, time: '240h', trend: '+12%', category: 'Development' },
    { name: 'Slack', users: 120, time: '180h', trend: '+5%', category: 'Communication' },
    { name: 'Figma', users: 15, time: '95h', trend: '-2%', category: 'Design' },
    { name: 'GitHub', users: 50, time: '110h', trend: '+8%', category: 'Development' },
    { name: 'Zoom', users: 85, time: '130h', trend: '+15%', category: 'Communication' },
];

export const payrollTimesheets = [
    { id: 1, employee: 'John Doe', period: 'Feb 1 - Feb 15', totalHours: 80, overTime: 4, grossPay: '$4,200', status: 'Ready' },
    { id: 2, employee: 'Jane Smith', period: 'Feb 1 - Feb 15', totalHours: 78, overTime: 0, grossPay: '$3,800', status: 'Pending' },
    { id: 3, employee: 'Alex Johnson', period: 'Feb 1 - Feb 15', totalHours: 82, overTime: 6, grossPay: '$4,500', status: 'Ready' },
];

export const heatmapData = [
    { hour: '12am', Mon: 5, Tue: 2, Wed: 3, Thu: 4, Fri: 2, Sat: 0, Sun: 0 },
    { hour: '4am', Mon: 2, Tue: 1, Wed: 2, Thu: 3, Fri: 1, Sat: 0, Sun: 0 },
    { hour: '8am', Mon: 45, Tue: 50, Wed: 48, Thu: 52, Fri: 40, Sat: 10, Sun: 5 },
    { hour: '10am', Mon: 92, Tue: 95, Wed: 94, Thu: 96, Fri: 88, Sat: 15, Sun: 8 },
    { hour: '12pm', Mon: 80, Tue: 82, Wed: 78, Thu: 85, Fri: 75, Sat: 12, Sun: 10 },
    { hour: '2pm', Mon: 94, Tue: 98, Wed: 96, Thu: 97, Fri: 92, Sat: 18, Sun: 12 },
    { hour: '4pm', Mon: 88, Tue: 90, Wed: 89, Thu: 92, Fri: 85, Sat: 10, Sun: 8 },
    { hour: '6pm', Mon: 60, Tue: 55, Wed: 58, Thu: 62, Fri: 50, Sat: 8, Sun: 5 },
    { hour: '10pm', Mon: 15, Tue: 12, Wed: 18, Thu: 20, Fri: 15, Sat: 5, Sun: 2 },
];

export const notifications = [
    {
        id: 1,
        title: 'High Activity Detected',
        description: 'John Doe has exceeded 90% activity threshold in the last hour. This might indicate unauthorized browsing or high manual data entry.',
        time: '2 mins ago',
        date: 'Feb 13, 2026',
        type: 'alert',
        unread: true,
        category: 'Monitoring'
    },
    {
        id: 2,
        title: 'Payroll Generated Successfully',
        description: 'Monthly payroll for January 2026 has been processed for all 45 employees. You can now download the reports from the Payroll section.',
        time: '1 hour ago',
        date: 'Feb 13, 2026',
        type: 'success',
        unread: true,
        category: 'Finance'
    },
    {
        id: 3,
        title: 'New Policy Update',
        description: 'The standard attendance policy has been updated. All managers are required to review the new overtime calculation rules.',
        time: '3 hours ago',
        date: 'Feb 13, 2026',
        type: 'info',
        unread: false,
        category: 'Compliance'
    },
    {
        id: 4,
        title: 'System Maintenance Scheduled',
        description: 'Employee Management portal will be down for scheduled maintenance on Sunday, Feb 15, from 02:00 AM to 04:00 AM IST.',
        time: '5 hours ago',
        date: 'Feb 13, 2026',
        type: 'info',
        unread: true,
        category: 'System'
    },
    {
        id: 5,
        title: 'Multiple Login Failures',
        description: 'Unusual login attempts detected for account admin@company.com from IP 192.168.1.105.',
        time: 'Yesterday',
        date: 'Feb 12, 2026',
        type: 'alert',
        unread: false,
        category: 'Security'
    },
    {
        id: 6,
        title: 'Compliance Audit Completed',
        description: 'The quarterly compliance audit has been finalized with 100% adherence to regional labor laws.',
        time: 'Yesterday',
        date: 'Feb 12, 2026',
        type: 'success',
        unread: false,
        category: 'Compliance'
    }
];
