// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     Users,
//     UserCheck,
//     Clock,
//     TrendingUp,
//     AlertCircle,
//     Activity,
//     ArrowRight,
//     Zap,
//     Calendar,
//     ChevronLeft,
//     ChevronRight,
//     CalendarDays,
//     Search,
//     Settings
// } from 'lucide-react';
// import {
//     AreaChart,
//     Area,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     ResponsiveContainer
// } from 'recharts';
// import { useRealTime } from '../hooks/RealTimeContext';
// import { auth } from '../hooks/auth';
// import { CountUp } from '../components/ui/CountUp';
// import { Skeleton } from '../components/ui/Skeleton';
// import { InteractiveCard } from '../components/ui/InteractiveCard';
// import { clsx } from 'clsx';
// import { twMerge } from 'tailwind-merge';

// const cn = (...inputs) => twMerge(clsx(inputs));

// const AnalyticsWidget = React.memo(({ title, subtitle, children, className, rightContent }) => (
//     <div className={cn(
//         "flex flex-col rounded-[2rem] border border-slate-200/60 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 transition-all duration-300 hover:shadow-lg group relative overflow-hidden",
//         className
//     )}>
//         <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 relative z-10">
//             <div className="space-y-1.5">
//                 <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary-600 transition-colors duration-300">{title}</h3>
//                 {subtitle && <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{subtitle}</p>}
//             </div>
//             {rightContent && <div className="w-full sm:w-auto transition-transform duration-300 group-hover:scale-105">{rightContent}</div>}
//         </div>
//         <div className="flex-1 min-h-0 relative z-10">
//             {children}
//         </div>
//     </div>
// ));

// const LiveClock = React.memo(() => {
//     const [time, setTime] = useState(new Date());
//     useEffect(() => {
//         const timer = setInterval(() => setTime(new Date()), 1000);
//         return () => clearInterval(timer);
//     }, []);
//     return (
//         <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
//     );
// });

// const StatCard = React.memo(({ title, value, icon: Icon, trend, color, isLoading, delay, onClick, subtext, extra }) => (
//     <div className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
//         <InteractiveCard
//             className="h-full border border-slate-200/60 shadow-sm dark:border-slate-800/60 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-md hover:-translate-y-1 !p-6 md:!p-7 group"
//             onClick={onClick}
//         >
//             <Skeleton isLoading={isLoading} className="h-full min-h-[100px] md:min-h-[120px]">
//                 <div className="flex flex-col justify-between h-full relative z-10">
//                     <div className="flex items-start justify-between gap-2">
//                         <div className="space-y-1 sm:space-y-2">
//                             <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-left">{title}</p>
//                             <h3 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white text-left leading-none">
//                                 {typeof value === 'number' ? <CountUp end={value} /> : value}
//                             </h3>
//                         </div>
//                         <div className="flex flex-col items-center gap-2 sm:gap-3">
//                             <div className={cn("flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl shadow-lg shadow-black/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", color)}>
//                                 <Icon size={22} className="md:!size-[26px]" />
//                             </div>
//                             {extra}
//                         </div>
//                     </div>
//                     <div>
//                         {trend && (
//                             <div className="mt-4 sm:mt-6 flex items-center gap-1.5 sm:gap-2">
//                                 <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
//                                     <TrendingUp size={10} strokeWidth={3} />
//                                     <span>{trend}</span>
//                                 </div>
//                                 <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Growth</span>
//                             </div>
//                         )}
//                         {subtext && <p className="mt-2 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] opacity-60 leading-tight">{subtext}</p>}
//                     </div>
//                 </div>
//             </Skeleton>
//         </InteractiveCard>
//     </div>
// ));

// const AlertItem = React.memo(({ alert, index }) => (
//     <div
//         className="group flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 animate-slide-up"
//         style={{ animationDelay: `${index * 100}ms` }}
//     >
//         <div className={cn(
//             "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
//             alert.type === 'warning' ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20" : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20"
//         )}>
//             <AlertCircle size={18} />
//         </div>
//         <div className="flex-1 min-w-0">
//             <div className="flex items-center justify-between gap-2 mb-1">
//                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-600">{alert.category || 'System'}</span>
//                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{alert.time || 'Just now'}</span>
//             </div>
//             <p className="text-xs font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors truncate">
//                 {alert.title || "Critical Notification"}
//             </p>
//             <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 opacity-80">
//                 {alert.message || alert.description}
//             </p>
//         </div>
//     </div>
// ));

// const EmployeeStatusWidget = React.memo(({ employees }) => {
//     const [filter, setFilter] = useState('online');
//     const [search, setSearch] = useState('');
//     const [debouncedSearch, setDebouncedSearch] = useState('');

//     useEffect(() => {
//         const timer = setTimeout(() => setDebouncedSearch(search), 250);
//         return () => clearTimeout(timer);
//     }, [search]);

