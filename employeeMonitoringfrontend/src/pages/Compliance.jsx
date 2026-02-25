import React, { useState, useEffect } from 'react';
import {
    Shield, Lock, Fingerprint, FileCheck, ClipboardList, ShieldCheck,
    Search, Download, CheckCircle2, AlertTriangle, Info, X,
    ChevronDown, Key, Globe, Trash2, Send, QrCode, UserCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// --- Mock Initial Logs ---
const initialAuditLogs = [
    { id: 1, action: 'User Login', user: 'admin@shoppeal.tech', ip: '192.168.1.1', time: '2 mins ago', status: 'Success' },
    { id: 2, action: 'Access Sensitive Document', user: 'manager_01', ip: '192.168.1.45', time: '15 mins ago', status: 'Warning' },
    { id: 3, action: 'Updated Monitoring Policy', user: 'admin@shoppeal.tech', ip: '192.168.1.1', time: '1 hour ago', status: 'Success' },
    { id: 4, action: 'Bulk Export Attempt', user: 'employee_test', ip: '45.12.89.2', time: '3 hours ago', status: 'Denied' },
    { id: 5, action: 'System Backup Complete', user: 'System', ip: 'Local', time: '5 hours ago', status: 'Success' },
];

// --- Generic Modal Wrapper ---
const Modal = ({ isOpen, onClose, title, icon: Icon, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 shadow-sm">
                            <Icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{title}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Configure Security Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-all">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const ComplianceCard = ({ icon: Icon, title, description, badge, active, onSettingClick }) => (
    <div className={cn(
        "flex flex-col p-6 rounded-[2.5rem] border transition-all duration-300 group relative overflow-hidden",
        active
            ? "border-emerald-100 bg-white dark:border-emerald-900/30 dark:bg-slate-900 shadow-xl"
            : "border-slate-200 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm"
    )}>
        {active && (
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Icon size={64} className="text-emerald-500" />
            </div>
        )}
        <div className="flex justify-between items-start mb-6">
            <div className={cn(
                "p-4 rounded-2xl transition-all duration-300",
                active
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 shadow-inner"
                    : "bg-white dark:bg-slate-800 text-slate-400 group-hover:text-primary-600 shadow-sm"
            )}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            {badge && (
                <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                )}>
                    {badge}
                </span>
            )}
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">{title}</h3>
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-8 flex-grow leading-relaxed">
            {description}
        </p>
        <button
            onClick={() => onSettingClick(title)}
            className="w-full py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest shadow-sm hover:border-primary-500 hover:text-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
        >
            Configure Settings
            <Lock size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
    </div>
);

