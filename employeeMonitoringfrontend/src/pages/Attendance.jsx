import React, { useState } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    AlertCircle,
    Plus,
    ChevronLeft,
    ChevronRight,
    Users,
    Fingerprint,
    CalendarCheck,
    Coffee,
    FileText,
    TrendingUp,
    MoreHorizontal,
    CheckCircle2,
    UserMinus,
    QrCode
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    Legend,
    PieChart,
    Pie,
    Cell,
    ComposedChart
} from 'recharts';
import { shifts, leaveSummary } from '../data/mockData';
import { useRealTime } from '../hooks/RealTimeContext';

const cn = (...inputs) => twMerge(clsx(inputs));

const StatCard = ({ title, value, icon: Icon, color, subValue, trend }) => (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md group">
        <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", color)}>
                <Icon size={22} />
            </div>
            {subValue && <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>{subValue}</span>}
        </div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
);

// Mock data for visualizations
const lateTrendData = [
    { day: 'Mon', count: 2 },
    { day: 'Tue', count: 5 },
    { day: 'Wed', count: 3 },
    { day: 'Thu', count: 1 },
    { day: 'Fri', count: 4 },
];

const shiftDistributionData = [
    { name: 'Morning', employees: 45, color: '#3b82f6' },
    { name: 'Evening', employees: 32, color: '#8b5cf6' },
    { name: 'Night', employees: 18, color: '#6366f1' },
];

