import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { auth } from './auth';

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
        employees: [],
        tasks: [],
        projects: [],
        timeEntries: [],
        attendance: [],
        activities: [],
        notifications: [],
        alerts: [],
        timer: { isRunning: false, startTime: null, seconds: 0, currentTask: null },
        currentUser: auth.getUser() || { id: 0, name: 'Guest User', role: 'Admin' },
        screenshots: [],
        locations: [],
        geofences: [],
        checkIns: [],
        travelStats: { totalDistance: '0 km', avgSpeed: '0 km/h' },
        alertConfigs: [],
        alertHistory: [],
        payrolls: [],
        auditLogs: [],
        complianceStatus: null,
        reportsOverview: null,
        activityStats: { summary: null, apps: [], websites: [] }
    });

    const [activeToast, setActiveToast] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const timerInterval = useRef(null);

    // Initial Load from API
    useEffect(() => {
        const fetchAllData = async () => {
            if (!auth.isAuthenticated()) return;

            setIsLoading(true);
            try {
                const reportsEndpoint = auth.getUser()?.role === 'manager' ? '/reports/manager-overview' :
                    auth.getUser()?.role === 'employee' ? '/reports/employee-overview' :
                        '/reports/overview';

                const [
                    empRes,
                    projRes,
                    taskRes,
                    notifRes,
                    attnRes,
                    timeRes,
                    screenRes,
                    alertConfigRes,
                    alertHistoryRes,
                    payrollRes,
                    complianceRes,
                    auditRes,
                    reportsRes,
                    fenceRes,
                    liveLocRes,
                    geoLogsRes
                ] = await Promise.all([
                    apiClient.get('/employees'),
                    apiClient.get('/tasks/projects'),
                    apiClient.get('/tasks'),
                    apiClient.get('/notifications'),
                    apiClient.get('/attendance/records'),
                    apiClient.get('/time-entries'),
                    apiClient.get('/screenshots'),
                    apiClient.get('/alerts/config'),
                    apiClient.get('/alerts/history'),
                    apiClient.get('/payroll'),
                    apiClient.get('/compliance/status'),
                    apiClient.get('/compliance/audit-logs'),
                    apiClient.get(reportsEndpoint),
                    apiClient.get('/location/geofences'),
                    apiClient.get('/location/live'),
                    apiClient.get('/location/geologs')
                ]);

                setState(prev => ({
                    ...prev,
                    employees: empRes.data || [],
                    projects: projRes.data || [],
                    tasks: taskRes.data || [],
                    notifications: notifRes.data || [],
                    attendance: attnRes.data || [],
                    timeEntries: timeRes.data || [],
                    screenshots: screenRes.data || [],
                    alertConfigs: alertConfigRes.data || [],
                    alertHistory: alertHistoryRes.data || [],
                    payrolls: payrollRes.data || [],
                    complianceStatus: complianceRes.data || null,
                    auditLogs: auditRes.data || [],
                    reportsOverview: reportsRes.data || null,
                    geofences: fenceRes.data || [],
                    locations: liveLocRes.data || [],
                    checkIns: geoLogsRes.data || []
                }));
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

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
    const stats = useMemo(() => {
        const onlineCount = state.employees.filter(e => e.status === 'online').length;
        const idleCount = state.employees.filter(e => e.status === 'idle').length;

        const getHours = (entries) => {
            const secs = entries.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
            return (secs / 3600).toFixed(1) + 'h';
        };

        const today = new Date().toISOString().split('T')[0];
        const todayEntries = state.timeEntries.filter(e => e.date?.startsWith(today));

        const reports = state.reportsOverview || {};
        const intradayData = reports.trend || [];

        return {
            totalEmployees: state.employees.length,
            activeEmployees: state.employees.filter(e => e.status !== 'offline').length,
            online: onlineCount,
            idle: idleCount,
            offline: state.employees.filter(e => e.status === 'offline').length,
            productivityScore: reports.avgProductivity || 0,
            totalHours: {
                today: getHours(todayEntries),
                week: getHours(state.timeEntries), // Simple for now
                month: getHours(state.timeEntries)
            },
            productivityTrend: reports.productivityTrend || '0%',
            departmentStats: reports.deptProductivity || [],
            intradayActivity: intradayData,
        };
    }, [state.employees, state.timeEntries]);

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
    const addEmployee = useCallback(async (employee) => {
        try {
            const response = await apiClient.post('/employees', employee);
            if (response.success) {
                const newEmp = response.data;
                setState(prev => ({ ...prev, employees: [newEmp, ...prev.employees] }));
                addNotification(`New employee ${newEmp.name} added`, 'success');
                return newEmp;
            }
        } catch (error) {
            console.error("Failed to add employee", error);
            addNotification('Failed to add employee', 'alert');
        }
    }, [addNotification]);

    const updateEmployee = useCallback(async (id, updates) => {
        try {
            const response = await apiClient.patch(`/employees/${id}`, updates);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    employees: prev.employees.map(e => e.id === id ? { ...e, ...response.data } : e)
                }));
                addNotification('Employee updated', 'success');
            }
        } catch (error) {
            console.error("Failed to update employee", error);
            addNotification('Failed to update employee', 'alert');
        }
    }, [addNotification]);

    const deleteEmployee = useCallback(async (id) => {
        try {
            const response = await apiClient.delete(`/employees/${id}`);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    employees: prev.employees.filter(e => e.id !== id)
                }));
                addNotification('Employee removed', 'info');
            }
        } catch (error) {
            console.error("Failed to delete employee", error);
            addNotification('Failed to remove employee', 'alert');
        }
    }, [addNotification]);

    // Time Tracking Actions
    const startTimer = useCallback(async (taskName, projectId = null) => {
        try {
            const response = await apiClient.post('/time-entries', { title: taskName, projectId });
            if (response.success) {
                const entry = response.data;
                setState(prev => ({
                    ...prev,
                    timer: {
                        ...prev.timer,
                        isRunning: true,
                        startTime: new Date(entry.startTime).getTime(),
                        currentTask: entry.title,
                        currentEntryId: entry.id
                    }
                }));
                addNotification(`Timer started: ${entry.title}`, 'info');
            }
        } catch (error) {
            console.error("Failed to start timer", error);
            addNotification('Failed to start timer', 'alert');
        }
    }, [addNotification]);

    const stopTimer = useCallback(async () => {
        const entryId = state.timer.currentEntryId;
        if (!entryId) return;

        try {
            const response = await apiClient.patch(`/time-entries/${entryId}/stop`);
            if (response.success) {
                const updatedEntry = response.data;
                setState(prev => ({
                    ...prev,
                    timeEntries: [updatedEntry, ...prev.timeEntries],
                    timer: { isRunning: false, startTime: null, seconds: 0, currentTask: null, currentEntryId: null }
                }));
                addNotification('Time entry saved', 'success');
            }
        } catch (error) {
            console.error("Failed to stop timer", error);
            addNotification('Failed to stop timer', 'alert');
        }
    }, [state.timer.currentEntryId, addNotification]);

    const pauseTimer = useCallback(async () => {
        await stopTimer();
        addNotification('Timer paused', 'info');
    }, [stopTimer, addNotification]);

    const toggleTimer = useCallback(async (taskName = 'General Work') => {
        if (state.timer.isRunning) {
            await stopTimer();
        } else {
            await startTimer(taskName);
        }
    }, [state.timer.isRunning, startTimer, stopTimer]);

    const deleteTimeEntry = useCallback(async (id) => {
        try {
            const response = await apiClient.delete(`/time-entries/${id}`);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    timeEntries: prev.timeEntries.filter(e => e.id !== id)
                }));
                addNotification('Time entry removed', 'info');
            }
        } catch (error) {
            console.error("Failed to delete time entry", error);
            addNotification('Failed to remove time entry', 'alert');
        }
    }, [addNotification]);

    const addTimeEntry = useCallback(async (entry) => {
        try {
            const response = await apiClient.post('/time-entries', { ...entry, source: 'manual' });
            if (response.success) {
                setState(prev => ({ ...prev, timeEntries: [response.data, ...prev.timeEntries] }));
                addNotification('Time entry saved', 'success');
            }
        } catch (error) {
            console.error("Failed to add time entry", error);
            addNotification('Failed to add time entry', 'alert');
        }
    }, [addNotification]);

    const updateTimeEntry = useCallback(async (id, updates) => {
        try {
            const response = await apiClient.patch(`/time-entries/${id}`, updates);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    timeEntries: prev.timeEntries.map(e => e.id === id ? response.data : e)
                }));
                addNotification('Time entry updated', 'success');
            }
        } catch (error) {
            console.error("Failed to update time entry", error);
            addNotification('Failed to update time entry', 'alert');
        }
    }, [addNotification]);

    // Task Actions
    const addTask = useCallback(async (task) => {
        try {
            const response = await apiClient.post('/tasks', task);
            if (response.success) {
                const newTask = response.data;
                setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
                addNotification(`Task "${task.title}" created`, 'success');
                return newTask;
            }
        } catch (error) {
            console.error("Failed to create task", error);
            addNotification('Failed to create task', 'alert');
        }
    }, [addNotification]);

    const updateTaskStatus = useCallback(async (taskId, status, position) => {
        try {
            const response = await apiClient.patch(`/tasks/${taskId}/position`, { status, position });
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...response.data } : t)
                }));
            }
        } catch (error) {
            console.error("Failed to update task status", error);
        }
    }, []);

    const addProject = useCallback(async (project) => {
        try {
            const response = await apiClient.post('/tasks/projects', project);
            if (response.success) {
                const newProject = response.data;
                setState(prev => ({ ...prev, projects: [newProject, ...prev.projects] }));
                addNotification(`Project "${project.name}" created`, 'success');
                return newProject;
            }
        } catch (error) {
            console.error("Failed to create project", error);
            addNotification('Failed to create project', 'alert');
        }
    }, [addNotification]);

    // Screenshot Actions
    const deleteScreenshot = useCallback(async (id) => {
        try {
            const response = await apiClient.delete(`/screenshots/${id}`);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    screenshots: prev.screenshots.filter(s => s.id !== id)
                }));
                addNotification('Screenshot deleted', 'info');
            }
        } catch (error) {
            console.error("Failed to delete screenshot", error);
            addNotification('Failed to remove screenshot', 'alert');
        }
    }, [addNotification]);

    // Location/Geofence Actions
    const addGeofence = useCallback(async (zone) => {
        try {
            const response = await apiClient.post('/location/geofences', zone);
            if (response.success) {
                setState(prev => ({ ...prev, geofences: [...prev.geofences, response.data] }));
                addNotification('New geofence zone added', 'success');
            }
        } catch (error) {
            console.error("Failed to add geofence", error);
            addNotification('Failed to add geofence', 'alert');
        }
    }, [addNotification]);

    const toggleGeofence = useCallback(async (id) => {
        try {
            const response = await apiClient.patch(`/location/geofences/${id}/toggle`);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    geofences: prev.geofences.map(g => g.id === id ? response.data : g)
                }));
            }
        } catch (error) {
            console.error("Failed to toggle geofence", error);
        }
    }, []);

    const markAllNotificationsRead = useCallback(async () => {
        try {
            const response = await apiClient.patch('/notifications/read-all');
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    notifications: prev.notifications.map(n => ({ ...n, unread: false }))
                }));
            }
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    }, []);

    const markNotificationAsRead = useCallback(async (id) => {
        try {
            const response = await apiClient.patch(`/notifications/${id}/read`);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    notifications: prev.notifications.map(n => n.id === id ? { ...n, unread: false } : n)
                }));
            }
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    }, []);

    const deleteNotification = useCallback(async (id) => {
        try {
            const response = await apiClient.delete(`/notifications/${id}`);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    notifications: prev.notifications.filter(n => n.id !== id)
                }));
            }
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    }, []);

    const deleteAllNotifications = useCallback(async () => {
        try {
            const response = await apiClient.delete('/notifications/all');
            if (response.success) {
                setState(prev => ({ ...prev, notifications: [] }));
                addNotification('All notifications cleared', 'info');
            }
        } catch (error) {
            console.error("Failed to delete all notifications", error);
        }
    }, [addNotification]);

    const updateAlertConfig = useCallback(async (configs) => {
        try {
            // Bulk update
            const response = await apiClient.put('/alerts/config', configs);
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    alertConfigs: response.data
                }));
                addNotification('System alerts updated', 'success');
            }
        } catch (error) {
            console.error("Failed to update alert config", error);
        }
    }, [addNotification]);

    const fetchAlertHistory = useCallback(async () => {
        try {
            const response = await apiClient.get('/alerts/history');
            if (response.success) {
                setState(prev => ({ ...prev, alertHistory: response.data || [] }));
            }
        } catch (error) {
            console.error("Failed to fetch alert history", error);
        }
    }, []);

    // Payroll Actions
    const fetchPayrolls = useCallback(async (params = {}) => {
        try {
            const response = await apiClient.get('/payroll', params);
            if (response.success) {
                setState(prev => ({ ...prev, payrolls: response.data || [] }));
            }
        } catch (error) {
            console.error("Failed to fetch payrolls", error);
        }
    }, []);

    const generatePayroll = useCallback(async (month, year) => {
        try {
            const response = await apiClient.post('/payroll/generate', { month, year });
            if (response.success) {
                addNotification(`Payroll generated for ${month}/${year}`, 'success');
                await fetchPayrolls();
                return response.data;
            }
        } catch (error) {
            console.error("Failed to generate payroll", error);
            addNotification('Payroll generation failed', 'alert');
        }
    }, [addNotification, fetchPayrolls]);

    const updatePayrollStatus = useCallback(async (id, status) => {
        try {
            const response = await apiClient.patch(`/payroll/${id}/status`, { status });
            if (response.success) {
                setState(prev => ({
                    ...prev,
                    payrolls: prev.payrolls.map(p => p.id === id ? { ...p, status } : p)
                }));
                addNotification(`Payroll status updated to ${status}`, 'success');
            }
        } catch (error) {
            console.error("Failed to update payroll status", error);
        }
    }, [addNotification]);

    // Compliance Actions
    const fetchAuditLogs = useCallback(async (params = {}) => {
        try {
            const response = await apiClient.get('/compliance/audit-logs', params);
            if (response.success) {
                setState(prev => ({ ...prev, auditLogs: response.data || [] }));
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        }
    }, []);

    const fetchComplianceStatus = useCallback(async () => {
        try {
            const response = await apiClient.get('/compliance/status');
            if (response.success) {
                setState(prev => ({ ...prev, complianceStatus: response.data || null }));
            }
        } catch (error) {
            console.error("Failed to fetch compliance status", error);
        }
    }, []);

    const broadcastConsent = useCallback(async (policyVersion) => {
        try {
            const response = await apiClient.post('/compliance/consent/broadcast', { policyVersion });
            if (response.success) {
                addNotification(response.data.message || 'Consent broadcasted', 'success');
                return response.data;
            }
        } catch (error) {
            console.error("Failed to broadcast consent", error);
            addNotification('Consent broadcast failed', 'alert');
        }
    }, [addNotification]);

    // Reports Actions
    const fetchReportsOverview = useCallback(async () => {
        try {
            const user = state.currentUser;
            let endpoint = '/reports/overview';
            if (user?.role === 'manager') endpoint = '/reports/manager-overview';
            else if (user?.role === 'employee') endpoint = '/reports/employee-overview';

            const response = await apiClient.get(endpoint);
            if (response.success) {
                setState(prev => ({ ...prev, reportsOverview: response.data || null }));
            }
        } catch (error) {
            console.error("Failed to fetch reports overview", error);
        }
    }, [state.currentUser]);

    const fetchActivityStats = useCallback(async (date, employeeId = null) => {
        setIsLoading(true);
        try {
            const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
            const params = { date: dateStr };
            if (employeeId) params.employeeId = employeeId;

            const [summaryRes, appsRes, sitesRes] = await Promise.all([
                apiClient.get('/activity/summary', params),
                apiClient.get('/activity/apps', params),
                apiClient.get('/activity/websites', params)
            ]);

            setState(prev => ({
                ...prev,
                activityStats: {
                    summary: summaryRes.data || null,
                    apps: appsRes.data || [],
                    websites: sitesRes.data || []
                }
            }));
        } catch (error) {
            console.error("Failed to fetch activity stats", error);
            addNotification('Failed to fetch activity data', 'alert');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);


    // Simulation Effect (Removed)
    useEffect(() => {
        // Mock activity simulation removed for production/backend integration
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
        deleteNotification,
        deleteAllNotifications,
        updateAlertConfig,
        fetchAlertHistory,
        fetchPayrolls,
        generatePayroll,
        updatePayrollStatus,
        fetchAuditLogs,
        fetchComplianceStatus,
        broadcastConsent,
        fetchReportsOverview,
        fetchActivityStats
    }), [
        addEmployee, updateEmployee, deleteEmployee, toggleTimer, startTimer, stopTimer,
        pauseTimer, addTimeEntry, updateTimeEntry, deleteTimeEntry, addTask,
        updateTaskStatus, addProject, deleteScreenshot, addGeofence, toggleGeofence,
        addNotification, markAllNotificationsRead, markNotificationAsRead, deleteNotification,
        deleteAllNotifications, updateAlertConfig, fetchAlertHistory,
        fetchPayrolls, generatePayroll, updatePayrollStatus, fetchAuditLogs,
        fetchComplianceStatus, broadcastConsent, fetchReportsOverview, fetchActivityStats
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