//     const filteredEmployees = useMemo(() => {
//         const s = debouncedSearch.toLowerCase();
//         return (employees || []).filter(emp => {
//             const matchesFilter = filter === 'all' || emp.status === filter;
//             const matchesSearch = !s ||
//                 emp.name.toLowerCase().includes(s) ||
//                 emp.role.toLowerCase().includes(s) ||
//                 emp.department?.toLowerCase().includes(s);
//             return matchesFilter && matchesSearch;
//         });
//     }, [employees, filter, debouncedSearch]);

//     const statusCounts = useMemo(() => ({
//         online: (employees || []).filter(e => e.status === 'online').length,
//         idle: (employees || []).filter(e => e.status === 'idle').length,
//         offline: (employees || []).filter(e => e.status === 'offline').length
//     }), [employees]);

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'online': return 'bg-emerald-500';
//             case 'idle': return 'bg-amber-500';
//             default: return 'bg-slate-400';
//         }
//     };

//     return (
//         <AnalyticsWidget title="Live Workforce" subtitle="Activity monitor">
//             <div className="flex flex-col">
//                 <div className="flex flex-col gap-4 mb-6">
//                     <div className="relative group w-full">
//                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
//                         <input
//                             type="text"
//                             placeholder="Search personnel..."
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500/20 outline-none"
//                         />
//                     </div>
//                     <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
//                         {['online', 'idle', 'offline'].map((s) => (
//                             <button
//                                 key={s}
//                                 onClick={() => setFilter(s)}
//                                 className={cn(
//                                     "flex-1 flex flex-col items-center py-2 rounded-lg transition-all relative",
//                                     filter === s ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-400"
//                                 )}
//                             >
//                                 <span className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5">{s}</span>
//                                 <span className="text-sm font-black leading-none">{statusCounts[s]}</span>
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
//                     <div className="space-y-3">
//                         {filteredEmployees.map((emp) => (
//                             <div key={emp.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 hover:border-primary-500/30 transition-all group/item">
//                                 <div className="relative">
//                                     <div className="h-11 w-11 rounded-xl overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg transition-transform duration-300 group-hover/item:scale-110">
//                                         <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" />
//                                     </div>
//                                     <div className={cn("absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-white dark:border-slate-800 shadow-sm", getStatusColor(emp.status))}>
//                                         {emp.status === 'online' && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse-ring"></span>}
//                                     </div>
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                     <h4 className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{emp.name}</h4>
//                                     <p className="text-[10px] font-bold text-slate-400 capitalize">{emp.role}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </AnalyticsWidget>
//     );
// });

// const AdminView = React.memo(({ stats = {}, isLoading, timeFrame = 'today', productivityDay, setProductivityDay, setShowCalendarModal, hoursValue, handleTimeFrameChange, recentAlerts, employees, navigate }) => (
//     <>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             <StatCard
//                 title="Active Employees"
//                 value={stats.activeEmployees || 0}
//                 icon={Users}
//                 trend={stats.growth?.activeEmployees}
//                 color="bg-blue-500/10 text-blue-600"
//                 isLoading={isLoading}
//                 delay={0}
//             />
//             <StatCard
//                 title="Online Now"
//                 value={stats.online || 0}
//                 icon={UserCheck}
//                 color="bg-emerald-500/10 text-emerald-600"
//                 isLoading={isLoading}
//                 delay={100}
//             />
//             <StatCard
//                 title="Productivity Score"
//                 value={stats.productivityScore || 0}
//                 icon={Activity}
//                 trend={stats.growth?.productivity}
//                 color="bg-amber-500/10 text-amber-600"
//                 isLoading={isLoading}
//                 delay={200}
//             />
//             <StatCard
//                 title={`Total Hours (${timeFrame})`}
//                 value={hoursValue}
//                 icon={Zap}
//                 trend={stats.growth?.hours}
//                 color="bg-violet-500/10 text-violet-600"
//                 isLoading={isLoading}
//                 delay={300}
//                 extra={
//                     <div className="flex gap-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200/50 shadow-inner">
//                         {['today', 'week', 'month'].map(t => (
//                             <button
//                                 key={t}
//                                 onClick={(e) => handleTimeFrameChange(t, e)}
//                                 className={clsx(
//                                     "px-2 py-0.5 text-[10px] uppercase font-black rounded-md transition-all",
//                                     timeFrame === t ? "bg-white dark:bg-slate-600 text-primary-600 dark:text-white" : "text-slate-400"
//                                 )}
//                             >
//                                 {t.charAt(0)}
//                             </button>
//                         ))}
//                     </div>
//                 }
//             />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
//             <div className="lg:col-span-2 space-y-8">
//                 <AnalyticsWidget
//                     title="Real-time Productivity"
//                     subtitle="Intraday levels"
//                     rightContent={
//                         <div className="flex flex-col sm:flex-row items-stretch gap-3">
//                             <button
//                                 onClick={() => setShowCalendarModal(true)}
//                                 className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-primary-600"
//                             >
//                                 <Calendar size={12} className="text-primary-500" />
//                                 <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
//                             </button>
//                             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl">
//                                 <button onClick={() => setProductivityDay(p => p - 1)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400"><ChevronLeft size={16} /></button>
//                                 <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 min-w-[100px] text-center uppercase">
//                                     {productivityDay === 0 ? 'Today' : new Date(new Date().setDate(new Date().getDate() + productivityDay)).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
//                                 </span>
//                                 <button onClick={() => setProductivityDay(p => Math.min(0, p + 1))} disabled={productivityDay === 0} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 disabled:opacity-30"><ChevronRight size={16} /></button>
//                             </div>
//                         </div>
//                     }
//                 >
//                     <div className="h-[300px] w-full mt-4">
//                         <ResponsiveContainer width="100%" height="100%">
//                             <AreaChart data={stats.intradayActivity || []}>
//                                 <defs>
//                                     <linearGradient id="colorIntra" x1="0" y1="0" x2="0" y2="1">
//                                         <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
//                                         <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//                                     </linearGradient>
//                                 </defs>
//                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
//                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
//                                 <YAxis hide />
//                                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
//                                 <Area type="monotone" dataKey="productivity" stroke="#6366f1" strokeWidth={3} fill="url(#colorIntra)" />
//                             </AreaChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </AnalyticsWidget>
//                 <EmployeeStatusWidget employees={employees} />
//             </div>
//             <div className="space-y-8">
//                 <div className="rounded-[2rem] border border-slate-200/60 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 group">
//                     <div className="flex items-center justify-between mb-8">
//                         <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Recent Alerts</h3>
//                         <button onClick={() => navigate('/notifications')} className="text-[10px] font-black uppercase tracking-widest text-primary-600">View All</button>
//                     </div>
//                     <div className="space-y-4">
//                         {recentAlerts.length > 0 ? recentAlerts.map((alert, idx) => <AlertItem key={alert.id} alert={alert} index={idx} />) : (
//                             <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No active alerts</div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </>
// ));

