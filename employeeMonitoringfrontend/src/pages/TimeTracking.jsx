import React, { useState, useEffect } from 'react';
import { Play, Square, Plus, MoreHorizontal, Clock, Coffee, AlertTriangle, Calendar, ChevronLeft, ChevronRight, BarChart2, X } from 'lucide-react';
import { useRealTime } from '../hooks/RealTimeContext';
import { InteractiveCard } from '../components/ui/InteractiveCard';
import { clsx } from 'clsx';
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';

const ProgressBar = ({ value, label, sublabel, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <span className="text-slate-500">{sublabel}</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

// --- New Component: Visual Timeline ---
const TimelineSegment = ({ start, duration, type, label }) => {
    // start is hour (0-24), duration in hours
    const left = (start / 24) * 100;
    const width = (duration / 24) * 100;

    const colors = {
        work: 'bg-emerald-500',
        meeting: 'bg-indigo-500',
        break: 'bg-amber-400',
        idle: 'bg-slate-300 dark:bg-slate-600'
    };

    return (
        <div
            className="absolute h-full top-0 first:rounded-l-lg last:rounded-r-lg group cursor-pointer"
            style={{ left: `${left}%`, width: `${width}%` }}
        >
            <div className={clsx("h-full w-full opacity-80 hover:opacity-100 transition-opacity", colors[type])}></div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                <div className="bg-slate-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                    {label} ({duration}h)
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1"></div>
            </div>
        </div>
    );
};

const VisualTimeline = ({ date }) => {
    // Generate semi-random mock data based on the date to simulate "working" state
    const seed = date.getDate() + date.getMonth() * 10;
    const segments = [
        { start: 8 + (seed % 2), duration: 2, type: 'work', label: 'Morning Task' },
        { start: 10 + (seed % 2), duration: 1, type: 'meeting', label: 'Team Standup' },
        { start: 11.5, duration: 0.5, type: 'break', label: 'Quick Break' },
        { start: 12, duration: 2 + (seed % 1.5), type: 'work', label: 'Deep Work' },
        { start: 14 + (seed % 1), duration: 0.8, type: 'break', label: 'Lunch' },
        { start: 15, duration: 2, type: 'work', label: 'Feature Dev' },
        { start: 17.5, duration: 1, type: 'idle', label: 'Review' },
    ];

    const hours = Array.from({ length: 25 }, (_, i) => i);

    return (
        <div className="relative pt-6 pb-2">
            {/* Time Markers */}
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-2 px-1">
                {hours.filter(h => h % 3 === 0).map(h => (
                    <span key={h}>{h}:00</span>
                ))}
            </div>

            {/* Timeline Track */}
            <div className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                {/* Background Grid */}
                <div className="absolute inset-0 flex">
                    {hours.map(h => (
                        <div key={h} className="flex-1 border-r border-slate-200 dark:border-slate-700/50 last:border-0"></div>
                    ))}
                </div>

                {/* Segments */}
                {segments.map((seg, i) => (
                    <TimelineSegment key={i} {...seg} />
                ))}
            </div>
            <div className="flex gap-4 mt-4 justify-center">
                {['Work', 'Meeting', 'Break', 'Idle'].map(type => (
                    <div key={type} className="flex items-center gap-2">
                        <div className={clsx("w-3 h-3 rounded-full",
                            type === 'Work' ? "bg-emerald-500" :
                                type === 'Meeting' ? "bg-indigo-500" :
                                    type === 'Break' ? "bg-amber-400" : "bg-slate-300 dark:bg-slate-600"
                        )}></div>
                        <span className="text-xs text-slate-500 font-medium">{type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Generate static mock data outside component to prevent re-render flickering
const heatmapMockData = Array.from({ length: 30 }, (_, i) => {
    const val = Math.random() * 10;
    return {
        id: i + 1,
        day: i + 1,
        hours: val > 2 ? val : 0,
        intensity: val > 8 ? 'bg-emerald-600' : val > 6 ? 'bg-emerald-500' : val > 4 ? 'bg-emerald-400' : val > 0 ? 'bg-emerald-300' : 'bg-slate-100 dark:bg-slate-800'
    };
});

// --- New Component: Shift Heatmap ---
const HeatmapView = () => {
    const [hoveredDayId, setHoveredDayId] = useState(null);
    const days = heatmapMockData;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Monthly Attendance Intensity</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-300"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-500"></div>
                        <div className="w-2 h-2 rounded-sm bg-emerald-600"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map((d) => (
                    <div
                        key={d.id}
                        className="relative"
                        onMouseEnter={() => setHoveredDayId(d.id)}
                        onMouseLeave={() => setHoveredDayId(null)}
                    >
                        <div className={clsx(
                            "aspect-square rounded-md cursor-pointer",
                            d.intensity
                        )}></div>

                        {hoveredDayId === d.id && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-[100] pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
                                <div className="bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap border border-white/10">
                                    Day {d.day}: {d.hours.toFixed(1)}h
                                </div>
                                <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 border-r border-b border-white/10"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export function TimeTracking() {
    const {
        timer,
        toggleTimer,
        startTimer,
        pauseTimer,
        timeEntries,
        addTimeEntry
    } = useRealTime();

    const [isOnBreak, setIsOnBreak] = useState(false);
    const [showIdleAlert, setShowIdleAlert] = useState(true);
    const [viewMode, setViewMode] = useState('Timeline'); // Timeline, List
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [timelineDate, setTimelineDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date()); // State for calendar viewpoint

    const handlePrevDay = () => {
        const d = new Date(timelineDate);
        d.setDate(d.getDate() - 1);
        setTimelineDate(d);
    };

    const handleNextDay = () => {
        const d = new Date(timelineDate);
        d.setDate(d.getDate() + 1);
        if (d > new Date()) return; // Block future dates
        setTimelineDate(d);
    };

    const handleDateSelect = (date) => {
        if (date > new Date()) return;
        setTimelineDate(new Date(date));
        setShowCalendar(false);
    };

    const isToday = timelineDate.toDateString() === new Date().toDateString();

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Time Tracking</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Manage productivity and work sessions.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Clock size={16} className="text-primary-500" />
                    <span className="font-mono font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">

                {/* Timer Column */}
                <div className="col-span-1 space-y-6">
                    {/* Timer Widget */}
                    <div className="rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden shadow-2xl shadow-slate-900/20">
                        <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-slate-800 blur-3xl opacity-50"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Current Session</h3>
                            <div className="text-6xl font-black font-mono tracking-tighter mb-4">
                                {formatTime(timer.seconds)}
                            </div>
                            <p className="text-lg font-medium text-slate-300 mb-8 max-w-[80%] text-center line-clamp-1">
                                {timer.currentTask || "Ready to start?"}
                            </p>

                            <div className="flex gap-8 items-center">
                                <button
                                    onClick={() => {
                                        if (timer.isRunning) {
                                            pauseTimer();
                                            setIsOnBreak(true);
                                        } else if (isOnBreak) {
                                            startTimer(timer.currentTask);
                                            setIsOnBreak(false);
                                        } else {
                                            alert('Start a session first to take a break!');
                                        }
                                    }}
                                    className={clsx(
                                        "h-14 w-14 rounded-full flex items-center justify-center border-2 transition-all hover:bg-slate-800",
                                        isOnBreak
                                            ? "text-amber-400 border-amber-400 bg-amber-400/10 animate-pulse"
                                            : "text-slate-400 border-slate-700 hover:text-white"
                                    )}
                                    title={isOnBreak ? "Resume Work" : "Take a Break"}
                                >
                                    <Coffee size={24} />
                                </button>

                                <button
                                    onClick={() => {
                                        toggleTimer(timer.currentTask || 'General Work');
                                        if (timer.isRunning) setIsOnBreak(false);
                                    }}
                                    className={clsx(
                                        "h-24 w-24 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95",
                                        timer.isRunning ? "bg-red-500 text-white shadow-red-500/30" : "bg-emerald-500 text-white shadow-emerald-500/30"
                                    )}
                                >
                                    {timer.isRunning ? <Square size={32} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Today's Stats */}
                    <InteractiveCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Today's Progress</h3>
                            <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">On Track</span>
                        </div>
                        <div className="space-y-5">
                            <ProgressBar label="Scheduled" sublabel="6h / 8h" value={75} color="bg-primary-500" />
                            <ProgressBar label="Active" sublabel="5h 15m" value={65} color="bg-emerald-500" />
                            <ProgressBar label="Idle" sublabel="45m" value={20} color="bg-amber-400" />
                        </div>
                    </InteractiveCard>

                    {/* Heatmap Widget - STATIC CONTAINER TO PREVENT COLOR BLEED */}
                    <div className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <HeatmapView />
                    </div>
                </div>

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Visual Timeline Card */}
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Activity Timeline</h3>
                                <p className="text-sm text-slate-500">Visual breakdown of your day</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevDay}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-primary-600"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-black transition-all shadow-sm border group/btn",
                                        isToday
                                            ? "bg-primary-50 border-primary-100 text-primary-600 dark:bg-primary-900/20 dark:border-primary-800 hover:bg-primary-100"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-primary-300 dark:bg-slate-800 dark:border-slate-700"
                                    )}
                                >
                                    <Calendar size={14} className={clsx("transition-transform group-hover/btn:scale-110", isToday ? "text-primary-500" : "text-slate-400")} />
                                    <span className="uppercase tracking-widest text-[10px]">
                                        {isToday ? 'Today' : timelineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </button>
                                <button
                                    onClick={handleNextDay}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-primary-600"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                        <VisualTimeline date={timelineDate} />
                    </div>

                    {/* Work Logs List / Cards */}
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold">Work Sessions</h3>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 text-sm bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                <Plus size={16} /> Add Entry
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {timeEntries.map((item, idx) => (
                                <div key={item.id} className="group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-md transition-all dark:bg-slate-800/50 dark:hover:bg-slate-800">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                        <Clock size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{item.task}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{item.project || 'General Project'}</p>
                                            </div>
                                            <span className="text-xl font-mono font-bold text-slate-700 dark:text-slate-300">{item.duration}</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-400 font-medium">
                                            <span>{item.time || '10:00 AM - 12:00 PM'}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                                            <span className={clsx(
                                                "uppercase tracking-wider",
                                                item.status === 'Verified' ? "text-emerald-500" : "text-amber-500"
                                            )}>{item.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Modal (Kept same logic, just styled wrapper) */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    {/* ... Same modal content as before but ensuring consistent styles ... */}
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Add Manual Entry</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const newEntry = {
                                task: formData.get('task'),
                                project: formData.get('project'),
                                duration: formData.get('duration'),
                                status: 'Pending',
                                day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
                            };
                            addTimeEntry(newEntry);
                            setShowAddModal(false);
                        }}>
                            {/* Form fields */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Task Description</label>
                                <input required name="task" type="text" placeholder="What did you work on?" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project</label>
                                <input required name="project" type="text" placeholder="e.g. Design System" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration (HH:MM:SS)</label>
                                <input required name="duration" type="text" placeholder="e.g. 01:30:00" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 font-mono" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Calendar Modal */}
            {showCalendar && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-white/50 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Select Date</h3>
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        const d = new Date(viewDate);
                                        d.setMonth(d.getMonth() - 1);
                                        setViewDate(d);
                                    }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-primary-500"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        const d = new Date(viewDate);
                                        d.setMonth(d.getMonth() + 1);
                                        setViewDate(d);
                                    }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-primary-500"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-1"></div>
                                <button onClick={() => setShowCalendar(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d.charAt(0)}</div>
                            ))}
                            {(() => {
                                const year = viewDate.getFullYear();
                                const month = viewDate.getMonth();
                                const firstDay = new Date(year, month, 1).getDay();
                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                const prevMonthDays = new Date(year, month, 0).getDate();

                                const cells = [];

                                // Padding from previous month
                                for (let i = firstDay - 1; i >= 0; i--) {
                                    cells.push(
                                        <div key={`prev-${i}`} className="h-10 w-10 flex items-center justify-center text-xs text-slate-100 dark:text-slate-800 pointer-events-none">
                                            {prevMonthDays - i}
                                        </div>
                                    );
                                }

                                // Current month days
                                for (let day = 1; day <= daysInMonth; day++) {
                                    const date = new Date(year, month, day);
                                    const isFuture = date > new Date();
                                    const isSelected = date.toDateString() === timelineDate.toDateString();
                                    const isTodayDate = date.toDateString() === new Date().toDateString();

                                    cells.push(
                                        <button
                                            key={`day-${day}`}
                                            disabled={isFuture}
                                            onClick={() => handleDateSelect(date)}
                                            className={clsx(
                                                "h-10 w-10 flex items-center justify-center rounded-xl text-sm font-black transition-all relative",
                                                isSelected ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-110 z-10" :
                                                    isFuture ? "text-slate-200 dark:text-slate-800 cursor-not-allowed" :
                                                        "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            {day}
                                            {isTodayDate && !isSelected && (
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"></div>
                                            )}
                                        </button>
                                    );
                                }

                                return cells;
                            })()}
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => {
                                    handleDateSelect(new Date());
                                    setViewDate(new Date());
                                }}
                                className="flex-1 py-3 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-100 transition-all"
                            >
                                Go to Today
                            </button>
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="flex-1 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