export function Attendance() {
    const { attendance } = useRealTime();
    const [qrStatus, setQrStatus] = useState('idle'); // idle, active, checked-in
    const [isQrMinimized, setIsQrMinimized] = useState(false);
    const [view, setView] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date('2026-02-01'));
    const [currentMonth, setCurrentMonth] = useState('February 2026');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [syncEnabled, setSyncEnabled] = useState(true);
    const [alertEnabled, setAlertEnabled] = useState(true);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveType, setLeaveType] = useState('Annual Leave');
    const [leaveFilter, setLeaveFilter] = useState('ALL');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([
        { id: 1, name: 'John Doe', type: 'Sick Leave', range: 'Feb 18 - Feb 20', status: 'Approved', color: 'bg-emerald-50 text-emerald-600' },
        { id: 2, name: 'Jane Smith', type: 'Annual Leave', range: 'Mar 05 - Mar 12', status: 'Pending', color: 'bg-amber-50 text-amber-600' },
        { id: 3, name: 'Alex Johnson', type: 'Casual Leave', range: 'Feb 25', status: 'Pending', color: 'bg-amber-50 text-amber-600' },
        { id: 4, name: 'Sarah Brown', type: 'Sick Leave', range: 'Feb 14 - Feb 15', status: 'Rejected', color: 'bg-red-50 text-red-600' },
    ]);

    const employees = [
        { id: 1, name: 'John Doe', role: 'Software Engineer' },
        { id: 2, name: 'Jane Smith', role: 'Product Manager' },
        { id: 3, name: 'Alex Johnson', role: 'UI/UX Designer' },
        { id: 4, name: 'Sarah Brown', role: 'DevOps' },
        { id: 5, name: 'Michael Lee', role: 'QA Lead' }
    ];

    // Shift Logic State
    const [scheduleData, setScheduleData] = useState({});
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [publishStatus, setPublishStatus] = useState('');
    const [empSearch, setEmpSearch] = useState('');
    const [showEmpDropdown, setShowEmpDropdown] = useState(false);

    const [selectedDayReport, setSelectedDayReport] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleExport = async (type = 'Holiday') => {
        setIsExporting(true);
        setPublishStatus(`Compiling ${type} Data...`);

        // Logical Data Generation
        let csvContent = "data:text/csv;charset=utf-8,";
        if (type === 'Schedule') {
            csvContent += "Employee,Mon,Tue,Wed,Thu,Fri,Sat,Sun\n";
            employees.forEach(emp => {
                const row = [emp.name, ...(scheduleData[emp.id] || Array(7).fill('Draft'))].join(",");
                csvContent += row + "\n";
            });
        } else if (type === 'Holiday') {
            csvContent += "Date,Holiday Name,Type,Status\n";
            const holidays = [
                { date: 'Jan 01', name: 'New Year Day', type: 'Public', status: 'Mandatory' },
                { date: 'Jan 26', name: 'Republic Day', type: 'National', status: 'Mandatory' },
                // ... logic can append more
            ];
            holidays.forEach(h => { csvContent += `${h.date},${h.name},${h.type},${h.status}\n`; });
        } else {
            csvContent += "Report,Value\nTotal Employees,124\nAvg Punctuality,94.2%\nActive Shifts,Morning\n";
        }

        await new Promise(r => setTimeout(r, 1200));

        // Browser Download Trigger
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Kiaan_HR_${type}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExporting(false);
        setPublishStatus(`${type} Downloaded Successfully`);
        setTimeout(() => setPublishStatus(''), 3000);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setPublishStatus('Authenticating with Google...');
        await new Promise(r => setTimeout(r, 1000));
        setPublishStatus('Syncing 14 Events to Calendar...');
        await new Promise(r => setTimeout(r, 1500));
        setIsSyncing(false);
        setPublishStatus('Google Calendar Sync Complete');
        setTimeout(() => setPublishStatus(''), 3000);
    };

    const handleAutoAssign = () => {
        const newSchedule = {};
        employees.forEach(emp => {
            newSchedule[emp.id] = [0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                if (dayIdx === 6) return 'OFF'; // Sunday Logic
                const seed = (emp.id + dayIdx + Math.floor(Math.random() * 3)) % 3;
                return shifts[seed]?.name || 'Day Shift';
            });
        });
        setScheduleData(newSchedule);
        setIsPublished(false);
        setPublishStatus('');
    };

    const handlePublish = async () => {
        if (Object.keys(scheduleData).length === 0) {
            setSelectedDayReport({
                type: 'error',
                title: 'Schedule Error',
                message: 'No schedule to publish. Please assign shifts first.'
            });
            return;
        }

        setIsPublishing(true);
        const steps = [
            "Syncing with Attendance Server...",
            "Notifying 124 Employees via Mobile App...",
            "Sending Shift Emails...",
            "Finalizing Live Schedule..."
        ];

        for (const step of steps) {
            setPublishStatus(step);
            await new Promise(r => setTimeout(r, 600));
        }

        setIsPublishing(false);
        setIsPublished(true);
        setPublishStatus('Success! Schedule is now Live.');

        setTimeout(() => {
            setIsPublished(false);
            setPublishStatus('');
        }, 5000);
    };

    const cycleShift = (empId, dayIdx) => {
        if (isPublished || isPublishing) return;
        const current = scheduleData[empId] ? [...scheduleData[empId]] : Array(7).fill('OFF');
        const shiftOptions = ['Day Shift', 'Evening Shift', 'Night Shift', 'OFF'];
        const nextIdx = (shiftOptions.indexOf(current[dayIdx]) + 1) % shiftOptions.length;
        current[dayIdx] = shiftOptions[nextIdx];
        setScheduleData({ ...scheduleData, [empId]: current });
    };

    const handleUpdateStatus = (id, newStatus) => {
        setLeaveRequests(prev => prev.map(req => {
            if (req.id !== id) return req;
            let color = "bg-slate-50 text-slate-600";
            if (newStatus === 'Approved') color = "bg-emerald-50 text-emerald-600";
            if (newStatus === 'Rejected') color = "bg-red-50 text-red-600";
            if (newStatus === 'Pending') color = "bg-amber-50 text-amber-600";
            return { ...req, status: newStatus, color };
        }));
        setActiveMenuId(null);
    };

    const handleDeleteRequest = (id) => {
        setLeaveRequests(prev => prev.filter(req => req.id !== id));
        setActiveMenuId(null);
    };

    const filteredRequests = leaveRequests.filter(req =>
        leaveFilter === 'ALL' || req.status.toUpperCase() === leaveFilter
    );

    const handleSubmitLeave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const startDate = formData.get('startDate');
        const endDate = formData.get('endDate');

        const selectedEmp = employees.find(emp => emp.name.toLowerCase() === empSearch.toLowerCase()) || employees[0];

        const newRequest = {
            id: Date.now(),
            name: selectedEmp.name,
            type: leaveType,
            range: startDate === endDate ? startDate : `${startDate} - ${endDate}`,
            status: 'Approved', // Admins assign, so it's auto-approved
            color: 'bg-emerald-50 text-emerald-600'
        };

        setLeaveRequests([newRequest, ...leaveRequests]);
        setShowLeaveModal(false);
        setEmpSearch('');
    };

    const generateHeatmapData = () => {
        const weeks = 5;
        const days = 7;
        const data = [];
        for (let w = 0; w < weeks; w++) {
            for (let d = 0; d < days; d++) {
                const intensity = Math.floor(Math.random() * 4);
                data.push({ w, d, intensity });
            }
        }
        return data;
    };
    const heatmapData = generateHeatmapData();

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Attendance & Leave</h1>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">98% Presence</span>
                    </div>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Manage workforce presence, shifts, and time-off requests.</p>
                </div>
                <div className="flex gap-1 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
                    {['calendar', 'schedule', 'leave', 'holidays'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all capitalize whitespace-nowrap",
                                view === v
                                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            )}
                        >
                            {v === 'leave' ? 'Leave' : v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
                <StatCard title="Avg. Punctuality" value="94.2%" icon={Clock} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" subValue="+2.1%" trend="up" />
                <StatCard title="Late Arrivals" value="03" icon={AlertCircle} color="bg-amber-50 text-amber-600 dark:bg-amber-900/20" subValue="This Week" />
                <StatCard title="Leave Balance" value={leaveSummary.available} icon={CalendarCheck} color="bg-blue-50 text-blue-600 dark:bg-blue-900/20" subValue="Days Avg" />
                <StatCard title="Active Shift" value="Morning" icon={Coffee} color="bg-purple-50 text-purple-600 dark:bg-purple-900/20" subValue="ENDS 18:00" />
            </div>

            {/* Request Leave Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLeaveModal(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-slate-200 dark:border-slate-800 animate-scale-in">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Assign Leave</h3>
                                <p className="text-sm text-slate-500 font-medium">Record a leave for a workforce member.</p>
                            </div>
                            <button onClick={() => setShowLeaveModal(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <Plus size={20} className="text-slate-400 rotate-45" />
                            </button>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmitLeave}>
                            <div className="relative">
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Search Employee</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type name or role..."
                                        value={empSearch}
                                        onChange={(e) => { setEmpSearch(e.target.value); setShowEmpDropdown(true); }}
                                        onFocus={() => setShowEmpDropdown(true)}
                                        className="w-full p-4 pl-11 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                        required
                                    />
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>

                                {showEmpDropdown && empSearch && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowEmpDropdown(false)}></div>
                                        <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-scale-in">
                                            {employees
                                                .filter(emp =>
                                                    emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
                                                    emp.role.toLowerCase().includes(empSearch.toLowerCase())
                                                )
                                                .map(emp => (
                                                    <div
                                                        key={emp.id}
                                                        onClick={() => { setEmpSearch(emp.name); setShowEmpDropdown(false); }}
                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none"
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                                                            {emp.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{emp.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            {employees.filter(emp => emp.name.toLowerCase().includes(empSearch.toLowerCase()) || emp.role.toLowerCase().includes(empSearch.toLowerCase())).length === 0 && (
                                                <div className="p-6 text-center text-slate-400 italic text-sm">
                                                    No employee found
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Leave Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Annual Leave', 'Sick Leave', 'Casual Leave', 'Paternity'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setLeaveType(type)}
                                            className={cn(
                                                "p-3 rounded-xl border text-xs font-bold transition-all",
                                                leaveType === type
                                                    ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30"
                                                    : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Start Date</label>
                                    <input name="startDate" type="date" required className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">End Date</label>
                                    <input name="endDate" type="date" required className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Reason (Optional)</label>
                                <textarea
                                    name="reason"
                                    placeholder="Briefly describe why you are taking leave..."
                                    className="w-full p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none h-24 resize-none"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95">
                                Assign Leave
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {view === 'calendar' && (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 animate-fade-in">
                    {/* Main Calendar Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Attendance Heatmap & Calendar Combined */}
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold">Attendance Calendar</h3>
                                    <p className="text-sm text-slate-500">Daily presence overview</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
                                    <button
                                        onClick={() => {
                                            const d = new Date(currentDate);
                                            d.setMonth(d.getMonth() - 1);
                                            setCurrentDate(d);
                                            setCurrentMonth(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
                                        }}
                                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-sm font-bold w-32 text-center">{currentMonth}</span>
                                    <button
                                        onClick={() => {
                                            const d = new Date(currentDate);
                                            d.setMonth(d.getMonth() + 1);
                                            setCurrentDate(d);
                                            setCurrentMonth(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
                                        }}
                                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-px rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="bg-slate-50 dark:bg-slate-800/50 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                                {(() => {
                                    const year = currentDate.getFullYear();
                                    const month = currentDate.getMonth();
                                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                                    const firstDayOfMonth = new Date(year, month, 1).getDay();
                                    const today = new Date('2026-02-16'); // Hardcoded 'today' for demo logic transparency

                                    // Mock Holidays Data Map
                                    const holidaysMap = {
                                        '2026-02-15': { name: 'Maha Shivratri', type: 'Religious' },
                                        '2026-01-26': { name: 'Republic Day', type: 'National' },
                                        // Add more as needed matching the Holiday List
                                    };

                                    return [...Array(daysInMonth + firstDayOfMonth)].map((_, i) => {
                                        if (i < firstDayOfMonth) return <div key={`empty-${i}`} className="bg-white dark:bg-slate-900/50"></div>;

                                        const dayNum = i - firstDayOfMonth + 1;
                                        const currentDayDate = new Date(year, month, dayNum);
                                        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

                                        const isWeekend = currentDayDate.getDay() === 0; // Sunday
                                        const isHoliday = holidaysMap[dateString];
                                        const isFuture = currentDayDate > today;
                                        const isToday = currentDayDate.toDateString() === today.toDateString();

                                        // Mock Stats
                                        const totalEmployees = 124;
                                        const absent = (isWeekend || isHoliday || isFuture) ? 0 : Math.floor(Math.random() * 8);
                                        const late = (isWeekend || isHoliday || isFuture) ? 0 : Math.floor(Math.random() * 12);
                                        const present = (isWeekend || isHoliday || isFuture) ? 0 : totalEmployees - absent;

                                        return (
                                            <div
                                                key={dayNum}
                                                className={cn(
                                                    "min-h-[100px] p-2 transition-colors relative group border-t border-transparent cursor-pointer",
                                                    isToday ? "bg-blue-50/30 dark:bg-blue-900/10 ring-1 ring-inset ring-blue-500/20 z-10" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                )}
                                                onClick={() => !isWeekend && !isFuture && !isHoliday && setSelectedDayReport({
                                                    date: dateString,
                                                    present,
                                                    late,
                                                    absent,
                                                    total: totalEmployees
                                                })}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={cn(
                                                        "text-sm font-bold transition-colors mb-2 block",
                                                        isWeekend ? "text-red-300 opacity-50" :
                                                            isToday ? "text-blue-600 dark:text-blue-400 scale-110 origin-top-left" :
                                                                "text-slate-700 dark:text-slate-300"
                                                    )}>
                                                        {dayNum}
                                                    </span>
                                                    {isToday && <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">Today</span>}
                                                </div>

                                                {/* Logic Rendering */}
                                                {isHoliday ? (
                                                    <div className="mt-1 p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-900/30 text-center">
                                                        <p className="text-[10px] font-black uppercase text-pink-600 leading-tight mb-1">{isHoliday.name}</p>
                                                        <span className="text-[9px] font-bold text-pink-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{isHoliday.type}</span>
                                                    </div>
                                                ) : isWeekend ? (
                                                    <div className="mt-4 flex justify-center opacity-20">
                                                        <Coffee size={24} className="text-slate-400" />
                                                    </div>
                                                ) : isFuture && !isToday ? (
                                                    <div className="mt-4 flex flex-col items-center opacity-40">
                                                        <div className="h-1.5 w-12 bg-slate-100 dark:bg-slate-800 rounded-full mb-1 border border-slate-200 border-dashed"></div>
                                                        <div className="h-1.5 w-8 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 border-dashed"></div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5 animation-fade-in">
                                                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                                                            <span>Present</span>
                                                            <span className="text-emerald-600">{present}</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(present / totalEmployees) * 100}%` }}></div>
                                                        </div>

                                                        {(late > 0 || absent > 0) && (
                                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                                {late > 0 && <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[8px] font-black uppercase">{late} Late</span>}
                                                                {absent > 0 && <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[8px] font-black uppercase">{absent} Off</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Late Arrivals Trend */}
                        {/* Late Arrivals vs Overtime Correlation */}
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold">Punctuality vs. Effort</h3>
                                    <p className="text-sm text-slate-500">Late arrivals compared to overtime hours</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400">Late Count</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400">Avg Overtime (Hrs)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={[
                                        { day: 'Mon', late: 12, overtime: 1.5 },
                                        { day: 'Tue', late: 8, overtime: 2.2 },
                                        { day: 'Wed', late: 5, overtime: 3.0 },
                                        { day: 'Thu', late: 9, overtime: 1.8 },
                                        { day: 'Fri', late: 15, overtime: 0.5 },
                                        { day: 'Sat', late: 4, overtime: 4.5 },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" fontWeight={600} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="late" barSize={12} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        <Line type="monotone" dataKey="overtime" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats & Controls */}
                    <div className="space-y-6">
                        {/* Rules Card */}
                        <div className="rounded-[2rem] border border-slate-200 bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                            <h3 className="text-lg font-bold mb-6 relative z-10">Automation Rules</h3>
                            <div className="space-y-4 relative z-10">
                                {/* QR Scan Attendance Card */}
                                <div className="flex flex-row items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 relative overflow-hidden group/qr hover:bg-slate-800/80 transition-colors">
                                    {/* Abstract Background Glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                                    {/* Left: QR Display Box */}
                                    <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-xl bg-white shadow-sm relative overflow-hidden group-hover/qr:scale-105 transition-transform duration-300">
                                        {qrStatus === 'active' ? (
                                            <div className="relative w-full h-full flex items-center justify-center p-2">
                                                <img
                                                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KiaanAttendanceID_12345&bgcolor=ffffff&color=0f172a"
                                                    alt="QR Code"
                                                    className="w-full h-full object-contain animate-fade-in"
                                                />
                                                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 blur-[1px] animate-[scan_1.5s_linear_infinite]"></div>
                                            </div>
                                        ) : qrStatus === 'checked-in' ? (
                                            <CheckCircle2 size={28} className="text-emerald-500" />
                                        ) : (
                                            <QrCode size={28} className="text-slate-300" />
                                        )}
                                    </div>

                                    {/* Middle: Content */}
                                    <div className="flex-1 min-w-0 z-10 w-full">
                                        <h4 className="text-[11px] font-black uppercase tracking-wide text-white mb-1 leading-tight break-words">Smart QR Attendance</h4>

                                        <div className="flex items-center gap-1.5 h-4">
                                            {qrStatus !== 'idle' ? (
                                                <>
                                                    <span className={cn("h-1.5 w-1.5 rounded-full block",
                                                        qrStatus === 'active' ? "bg-blue-500 animate-pulse" :
                                                            "bg-emerald-500"
                                                    )}></span>
                                                    <span className={cn("text-[9px] font-bold uppercase tracking-wider block",
                                                        qrStatus === 'active' ? "text-blue-400" :
                                                            "text-emerald-400"
                                                    )}>
                                                        {qrStatus === 'active' ? 'Active' : 'Checked In'}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Scan to mark attendance</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-col gap-1 z-10">
                                        {qrStatus === 'idle' && (
                                            <button
                                                onClick={() => setQrStatus('active')}
                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                                            >
                                                Start QR
                                            </button>
                                        )}

                                        {qrStatus === 'active' && (
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => {
                                                        setQrStatus('checked-in');
                                                        setIsQrMinimized(false);
                                                        setSelectedDayReport({
                                                            type: 'success',
                                                            title: 'Attendance Marked',
                                                            message: 'Your attendance has been recorded successfully.'
                                                        });
                                                    }}
                                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
                                                >
                                                    Simulate
                                                </button>
                                                <button
                                                    onClick={() => setIsQrMinimized(!isQrMinimized)}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap"
                                                >
                                                    {isQrMinimized ? 'Open QR' : 'Minimize'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setQrStatus('idle');
                                                        setIsQrMinimized(false);
                                                    }}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap border border-white/5"
                                                >
                                                    End
                                                </button>
                                            </div>
                                        )}

                                        {qrStatus === 'checked-in' && (
                                            <button
                                                onClick={() => setQrStatus('idle')}
                                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div
                                    onClick={() => setAlertEnabled(!alertEnabled)}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/5 group/rule"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 transition-transform group-hover/rule:scale-110">
                                            <AlertCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide opacity-70">Late Warning</p>
                                            <p className="text-sm font-bold">Alert After 15m</p>
                                        </div>
                                    </div>
                                    <button
                                        className={cn(
                                            "relative h-5 w-10 rounded-full transition-colors duration-300",
                                            alertEnabled ? "bg-emerald-500" : "bg-slate-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                                            alertEnabled ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Shift Distribution */}
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                            <h3 className="text-lg font-bold mb-4">Shift Distribution</h3>
                            <div className="space-y-4">
                                {shiftDistributionData.map((shift, idx) => (
                                    <div key={shift.name} className="relative">
                                        <div className="flex justify-between text-sm font-bold mb-1">
                                            <span className="text-slate-700 dark:text-slate-300">{shift.name}</span>
                                            <span className="text-slate-500">{shift.employees} Empl.</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${(shift.employees / 100) * 100}%`, backgroundColor: shift.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setView('schedule')}
                                className="w-full mt-6 py-3 rounded-xl border-2 border-slate-100 hover:border-primary-500 hover:text-primary-600 font-bold text-sm text-slate-500 transition-all"
                            >
                                Manage Shifts
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Functional Advanced Scheduling View */}
            {view === 'schedule' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Admin Interactive Hint */}
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 dark:bg-blue-400/5 dark:border-blue-400/10 animate-fade-in group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                            <div className="relative h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Fingerprint size={18} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-0.5">Admin Insight</p>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                <span className="text-blue-600 dark:text-blue-400">Pro-Tip:</span> Click any shift cell to cycle through <span className="italic font-black">Day → Evening → Night → OFF</span>. Publish once finalized.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Weekly Shift Planner</h3>
                            <p className="text-sm text-slate-500 font-medium">Feb 16 - Feb 22, 2026</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {publishStatus && (
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
                                    <div className={cn("h-1.5 w-1.5 rounded-full", isPublishing ? "bg-primary-500 animate-ping" : "bg-emerald-500")}></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{publishStatus}</span>
                                </div>
                            )}
                            <button
                                onClick={handleAutoAssign}
                                disabled={isPublishing}
                                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-primary-500 hover:text-primary-600 transition-all bg-white dark:bg-slate-900 shadow-sm disabled:opacity-50"
                            >
                                Auto-Assign
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className={cn(
                                    "px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-70",
                                    isPublished
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20"
                                )}
                            >
                                {isPublishing ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : isPublished ? (
                                    <CheckCircle2 size={16} />
                                ) : null}
                                {isPublishing ? "Publishing..." : isPublished ? "Published To All" : "Publish Schedule"}
                            </button>
                        </div>
                    </div>

                    {/* Logic Tip */}
                    {isPublished && (
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-3 animate-slide-up">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600">
                                <FileText size={18} />
                            </div>
                            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                                <span className="font-bold">Dispatch Complete:</span> Schedule is now visible on all employee mobile portals and synced with the Biometric Clocking system.
                            </p>
                        </div>
                    )}

                    <div className="rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/50 p-6 text-left border-b border-slate-100 dark:border-slate-700 w-[250px]">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                                <Users size={14} /> Employee
                                            </div>
                                        </th>
                                        {['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Sun 22'].map(day => (
                                            <th key={day} className="p-6 text-center border-b border-slate-100 dark:border-slate-700 min-w-[140px]">
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{day}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {employees.map(emp => (
                                        <tr key={emp.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="sticky left-0 z-20 bg-white dark:bg-slate-900 p-6 border-r border-slate-100 dark:border-slate-800 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 min-w-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 overflow-hidden ring-2 ring-white dark:ring-slate-900">
                                                        <img src={`https://i.pravatar.cc/150?u=${emp.id}`} alt="" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{emp.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">{emp.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                                                const shiftName = scheduleData[emp.id]?.[dayIdx] || 'Draft';
                                                const shift = shifts.find(s => s.name === shiftName);
                                                const isOff = shiftName === 'OFF';
                                                const isDraft = shiftName === 'Draft';

                                                return (
                                                    <td key={dayIdx} className="p-4 text-center">
                                                        <div
                                                            className={cn(
                                                                "h-14 rounded-2xl p-3 flex flex-col justify-center gap-1 cursor-pointer transition-all border border-transparent active:scale-95 group/cell",
                                                                isDraft ? "bg-slate-50 border-dashed border-slate-200 text-slate-300" :
                                                                    isOff ? "bg-slate-100 text-slate-400 dark:bg-slate-800/50" :
                                                                        shiftName === 'Day Shift' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:border-blue-200" :
                                                                            shiftName === 'Evening Shift' ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:border-purple-200" :
                                                                                "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:border-indigo-200",
                                                                !isPublished && "hover:scale-105 hover:shadow-lg"
                                                            )}
                                                            onClick={() => cycleShift(emp.id, dayIdx)}
                                                        >
                                                            {!isDraft && !isOff && (
                                                                <>
                                                                    <p className="text-[10px] font-black uppercase leading-none">{shiftName.split(' ')[0]}</p>
                                                                    <p className="text-[9px] font-bold opacity-70 leading-none">{shift?.time.split(' - ')[0] || '--:--'}</p>
                                                                </>
                                                            )}
                                                            {isOff && <p className="text-[10px] font-black uppercase">OFF</p>}
                                                            {isDraft && <p className="text-[9px] font-black opacity-40">CHOOSE</p>}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-4 animate-slide-up">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Conflict Check Clean</h4>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 font-medium">No overlapping shifts or policy violations detected for next week.</p>
                            </div>
                        </div>

                        <div className="md:col-span-2 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold">Export Schedule</h4>
                                    <p className="text-xs text-slate-500 font-medium">Download as PDF or CSV for team notices.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleExport('Schedule')}
                                    disabled={isExporting}
                                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isExporting ? <div className="h-4 w-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin"></div> : <FileText size={18} />}
                                </button>
                                <button
                                    onClick={() => handleExport('Analytics')}
                                    disabled={isExporting}
                                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isExporting ? <div className="h-4 w-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin"></div> : <TrendingUp size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Functional Leave Management View */}
            {view === 'leave' && (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-4 animate-fade-in">
                    {/* Leave Balances Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <h3 className="text-lg font-bold">Workforce Overview</h3>
                                <Users className="text-slate-400" size={20} />
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:border-slate-300 transition-all">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">On Leave Today</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">06 <span className="text-sm font-bold text-slate-400">/ 124</span></p>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary-600 transition-colors">
                                        <UserMinus size={20} />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-center justify-between group cursor-pointer hover:border-amber-300 transition-all" onClick={() => setLeaveFilter('PENDING')}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-amber-600/70 mb-1">Pending Requests</p>
                                        <p className="text-2xl font-black text-amber-700 dark:text-amber-500">04 <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-md ml-1">ACTION</span></p>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-white/50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                        <AlertCircle size={20} />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] font-black uppercase text-blue-600/70">Scheduled (7 Days)</p>
                                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">12 Upcoming</span>
                                    </div>
                                    <div className="flex -space-x-2 overflow-hidden py-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <img key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900" src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="" />
                                        ))}
                                        <div className="h-6 w-6 rounded-full bg-blue-200 text-blue-800 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[9px] font-bold">+7</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowLeaveModal(true)}
                                className="w-full mt-6 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Assign Leave
                            </button>
                        </div>
                    </div>

                    {/* Leave Requests Table */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold">Recent Requests</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setLeaveFilter('ALL')}
                                        className={cn(
                                            "px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all",
                                            leaveFilter === 'ALL'
                                                ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                                                : "border border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setLeaveFilter('PENDING')}
                                        className={cn(
                                            "px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all",
                                            leaveFilter === 'PENDING'
                                                ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                                                : "border border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        Pending
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left bg-slate-50/50 dark:bg-slate-800/30">
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Dates</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                            <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {filteredRequests.map(req => (
                                            <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden ring-1 ring-slate-100">
                                                            <img src={`https://i.pravatar.cc/150?u=${req.id}`} alt="" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{req.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs font-bold text-slate-500">{req.type}</td>
                                                <td className="p-4 text-xs font-bold text-slate-900 dark:text-white">{req.range}</td>
                                                <td className="p-4">
                                                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", req.color)}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right relative">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === req.id ? null : req.id); }}
                                                        className="p-2 text-slate-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>

                                                    {activeMenuId === req.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                                                            <div className="absolute right-4 top-12 z-50 w-36 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 animate-scale-in">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(req.id, 'Approved')}
                                                                    className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                                                                    className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
                                                                <button
                                                                    onClick={() => handleDeleteRequest(req.id)}
                                                                    className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Functional Holiday Management View */}
            {view === 'holidays' && (
                <div className="space-y-6 animate-fade-in text-left">
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                        {/* Summary & Controls */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Holiday Calendar 2026</h3>
                                <p className="text-sm text-slate-500 mb-6">Overview of corporate and public holidays for the current fiscal year.</p>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Holidays</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">14 Days</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
                                        <p className="text-[10px] font-black uppercase text-primary-600 mb-1">Next Holiday In</p>
                                        <p className="text-2xl font-black text-primary-700 dark:text-primary-300">12 Days</p>
                                        <p className="text-xs font-bold text-primary-600 mt-1">Maha Shivratri (Observed)</p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <button
                                        onClick={() => handleExport('Holiday')}
                                        disabled={isExporting}
                                        className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isExporting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
                                        {isExporting ? 'Exporting...' : 'Export Holiday List'}
                                    </button>
                                    <button
                                        onClick={handleSync}
                                        disabled={isSyncing}
                                        className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSyncing ? <div className="h-4 w-4 border-2 border-slate-600/30 border-t-slate-600 rounded-full animate-spin"></div> : null}
                                        {isSyncing ? 'Syncing...' : 'Sync with Google Cal'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Holiday List Grid */}
                        <div className="lg:col-span-2 space-y-4">
                            {[
                                { date: 'Jan 01', name: 'New Year Day', type: 'Public', status: 'Mandatory', color: 'bg-emerald-500' },
                                { date: 'Jan 14', name: 'Makar Sankranti', type: 'Public', status: 'Optional', color: 'bg-orange-500' },
                                { date: 'Jan 26', name: 'Republic Day', type: 'National', status: 'Mandatory', color: 'bg-primary-500' },
                                { date: 'Feb 15', name: 'Maha Shivratri', type: 'Religious', status: 'Mandatory', color: 'bg-indigo-500' },
                                { date: 'Mar 04', name: 'Holi Festival', type: 'Religious', status: 'Mandatory', color: 'bg-pink-500' },
                                { date: 'Mar 20', name: 'Eid ul-Fitr', type: 'Religious', status: 'Mandatory', color: 'bg-emerald-500' },
                                { date: 'Apr 03', name: 'Good Friday', type: 'Religious', status: 'Optional', color: 'bg-slate-400' },
                                { date: 'Apr 14', name: 'Dr. Ambedkar Jayanti', type: 'National', status: 'Mandatory', color: 'bg-blue-500' },
                                { date: 'Aug 15', name: 'Independence Day', type: 'National', status: 'Mandatory', color: 'bg-orange-500' },
                                { date: 'Sep 15', name: 'Ganesh Chaturthi', type: 'Religious', status: 'Optional', color: 'bg-amber-500' },
                                { date: 'Oct 02', name: 'Gandhi Jayanti', type: 'National', status: 'Mandatory', color: 'bg-slate-600' },
                                { date: 'Oct 20', name: 'Dussehra', type: 'Religious', status: 'Mandatory', color: 'bg-red-500' },
                                { date: 'Nov 08', name: 'Diwali', type: 'Religious', status: 'Mandatory', color: 'bg-amber-500' },
                                { date: 'Dec 25', name: 'Christmas', type: 'Religious', status: 'Optional', color: 'bg-slate-400' },
                            ].map((holiday, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-[1.5rem] bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all group animate-slide-up"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <span className="text-[10px] font-black uppercase text-slate-400">{holiday.date.split(' ')[0]}</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{holiday.date.split(' ')[1]}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{holiday.name}</h4>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{holiday.type}</span>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                                                    holiday.status === 'Mandatory' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {holiday.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="h-8 w-8 rounded-full flex items-center justify-center text-slate-300 hover:text-primary-600 transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Large QR Session Overlay */}
            {qrStatus === 'active' && !isQrMinimized && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" />

                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-6 flex flex-col items-center animate-scale-in border border-white/20">
                        {/* Header Section */}
                        <div className="text-center mb-5">
                            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Scanning Active</h2>
                            <p className="text-blue-600 font-bold text-[10px] uppercase tracking-wider">Employee Portal Ready</p>
                        </div>

                        {/* QR Code Card */}
                        <div className="relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 p-4 mb-4">
                            {/* Scanning Animation */}
                            <div className="absolute inset-x-4 top-4 z-10 pointer-events-none">
                                <div className="w-full h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] blur-[1px] animate-[scan_2s_linear_infinite]" />
                            </div>

                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KiaanAttendanceID_12345&bgcolor=f8fafc&color=0f172a"
                                alt="Large QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Instructions */}
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-6 text-center">
                            Scan this code to confirm presence
                        </p>

                        {/* Integrated Controls */}
                        <div className="w-full space-y-2">
                            <button
                                onClick={() => {
                                    setQrStatus('checked-in');
                                    setSelectedDayReport({
                                        type: 'success',
                                        title: 'Attendance Marked',
                                        message: 'Your attendance has been recorded successfully.'
                                    });
                                }}
                                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                            >
                                Simulate Scan
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setIsQrMinimized(true)}
                                    className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                                >
                                    Minimize
                                </button>
                                <button
                                    onClick={() => {
                                        setQrStatus('idle');
                                        setIsQrMinimized(false);
                                    }}
                                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all active:scale-[0.98]"
                                >
                                    Stop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Attendance Detail Modal */}
            {selectedDayReport && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedDayReport(null)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-slate-200 dark:border-slate-800 animate-scale-in">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-3 rounded-2xl",
                                    selectedDayReport.type === 'error' ? "bg-red-50 text-red-600 dark:bg-red-900/20" :
                                        selectedDayReport.type === 'success' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                                            "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                                )}>
                                    {selectedDayReport.type === 'error' ? <AlertCircle size={24} /> :
                                        selectedDayReport.type === 'success' ? <CheckCircle2 size={24} /> :
                                            <CalendarCheck size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        {selectedDayReport.title || (selectedDayReport.date && `Report: ${selectedDayReport.date}`) || 'Report'}
                                    </h3>
                                    {selectedDayReport.message ? (
                                        <p className="text-sm text-slate-500 font-medium">{selectedDayReport.message}</p>
                                    ) : (
                                        <p className="text-sm text-slate-500 font-medium">Daily workforce activity overview</p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedDayReport(null)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <Plus size={20} className="text-slate-400 rotate-45" />
                            </button>
                        </div>

                        {!selectedDayReport.message && (
                            <div className="space-y-6">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Attendance Rate</p>
                                            <p className="text-3xl font-black text-slate-900 dark:text-white">
                                                {Math.round((selectedDayReport.present / selectedDayReport.total) * 100)}%
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Force</p>
                                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{selectedDayReport.total}</p>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(selectedDayReport.present / selectedDayReport.total) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                                        <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Present</p>
                                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{selectedDayReport.present}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                                        <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Late Arrivals</p>
                                        <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{selectedDayReport.late}</p>
                                    </div>
                                    <div className="col-span-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-red-600 mb-1">Total Absences</p>
                                            <p className="text-2xl font-black text-red-700 dark:text-red-400">{selectedDayReport.absent}</p>
                                        </div>
                                        <AlertCircle className="text-red-300" size={24} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedDayReport(null)}
                            className="w-full mt-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 active:scale-95 transition-all"
                        >
                            Close Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