// const ManagerView = React.memo(({ stats, reportsOverview, isLoading, employees }) => (
//     <div className="space-y-8">
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//             <StatCard title="Team Members" value={reportsOverview?.totalTeam || employees.length || 0} icon={Users} color="bg-blue-500/10 text-blue-600" isLoading={isLoading} delay={0} />
//             <StatCard title="Active Today" value={reportsOverview?.activeToday || 0} icon={UserCheck} color="bg-emerald-500/10 text-emerald-600" isLoading={isLoading} delay={100} />
//             <StatCard title="Productivity" value={reportsOverview?.avgProductivity || 0} icon={TrendingUp} color="bg-amber-500/10 text-amber-600" isLoading={isLoading} delay={200} extra={<span className="text-[10px] font-black opacity-60 ml-1">%</span>} />
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             <div className="lg:col-span-2">
//                 <AnalyticsWidget title="Performance Trend" subtitle="Daily team analytics">
//                     <div className="h-[320px] w-full mt-4">
//                         <ResponsiveContainer width="100%" height="100%">
//                             <AreaChart data={reportsOverview?.trend || []}>
//                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
//                                 <YAxis hide />
//                                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
//                                 <Area type="monotone" dataKey="productivity" stroke="#6366f1" strokeWidth={3} fill="#6366f120" />
//                             </AreaChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </AnalyticsWidget>
//             </div>
//             <EmployeeStatusWidget employees={employees} />
//         </div>
//     </div>
// ));

// const EmployeeView = React.memo(({ reportsOverview, isLoading }) => (
//     <div className="space-y-8">
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//             <StatCard title="Hours Today" value={`${reportsOverview?.hoursToday || '0.0'}h`} icon={Clock} color="bg-emerald-500/10 text-emerald-600" isLoading={isLoading} delay={0} />
//             <StatCard title="Productivity" value={reportsOverview?.productivity || 0} icon={TrendingUp} color="bg-amber-500/10 text-amber-600" isLoading={isLoading} delay={100} extra={<span className="text-[10px] font-black opacity-60 ml-1">%</span>} />
//             <StatCard title="Active Tasks" value={reportsOverview?.activeTasks || 0} icon={Zap} color="bg-violet-500/10 text-violet-600" isLoading={isLoading} delay={200} />
//         </div>
//         <AnalyticsWidget title="Daily Efficiency" subtitle="Personal performance trend">
//             <div className="h-[320px] w-full mt-4">
//                 <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart data={reportsOverview?.trend || []}>
//                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
//                         <YAxis hide />
//                         <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
//                         <Area type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf620" />
//                     </AreaChart>
//                 </ResponsiveContainer>
//             </div>
//         </AnalyticsWidget>
//     </div>
// ));

// export function Dashboard() {
//     const navigate = useNavigate();
//     const { stats = {}, employees = [], isLoading, tasks = [], notifications = [], reportsOverview = {} } = useRealTime() || {};

//     const [productivityDay, setProductivityDay] = useState(0);
//     const [timeFrame, setTimeFrame] = useState('today');
//     const [showCalendarModal, setShowCalendarModal] = useState(false);
//     const [currentCalDate, setCurrentCalDate] = useState(new Date());

