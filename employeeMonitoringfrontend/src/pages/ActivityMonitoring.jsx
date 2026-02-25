import React, { useState } from 'react';
import {
    Monitor,
    Globe,
    Zap,
    Lock,
    Shield,
    Layout,
    Clock,
    Smartphone,
    BarChart2,
    CheckCircle2,
    X,
    Filter
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    AreaChart,
    Area,
    Treemap
} from 'recharts';
import { topApps, topWebsites } from '../data/mockData';
import { useRealTime } from '../hooks/RealTimeContext';

const cn = (...inputs) => twMerge(clsx(inputs));

const UsageItem = ({ icon: Icon, name, time, percent, color, category }) => (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 group hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-4 px-4 transition-colors">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between">
                <p className="text-sm font-semibold truncate dark:text-slate-200">{name}</p>
                <p className="text-sm font-bold">{percent}%</p>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-0.5">
                <span>{category}</span>
                <span>{time}</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    </div>
);

export function ActivityMonitoring() {
    const { stats } = useRealTime();
    const [privacyMode, setPrivacyMode] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [showAppsModal, setShowAppsModal] = useState(false);
    const [showWebsitesModal, setShowWebsitesModal] = useState(false);

    // Mock data derived for visualization
    const productivityData = [
        { name: 'Productive', value: 65, color: '#10b981' },
        { name: 'Neutral', value: 20, color: '#f59e0b' },
        { name: 'Distracting', value: 15, color: '#ef4444' },
    ];

    const categoryData = [
        { name: 'Development', value: 45, color: '#3b82f6' },
        { name: 'Communication', value: 25, color: '#8b5cf6' },
        { name: 'Design', value: 20, color: '#ec4899' },
        { name: 'Browsing', value: 10, color: '#64748b' },
    ];

    const togglePrivacy = () => {
        setPrivacyMode(!privacyMode);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="space-y-6 pb-20">
            {showToast && (
                <div className="fixed top-24 right-8 z-50 flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in slide-in-from-right-full">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <span className="font-bold text-sm">Privacy Mode {privacyMode ? 'Enabled' : 'Disabled'}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Activity Monitoring</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Detailed breakdown of digital footprint & efficiency.</p>
                </div>
                <div className="flex items-center justify-end gap-4">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Privacy Mode</span>
                        <button
                            onClick={togglePrivacy}
                            className={cn(
                                "relative h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none",
                                privacyMode ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                            )}
                        >
                            <span className={cn(
                                "absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                                privacyMode ? "translate-x-6" : "translate-x-0"
                            )} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">

                {/* Productivity Breakdown (Donut) */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold mb-2">Productivity Score</h3>
                    <p className="text-sm text-slate-500 mb-6">Efficiency based on app categorization</p>

                    <div className="relative flex-1 flex items-center justify-center min-h-[200px]">
                        <div className="h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={productivityData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={8}
                                        stroke="none"
                                    >
                                        {productivityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">82</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-around gap-2">
                        {productivityData.map(item => (
                            <div key={item.name} className="flex flex-col items-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{item.name}</span>
                                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active vs Inactive (NEW) */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold mb-2">Active vs Inactive</h3>
                    <p className="text-sm text-slate-500 mb-6">Time tracking engagement</p>

                    <div className="relative flex-1 flex items-center justify-center min-h-[200px]">
                        <div className="h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Active', value: 78, color: '#3b82f6' },
                                            { name: 'Inactive', value: 22, color: '#e2e8f0' }
                                        ]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#3b82f6" cornerRadius={8} />
                                        <Cell fill="#f1f5f9" cornerRadius={8} />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-blue-600">78%</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-center">
                            <p className="text-[9px] font-bold text-blue-600 uppercase mb-1">Active Time</p>
                            <p className="text-base font-black text-blue-700 dark:text-blue-300">6h 12m</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Idle Time</p>
                            <p className="text-base font-black text-slate-600 dark:text-slate-300">1h 48m</p>
                        </div>
                    </div>
                </div>

                {/* Category Breakdown (Bar Chart) */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-lg font-bold mb-2">Category Split</h3>
                    <p className="text-sm text-slate-500 mb-6">Time distribution by category</p>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={categoryData} margin={{ left: 0, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b', textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Pulse (Area Chart) */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Activity Pulse</h3>
                            <p className="text-sm text-slate-500">Real-time intensity</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <Zap size={20} />
                        </div>
                    </div>
                    <div className="h-[200px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { time: '9am', intensity: 30 },
                                { time: '10am', intensity: 50 },
                                { time: '11am', intensity: 85 },
                                { time: '12pm', intensity: 60 },
                                { time: '1pm', intensity: 40 },
                                { time: '2pm', intensity: 70 },
                                { time: '3pm', intensity: 80 },
                                { time: '4pm', intensity: 55 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8" />
                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="intensity" stroke="#10b981" fillOpacity={1} fill="url(#colorIntensity)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Applications */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm animate-slide-up">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Monitor size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Top Applications</h3>
                                <p className="text-sm text-slate-500">Software usage breakdown</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAppsModal(true)}
                            className="text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-2">
                        {topApps.slice(0, 4).map((app, i) => (
                            <UsageItem
                                key={i}
                                icon={app.icon === 'Monitor' ? Monitor : app.icon === 'Layout' ? Layout : app.icon === 'Zap' ? Zap : app.icon === 'Shield' ? Shield : Smartphone}
                                name={app.name}
                                time={app.time}
                                percent={app.percent}
                                color={app.color}
                                category={app.category}
                            />
                        ))}
                    </div>
                </div>

                {/* Top Websites */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Top Websites</h3>
                                <p className="text-sm text-slate-500">Browsing history analysis</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowWebsitesModal(true)}
                            className="text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-2">
                        {topWebsites.slice(0, 4).map((web, i) => (
                            <UsageItem
                                key={i}
                                icon={Globe}
                                name={web.name}
                                time={web.time}
                                percent={web.percent}
                                color={web.color}
                                category={web.category}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals - Kept same logic */}
            {(showAppsModal || showWebsitesModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    {/* ... (Same modal content) ... */}
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">{showAppsModal ? 'Top Applications' : 'Top Websites'}</h3>
                            <button
                                onClick={() => { setShowAppsModal(false); setShowWebsitesModal(false); }}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            {/* Content */}
                            <div className="space-y-2">
                                {showAppsModal ? (
                                    topApps.map((app, i) => (
                                        <UsageItem
                                            key={i}
                                            icon={app.icon === 'Monitor' ? Monitor : app.icon === 'Layout' ? Layout : app.icon === 'Zap' ? Zap : app.icon === 'Shield' ? Shield : Smartphone}
                                            name={app.name}
                                            time={app.time}
                                            percent={app.percent}
                                            color={app.color}
                                            category={app.category}
                                        />
                                    ))
                                ) : (
                                    topWebsites.map((web, i) => (
                                        <UsageItem
                                            key={i}
                                            icon={Globe}
                                            name={web.name}
                                            time={web.time}
                                            percent={web.percent}
                                            color={web.color}
                                            category={web.category}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
