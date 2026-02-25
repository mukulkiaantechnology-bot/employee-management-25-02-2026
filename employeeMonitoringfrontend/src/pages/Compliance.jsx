import React, { useState, useEffect } from 'react';
import {
    Shield, Lock, Fingerprint, FileCheck, ClipboardList, ShieldCheck,
    Search, Download, CheckCircle2, AlertTriangle, Info, X,
    ChevronDown, Key, Globe, Trash2, Send, QrCode, UserCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRealTime } from '../hooks/RealTimeContext';
import { apiClient } from '../utils/apiClient';

const cn = (...inputs) => twMerge(clsx(inputs));


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
    const {
        auditLogs,
        complianceStatus,
        fetchAuditLogs,
        fetchComplianceStatus,
        broadcastConsent,
        isLoading,
        addNotification
    } = useRealTime();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial fetch for compliance specific data if not loaded
    useEffect(() => {
        if (!complianceStatus) fetchComplianceStatus();
        if (auditLogs.length === 0) fetchAuditLogs();
    }, [complianceStatus, auditLogs.length, fetchComplianceStatus, fetchAuditLogs]);

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
        // Use the backend export endpoint
        const link = document.createElement("a");
        link.href = `${apiClient.baseURL}/compliance/audit-logs/export`;
        link.download = 'audit-logs.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification('System Audit Logs Exported', 'info');
    };

    const handleBroadcast = async () => {
        setIsProcessing(true);
        try {
            await broadcastConsent('v1.0.0');
        } finally {
            setIsProcessing(false);
            setActiveModal(null);
        }
    };

    const filteredLogs = auditLogs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.status || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading && !complianceStatus) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden box-border px-4 md:px-0">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">Security & Compliance</h1>
                <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage data privacy, access controls, and regulatory requirements.</p>
            </div>

            {/* RBAC Modal */}
            <Modal isOpen={activeModal === 'rbac'} onClose={() => setActiveModal(null)} title="Role Permissions" icon={ShieldCheck}>
                <div className="space-y-6">
                    <p className="text-sm text-slate-500">RBAC configurations are synchronized with the core server architecture.</p>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold leading-relaxed">
                        Changes to core permissions require system administrator privileges and may affect API access immediately.
                    </div>
                    <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
                        Done
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
                        <div className="h-6 w-11 bg-emerald-600 rounded-full flex items-center px-1">
                            <div className="h-4 w-4 bg-white rounded-full translate-x-5" />
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 text-xs leading-relaxed">
                        Encryption is managed at the database and storage level. Manual toggling is restricted for data integrity.
                    </div>
                    <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
                        Close
                    </button>
                </div>
            </Modal>

            {/* GDPR Modal */}
            <Modal isOpen={activeModal === 'gdpr'} onClose={() => setActiveModal(null)} title="GDPR Controls" icon={Shield}>
                <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Retention Policy</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{complianceStatus?.dataRetentionDays || 365} Days</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-primary-200 transition-all">
                            <Globe size={24} className="text-primary-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Region Block</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-red-50 dark:border-red-900/10 bg-red-50/30 dark:bg-red-900/5 hover:border-red-200 transition-all opacity-50 cursor-not-allowed">
                            <Trash2 size={24} className="text-red-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Purge Data</span>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Consent Modal */}
            <Modal isOpen={activeModal === 'consent'} onClose={() => setActiveModal(null)} title="Consent Management" icon={FileCheck}>
                <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black mb-1">
                                {complianceStatus?.consentStats ? Math.round((complianceStatus.consentStats.given / complianceStatus.consentStats.total) * 100) : 0}%
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Total Policy Compliance</p>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                    style={{ width: `${complianceStatus?.consentStats ? (complianceStatus.consentStats.given / complianceStatus.consentStats.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <FileCheck className="absolute top-1/2 -right-4 -translate-y-1/2 text-white/5" size={120} />
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={handleBroadcast}
                            disabled={isProcessing}
                            className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        >
                            {isProcessing ? <div className="h-4 w-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                            Broadcast New Policy
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
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Security Policy</h4>
                        <p className="text-[11px] font-medium text-slate-500 max-w-[240px]">
                            {complianceStatus?.twoFactorRequired ? 'Two-factor authentication is currently ENFORCED for all accounts.' : 'Two-factor authentication is optional but highly recommended.'}
                        </p>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="w-full py-4 rounded-2xl bg-primary-600 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl">
                        Done
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
                    badge={complianceStatus?.encryptionEnabled !== false ? "Encrypted" : "Decrypted"}
                    active={complianceStatus?.encryptionEnabled !== false}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={Shield}
                    title="GDPR compliance settings"
                    description="Configure data retention policies, right-to-be-forgotten requests, and region-specific privacy controls."
                    badge="Compliant"
                    active={complianceStatus?.gdprRegionLock !== false}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={FileCheck}
                    title="Employee consent forms"
                    description="Manage digital consent signatures and privacy disclosure agreements for all monitored staff."
                    badge={complianceStatus?.consentStats ? `${complianceStatus.consentStats.given}/${complianceStatus.consentStats.total}` : 'N/A'}
                    active={true}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={ClipboardList}
                    title="Audit logs"
                    description="Comprehensive tracking of all system access and administrative actions for security auditing."
                    badge={`${auditLogs.length} Entries`}
                    active={true}
                    onSettingClick={handleConfig}
                />
                <ComplianceCard
                    icon={Fingerprint}
                    title="Two-factor authentication"
                    description="Enforce 2FA for all administrative accounts to prevent unauthorized access to sensitive data."
                    badge={complianceStatus?.twoFactorRequired ? "Enforced" : "Optional"}
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
                                        {log.user?.name || log.user?.email || 'System'}
                                    </td>
                                    <td className="px-0 py-1 md:px-6 md:py-4 text-[10px] md:text-sm font-mono text-slate-400 block md:table-cell">
                                        <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 font-sans">IP:</span>
                                        {log.ip || '---'}
                                    </td>
                                    <td className="px-0 py-1 md:px-6 md:py-4 text-xs md:text-sm text-slate-400 block md:table-cell">
                                        <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Time:</span>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-0 py-2 md:px-6 md:py-4 block md:table-cell">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${log.status === 'success' || log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                                            log.status === 'warning' || log.status === 'Warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                                                'bg-red-50 text-red-600 dark:bg-red-900/20'
                                            }`}>
                                            {(log.status === 'success' || log.status === 'Success') ? <CheckCircle2 size={12} /> :
                                                (log.status === 'warning' || log.status === 'Warning') ? <AlertTriangle size={12} /> :
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