//     const user = auth.getUser();
//     const userRole = user?.role || 'Admin';

//     const recentAlerts = useMemo(() => (notifications || []).slice(0, 5), [notifications]);

//     const hoursValue = useMemo(() => {
//         if (!stats?.totalHours) return '0.0h';
//         if (timeFrame === 'week') return stats.totalHours.week;
//         if (timeFrame === 'month') return stats.totalHours.month;
//         return stats.totalHours.today;
//     }, [stats, timeFrame]);

//     const handleDateSelect = useCallback((val) => {
//         if (!val) return;
//         const selected = new Date(val);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         selected.setHours(0, 0, 0, 0);
//         const diffDays = Math.round((today - selected) / (1000 * 60 * 60 * 24));
//         setProductivityDay(-diffDays);
//         setShowCalendarModal(false);
//     }, []);

//     const calendarDays = useMemo(() => {
//         const year = currentCalDate.getFullYear();
//         const month = currentCalDate.getMonth();
//         const firstDay = new Date(year, month, 1).getDay();
//         const daysInMonth = new Date(year, month + 1, 0).getDate();
//         const days = [];
//         for (let i = 0; i < firstDay; i++) days.push(null);
//         for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
//         return days;
//     }, [currentCalDate]);

//     const handleTimeFrameChange = useCallback((t, e) => {
//         if (e) e.stopPropagation();
//         setTimeFrame(t);
//     }, []);

//     return (
//         <div className="space-y-8 pb-10 px-4 sm:px-0">
//             <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 px-8 py-12 text-white shadow-2xl animate-fade-in group">
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.15)_0%,transparent_50%)]"></div>
//                 <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
//                     <div className="space-y-4">
//                         <div className="flex items-center gap-3">
//                             <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black tracking-widest text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
//                                 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
//                                 LIVE OPS
//                             </div>
//                             <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-300 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
//                                 <Clock size={12} className="text-primary-400" />
//                                 <LiveClock />
//                             </div>
//                         </div>
//                         <h1 className="text-4xl sm:text-6xl font-black tracking-tightest">Dashboard</h1>
//                         <p className="text-slate-400 font-bold text-lg max-w-lg opacity-80">Real-time workforce intelligence and high-fidelity performance insights.</p>
//                     </div>
//                     <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-2xl">
//                         <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
//                             <TrendingUp size={28} />
//                         </div>
//                         <div>
//                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Performance Pulse</p>
//                             <p className="text-xl font-black text-white">Productivity {stats?.productivityScore || 0}%</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="animate-fade-in">
//                 {userRole === 'Admin' && (
//                     <AdminView
//                         stats={stats}
//                         isLoading={isLoading}
//                         timeFrame={timeFrame}
//                         productivityDay={productivityDay}
//                         setProductivityDay={setProductivityDay}
//                         setShowCalendarModal={setShowCalendarModal}
//                         hoursValue={hoursValue}
//                         handleTimeFrameChange={handleTimeFrameChange}
//                         recentAlerts={recentAlerts}
//                         employees={employees}
//                         navigate={navigate}
//                     />
//                 )}
//                 {userRole === 'Manager' && <ManagerView stats={stats} reportsOverview={reportsOverview} isLoading={isLoading} employees={employees} />}
//                 {userRole === 'Employee' && <EmployeeView reportsOverview={reportsOverview} isLoading={isLoading} />}
//             </div>

//             {showCalendarModal && (
//                 <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
//                     <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCalendarModal(false)}></div>
//                     <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
//                         <div className="flex items-center justify-between mb-6">
//                             <button onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() - 1)))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
//                             <h3 className="text-sm font-black uppercase tracking-widest">{currentCalDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
//                             <button onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() + 1)))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronRight size={20} /></button>
//                         </div>
//                         <div className="grid grid-cols-7 gap-1 mb-2">
//                             {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => <div key={idx} className="text-center text-[10px] font-black text-slate-400 py-2">{d}</div>)}
//                         </div>
//                         <div className="grid grid-cols-7 gap-1">
//                             {calendarDays.map((date, idx) => {
//                                 if (!date) return <div key={`empty-${idx}`} className="h-10" />;
//                                 const isToday = date.toDateString() === new Date().toDateString();
//                                 const isSelected = date.toDateString() === new Date(new Date().setDate(new Date().getDate() + productivityDay)).toDateString();
//                                 const isFuture = date > new Date();
//                                 return (
//                                     <button
//                                         key={idx}
//                                         onClick={() => !isFuture && handleDateSelect(date.toISOString().split('T')[0])}
//                                         disabled={isFuture}
//                                         className={cn(
//                                             "h-10 text-xs font-bold rounded-xl flex items-center justify-center transition-all",
//                                             isSelected ? "bg-primary-500 text-white shadow-lg" : isToday ? "border-2 border-primary-500 text-primary-600" : isFuture ? "text-slate-300 cursor-not-allowed" : "hover:bg-slate-100 dark:hover:bg-slate-800"
//                                         )}
//                                     >
//                                         {date.getDate()}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

















