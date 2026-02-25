import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, LogOut, CheckCircle2, AlertCircle, Info, Menu, UserCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../hooks/useTheme';
import { auth } from '../hooks/auth';
import { useRealTime } from '../hooks/RealTimeContext';

export function Header({ onMenuClick }) {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const user = auth.getUser();

    // Explicitly destructure from useRealTime to ensure it's defined
    const realTimeProps = useRealTime();
    const {
        notifications = [],
        markNotificationAsRead = () => { },
        markAllNotificationsRead = () => { }
    } = realTimeProps || {};

    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const unreadCount = (notifications || []).filter(n => n.unread).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        auth.logout();
        navigate('/login', { replace: true });
    };

    const handleMarkAllRead = async () => {
        if (markAllNotificationsRead) await markAllNotificationsRead();
    };

    const handleNotificationClick = async (id) => {
        if (markNotificationAsRead) await markNotificationAsRead(id);
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <button
                    onClick={toggleTheme}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={clsx(
                            "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all active:scale-95",
                            showNotifications ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        )}
                    >
                        <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
                        {unreadCount > 0 && (
                            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 ring-2 ring-white dark:ring-slate-950"></span>
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="fixed left-4 right-4 top-[4.5rem] w-auto md:absolute md:right-0 md:top-full md:left-auto md:w-80 md:mt-2 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-1 z-50">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                                <h3 className="text-sm font-bold dark:text-white">Notifications</h3>
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                                >
                                    Mark all as read
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto py-1 scrollbar-thin">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n.id)}
                                            className={clsx(
                                                "group relative flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                                                n.unread && "bg-primary-50/30 dark:bg-primary-900/10"
                                            )}
                                        >
                                            <div className={clsx(
                                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full mt-0.5",
                                                n.type === 'alert' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                                                n.type === 'success' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                                                n.type === 'info' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                            )}>
                                                {n.type === 'alert' && <AlertCircle size={18} />}
                                                {n.type === 'success' && <CheckCircle2 size={18} />}
                                                {n.type === 'info' && <Info size={18} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <p className={clsx("text-sm transition-colors", n.unread ? "font-bold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200")}>
                                                        {n.title}
                                                    </p>
                                                    {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5"></span>}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.description || n.message}</p>
                                                <p className="mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{n.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-400 text-xs">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800">
                                <button
                                    onClick={() => {
                                        navigate('/notifications');
                                        setShowNotifications(false);
                                    }}
                                    className="w-full rounded-lg py-2 text-center text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    View All Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                            <UserCircle size={24} />
                        </div>
                        <div className="hidden text-left md:block">
                            <p className="text-sm font-semibold dark:text-white">{user?.name || 'User'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{user?.role || 'Member'}</p>
                        </div>
                    </button>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all active:scale-95"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
