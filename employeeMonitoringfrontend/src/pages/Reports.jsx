import React, { useState, useMemo, useEffect } from 'react';
import {
    FileText, Download, Filter, Calendar, PieChart as PieChartIcon,
    Clock, Users, Zap, Search, ChevronDown, ExternalLink,
    FileSpreadsheet, FileImage, LayoutDashboard, Shield,
    Briefcase, TrendingUp, Monitor, Globe, Smartphone, Activity, BarChart3, Database
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line, AreaChart, Area, PieChart, Pie
} from 'recharts';
import { useRealTime } from '../hooks/RealTimeContext';

const cn = (...inputs) => twMerge(clsx(inputs));

// --- Reusable Components ---

const ReportCard = ({ title, description, icon: Icon, onClick, onGenerate, color }) => (
    <div
        className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
    >
        <div onClick={onClick}>
            <div className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-[1rem] transition-colors group-hover:scale-110 shadow-sm", color)}>
                <Icon size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6 h-10">{description}</p>
        </div>
        <div
            onClick={(e) => { e.stopPropagation(); onGenerate(); }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity hover:text-indigo-700"
        >
            Generate Report <ExternalLink size={12} />
        </div>
    </div>
);

const HeatmapCell = ({ value }) => {
    let color = 'bg-slate-50 dark:bg-slate-800/50';
    if (value > 90) color = 'bg-indigo-600 text-white shadow-md shadow-indigo-200';
    else if (value > 70) color = 'bg-indigo-400 text-white';
    else if (value > 40) color = 'bg-indigo-200 text-indigo-900';
    else if (value > 10) color = 'bg-indigo-50 text-indigo-900/50';

    return (
        <div className={cn("h-10 w-full rounded-lg flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 cursor-help", color)}>
            {value > 0 ? value : ''}
        </div>
    );
};

// --- Main Component ---

export function Reports() {
    const {
        employees: realTimeEmployees,
        timeEntries,
        reportsOverview,
        fetchReportsOverview,
        activityStats,
        fetchActivityStats,
        isLoading,
        addNotification,
        notifications
    } = useRealTime();

    const [activeTab, setActiveTab] = useState('overview'); // overview, activity, attendance, timesheets, heatmap, generator
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Initial fetch for reports data
    useEffect(() => {
        if (!reportsOverview) fetchReportsOverview();
        fetchActivityStats(new Date());
    }, [reportsOverview, fetchReportsOverview, fetchActivityStats]);

    // --- Generator State ---
    const [reportConfig, setReportConfig] = useState({
        type: 'productivity',
        range: 'month',
        format: 'pdf',
        department: 'all',
        startDate: '',
        endDate: ''
    });

    // --- Derived Statistics ---

    const teamProductivityData = useMemo(() => {
        if (reportsOverview?.deptProductivity) {
            return reportsOverview.deptProductivity.map(d => ({
                name: d.department,
                value: Math.round(d.avgProductivity),
                active: d._count || 0
            }));
        }
        return [];
    }, [reportsOverview]);

    const productivityTrendData = useMemo(() => {
        return reportsOverview?.trend || [
            { name: 'Mon', productivity: 0 },
            { name: 'Tue', productivity: 0 },
            { name: 'Wed', productivity: 0 },
            { name: 'Thu', productivity: 0 },
            { name: 'Fri', productivity: 0 }
        ];
    }, [reportsOverview]);

    const topAppsData = useMemo(() => {
        return activityStats.apps.slice(0, 5).map(app => ({
            name: app.name,
            time: `${Math.round(app.usageSeconds / 60)}m`,
            percent: Math.min(100, Math.round((app.usageSeconds / 28800) * 100)), // relative to 8h
            color: 'text-blue-600'
        }));
    }, [activityStats.apps]);

    const topWebsitesData = useMemo(() => {
        return activityStats.websites.slice(0, 5).map(site => ({
            name: site.name,
            time: `${Math.round(site.usageSeconds / 60)}m`,
            percent: Math.min(100, Math.round((site.usageSeconds / 28800) * 100)),
            color: 'text-pink-600'
        }));
    }, [activityStats.websites]);

    const heatmapDerivedData = useMemo(() => {
        // Map actual activity markers to the heatmap grid if available
        const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return hours.map((h) => {
            const row = { hour: h };
            days.forEach((day) => {
                // In a production scenario, this should be aggregated from activityStats
                // For now, we return 0 if no real-time activity is present in that slot
                row[day] = 0;
            });
            return row;
        });
    }, []);

    // Payroll Calculation Logic
    const payrollData = useMemo(() => {
        return realTimeEmployees.map(emp => {
            const empEntries = timeEntries.filter(e => e.employeeId === emp.id);

            let totalHours = 0;
            empEntries.forEach(e => {
                if (e.duration) {
                    // duration is in "HH:MM" format from RealTimeContext
                    const [hrs, mins] = e.duration.split(':').map(Number);
                    totalHours += hrs + (mins / 60);
                }
            });

            // Use actual derived hours from time entries
            const actualHours = totalHours;
            const rate = emp.hourlyRate || 45; // Support backend provided rate if mapped

            return {
                id: emp.id,
                employee: emp.name,
                role: emp.role,
                avatar: emp.avatar,
                department: emp.department,
                totalHours: Math.round(actualHours * 10) / 10,
                overtime: Math.max(0, Math.round((actualHours - 160) * 10) / 10),
                hourlyRate: rate,
                grossPay: (actualHours * rate).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                status: actualHours >= 160 ? 'Ready' : 'Pending'
            };
        });
    }, [realTimeEmployees, timeEntries]);

    // Handle Report Generation Logic
    const handleQuickGenerate = (type, forcedFormat = null) => {
        const format = forcedFormat || reportConfig.format || 'csv';
        let headers = [];
        let rows = [];
        let filename = "";

        if (type === 'productivity') {
            headers = ['Department', 'Productivity Score', 'Active Personnel'];
            rows = teamProductivityData.map(d => [d.name, `${d.value}%`, d.active]);
            filename = "productivity_trends_report";
        } else if (type === 'cost') {
            headers = ['Employee', 'Department', 'Total Hours', 'Overtime', 'Gross Pay'];
            rows = payrollData.map(p => [p.employee, p.department, `${p.totalHours}h`, `${p.overtime}h`, p.grossPay.replace('$', '')]);
            filename = "cost_analysis_payroll_report";
        } else if (type === 'compliance' || type === 'security') {
            headers = ['ID', 'Title', 'Category', 'Date', 'Status'];
            // Draw from notifications for real events
            const relevantNotifications = (notifications || []).filter(n =>
                type === 'security' ? n.category === 'Security' : n.category === 'Compliance' || n.category === 'System'
            );

            rows = (relevantNotifications.length > 0 ? relevantNotifications : (notifications || []).slice(0, 5)).map(n => [
                n.id?.slice(-6).toUpperCase() || 'SYS-LOG',
                n.title || n.message,
                n.category || 'General',
                new Date(n.createdAt || Date.now()).toISOString().split('T')[0],
                'Verified'
            ]);
            filename = `${type}_audit_logs`;
        } else if (type === 'attendance') {
            headers = ['Employee', 'Date', 'Status', 'Check In', 'Check Out'];
            // Flatten recent attendance from employees
            const allAttendance = realTimeEmployees.flatMap(emp =>
                (emp.attendance || []).map(a => [
                    emp.name,
                    new Date(a.date || Date.now()).toISOString().split('T')[0],
                    a.status,
                    a.checkIn || '-',
                    a.checkOut || '-'
                ])
            );
            rows = allAttendance.length > 0 ? allAttendance.slice(0, 20) : [['No Record', '-', '-', '-', '-']];
            filename = "attendance_summary";
        }

        let content = "";
        let mimeType = "";
        let extension = "";

        if (format === 'csv' || format === 'excel') {
            content = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
            mimeType = format === 'csv' ? "text/csv" : "application/vnd.ms-excel";
            extension = format === 'csv' ? "csv" : "xls";
        } else if (format === 'pdf') {
            // Simulated PDF content (Text output formatted for PDF-like view if printed)
            content = `--- ${filename.toUpperCase()} ---\n`
                + `Generated on: ${new Date().toLocaleString()}\n\n`
                + headers.join(" | ") + "\n"
                + "--------------------------------------------------\n"
                + rows.map(e => e.join(" | ")).join("\n");
            // In a real production app without jspdf, we'd use a more complex generator,
            // but for this implementation we use a structured plain text blob as a placeholder.
            mimeType = "text/plain";
            extension = "pdf.txt";
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.${extension}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addNotification(`${type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} report exported as ${format.toUpperCase()}`, 'success');
    };

    // Individual Employee Report
    const handleEmployeeReport = (row) => {
        const headers = ['Metric', 'Details'];
        const rows = [
            ['Employee Name', row.employee],
            ['Role', row.role],
            ['Department', row.department],
            ['Total Hours Worked', `${row.totalHours}h`],
            ['Overtime Hours', `${row.overtime}h`],
            ['Hourly Rate', `$${row.hourlyRate}`],
            ['Calculated Gross Pay', row.grossPay.replace('$', '')],
            ['Payment Status', row.status],
            ['Generated Timestamp', new Date().toLocaleString()]
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payroll_report_${row.employee.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addNotification(`Detailed report for ${row.employee} generated`, 'success');
    };

    const handleGenerateReport = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            handleQuickGenerate(reportConfig.type);
        }, 1500);
    };

    if (isLoading && !reportsOverview) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="space-y-4 text-center">
                    <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Assembling Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 pb-32 animate-fade-in px-4 md:px-0 max-w-full overflow-x-hidden box-border">
            {/* Elegant Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                {/* Left: Title */}
                <div className="shrink-0 flex items-start gap-4 w-full lg:w-auto">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl md:rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] shrink-0">
                        <FileText size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white truncate">Analytics Engine</h1>
                            <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Enterprise</span>
                        </div>
                        <p className="text-xs md:text-lg text-slate-400 font-bold tracking-tight mt-1 leading-relaxed">Deep insights into workforce efficiency & operational costs.</p>
                    </div>
                </div>

                {/* Right: Tabs (Separated Chips) */}
                <div className="w-full lg:flex-1 flex flex-wrap items-center justify-center gap-2 md:gap-3">
                    {[
                        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
                        { id: 'activity', name: 'Activity', icon: Activity },
                        { id: 'attendance', name: 'Attendance', icon: Clock },
                        { id: 'timesheets', name: 'Payroll', icon: FileSpreadsheet },
                        { id: 'heatmap', name: 'Heatmap', icon: Zap },
                        { id: 'generator', name: 'Generator', icon: Download }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center justify-center gap-1.5 px-4 py-2.5 md:px-5 md:py-3 text-[9px] md:text-[10px] font-black rounded-xl md:rounded-full transition-all duration-300 uppercase tracking-widest relative group outline-none",
                                activeTab === tab.id
                                    ? "text-white bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xl scale-105"
                                    : "text-slate-500 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                            )}
                        >
                            <tab.icon size={12} className={cn("md:w-3.5 md:h-3.5 transition-transform duration-300", activeTab === tab.id ? "scale-110" : "group-hover:scale-110")} />
                            <span className="font-black">{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-6 md:space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <ReportCard
                            title="Productivity Trends"
                            description="Visual analysis of efficiency fluctuations over time across all departments."
                            icon={Zap}
                            color="bg-amber-500"
                            onClick={() => setActiveTab('activity')}
                            onGenerate={() => handleQuickGenerate('productivity')}
                        />
                        <ReportCard
                            title="Cost Analysis"
                            description="Project-based budget vs. actual hours spent breakdown for the current quarter."
                            icon={FileSpreadsheet}
                            color="bg-emerald-500"
                            onClick={() => setActiveTab('timesheets')}
                            onGenerate={() => handleQuickGenerate('cost')}
                        />
                        <ReportCard
                            title="Compliance Audit"
                            description="System access logs, data privacy monitoring, and security breach attempts."
                            icon={Shield}
                            color="bg-rose-500"
                            onClick={() => { }}
                            onGenerate={() => handleQuickGenerate('compliance')}
                        />
                        <ReportCard
                            title="Attendance Reports"
                            description="Daily presence audit, late-in tracking, and leave management summaries."
                            icon={Clock}
                            color="bg-blue-500"
                            onClick={() => setActiveTab('attendance')}
                            onGenerate={() => handleQuickGenerate('attendance')}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Department Productivity Chart */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Department Efficiency</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={teamProductivityData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24}>
                                            {teamProductivityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#eb4899', '#10b981', '#f59e0b'][index % 5]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Productivity Trend Chart */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Weekly Output Trend</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={productivityTrendData}>
                                        <defs>
                                            <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorProd)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. ACTIVITY TAB */}
            {activeTab === 'activity' && (
                <div className="space-y-6 md:space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Top Applications */}
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Monitor size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Top Applications</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Most used software tools</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {topAppsData.map((app, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{app.name}</span>
                                            <span className="text-xs font-bold text-slate-400">{app.time}</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000", app.color.replace('text-', 'bg-'))} style={{ width: `${app.percent}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Websites */}
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Top Websites</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Browsing Habits</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {topWebsitesData.map((site, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{site.name}</span>
                                            <span className="text-xs font-bold text-slate-400">{site.time}</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000", site.color.replace('text-', 'bg-'))} style={{ width: `${site.percent}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2.5 ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Workforce Presence Board</h3>
                                <p className="text-sm font-bold text-slate-400 mt-1">Real-time attendance tracking and shift compliance logs.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleQuickGenerate('attendance')}
                                    className="h-12 px-6 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Download size={16} /> Daily Audit
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Employee</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Shift</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Check In</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Check Out</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Deviation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {realTimeEmployees.slice(0, 10).map((emp, idx) => {
                                        const attendance = emp.attendance?.[0] || { status: 'absent' };
                                        return (
                                            <tr key={emp.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                            <img src={emp.avatar} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white">{emp.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.department}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                        attendance.status === 'present'
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                                                            : attendance.status === 'late'
                                                                ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20"
                                                                : attendance.status === 'leave'
                                                                    ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20"
                                                                    : "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:border-slate-500/20"
                                                    )}>
                                                        {attendance.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{attendance.shift || 'Day Shift'}</span>
                                                </td>
                                                <td className="px-8 py-5 font-bold text-slate-700 dark:text-slate-200">{attendance.checkIn || '--'}</td>
                                                <td className="px-8 py-5 font-bold text-slate-700 dark:text-slate-200">{attendance.checkOut || '--'}</td>
                                                <td className="px-8 py-5">
                                                    {attendance.late && (
                                                        <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                                                            Late In
                                                        </span>
                                                    )}
                                                    {attendance.earlyLeave && (
                                                        <span className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                                                            Early Exit
                                                        </span>
                                                    )}
                                                    {!attendance.late && !attendance.earlyLeave && attendance.status === 'present' && (
                                                        <span className="text-emerald-500 font-bold text-xs">On Time</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. PAYROLL / TIMESHEETS TAB */}
            {activeTab === 'timesheets' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Payroll & Timesheets</h3>
                                <p className="text-sm font-bold text-slate-400 mt-1">Verified work hours for the current pay period.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search employee..."
                                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/50 focus:border-indigo-500 focus:outline-none font-bold text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => handleQuickGenerate('cost')}
                                    className="h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Download size={16} /> Export
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Employee</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Total Hours</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Overtime</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Gross Pay</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {payrollData.filter(emp => emp.employee.toLowerCase().includes(searchQuery.toLowerCase())).map(row => (
                                        <tr key={row.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden shadow-sm">
                                                        <img src={`https://i.pravatar.cc/150?u=${row.id}`} alt={row.employee} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{row.employee}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{row.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center font-bold text-slate-700 dark:text-slate-300">{row.totalHours}h</td>
                                            <td className="px-8 py-5 text-center font-bold text-amber-600">{row.overtime > 0 ? `+${row.overtime}h` : '-'}</td>
                                            <td className="px-8 py-5 text-center font-black text-slate-900 dark:text-white">{row.grossPay}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                    row.status === 'Ready'
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800"
                                                        : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800"
                                                )}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEmployeeReport(row)}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. ACTIVITY HEATMAP */}
            {activeTab === 'heatmap' && (
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-fade-in">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Output Heatmap</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1">Identify peak performance windows.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-indigo-50 rounded-sm"></div><span className="text-[10px] font-bold text-slate-400 mr-2">Low</span>
                            <div className="h-3 w-3 bg-indigo-600 rounded-sm"></div><span className="text-[10px] font-bold text-slate-400">High</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto pb-4">
                        <div className="min-w-[800px]">
                            <div className="grid grid-cols-[60px_1fr] gap-6">
                                {/* Time Labels */}
                                <div className="space-y-2 pt-8">
                                    {heatmapDerivedData.map(h => (
                                        <div key={h.hour} className="h-10 flex items-center justify-end text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            {h.hour}
                                        </div>
                                    ))}
                                </div>
                                {/* Grid */}
                                <div className="space-y-2">
                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {heatmapDerivedData.map((row, rIdx) => (
                                            <React.Fragment key={rIdx}>
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                    <HeatmapCell key={`${rIdx}-${day}`} value={row[day]} />
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. REPORT GENERATOR */}
            {activeTab === 'generator' && (
                <div className="flex justify-center py-10 animate-slide-up">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <div className="text-center mb-10">
                            <div className="h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center mb-6 shadow-sm">
                                <Database size={40} className="text-indigo-600" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Custom Report Generator</h3>
                            <p className="text-slate-500 font-bold max-w-md mx-auto">Select your parameters to generate detailed PDF or CSV reports for compliance and auditing.</p>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Report Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 pl-4 pr-10 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none appearance-none"
                                            value={reportConfig.type}
                                            onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
                                        >
                                            <option value="productivity">Productivity Analysis</option>
                                            <option value="attendance">Attendance & Leaves</option>
                                            <option value="payroll">Payroll Summary</option>
                                            <option value="security">Security Audit Log</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Time Range</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 pl-4 pr-10 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none appearance-none"
                                            value={reportConfig.range}
                                            onChange={(e) => setReportConfig({ ...reportConfig, range: e.target.value })}
                                        >
                                            <option value="week">Current Week</option>
                                            <option value="month">Current Month</option>
                                            <option value="last_month">Last Month</option>
                                            <option value="quarter">Last Quarter</option>
                                            <option value="year">Year to Date (YTD)</option>
                                            <option value="custom">Custom Range</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                    </div>
                                </div>
                            </div>

                            {reportConfig.range === 'custom' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full h-14 px-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                                            value={reportConfig.startDate}
                                            onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full h-14 px-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                                            value={reportConfig.endDate}
                                            onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Included Departments</label>
                                <div className="grid grid-cols-2 sm:flex flex-wrap gap-2 md:gap-3">
                                    {['All', 'Engineering', 'Sales', 'Design'].map(dept => (
                                        <button
                                            key={dept}
                                            onClick={() => setReportConfig({ ...reportConfig, department: dept.toLowerCase() })}
                                            className={cn(
                                                "py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border-2 transition-all",
                                                reportConfig.department === dept.toLowerCase()
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                                                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            {dept}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Export Format</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'csv', name: 'CSV', icon: FileSpreadsheet },
                                        { id: 'excel', name: 'Excel', icon: FileSpreadsheet },
                                        { id: 'pdf', name: 'PDF', icon: FileText }
                                    ].map(format => (
                                        <button
                                            key={format.id}
                                            onClick={() => setReportConfig({ ...reportConfig, format: format.id })}
                                            className={cn(
                                                "py-4 rounded-xl flex flex-col items-center gap-2 border-2 transition-all group",
                                                reportConfig.format === format.id
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                                                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            <format.icon size={20} className={cn(reportConfig.format === format.id ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400")} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{format.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={isGenerating}
                                    className="w-full h-16 bg-slate-900 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={20} /> Generate & Download
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

