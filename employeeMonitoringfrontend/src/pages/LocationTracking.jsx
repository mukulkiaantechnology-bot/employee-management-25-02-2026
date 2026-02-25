import React, { useState, useEffect, useMemo } from 'react';
import {
    Navigation, Shield, Users, AlertTriangle,
    MoreHorizontal, Search, Filter, Plus, Minus, Maximize2,
    Layers, Map as MapIcon, Compass, Play, Pause,
    RotateCcw, History, TrendingUp, Clock, MapPin,
    ArrowRight, CheckCircle2, X, Car, Activity, Zap
} from 'lucide-react';
import { cn } from '../utils/cn';

// Demo Example: Expanded Mock Routes for History
const MOCK_ROUTES = {
    '101': [
        { x: 20, y: 30 }, { x: 25, y: 35 }, { x: 35, y: 32 }, { x: 45, y: 40 },
        { x: 50, y: 55 }, { x: 60, y: 50 }, { x: 70, y: 60 }, { x: 80, y: 55 }, { x: 85, y: 40 }
    ],
    '102': [
        { x: 10, y: 80 }, { x: 20, y: 75 }, { x: 30, y: 85 }, { x: 45, y: 70 },
        { x: 60, y: 75 }, { x: 70, y: 65 }, { x: 85, y: 70 }, { x: 90, y: 80 }
    ],
    'default': [
        { x: 30, y: 20 }, { x: 40, y: 30 }, { x: 50, y: 25 }, { x: 60, y: 40 },
        { x: 70, y: 35 }, { x: 80, y: 50 }
    ]
};

