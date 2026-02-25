import React from 'react';
import { clsx } from 'clsx';

export function StatusBadge({ status }) {
    const styles = {
        online: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
        idle: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800",
        offline: "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400 border-slate-100 dark:border-slate-800",
    };

    const dots = {
        online: "bg-emerald-500",
        idle: "bg-amber-500",
        offline: "bg-slate-400",
    };

    return (
        <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all shadow-sm", styles[status])}>
            <span className="relative flex h-2 w-2">
                {status === 'online' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={clsx("relative inline-flex rounded-full h-2 w-2", dots[status])}></span>
            </span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
