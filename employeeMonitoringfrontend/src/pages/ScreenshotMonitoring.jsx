import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
    Grid,
    List,
    Filter,
    Eye,
    EyeOff,
    Calendar,
    Download,
    Trash2,
    Clock,
    ChevronDown,
    Search,
    CheckCircle2,
    X,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Settings,
    Shield,
    Camera,
    RefreshCw,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRealTime } from '../hooks/RealTimeContext';

const cn = (...inputs) => twMerge(clsx(inputs));

// --- Components ---

const FilterButton = memo(({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
            active
                ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
        )}
    >
        {Icon && <Icon size={14} />}
        {label}
    </button>
));

FilterButton.displayName = 'FilterButton';

const ToggleSwitch = memo(({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between w-full bg-white p-3 sm:p-2 sm:pr-4 rounded-xl border border-slate-200 shadow-sm min-h-[44px]">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                "relative h-6 w-10 flex-shrink-0 rounded-full transition-colors duration-300 focus:outline-none",
                enabled ? "bg-emerald-500" : "bg-slate-200"
            )}
        >
            <span
                className={cn(
                    "block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300",
                    enabled ? "translate-x-5" : "translate-x-1"
                )}
            />
        </button>
    </div>
));

ToggleSwitch.displayName = 'ToggleSwitch';

