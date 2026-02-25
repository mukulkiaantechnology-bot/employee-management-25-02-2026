import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as InitialData from '../data/mockData';

const RealTimeContext = createContext();
const STORAGE_KEY = 'ems_state_v3';

// Helper outside component to ensure stability
const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export function RealTimeProvider({ children }) {
    // core state
    const [state, setState] = useState({
        employees: InitialData.employees,
        tasks: InitialData.detailedTasks,
        projects: InitialData.projects,
        timeEntries: InitialData.workLogs,
        attendance: InitialData.attendanceData,
        activities: InitialData.activities,
        notifications: InitialData.notifications || [],
        alerts: [],
        timer: { isRunning: false, startTime: null, seconds: 0, currentTask: null },
        currentUser: { id: 0, name: 'Guest User', role: 'Admin' },
        // New Persistent Data
        screenshots: [
            { id: 1, time: "10:15 AM", url: "https://picsum.photos/seed/a1/800/450", isBlurred: false, employee: "John Doe", status: "Work" },
            { id: 2, time: "10:20 AM", url: "https://picsum.photos/seed/a2/800/450", isBlurred: true, employee: "Jane Smith", status: "Idle" },
            { id: 3, time: "10:25 AM", url: "https://picsum.photos/seed/a3/800/450", isBlurred: false, employee: "Alex Johnson", status: "Work" },
            { id: 4, time: "10:30 AM", url: "https://picsum.photos/seed/a4/800/450", isBlurred: false, employee: "Sarah Brown", status: "Work" },
        ],
        locations: InitialData.locations || [],
        geofences: InitialData.geofences || [],
        checkIns: [
            { id: 1, employeeId: 1, name: 'John Doe', location: 'Headquarters', type: 'in', time: '09:00 AM' },
            { id: 2, employeeId: 2, name: 'Jane Smith', location: 'Client Site A', type: 'in', time: '09:30 AM' },
            { id: 3, employeeId: 1, name: 'John Doe', location: 'Headquarters', type: 'out', time: '06:00 PM' },
        ],
        travelStats: InitialData.travelStats || { totalDistance: '0 km', avgSpeed: '0 km/h' }
    });

    const [activeToast, setActiveToast] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const timerInterval = useRef(null);

    // Initial Load
    useEffect(() => {
        const loadState = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setState(prev => ({ ...prev, ...parsed }));
                }
            } catch (e) {
                console.error("Failed to load state", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadState();
    }, []);

    // Self-healing: Force mock data if state is empty or unexpectedly small
    useEffect(() => {
        if (!isLoading && state.employees.length < 5) {
            console.log("Self-healing: Re-injecting mock employees...");
            setState(prev => ({ ...prev, employees: InitialData.employees }));
        }
    }, [isLoading, state.employees.length]);

    // Persistence Effect
    useEffect(() => {
        if (!isLoading) {
            const stateToSave = {
                ...state,
                timer: { ...state.timer, lastSaveTime: Date.now() } // Add timestamp for resume logic
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [state, isLoading]);

    // Timer Interval
    useEffect(() => {
        if (state.timer.isRunning) {
            timerInterval.current = setInterval(() => {
                setState(prev => ({
                    ...prev,
                    timer: { ...prev.timer, seconds: prev.timer.seconds + 1 }
                }));
            }, 1000);
        } else {
            clearInterval(timerInterval.current);
        }
        return () => clearInterval(timerInterval.current);
    }, [state.timer.isRunning]);

    // Derived Stats
    const stats = useMemo(() => ({
        activeEmployees: state.employees.length,
        online: state.employees.filter(e => e.status === 'online').length,
        idle: state.employees.filter(e => e.status === 'idle').length,
        offline: state.employees.filter(e => e.status === 'offline').length,
        totalHours: {
            today: '842h',
            week: '4,820h',
            month: '18,400h'
        },
        productivityTrend: InitialData.mockStats.productivityTrend,
        departmentStats: InitialData.mockStats.departmentStats,
        intradayActivity: InitialData.mockStats.intradayActivity,
    }), [state.employees]);

    // --- Actions ---
    const addNotification = useCallback((title, type = 'info') => {
        const newNotif = {
            id: Date.now(),
            title,
            time: 'Just now',
            type,
            unread: true
        };
        setState(prev => ({ ...prev, notifications: [newNotif, ...prev.notifications].slice(0, 50) }));
        setActiveToast(newNotif);
        setTimeout(() => setActiveToast(null), 3000);
    }, [setActiveToast]);

    // Employee Actions
    const addEmployee = useCallback((employee) => {
        const newEmp = { ...employee, id: Date.now(), status: 'offline', avatar: `https://i.pravatar.cc/150?u=${Date.now()}` };
        setState(prev => ({ ...prev, employees: [newEmp, ...prev.employees] }));
        addNotification(`New employee ${employee.name} added`, 'success');
        return newEmp;
    }, [addNotification]);

    const updateEmployee = useCallback((id, updates) => {
        setState(prev => ({
            ...prev,
            employees: prev.employees.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
    }, []);

    const deleteEmployee = useCallback((id) => {
        setState(prev => ({
            ...prev,
            employees: prev.employees.filter(e => e.id !== id)
        }));
        addNotification('Employee removed', 'info');
    }, [addNotification]);

    // Time Tracking Actions
    const startTimer = useCallback((taskName) => {
        setState(prev => ({
            ...prev,
            timer: {
                ...prev.timer,
                isRunning: true,
                startTime: prev.timer.startTime || Date.now(),
                currentTask: taskName || prev.timer.currentTask || 'General Work'
            }
        }));
    }, []);

    const pauseTimer = useCallback(() => {
        setState(prev => ({
            ...prev,
            timer: { ...prev.timer, isRunning: false }
        }));
    }, []);

    const stopTimer = useCallback(() => {
        setState(prev => {
            const { seconds, currentTask, startTime } = prev.timer;
            const now = Date.now();

            const formatClockTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const timeRange = `${formatClockTime(startTime || now)} - ${formatClockTime(now)}`;

            // Create a time entry upon stopping
            const newEntry = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                task: currentTask || 'Unspecified Work',
                project: 'General',
                duration: formatTime(seconds),
                time: timeRange,
                status: 'Verified'
            };

            return {
                ...prev,
                timeEntries: [newEntry, ...prev.timeEntries],
                timer: { isRunning: false, startTime: null, seconds: 0, currentTask: null }
            };
        });
        addNotification('Time entry saved', 'success');
    }, [addNotification, formatTime]);

    const toggleTimer = useCallback((taskName = 'General Work') => {
        setState(prev => {
            if (prev.timer.isRunning) {
                // Interally call the same logic as stopTimer to avoid stale closure issues
                const { seconds, currentTask, startTime } = prev.timer;
                const now = Date.now();
                const formatClockTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const timeRange = `${formatClockTime(startTime || now)} - ${formatClockTime(now)}`;

                const newEntry = {
                    id: Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                    task: currentTask || 'Unspecified Work',
                    project: 'General',
                    duration: formatTime(seconds),
                    time: timeRange,
                    status: 'Verified'
                };

                addNotification('Time entry saved', 'success');

                return {
                    ...prev,
                    timeEntries: [newEntry, ...prev.timeEntries],
                    timer: { isRunning: false, startTime: null, seconds: 0, currentTask: null }
                };
            } else {
                return {
                    ...prev,
                    timer: {
                        ...prev.timer,
                        isRunning: true,
                        startTime: prev.timer.startTime || Date.now(),
                        currentTask: taskName || prev.timer.currentTask || 'General Work'
                    }
                };
            }
        });
    }, [addNotification, formatTime]);

    const addTimeEntry = useCallback((entry) => {
        const newEntry = { ...entry, id: Date.now(), date: new Date().toISOString().split('T')[0] };
        setState(prev => ({ ...prev, timeEntries: [newEntry, ...prev.timeEntries] }));
        addNotification('Time entry saved', 'success');
    }, [addNotification]);

    const updateTimeEntry = useCallback((id, updates) => {
        setState(prev => ({
            ...prev,
            timeEntries: prev.timeEntries.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
        addNotification('Time entry updated', 'success');
    }, [addNotification]);

    const deleteTimeEntry = useCallback((id) => {
        setState(prev => ({
            ...prev,
            timeEntries: prev.timeEntries.filter(e => e.id !== id)
        }));
        addNotification('Time entry removed', 'info');
    }, [addNotification]);

    // Task Actions
    const addTask = useCallback((task) => {
        const newTask = { status: 'To Do', progress: 0, ...task, id: Date.now() };
        setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
        addNotification(`Task "${task.title}" created`, 'success');
    }, [addNotification]);

    const updateTaskStatus = useCallback((taskId, status, progress) => {
        setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status, progress } : t)
        }));
    }, []);

    const addProject = useCallback((project) => {
        const newProject = { ...project, id: Date.now(), progress: 0, color: 'bg-primary-500', status: 'On Track' };
        setState(prev => ({ ...prev, projects: [newProject, ...prev.projects] }));
        addNotification(`Project "${project.name}" created`, 'success');
    }, [addNotification]);

    // Screenshot Actions
    const deleteScreenshot = useCallback((id) => {
        setState(prev => ({
            ...prev,
            screenshots: prev.screenshots.filter(s => s.id !== id)
        }));
        addNotification('Screenshot deleted', 'info');
    }, [addNotification]);

    // Location/Geofence Actions
    const addGeofence = useCallback((zone) => {
        const newZone = { ...zone, id: Date.now(), color: 'border-primary-500' };
        setState(prev => ({ ...prev, geofences: [...prev.geofences, newZone] }));
        addNotification('New geofence zone added', 'success');
    }, [addNotification]);

    const toggleGeofence = useCallback((id) => {
        setState(prev => ({
            ...prev,
            geofences: prev.geofences.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g)
        }));
    }, []);

    const markAllNotificationsRead = useCallback(() => {
        setState(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => ({ ...n, unread: false }))
        }));
    }, []);

    const markNotificationAsRead = useCallback((id) => {
        setState(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => n.id === id ? { ...n, unread: false } : n)
        }));
    }, []);

    const deleteNotification = useCallback((id) => {
        setState(prev => ({
            ...prev,
            notifications: prev.notifications.filter(n => n.id !== id)
        }));
    }, []);


    // Simulation Effect (Random Activity)
    useEffect(() => {
        if (isLoading) return;

        const interval = setInterval(() => {
            // Randomly toggle statuses
            if (Math.random() > 0.7) {
                setState(prev => {
                    const updatedEmployees = prev.employees.map(e => {
                        if (Math.random() > 0.9) {
                            const statuses = ['online', 'idle', 'offline'];
                            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                            return { ...e, status: newStatus };
                        }
                        return e;
                    });
                    return { ...prev, employees: updatedEmployees };
                });
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [isLoading]);


    // Memoize actions to prevent downstream re-renders
    const actions = useMemo(() => ({
        addEmployee,
        updateEmployee,
        deleteEmployee,
        toggleTimer,
        startTimer,
        stopTimer,
        pauseTimer,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        addTask,
        updateTaskStatus,
        addProject,
        deleteScreenshot,
        addGeofence,
        toggleGeofence,
        addCheckIn: (checkIn) => setState(prev => ({ ...prev, checkIns: [{ ...checkIn, id: Date.now() }, ...prev.checkIns] })),
        addNotification,
        markAllNotificationsRead,
        markNotificationAsRead,
        deleteNotification
    }), [
        addEmployee, updateEmployee, deleteEmployee, toggleTimer, startTimer, stopTimer,
        pauseTimer, addTimeEntry, updateTimeEntry, deleteTimeEntry, addTask,
        updateTaskStatus, addProject, deleteScreenshot, addGeofence, toggleGeofence,
        addNotification, markAllNotificationsRead, markNotificationAsRead, deleteNotification
    ]);

    const contextValue = useMemo(() => ({
        ...state,
        stats,
        isLoading,
        ...actions
    }), [state, stats, isLoading, actions]);

    return (
        <RealTimeContext.Provider value={contextValue}>
            {children}
            {activeToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${activeToast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
                        activeToast.type === 'alert' ? 'bg-red-500/90 border-red-400 text-white' :
                            'bg-slate-900/90 border-slate-700 text-white'
                        }`}>
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <span className="font-bold text-sm">{activeToast.title}</span>
                    </div>
                </div>
            )}
        </RealTimeContext.Provider>
    );
}

export const useRealTime = () => useContext(RealTimeContext);
