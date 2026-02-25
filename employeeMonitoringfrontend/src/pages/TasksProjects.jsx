import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Layout,
    CheckSquare,
    Clock,
    BarChart3,
    Target,
    Plus,
    MoreHorizontal,
    Search,
    Filter,
    Calendar,
    ChevronDown,
    Flag,
    Zap,
    Users,
    Trash2,
    Edit2,
    GripVertical,
    Kanban,
    List,
    Trophy,
    Activity,
    Briefcase,
    TrendingUp,
    Shield,
    Star,
    ArrowRight,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { performanceKPIs, projectProductivity, workLogs as mockLogs } from '../data/mockData';
import { useRealTime } from '../hooks/RealTimeContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    AreaChart,
    Area
} from 'recharts';

const cn = (...inputs) => twMerge(clsx(inputs));

// --- Modals (Tasks & Objectives) ---
const CreateTaskModal = ({ isOpen, onClose, onSave, defaultStatus = 'To Do', employees = [] }) => {
    const [title, setTitle] = useState('');
    const [assignee, setAssignee] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState(defaultStatus);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setStatus(defaultStatus);
    }, [defaultStatus, isOpen]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => document.body.style.overflow = 'unset';
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, assignee, priority, dueDate, status, project: 'Internal' });
        onClose();
        setTitle('');
        setDueDate('');
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">New Task</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Title</label>
                        <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="Task name..." required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assignee</label>
                            <input
                                type="text"
                                value={assignee}
                                onChange={e => {
                                    setAssignee(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                                placeholder="Type or select assignee..."
                            />
                            {showSuggestions && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl max-h-40 overflow-y-auto z-50">
                                    {employees.filter(e => e.name.toLowerCase().includes(assignee.toLowerCase())).map(e => (
                                        <div
                                            key={e.id}
                                            onClick={() => {
                                                setAssignee(e.name);
                                                setShowSuggestions(false);
                                            }}
                                            className="p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer flex items-center gap-2 transition-colors"
                                        >
                                            <div className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                                <img src={`https://i.pravatar.cc/150?u=${e.name}`} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{e.name}</span>
                                        </div>
                                    ))}
                                    {employees.filter(e => e.name.toLowerCase().includes(assignee.toLowerCase())).length === 0 && (
                                        <div className="p-2.5 text-xs text-slate-400 font-bold text-center">No matches found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm">
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm">
                                <option value="To Do">Backlog</option>
                                <option value="In Progress">In Operations</option>
                                <option value="Review">Quality Assurance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Due Date</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" required />
                        </div>
                    </div>
                    <div className="pt-2 flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Create Task</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

const CreateGoalModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [sub, setSub] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => document.body.style.overflow = 'unset';
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ title, sub, date, progress: 0, icon: Target, color: "text-indigo-600 bg-indigo-50" });
        onClose();
        setTitle('');
        setSub('');
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Define Objective</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Goal Title</label>
                        <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="e.g. Q4 Revenue Target" required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Category / Subtitle</label>
                        <input type="text" value={sub} onChange={e => setSub(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="e.g. Financial Growth" required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Date</label>
                        <input type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="e.g. End of Q4" required />
                    </div>
                    <div className="pt-2 flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Set Goal</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};
const GoalStreamModal = ({ goal, onClose }) => {
    if (!goal) return null;

    const stream = [
        { id: 1, title: "Initial Roadmap Defined", date: "3 weeks ago", status: "Completed", type: "milestone" },
        { id: 2, title: "Resource Allocation Phase", date: "2 weeks ago", status: "Completed", type: "ops" },
        { id: 3, title: "Mid-Cycle Performance Review", date: "4 days ago", status: "In Progress", type: "review" },
        { id: 4, title: "Final Integration Sprint", date: "Expected next week", status: "Pending", type: "upcoming" },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-lg animate-in fade-in duration-300 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className={cn("absolute top-0 right-0 h-48 w-48 translate-x-16 -translate-y-16 rounded-full opacity-[0.03] animate-pulse", goal.color)} />

                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-6">
                        <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center shadow-xl", goal.color)}>
                            <goal.icon size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{goal.title}</h3>
                            <p className="text-xs font-black uppercase text-indigo-500 tracking-widest mt-1">{goal.sub}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-8">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Activity Stream</h4>
                        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                            {stream.map((item, idx) => (
                                <div key={item.id} className="relative pl-12 group">
                                    <div className={cn(
                                        "absolute left-2.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 z-10 transition-transform group-hover:scale-125",
                                        item.status === "Completed" ? "bg-emerald-500" : item.status === "In Progress" ? "bg-amber-500" : "bg-slate-300"
                                    )} />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.date}</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{item.title}</span>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest mt-1.5",
                                            item.status === "Completed" ? "text-emerald-500" : item.status === "In Progress" ? "text-amber-500" : "text-slate-400"
                                        )}>{item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Goal Efficiency</h4>
                            <div className="relative h-24 w-24 mx-auto">
                                <svg className="h-full w-full" viewBox="0 0 36 36">
                                    <path className="text-slate-100 dark:text-slate-800" strokeDasharray="100, 100" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="text-indigo-600" strokeDasharray={`${goal.progress}, 100`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{goal.progress}%</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Stakeholders</h4>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-10 w-10 rounded-2xl border-2 border-white dark:border-slate-900 bg-slate-100 overflow-hidden shadow-lg hover:-translate-y-1 transition-transform">
                                        <img src={`https://i.pravatar.cc/150?u=${goal.id + i}`} className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">Close Stream</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Reusable Components ---

const KPICard = ({ title, value, subValue, trend, icon: Icon, color, delay }) => (
    <div
        className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 animate-slide-up"
        style={{ animationDelay: delay }}
    >
        <div className="flex items-center justify-between mb-6">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg", color)}>
                <Icon size={24} className="text-white" />
            </div>
            {trend !== undefined && (
                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    trend >= 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                )}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</h3>
        <p className="text-4xl font-black text-slate-900 dark:text-white mb-2 leading-none">{value}</p>
        <p className="text-xs font-bold text-slate-500 tracking-tight">{subValue}</p>
    </div>
);

const KanbanColumn = ({ title, tasks, status, color, onAdd }) => {
    // Determine gradient based on column color/status
    const getGradient = () => {
        if (color.includes('slate')) return 'from-slate-300 to-transparent';
        if (color.includes('blue')) return 'from-indigo-500 to-transparent';
        if (color.includes('amber')) return 'from-amber-400 to-transparent';
        if (color.includes('emerald')) return 'from-emerald-500 to-transparent';
        return 'from-slate-400 to-transparent';
    };

    return (
        <div className="flex-1 w-full min-w-0 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-[18px] p-6 flex flex-col h-[600px] border border-slate-100 dark:border-slate-800/60 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out group/col relative overflow-hidden">
            {/* Soft Header Gradient Underline */}
            <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-30 group-hover/col:opacity-100 transition-opacity duration-500", getGradient())} />

            <div className="flex items-center justify-between mb-6 px-1 z-10">
                <div className="flex items-center gap-3">
                    {/* Pulsing Status Dot */}
                    <div className="relative flex items-center justify-center w-3 h-3">
                        <div className={cn("absolute inset-0 rounded-full opacity-40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]", color.replace('bg-', 'bg-'))} />
                        <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm relative z-10", color)} />
                    </div>

                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">{title}</h4>
                    <div className="h-6 min-w-[1.5rem] px-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-[9px] font-black border border-slate-200 dark:border-slate-700/50 shadow-sm backdrop-blur-sm text-slate-500">
                        {tasks.length}
                    </div>
                </div>
                {onAdd && (
                    <button onClick={onAdd} className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-sm flex items-center justify-center">
                        <Plus size={16} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 pl-1 -ml-1 custom-scrollbar thin-scrollbar">
                <style jsx>{`
                    .thin-scrollbar::-webkit-scrollbar { width: 4px; }
                    .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .thin-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                    .dark .thin-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; }
                `}</style>



                {tasks.map((task, index) => {
                    const getCardStyle = (status) => {
                        const baseStyle = "border-[1.5px] rounded-[16px] transition-all duration-300";
                        switch (status) {
                            case 'Pending': // Backlog (Light Gray)
                                return `${baseStyle} border-slate-200 shadow-[0_0_0_1px_rgba(226,232,240,0.15)] hover:shadow-[0_6px_18px_rgba(226,232,240,0.18)]`;

                            case 'In Progress': // Operations (Blue)
                                return `${baseStyle} border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.15)] hover:shadow-[0_6px_18px_rgba(59,130,246,0.18)]`;

                            case 'Review': // QA (Yellow/Amber)
                                return `${baseStyle} border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.15)] hover:shadow-[0_6px_18px_rgba(251,191,36,0.18)]`;

                            case 'Completed': // Finalized (Green)
                                return `${baseStyle} border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.15)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.18)]`;

                            default:
                                return `${baseStyle} border-slate-200 shadow-sm`;
                        }
                    };

                    return (
                        <div
                            key={task.id}
                            className={cn(
                                "bg-white dark:bg-slate-900 p-5 cursor-grab active:cursor-grabbing group animate-in slide-in-from-bottom-2 fade-in fill-mode-both hover:-translate-y-1 hover:scale-[1.01]",
                                getCardStyle(status)
                            )}
                            style={{ animationDelay: `${index * 75}ms`, animationDuration: '400ms' }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-2.5 py-1 rounded-full bg-slate-50/80 dark:bg-slate-800/50 text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-700/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 group-hover:border-indigo-100 dark:group-hover:border-indigo-800 transition-all">
                                    {task.project}
                                </span>
                            </div>

                            <h5 className="text-sm font-black text-slate-900 dark:text-white mb-2 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h5>
                            <p className="text-[10px] font-bold text-slate-400/90 mb-6 line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100">
                                {task.description || "System logic optimization and performance tuning required for the new module..."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50 group-hover:border-indigo-50 dark:group-hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 border-[1.5px] border-white dark:border-slate-700 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                        <img src={`https://i.pravatar.cc/150?u=${task.assignee}`} alt={task.assignee} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 leading-none">{task.assignee.split(' ')[0]}</span>
                                        <span className="text-[8px] font-bold text-slate-400 mt-0.5">{task.dueDate}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                    <Clock size={12} strokeWidth={2.5} />
                                    <span className="text-[9px] font-black tracking-widest">{task.timeSpent || '0h'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {tasks.length === 0 && (
                    <div className="h-40 border-2 border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-[1.25rem] flex flex-col items-center justify-center gap-3 opacity-40 group-hover:opacity-60 transition-opacity">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <CheckSquare size={20} strokeWidth={1.5} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Empty Queue</span>
                    </div>
                )}
            </div>
        </div >
    );
};

// --- Content Page Implementation ---

export function TasksProjects() {
    const { tasks, projects, timeEntries, addProject, updateTaskStatus, addTask, addNotification, employees } = useRealTime();

    // Board, Logs, Projects (Time Tracking + Productivity), Performance (KPIs), Goals
    const [activeTab, setActiveTab] = useState('board');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState('To Do');
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [viewArchive, setViewArchive] = useState(false);
    const [selectedGoalStream, setSelectedGoalStream] = useState(null);

    const openGoalStream = (goal) => {
        setSelectedGoalStream(goal);
    };

    const handleHistoryArchive = () => {
        setViewArchive(!viewArchive);
        addNotification(viewArchive ? "Switched to Live Logs" : "Viewing Archived History", 'info');
    };

    const handleGenerateReport = () => {
        const headers = ['Timestamp', 'Employee', 'Project Phase', 'Detail', 'Duration', 'Efficiency'];
        const rows = (viewArchive ? archivedEntries : timeEntries).map(log => [
            log.date,
            log.employee || log.task.split(' ')[0],
            log.task,
            "Operational Task",
            log.duration,
            "94%"
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `work_logs_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addNotification("Report generated successfully", 'success');
    };

    // Simulated Archived Data
    const archivedEntries = [
        { id: 101, task: "Legacy System Audit", duration: "4h 20m", date: "2023-10-15", employee: "Sarah Connor" },
        { id: 102, task: "Database Migration", duration: "6h 15m", date: "2023-10-14", employee: "John Wick" },
        { id: 103, task: "API Documentation", duration: "2h 30m", date: "2023-10-12", employee: "Ellen Ripley" },
    ];
    // Goals State (Lifted from static)
    const [goals, setGoals] = useState([
        { id: 1, title: "Enterprise Scalability", sub: "Cloud Infrastructure", progress: 85, date: "Due Feb 24", icon: Shield, color: "text-indigo-600 bg-indigo-50" },
        { id: 2, title: "Client Retention 90%+", sub: "Account Management", progress: 72, date: "Ongoing Q1", icon: Users, color: "text-emerald-600 bg-emerald-50" },
        { id: 3, title: "AI Integration Engine", sub: "R&D Prototype", progress: 45, date: "Due Mar 12", icon: Zap, color: "text-amber-600 bg-amber-50" },
        { id: 4, title: "Security Protocols Audit", sub: "Compliance", progress: 100, date: "Completed", icon: Shield, color: "text-blue-600 bg-blue-50" },
        { id: 5, title: "Team Expansion Phase 2", sub: "Talent Acquisition", progress: 20, date: "Due Apr 01", icon: Users, color: "text-purple-600 bg-purple-50" },
    ]);

    const openTaskModal = (status = 'To Do') => {
        setTaskModalDefaultStatus(status);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = (taskData) => {
        addTask(taskData);
    };

    const handleSaveGoal = (goalData) => {
        setGoals(prev => [{ ...goalData, id: Date.now() }, ...prev]);
        addNotification(`Goal "${goalData.title}" set`, 'success');
    };

    const handleFeatureGeneric = (feature) => {
        addNotification(`${feature} feature coming soon`, 'info');
    };


    // Filtered data
    const filteredTasks = useMemo(() =>
        tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.project.toLowerCase().includes(searchQuery.toLowerCase())),
        [tasks, searchQuery]
    );

    const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status || (status === 'To Do' && t.status === 'Pending'));

    // Performance Charts Data
    const radarData = [
        { subject: 'Code Quality', A: 92, fullMark: 100 },
        { subject: 'Velocity', A: 85, fullMark: 100 },
        { subject: 'Communication', A: 95, fullMark: 100 },
        { subject: 'Reliability', A: 88, fullMark: 100 },
        { subject: 'Leadership', A: 78, fullMark: 100 },
        { subject: 'Punctuality', A: 90, fullMark: 100 },
    ];

    const productivityChartData = [
        { name: 'Mon', value: 85 }, { name: 'Tue', value: 92 }, { name: 'Wed', value: 78 },
        { name: 'Thu', value: 95 }, { name: 'Fri', value: 88 }, { name: 'Sat', value: 45 }, { name: 'Sun', value: 40 }
    ];

    return (
        <div className="space-y-6 md:space-y-8 pb-32 animate-fade-in px-4 md:px-0 max-w-full overflow-x-hidden box-border">
            {/* Elegant Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                {/* Left: Title */}
                <div className="shrink-0 flex items-start gap-4 w-full lg:w-auto">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl md:rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] shrink-0">
                        <Briefcase size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white truncate">Enterprise Hub</h1>
                            <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Live Status</span>
                        </div>
                        <p className="text-xs md:text-lg text-slate-400 font-bold tracking-tight mt-1 leading-relaxed">Requirement-driven task management & business intelligence.</p>
                    </div>
                </div>

                {/* Right: Tabs (Separated Chips) */}
                <div className="w-full lg:flex-1 flex flex-wrap items-center justify-center gap-2 md:gap-3">
                    {[
                        { id: 'board', name: 'Board', icon: Kanban },
                        { id: 'logs', name: 'Work Logs', icon: Clock },
                        { id: 'projects', name: 'Projects', icon: Layout },
                        { id: 'performance', name: 'Performance', icon: Trophy },
                        { id: 'goals', name: 'Goals', icon: Target }
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

            {/* Global Context Stats */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Tasks Completed" value={tasks.filter(t => t.status === 'Completed').length} subValue="Across 12 Active Chains" trend={14} icon={CheckSquare} color="bg-indigo-600 shadow-indigo-200" delay="0ms" />
                <KPICard title="Productivity Index" value="94.2%" subValue="Global Average Score" trend={4.2} icon={Zap} color="bg-amber-500 shadow-amber-200" delay="100ms" />
                <KPICard title="Billable Resources" value="1.2k" subValue="Logged Hours this cycle" trend={-2} icon={Clock} color="bg-blue-600 shadow-blue-200" delay="200ms" />
                <KPICard title="Project Milestones" value="08" subValue="Next 72 Hours Projection" trend={12} icon={Target} color="bg-purple-600 shadow-purple-200" delay="300ms" />
            </div>

            {/* Main Dynamic View */}
            <div className="relative">
                {/* 1. KANBAN BOARD VIEW */}
                {activeTab === 'board' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 md:gap-6 justify-between">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search tasks, stakeholders..."
                                    className="w-full h-14 md:h-16 pl-16 pr-8 rounded-[1.25rem] md:rounded-[1.75rem] border-2 border-slate-50 bg-white shadow-sm focus:border-primary-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 font-bold transition-all outline-none text-sm md:text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button onClick={() => openTaskModal('To Do')} className="h-14 md:h-16 px-6 md:px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.25rem] md:rounded-[1.75rem] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <Plus size={18} strokeWidth={3} />
                                <span>Assign Task</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 pb-10 w-full">
                            <KanbanColumn title="Backlog" tasks={getTasksByStatus('To Do')} status="Pending" color="bg-slate-200" />
                            <KanbanColumn title="In Operations" tasks={getTasksByStatus('In Progress')} status="In Progress" color="bg-blue-500" />
                            <KanbanColumn title="Quality Assurance" tasks={getTasksByStatus('Review')} status="Review" color="bg-amber-400" />
                            <KanbanColumn title="Finalized" tasks={getTasksByStatus('Completed')} status="Completed" color="bg-emerald-500" />
                        </div>
                    </div>
                )}

                {/* 2. DAILY WORK LOGS VIEW */}
                {activeTab === 'logs' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1 md:mb-2">{viewArchive ? "Archived Logs" : "Daily Operations Logs"}</h3>
                                    <p className="text-xs md:text-sm font-bold text-slate-400">{viewArchive ? "Historical records." : "Chronological activity stream."}</p>
                                </div>
                                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                                    <button onClick={handleHistoryArchive} className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 dark:border-slate-700 ${viewArchive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900"}`}>{viewArchive ? "Back" : "Archive"}</button>
                                    <button onClick={handleGenerateReport} className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-indigo-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:shadow-xl transition-all shadow-indigo-200">Report</button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                                        <tr>
                                            {['Timestamp', 'Employee', 'Project Phase', 'Operation Detail', 'Duration', 'Efficiency'].map(h => (
                                                <th key={h} className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {(viewArchive ? archivedEntries : timeEntries).map(log => (
                                            <tr key={log.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 md:px-10 py-4 md:py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{log.date}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Stream Seq-{log.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-10 py-4 md:py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                                            <img src={`https://i.pravatar.cc/150?u=${log.employee || log.task.split(' ')[0]}`} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{log.employee || 'System'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-10 py-4 md:py-6">
                                                    <span className="px-2 md:px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                                                        {log.task.split(':')[0]}
                                                    </span>
                                                </td>
                                                <td className="px-6 md:px-10 py-4 md:py-6 max-w-sm">
                                                    <p className="text-sm font-bold text-slate-500 line-clamp-1 group-hover:line-clamp-none transition-all duration-500 leading-relaxed overflow-hidden">
                                                        {log.description || log.task}
                                                    </p>
                                                </td>
                                                <td className="px-6 md:px-10 py-4 md:py-6">
                                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                                        <Clock size={12} className="text-slate-400" />
                                                        <span className="text-sm font-black tracking-widest">{log.duration}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-10 py-4 md:py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-10 md:w-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" style={{ width: '92%' }} />
                                                        </div>
                                                        <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase">High</span>
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

                {/* 3. PROJECTS & PRODUCTIVITY VIEW */}
                {activeTab === 'projects' && (
                    <div className="space-y-6 md:space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            {/* Intelligence by Client/Project */}
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 md:mb-8">Intelligence By Client</h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={projectProductivity} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', fill: '#94a3b8' }} dy={20} />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                                            />
                                            <Bar dataKey="productivityScore" name="Score Index" radius={[12, 12, 0, 0]} barSize={40}>
                                                {projectProductivity.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#10b981'][index % 3]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-3 gap-6 mt-10">
                                    {projectProductivity.map((p, idx) => (
                                        <div key={p.name} className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.name}</span>
                                            <div className="flex items-end gap-2 text-2xl font-black text-slate-900 dark:text-white">
                                                {p.productivityScore}%
                                                <span className="text-[10px] text-emerald-500 mb-1">+2.4</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resource Exposure / Time Spent */}
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 md:mb-8">Resource Exposure</h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={projectProductivity}
                                                cx="50%" cy="50%"
                                                innerRadius={80}
                                                outerRadius={140}
                                                paddingAngle={10}
                                                dataKey="timeSpent"
                                                nameKey="name"
                                            >
                                                {projectProductivity.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#f59e0b', '#10b981'][index % 3]} className="outline-none" />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-10 mt-6">
                                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-indigo-500" /><span className="text-xs font-black uppercase text-slate-500 tracking-widest">Active Phases</span></div>
                                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-amber-500" /><span className="text-xs font-black uppercase text-slate-500 tracking-widest">Maintenance</span></div>
                                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-emerald-500" /><span className="text-xs font-black uppercase text-slate-500 tracking-widest">Completed</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Project Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                            {projects.map(project => (
                                <div key={project.id} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-500">
                                    <div className={cn("absolute top-0 right-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full opacity-[0.05] transition-transform group-hover:scale-150 duration-700", project.color)} />
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg", project.color)}>
                                            <Activity size={24} />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">{project.status}</span>
                                            <div className="h-1.5 w-16 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full transition-all duration-1000", project.color)} style={{ width: `${project.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{project.name}</h4>
                                    <p className="text-xs font-bold text-slate-400 mb-8 tracking-[0.05em]">Client: <span className="text-slate-900 dark:text-slate-300 font-black">{project.client}</span></p>

                                    <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Efficiency</span>
                                            <span className="font-black text-slate-900 dark:text-white">92.4%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Active Milestones</span>
                                            <span className="font-black text-slate-900 dark:text-white">04 / 12</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Lead Stakeholder</span>
                                            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 overflow-hidden shadow-sm">
                                                <img src={`https://i.pravatar.cc/150?u=${project.id}`} className="h-full w-full object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. PERFORMANCE KPIs VIEW */}
                {activeTab === 'performance' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Detailed Performance Table with high-fidelity scores */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
                                <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <h3 className="text-xl md:text-2xl font-black">Performance Audit Board</h3>
                                    <button className="h-10 w-10 bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-xl text-slate-400"><Filter size={18} /></button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                                            <tr>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Employee</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Quality</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Punctuality</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Output</th>
                                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Composite Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {performanceKPIs.map(kpi => (
                                                <tr key={kpi.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-[1rem] bg-slate-100 overflow-hidden shadow-lg border-2 border-white dark:border-slate-800 transition-transform group-hover:scale-110">
                                                                <img src={`https://i.pravatar.cc/150?u=${kpi.employee}`} alt={kpi.employee} className="h-full w-full object-cover" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">{kpi.employee}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lead Ops</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-center"><span className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">{kpi.reliability}%</span></td>
                                                    <td className="px-10 py-6 text-center"><span className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">{kpi.timeliness}%</span></td>
                                                    <td className="px-10 py-6 text-center"><span className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50">{kpi.productivity}%</span></td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center justify-center gap-4">
                                                            <div className="flex-1 max-w-[120px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                                <div className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]", kpi.overall > 90 ? "bg-emerald-500 shadow-emerald-500/50" : "bg-indigo-600 shadow-indigo-500/50")} style={{ width: `${kpi.overall}%` }} />
                                                            </div>
                                                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{kpi.overall}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Radar Visualization */}
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col items-center">
                                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-6 md:mb-10 uppercase tracking-widest text-center">Global Competency Radar</h3>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', fill: '#94a3b8' }} />
                                            <Radar name="Team Avg" dataKey="A" stroke="#4f46e1" strokeWidth={4} fill="#4f46e1" fillOpacity={0.15} />
                                            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-8 space-y-4 w-full">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><Star size={16} fill="currentColor" /></div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Top Skill</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">Communication</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600"><Shield size={16} /></div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Stability</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white text-emerald-500">Very High</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. GOAL & MILESTONE TRACKING VIEW */}
                {activeTab === 'goals' && (
                    <div className="space-y-6 md:space-y-10 animate-fade-in">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Active Strategic Goals</h3>
                                <p className="text-xs md:text-sm text-slate-400 font-bold tracking-tight">Requirement-based milestone tracking across the organization.</p>
                            </div>
                            <button onClick={() => setIsGoalModalOpen(true)} className="w-full sm:w-auto h-14 px-8 bg-indigo-600 text-white rounded-[1.25rem] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                                <Plus size={18} /> <span>Define Objective</span>
                            </button>
                        </div>

                        {/* Milestones Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {goals.map(goal => (
                                <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12", goal.color)}>
                                            <goal.icon size={28} />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{goal.date}</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{goal.progress}%</span>
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">{goal.title}</h4>
                                    <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-8">{goal.sub}</p>

                                    <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex items-center px-0.5">
                                        <div className={cn("h-1 rounded-full transition-all duration-2000 ease-out shadow-[0_0_10px_currentColor]", goal.color.split(' ')[0])} style={{ width: `${goal.progress}%` }} />
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-8 w-8 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-100 overflow-hidden shadow-sm">
                                                    <img src={`https://i.pravatar.cc/150?u=${goal.id + i}`} className="h-full w-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => openGoalStream(goal)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all group/btn">
                                            Explore Stream <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <CreateTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveTask}
                defaultStatus={taskModalDefaultStatus}
                employees={employees}
            />

            <CreateGoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onSave={handleSaveGoal}
            />

            <GoalStreamModal
                goal={selectedGoalStream}
                onClose={() => setSelectedGoalStream(null)}
            />
        </div>
    );
}