const ScreenshotCard = memo(({ id, id_val, time, url, isBlurred, employee, onDelete, viewMode, onDownload, globalBlur, onView }) => {
    const [localBlur, setLocalBlur] = useState(isBlurred);
    const effectiveBlur = globalBlur || localBlur;

    const handleView = useCallback(() => {
        onView({ id: id_val || id, time, url, isBlurred, employee, localBlur, effectiveBlur });
    }, [onView, id, id_val, time, url, isBlurred, employee, localBlur, effectiveBlur]);

    const handleBlurToggle = useCallback((e) => {
        e.stopPropagation();
        setLocalBlur(prev => !prev);
    }, []);

    const handleDownloadClick = useCallback((e) => {
        e.stopPropagation();
        onDownload(url);
    }, [onDownload, url]);

    const handleDeleteClick = useCallback((e) => {
        e.stopPropagation();
        onDelete(id_val || id);
    }, [onDelete, id, id_val]);

    if (viewMode === 'list') {
        return (
            <div
                onClick={handleView}
                className="group flex items-center bg-white rounded-2xl border border-slate-100 p-3 hover:shadow-lg transition-all duration-300 hover:-translate-x-1 cursor-pointer"
            >
                <div className="relative h-16 aspect-video rounded-xl overflow-hidden bg-slate-50 mr-4 border border-slate-100 flex-shrink-0">
                    <img
                        src={url}
                        alt={time}
                        loading="lazy"
                        className={cn("h-full w-full object-cover transition-all", effectiveBlur && "blur-md scale-110")}
                    />
                    {effectiveBlur && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield size={10} className="text-white" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                            {employee ? employee.charAt(0) : 'A'}
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 truncate">{employee}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{time}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity px-1 sm:px-2" onClick={e => e.stopPropagation()}>
                    <button onClick={handleBlurToggle} className="p-2 sm:p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        {localBlur ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={handleDownloadClick} className="p-2 sm:p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <Download size={16} />
                    </button>
                    <div className="hidden sm:block h-4 w-[1px] bg-slate-100 mx-1" />
                    <button onClick={handleDeleteClick} className="p-2 sm:p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleView}
            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-50">
                <img
                    src={url}
                    alt={`Screenshot at ${time}`}
                    loading="lazy"
                    className={cn(
                        "h-full w-full object-cover transition-all duration-700",
                        effectiveBlur ? "blur-xl scale-110 opacity-80" : "group-hover:scale-105"
                    )}
                />

                {effectiveBlur && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white shadow-lg">
                            <Shield size={12} className="text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Privacy Blur</span>
                        </div>
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
                    <div className="flex items-center justify-between translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBlurToggle}
                                className="h-9 w-9 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
                                title={localBlur ? "Reveal" : "Blur"}
                            >
                                {localBlur ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <button
                                onClick={handleDownloadClick}
                                className="h-9 w-9 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
                                title="Download"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                        <button
                            onClick={handleDeleteClick}
                            className="h-9 w-9 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white relative z-20">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {employee ? employee.charAt(0) : 'A'}
                        </div>
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{employee || "Unknown"}</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {time}
                    </span>
                </div>
            </div>
        </div>
    );
});

ScreenshotCard.displayName = 'ScreenshotCard';

export function ScreenshotMonitoring() {
    const { screenshots, deleteScreenshot } = useRealTime();

    // State for new controls
    const [randomScreenshots, setRandomScreenshots] = useState(true);
    const [globalBlur, setGlobalBlur] = useState(false);
    const [frequency, setFrequency] = useState('10m');
    const [captureRule, setCaptureRule] = useState('All Apps');
    const [excludeSensitive, setExcludeSensitive] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState('All');

    // View & Filter State
    const [viewMode, setViewMode] = useState('grid');
    const [timelineDate, setTimelineDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(employeeSearchQuery), 300);
        return () => clearTimeout(timer);
    }, [employeeSearchQuery]);

    // Functional states for modals
    const [showRestrictedApps, setShowRestrictedApps] = useState(false);
    const [showCaptureRules, setShowCaptureRules] = useState(false);
    const [restrictedApps, setRestrictedApps] = useState(['Telegram', 'WhatsApp', 'Facebook', 'Steam']);
    const [newApp, setNewApp] = useState('');
    const [rules, setRules] = useState([
        { id: 1, name: 'Work Hours Only', enabled: true, desc: '9 AM - 6 PM' },
        { id: 2, name: 'Keypad Monitoring', enabled: false, desc: 'Capture on activity' },
        { id: 3, name: 'Idle Timeout', enabled: true, desc: 'Pause after 5m idle' },
    ]);

    // Detail View & Archive State
    const [selectedScreenshot, setSelectedScreenshot] = useState(null);
    const [localScreenshots, setLocalScreenshots] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        return [
            { id: 1, time: '10:20 AM', date: todayStr, url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', employee: 'Jane Smith', isBlurred: true, status: 'Idle', department: 'Design' },
            { id: 2, time: '10:25 AM', date: todayStr, url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800', employee: 'Alex Johnson', isBlurred: false, status: 'Active', department: 'Development' },
            { id: 3, time: '10:30 AM', date: todayStr, url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800', employee: ' Sarah Brown', isBlurred: false, status: 'Active', department: 'Management' },
            { id: 4, time: '10:45 AM', date: todayStr, url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800', employee: 'Jane Smith', isBlurred: false, status: 'Active', department: 'Design' },
            { id: 5, time: '11:00 AM', date: todayStr, url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800', employee: 'Alex Johnson', isBlurred: false, status: 'Active', department: 'Development' },
            { id: 6, time: '11:15 AM', date: todayStr, url: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&q=80&w=800', employee: 'Sarah Brown', isBlurred: true, status: 'Idle', department: 'Management' },
            { id: 7, time: '11:30 AM', date: todayStr, url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800', employee: 'Mike Wilson', isBlurred: false, status: 'Active', department: 'Support' },
            { id: 8, time: '11:45 AM', date: todayStr, url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800', employee: 'Jane Smith', isBlurred: false, status: 'Active', department: 'Design' },
            { id: 9, time: '12:00 PM', date: todayStr, url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800', employee: 'Alex Johnson', isBlurred: false, status: 'Active', department: 'Development' },
        ];
    });
    const [isLoadingArchive, setIsLoadingArchive] = useState(false);

    // 2. Filter & Derived Logic (Optimized with useMemo)
    const uniqueEmployees = useMemo(() => ['All', ...new Set(localScreenshots.map(s => s.employee))], [localScreenshots]);

    const filteredScreenshots = useMemo(() => localScreenshots.filter(s => {
        const year = timelineDate.getFullYear();
        const month = String(timelineDate.getMonth() + 1).padStart(2, '0');
        const day = String(timelineDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (s.date && s.date !== dateStr) return false;
        if (selectedEmployee !== 'All' && s.employee !== selectedEmployee) return false;
        if (activeFilter === 'Flagged' && !s.isBlurred) return false;
        if (activeFilter === 'Idle' && s.status !== 'Idle') return false;
        if (excludeSensitive && s.employee === 'John Doe') return false;
        return true;
    }), [localScreenshots, selectedEmployee, activeFilter, excludeSensitive, timelineDate]);

    const progress = useMemo(() =>
        filteredScreenshots.length > 0 ? ((playbackIndex + 1) / filteredScreenshots.length) * 100 : 0
        , [playbackIndex, filteredScreenshots]);

    const currentPlaybackTime = useMemo(() =>
        filteredScreenshots[playbackIndex]?.time || "09:00 AM"
        , [playbackIndex, filteredScreenshots]);

    // 3. Optimized Handlers (useCallback)
    const handleCloseModal = useCallback(() => {
        setSelectedScreenshot(null);
        setIsPlaying(false);
    }, []);

    const handleNext = useCallback(() => {
        if (filteredScreenshots.length === 0) return;
        const nextIndex = (playbackIndex + 1) % filteredScreenshots.length;
        setPlaybackIndex(nextIndex);
        const nextItem = filteredScreenshots[nextIndex];
        setSelectedScreenshot({
            ...nextItem,
            effectiveBlur: globalBlur || nextItem.isBlurred
        });
    }, [filteredScreenshots, playbackIndex, globalBlur]);

    const handlePrev = useCallback(() => {
        if (filteredScreenshots.length === 0) return;
        const prevIndex = (playbackIndex - 1 + filteredScreenshots.length) % filteredScreenshots.length;
        setPlaybackIndex(prevIndex);
        const prevItem = filteredScreenshots[prevIndex];
        setSelectedScreenshot({
            ...prevItem,
            effectiveBlur: globalBlur || prevItem.isBlurred
        });
    }, [filteredScreenshots, playbackIndex, globalBlur]);

    const handleLoadArchive = useCallback(async () => {
        if (isLoadingArchive) return;
        setIsLoadingArchive(true);
        const delay = (ms) => new Promise(res => setTimeout(res, ms));
        try {
            await delay(800);
            const year = timelineDate.getFullYear();
            const month = String(timelineDate.getMonth() + 1).padStart(2, '0');
            const day = String(timelineDate.getDate()).padStart(2, '0');
            const targetDateStr = `${year}-${month}-${day}`;

            const batchSize = 10;
            const archiveData = Array.from({ length: batchSize }).map((_, i) => ({
                id: `arc-${Date.now()}-${i}`,
                id_val: `arc-${Date.now()}-${i}`,
                time: `${8 + Math.floor(i / 2)}:${(i % 2) * 30 + 10} AM`,
                date: targetDateStr,
                url: `https://picsum.photos/seed/${Math.random()}/800/450`,
                employee: ['Sarah Brown', 'Alex Johnson', 'Mike Wilson', 'John Doe'][Math.floor(Math.random() * 4)],
                isBlurred: Math.random() > 0.7,
                status: Math.random() > 0.8 ? 'Idle' : 'Active',
                department: 'Engineering'
            }));
            setLocalScreenshots(prev => [...archiveData, ...prev]);
        } finally {
            setIsLoadingArchive(false);
        }
    }, [isLoadingArchive, timelineDate]);

    const handleDelete = useCallback((id) => {
        if (confirm('Delete this screenshot permanently?')) deleteScreenshot(id);
    }, [deleteScreenshot]);

    const handleDownload = useCallback((url) => {
        alert("Downloading encrypted screenshot...");
    }, []);

    const handleViewScreenshot = useCallback((screenshot, index) => {
        setPlaybackIndex(index);
        setSelectedScreenshot({
            ...screenshot,
            effectiveBlur: globalBlur || screenshot.isBlurred
        });
    }, [globalBlur]);

    const handleDateSelect = useCallback((date) => {
        if (date > new Date()) return;
        setTimelineDate(new Date(date));
        setShowCalendar(false);
        setPlaybackIndex(0);
        setIsPlaying(false);
    }, []);

    const isToday = timelineDate.toDateString() === new Date().toDateString();

    // 4. Effects
    // Auto-load data for new dates if none exists
    useEffect(() => {
        const year = timelineDate.getFullYear();
        const month = String(timelineDate.getMonth() + 1).padStart(2, '0');
        const day = String(timelineDate.getDate()).padStart(2, '0');
        const targetDate = `${year}-${month}-${day}`;

        const hasData = localScreenshots.some(s => s.date === targetDate);
        if (!hasData) {
            const mockItems = Array.from({ length: 8 }).map((_, i) => ({
                id: `auto-${targetDate}-${i}`,
                id_val: `auto-${targetDate}-${i}`,
                time: `${9 + Math.floor(i / 2)}:${(i % 2) * 30 + 15} AM`,
                date: targetDate,
                url: `https://images.unsplash.com/photo-${1517694712202 + i}-14dd9538aa97?auto=format&fit=crop&q=80&w=800`,
                employee: ['Jane Smith', 'Sarah Brown', 'Alex Johnson', 'Mike Wilson'][i % 4],
                isBlurred: Math.random() > 0.7,
                status: 'Active',
                department: 'Development'
            }));
            setLocalScreenshots(prev => [...prev, ...mockItems]);
        }
    }, [timelineDate]); // Only trigger on date change

    useEffect(() => {
        if (localScreenshots.length === 0 && screenshots.length > 0) {
            setLocalScreenshots(screenshots);
        }
    }, [screenshots, localScreenshots.length]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedScreenshot) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') handleCloseModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedScreenshot, handleNext, handlePrev, handleCloseModal]);



    // Playback Logic
    useEffect(() => {
        let interval;
        if (isPlaying && filteredScreenshots.length > 0) {
            // Auto-open modal on first play if not already open
            const currentItem = filteredScreenshots[playbackIndex];
            if (currentItem) {
                setSelectedScreenshot({
                    ...currentItem,
                    effectiveBlur: globalBlur || currentItem.isBlurred
                });
            }

            interval = setInterval(() => {
                setPlaybackIndex((prev) => {
                    const next = prev + 1;
                    if (next >= filteredScreenshots.length) {
                        setIsPlaying(false);
                        setSelectedScreenshot(null); // Close modal when finished
                        return 0;
                    }

                    // Update modal content for next item
                    const nextItem = filteredScreenshots[next];
                    if (nextItem) {
                        setSelectedScreenshot({
                            ...nextItem,
                            effectiveBlur: globalBlur || nextItem.isBlurred
                        });
                    }
                    return next;
                });
            }, 2000); // 2 seconds per slide for better visibility in modal
        }
        return () => clearInterval(interval);
    }, [isPlaying, filteredScreenshots, globalBlur]);



    return (
        <>
            <div className="space-y-6 sm:space-y-8 pb-20 px-4 sm:px-0 max-w-full overflow-x-hidden box-border animate-fade-in">
                {/* 1. Header & Primary Controls */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Screenshot Gallery</h1>
                        <p className="text-sm text-slate-500 font-medium">Visual verification and productivity monitoring.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Employee Selector (Searchable) */}
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                                className="flex items-center gap-2 w-full sm:min-w-[180px] px-4 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all justify-between min-h-[44px]"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <Search size={16} className="text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{selectedEmployee === 'All' ? 'All Employees' : selectedEmployee}</span>
                                </div>
                                <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                            </button>

                            {showEmployeeDropdown && (
                                <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 sm:w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                    <div className="p-2 border-b border-slate-100">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search employee..."
                                                value={employeeSearchQuery}
                                                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                        {uniqueEmployees
                                            .filter(emp =>
                                                emp.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                                                (emp === 'All' && 'all employees'.includes(debouncedSearchQuery.toLowerCase()))
                                            )
                                            .map(emp => (
                                                <button
                                                    key={emp}
                                                    onClick={() => {
                                                        setSelectedEmployee(emp);
                                                        setPlaybackIndex(0);
                                                        setIsPlaying(false);
                                                        setShowEmployeeDropdown(false);
                                                        setEmployeeSearchQuery('');
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between group",
                                                        selectedEmployee === emp ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-6 w-6 rounded-full flex items-center justify-center text-[10px]",
                                                            selectedEmployee === emp ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                                                        )}>
                                                            {emp === 'All' ? 'ALL' : emp.charAt(0)}
                                                        </div>
                                                        <span>{emp === 'All' ? 'All Employees' : emp}</span>
                                                    </div>
                                                    {selectedEmployee === emp && <CheckCircle2 size={14} className="text-emerald-400" />}
                                                </button>
                                            ))
                                        }
                                        {uniqueEmployees.filter(emp => emp.toLowerCase().includes(employeeSearchQuery.toLowerCase())).length === 0 && (
                                            <div className="px-4 py-3 text-center text-xs font-medium text-slate-400">
                                                No employees found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    setShowCalendar(true);
                                    setViewDate(new Date(timelineDate));
                                }}
                                className={cn(
                                    "flex items-center gap-2 w-full px-4 py-3 sm:py-2.5 border rounded-xl text-sm font-bold transition-all shadow-sm min-h-[44px] justify-center sm:justify-start",
                                    isToday
                                        ? "bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-100"
                                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <Calendar size={16} className={isToday ? "text-primary-500" : "text-slate-400"} />
                                <span>{isToday ? 'Today' : timelineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <ChevronDown size={14} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Advanced Control Panel (New Requirement) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 w-full max-w-full overflow-hidden box-border">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capture Settings</label>
                        <ToggleSwitch label="Random Shifts" enabled={randomScreenshots} onChange={setRandomScreenshots} />
                        <ToggleSwitch label="Exclude Admin" enabled={excludeSensitive} onChange={setExcludeSensitive} />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Privacy & Security</label>
                        <ToggleSwitch label="Global Blur" enabled={globalBlur} onChange={setGlobalBlur} />
                        <button
                            onClick={() => setShowRestrictedApps(true)}
                            className="flex items-center justify-between w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all focus:ring-2 focus:ring-slate-900/5 min-h-[44px]"
                        >
                            <span>Restricted Apps</span>
                            <Settings size={14} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frequency</label>
                        <div className="relative w-full">
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:border-primary-500 cursor-pointer min-h-[44px]"
                            >
                                <option value="5m">Every 5 Mins</option>
                                <option value="10m">Every 10 Mins</option>
                                <option value="15m">Every 15 Mins</option>
                                <option value="30m">Every 30 Mins</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => setShowCaptureRules(true)}
                            className="flex items-center justify-between w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all focus:ring-2 focus:ring-slate-900/5 min-h-[44px]"
                        >
                            <span>Capture Rules</span>
                            <Camera size={14} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Filters</label>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap gap-2">
                            <div className="flex-1 sm:flex-none"><FilterButton label="All" active={activeFilter === 'All'} onClick={() => setActiveFilter('All')} className="w-full justify-center" /></div>
                            <div className="flex-1 sm:flex-none"><FilterButton label="Flagged" active={activeFilter === 'Flagged'} onClick={() => setActiveFilter('Flagged')} icon={Shield} className="w-full justify-center" /></div>
                            <div className="flex-1 sm:flex-none"><FilterButton label="Idle" active={activeFilter === 'Idle'} onClick={() => setActiveFilter('Idle')} icon={Clock} className="w-full justify-center" /></div>
                        </div>
                    </div>
                </div>

                {/* 3. Timeline Playback */}
                <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={cn(
                                "h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-2xl text-white shadow-lg transition-all active:scale-95 group",
                                isPlaying ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
                            )}
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1 group-hover:scale-110 transition-transform" />}
                        </button>

                        <div className="flex-1 w-full space-y-2">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex flex-wrap items-center gap-2">
                                        Playback Timeline
                                        {selectedEmployee !== 'All' && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 truncate max-w-[150px]">{selectedEmployee}</span>}
                                    </span>
                                    <span className="text-base sm:text-lg font-black text-slate-900 transition-all duration-300">
                                        {currentPlaybackTime}
                                    </span>
                                </div>
                                {isPlaying && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full animate-pulse flex-shrink-0">
                                        <RefreshCw size={12} className="animate-spin" />
                                        <span className="text-[10px] font-black uppercase whitespace-nowrap">Live Replay</span>
                                    </div>
                                )}
                            </div>

                            <div
                                className="relative h-2 bg-slate-100 rounded-full overflow-hidden cursor-pointer w-full"
                                title="Click to seek"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const percentage = x / rect.width;
                                    const index = Math.floor(percentage * filteredScreenshots.length);
                                    setPlaybackIndex(Math.min(index, filteredScreenshots.length - 1));
                                    setIsPlaying(false);
                                }}
                            >
                                <div
                                    className="absolute inset-y-0 left-0 bg-slate-900 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Start</span>
                                <span className="hidden xs:block">Lunch Break</span>
                                <span>End Shift</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Screenshot Grid */}
                <div className={cn(
                    "grid gap-6 transition-all duration-500",
                    viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-4xl mx-auto"
                )}>
                    {filteredScreenshots.length > 0 ? (
                        filteredScreenshots.map((s, index) => (
                            <div key={s.id || s.id_val} className={cn("transition-all duration-500", isPlaying && index === playbackIndex && viewMode === 'grid' ? "scale-105 ring-4 ring-amber-500/20 rounded-2xl z-10" : "")}>
                                <ScreenshotCard
                                    {...s}
                                    viewMode={viewMode}
                                    globalBlur={globalBlur}
                                    onDelete={handleDelete}
                                    onDownload={handleDownload}
                                    onView={(data) => handleViewScreenshot(data, index)}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-50">
                            <div className="h-24 w-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                                <Camera size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Activity Captured</h3>
                            <p className="text-slate-500 font-medium max-w-xs">There are no screenshots available for the selected time range.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleLoadArchive}
                        disabled={isLoadingArchive}
                        className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all text-sm flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isLoadingArchive ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                <span>Accessing Cloud Storage...</span>
                            </>
                        ) : (
                            <span>Load Archive</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Restricted Apps Modal */}
            {
                showRestrictedApps && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-white/20">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Restricted Apps</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auto-pause tracking</p>
                                </div>
                                <button onClick={() => setShowRestrictedApps(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add app (e.g. Netflix)"
                                        value={newApp}
                                        onChange={(e) => setNewApp(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-400 min-h-[44px]"
                                    />
                                    <button
                                        onClick={() => {
                                            if (newApp) {
                                                setRestrictedApps([...restrictedApps, newApp]);
                                                setNewApp('');
                                            }
                                        }}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all min-h-[44px]"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {restrictedApps.map(app => (
                                        <div key={app} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                            <span className="text-sm font-bold text-slate-700">{app}</span>
                                            <button
                                                onClick={() => setRestrictedApps(restrictedApps.filter(a => a !== app))}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-100">
                                <button onClick={() => setShowRestrictedApps(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {showCaptureRules && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-white/20">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Capture Rules</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Global engine behavior</p>
                            </div>
                            <button onClick={() => setShowCaptureRules(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-3">
                            {rules.map(rule => (
                                <button
                                    key={rule.id}
                                    onClick={() => setRules(rules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                        rule.enabled ? "bg-amber-50/50 border-amber-200" : "bg-slate-50 border-slate-200 grayscale opacity-60"
                                    )}
                                >
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">{rule.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{rule.desc}</p>
                                    </div>
                                    <div className={cn(
                                        "h-6 w-11 rounded-full relative transition-all duration-300",
                                        rule.enabled ? "bg-amber-500" : "bg-slate-300"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 h-4 w-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                            rule.enabled ? "left-6" : "left-1"
                                        )} />
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <button onClick={() => setShowCaptureRules(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all">Apply Policy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail View Modal */}
            {selectedScreenshot && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 bg-slate-900/95 backdrop-blur-xl animate-fade-in"
                    onClick={handleCloseModal}
                >
                    <div
                        className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header Actions */}
                        <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md flex-shrink-0">
                                    {selectedScreenshot.employee.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-white font-black text-base sm:text-lg leading-none mb-1 truncate">{selectedScreenshot.employee}</h3>
                                    <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{selectedScreenshot.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => handleDownload(selectedScreenshot.url)}
                                    className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all backdrop-blur-md font-bold text-xs sm:text-sm"
                                >
                                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    <span>Download</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleCloseModal(); }}
                                    className="h-10 w-10 sm:h-12 sm:w-12 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all backdrop-blur-md cursor-pointer group flex-shrink-0"
                                    title="Close View"
                                >
                                    <X size={20} className="sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="absolute inset-y-0 left-0 flex items-center p-4 z-40 pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                className="h-14 w-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-md transition-all active:scale-90 pointer-events-auto"
                            >
                                <ChevronLeft size={32} />
                            </button>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center p-4 z-40 pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="h-14 w-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-md transition-all active:scale-90 pointer-events-auto"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </div>

                        {/* Image */}
                        <img
                            src={selectedScreenshot.url}
                            alt="Full View"
                            className={cn(
                                "w-full h-full object-contain transition-all duration-1000",
                                selectedScreenshot.effectiveBlur ? "blur-3xl scale-125 opacity-30" : "scale-100"
                            )}
                        />

                        {/* Privacy Warning Overlay */}
                        {selectedScreenshot.effectiveBlur && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="max-w-md text-center p-8 bg-black/40 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-2xl">
                                    <div className="h-20 w-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                                        <Shield size={40} className="text-emerald-400" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Content Restricted</h4>
                                    <p className="text-white/60 font-medium text-sm leading-relaxed mb-8">
                                        This screenshot contains sensitive information and has been automatically blurred per company policy.
                                    </p>
                                    <button
                                        onClick={() => setSelectedScreenshot({ ...selectedScreenshot, effectiveBlur: false })}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                    >
                                        Override Blur (Audit Only)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer Info */}
                        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 z-30 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 w-full sm:w-auto">
                                <div className="min-w-0">
                                    <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Active Window</p>
                                    <p className="text-white font-bold text-xs sm:text-sm italic truncate">"Reviewing Quarter 3 Projections.xlsx"</p>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Total Process Time</p>
                                    <p className="text-white font-bold text-xs sm:text-sm italic truncate">12 Minutes 45 Seconds</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 flex-shrink-0 self-end sm:self-auto">
                                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-white/80 text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Enterprise Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Calendar Modal */}
            {showCalendar && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
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
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
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
        </>
    );
}
