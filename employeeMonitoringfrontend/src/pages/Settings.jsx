import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, User, Bell, Lock, Monitor, Building,
    CreditCard, Shield, Globe, MessageSquare, ChevronRight, Search,
    X, Save, CheckCircle2, Sliders, MapPin, Zap, ExternalLink,
    Mail, Smartphone, Palette, History, LogOut, Camera, Trash2,
    ShieldCheck, Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const SettingCard = ({ icon: Icon, title, description, badge, onClick, active = false }) => (
    <div
        onClick={() => onClick(title)}
        className={cn(
            "group flex flex-col p-6 rounded-[2.5rem] border bg-white dark:bg-slate-900 transition-all duration-300 cursor-pointer relative overflow-hidden",
            "hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1",
            active ? "border-primary-100 dark:border-primary-900/40 ring-4 ring-primary-50/50 dark:ring-primary-900/10" : "border-slate-100 dark:border-slate-800"
        )}
    >
        <div className="flex justify-between items-start mb-6">
            <div className={cn(
                "p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-900/20"
            )}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            {badge && (
                <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-[10px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest animate-pulse-subtle">
                    {badge}
                </span>
            )}
        </div>
        <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{title}</h4>
            <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-wide opacity-80">{description}</p>
        </div>
        <div className="mt-8 flex items-center justify-between">
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest decoration-primary-600/30 underline underline-offset-4 decoration-2">Configure Protocol</span>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all" />
        </div>
    </div>
);

const ModalWrapper = ({ isOpen, onClose, title, icon: Icon, children, onSave }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-white/50 dark:border-slate-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 shadow-sm">
                            <Icon size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{title}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Administrative Control Panel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 dark:bg-slate-800 flex items-center justify-center transition-all bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-8">
                    {children}
                    <div className="pt-6 flex gap-4">
                        <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={onSave} className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                            <Save size={18} /> Commit Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function Settings() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [showSaveToast, setShowSaveToast] = useState(false);

    // --- Persisted Settings State ---
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('app_settings');
        return saved ? JSON.parse(saved) : {
            company: { name: "Shoppeal Tech Private Limited", address: "Innovation Valley, CA 94043", country: "United States" },
            monitoring: { interval: 10, idleThreshold: 5, enableBlur: true, geoFenceRange: 50 },
            notifications: { email: true, push: true, weekly: false },
            appearance: { theme: 'Dark', fontSize: 'Medium' },
            billing: { plan: 'Enterprise', status: 'Active' }
        };
    });

    useEffect(() => {
        localStorage.setItem('app_settings', JSON.stringify(settings));
    }, [settings]);

    const handleSave = () => {
        setActiveModal(null);
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
    };

    const categories = [
        {
            name: "Organization",
            items: [
                { icon: Building, title: "Company Profile", description: "Global identity & business address" },
                { icon: Shield, title: "Role-Based Access", description: "Manage hierarchy & permissions", badge: "Admin" },
                { icon: CreditCard, title: "Billing & Plans", description: "Subscriptions and invoices" },
                { icon: Zap, title: "Integrations", description: "Connect Slack, Xero & Slack" },
            ]
        },
        {
            name: "Monitoring & Tracking",
            items: [
                { icon: Monitor, title: "Global Policy", description: "Frequency & idle logic" },
                { icon: Lock, title: "Privacy Controls", description: "Blur & retention logic" },
                { icon: MapPin, title: "Map & Geofence", description: "Tracking boundaries & rules" },
                { icon: Bell, title: "Alert Thresholds", description: "Productivity triggers" },
            ]
        },
        {
            name: "Admin Hub",
            items: [
                { icon: User, title: "My Profile", description: "Personal details & avatar" },
                { icon: Palette, title: "Appearance", description: "Layout & visual theme" },
                { icon: Smartphone, title: "Device Sync", description: "Authorized mobile devices" },
                { icon: History, title: "Activity History", description: "Internal security logs" },
            ]
        }
    ];

    const filteredCategories = categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 md:px-0 animate-in fade-in duration-700">
            {showSaveToast && (
                <div className="fixed top-24 right-8 z-[200] flex items-center gap-4 px-6 py-4 bg-emerald-600 text-white rounded-3xl shadow-2xl animate-in slide-in-from-right-full">
                    <CheckCircle2 size={24} />
                    <div>
                        <p className="text-sm font-black uppercase tracking-wider">Settings Synchronized</p>
                        <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest opacity-80">Global changes are now live</p>
                    </div>
                </div>
            )}

            {/* Header Hero */}
            <div className="relative overflow-hidden p-12 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <SettingsIcon size={240} className="animate-spin-slow" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600 text-[10px] font-black uppercase tracking-[0.2em]">
                        <Shield size={12} /> Enterprise Control Center
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter">System Console</h1>
                    <p className="text-lg font-bold text-slate-400 max-w-xl leading-relaxed">
                        Configure advanced monitoring protocols, workspace privacy, and organizational hierarchy from a centralized dashboard.
                    </p>
                </div>
            </div>

            {/* Search Bar Premium */}
            <div className="relative group w-full max-w-2xl px-4 md:px-0">
                <div className="absolute inset-0 bg-primary-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden focus-within:border-primary-500 transition-all">
                    <Search className="absolute left-6 text-slate-400 group-focus-within:text-primary-500 transition-colors hidden sm:block" size={24} />
                    <Search className="absolute left-4 text-slate-400 group-focus-within:text-primary-500 transition-colors sm:hidden" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search configurations..."
                        className="w-full h-16 md:h-20 pl-12 md:pl-16 pr-4 md:pr-24 text-base md:text-lg font-bold placeholder:text-slate-300 focus:outline-none bg-transparent dark:text-white min-w-0 flex-1"
                    />
                    <div className="absolute right-3 md:right-6 select-none pointer-events-none hidden xs:flex">
                        <span className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-800 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                            <span className="hidden md:inline">Cmd + K</span>
                            <span className="md:hidden">⌘K</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="space-y-16">
                {filteredCategories.map((group, i) => (
                    <section key={i} className="space-y-8 animate-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center gap-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">{group.name}</h3>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {group.items.map((item, idx) => (
                                <SettingCard key={idx} {...item} onClick={setActiveModal} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* --- Modals Logic --- */}

            <ModalWrapper
                isOpen={activeModal === 'Company Profile'}
                onClose={() => setActiveModal(null)}
                title="Workspace Identity"
                icon={Building}
                onSave={handleSave}
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <Building size={40} />
                            </div>
                            <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900 hover:scale-110 transition-transform">
                                <Camera size={16} />
                            </button>
                        </div>
                        <p className="mt-4 text-[10px] font-black text-primary-600 uppercase tracking-widest">Update Corporate Seal</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Corporate Name</label>
                            <input
                                type="text"
                                value={settings.company.name}
                                onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name: e.target.value } })}
                                className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Business HQ Address</label>
                            <textarea
                                rows="3"
                                value={settings.company.address}
                                onChange={(e) => setSettings({ ...settings, company: { ...settings.company, address: e.target.value } })}
                                className="w-full p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold resize-none"
                            />
                        </div>
                    </div>
                </div>
            </ModalWrapper>

            <ModalWrapper
                isOpen={activeModal === 'Role-Based Access'}
                onClose={() => setActiveModal(null)}
                title="Access Hierarchy"
                icon={ShieldCheck}
                onSave={handleSave}
            >
                <div className="space-y-6">
                    {['Admin', 'Manager', 'Employee'].map((role) => (
                        <div key={role} className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{role} Permissions</h4>
                                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[9px] font-bold text-slate-400 uppercase border border-slate-100 dark:border-slate-700">Level 0{role === 'Admin' ? '1' : role === 'Manager' ? '2' : '3'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {['View Data', 'Edit Staff', 'Export Files', 'Delete Logs'].map(perm => (
                                    <label key={perm} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 cursor-pointer hover:border-primary-200 transition-all">
                                        <input type="checkbox" defaultChecked={role === 'Admin'} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{perm}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ModalWrapper>

            <ModalWrapper
                isOpen={activeModal === 'Billing & Plans'}
                onClose={() => setActiveModal(null)}
                title="License & Billing"
                icon={CreditCard}
                onSave={handleSave}
            >
                <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative shadow-2xl overflow-hidden">
                        <CreditCard className="absolute -top-4 -right-4 text-white/5" size={120} />
                        <div className="relative z-10 flex justify-between items-start mb-12">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Tier</p>
                                <h4 className="text-3xl font-black">Enterprise <span className="text-xs text-primary-400 uppercase">v2.4</span></h4>
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">Active License</span>
                        </div>
                        <div className="relative z-10 flex gap-12">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Active Staff</p>
                                <p className="text-xl font-bold">142 / 200</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Next Bill</p>
                                <p className="text-xl font-bold">Mar 15, 2026</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:border-primary-500 hover:text-primary-600 transition-all">
                        <ExternalLink size={16} /> Update Payment Method
                    </button>
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
                        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-amber-700 leading-relaxed">Changes to your seat count will be prorated and applied to the next billing cycle automatically.</p>
                    </div>
                </div>
            </ModalWrapper>

            <ModalWrapper
                isOpen={activeModal === 'Integrations'}
                onClose={() => setActiveModal(null)}
                title="System Hub"
                icon={Zap}
                onSave={handleSave}
            >
                <div className="space-y-4">
                    {[
                        { name: 'Slack Notify', desc: 'Sync alerts to #security channel', icon: MessageSquare, active: true },
                        { name: 'Jira Software', desc: 'Auto-create tickets for violations', icon: Shield, active: false },
                        { name: 'G-Workspace', desc: 'Single Sign-On & File Audit', icon: Globe, active: true }
                    ].map((app) => (
                        <div key={app.name} className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <app.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{app.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{app.desc}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={app.active} />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </ModalWrapper>

            <ModalWrapper
                isOpen={activeModal === 'Global Policy'}
                onClose={() => setActiveModal(null)}
                title="Monitoring Logic"
                icon={Monitor}
                onSave={handleSave}
            >
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Capture Frequency</span>
                            <span className="text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg">Every {settings.monitoring.interval} Minutes</span>
                        </div>
                        <input
                            type="range"
                            min="1" max="60"
                            value={settings.monitoring.interval}
                            onChange={(e) => setSettings({ ...settings, monitoring: { ...settings.monitoring, interval: e.target.value } })}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-primary-600 cursor-pointer"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                            <Sliders size={20} className="text-primary-600 mb-3" />
                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase mb-1">Active Blur</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-4">SMART Privacy Masking</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.monitoring.enableBlur}
                                    onChange={(e) => setSettings({ ...settings, monitoring: { ...settings.monitoring, enableBlur: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                            </label>
                        </div>
                        <div className="p-6 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
                            <Zap size={20} className="text-indigo-600 mb-3" />
                            <p className="text-[11px] font-black text-indigo-900 dark:text-indigo-400 uppercase mb-1">AI Detection</p>
                            <p className="text-[9px] font-bold text-indigo-600/60 dark:text-indigo-500 uppercase mb-4">Anomaly Scanning</p>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white dark:bg-indigo-900/40 text-indigo-600 uppercase">Pro Feature</span>
                        </div>
                    </div>
                </div>
            </ModalWrapper>

            <ModalWrapper
                isOpen={activeModal === 'Privacy Controls'}
                onClose={() => setActiveModal(null)}
                title="Data Retention"
                icon={Lock}
                onSave={handleSave}
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pl-1">
                            <span className="text-slate-400">Purge Cycle</span>
                            <span className="text-primary-600">{settings.monitoring.idleThreshold} Days</span>
                        </div>
                        <input type="range" min="30" max="365" defaultValue="90" className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-primary-600 cursor-pointer" />
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[11px] font-black text-rose-900 dark:text-rose-400 uppercase mb-1">Secure Deletion</h4>
                                <p className="text-[9px] font-bold text-rose-600/60 dark:text-rose-500 uppercase">Purge all archived staff data</p>
                            </div>
                            <button className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 text-rose-600 flex items-center justify-center shadow-sm border border-rose-100 dark:border-rose-900/20 hover:bg-rose-600 hover:text-white transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </ModalWrapper>

            <ModalWrapper
                isOpen={activeModal === 'Map & Geofence'}
                onClose={() => setActiveModal(null)}
                title="Geospatial Rules"
                icon={MapPin}
                onSave={handleSave}
            >
                <div className="space-y-6">
                    <div className="h-48 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <MapPin size={32} className="text-slate-300 mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Interactive Map Protocol Ready</p>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Detection Radius (Meters)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                value={settings.monitoring.geoFenceRange}
                                onChange={(e) => setSettings({ ...settings, monitoring: { ...settings.monitoring, geoFenceRange: e.target.value } })}
                                className="flex-1 h-14 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                            />
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black">m</div>
                        </div>
                    </div>
                </div>
            </ModalWrapper>

            <ModalWrapper
                isOpen={activeModal === 'Appearance'}
                onClose={() => setActiveModal(null)}
                title="UI Customization"
                icon={Palette}
                onSave={handleSave}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {['Royal Dark', 'Modern Light'].map((theme) => (
                            <button key={theme} className={cn(
                                "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4",
                                theme.includes('Dark') ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"
                            )}>
                                <div className={cn("h-4 w-16 rounded-full", theme.includes('Dark') ? "bg-primary-500" : "bg-slate-200")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{theme}</span>
                                {theme.includes('Dark') && <CheckCircle2 size={16} className="text-primary-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            </ModalWrapper>

            <ModalWrapper
                isOpen={activeModal === 'My Profile'}
                onClose={() => setActiveModal(null)}
                title="Admin Identity"
                icon={User}
                onSave={handleSave}
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center p-6 pb-12">
                        <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl border-4 border-white dark:border-slate-900 mb-6 relative">
                            JS
                            <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
                                <Palette size={16} />
                            </button>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white">Jane Smith</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Super Administrator</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Email</label>
                            <div className="flex items-center gap-4 px-6 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                                <Mail size={18} /> jane@shoppeal.tech
                            </div>
                        </div>
                        <button className="w-full py-4 text-xs font-black text-rose-600 uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all">
                            <LogOut size={16} /> Terminate All Sessions
                        </button>
                    </div>
                </div>
            </ModalWrapper>

            {/* Default Fallback for New or Miscellaneous Settings */}
            {!['Company Profile', 'Global Policy', 'Billing & Plans', 'Map & Geofence', 'Role-Based Access', 'Integrations', 'Privacy Controls', 'Appearance', 'My Profile'].includes(activeModal) && activeModal && (
                <ModalWrapper
                    isOpen={!!activeModal}
                    onClose={() => setActiveModal(null)}
                    title={activeModal}
                    icon={SettingsIcon}
                    onSave={handleSave}
                >
                    <div className="py-12 flex flex-col items-center text-center space-y-4">
                        <div className="h-20 w-20 rounded-[2rem] bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 shadow-inner">
                            <Shield size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Restricted</p>
                            <p className="text-xs font-bold text-slate-400 max-w-[280px] mt-2 uppercase tracking-wide leading-relaxed">
                                Detailed protocols for "{activeModal}" require advanced administrative clearance.
                            </p>
                        </div>
                        <div className="pt-4 flex gap-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                        </div>
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
}
