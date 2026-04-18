import React from 'react';
import { motion } from 'framer-motion';
import { 
    Droplets, Activity, Thermometer, Zap, Dna, Timer, 
    Rocket, Factory, Building2, FlaskConical, Beaker, 
    Mountain, Plane, AlertTriangle, ShieldCheck, Gauge, ArrowRight
} from 'lucide-react';

// Reusable HUD Decoration Components
const HUDCorner = ({ className }) => (
    <div className={`absolute w-3 h-3 border-teal-500/40 ${className}`} />
);

const HUDFrame = ({ children, title, accentColor = "teal" }) => (
    <div className="relative w-full h-full min-h-[180px] flex flex-col items-center justify-center bg-slate-900/40 rounded-xl overflow-hidden border border-white/5">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#3b82f6_0%,transparent_70%)]" />
        
        {/* Corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-500/30 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-500/30 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-500/30 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-500/30 rounded-br-lg" />

        {children}

        {/* Title Bar */}
        {title && (
            <div className="absolute bottom-2 left-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{title}</span>
            </div>
        )}
    </div>
);

const SCENE_VISUALS = {
    water_contamination: [
        () => (
            <HUDFrame title="Desalination Unit - Al Ruwais">
                <div className="flex items-end gap-12 relative z-10 scale-110">
                    <div className="relative">
                        <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity }} className="w-24 h-32 bg-slate-800 rounded-t-2xl border-2 border-blue-500/40 flex flex-col items-center p-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                            <div className="absolute -top-5 left-0 right-0 flex justify-center">
                                <span className="text-[8px] font-mono text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-700/20">Water Intake</span>
                            </div>
                            <div className="w-full h-1 bg-blue-500/20 rounded-full mb-4 overflow-hidden">
                                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity }} className="w-1/2 h-full bg-blue-400/60" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full flex-1">
                                {[1,2,3,4].map(i => <div key={i} className="bg-slate-700/50 rounded-sm border border-blue-500/10" />)}
                            </div>
                        </motion.div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-2 bg-blue-900/60 rounded-full blur-sm" />
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <Droplets className="w-10 h-10 text-blue-400 animate-bounce" />
                        <div className="relative h-1 w-20 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity }} className="h-full bg-blue-500" />
                            <span className="absolute -top-5 left-0 right-0 text-[8px] font-mono text-blue-300 text-center">Flow Rate</span>
                        </div>
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Groundwater Plume Analysis">
                <div className="relative w-64 h-40 bg-slate-950/40 rounded-lg overflow-hidden border border-white/5">
                    <div className="absolute top-4 left-4 text-2xl">🏭</div>
                    <div className="absolute top-1 left-4 text-[8px] font-mono text-orange-300 bg-orange-900/50 px-2 py-0.5 rounded-full border border-orange-700/20">Factory</div>
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.3 }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-6 left-6 w-12 h-12 bg-orange-500 rounded-full blur-xl"
                    />
                    <motion.div 
                        animate={{ x: [0, 100], opacity: [0, 0.5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute top-8 left-12 w-20 h-8 bg-gradient-to-r from-orange-500/40 to-transparent rounded-full"
                    />
                    <div className="absolute bottom-4 right-4 text-2xl">🏙️</div>
                    <div className="absolute bottom-1 right-4 text-[8px] font-mono text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-700/20">Residential</div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Lab Result - Nitrate Sample">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                            <span className="text-[8px] font-mono text-teal-300 bg-teal-900/50 px-2 py-0.5 rounded-full border border-teal-700/20">Sample Tube</span>
                        </div>
                        <FlaskConical className="w-16 h-16 text-teal-400" />
                        <motion.div 
                            animate={{ height: ['20%', '60%', '20%'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 bg-teal-500/30 rounded-b-sm"
                        />
                    </div>
                    <div className="flex gap-2 mt-2">
                        {[1,2,3].map(i => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.5 }}
                                className="relative px-3 py-1 bg-red-500/20 border border-red-500/40 rounded text-[10px] text-red-300 font-mono"
                            >
                                {i === 2 && (
                                    <span className="absolute -bottom-4 left-0 right-0 text-center text-[8px] font-mono text-white/50">
                                        safe limit: 50mg/L
                                    </span>
                                )}
                                NO₃⁻: {45 + i * 2} mg/L
                            </motion.div>
                        ))}
                    </div>
                </div>
            </HUDFrame>
        )
    ],

    acid_rain: [
        () => (
            <HUDFrame title="Al Ain Date Palm Monitoring">
                <div className="flex items-end gap-3 scale-110">
                    {[40, 60, 55, 75, 45, 65].map((h, i) => (
                        <motion.div key={i} 
                            animate={{ scaleY: [1, 1.05, 1] }} 
                            transition={{ duration: 2 + i * 0.2, repeat: Infinity }}
                            className="w-4 bg-gradient-to-t from-green-900 to-green-600 rounded-t-full origin-bottom"
                            style={{ height: h }}
                        />
                    ))}
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Corrosion Simulation">
                <div className="relative">
                    <div className="text-7xl opacity-50">🗿</div>
                    <motion.div 
                        animate={{ y: [0, 40], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-yellow-500/40 to-transparent rounded-full"
                    />
                    <div className="absolute -bottom-2 text-[10px] font-mono text-amber-500 font-bold">CALCIUM CARBONATE EROSION</div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="pH Sensor - Critical Alert">
                <div className="w-64 flex flex-col items-center gap-4">
                    <div className="w-full h-8 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-blue-500 relative">
                        <motion.div 
                            animate={{ left: ['20%', '25%', '20%'] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute -top-4 w-4 h-12 bg-white rounded-full shadow-lg border-2 border-red-600 z-10"
                        />
                    </div>
                    <div className="text-4xl font-mono font-bold text-red-500 animate-pulse">4.2 pH</div>
                </div>
            </HUDFrame>
        )
    ],

    invasive_species: [
        () => (
            <HUDFrame title="Mangrove Density Scan">
                <div className="grid grid-cols-4 gap-2 relative z-10">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1, 0.9] }}
                            transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                            className={`w-8 h-8 rounded-full ${i % 3 === 0 ? 'bg-green-500/40' : 'bg-green-900/20'} border border-green-500/20`}
                        />
                    ))}
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Species Propagation Flow">
                <div className="flex items-center gap-8 py-6">
                    <div className="text-4xl">🚢</div>
                    <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                animate={{ x: [0, 20], opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
                                className="w-2 h-2 bg-emerald-400 rounded-full"
                            />
                        ))}
                    </div>
                    <div className="text-5xl text-emerald-500">🌿</div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Ecosystem Impact">
                <div className="w-full max-w-xs space-y-3">
                    {[
                        { label: 'Native Species', val: 35, color: 'bg-green-500' },
                        { label: 'Invasive Algae', val: 85, color: 'bg-rose-500' }
                    ].map((item, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>{item.label}</span>
                                <span>{item.val}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.val}%` }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className={`h-full ${item.color}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </HUDFrame>
        )
    ],

    mutation_dilemma: [
        () => (
            <HUDFrame title="Genetic Sequence Scan">
                <div className="flex items-center gap-4 py-8">
                    <Dna className="w-20 h-20 text-purple-400" />
                    <div className="space-y-1">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="w-24 h-1 bg-slate-800 flex"
                            >
                                <div className={`h-full ${i % 3 === 0 ? 'w-full bg-purple-500' : 'w-1/2 bg-purple-900'}`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Carrier Inheritance Logic">
                <div className="flex items-center gap-8 scale-125">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-3xl">👨</div>
                        <div className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-[8px] text-amber-300 font-bold">Aa</div>
                    </div>
                    <div className="text-slate-600 text-xl">×</div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-3xl">👩</div>
                        <div className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-[8px] text-amber-300 font-bold">Aa</div>
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Probability Visualization">
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono py-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">AA<br/>25%</div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">Aa<br/>50%</div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">Aa<br/>50%</div>
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">aa<br/>25%</div>
                </div>
            </HUDFrame>
        )
    ],

    reaction_time: [
        () => (
            <HUDFrame title="Neural Impulse Transfer">
                <div className="flex items-center gap-2 py-10 relative">
                    <motion.div 
                        animate={{ x: [-100, 100], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-blue-500/10 h-1 top-1/2 -translate-y-1/2"
                    />
                    <Activity className="w-12 h-12 text-blue-400 animate-pulse relative z-10" />
                    <div className="text-xs font-mono text-blue-300 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/20">SPEED: 120 m/s</div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Performance Tracker">
                <div className="relative py-8">
                    <div className="text-6xl grayscale">🏃</div>
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="absolute inset-0 bg-teal-500/20 rounded-full blur-2xl"
                    />
                    <div className="absolute top-0 right-0">
                        <Timer className="w-6 h-6 text-teal-400" />
                        <div className="text-xs font-bold text-teal-400">0.14s</div>
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Reaction Time Delta">
                <div className="w-full max-w-xs h-32 flex items-end justify-center gap-10">
                    <div className="flex flex-col items-center gap-2">
                        <motion.div initial={{ height: 0 }} animate={{ height: 60 }} className="w-12 bg-slate-700 rounded-t-lg" />
                        <span className="text-[10px] text-slate-500">Normal</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: 90 }} 
                            className="w-12 bg-rose-500/60 border border-rose-500 rounded-t-lg relative"
                        >
                            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.6, repeat: Infinity }} className="absolute -top-4 left-1/2 -translate-x-1/2 text-rose-400 font-bold">+</motion.div>
                        </motion.div>
                        <span className="text-[10px] text-rose-400 font-bold">Sleep Deprived</span>
                    </div>
                </div>
            </HUDFrame>
        )
    ],

    oxygen_failure: [
        () => (
            <HUDFrame title="COCKPIT OVERVIEW">
                <div className="relative py-6 scale-125">
                    <Rocket className="w-20 h-20 text-blue-400" />
                    <motion.div 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2 text-xl"
                    >✨</motion.div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="ELECTROLYSIS CELL STATUS">
                <div className="relative flex items-center gap-4 py-8">
                    <div className="w-24 h-32 border-2 border-red-500/40 rounded-xl relative overflow-hidden bg-red-900/5">
                        <motion.div 
                            animate={{ y: [0, -40], opacity: [0.6, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-4 left-4 w-4 h-4 bg-teal-400/20 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase">Input Voltage</span>
                            <span className="text-red-400 font-mono text-xs">0.0V [OFF]</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase">Efficiency</span>
                            <span className="text-red-400 font-mono text-xs">0% [FAIL]</span>
                        </div>
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="EMERGENCY REACTION PLAN">
                <div className="flex items-center gap-4 py-10">
                    <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                        <div className="text-xs font-mono font-bold text-teal-400">2H₂O₂ → 2H₂O + O₂</div>
                        <div className="text-[8px] text-slate-500 mt-1 uppercase text-center">Decomposition</div>
                    </div>
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-4xl"
                    >💨</motion.div>
                </div>
            </HUDFrame>
        )
    ],

    power_grid: [
        () => (
            <HUDFrame title="Dubai Metropolitan Grid">
                <div className="grid grid-cols-5 gap-4 relative py-8">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="relative">
                            <div className="w-4 h-4 rounded-full bg-slate-800 border border-amber-500/20" />
                            <motion.div 
                                animate={{ opacity: [0.2, 0.8, 0.2] }} 
                                transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                                className="absolute inset-0 rounded-full bg-amber-500/40 blur-sm"
                            />
                        </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Building2 className="w-16 h-16 text-amber-500/20" />
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="PEAK LOAD DEMAND">
                <div className="w-64 space-y-4 py-10">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[7px] text-slate-500 uppercase font-bold">System Status</span>
                            <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-red-400 font-bold text-xs">CRITICAL OVERLOAD</motion.span>
                        </div>
                        <div className="text-right">
                            <span className="text-[18px] font-mono font-bold text-red-500">98.4%</span>
                        </div>
                    </div>
                    <div className="h-4 w-full bg-slate-800 rounded border border-red-500/20 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '98%' }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                        />
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Grid Frequency Monitor">
                <div className="w-64 h-32 flex items-center justify-center relative overflow-hidden py-10">
                    <svg viewBox="0 0 200 100" className="w-full h-full stroke-emerald-500/50 fill-none">
                        <motion.path 
                            d="M 0 50 Q 25 10 50 50 T 100 50 T 150 50 T 200 50"
                            animate={{ d: [
                                "M 0 50 Q 25 10 50 50 T 100 50 T 150 50 T 200 50",
                                "M 0 50 Q 25 90 50 50 T 100 50 T 150 50 T 200 50",
                                "M 0 50 Q 25 10 50 50 T 100 50 T 150 50 T 200 50"
                            ]}}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            strokeWidth="2"
                        />
                    </svg>
                    <div className="absolute top-2 right-4 text-[14px] font-mono font-bold text-emerald-400">50.02 Hz</div>
                </div>
            </HUDFrame>
        )
    ],

    heat_loss: [
        () => (
            <HUDFrame title="Building Thermal Scan">
                <div className="relative py-6 scale-125">
                    <Building2 className="w-24 h-24 text-blue-400/40" />
                    <HUDCorner className="top-0 left-0 border-t-2 border-l-2" />
                    <HUDCorner className="top-0 right-0 border-t-2 border-r-2" />
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Thermal Gradient Analysis">
                <div className="relative w-56 h-40 bg-slate-900 rounded-lg overflow-hidden border border-white/5">
                    <div className="absolute inset-0 bg-blue-900/20" />
                    {[
                        { top: 20, left: 20, w: 20, h: 20, color: 'bg-red-500' },
                        { top: 20, right: 20, w: 20, h: 20, color: 'bg-red-500' },
                        { bottom: 0, left: '40%', w: 10, h: 30, color: 'bg-orange-500' }
                    ].map((leak, idx) => (
                        <motion.div 
                            key={idx}
                            animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
                            transition={{ duration: 1.5, delay: idx * 0.3, repeat: Infinity }}
                            className={`absolute rounded blur-md ${leak.color}`}
                            style={{ top: leak.top, left: leak.left, right: leak.right, bottom: leak.bottom, width: leak.w, height: leak.h }}
                        />
                    ))}
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Efficiency Forecast">
                <div className="flex gap-10 py-8">
                    <div className="flex flex-col items-center gap-2">
                        <Gauge className="w-12 h-12 text-teal-400" />
                        <span className="text-[10px] text-teal-300 font-bold">R-VALUE: 3.5</span>
                    </div>
                </div>
            </HUDFrame>
        )
    ],

    reaction_gone_wrong: [
        () => (
            <HUDFrame title="Reactor R-07 Status">
                <div className="relative py-4 scale-110">
                    <Factory className="w-24 h-24 text-blue-400" />
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="THERMAL RUNAWAY RISK">
                <div className="w-64 h-32 relative py-10">
                    <svg viewBox="0 0 200 100" className="w-full h-full stroke-red-500 fill-none">
                        <motion.path 
                            d="M 0 90 Q 50 90 80 70 T 150 20 T 200 0" 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2 }}
                            strokeWidth="3"
                        />
                    </svg>
                    <div className="absolute top-0 right-0 bg-red-900/40 border border-red-500/40 px-2 py-1 rounded text-[10px] text-red-400 font-bold">CRITICAL: 185°C</div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Emergency Scrubbing System">
                <div className="flex items-center gap-6 py-10">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="text-4xl"
                    >🌀</motion.div>
                </div>
            </HUDFrame>
        )
    ],

    aspirin_production: [
        () => (
            <HUDFrame title="API Manufacturing Line">
                <div className="flex items-center gap-6 py-10">
                    <FlaskConical className="w-16 h-16 text-purple-400" />
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Stoichiometric Balance">
                <div className="flex items-center gap-4 py-10">
                    <div className="text-center space-y-2">
                        <div className="text-xs font-bold text-blue-400">1.00 mol</div>
                    </div>
                    <div className="text-2xl text-slate-600">+</div>
                    <div className="text-center space-y-2">
                        <div className="text-xs font-bold text-blue-300">EXCESS</div>
                    </div>
                    <div className="text-2xl text-teal-500">→</div>
                    <div className="text-center space-y-2">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs font-bold text-teal-400">1.00 mol</motion.div>
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Final Recovery Analysis">
                <div className="flex items-end gap-10 py-10">
                    <div className="relative">
                        <Beaker className="w-20 h-20 text-teal-500/20" />
                        <motion.div initial={{ height: 0 }} animate={{ height: '70%' }} transition={{ duration: 2 }} className="absolute bottom-1 left-2 right-2 bg-teal-500/40 rounded-b-lg" />
                    </div>
                    <span className="text-2xl font-mono font-bold text-teal-400">135.2 g</span>
                </div>
            </HUDFrame>
        )
    ],

    fuelproduction: [
        () => (
            <HUDFrame title="H2 Production Facility">
                <div className="relative flex items-center justify-center py-6 scale-125">
                    <Factory className="w-20 h-20 text-blue-400" />
                    <motion.div animate={{ x: [0, 40], y: [0, -20], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute text-xl">💨</motion.div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Substance Mole Ratio">
                <div className="flex items-center gap-6 py-10">
                    <div className="w-12 h-12 rounded border border-amber-500/40 bg-amber-500/10 flex items-center justify-center font-bold text-amber-400">CH₄</div>
                    <div className="text-amber-500 text-2xl">:</div>
                    <div className="w-12 h-12 rounded border border-blue-400/40 bg-blue-400/10 flex items-center justify-center font-bold text-blue-400">H₂</div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Production Yield Status">
                <div className="w-full max-w-xs space-y-4 py-10">
                    <div className="h-4 bg-slate-800 rounded border border-teal-500/20 relative">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-teal-500/40" />
                    </div>
                </div>
            </HUDFrame>
        )
    ],

    aspirin_percent_yield: [
        () => (
            <HUDFrame title="Aspirin Quality Control">
                <div className="relative py-6 scale-125">
                    <FlaskConical className="w-16 h-16 text-purple-400" />
                    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-x-0 bottom-0 h-4 bg-purple-500/20 blur-lg" />
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Yield Mass Comparison">
                <div className="w-full max-w-xs space-y-6 py-8">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-blue-500/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }} className="h-full bg-blue-500/40" />
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-amber-500/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-amber-500/40" />
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Reaction Efficiency Score">
                <div className="text-2xl font-mono font-bold text-white py-10">75% EFFICIENCY</div>
            </HUDFrame>
        )
    ],

    unstable_slope: [
        () => (
            <HUDFrame title="Slope Stability Monitor">
                <div className="relative py-6">
                    <Mountain className="w-24 h-24 text-stone-500" />
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Satuaration Alert">
                <div className="w-64 flex flex-col items-center gap-4 py-10">
                    <Droplets className="w-12 h-12 text-blue-400 animate-bounce" />
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Mass Movement Analysis">
                <div className="relative w-56 h-32 py-10">
                    <svg viewBox="0 0 200 100" className="stroke-red-500/60 fill-none">
                        <path d="M 0 100 Q 50 20 100 80 T 200 40" strokeWidth="2" />
                    </svg>
                </div>
            </HUDFrame>
        )
    ],

    gas_boyle_adnoc: [
        () => (
            <HUDFrame title="Gas Storage Unit 04">
                <div className="relative py-6 flex items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" className="fill-cyan-500/10 stroke-cyan-500/40 stroke-2" />
                    </svg>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Compression Cycle (P/V)">
                <div className="flex items-center gap-10 py-10">
                    <div className="relative w-16 h-24 border-2 border-slate-700 bg-slate-900 rounded overflow-hidden">
                        <motion.div animate={{ height: ['80%', '40%', '80%'] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-0 inset-x-0 bg-cyan-500/30 border-t-4 border-cyan-400" />
                    </div>
                    <div className="text-2xl font-mono font-bold text-amber-500">P↑</div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Safety Setpoint Verification">
                <ShieldCheck className="w-16 h-16 text-teal-400" />
            </HUDFrame>
        )
    ],

    gas_charles_aviation: [
        () => (
            <HUDFrame title="Ground Support Aviation">
                <Plane className="w-20 h-20 text-slate-400" />
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Thermal Expansion (V/T)">
                <div className="flex items-center gap-10 py-10">
                    <Thermometer className="w-10 h-10 text-orange-400" />
                    <motion.div animate={{ scale: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 bg-orange-500/20 rounded-full border border-orange-400" />
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Operational Tolerance">
                <div className="h-4 w-64 bg-slate-800 rounded overflow-hidden relative border border-teal-500/20">
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5 }} className="h-full bg-teal-500/40" />
                </div>
            </HUDFrame>
        )
    ],

    gas_gaylussac_cylinder: [
        () => (
            <HUDFrame title="Sealed Process Cylinder">
                <div className="w-16 h-28 border-2 border-stone-500/40 bg-stone-700/10 rounded-xl" />
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Pressure Accumulation (P/T)">
                <div className="flex items-center gap-10 py-10">
                    <Gauge className="w-16 h-16 text-red-400" />
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Risk Isolation Status">
                <ShieldCheck className="w-16 h-16 text-emerald-400" />
            </HUDFrame>
        )
    ],
    aspirin_production: [
        () => (
            <HUDFrame title="Julphar Pharma Lab - RAK">
                <div className="flex items-center gap-8">
                    <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative">
                        <Building2 className="w-20 h-20 text-teal-400" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500/20 rounded-full border border-teal-500/40 flex items-center justify-center">
                            <span className="text-[8px] text-teal-300">QC</span>
                        </div>
                    </motion.div>
                    <div className="flex flex-col gap-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    animate={{ width: ['0%', '90%', '90%'] }} 
                                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                                    className="h-full bg-teal-500/50" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Purity Analysis Scan">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-48 h-24 bg-slate-950/40 rounded border border-white/5 p-4 overflow-hidden">
                        <motion.div 
                            animate={{ x: ['-10%", "110%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-y-0 w-1 bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        />
                        <div className="flex justify-between items-end h-full pt-4">
                            {[40, 70, 94, 20].map((h, i) => (
                                <div key={i} className="w-6 bg-slate-800 rounded-t-sm relative">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className={`w-full ${h > 90 ? 'bg-teal-500' : 'bg-red-500/60'}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-[10px] font-mono text-red-400 animate-pulse">WARNING: PURITY BELOW THRESHOLD</div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Ethical Decision Matrix">
                <div className="flex gap-16 items-center">
                    <div className="flex shadow-2xl flex-col items-center gap-2">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            <ShieldCheck className="w-12 h-12 text-emerald-400" />
                        </motion.div>
                        <span className="text-[8px] font-mono text-emerald-500/60 uppercase">Safety</span>
                    </div>
                    <div className="h-12 w-px bg-slate-800" />
                    <div className="flex flex-col items-center gap-2">
                        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Zap className="w-12 h-12 text-amber-400 opacity-40" />
                        </motion.div>
                        <span className="text-[8px] font-mono text-amber-500/30 uppercase">Profit</span>
                    </div>
                </div>
            </HUDFrame>
        )
    ],
    fuelproduction: [
        () => (
            <HUDFrame title="Refining Hub - Jebel Ali">
                <div className="relative flex items-end gap-2">
                    {[3, 5, 4, 6].map((h, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <motion.div 
                                animate={{ height: h * 12 }}
                                className="w-8 bg-slate-800 border-x border-teal-500/20 relative"
                            >
                                <motion.div 
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-teal-500/10"
                                />
                            </motion.div>
                            <div className="w-10 h-2 bg-slate-700 rounded-full mt-1" />
                        </div>
                    ))}
                    <motion.div 
                        animate={{ opacity: [0, 1, 0], y: [-10, -40] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute right-4 top-0 text-xl"
                    >💨</motion.div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Stoichiometric Balance">
                <div className="flex items-center gap-8 scale-110">
                    <div className="flex flex-col items-center">
                        <div className="text-xs font-mono text-slate-500 mb-2">REACTANTS</div>
                        <Beaker className="w-12 h-12 text-blue-400" />
                    </div>
                    <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                        <ArrowRight className="w-6 h-6 text-teal-500/40" />
                    </motion.div>
                    <div className="flex flex-col items-center">
                        <div className="text-xs font-mono text-slate-500 mb-2">PRODUCTS</div>
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <FlaskConical className="w-12 h-12 text-teal-400" />
                        </motion.div>
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Logistics Optimization">
                <div className="flex flex-col gap-4 w-48">
                    {[1,2].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <Plane className={`w-8 h-8 ${i === 1 ? 'text-teal-400' : 'text-slate-700'}`} />
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    animate={{ width: i === 1 ? '100%' : '30%' }}
                                    transition={{ duration: 2, delay: i * 0.5 }}
                                    className={`h-full ${i === 1 ? 'bg-teal-500' : 'bg-slate-600'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </HUDFrame>
        )
    ],
    aspirin_percent_yield: [
        () => (
            <HUDFrame title="Dubai Science Park - Efficiency Lab">
                <div className="relative">
                    <Activity className="w-20 h-20 text-teal-400 opacity-20" />
                    <motion.div 
                        animate={{ pathLength: [0, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Gauge className="w-16 h-16 text-teal-400" />
                    </motion.div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Theoretical vs Actual Comparison">
                <div className="flex items-end gap-12 relative overflow-hidden h-32">
                    <div className="flex flex-col items-center">
                        <div className="text-[8px] font-mono text-slate-500 mb-1">THEORETICAL</div>
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: '80%' }}
                            className="w-12 bg-slate-800 border border-slate-700 rounded-t-lg overflow-hidden flex items-end"
                        >
                            <div className="w-full h-full bg-teal-500/20" />
                        </motion.div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-[8px] font-mono text-teal-400 mb-1">ACTUAL</div>
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: '60%' }}
                            className="w-12 bg-teal-500/40 border border-teal-400/40 rounded-t-lg relative"
                        >
                            <motion.div 
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute inset-0 bg-white/10"
                            />
                        </motion.div>
                    </div>
                </div>
            </HUDFrame>
        ),
        () => (
            <HUDFrame title="Yield Performance Report">
                <div className="flex flex-col items-center gap-3">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 rounded-full border-4 border-teal-500/30 flex flex-col items-center justify-center relative"
                    >
                        <div className="text-2xl font-black text-white">75%</div>
                        <div className="text-[8px] font-mono text-teal-400 uppercase tracking-widest">Yield</div>
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <motion.circle 
                                cx="50%" cy="50%" r="44%"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-teal-500"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 0.75 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        </svg>
                    </motion.div>
                </div>
            </HUDFrame>
        )
    ]
};

const FallbackVisual = ({ avatar, scenarioId, sceneIndex }) => (
    <HUDFrame title={`${scenarioId.replace('_', ' ')} - Phase ${sceneIndex + 1}`}>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-8xl drop-shadow-2xl">
            {avatar || '🧑‍🔬'}
        </motion.div>
    </HUDFrame>
);

export default function ScenarioVisual({ scenarioId, sceneIndex, showData, avatar }) {
    if (showData) return null; 

    const visualsForScenario = SCENE_VISUALS[scenarioId];
    const VisualComponent = visualsForScenario?.[sceneIndex];

    if (!VisualComponent) {
        return <FallbackVisual avatar={avatar} scenarioId={scenarioId} sceneIndex={sceneIndex} />;
    }

    return (
        <motion.div
            key={`${scenarioId}-${sceneIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex justify-center items-center p-4"
        >
            <VisualComponent />
        </motion.div>
    );
}
