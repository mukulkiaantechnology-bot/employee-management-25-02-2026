import React, { useState } from 'react';
import {
    Bell, UserX, Zap, MapPin, TrendingUp, Settings2, ShieldAlert,
    Clock, AlertCircle, CheckCircle2, X, Sliders, AlertTriangle,
    Activity, Shield, Info, ArrowLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRealTime } from '../hooks/RealTimeContext';
import { useNavigate } from 'react-router-dom';

const cn = (...inputs) => twMerge(clsx(inputs));

// --- Components ---

const AlertSetting = ({ icon: Icon, title, description, color, checked, onChange, onSettingsClick }) => (
    <div className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
        <div className="flex items-center gap-6">
            <div className={cn("p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm", color)}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{title}</h3>
                <p className="text-xs font-bold text-slate-400 max-w-md">{description}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer scale-110 hover:brightness-110 transition-all">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={onChange}
                />
                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 shadow-inner"></div>
            </label>
            <button
                onClick={onSettingsClick}
                disabled={!checked}
                className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-primary-500 dark:bg-slate-800 dark:text-slate-500 dark:hover:text-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm active:scale-95"
                title="Configure Thresholds"
            >
                <Sliders size={20} strokeWidth={2.5} />
            </button>
        </div>
    </div>
);

const LogsModal = ({ isOpen, onClose, logs }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[75vh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <Activity size={20} className="text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Alert Logs</h3>
                            <p className="text-xs font-bold text-slate-400">Complete history of system notifications</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {logs.map(log => (
                        <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white hover:shadow-md dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                            <div className={cn(
                                "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center transition-all bg-white dark:bg-slate-900 shadow-sm",
                                log.type === 'critical' ? 'text-rose-600' :
                                    log.type === 'warning' ? 'text-amber-600' :
                                        'text-blue-600'
                            )}>
                                <log.icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate pr-2">{log.title}</p>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-500">{log.date}</span>
                                        <span className="text-[10px] font-medium text-slate-400">{log.time}</span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {log.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                        Close Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

const AlertConfigModal = ({ isOpen, onClose, title, type, onSave, geofences = [] }) => {
    if (!isOpen) return null;

    const [threshold, setThreshold] = useState(30);
    const [sensitivity, setSensitivity] = useState('Medium');

    // Initialize defaults based on type when opening
    React.useEffect(() => {
        if (type === 'missed') setThreshold(15);
        if (type === 'unusual') setSensitivity('Medium');
        if (type === 'idle') setThreshold(30);
        if (type === 'overtime') setThreshold(90); // 9 hours
    }, [type, isOpen]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Configure: {title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6 mb-8">
                    {/* Dynamic Content based on Type */}
                    {type === 'idle' && (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                                <span>Wait Time</span>
                                <span className="text-primary-600">{threshold} minutes</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="120"
                                step="5"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <p className="text-xs text-slate-400 font-medium">Trigger alert when no keyboard/mouse activity is detected for this duration.</p>
                        </div>
                    )}

                    {type === 'overtime' && (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                                <span>Daily Limit</span>
                                <span className="text-primary-600">{threshold / 10} hours</span>
                            </div>
                            <input
                                type="range"
                                min="80"
                                max="140"
                                step="5"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <p className="text-xs text-slate-400 font-medium">Notify manager when an employee exceeds this daily work duration.</p>
                        </div>
                    )}

                    {type === 'geofence' && (
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Monitored Zones</label>
                            <div className="space-y-2">
                                {geofences.map(zone => (
                                    <label key={zone.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer border border-transparent hover:border-primary-200 transition-all">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{zone.name}</span>
                                    </label>
                                ))}
                                {geofences.length === 0 && (
                                    <p className="text-xs text-slate-400">No geofences configured. Add them in Location Tracking.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {type === 'unusual' && (
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">AI Sensitivity Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Low', 'Medium', 'High'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setSensitivity(level)}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-xs font-bold transition-all border",
                                            sensitivity === level
                                                ? "bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 font-medium">
                                {sensitivity === 'Low' && "Alerts only on critical anomalies (e.g., massive data exfiltration)."}
                                {sensitivity === 'Medium' && "Balanced detection for uncommon behaviors and data spikes."}
                                {sensitivity === 'High' && "Strict monitoring. Alerts on minor deviations from baseline."}
                            </p>
                        </div>
                    )}

                    {type === 'missed' && (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                                <span>Grace Period</span>
                                <span className="text-primary-600">{threshold} minutes</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <p className="text-xs text-slate-400 font-medium">Allow employees to clock in within this window before flagging as missed.</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => { onSave(); onClose(); }}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export function Alerts() {
    const { alertConfigs, alertHistory, updateAlertConfig, addNotification, geofences } = useRealTime();
    const navigate = useNavigate();
    const [localConfigs, setLocalConfigs] = useState([]);
    const [activeModal, setActiveModal] = useState(null); // 'idle', 'unusual', etc.
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Sync local state when backend configs load
    React.useEffect(() => {
        if (alertConfigs.length) {
            setLocalConfigs(alertConfigs);
        } else {
            // Default fallbacks if no records in DB yet
            setLocalConfigs([
                { type: 'idle', enabled: true, threshold: 30, sensitivity: 'Medium' },
                { type: 'unusual', enabled: true, threshold: 0, sensitivity: 'Medium' },
                { type: 'missed', enabled: true, threshold: 15, sensitivity: 'Medium' },
                { type: 'geofence', enabled: false, threshold: 0, sensitivity: 'Medium', zones: [] },
                { type: 'overtime', enabled: true, threshold: 90, sensitivity: 'Medium' }
            ]);
        }
    }, [alertConfigs]);

    const handleToggle = (type) => {
        setLocalConfigs(prev => prev.map(c => c.type === type ? { ...c, enabled: !c.enabled } : c));
    };

    const handleConfigSave = (type, updates) => {
        setLocalConfigs(prev => prev.map(c => c.type === type ? { ...c, ...updates } : c));
    };

    const handleSaveGlobal = async () => {
        setIsSaving(true);
        try {
            await updateAlertConfig(localConfigs);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            addNotification('Failed to update settings', 'alert');
        } finally {
            setIsSaving(false);
        }
    };

    const getAlertConfig = (type) => localConfigs.find(c => c.type === type) || { enabled: false };

    const mappedHistory = React.useMemo(() => {
        return alertHistory.map(log => {
            let type = 'info';
            let icon = Bell;
            let title = log.action.replace('alert_', '').replace(/_/g, ' ');

            if (log.action.includes('critical') || log.action.includes('violation')) {
                type = 'critical';
            } else if (log.action.includes('warning') || log.action.includes('exceeded')) {
                type = 'warning';
            }

            if (log.action.includes('geofence')) icon = MapPin;
            else if (log.action.includes('idle')) icon = UserX;
            else if (log.action.includes('missed')) icon = Clock;
            else if (log.action.includes('unusual')) icon = Zap;
            else if (log.action.includes('overtime')) icon = TrendingUp;

            return {
                id: log.id,
                type,
                title: title.charAt(0).toUpperCase() + title.slice(1),
                message: log.details || 'System notification triggered.',
                time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(log.timestamp).toLocaleDateString(),
                icon
            };
        });
    }, [alertHistory]);

    // Scroll Lock Logic - Prevent background scrolling when modal is open
    React.useEffect(() => {
        if (activeModal || showLogsModal) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px'; // Prevent layout shift
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [activeModal, showLogsModal]);

    return (
        <div className="relative">
            {/* Modals - Moved outside animation container to ensure perfect viewport centering */}
            <AlertConfigModal
                isOpen={!!activeModal}
                onClose={() => setActiveModal(null)}
                title={activeModal ? activeModal.charAt(0).toUpperCase() + activeModal.slice(1) + ' Alert' : ''}
                type={activeModal}
                geofences={geofences}
                onSave={() => {
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                }}
            />

            <LogsModal
                isOpen={showLogsModal}
                onClose={() => setShowLogsModal(false)}
                logs={mappedHistory}
            />

            <div className="space-y-8 pb-32 relative animate-fade-in px-2 md:px-0">
                {/* Toast */}
                {showToast && (
                    <div className="fixed top-24 right-8 z-[100] flex items-center gap-4 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-[0_20px_50px_rgba(5,150,105,0.3)] animate-in slide-in-from-right-full">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">System Updated</p>
                            <p className="text-xs text-emerald-100 font-medium">Alert preferences have been saved.</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-bold text-sm"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:border-primary-500 transition-all">
                                <ArrowLeft size={18} />
                            </div>
                            Dashboard
                        </button>
                        <div className="flex items-center gap-4 text-left">
                            <div className="h-14 w-14 rounded-[1.5rem] bg-rose-600 text-white flex items-center justify-center shadow-[0_20px_40px_rgba(225,29,72,0.3)] shrink-0">
                                <Bell size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Smart Alerts</h1>
                                <p className="text-sm font-bold text-slate-400">Real-time threat detection & operational notifications.</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveGlobal}
                        disabled={isSaving}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-3"
                    >
                        {isSaving && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {isSaving ? 'Syncing...' : 'Save Changes'}
                    </button>
                </div>

                {/* Main Layout Content */}
                <div className="space-y-6">

                    {/* Top Section: Alerts & Logs Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                        {/* Left Column: Alerts List (approx 70%) */}
                        <div className="lg:col-span-8 flex flex-col space-y-4">
                            <AlertSetting
                                icon={UserX}
                                title="Employee Idle Timeout"
                                checked={getAlertConfig('idle').enabled}
                                onChange={() => handleToggle('idle')}
                                onSettingsClick={() => setActiveModal('idle')}
                                description="Trigger alert when inactivity exceeds threshold."
                                color="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                            />
                            <AlertSetting
                                icon={Zap}
                                title="Unusual Activity Detection"
                                checked={getAlertConfig('unusual').enabled}
                                onChange={() => handleToggle('unusual')}
                                onSettingsClick={() => setActiveModal('unusual')}
                                description="AI detection for suspicious patterns & data access."
                                color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                            />
                            <AlertSetting
                                icon={Clock}
                                title="Missed Shift Alerts"
                                checked={getAlertConfig('missed').enabled}
                                onChange={() => handleToggle('missed')}
                                onSettingsClick={() => setActiveModal('missed')}
                                description="Instant notification for absenteeism."
                                color="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                            />
                            <AlertSetting
                                icon={MapPin}
                                title="Geofence Violations"
                                checked={getAlertConfig('geofence').enabled}
                                onChange={() => handleToggle('geofence')}
                                onSettingsClick={() => setActiveModal('geofence')}
                                description="Alert on unauthorized zone entry/exit."
                                color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            />
                            <AlertSetting
                                icon={TrendingUp}
                                title="Overtime Threshold"
                                checked={getAlertConfig('overtime').enabled}
                                onChange={() => handleToggle('overtime')}
                                onSettingsClick={() => setActiveModal('overtime')}
                                description="Monitor monitoring for burn-out risks & cost control."
                                color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            />
                        </div>

                        {/* Right Column: Recent Logs (approx 30%) - Full Height */}
                        <div className="lg:col-span-4 flex flex-col">
                            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xl h-full flex flex-col">
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <h2 className="text-lg font-black flex items-center gap-3 text-slate-900 dark:text-white">
                                        <Activity size={20} className="text-primary-600" />
                                        Recent Logs
                                    </h2>
                                    <button
                                        onClick={() => setShowLogsModal(true)}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        View All
                                    </button>
                                </div>

                                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 text-left">
                                    {mappedHistory.slice(0, 5).map(log => (
                                        <div key={log.id} className="flex gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                            <div className={cn(
                                                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                                                log.type === 'critical' ? 'bg-rose-50 text-rose-600 shadow-rose-100 dark:shadow-rose-900/20' :
                                                    log.type === 'warning' ? 'bg-amber-50 text-amber-600 shadow-amber-100 dark:shadow-amber-900/20' :
                                                        'bg-blue-50 text-blue-600 shadow-blue-100 dark:shadow-blue-900/20'
                                            )}>
                                                <log.icon size={18} strokeWidth={2.5} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate pr-2 group-hover:text-primary-600 transition-colors uppercase tracking-tight leading-none">{log.title}</p>
                                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md leading-none">{log.time}</span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                                    {log.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {mappedHistory.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                            <Info size={32} className="mb-2" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No recent alerts</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Notification Channels (Full Width) */}
                    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xl relative overflow-hidden group w-full">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-105 transition-transform duration-700">
                            <Shield size={120} className="text-primary-500" />
                        </div>
                        <div className="flex flex-col gap-8 relative z-10 w-full">
                            <h2 className="text-xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
                                <div className="p-3 bg-primary-50 rounded-2xl dark:bg-primary-900/20">
                                    <Shield size={24} className="text-primary-600" />
                                </div>
                                Notification Channels
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                {[
                                    { label: 'In-app Push', desc: 'Instant dashboard popups' },
                                    { label: 'Email Digest', desc: 'Daily summary reports' },
                                    { label: 'SMS Alerts', desc: 'Critical violations only' }
                                ].map((channel, i) => (
                                    <label key={i} className="relative flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 cursor-pointer group/item hover:bg-white border-2 border-transparent hover:border-primary-100 hover:shadow-2xl dark:hover:bg-slate-800 dark:hover:border-primary-900/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary-50/30 dark:to-primary-900/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="h-14 w-14 shrink-0 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-slate-400 group-hover/item:text-primary-600 group-hover/item:scale-110 transition-all duration-300">
                                                {i === 0 && <Bell size={24} strokeWidth={2.5} />}
                                                {i === 1 && <Settings2 size={24} strokeWidth={2.5} />}
                                                {i === 2 && <ShieldAlert size={24} strokeWidth={2.5} />}
                                            </div>
                                            <div>
                                                <div className="text-base font-black text-slate-900 dark:text-white group-hover/item:text-primary-600 transition-colors uppercase tracking-tight">{channel.label}</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1.5">{channel.desc}</div>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer scale-110 origin-right z-10">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                                            <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 shadow-inner"></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
