import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && mobileOpen) {
                setMobileOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileOpen]);

    return (
        <div className="h-screen overflow-hidden overflow-x-hidden bg-slate-50 dark:bg-slate-950">
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar Container */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    onMobileClose={() => setMobileOpen(false)}
                />
            </div>

            <div
                className={`flex flex-col h-screen transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"
                    }`}
            >
                <Header onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-thin">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
