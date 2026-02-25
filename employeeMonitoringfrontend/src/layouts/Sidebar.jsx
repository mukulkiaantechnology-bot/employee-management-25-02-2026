import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    CalendarCheck,
    Activity,
    MapPin,
    CheckSquare,
    BarChart3,
    CreditCard,
    Bell,
    Users,
    Settings,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Monitor,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Time Tracking', icon: Clock, path: '/time-tracking' },
    { name: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { name: 'Activity Monitoring', icon: Activity, path: '/activity' },
    { name: 'Screenshot Monitoring', icon: Monitor, path: '/screenshots' },
    { name: 'Location Tracking', icon: MapPin, path: '/location' },
    { name: 'Tasks & Projects', icon: CheckSquare, path: '/tasks' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Payroll', icon: CreditCard, path: '/payroll' },
    { name: 'Alerts', icon: Bell, path: '/alerts' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Compliance', icon: ShieldCheck, path: '/compliance' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar({ collapsed, setCollapsed, onMobileClose }) {
    return (
        <aside
            className={cn(
                "h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out",
                "w-[80vw] max-w-[300px] lg:max-w-none shadow-sm lg:shadow-none",
                collapsed ? "lg:w-20" : "lg:w-64"
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 mt-6">
                {!collapsed && (
                    <div className="group cursor-pointer animate-in fade-in duration-500">
                        <h2 className="text-2xl font-black leading-none tracking-tighter bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110">
                            EMPLOYEE<br />
                            MANAGEMENT
                        </h2>
                        <div className="h-1 w-0 bg-primary-600 transition-all duration-300 group-hover:w-full mt-1 rounded-full opacity-50"></div>
                    </div>
                )}
                {collapsed && (
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer">
                        <span className="text-xl font-black italic tracking-tighter">E</span>
                    </div>
                )}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1 px-2 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin">
                {navItems.map((item, i) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={onMobileClose}
                        className={({ isActive }) => cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-all duration-300 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                            isActive && "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-bold",
                            collapsed && "justify-center"
                        )}
                        title={collapsed ? item.name : ""}
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} className="transition-transform group-hover:scale-110" />
                                {!collapsed && <span className="font-medium tracking-tight">{item.name}</span>}
                                {isActive && !collapsed && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600 animate-pulse"></div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 hidden lg:flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xl transition-all hover:scale-110 hover:bg-primary-600 hover:text-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 z-50"
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </aside>
    );
}
