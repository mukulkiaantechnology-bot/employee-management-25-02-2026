import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    Trash2,
    CheckCheck,
    Filter,
    Search,
    ChevronRight,
    X,
    MoreVertical,
    ArrowLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRealTime } from '../hooks/RealTimeContext';

export function Notifications() {
    const { notifications, markAllNotificationsRead, markNotificationAsRead, deleteNotification } = useRealTime();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = filter === 'all' ||
            (filter === 'unread' && n.unread) ||
            n.type === filter;
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleMarkAsRead = (id) => {
        markNotificationAsRead(id);
    };

    const handleDelete = (id) => {
        deleteNotification(id);
    };

    const handleMarkAllRead = () => {
        markAllNotificationsRead();
    };

    const handleDeleteAll = () => {
        if (window.confirm('Are you sure you want to delete all notifications?')) {
            // We don't have a deleteAllNotifications action in context yet, 
            // so we'll just delete them one by one or leave it for now.
            // Or better, just clear the local view? No, that's bad.
            // I'll just iterate and delete for now, or add deleteAll later.
            // For simplicity in this step, I will just iterate.
            notifications.forEach(n => deleteNotification(n.id));
        }
    };

    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-bold text-sm"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:border-primary-500 transition-all">
                    <ArrowLeft size={18} />
                </div>
                Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and track all system alerts and updates.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <CheckCheck size={18} />
                        Mark all as read
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm"
                    >
                        <Trash2 size={18} />
                        Clear All
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                {/* Filters Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Filters</h3>
                        <nav className="space-y-1">
                            {[
                                { id: 'all', label: 'All', icon: Bell },
                                { id: 'unread', label: 'Unread', icon: Bell, count: notifications.filter(n => n.unread).length },
                                { id: 'alert', label: 'Alerts', icon: AlertCircle },
                                { id: 'success', label: 'Success', icon: CheckCircle2 },
                                { id: 'info', label: 'System', icon: Info },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id)}
                                    className={clsx(
                                        "w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-all font-bold text-sm",
                                        filter === item.id
                                            ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} />
                                        {item.label}
                                    </div>
                                    {item.count > 0 && (
                                        <span className={clsx(
                                            "rounded-full px-2 py-0.5 text-[10px]",
                                            filter === item.id ? "bg-white/20" : "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400"
                                        )}>
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                </aside>

                {/* Notifications List */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search in notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 pl-12 pr-4 py-4 text-sm font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:border-slate-800 shadow-sm"
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={clsx(
                                        "group relative flex flex-col md:flex-row gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md",
                                        n.unread ? "border-primary-500 shadow-primary-500/5" : "border-slate-200 dark:border-slate-800"
                                    )}
                                >
                                    <div className={clsx(
                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm mt-1",
                                        n.type === 'alert' && "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                                        n.type === 'success' && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                                        n.type === 'info' && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    )}>
                                        {n.type === 'alert' && <AlertCircle size={24} />}
                                        {n.type === 'success' && <CheckCircle2 size={24} />}
                                        {n.type === 'info' && <Info size={24} />}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={clsx(
                                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                n.type === 'alert' && "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20",
                                                n.type === 'success' && "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/20",
                                                n.type === 'info' && "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20"
                                            )}>
                                                {n.category}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">{n.date} • {n.time}</span>
                                            {n.unread && (
                                                <span className="flex h-2 w-2 rounded-full bg-primary-500 ring-4 ring-primary-500/10 animate-pulse"></span>
                                            )}
                                        </div>
                                        <h3 className={clsx("text-lg font-black tracking-tight dark:text-white leading-tight", n.unread ? "text-slate-900" : "text-slate-700")}>
                                            {n.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            {n.description}
                                        </p>
                                    </div>

                                    <div className="flex md:flex-col items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                                            title="Mark as read"
                                        >
                                            <CheckCheck size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(n.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-800">
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
                                    <Bell size={48} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">No notifications found</h3>
                                <p className="text-slate-500 font-medium">Try adjusting your filters or search query.</p>
                                <button
                                    onClick={() => { setFilter('all'); setSearchQuery(''); }}
                                    className="mt-6 font-bold text-primary-600 hover:text-primary-700"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
