import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Shield,
    Calendar,
    ChevronRight,
    X,
    Eye,
    ShieldCheck,
    Lock,
    Clock,
    UserCheck,
    Info,
    ChevronDown,
    EyeOff
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { apiFetch } from '../utils/api';

const cn = (...inputs) => twMerge(clsx(inputs));

// --- New Components for Privacy Controls ---

const TransparencyModal = ({ isOpen, onClose, employee }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && employee) {
            const fetchSummary = async () => {
                try {
                    setLoading(true);
                    const data = await apiFetch(`/employees/${employee.id}/data-summary`);
                    setSummary(data);
                } catch (error) {
                    console.error('Failed to fetch data summary:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSummary();
        }
    }, [isOpen, employee]);

    if (!isOpen || !employee) return null;

    const dataTypes = [
        { name: 'Application Tracking', status: 'Enabled', count: summary?.totalTasks || 0, label: 'Tasks', desc: 'Records active window titles and usage duration.' },
        { name: 'Screenshot Monitoring', status: 'Smart Blur', count: summary?.totalScreenshots || 0, label: 'Captures', desc: 'Captures screen every 5-10 mins with sensitive data blurring.' },
        { name: 'Time Entries', status: 'Verified', count: summary?.totalTimeEntries || 0, label: 'Logs', desc: 'Manual and automated work logs for payroll.' },
        { name: 'Attendance Record', status: 'Operational', count: summary?.attendanceDays || 0, label: 'Days', desc: 'Daily check-in/out and shift adherence tracking.' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 shadow-sm">
                            <Eye size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">Transparency Dashboard</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{employee.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    {loading ? (
                        <div className="py-20 flex items-center justify-center">
                            <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compliance Incidents</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <ShieldCheck size={14} className={summary?.complianceIncidents > 0 ? "text-amber-500" : "text-emerald-500"} />
                                        {summary?.complianceIncidents || 0} Issues
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Clock size={14} className="text-primary-500" /> Every 5 Min
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Monitored Data Stats</h4>
                                {dataTypes.map((type, i) => (
                                    <div key={i} className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900/40 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">{type.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-tighter">
                                                    {type.count} {type.label}
                                                </span>
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 uppercase tracking-tighter">
                                                    {type.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-400 leading-tight">{type.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/20 flex gap-3 items-start mb-8">
                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                        Activity summaries are generated once every hour. All data is encrypted and subject to the company's Privacy Policy.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Dismiss Dashboard
                </button>
            </div>
        </div>
    );
};

const PrivacyControlsPanel = ({ isExpanded, toggleExpand }) => {
    return (
        <div className={cn(
            "rounded-[2.5rem] border transition-all duration-500 overflow-hidden",
            isExpanded
                ? "bg-white dark:bg-slate-900 shadow-2xl border-primary-100 dark:border-primary-900/30 p-8"
                : "bg-slate-50/80 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 p-6"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                        isExpanded ? "bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-none" : "bg-white dark:bg-slate-800 text-slate-400 shadow-sm"
                    )}>
                        <Lock size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Privacy & Monitoring Controls</h2>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">Enterprise-level data governance & transparency settings</p>
                    </div>
                </div>
                <button
                    onClick={toggleExpand}
                    className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all group"
                >
                    <ChevronDown size={20} className={cn("transition-transform duration-500", isExpanded && "rotate-180")} />
                </button>
            </div>

            {isExpanded && (
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-black text-slate-800 dark:text-slate-200">Work-Hours Monitoring</p>
                                <p className="text-[11px] font-medium text-slate-400">Auto pause tracking outside shift</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 shadow-inner"></div>
                            </label>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 flex items-center gap-3">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Globally Enforced</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Sensitive Data Protection</p>
                            <p className="text-[11px] font-medium text-slate-400">Global screenshot privacy mode</p>
                        </div>
                        <div className="relative group">
                            <select className="w-full h-11 pl-4 pr-10 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-200 appearance-none focus:border-primary-500 focus:bg-white transition-all cursor-pointer outline-none">
                                <option>Smart Sensitive Blur (Default)</option>
                                <option>Partial Interface Blur</option>
                                <option>Total Content Privacy</option>
                                <option>Disable Screenshotting</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Policy Compliance</p>
                            <p className="text-[11px] font-medium text-slate-400">Require employee acknowledgement</p>
                        </div>
                        <button className="w-full h-11 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-600 transition-all shadow-md">
                            Broadcast New Policy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const EmployeeRow = ({ employee, onSelect, onTransparencyClick }) => {
    // Simulated work-hour logic (Online 9-6)
    const isWithinWorkHours = employee.status !== 'offline';
    const policyStatus = employee.id % 3 === 0 ? 'accepted' : employee.id % 2 === 0 ? 'pending' : 'not accepted';

    return (
        <tr
            className="group flex flex-col md:table-row hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 border-b border-slate-50 dark:border-slate-800 last:border-0 p-4 md:p-0"
            onClick={() => onSelect(employee)}
        >
            <td className="px-4 py-2 md:px-6 md:py-5 block md:table-cell w-full md:w-auto">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-2xl border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden group-hover:scale-105 transition-transform bg-slate-100">
                        {employee.avatarUrl ? (
                            <img src={employee.avatarUrl} className="h-full w-full object-cover" alt="" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary-50 text-primary-600 font-black text-lg uppercase">
                                {employee.name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate break-words">{employee.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{employee.position || employee.role}</p>
                            <span className="md:hidden inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500">
                                {employee.department?.name || 'Unassigned'}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-2 md:px-6 md:py-5 hidden sm:table-cell">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {employee.department?.name || 'Unassigned'}
                </span>
            </td>
            <td className="px-4 py-2 md:px-6 md:py-5 block md:table-cell w-full md:w-auto">
                <div className="flex flex-wrap items-center gap-3 md:gap-2">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 transition-all",
                            employee.status === 'online' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                employee.status === 'idle' ? 'bg-amber-500 shadow-amber-500/50' :
                                    'bg-slate-300'
                        )}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{employee.status}</span>
                    </div>

                    {/* Monitoring info visible below name on mobile */}
                    <div className="md:hidden flex items-center">
                        {isWithinWorkHours ? (
                            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 uppercase tracking-tighter shadow-sm">
                                <Clock size={8} /> Active Monitoring
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-tighter">
                                <Clock size={8} /> Outside Hours
                            </span>
                        )}
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ring-1 ring-inset transition-all",
                            policyStatus === 'accepted' ? "bg-emerald-50 text-emerald-600 ring-emerald-500/30" :
                                policyStatus === 'pending' ? "bg-amber-50 text-amber-600 ring-amber-500/30" :
                                    "bg-rose-50 text-rose-600 ring-rose-500/30"
                        )}>
                            {policyStatus}
                        </span>
                    </div>
                </div>
            </td>
            {/* Keeping Monitoring Status in desktop name cell via hidden class on mobile if preferred, or separate cell */}
            <td className="hidden md:table-cell">
                {/* Handled in mobile view above */}
            </td>
            <td className="px-6 py-5 hidden md:table-cell">
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-inset transition-all",
                        policyStatus === 'accepted' ? "bg-emerald-50 text-emerald-600 ring-emerald-500/30" :
                            policyStatus === 'pending' ? "bg-amber-50 text-amber-600 ring-amber-500/30" :
                                "bg-rose-50 text-rose-600 ring-rose-500/30"
                    )}>
                        {policyStatus}
                    </span>
                    {policyStatus !== 'accepted' && (
                        <button className="text-[10px] font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest decoration-primary-600 underline underline-offset-4 decoration-2">
                            Resend
                        </button>
                    )}
                </div>
            </td>
            <td className="px-4 py-2 md:px-6 md:py-5 block md:table-cell w-full md:w-auto md:text-right">
                <div className="flex items-center justify-start md:justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onTransparencyClick(employee); }}
                        className="h-9 w-full md:w-9 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center gap-2 text-slate-400 hover:text-primary-600 hover:border-primary-100 dark:hover:border-primary-900/50 transition-all group/btn px-3 md:px-0"
                        title="View Transparency"
                    >
                        <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                        <span className="md:hidden text-[10px] font-black uppercase tracking-widest">Privacy Dashboard</span>
                    </button>
                    <button className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 hidden md:flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-50 hover:text-primary-600 shadow-sm">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export function EmployeeManagement() {
    const [realEmployees, setRealEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [stats, setStats] = useState({ total: 0 });
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [transparencyEmployee, setTransparencyEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Scroll Lock Logic - Prevent background scrolling when modal is open
    useEffect(() => {
        if (selectedEmployee || transparencyEmployee || showAddModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedEmployee, transparencyEmployee, showAddModal]);

    const fetchDepartments = useCallback(async () => {
        try {
            const response = await apiFetch('/departments');
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    }, []);

    const fetchEmployees = useCallback(async () => {
        try {
            setIsLoadingData(true);
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filterStatus !== 'All') params.append('status', filterStatus.toLowerCase());
            params.append('page', currentPage);
            params.append('pageSize', itemsPerPage);

            const response = await apiFetch(`/employees?${params.toString()}`);
            setRealEmployees(response.data || []);
            setStats({ total: response.meta?.total || 0 });
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setIsLoadingData(false);
        }
    }, [searchQuery, filterStatus, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, [fetchEmployees, fetchDepartments]);

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const newEmp = {
                name: formData.get('name'),
                position: formData.get('role'),
                email: formData.get('email'), // Need email for creation
                departmentId: formData.get('departmentId'),
            };
            await apiFetch('/employees', {
                method: 'POST',
                body: JSON.stringify(newEmp),
            });
            setShowAddModal(false);
            fetchEmployees();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to deactivate this employee?')) {
            try {
                await apiFetch(`/employees/${id}`, { method: 'DELETE' });
                setSelectedEmployee(null);
                fetchEmployees();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Derived values for UI compatibility
    const totalPages = Math.ceil(stats.total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEmployees = realEmployees;
    const filteredEmployees = realEmployees; // Used for "No results" and count displays
    const totalMatchingMembers = stats.total;

    return (
        <div className="relative space-y-6 pb-20 max-w-full overflow-x-hidden box-border px-4 md:px-0">
            {/* Transparency Modal */}
            <TransparencyModal
                isOpen={!!transparencyEmployee}
                onClose={() => setTransparencyEmployee(null)}
                employee={transparencyEmployee}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">Employees</h1>
                        <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400">Manage your team and their monitoring permissions.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <select
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none w-full sm:w-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 pr-10 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 shadow-sm transition-all hover:bg-slate-50"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Online">Online</option>
                            <option value="Idle">Idle</option>
                            <option value="Offline">Offline</option>
                        </select>
                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 transition-all shadow-xl hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
                    >
                        <Plus size={16} strokeWidth={3} /> Add Member
                    </button>
                </div>
            </div>

            {/* Privacy Controls Section */}
            <PrivacyControlsPanel
                isExpanded={isPrivacyExpanded}
                toggleExpand={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
            />

            <div className="rounded-[2.5rem] border border-slate-200 bg-white dark:border-slate-900 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, role, or team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 pl-12 pr-4 py-3 text-sm font-bold focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 transition-all"
                        />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <UserCheck size={14} className="text-emerald-500" />
                        {totalMatchingMembers} Team Members
                    </div>
                </div>
                <div className="overflow-x-hidden md:overflow-x-auto">
                    <table className="w-full text-left block md:table">
                        <thead className="hidden md:table-header-group">
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Department</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Policy Status</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-slate-400"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 block md:table-row-group">
                            {(paginatedEmployees || []).map((emp) => (
                                <EmployeeRow
                                    key={emp.id}
                                    employee={emp}
                                    onSelect={setSelectedEmployee}
                                    onTransparencyClick={setTransparencyEmployee}
                                />
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr className="block md:table-row">
                                    <td colSpan="5" className="px-6 py-20 text-center block md:table-cell">
                                        <div className="flex flex-col items-center justify-center opacity-50">
                                            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">No employees found</p>
                                            <p className="text-sm font-medium text-slate-500">Try adjusting your filters or search terms</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Showing <span className="text-slate-900 dark:text-white">{startIndex + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(startIndex + itemsPerPage, totalMatchingMembers)}</span> of <span className="text-slate-900 dark:text-white">{totalMatchingMembers}</span> members
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:hover:border-slate-200 transition-all flex items-center gap-2"
                            >
                                <ChevronRight size={14} className="rotate-180" /> Previous
                            </button>

                            <div className="flex items-center gap-1 mx-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "h-9 w-9 rounded-xl text-[10px] font-black transition-all",
                                            currentPage === i + 1
                                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                                                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:hover:border-slate-200 transition-all flex items-center gap-2"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">Add Member</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">Onboard new talent</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddEmployee} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                <input required name="name" type="text" placeholder="e.g. Robert Fox" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold focus:border-primary-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Job Role</label>
                                <input required name="role" type="text" placeholder="e.g. Senior Developer" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold focus:border-primary-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                <input required name="email" type="email" placeholder="e.g. robert@company.com" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold focus:border-primary-500 focus:bg-white focus:outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Department</label>
                                <div className="relative">
                                    <select required name="departmentId" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 focus:border-primary-500 focus:bg-white focus:outline-none appearance-none transition-all cursor-pointer">
                                        <option value="">Select Department</option>
                                        {(departments || []).map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                                    Authorize & Onboard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Drawer Overlay */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300 border-l border-white/20">
                        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-8 dark:border-slate-800">
                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Employee Profile</h3>
                            <button onClick={() => setSelectedEmployee(null)} className="rounded-xl p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 dark:hover:bg-slate-800 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-8 h-[calc(100vh-80px)] scrollbar-thin">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-32 w-32 rounded-full ring-8 ring-slate-50 dark:ring-slate-800/50 p-1 mb-6 shadow-xl relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-white dark:border-slate-700"></div>
                                    {selectedEmployee.avatarUrl ? (
                                        <img src={selectedEmployee.avatarUrl} className="h-full w-full rounded-full object-cover" alt="" />
                                    ) : (
                                        <div className="h-full w-full rounded-full flex items-center justify-center bg-primary-50 text-primary-600 font-black text-3xl uppercase">
                                            {selectedEmployee.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div className={`absolute bottom-2 right-2 h-6 w-6 rounded-full ring-4 ring-white dark:ring-slate-900 ${selectedEmployee.status === 'online' ? 'bg-emerald-500' :
                                        selectedEmployee.status === 'idle' ? 'bg-amber-500' :
                                            selectedEmployee.status === 'offline' ? 'bg-slate-300' : 'bg-red-500'
                                        }`}></div>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedEmployee.name}</h4>
                                <p className="text-sm font-bold text-primary-600 mb-4">{selectedEmployee.position || selectedEmployee.role}</p>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700">{selectedEmployee.department?.name || 'Unassigned'}</span>
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono border border-slate-200 dark:border-slate-700">ID: {selectedEmployee.employeeId || selectedEmployee.id.toString().slice(-4)}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-6">
                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Information</h5>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail size={16} className="text-slate-400" />
                                            <span>{selectedEmployee.name.toLowerCase().replace(' ', '.')}@shoppeal.tech</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone size={16} className="text-slate-400" />
                                            <span>+1 (555) 000-0000</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span>New York, USA</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Lock size={12} className="text-primary-500" /> Privacy & Monitoring Controls
                                    </h5>
                                    <div className="rounded-2xl border-2 border-slate-100 p-6 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black text-slate-800 dark:text-white">Restrict Monitoring</p>
                                                <p className="text-[10px] font-bold text-slate-400">Enable shift-only tracking</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 shadow-inner"></div>
                                            </label>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Screenshot Privacy</p>
                                            <div className="relative group/sel">
                                                <select className="w-full h-10 pl-4 pr-10 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-200 focus:border-primary-500 focus:bg-white transition-all appearance-none outline-none cursor-pointer">
                                                    <option>Smart Sensitive Blur</option>
                                                    <option>Partial Interface Blur</option>
                                                    <option>None (Total Visibility)</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/sel:text-primary-600 transition-colors" />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={() => setTransparencyEmployee(selectedEmployee)}
                                                className="w-full py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-50 hover:border-primary-100 dark:hover:bg-primary-900/10 dark:hover:border-primary-900/30 hover:text-primary-600 transition-all group"
                                            >
                                                <EyeOff size={16} className="group-hover:scale-110 transition-transform" /> View Shared Monitoring Log
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <button className="rounded-2xl border-2 border-slate-200 py-3.5 text-xs font-black uppercase tracking-wider hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-all">Edit Profile</button>
                                <button
                                    onClick={() => handleDelete(selectedEmployee.id)}
                                    className="rounded-2xl bg-slate-900 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Deactivate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
