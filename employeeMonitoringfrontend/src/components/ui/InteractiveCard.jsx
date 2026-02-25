import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function InteractiveCard({ children, className, onClick }) {
    return (
        <div
            onClick={onClick}
            className={twMerge(clsx(
                "group relative overflow-hidden rounded-[1.25rem] border border-slate-200/60 bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300",
                "dark:border-slate-800/60 dark:bg-slate-900",
                onClick && "hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary-200 cursor-pointer active:scale-[0.98] dark:hover:border-primary-900/40",
                className
            ))}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:to-primary-900/5"></div>
            <div className="relative z-10 h-full">{children}</div>
        </div>
    );
}