export const LocationTracking = () => {
    const [activeTab, setActiveTab] = useState('live');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(12);
    const [showAddZone, setShowAddZone] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [geofences, setGeofences] = useState([
        { id: 1, name: 'Main HQ Perimeter', radius: '500m', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', enabled: true },
        { id: 2, name: 'North Logistics Hub', radius: '800m', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', enabled: true },
        { id: 3, name: 'Client Site Alpha', radius: '300m', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', enabled: false },
        { id: 4, name: 'Storage Yard B', radius: '1.2km', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', enabled: true },
        { id: 5, name: 'Downtown Branch', radius: '400m', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', enabled: true },
        { id: 6, name: 'Employee Housing', radius: '600m', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', enabled: true }
    ]);

    const [employees] = useState([
        { id: 101, employeeId: 'EMP-001', name: 'James Wilson', status: 'moving', address: '4th Ave, Manhattan Office', lastSeen: '2m ago' },
        { id: 102, employeeId: 'EMP-002', name: 'Sarah Chen', status: 'idle', address: 'Brooklyn Warehouse', lastSeen: '5m ago' },
        { id: 103, employeeId: 'EMP-003', name: 'Robert Fox', status: 'moving', address: 'Queens Distribution', lastSeen: 'Just now' },
        { id: 104, employeeId: 'EMP-004', name: 'Amelia Grant', status: 'moving', address: 'Jersey City Hub', lastSeen: '1m ago' },
    ]);

    const [checkIns] = useState([
        { id: 1, name: 'James Wilson', time: '10:42 AM', location: 'Main HQ Perimeter', type: 'in' },
        { id: 2, name: 'Sarah Chen', time: '10:38 AM', location: 'North Logistics Hub', type: 'in' },
        { id: 3, name: 'Robert Fox', time: '10:15 AM', location: 'Downtown Branch', type: 'out' },
        { id: 4, name: 'Amelia Grant', time: '09:50 AM', location: 'Main HQ Perimeter', type: 'in' },
        { id: 5, name: 'James Wilson', time: '09:30 AM', location: 'Downtown Branch', type: 'out' },
    ]);

    const [newZoneData, setNewZoneData] = useState({ name: '', radius: '500m' });

    // Handle History Animation
    useEffect(() => {
        let interval = null;
        if (isPlaying && activeTab === 'history') {
            interval = setInterval(() => {
                setPlaybackTime(prev => (prev < 100 ? prev + 0.4 : 0));
            }, 50);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isPlaying, activeTab]);

    // Live movement simulation offsets
    const [liveOffsets, setLiveOffsets] = useState({});
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveOffsets(prev => {
                const next = { ...prev };
                employees.forEach(emp => {
                    if (emp.status === 'moving') {
                        next[emp.id] = {
                            x: (next[emp.id]?.x || 0) + (Math.random() - 0.5) * 0.5,
                            y: (next[emp.id]?.y || 0) + (Math.random() - 0.5) * 0.5
                        };
                    }
                });
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [employees]);

    const currentRoute = useMemo(() => {
        const routeId = selectedEmployee ? String(selectedEmployee) : 'default';
        return MOCK_ROUTES[routeId] || MOCK_ROUTES['default'];
    }, [selectedEmployee]);

    const currentRoutePos = useMemo(() => {
        if (!currentRoute || currentRoute.length < 2) return { x: 0, y: 0 };
        const totalPoints = currentRoute.length - 1;
        const index = Math.min(Math.floor((playbackTime / 100) * totalPoints), totalPoints - 1);
        const segmentProgress = ((playbackTime / 100) * totalPoints) - index;

        const p1 = currentRoute[index];
        const p2 = currentRoute[index + 1];

        return {
            x: p1.x + (p2.x - p1.x) * segmentProgress,
            y: p1.y + (p2.y - p1.y) * segmentProgress
        };
    }, [playbackTime, currentRoute]);

    const filteredLocations = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleGeofence = (id) => {
        setGeofences(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    };

    const handleAddZone = () => {
        if (!newZoneData.name) return;
        const newZone = {
            id: geofences.length + 1,
            name: newZoneData.name,
            radius: newZoneData.radius,
            color: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
            enabled: true
        };
        setGeofences([newZone, ...geofences]);
        setNewZoneData({ name: '', radius: '500m' });
        setShowAddZone(false);
    };

    return (
        <>
            <div className="min-h-screen lg:h-[calc(100vh-80px)] flex flex-col space-y-4 lg:space-y-3 animate-fade-in overflow-x-hidden lg:overflow-hidden pb-20 lg:pb-0 pr-0 lg:pr-4">
                {/* Standard Header - Clean & Premium */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between shrink-0 gap-4 lg:gap-0 px-4 lg:px-0 pt-4 lg:pt-0">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 w-full lg:w-auto">
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="h-10 w-10 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl shrink-0">
                                <Navigation size={20} />
                            </div>
                            <div className="flex-1 lg:flex-none">
                                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Location Tracking</h1>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Active Stream</span>
                                </div>
                            </div>
                            {/* Mobile System Load Indicator */}
                            <div className="lg:hidden px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Load</p>
                                <p className="text-[10px] font-black text-emerald-500 mt-0.5">Normal</p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="w-full lg:w-auto flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-x-auto custom-scrollbar">
                            {['live', 'history', 'geofencing'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        if (tab !== 'history') setIsPlaying(false);
                                    }}
                                    className={cn(
                                        "flex-1 lg:flex-none px-4 lg:px-5 py-2 text-[10px] font-black rounded-xl transition-all capitalize tracking-widest uppercase whitespace-nowrap",
                                        activeTab === tab
                                            ? "bg-white dark:bg-white text-slate-900 dark:text-slate-900 shadow-xl scale-100 lg:scale-105"
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-3">
                        <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">System Load</p>
                            <p className="text-xs font-black text-emerald-500 mt-1">Normal</p>
                        </div>
                    </div>
                </div>

                {/* Main View Area */}
                <div className="flex-1 min-h-0">
                    {activeTab !== 'geofencing' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 h-auto lg:h-full">
                            <div className="lg:col-span-3 flex flex-col overflow-visible lg:overflow-hidden h-auto lg:h-full relative order-1">
                                {/* Map UI Container */}
                                <div className="relative w-full h-[55vh] lg:h-auto lg:flex-1 rounded-2xl lg:rounded-[3.5rem] border-0 lg:border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-xl lg:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)] group overflow-hidden">
                                    {/* Map Foundation */}
                                    <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
                                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-74.006,40.7128,12,0/1200x800?access_token=pk.eyJ1IjoibW9ja2VydSIsImEiOiJjbHN2eXJ2NHkwMG5yMnJxd2syZ3p3M2ozIn0.mock_token')] bg-cover bg-center grayscale opacity-30 dark:invert dark:opacity-10 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-80 dark:group-hover:invert-0" />

                                    {/* Map HUD UI */}
                                    <div className="absolute top-8 left-8 z-30 flex flex-col gap-3">
                                        <div className="flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-1.5 rounded-2xl border border-white dark:border-slate-700 shadow-2xl">
                                            <button onClick={() => setZoomLevel(z => Math.min(z + 1, 18))} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400"><Plus size={18} strokeWidth={2.5} /></button>
                                            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />
                                            <button onClick={() => setZoomLevel(z => Math.max(z - 1, 8))} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400"><Minus size={18} strokeWidth={2.5} /></button>
                                        </div>
                                    </div>

                                    {/* History tracking view */}
                                    {activeTab === 'history' && (
                                        <>
                                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <polyline
                                                    points={currentRoute.map(p => `${p.x} ${p.y}`).join(' ')}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    className="text-primary-500/30"
                                                    strokeWidth="0.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <polyline
                                                    points={currentRoute.map(p => `${p.x} ${p.y}`).join(' ')}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    className="text-primary-500/60"
                                                    strokeWidth="0.3"
                                                    strokeDasharray="1 1"
                                                    strokeLinecap="round"
                                                />
                                            </svg>

                                            <div
                                                className="absolute z-20 transition-all duration-300 ease-out"
                                                style={{ top: `${currentRoutePos.y}%`, left: `${currentRoutePos.x}%`, transform: 'translate(-50%, -100%)' }}
                                            >
                                                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white dark:border-white/5 w-48 flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-primary-500 p-0.5">
                                                        <img src={`https://i.pravatar.cc/150?u=${selectedEmployee || 101}`} className="h-full w-full object-cover rounded-lg" alt="" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black truncate text-slate-900 dark:text-white leading-tight">History Replay</p>
                                                        <p className="text-[8px] font-black uppercase text-primary-500 tracking-widest mt-0.5">
                                                            {playbackTime < 100 ? `Progress: ${playbackTime.toFixed(0)}%` : 'Finished'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="relative h-12 w-12 rounded-2xl bg-primary-600 border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center">
                                                    <Car size={20} className="text-white" />
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary-600" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-8 left-8 right-8 z-40 flex justify-center">
                                                <div className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white dark:border-white/10 p-4 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35)] flex items-center gap-6">
                                                    <button
                                                        onClick={() => setIsPlaying(!isPlaying)}
                                                        className="h-14 w-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                    >
                                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                                    </button>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center justify-between px-1">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Scrub</span>
                                                            <span className="text-[10px] font-black text-primary-500 tracking-tighter tabular-nums">12:00 PM — 04:30 PM</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0" max="100" step="0.1"
                                                            value={playbackTime}
                                                            onChange={(e) => setPlaybackTime(parseFloat(e.target.value))}
                                                            className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary-500 border border-slate-200 dark:border-white/5"
                                                        />
                                                    </div>
                                                    <button onClick={() => setPlaybackTime(0)} className="h-10 px-4 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-primary-500 transition-all">Reset</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Live Tracking Layer */}
                                    {activeTab === 'live' && filteredLocations.map((loc, idx) => {
                                        const isFocused = selectedEmployee === loc.id;
                                        const offset = liveOffsets[loc.id] || { x: 0, y: 0 };
                                        return (
                                            <div
                                                key={loc.id}
                                                className={cn("absolute transition-all duration-1000 ease-linear cursor-pointer z-10", isFocused && "z-20")}
                                                style={{ top: `${35 + idx * 8 + offset.y}%`, left: `${25 + idx * 12 + offset.x}%`, transform: isFocused ? "scale(1.1) translateY(-10px)" : "scale(1)" }}
                                                onClick={() => setSelectedEmployee(isFocused ? null : loc.id)}
                                            >
                                                <div className={cn("absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white dark:border-white/5 transition-all w-52 flex items-center gap-4", isFocused ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto")}>
                                                    <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-primary-500 p-0.5 shadow-lg flex-shrink-0">
                                                        <img src={`https://i.pravatar.cc/150?u=${loc.employeeId}`} className="h-full w-full object-cover rounded-[14px]" alt="" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black truncate text-slate-900 dark:text-white leading-tight">{loc.name}</p>
                                                        <p className="text-[9px] font-black uppercase text-primary-500 tracking-widest mt-0.5">{loc.status}</p>
                                                    </div>
                                                </div>
                                                <div className={cn("relative h-10 w-10 rounded-2xl border-4 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center transition-all", loc.status === 'moving' ? "bg-emerald-500" : "bg-amber-500")}>
                                                    <MapPin size={18} className="text-white fill-white/20" />
                                                    {loc.status === 'moving' && <div className="absolute -inset-2 bg-emerald-400 rounded-full animate-ping opacity-20 pointer-events-none" />}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Stats Overlay for Live */}
                                    {activeTab === 'live' && (
                                        <div className="absolute bottom-8 left-8 right-8 z-30 flex justify-center pointer-events-none">
                                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white dark:border-white/10 p-2 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] flex items-center gap-1 pointer-events-auto">
                                                <div className="flex items-center gap-1.5 px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                                    <TrendingUp size={14} className="text-blue-500" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Today</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">12.4 km</span>
                                                </div>
                                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                                                <div className="flex items-center gap-1.5 px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                                    <Activity size={14} className="text-purple-500" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Nodes</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">24 Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Area */}
                            <div className="flex flex-col gap-4 lg:gap-6 w-full lg:h-full pb-4 px-1 overflow-visible lg:overflow-y-auto custom-scrollbar order-2">
                                <div className="rounded-2xl lg:rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-4 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-300 w-full lg:flex-[1.4] flex flex-col overflow-hidden group/card relative min-h-[400px] lg:min-h-0">
                                    <div className="flex flex-col gap-4 mb-5 shrink-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Active Fleet</h3>
                                            <button className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary-500 transition-all"><Filter size={14} /></button>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search personnel..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none border-2 border-transparent focus:border-primary-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 overflow-y-auto pr-3 flex-1 custom-scrollbar">
                                        {filteredLocations.map(loc => (
                                            <div
                                                key={loc.id}
                                                onClick={() => {
                                                    setSelectedEmployee(selectedEmployee === loc.id ? null : loc.id);
                                                    if (activeTab === 'history') setPlaybackTime(0);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer group",
                                                    selectedEmployee === loc.id
                                                        ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 shadow-sm"
                                                        : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                )}
                                            >
                                                <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 group-hover:border-primary-500/30 transition-all">
                                                    <img src={`https://i.pravatar.cc/150?u=${loc.employeeId}`} className="h-full w-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-black truncate text-slate-900 dark:text-white leading-tight">{loc.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight">{loc.address}</p>
                                                </div>
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    loc.status === 'moving' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                                )} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                </div>

                                <div className="rounded-2xl lg:rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-4 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex-1 w-full lg:flex-1 flex flex-col overflow-hidden group/card relative min-h-[300px] lg:min-h-0">
                                    <div className="flex items-center justify-between mb-5 shrink-0">
                                        <h3 className="text-md font-bold tracking-tight text-slate-900 dark:text-white">Geo-Logs</h3>
                                        <button onClick={() => setShowLogsModal(true)} className="text-[9px] font-black uppercase text-primary-500 hover:tracking-widest transition-all">View All</button>
                                    </div>
                                    <div className="space-y-4 overflow-y-auto pr-3 flex-1 custom-scrollbar pb-2">
                                        {checkIns.map(log => (
                                            <div key={log.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 py-1">
                                                <div className={cn(
                                                    "absolute left-[-5.5px] top-3 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900",
                                                    log.type === 'in' ? "bg-emerald-500" : "bg-rose-500"
                                                )} />
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={cn(
                                                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border",
                                                        log.type === 'in' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                    )}>{log.type === 'in' ? 'Check-In' : 'Check-Out'}</span>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tabular-nums">{log.time}</p>
                                                </div>
                                                <p className="text-[12px] font-black text-slate-900 dark:text-white truncate">{log.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden animate-fade-in pt-1">
                            {/* Geofencing View */}
                            <div className="flex items-center justify-between shrink-0 mb-4">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Perimeter Control</h2>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1">Enterprise geofence monitoring system.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddZone(true)}
                                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
                                >
                                    <Plus size={16} strokeWidth={3} /> Define Zone
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-visible lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar pb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                                    {geofences.map(fence => (
                                        <div
                                            key={fence.id}
                                            className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden group hover:border-primary-500/40 transition-all hover:shadow-xl flex flex-col min-h-[180px]"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={cn("h-12 w-12 rounded-2xl border-2 flex items-center justify-center transition-all group-hover:scale-110", fence.color)}>
                                                    <Shield size={24} />
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={fence.enabled} onChange={() => toggleGeofence(fence.id)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">{fence.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Radius: {fence.radius}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
                                                <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <CheckCircle2 size={10} className="text-emerald-500" /> Secure
                                                </span>
                                                <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Activity size={10} className="text-primary-500" /> Pulse
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals Container */}
            {showAddZone && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-10 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)] border border-white/50 dark:border-white/5 animate-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-6 lg:mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">New Secure Zone</h3>
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mt-2">Geofence Definition</p>
                            </div>
                            <button onClick={() => setShowAddZone(false)} className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
                        </div>
                        <div className="space-y-8 text-slate-900">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Zone Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Northeast Logistics Hub"
                                    value={newZoneData.name}
                                    onChange={(e) => setNewZoneData({ ...newZoneData, name: e.target.value })}
                                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 font-bold focus:border-primary-500 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Radius Selection</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['200m', '500m', '1km'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setNewZoneData({ ...newZoneData, radius: r })}
                                            className={cn(
                                                "py-4 rounded-2xl border-2 text-[11px] font-black transition-all",
                                                newZoneData.radius === r ? "border-primary-500 bg-primary-50 text-primary-500" : "border-slate-50 dark:border-white/5 text-slate-400"
                                            )}
                                        >{r}</button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleAddZone} className="w-full rounded-[2rem] bg-slate-900 dark:bg-primary-500 py-6 font-black text-white text-[11px] uppercase tracking-[0.3em] hover:shadow-2xl transition-all">Create Boundary</button>
                        </div>
                    </div>
                </div>
            )}

            {showLogsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-10 shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between mb-6 lg:mb-10 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Full Geo-Logs</h3>
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mt-2">Complete History</p>
                            </div>
                            <button onClick={() => setShowLogsModal(false)} className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {checkIns.map((log, idx) => (
                                <div key={idx} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", log.type === 'in' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{log.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500">{log.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase text-slate-400">{log.time}</p>
                                        <p className={cn("text-[9px] font-black uppercase", log.type === 'in' ? "text-emerald-500" : "text-rose-500")}>{log.type === 'in' ? 'Check-In' : 'Check-Out'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

