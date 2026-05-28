import React from 'react';
import { motion } from 'framer-motion';
import { 
    Droplets, Activity, Thermometer, Zap, Dna, Timer, 
    Rocket, Factory, Building2, FlaskConical, Beaker, 
    Mountain, Plane, AlertTriangle, ShieldCheck, Gauge, ArrowRight,
    TrendingUp, TrendingDown, Wind, Flame, Waves
} from 'lucide-react';
import { RiskMeter, DataLabel } from './PedagogicalPrimitives';

// Reusable HUD Decoration Components
const HUDCorner = () => null;

const HUDFrame = ({ children, title, accentColor = "teal" }) => (
    <div className="relative w-full h-full min-h-[180px] flex flex-col items-center justify-center bg-white/40 rounded-xl overflow-hidden border border-cyan-500/15 shadow-sm">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#06b6d4_0%,transparent_70%)]" />
        
        {children}

        {/* Title Bar */}
        {title && (
            <div className="absolute bottom-2 left-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-cyan-500" />
                <span className="text-xs font-semibold text-slate-600">{title}</span>
            </div>
        )}
    </div>
);

const SCENE_VISUALS = {
    // ═══════════════════════════════════════════════════════════════
    // WATER CONTAMINATION
    // ═══════════════════════════════════════════════════════════════
    water_contamination: [
        // Scene 0: Understanding the Problem
        () => (
            <HUDFrame title="Desalination Unit — Al Ruwais">
                <div className="flex flex-col items-center gap-4 relative z-10 py-2">
                    <div className="flex items-end gap-10">
                        {/* Water treatment unit */}
                        <div className="relative">
                            <div className="w-24 h-28 bg-slate-800 rounded-t-2xl border-2 border-blue-500/40 flex flex-col items-center p-3 relative overflow-hidden">
                                <div className="w-full h-1 bg-blue-500/20 rounded-full mb-3 overflow-hidden">
                                    <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity }} className="w-1/2 h-full bg-blue-400/60" />
                                </div>
                                <div className="grid grid-cols-2 gap-2 w-full flex-1">
                                    {[1,2,3,4].map(i => <div key={i} className="bg-slate-700/50 rounded-sm border border-blue-500/10" />)}
                                </div>
                            </div>
                            <DataLabel label="Water Intake" value="Active" status="info" className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap" />
                        </div>
                        {/* Flow indicator */}
                        <div className="flex flex-col items-center gap-3">
                            <Droplets className="w-8 h-8 text-blue-400" />
                            <div className="relative h-1 w-20 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity }} className="h-full bg-blue-500" />
                            </div>
                            <span className="text-[9px] text-blue-300 font-medium">Flow Rate</span>
                        </div>
                    </div>
                    {/* Key data labels */}
                    <div className="flex gap-2 flex-wrap justify-center">
                        <DataLabel label="Nitrate Level" value="85" unit="mg/L" status="critical" />
                        <DataLabel label="Safe Limit" value="50" unit="mg/L" status="normal" />
                    </div>
                    <RiskMeter level="high" label="Contamination Risk" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Decision Phase — Groundwater Plume
        () => (
            <HUDFrame title="Groundwater Plume Analysis">
                <div className="relative w-64 h-36 bg-slate-950/40 rounded-lg overflow-hidden border border-white/5">
                    {/* Factory source */}
                    <div className="absolute top-4 left-4 text-2xl">🏭</div>
                    <DataLabel label="Source" value="Factory" status="warning" className="absolute top-1 left-4" />
                    {/* Plume spread */}
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.25 }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-6 left-6 w-12 h-12 bg-orange-500 rounded-full blur-xl"
                    />
                    <motion.div 
                        animate={{ x: [0, 80], opacity: [0, 0.4, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-8 left-12 w-20 h-8 bg-gradient-to-r from-orange-500/40 to-transparent rounded-full"
                    />
                    {/* Residential area */}
                    <div className="absolute bottom-4 right-4 text-2xl">🏙️</div>
                    <DataLabel label="Community" value="At Risk" status="critical" className="absolute bottom-1 right-4" />
                </div>
            </HUDFrame>
        ),
        // Scene 2: Consequence — Lab Results
        () => (
            <HUDFrame title="Lab Result — Nitrate Sample">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <FlaskConical className="w-14 h-14 text-teal-400" />
                        <motion.div 
                            animate={{ height: ['20%', '55%', '20%'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 bg-teal-500/30 rounded-b-sm"
                        />
                    </div>
                    <DataLabel label="Sample Tube" value="Processing" status="info" />
                    <div className="flex gap-2 mt-1">
                        {[47, 49, 51].map((val, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.5 }}
                                className={`px-3 py-1.5 rounded text-xs font-mono font-bold border ${val > 50 ? 'bg-red-500/15 border-red-500/40 text-red-300' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'}`}
                            >
                                NO₃⁻: {val} mg/L
                            </motion.div>
                        ))}
                    </div>
                    <DataLabel label="Safe Limit" value="50" unit="mg/L" status="warning" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // ACID RAIN
    // ═══════════════════════════════════════════════════════════════
    acid_rain: [
        // Scene 0: Understanding — Date Palm monitoring
        () => (
            <HUDFrame title="Al Ain Date Palm Monitoring">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-end gap-3">
                        {[40, 60, 55, 75, 45, 65].map((h, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                    className={`w-4 rounded-t-full origin-bottom ${h < 50 ? 'bg-gradient-to-t from-amber-900 to-amber-600' : 'bg-gradient-to-t from-green-900 to-green-600'}`}
                                    style={{ height: h }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <DataLabel label="Healthy Trees" value="60%" status="warning" />
                        <DataLabel label="Damaged Trees" value="40%" status="critical" />
                    </div>
                    <RiskMeter level="medium" label="Crop Damage Risk" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Decision — Corrosion
        () => (
            <HUDFrame title="Limestone Corrosion Analysis">
                <div className="relative flex flex-col items-center gap-2">
                    <div className="text-6xl opacity-60">🗿</div>
                    <motion.div 
                        animate={{ y: [0, 30], opacity: [0, 0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-yellow-500/30 to-transparent rounded-full"
                    />
                    <DataLabel label="Calcium Carbonate" value="Erosion Active" status="critical" />
                    <div className="flex gap-2">
                        <DataLabel label="pH of Rain" value="4.2" status="critical" />
                        <DataLabel label="Normal pH" value="5.6" status="info" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 2: Consequence — pH Alert
        () => (
            <HUDFrame title="pH Sensor Reading">
                <div className="w-56 flex flex-col items-center gap-3">
                    <div className="w-full h-6 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-blue-500 relative">
                        <motion.div 
                            initial={{ left: '50%' }}
                            animate={{ left: ['22%', '25%', '22%'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-3 w-3 h-10 bg-white rounded-full shadow-lg border-2 border-red-600 z-10"
                        />
                        {/* Scale labels */}
                        <div className="absolute -bottom-5 left-0 text-[8px] text-red-400 font-bold">Acidic</div>
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-slate-400">Neutral</div>
                        <div className="absolute -bottom-5 right-0 text-[8px] text-blue-400 font-bold">Basic</div>
                    </div>
                    <div className="mt-4">
                        <DataLabel label="Current pH" value="4.2" status="critical" />
                    </div>
                    <DataLabel label="Safe Range" value="6.5 – 8.5" status="normal" />
                    <RiskMeter level="high" label="Environmental Risk" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // INVASIVE SPECIES
    // ═══════════════════════════════════════════════════════════════
    invasive_species: [
        // Scene 0: Mangrove density
        () => (
            <HUDFrame title="Mangrove Ecosystem Scan">
                <div className="flex flex-col items-center gap-3">
                    <div className="grid grid-cols-4 gap-2 relative z-10">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, opacity: i % 3 === 0 ? 0.8 : 0.3 }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                className={`w-8 h-8 rounded-full border ${i % 3 === 0 ? 'bg-green-500/40 border-green-500/30' : 'bg-green-900/20 border-green-500/10'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/30" />
                            <span className="text-[9px] text-slate-400">Healthy</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-green-900/20 border border-green-500/10" />
                            <span className="text-[9px] text-slate-400">Stressed</span>
                        </div>
                    </div>
                    <RiskMeter level="high" label="Ecosystem Stress" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Species spread
        () => (
            <HUDFrame title="Invasive Species Spread Path">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-3xl">🚢</span>
                            <DataLabel label="Source" value="Ballast Water" status="warning" />
                        </div>
                        <div className="flex gap-1.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <motion.div 
                                    key={i}
                                    animate={{ x: [0, 15], opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                                    className="w-2 h-2 bg-emerald-400 rounded-full"
                                />
                            ))}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl text-emerald-500">🌿</span>
                            <DataLabel label="Invasive" value="Spreading" status="critical" />
                        </div>
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 2: Consequence — Ecosystem impact bars
        () => (
            <HUDFrame title="Ecosystem Impact Assessment">
                <div className="w-full max-w-xs space-y-3">
                    {[
                        { label: 'Native Species', val: 35, color: 'bg-green-500', status: 'Declining' },
                        { label: 'Invasive Algae', val: 85, color: 'bg-rose-500', status: 'Spreading' }
                    ].map((item, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span className="font-medium">{item.label}</span>
                                <span className="font-bold">{item.val}% — {item.status}</span>
                            </div>
                            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.val}%` }}
                                    transition={{ duration: 1.5, delay: 0.3 }}
                                    className={`h-full ${item.color} rounded-full`}
                                />
                            </div>
                        </div>
                    ))}
                    <RiskMeter level="high" label="Biodiversity Risk" className="mt-2" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // MUTATION DILEMMA
    // ═══════════════════════════════════════════════════════════════
    mutation_dilemma: [
        // Scene 0: Genetic sequence
        () => (
            <HUDFrame title="Genetic Sequence Analysis">
                <div className="flex items-center gap-5 py-4">
                    <Dna className="w-16 h-16 text-purple-400" />
                    <div className="space-y-1">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: i * 0.08 }}
                                className="w-24 h-1.5 bg-slate-800 flex rounded-sm overflow-hidden"
                            >
                                <div className={`h-full ${i % 3 === 0 ? 'w-full bg-purple-500' : 'w-1/2 bg-purple-900'}`} />
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        <DataLabel label="Gene" value="CFTR" status="info" />
                        <DataLabel label="Variant" value="ΔF508" status="warning" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 1: Inheritance pattern
        () => (
            <HUDFrame title="Carrier Inheritance Pattern">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-3xl">👨</span>
                            <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-xs text-amber-300 font-bold">Aa</div>
                            <span className="text-[9px] text-slate-400">Carrier</span>
                        </div>
                        <div className="text-slate-500 text-xl font-bold">×</div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-3xl">👩</span>
                            <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-xs text-amber-300 font-bold">Aa</div>
                            <span className="text-[9px] text-slate-400">Carrier</span>
                        </div>
                    </div>
                    <RiskMeter level="medium" label="Inheritance Risk" />
                </div>
            </HUDFrame>
        ),
        // Scene 2: Punnett square
        () => (
            <HUDFrame title="Punnett Square — Probability">
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="grid grid-cols-2 gap-2 text-center text-sm font-mono">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <span className="text-emerald-400 font-bold">AA</span>
                            <div className="text-[10px] text-emerald-300 mt-1">25% — Unaffected</div>
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <span className="text-amber-400 font-bold">Aa</span>
                            <div className="text-[10px] text-amber-300 mt-1">50% — Carrier</div>
                        </div>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <span className="text-amber-400 font-bold">Aa</span>
                            <div className="text-[10px] text-amber-300 mt-1">50% — Carrier</div>
                        </div>
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <span className="text-red-400 font-bold">aa</span>
                            <div className="text-[10px] text-red-300 mt-1">25% — Affected</div>
                        </div>
                    </div>
                    <DataLabel label="Risk of Affected Child" value="25%" status="warning" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // REACTION TIME
    // ═══════════════════════════════════════════════════════════════
    reaction_time: [
        // Scene 0: Neural impulse
        () => (
            <HUDFrame title="Neural Signal Pathway">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex items-center gap-3 relative w-full max-w-xs">
                        <motion.div 
                            animate={{ x: [-10, 200], opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 bg-blue-500/10 h-1 top-1/2 -translate-y-1/2 rounded-full"
                        />
                        <Activity className="w-10 h-10 text-blue-400 relative z-10" />
                        <div className="flex-1" />
                        <DataLabel label="Speed" value="120" unit="m/s" status="info" className="relative z-10" />
                    </div>
                    <div className="flex gap-2">
                        <DataLabel label="Stimulus" value="Visual" status="info" />
                        <DataLabel label="Avg. Response" value="250" unit="ms" status="normal" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 1: Performance tracker
        () => (
            <HUDFrame title="Athlete Performance Tracker">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="relative">
                        <span className="text-5xl grayscale">🏃</span>
                        <div className="absolute top-0 right-0 flex flex-col items-center">
                            <Timer className="w-5 h-5 text-teal-400" />
                            <span className="text-xs font-bold text-teal-400 font-mono">0.14s</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <DataLabel label="Reaction" value="0.14" unit="s" status="normal" />
                        <DataLabel label="Target" value="<0.20" unit="s" status="info" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 2: Comparison bars
        () => (
            <HUDFrame title="Reaction Time Comparison">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-full max-w-xs h-28 flex items-end justify-center gap-10">
                        <div className="flex flex-col items-center gap-1">
                            <motion.div initial={{ height: 0 }} animate={{ height: 55 }} transition={{ duration: 0.8 }} className="w-14 bg-emerald-500/30 border border-emerald-500/40 rounded-t-lg" />
                            <span className="text-[10px] text-emerald-400 font-bold">Rested</span>
                            <span className="text-[9px] text-slate-400 font-mono">180ms</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <motion.div initial={{ height: 0 }} animate={{ height: 85 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-14 bg-rose-500/30 border border-rose-500/40 rounded-t-lg" />
                            <span className="text-[10px] text-rose-400 font-bold">Sleep Deprived</span>
                            <span className="text-[9px] text-slate-400 font-mono">320ms</span>
                        </div>
                    </div>
                    <DataLabel label="Impact" value="+78% slower" status="critical" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // OXYGEN FAILURE
    // ═══════════════════════════════════════════════════════════════
    oxygen_failure: [
        // Scene 0: Cockpit overview
        () => (
            <HUDFrame title="Space Station — Life Support">
                <div className="flex flex-col items-center gap-3 py-4">
                    <Rocket className="w-16 h-16 text-blue-400" />
                    <div className="flex gap-2">
                        <DataLabel label="O₂ Level" value="18.2%" status="critical" />
                        <DataLabel label="Critical" value="<19.5%" status="warning" />
                    </div>
                    <RiskMeter level="high" label="Life Support Risk" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Electrolysis cell
        () => (
            <HUDFrame title="Electrolysis Cell Status">
                <div className="flex items-center gap-5 py-4">
                    <div className="w-20 h-28 border-2 border-red-500/40 rounded-xl relative overflow-hidden bg-red-900/5">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <DataLabel label="Input Voltage" value="0.0V" status="critical" />
                        <DataLabel label="Status" value="OFFLINE" status="critical" />
                        <DataLabel label="Efficiency" value="0%" status="critical" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 2: Emergency reaction
        () => (
            <HUDFrame title="Emergency Oxygen Generation">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                        <div className="text-base font-mono font-bold text-teal-400">2H₂O₂ → 2H₂O + O₂</div>
                        <div className="text-[10px] text-slate-400 mt-1 text-center">Hydrogen Peroxide Decomposition</div>
                    </div>
                    <div className="flex gap-2">
                        <DataLabel label="Reaction" value="Decomposition" status="info" />
                        <DataLabel label="Product" value="Oxygen Gas" status="normal" />
                    </div>
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // POWER GRID
    // ═══════════════════════════════════════════════════════════════
    power_grid: [
        // Scene 0: Grid overview
        () => (
            <HUDFrame title="Dubai Metropolitan Grid">
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="grid grid-cols-5 gap-3 relative">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="relative">
                                <div className="w-4 h-4 rounded-full bg-slate-800 border border-amber-500/20" />
                                <motion.div 
                                    initial={{ opacity: 0.2 }}
                                    animate={{ opacity: [0.3, 0.7, 0.3] }} 
                                    transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full bg-amber-500/30 blur-sm"
                                />
                            </div>
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Building2 className="w-12 h-12 text-amber-500/20" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <DataLabel label="Grid Load" value="98.4%" status="critical" />
                        <DataLabel label="Max Capacity" value="100%" status="warning" />
                    </div>
                    <RiskMeter level="high" label="Overload Risk" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Peak load
        () => (
            <HUDFrame title="Peak Load Demand">
                <div className="w-60 space-y-3 py-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <DataLabel label="Status" value="Critical Overload" status="critical" />
                        </div>
                        <span className="text-xl font-mono font-bold text-red-500">98.4%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-800 rounded-full border border-red-500/20 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '98%' }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                        />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                        <span>0%</span>
                        <span className="text-amber-400 font-bold">Safe: &lt;85%</span>
                        <span>100%</span>
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 2: Frequency monitor
        () => (
            <HUDFrame title="Grid Frequency Monitor">
                <div className="w-60 flex flex-col items-center gap-3 relative overflow-hidden py-4">
                    <svg viewBox="0 0 200 80" className="w-full h-20 stroke-emerald-500/50 fill-none">
                        <motion.path 
                            d="M 0 40 Q 25 10 50 40 T 100 40 T 150 40 T 200 40"
                            animate={{ d: [
                                "M 0 40 Q 25 10 50 40 T 100 40 T 150 40 T 200 40",
                                "M 0 40 Q 25 70 50 40 T 100 40 T 150 40 T 200 40",
                                "M 0 40 Q 25 10 50 40 T 100 40 T 150 40 T 200 40"
                            ]}}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            strokeWidth="2"
                        />
                    </svg>
                    <div className="flex gap-2">
                        <DataLabel label="Frequency" value="50.02" unit="Hz" status="normal" />
                        <DataLabel label="Target" value="50.00" unit="Hz" status="info" />
                    </div>
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // HEAT LOSS
    // ═══════════════════════════════════════════════════════════════
    heat_loss: [
        // Scene 0: Building thermal
        () => (
            <HUDFrame title="Building Thermal Scan">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="relative">
                        <Building2 className="w-20 h-20 text-blue-400/40" />
                        {/* Heat arrows escaping */}
                        <motion.div
                            animate={{ y: [-5, -15], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute -top-2 left-2"
                        >
                            <TrendingUp className="w-4 h-4 text-red-400" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [-5, -15], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                            className="absolute -top-2 right-2"
                        >
                            <TrendingUp className="w-4 h-4 text-red-400" />
                        </motion.div>
                    </div>
                    <div className="flex gap-2">
                        <DataLabel label="Heat Loss" value="42%" status="critical" />
                        <DataLabel label="Energy Rating" value="Poor" status="warning" />
                    </div>
                    <RiskMeter level="high" label="Energy Waste" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Thermal gradient
        () => (
            <HUDFrame title="Thermal Gradient Analysis">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-52 h-36 bg-slate-900 rounded-lg overflow-hidden border border-white/5">
                        <div className="absolute inset-0 bg-blue-900/20" />
                        {[
                            { top: 15, left: 15, w: 22, h: 22, color: 'bg-red-500', label: 'Window' },
                            { top: 15, right: 15, w: 22, h: 22, color: 'bg-red-500', label: 'Window' },
                            { bottom: 0, left: '40%', w: 12, h: 28, color: 'bg-orange-500', label: 'Door' }
                        ].map((leak, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                                className={`absolute rounded-sm ${leak.color}`}
                                style={{ top: leak.top, left: leak.left, right: leak.right, bottom: leak.bottom, width: leak.w, height: leak.h }}
                            />
                        ))}
                        {/* Labels on hotspots */}
                        <div className="absolute top-1 left-1 text-[8px] text-red-300 font-bold bg-red-900/60 px-1 rounded">Window</div>
                        <div className="absolute top-1 right-1 text-[8px] text-red-300 font-bold bg-red-900/60 px-1 rounded">Window</div>
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-orange-300 font-bold bg-orange-900/60 px-1 rounded">Door</div>
                    </div>
                    <div className="flex gap-3 text-[9px]">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> High heat loss</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500" /> Moderate loss</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-900/40" /> Insulated</span>
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 2: Efficiency
        () => (
            <HUDFrame title="Insulation Efficiency Forecast">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex gap-8 items-center">
                        <Gauge className="w-10 h-10 text-teal-400" />
                        <div className="flex flex-col gap-1">
                            <DataLabel label="R-Value" value="3.5" status="normal" />
                            <DataLabel label="Target" value="5.0" status="info" />
                        </div>
                    </div>
                    <RiskMeter level="medium" label="Insulation Quality" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // REACTION GONE WRONG
    // ═══════════════════════════════════════════════════════════════
    reaction_gone_wrong: [
        // Scene 0: Reactor status
        () => (
            <HUDFrame title="Reactor R-07 Status">
                <div className="flex flex-col items-center gap-3 py-2">
                    <Factory className="w-20 h-20 text-blue-400" />
                    <div className="flex gap-2">
                        <DataLabel label="Reactor" value="R-07" status="info" />
                        <DataLabel label="Status" value="Monitoring" status="warning" />
                    </div>
                    <RiskMeter level="medium" label="Reactor Risk" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Thermal runaway
        () => (
            <HUDFrame title="Temperature Curve — Thermal Runaway">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-60 h-28 relative">
                        <svg viewBox="0 0 200 100" className="w-full h-full stroke-red-500 fill-none">
                            <motion.path 
                                d="M 0 90 Q 50 90 80 70 T 150 20 T 200 0" 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2 }}
                                strokeWidth="3"
                            />
                            {/* Safe zone line */}
                            <line x1="0" y1="50" x2="200" y2="50" stroke="#22c55e" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                        </svg>
                        <div className="absolute top-0 right-0">
                            <DataLabel label="Temp" value="185°C" status="critical" />
                        </div>
                        <div className="absolute bottom-0 right-0 text-[8px] text-emerald-400 font-mono">Safe: &lt;120°C</div>
                    </div>
                    <RiskMeter level="high" label="Thermal Runaway Risk" />
                </div>
            </HUDFrame>
        ),
        // Scene 2: Emergency scrubbing
        () => (
            <HUDFrame title="Emergency Scrubbing System">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex items-center gap-6">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="text-3xl"
                        >🌀</motion.div>
                        <div className="flex flex-col gap-1">
                            <DataLabel label="System" value="Scrubbing Active" status="normal" />
                            <DataLabel label="Neutralizer" value="Deployed" status="info" />
                        </div>
                    </div>
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // UNSTABLE SLOPE
    // ═══════════════════════════════════════════════════════════════
    unstable_slope: [
        // Scene 0: Slope monitor
        () => (
            <HUDFrame title="Slope Stability Monitor">
                <div className="flex flex-col items-center gap-3 py-2">
                    <Mountain className="w-20 h-20 text-stone-500" />
                    <div className="flex gap-2">
                        <DataLabel label="Slope Angle" value="34°" status="warning" />
                        <DataLabel label="Critical" value=">30°" status="critical" />
                    </div>
                    <RiskMeter level="high" label="Landslide Risk" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Saturation
        () => (
            <HUDFrame title="Soil Saturation Alert">
                <div className="flex flex-col items-center gap-3 py-4">
                    <Droplets className="w-10 h-10 text-blue-400" />
                    <div className="flex gap-2">
                        <DataLabel label="Soil Moisture" value="92%" status="critical" />
                        <DataLabel label="Safe Level" value="<70%" status="info" />
                    </div>
                    <div className="w-full max-w-xs">
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '92%' }}
                                transition={{ duration: 1.5 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-[8px] text-slate-500">
                            <span>0%</span>
                            <span className="text-amber-400">Safe limit: 70%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 2: Mass movement
        () => (
            <HUDFrame title="Mass Movement Analysis">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-52 h-28">
                        <svg viewBox="0 0 200 100" className="stroke-red-500/60 fill-none w-full h-full">
                            <path d="M 0 100 Q 50 20 100 80 T 200 40" strokeWidth="2" />
                            <line x1="0" y1="60" x2="200" y2="60" stroke="#22c55e" strokeWidth="1" strokeDasharray="4" opacity="0.4" />
                        </svg>
                        <div className="absolute top-1 right-1 text-[8px] text-emerald-400 font-mono bg-emerald-900/40 px-1 rounded">Stable threshold</div>
                    </div>
                    <DataLabel label="Stability" value="Below Threshold" status="critical" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // GAS LAWS: BOYLE'S LAW (ADNOC)
    // ═══════════════════════════════════════════════════════════════
    gas_boyle_adnoc: [
        // Scene 0: Gas storage unit
        () => (
            <HUDFrame title="Gas Storage Unit 04 — ADNOC">
                <div className="flex flex-col items-center gap-3 py-2">
                    <svg width="90" height="90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" className="fill-cyan-500/10 stroke-cyan-500/40 stroke-2" />
                        {/* Gas particles */}
                        {[{x:35,y:35},{x:65,y:35},{x:50,y:50},{x:35,y:65},{x:65,y:65}].map((p, i) => (
                            <motion.circle
                                key={i}
                                cx={p.x} cy={p.y} r="3"
                                className="fill-cyan-400"
                                animate={{ cx: [p.x, p.x + 5, p.x - 3, p.x], cy: [p.y, p.y - 4, p.y + 5, p.y] }}
                                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                            />
                        ))}
                    </svg>
                    <div className="flex gap-2">
                        <DataLabel label="Pressure" value="100" unit="kPa" status="info" />
                        <DataLabel label="Volume" value="4.0" unit="L" status="info" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 1: Compression cycle
        () => (
            <HUDFrame title="Boyle's Law — Compression Cycle">
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-8">
                        <div className="relative w-16 h-24 border-2 border-slate-700 bg-slate-900 rounded overflow-hidden">
                            <motion.div animate={{ height: ['75%', '40%', '75%'] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-0 inset-x-0 bg-cyan-500/30 border-t-2 border-cyan-400" />
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] text-cyan-300 font-mono font-bold">V</div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-mono font-bold text-amber-500">P↑ V↓</span>
                            <span className="text-[9px] text-slate-400">Inverse relationship</span>
                        </div>
                    </div>
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <span className="text-sm font-mono font-bold text-cyan-400">P₁V₁ = P₂V₂</span>
                    </div>
                    <DataLabel label="Law" value="Boyle's Law" status="info" />
                </div>
            </HUDFrame>
        ),
        // Scene 2: Safety setpoint
        () => (
            <HUDFrame title="Safety Setpoint Verification">
                <div className="flex flex-col items-center gap-3 py-4">
                    <ShieldCheck className="w-14 h-14 text-teal-400" />
                    <div className="flex gap-2">
                        <DataLabel label="New Pressure" value="200" unit="kPa" status="warning" />
                        <DataLabel label="New Volume" value="2.0" unit="L" status="info" />
                    </div>
                    <DataLabel label="Verification" value="P₁V₁ = P₂V₂ ✓" status="normal" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // GAS LAWS: CHARLES'S LAW (AVIATION)
    // ═══════════════════════════════════════════════════════════════
    gas_charles_aviation: [
        // Scene 0: Ground support
        () => (
            <HUDFrame title="Ground Support — Aviation">
                <div className="flex flex-col items-center gap-3 py-4">
                    <Plane className="w-16 h-16 text-slate-400" />
                    <div className="flex gap-2">
                        <DataLabel label="Temperature" value="300" unit="K" status="info" />
                        <DataLabel label="Volume" value="5.0" unit="L" status="info" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 1: Thermal expansion
        () => (
            <HUDFrame title="Charles's Law — Thermal Expansion">
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-8">
                        <Thermometer className="w-8 h-8 text-orange-400" />
                        <motion.div animate={{ scale: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }} className="w-16 h-16 bg-orange-500/15 rounded-full border border-orange-400/40 flex items-center justify-center">
                            <span className="text-[9px] text-orange-300 font-bold">V</span>
                        </motion.div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-mono font-bold text-orange-400">T↑ V↑</span>
                            <span className="text-[9px] text-slate-400">Direct relationship</span>
                        </div>
                    </div>
                    <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <span className="text-sm font-mono font-bold text-orange-400">V₁/T₁ = V₂/T₂</span>
                    </div>
                    <DataLabel label="Law" value="Charles's Law" status="info" />
                </div>
            </HUDFrame>
        ),
        // Scene 2: Operational tolerance
        () => (
            <HUDFrame title="Operational Tolerance Check">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-56">
                        <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                            <span>Capacity Used</span>
                            <span className="text-teal-400 font-bold">85%</span>
                        </div>
                        <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden border border-teal-500/20">
                            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5 }} className="h-full bg-teal-500/50 rounded-full" />
                        </div>
                    </div>
                    <DataLabel label="Tolerance" value="Within Safe Range" status="normal" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // GAS LAWS: GAY-LUSSAC'S LAW (CYLINDER)
    // ═══════════════════════════════════════════════════════════════
    gas_gaylussac_cylinder: [
        // Scene 0: Sealed cylinder
        () => (
            <HUDFrame title="Sealed Process Cylinder">
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-16 h-24 border-2 border-stone-500/40 bg-stone-700/10 rounded-xl relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-stone-500/10" />
                    </div>
                    <div className="flex gap-2">
                        <DataLabel label="Temperature" value="300" unit="K" status="info" />
                        <DataLabel label="Pressure" value="150" unit="kPa" status="info" />
                    </div>
                    <DataLabel label="Volume" value="Fixed (sealed)" status="info" />
                </div>
            </HUDFrame>
        ),
        // Scene 1: Pressure accumulation
        () => (
            <HUDFrame title="Gay-Lussac's Law — Pressure vs Temperature">
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-6">
                        <Gauge className="w-14 h-14 text-red-400" />
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-mono font-bold text-red-400">T↑ P↑</span>
                            <span className="text-[9px] text-slate-400">Direct relationship</span>
                        </div>
                    </div>
                    <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <span className="text-sm font-mono font-bold text-red-400">P₁/T₁ = P₂/T₂</span>
                    </div>
                    <DataLabel label="Law" value="Gay-Lussac's Law" status="info" />
                </div>
            </HUDFrame>
        ),
        // Scene 2: Risk isolation
        () => (
            <HUDFrame title="Pressure Safety Verification">
                <div className="flex flex-col items-center gap-3 py-4">
                    <ShieldCheck className="w-14 h-14 text-emerald-400" />
                    <div className="flex gap-2">
                        <DataLabel label="New Temp" value="450" unit="K" status="warning" />
                        <DataLabel label="New Pressure" value="225" unit="kPa" status="warning" />
                    </div>
                    <DataLabel label="Calculation" value="150 × (450/300) = 225 kPa" status="info" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // ASPIRIN PRODUCTION
    // ═══════════════════════════════════════════════════════════════
    aspirin_production: [
        // Scene 0: Pharma lab
        () => (
            <HUDFrame title="Julphar Pharma Lab — RAK">
                <div className="flex items-center gap-6 py-2">
                    <div className="relative">
                        <Building2 className="w-16 h-16 text-teal-400" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-500/20 rounded-full border border-teal-500/40 flex items-center justify-center">
                            <span className="text-[8px] text-teal-300 font-bold">QC</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {['Salicylic Acid', 'Acetic Anhydride', 'Aspirin Output'].map((label, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-400 w-24">{label}</span>
                                <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        animate={{ width: ['0%', `${70 + i * 10}%`] }} 
                                        transition={{ duration: 1.5, delay: i * 0.3 }}
                                        className="h-full bg-teal-500/50 rounded-full" 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 1: Purity analysis
        () => (
            <HUDFrame title="Purity Analysis">
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="relative w-48 h-20 bg-slate-950/40 rounded border border-white/5 p-3 overflow-hidden">
                        <div className="flex justify-between items-end h-full">
                            {[40, 70, 94, 20].map((h, i) => (
                                <div key={i} className="w-7 bg-slate-800 rounded-t-sm relative flex flex-col justify-end" style={{ height: '100%' }}>
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.2 }}
                                        className={`w-full rounded-t-sm ${h > 90 ? 'bg-teal-500' : h > 50 ? 'bg-amber-500/60' : 'bg-red-500/60'}`}
                                    />
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-slate-400 font-mono">{h}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DataLabel label="Purity" value="Below Threshold" status="warning" />
                    <DataLabel label="Minimum Required" value="95%" status="info" />
                </div>
            </HUDFrame>
        ),
        // Scene 2: Ethical decision
        () => (
            <HUDFrame title="Safety vs. Profit Decision">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-12 items-center">
                        <div className="flex flex-col items-center gap-2">
                            <ShieldCheck className="w-10 h-10 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">Patient Safety</span>
                        </div>
                        <div className="h-10 w-px bg-slate-700" />
                        <div className="flex flex-col items-center gap-2">
                            <Zap className="w-10 h-10 text-amber-400 opacity-50" />
                            <span className="text-xs font-medium text-amber-400/50">Profit</span>
                        </div>
                    </div>
                    <RiskMeter level="medium" label="Ethical Risk" />
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // FUEL PRODUCTION
    // ═══════════════════════════════════════════════════════════════
    fuelproduction: [
        // Scene 0: Refining hub
        () => (
            <HUDFrame title="Refining Hub — Jebel Ali">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative flex items-end gap-2">
                        {[3, 5, 4, 6].map((h, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-8 bg-slate-800 border-x border-teal-500/20 relative" style={{ height: h * 12 }}>
                                    <div className="absolute inset-0 bg-teal-500/10" />
                                </div>
                                <div className="w-10 h-2 bg-slate-700 rounded-full mt-1" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <DataLabel label="Input" value="Crude Oil" status="info" />
                        <DataLabel label="Process" value="Fractional Distillation" status="info" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 1: Stoichiometric balance
        () => (
            <HUDFrame title="Stoichiometric Balance">
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <Beaker className="w-10 h-10 text-blue-400" />
                            <span className="text-xs text-slate-400 mt-1">Reactants</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <ArrowRight className="w-5 h-5 text-teal-500/60" />
                            <span className="text-[8px] text-slate-500">Reaction</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <FlaskConical className="w-10 h-10 text-teal-400" />
                            <span className="text-xs text-slate-400 mt-1">Products</span>
                        </div>
                    </div>
                    <DataLabel label="Key Concept" value="Limiting Reactant" status="warning" />
                    <DataLabel label="Goal" value="Calculate Max Yield" status="info" />
                </div>
            </HUDFrame>
        ),
        // Scene 2: Logistics
        () => (
            <HUDFrame title="Production Yield Summary">
                <div className="flex flex-col items-center gap-3 py-4">
                    {[
                        { label: 'Process A', pct: 100, color: 'bg-teal-500', status: 'Complete' },
                        { label: 'Process B', pct: 30, color: 'bg-slate-600', status: 'Partial' }
                    ].map((item, i) => (
                        <div key={i} className="w-48">
                            <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                                <span>{item.label}</span>
                                <span className="font-bold">{item.pct}% — {item.status}</span>
                            </div>
                            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${item.pct}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.4 }}
                                    className={`h-full ${item.color} rounded-full`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </HUDFrame>
        )
    ],

    // ═══════════════════════════════════════════════════════════════
    // ASPIRIN PERCENT YIELD
    // ═══════════════════════════════════════════════════════════════
    aspirin_percent_yield: [
        // Scene 0: Efficiency lab
        () => (
            <HUDFrame title="Dubai Science Park — Efficiency Lab">
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="relative">
                        <Gauge className="w-14 h-14 text-teal-400" />
                    </div>
                    <div className="flex gap-2">
                        <DataLabel label="Lab Focus" value="Percent Yield" status="info" />
                        <DataLabel label="Target" value=">90%" status="normal" />
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 1: Theoretical vs Actual
        () => (
            <HUDFrame title="Theoretical vs Actual Yield">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-end gap-10 h-28">
                        <div className="flex flex-col items-center gap-1">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 90 }}
                                transition={{ duration: 0.8 }}
                                className="w-14 bg-slate-700/50 border border-slate-600 rounded-t-lg flex items-end overflow-hidden"
                            >
                                <div className="w-full h-full bg-teal-500/20" />
                            </motion.div>
                            <span className="text-[9px] text-slate-400 font-bold">Theoretical</span>
                            <span className="text-[8px] text-teal-400 font-mono">100%</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 67 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="w-14 bg-teal-500/40 border border-teal-400/40 rounded-t-lg"
                            />
                            <span className="text-[9px] text-teal-400 font-bold">Actual</span>
                            <span className="text-[8px] text-teal-400 font-mono">75%</span>
                        </div>
                    </div>
                    <DataLabel label="Percent Yield" value="75%" status="warning" />
                    <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                        <span className="text-[10px] font-mono text-teal-400">% Yield = (Actual / Theoretical) × 100</span>
                    </div>
                </div>
            </HUDFrame>
        ),
        // Scene 2: Yield performance ring
        () => (
            <HUDFrame title="Yield Performance Report">
                <div className="flex flex-col items-center gap-3">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 rounded-full border-4 border-teal-500/30 flex flex-col items-center justify-center relative"
                    >
                        <div className="text-2xl font-black text-white">75%</div>
                        <div className="text-[9px] font-mono text-teal-400">Yield</div>
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
                    <div className="flex gap-2">
                        <DataLabel label="Actual" value="6.75" unit="g" status="info" />
                        <DataLabel label="Theoretical" value="9.0" unit="g" status="info" />
                    </div>
                    <DataLabel label="Rating" value="Needs Improvement" status="warning" />
                </div>
            </HUDFrame>
        )
    ]
};

const FallbackVisual = ({ avatar, scenarioId, sceneIndex }) => (
    <HUDFrame title={`${scenarioId.replace('_', ' ')} — Phase ${sceneIndex + 1}`}>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-8xl drop-shadow-2xl">
            {avatar || '🧑‍🔬'}
        </motion.div>
    </HUDFrame>
);

function DataTable({ dataTable }) {
    if (!dataTable) {
        return (
            <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4 text-center text-sm text-slate-400">
                No data available
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl border border-slate-700 bg-slate-950/85 p-4 shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {dataTable.headers?.map((header) => (
                                <th key={header} className="px-3 py-2 text-left text-teal-300 font-semibold text-xs">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataTable.rows?.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-slate-800 last:border-0">
                                {row.map((cell, cellIndex) => (
                                    <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 text-slate-300 align-top">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function ScenarioVisual({ scenarioId, sceneIndex, showData, avatar, title, subtitle, dataTable }) {
    if (showData && !dataTable) return null; 

    const visualsForScenario = SCENE_VISUALS[scenarioId];
    const VisualComponent = visualsForScenario?.[sceneIndex];
    const hasEnhancedLayout = Boolean(title || subtitle || dataTable);

    if (!VisualComponent && !hasEnhancedLayout) {
        return <FallbackVisual avatar={avatar} scenarioId={scenarioId} sceneIndex={sceneIndex} />;
    }

    return (
        <motion.div
            key={`${scenarioId}-${sceneIndex}`}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex justify-center items-center p-4"
        >
            <div className="w-full max-w-3xl mx-auto space-y-5 text-center relative">
                {hasEnhancedLayout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-x-12 top-10 h-20 bg-teal-500/10 blur-3xl pointer-events-none"
                    />
                )}

                {(title || subtitle) && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.35 }}
                        className="space-y-2 relative z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-slate-900/70 text-[10px] font-semibold text-teal-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            Visual Briefing
                        </div>
                        {title && <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>}
                        {subtitle && <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                    className="w-full flex justify-center items-center"
                >
                    {VisualComponent
                        ? <VisualComponent />
                        : <FallbackVisual avatar={avatar} scenarioId={scenarioId} sceneIndex={sceneIndex} />}
                </motion.div>

                {dataTable && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.35 }}
                        className="max-w-2xl mx-auto"
                    >
                        <DataTable dataTable={dataTable} />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}