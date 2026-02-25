import React, { useState } from 'react';
import { Maximize2, Minimize2, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { InteractiveCard } from '../ui/InteractiveCard';

export function AnalyticsWidget({ title, subtitle, children, className, expanded = false }) {
    const [isExpanded, setIsExpanded] = useState(expanded);

    return (
        <div className={clsx("transition-all duration-300 ease-in-out", isExpanded ? "fixed inset-4 z-50 overflow-auto" : "", className)}>
            {isExpanded && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm -z-10" onClick={() => setIsExpanded(false)}></div>}

            <InteractiveCard className={clsx("h-full flex flex-col", isExpanded ? "shadow-2xl" : "")}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                        {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                            <MoreHorizontal size={18} />
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                        >
                            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    </div>
                </div>
                <div className="flex-1 min-h-0 relative">
                    {children}
                </div>
            </InteractiveCard>
        </div>
    );
}