export function Compliance() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [showToast, setShowToast] = useState(false);

    // --- Live System State ---
    const [complianceState, setComplianceState] = useState(() => {
        const saved = localStorage.getItem('compliance_state');
        return saved ? JSON.parse(saved) : {
            encryptionActive: true,
            twoFactorActive: false,
            gdprRegionLock: true,
            dataRetentionDays: 365,
            consentStats: { accepted: 42, total: 45 },
            roles: [
                { id: 'admin', name: 'Administrator', perms: ['view', 'edit', 'export', 'manage'] },
                { id: 'manager', name: 'Manager', perms: ['view', 'export'] },
                { id: 'employee', name: 'Employee', perms: ['view'] }
            ]
        };
    });

    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem('audit_logs');
        return saved ? JSON.parse(saved) : initialAuditLogs;
    });

    useEffect(() => {
        localStorage.setItem('compliance_state', JSON.stringify(complianceState));
    }, [complianceState]);

    useEffect(() => {
        localStorage.setItem('audit_logs', JSON.stringify(logs));
    }, [logs]);

    const addLog = (action, status = 'Success', user = 'admin@shoppeal.tech') => {
        const newLog = {
            id: Date.now(),
            action,
            user,
            ip: '192.168.1.1',
            time: 'Just now',
            status
        };
        setLogs(prev => [newLog, ...prev]);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleConfig = (title) => {
        const mapping = {
            'Role-based access control': 'rbac',
            'Data encryption': 'encryption',
            'GDPR compliance settings': 'gdpr',
            'Employee consent forms': 'consent',
            'Audit logs': 'logs_config',
            'Two-factor authentication': '2fa'
        };
        setActiveModal(mapping[title]);
    };

    const handleExportLogs = () => {
        const headers = ["ID,Action,User,IP Address,Time,Status"];
        const rows = logs.map(log =>
            `${log.id},${log.action},${log.user},${log.ip},${log.time},${log.status}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "system_audit_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addLog('Audit Logs Exported');
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden box-border px-4 md:px-0">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">Security & Compliance</h1>
                <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage data privacy, access controls, and regulatory requirements.</p>
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed top-24 right-8 z-[200] flex items-center gap-4 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl animate-in slide-in-from-right-full">
                    <CheckCircle2 size={20} />
                    <p className="text-sm font-black uppercase tracking-wider">System Settings Updated</p>
                </div>
            )}

            {/* RBAC Modal */}
            <Modal isOpen={activeModal === 'rbac'} onClose={() => setActiveModal(null)} title="Role Permissions" icon={ShieldCheck}>
                <div className="space-y-6">
                    {complianceState.roles.map((role, idx) => (
                        <div key={role.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                                {role.name}
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{role.perms.length} Active Rules</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {['view', 'edit', 'export', 'manage'].map(perm => (
                                    <label key={perm} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary-200 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={role.perms.includes(perm)}
                                            onChange={() => {
                                                const newRoles = [...complianceState.roles];
                                                const currentPerms = newRoles[idx].perms;
                                                newRoles[idx].perms = currentPerms.includes(perm)
                                                    ? currentPerms.filter(p => p !== perm)
                                                    : [...currentPerms, perm];
                                                setComplianceState({ ...complianceState, roles: newRoles });
                                                addLog(`Permission Updated: ${role.name}/${perm}`);
                                            }}
                                            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{perm} Data</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
                        Commit Changes
                    </button>
                </div>
            </Modal>

            {/* Encryption Modal */}
            <Modal isOpen={activeModal === 'encryption'} onClose={() => setActiveModal(null)} title="Data Encryption" icon={Lock}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                        <div>
                            <p className="text-sm font-black text-emerald-900 dark:text-emerald-400">AES-256 Storage Encryption</p>
                            <p className="text-[11px] font-medium text-emerald-700/60 dark:text-emerald-500">Currently securing all screenshots & logs</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer scale-125">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={complianceState.encryptionActive}
                                onChange={(e) => {
                                    setComplianceState({ ...complianceState, encryptionActive: e.target.checked });
                                    addLog(`Encryption ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                                }}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600 shadow-inner"></div>
                        </label>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Key size={16} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Master Secret Key</span>
                            </div>
                            <span className="text-[10px] font-mono p-1 bg-slate-100 dark:bg-slate-800 rounded">•••• •••• •••• 5G2H</span>
                        </div>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
                        Update Key Policy
                    </button>
                </div>
            </Modal>

            {/* GDPR Modal */}
            <Modal isOpen={activeModal === 'gdpr'} onClose={() => setActiveModal(null)} title="GDPR Controls" icon={Shield}>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Data Retention Period</p>
                        <select
                            value={complianceState.dataRetentionDays}
                            onChange={(e) => {
                                setComplianceState({ ...complianceState, dataRetentionDays: parseInt(e.target.value) });
                                addLog(`Retention Period Set: ${e.target.value} Days`);
                            }}
                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 dark:bg-slate-800 dark:border-slate-800 text-sm font-bold appearance-none outline-none focus:border-primary-500"
                        >
                            <option value={90}>90 Days (Minimum)</option>
                            <option value={365}>1 Year (Default)</option>
                            <option value={1095}>3 Years (Extended)</option>
                            <option value={2555}>7 Years (Maximum)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-primary-200 transition-all">
                            <Globe size={24} className="text-primary-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Region Block</span>
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Wipe all archived employee data? This cannot be undone.')) {
                                    addLog('Bulk Data Wipe Executed', 'Warning');
                                }
                            }}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-red-50 dark:border-red-900/10 bg-red-50/30 dark:bg-red-900/5 hover:border-red-200 transition-all"
                        >
                            <Trash2 size={24} className="text-red-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Purge Data</span>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Consent Modal */}
            <Modal isOpen={activeModal === 'consent'} onClose={() => setActiveModal(null)} title="Consent Management" icon={FileCheck}>
                <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black mb-1">93.3%</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Total Policy Compliance</p>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '93.3%' }}></div>
                            </div>
                        </div>
                        <FileCheck className="absolute top-1/2 -right-4 -translate-y-1/2 text-white/5" size={120} />
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                addLog('New Consent Policy Broadcasted');
                                setActiveModal(null);
                            }}
                            className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                        >
                            <Send size={16} /> Broadcast New Policy
                        </button>
                        <button className="w-full p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                            <UserCheck size={16} /> Resend Pending (3)
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 2FA Modal */}
            <Modal isOpen={activeModal === '2fa'} onClose={() => setActiveModal(null)} title="Multi-Factor Auth" icon={Fingerprint}>
                <div className="space-y-8 flex flex-col items-center py-4">
                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <QrCode size={160} className="text-slate-900 dark:text-white" />
                    </div>
                    <div className="text-center space-y-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Scan setup code</h4>
                        <p className="text-[11px] font-medium text-slate-500 max-w-[240px]">Use Google Authenticator or Microsoft Auth to secure your account.</p>
                    </div>
                    <button
                        onClick={() => {
                            setComplianceState({ ...complianceState, twoFactorActive: !complianceState.twoFactorActive });
                            addLog(`2FA ${!complianceState.twoFactorActive ? 'Enabled' : 'Disabled'}`);
                        }}
                        className={cn(
                            "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl",
                            complianceState.twoFactorActive ? "bg-red-50 text-red-600" : "bg-primary-600 text-white"
                        )}
                    >
                        {complianceState.twoFactorActive ? 'Disable 2FA Protection' : 'Enable 2FA Protection'}
                    </button>
                </div>
            </Modal>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <ComplianceCard
                    icon={ShieldCheck}
                    title="Role-based access control"
                    description="Assign specific permissions to Admin, Manager, and Employee roles to ensure data integrity."
                    badge="Active"
                    active={true}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={Lock}
                    title="Data encryption"
                    description="Enterprise-grade AES-256 encryption for all stored screenshots, logs, and sensitive employee data."
                    badge={complianceState.encryptionActive ? "Encrypted" : "Decrypted"}
                    active={complianceState.encryptionActive}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={Shield}
                    title="GDPR compliance settings"
                    description="Configure data retention policies, right-to-be-forgotten requests, and region-specific privacy controls."
                    badge="Compliant"
                    active={complianceState.gdprRegionLock}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={FileCheck}
                    title="Employee consent forms"
                    description="Manage digital consent signatures and privacy disclosure agreements for all monitored staff."
                    badge={`${complianceState.consentStats.accepted}/${complianceState.consentStats.total}`}
                    active={true}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={ClipboardList}
                    title="Audit logs"
                    description="Comprehensive tracking of all system access and administrative actions for security auditing."
                    badge={`${logs.length} Entries`}
                    active={true}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={Fingerprint}
                    title="Two-factor authentication"
                    description="Enforce 2FA for all administrative accounts to prevent unauthorized access to sensitive data."
                    badge={complianceState.twoFactorActive ? "Enabled" : "Disabled (Setup)"}
                    active={true}
                    onSettingClick={handleConfig}
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-4 md:p-6 dark:border-slate-800 gap-4">
                    <h3 className="text-base md:text-lg font-bold">Recent System Audit</h3>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-full focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={handleExportLogs}
                            title="Export Audit Logs"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Download size={18} className="text-slate-500" />
                            <span className="sm:hidden text-xs font-bold text-slate-500 uppercase tracking-widest">Export CSV</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-hidden md:overflow-x-auto">
                    <table className="w-full text-left block md:table">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 hidden md:table-header-group">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Action Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">User Context</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">IP Address</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 block md:table-row-group">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors flex flex-col md:table-row p-4 md:p-0">
                                    <td className="px-0 py-1 md:px-6 md:py-4 text-sm font-black md:font-bold block md:table-cell text-slate-900 dark:text-white">{log.action}</td>
                                    <td className="px-0 py-1 md:px-6 md:py-4 text-xs md:text-sm text-slate-500 block md:table-cell break-words min-w-0">
                                        <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">User:</span>
                                        {log.user}
                                    </td>
                                    <td className="px-0 py-1 md:px-6 md:py-4 text-[10px] md:text-sm font-mono text-slate-400 block md:table-cell">
                                        <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 font-sans">IP:</span>
                                        {log.ip}
                                    </td>
                                    <td className="px-0 py-1 md:px-6 md:py-4 text-xs md:text-sm text-slate-400 block md:table-cell">
                                        <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Time:</span>
                                        {log.time}
                                    </td>
                                    <td className="px-0 py-2 md:px-6 md:py-4 block md:table-cell">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                                            log.status === 'Warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                                                'bg-red-50 text-red-600 dark:bg-red-900/20'
                                            }`}>
                                            {log.status === 'Success' ? <CheckCircle2 size={12} /> :
                                                log.status === 'Warning' ? <AlertTriangle size={12} /> :
                                                    <Info size={12} />}
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr className="block md:table-row">
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm italic block md:table-cell">
                                        No audit entries found matching your search query.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
