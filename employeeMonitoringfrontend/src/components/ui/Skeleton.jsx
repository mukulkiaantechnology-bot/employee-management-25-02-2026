import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ isLoading, children, className, width, height }) {
    if (!isLoading) return children;

    return (
        <div
            className={twMerge(clsx(
                "animate-shimmer relative overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800",
                "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/10",
                className
            ))}
            style={{ width, height }}
        >
            <div className="invisible opacity-0">{children}</div>
        </div>
    );
}