//---------------------------------------
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserCheck,
    Clock,
    TrendingUp,
    AlertCircle,
    MoreVertical,
    Activity,
    ArrowRight,
    Zap,
    Briefcase,
    Calendar,
    Filter,
    Download,
    ChevronDown,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Plus,
    Search,
    Settings
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Line
} from 'recharts';
import { useRealTime } from '../hooks/RealTimeContext';
import { CountUp } from '../components/ui/CountUp';
import { Skeleton } from '../components/ui/Skeleton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { InteractiveCard } from '../components/ui/InteractiveCard';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const AnalyticsWidget = React.memo(({ title, subtitle, children, className, rightContent }) => (
    <div className={cn(
        "flex flex-col rounded-2xl md:rounded-3xl border border-slate-200/60 bg-white p-3 sm:p-6 md:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:border-slate-800/60 dark:bg-slate-900 transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 group relative overflow-hidden",
        className
    )}>
        {/* Decorative Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Header: Stacks on mobile if rightContent is wide */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 relative z-10">
            <div className="space-y-1.5">
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary-600 transition-colors duration-300">{title}</h3>
                {subtitle && <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{subtitle}</p>}
            </div>
            {rightContent && <div className="w-full sm:w-auto transition-transform duration-300 group-hover:scale-105">{rightContent}</div>}
        </div>
        <div className="flex-1 min-h-0 relative z-10">
            {children}
        </div>
    </div>
));

const LiveClock = React.memo(() => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    );
});

const StatCard = React.memo(({ title, value, icon: Icon, trend, color, isLoading, delay, onClick, subtext, extra }) => (
    <div className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
        <InteractiveCard
            className="h-full border border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:border-slate-800/60 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 !p-5 md:!p-7 group"
            onClick={onClick}
        >
            <Skeleton isLoading={isLoading} className="h-full min-h-[100px] md:min-h-[120px]">
                <div className="flex flex-col justify-between h-full relative z-10">
                    <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 sm:space-y-2">
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-left">{title}</p>
                            <h3 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white text-left leading-none">
                                {typeof value === 'number' ? <CountUp end={value} /> : value}
                            </h3>
                        </div>
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className={cn("flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl shadow-lg shadow-black/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", color)}>
                                <Icon size={22} className="md:!size-[26px]" />
                            </div>
                            {extra}
                        </div>
                    </div>
                    <div>
                        {trend && (
                            <div className="mt-4 sm:mt-6 md:mt-8 flex items-center gap-1.5 sm:gap-2">
                                <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <TrendingUp size={10} className="sm:!size-[12px]" strokeWidth={3} />
                                    <span>{trend}</span>
                                </div>
                                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Growth</span>
                            </div>
                        )}
                        {subtext && <p className="mt-2 sm:mt-3 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] opacity-60 leading-tight">{subtext}</p>}
                    </div>
                </div>
            </Skeleton>
        </InteractiveCard>
    </div>
));

const AlertItem = React.memo(({ alert, index }) => (
    <div
        className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 animate-slide-up"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className={cn(
            "mt-1 flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
            alert.type === 'warning' ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20" : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20"
        )}>
            <AlertCircle size={18} className="sm:!size-[20px]" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-primary-600">{alert.category || 'System'}</span>
                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{alert.time || 'Just now'}</span>
            </div>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors duration-300 truncate">
                {alert.title || "Critical Notification"}
            </p>
            <p className="text-[10px] sm:text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 opacity-80">
                {alert.message || alert.description}
            </p>
        </div>
    </div>
));

const EmployeeStatusWidget = React.memo(({ employees }) => {
    const [filter, setFilter] = useState('online');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 250);
        return () => clearTimeout(timer);
    }, [search]);

    const filteredEmployees = React.useMemo(() => {
        const s = debouncedSearch.toLowerCase();
        return (employees || []).filter(emp => {
            const matchesFilter = filter === 'all' || emp.status === filter;
            const matchesSearch = !s ||
                emp.name.toLowerCase().includes(s) ||
                emp.role.toLowerCase().includes(s) ||
                emp.department.toLowerCase().includes(s);
            return matchesFilter && matchesSearch;
        });
    }, [employees, filter, debouncedSearch]);

    const statusCounts = React.useMemo(() => ({
        online: (employees || []).filter(e => e.status === 'online').length,
        idle: (employees || []).filter(e => e.status === 'idle').length,
        offline: (employees || []).filter(e => e.status === 'offline').length
    }), [employees]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-emerald-500';
            case 'idle': return 'bg-amber-500';
            default: return 'bg-slate-400';
        }
    };

    const getLastSeen = (status) => {
        if (status === 'online') return 'Active Now';
        if (status === 'idle') return '5m ago';
        return '2h ago';
    };

    return (
        <AnalyticsWidget title="Live Workforce" subtitle="Activity monitor">
            <div className="flex flex-col">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative group w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search name, role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner">
                        {['online', 'idle', 'offline'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "flex-1 flex flex-col items-center py-2 rounded-lg transition-all relative overflow-hidden group/btn",
                                    filter === s ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] mb-0.5">{s}</span>
                                <span className="text-sm sm:text-base font-black leading-none">{statusCounts[s]}</span>
                                {filter === s && (
                                    <div className={cn("absolute bottom-0 left-0 h-[2px] w-full", getStatusColor(s))} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar max-h-[400px] md:max-h-[500px]">
                    <div className="space-y-2 sm:space-y-3">
                        {filteredEmployees.map((emp, idx) => (
                            <div
                                key={emp.id}
                                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 group/item"
                            >
                                <div className="relative">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-[1rem] overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg transition-transform duration-300 group-hover/item:scale-110">
                                        <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-[2.5px] sm:border-[3px] border-white dark:border-slate-800 shadow-sm transition-transform duration-300 group-hover/item:scale-125",
                                        getStatusColor(emp.status)
                                    )}>
                                        {emp.status === 'online' && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse-ring"></span>}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-2">
                                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate transition-colors group-hover/item:text-primary-600 tracking-tight">{emp.name}</h4>
                                        <span className={cn(
                                            "text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-[0.1em] border shadow-sm shrink-0",
                                            emp.status === 'online' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50" :
                                                emp.status === 'idle' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50" :
                                                    "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                        )}>
                                            {getLastSeen(emp.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 truncate opacity-80">{emp.role}</span>
                                        <div className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                        <span className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none truncate">{emp.department}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredEmployees.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                                <Activity size={28} className="text-slate-200 mb-2 sm:mb-3" />
                                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">No matching personnel</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnalyticsWidget>
    );
});

const AdminView = React.memo(({ stats, isLoading, timeFrame, productivityDay, setProductivityDay, setShowCalendarModal, hoursValue, handleTimeFrameChange, recentAlerts, employees, navigate }) => (
    <>
        {/* Responsive Grid for Stats: 1 col mobile -> 2 cols tablet -> 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <StatCard
                title="Active Employees"
                value={stats.activeEmployees}
                icon={Users}
                trend="+12%"
                color="bg-blue-500/10 text-blue-600"
                isLoading={isLoading}
                delay={0}
            />
            <StatCard
                title="Online Now"
                value={stats.online}
                icon={UserCheck}
                color="bg-emerald-500/10 text-emerald-600"
                isLoading={isLoading}
                delay={100}
            />
            <StatCard
                title="Productivity Score"
                value={89}
                icon={Activity}
                trend="+5%"
                color="bg-amber-500/10 text-amber-600"
                isLoading={isLoading}
                delay={200}
            />
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                <StatCard
                    title={`Total Hours (${timeFrame})`}
                    value={hoursValue}
                    icon={Zap}
                    trend="+2.4%"
                    color="bg-violet-500/10 text-violet-600"
                    isLoading={isLoading}
                    delay={0}
                    extra={
                        <div className="flex gap-0.5 sm:gap-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-0.5 sm:p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                            {['today', 'week', 'month'].map(t => (
                                <button
                                    key={t}
                                    onClick={(e) => handleTimeFrameChange(t, e)}
                                    className={clsx(
                                        "px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] uppercase font-black rounded-md sm:rounded-lg transition-all duration-300",
                                        timeFrame === t
                                            ? "bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm scale-110"
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    )}
                                >
                                    {t.charAt(0)}
                                </button>
                            ))}
                        </div>
                    }
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-10">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <AnalyticsWidget
                    title="Real-time Productivity"
                    subtitle="Intraday levels"
                    // Right content stacks on mobile via flex-col in parent component
                    rightContent={
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="relative group/cal w-full sm:w-auto">
                                <button
                                    onClick={() => setShowCalendarModal(true)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-primary-600 hover:border-primary-200 transition-all active:scale-95"
                                >
                                    <Calendar size={12} className="text-primary-500" />
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Date</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 bg-slate-50 dark:bg-slate-800 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                                <button
                                    onClick={() => setProductivityDay(p => p - 1)}
                                    className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg sm:rounded-xl transition-all text-slate-400 hover:text-primary-600"
                                >
                                    <ChevronLeft size={14} className="sm:!size-[16px]" />
                                </button>
                                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 min-w-[90px] sm:min-w-[120px] justify-center">
                                    <CalendarDays size={12} className="text-primary-500 sm:!size-[14px]" />
                                    <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-200 whitespace-nowrap uppercase tracking-tighter">
                                        {productivityDay === 0 ? 'Today' : new Date(new Date().setDate(new Date().getDate() + productivityDay)).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setProductivityDay(p => Math.min(0, p + 1))}
                                    disabled={productivityDay === 0}
                                    className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg sm:rounded-xl transition-all text-slate-400 hover:text-primary-600 disabled:opacity-30"
                                >
                                    <ChevronRight size={14} className="sm:!size-[16px]" />
                                </button>
                            </div>
                        </div>
                    }
                >
                    <div className="h-[250px] sm:h-[280px] md:h-[320px] w-full mt-2 sm:mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={React.useMemo(() => stats.intradayActivity?.map(d => ({
                                ...d,
                                value: productivityDay === 0 ? d.value : d.value * (0.8 + (Math.abs(d.value % 4) / 10))
                            })) || [], [stats.intradayActivity, productivityDay])}>
                                <defs>
                                    <linearGradient id="colorIntra" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} interval="preserveStartEnd" />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#fff', padding: '8px 12px' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 900 }}
                                    labelStyle={{ fontSize: '10px', fontWeight: 800, marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIntra)"
                                    animationDuration={1000}
                                    isAnimationActive={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </AnalyticsWidget>

                <EmployeeStatusWidget employees={employees} />
            </div>

            <div className="space-y-6 sm:space-y-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
                <div className="rounded-2xl md:rounded-3xl border border-slate-200/60 bg-white p-4 sm:p-6 md:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:border-slate-800/60 dark:bg-slate-900 transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] h-fit relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 relative z-10">
                        <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary-600 transition-colors duration-300">Recent Alerts</h3>
                        <button onClick={() => navigate('/notifications')} className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary-600 hover:tracking-[0.15em] transition-all">View All</button>
                    </div>
                    <div className="space-y-3 sm:space-y-4 relative z-10">
                        {recentAlerts.length > 0 ? (
                            recentAlerts.map((alert, idx) => (
                                <AlertItem key={alert.id} alert={alert} index={idx} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl sm:rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <AlertCircle size={20} className="text-slate-300 mb-2 sm:mb-3" />
                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">No active alerts</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-indigo-600 p-6 sm:p-8 md:p-10 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] group transition-all duration-500 hover:shadow-[0_30px_70px_rgba(79,70,229,0.4)] hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-indigo-500/20 rounded-full -ml-10 sm:-ml-16 -mb-10 sm:-mb-16 blur-xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 sm:gap-3 text-indigo-100 mb-3 sm:mb-4">
                            <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg sm:rounded-xl backdrop-blur-md">
                                <Activity size={16} className="sm:!size-[20px] text-white" />
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Ops Health</span>
                        </div>
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4 tracking-tighter">92%</h3>
                        <p className="text-indigo-50 text-xs sm:text-sm md:text-base font-bold leading-relaxed opacity-90 max-w-[200px]">
                            System stability is at peak performance.
                        </p>
                        <div className="mt-4 sm:mt-6 md:mt-8 flex items-center gap-2 bg-white/10 w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:translate-x-1">
                            <TrendingUp size={14} className="text-emerald-400 sm:!size-[16px]" />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400">+5% TRENDING</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
));

const ManagerView = React.memo(() => (
    <div className="grid gap-6 grid-cols-1">
        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 text-blue-800">
            <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Engineering Team Dashboard</h3>
            <p className="text-xs sm:text-sm">Welcome back, Manager. You have 45 active engineers today.</p>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <AnalyticsWidget title="Team Productivity" className="h-full">
                <div className="h-[200px] w-full flex items-center justify-center text-slate-400 text-xs sm:text-sm">Team Chart Mockup</div>
            </AnalyticsWidget>
            <AnalyticsWidget title="Project Timelines" className="h-full">
                <div className="h-[200px] w-full flex items-center justify-center text-slate-400 text-xs sm:text-sm">Gantt Chart Mockup</div>
            </AnalyticsWidget>
        </div>
    </div>
));

const EmployeeView = React.memo(() => (
    <div className="grid gap-6 grid-cols-1">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
            <StatCard title="My Hours Today" value="6h 45m" icon={Clock} color="bg-emerald-50 text-emerald-600" delay={0} />
            <StatCard title="My Productivity" value="94%" icon={Zap} color="bg-violet-50 text-violet-600" delay={100} />
            <StatCard title="Pending Tasks" value="3" icon={List} color="bg-blue-50 text-blue-600" delay={200} />
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <AnalyticsWidget title="My Activity Log" className="h-full">
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-slate-50">
                            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">Coding: Dashboard.jsx</p>
                                <p className="text-[10px] sm:text-xs text-slate-500">2 hours ago</p>
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-700 shrink-0">2h 15m</span>
                        </div>
                    ))}
                </div>
            </AnalyticsWidget>
            <AnalyticsWidget title="My Focus Score" className="h-full">
                <div className="h-full flex items-center justify-center py-4">
                    <div className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 flex items-center justify-center rounded-full border-8 border-violet-100">
                        <span className="text-2xl sm:text-3xl font-black text-violet-600">8.5</span>
                    </div>
                </div>
            </AnalyticsWidget>
        </div>
    </div>
));

export function Dashboard() {
    const navigate = useNavigate();
    const { stats, employees, isLoading, tasks, notifications } = useRealTime();
    const [showExportSpinner, setShowExportSpinner] = useState(false);
    const [timeFrame, setTimeFrame] = useState('today'); // today, week, month
    const [userRole, setUserRole] = useState('Admin'); // Admin, Manager, Employee
    const [productivityDay, setProductivityDay] = useState(0); // 0 = Today, -1 = Yesterday, etc.
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [currentCalDate, setCurrentCalDate] = useState(new Date());

    const recentAlerts = React.useMemo(() => notifications?.slice(0, 5) || [], [notifications]);

    const handleDateSelect = React.useCallback((val) => {
        if (!val) return;
        const selected = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);

        const diffTime = today - selected;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        setProductivityDay(-diffDays);
        setShowCalendarModal(false);
    }, []);

    const calendarDays = React.useMemo(() => {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    }, [currentCalDate]);

    const hoursValue = React.useMemo(() => {
        if (timeFrame === 'week') return stats.totalHours.week;
        if (timeFrame === 'month') return stats.totalHours.month;
        return stats.totalHours.today;
    }, [stats.totalHours, timeFrame]);

    const handleTimeFrameChange = React.useCallback((t, e) => {
        e.stopPropagation();
        setTimeFrame(t);
    }, []);

    const handleExport = React.useCallback(() => {
        setShowExportSpinner(true);
        setTimeout(() => {
            setShowExportSpinner(false);
        }, 1500);
    }, []);

    return (
        <div className="space-y-6 sm:space-y-8 pb-10 px-2 sm:px-0">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3.5rem] bg-slate-900 px-4 sm:px-6 md:px-10 py-8 sm:py-12 md:py-16 text-white shadow-[0_30px_60px_rgba(15,23,42,0.15)] dark:shadow-none animate-fade-in group">
                {/* Background effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.15)_0%,transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(139,92,246,0.15)_0%,transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_100%)] opacity-50"></div>

                <div className="relative z-10 flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-center justify-between">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-emerald-500/10 px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] text-emerald-400 border border-emerald-500/20 backdrop-blur-md shadow-lg">
                                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                                </span>
                                LIVE OPS
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] text-slate-300 bg-white/5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                                <Clock size={10} className="text-primary-400 sm:!size-[12px]" strokeWidth={3} />
                                <LiveClock />
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tightest text-white leading-[0.9]">
                            Dashboard <span className="inline-block h-2 w-2 sm:h-4 sm:w-4 rounded-full bg-primary-500 animate-pulse ml-1 sm:ml-2" />
                        </h1>
                        <p className="text-slate-400 font-bold text-sm sm:text-base md:text-xl max-w-lg leading-relaxed opacity-80">
                            Real-time workforce intelligence & high-fidelity performance insights.
                        </p>
                    </div>

                    {/* Responsive Performance Pulse */}
                    <div className="flex w-full lg:w-auto flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 bg-white/5 p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-white/10 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:bg-white/10 cursor-default mt-4 lg:mt-0">
                        <div className="h-14 w-14 md:h-16 md:w-16 rounded-[1.25rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 animate-pulse-glow">
                            <TrendingUp size={24} className="md:!size-[28px]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Performance Pulse</p>
                            <p className="text-base sm:text-lg font-black text-white">Productivity +12.4%</p>
                            <p className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Global Benchmark</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="animate-fade-in">
                {userRole === 'Admin' && (
                    <AdminView
                        stats={stats}
                        isLoading={isLoading}
                        timeFrame={timeFrame}
                        productivityDay={productivityDay}
                        setProductivityDay={setProductivityDay}
                        setShowCalendarModal={setShowCalendarModal}
                        hoursValue={hoursValue}
                        handleTimeFrameChange={handleTimeFrameChange}
                        recentAlerts={recentAlerts}
                        employees={employees}
                        navigate={navigate}
                    />
                )}
                {userRole === 'Manager' && <ManagerView />}
                {userRole === 'Employee' && <EmployeeView />}
            </div>

            {showCalendarModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCalendarModal(false)}></div>
                    <div className="relative w-full max-w-[320px] sm:max-w-sm bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <button
                                onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() - 1)))}
                                className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg sm:rounded-xl transition-colors"
                            >
                                <ChevronLeft size={18} className="sm:!size-[20px]" />
                            </button>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                {currentCalDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() + 1)))}
                                className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg sm:rounded-xl transition-colors"
                            >
                                <ChevronRight size={18} className="sm:!size-[20px]" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                                <div key={idx} className="text-center text-[9px] sm:text-[10px] font-black text-slate-400 py-1 sm:py-2">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((date, idx) => {
                                if (!date) return <div key={`empty-${idx}`} className="h-8 sm:h-10" />;
                                const isToday = date.toDateString() === new Date().toDateString();
                                const isSelected = date.toDateString() === new Date(new Date().setDate(new Date().getDate() + productivityDay)).toDateString();

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isFuture = date > today;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => !isFuture && handleDateSelect(date.toISOString().split('T')[0])}
                                        disabled={isFuture}
                                        className={cn(
                                            "h-8 sm:h-10 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center",
                                            isSelected ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" :
                                                isToday ? "border-2 border-primary-500 text-primary-600" :
                                                    isFuture ? "text-slate-300 dark:text-slate-700 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50" :
                                                        "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                        )}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}