import React from 'react';
import { motion } from 'framer-motion';

// Scenario-specific visual configurations — each scene gets a rich illustrated visual
const SCENE_VISUALS = {
    water_contamination: [
        // Scene 1 – Desalination plant overview
        () => (
            <div className="relative w-full flex flex-col items-center gap-4">
                <div className="flex items-end gap-6">
                    {/* Plant structure */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-24 h-32 bg-gradient-to-b from-blue-700 to-blue-900 rounded-t-lg border-2 border-blue-500/60 flex flex-col justify-center items-center gap-2">
                            <div className="text-2xl">🏭</div>
                            <div className="text-xs text-blue-300 font-bold text-center">Desalination<br />Plant</div>
                        </div>
                        <div className="w-28 h-4 bg-blue-800 rounded" />
                    </div>
                    {/* Sea */}
                    <div className="flex flex-col items-center gap-1">
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-5xl"
                        >🌊</motion.div>
                        <div className="text-xs text-blue-400">Seawater Intake</div>
                    </div>
                    {/* Pipeline to homes */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl">🏘️</div>
                        <div className="text-xs text-slate-400">50,000 Residents</div>
                    </div>
                </div>
                {/* Pipeline */}
                <div className="flex items-center gap-0 w-64">
                    <div className="w-8 h-3 bg-blue-600 rounded-l-full" />
                    <motion.div
                        className="flex-1 h-3 bg-gradient-to-r from-blue-600 to-teal-500"
                        animate={{ opacity: [1, 0.6, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="w-8 h-3 bg-teal-500 rounded-r-full" />
                </div>
                <div className="text-xs text-teal-400 font-semibold tracking-wider uppercase">Clean Water Supply Pipeline</div>
            </div>
        ),
        // Scene 2 – Industrial zone expanding
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-end gap-8 justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-5xl">🏭</motion.div>
                        <div className="text-xs text-orange-400 font-bold">Industrial Zone</div>
                        <div className="text-xs text-slate-500">New facility</div>
                    </div>
                    {/* Arrow showing direction */}
                    <div className="flex flex-col items-center gap-1">
                        <motion.div
                            animate={{ x: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="text-red-400 text-2xl font-bold"
                        >→</motion.div>
                        <div className="text-xs text-red-400">2 km upstream</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-5xl">💧</div>
                        <div className="text-xs text-blue-400 font-bold">Water Intake</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-orange-300 text-xs text-center">⚠️ Chemical manufacturing upstream from water supply</p>
                </div>
            </div>
        ),
        // Scene 3 – Monitoring station
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-6 justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl">🔬</motion.div>
                        <div className="text-xs text-teal-400">Monitoring Station</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {['Every 6 hours', 'Chemical analysis', 'pH + metals + nitrates'].map((t, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                                className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-xs text-teal-300">
                                ✓ {t}
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="text-xs text-amber-400 font-semibold">⚠️ Today's readings triggered an investigation</div>
            </div>
        ),
        // Scenes 4,5 – Data table (handled by table renderer)
        null, null,
        // Scene 6 – Map
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative w-72 h-48 bg-gradient-to-br from-amber-900/40 to-orange-900/20 rounded-xl border border-amber-700/30 overflow-hidden">
                    {/* Terrain */}
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(180,120,50,0.1) 10px,rgba(180,120,50,0.1) 20px)' }} />
                    <div className="absolute top-4 left-6 text-2xl">🏭</div>
                    <div className="absolute top-4 left-16 text-xs text-orange-400 font-bold">Industrial Zone</div>
                    {/* Flow arrow */}
                    <motion.div
                        animate={{ x: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="absolute top-10 left-10 text-red-400 text-3xl font-bold"
                    >→→→</motion.div>
                    <div className="absolute bottom-4 right-6 text-2xl">💧</div>
                    <div className="absolute bottom-8 right-2 text-xs text-blue-400 font-bold">Intake</div>
                    <div className="absolute top-2 right-2 text-xs text-slate-400 bg-slate-800/60 px-2 py-1 rounded">Groundwater Flow</div>
                </div>
                <div className="text-xs text-red-400 font-semibold">Contamination flows directly toward intake point</div>
            </div>
        ),
    ],

    reaction_gone_wrong: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl">🏭</motion.div>
                    <div className="absolute -top-2 -right-2 text-lg">⚗️</div>
                </div>
                <div className="text-xs text-slate-400 text-center max-w-48">ADNOC Ruwais Petrochemical Complex<br /><span className="text-teal-400">Industrial Solvent Production</span></div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-6 justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">🖥️</div>
                        <div className="text-xs text-blue-400">Control Room</div>
                    </div>
                    <div className="text-slate-500">→</div>
                    <div className="flex flex-col items-center gap-2">
                        <motion.div animate={{ rotate: [0, 2, -2, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-4xl">⚗️</motion.div>
                        <div className="text-xs text-orange-400">Reactor Vessel 7</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-xs text-center">Exothermic reaction monitored remotely — cooling system active</p>
                </div>
            </div>
        ),
        null, null, // data table scenes
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-8 justify-center">
                    {/* Reaction diagram */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-3xl">⚗️</div>
                        <div className="text-xs text-teal-400 text-center">Exothermic<br />Reaction</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], color: ['#f97316', '#ef4444', '#f97316'] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="text-3xl"
                        >🔥</motion.div>
                        <div className="text-xs text-orange-400 text-center">Heat builds<br />faster than cooled</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-3xl"
                        >💥</motion.div>
                        <div className="text-xs text-red-400 text-center">Critical<br />failure risk</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-red-500/15 border border-red-500/40 rounded-lg">
                    <p className="text-red-300 text-xs text-center font-semibold">⏱️ 3 minutes to critical failure — intervention required</p>
                </div>
            </div>
        ),
    ],

    acid_rain: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-end gap-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <motion.div key={i} animate={{ scaleY: [1, 1.1 + i * 0.05, 1] }} transition={{ duration: 1.5 + i * 0.2, repeat: Infinity }}
                            className="w-6 bg-gradient-to-t from-green-800 to-green-600 rounded-t"
                            style={{ height: 40 + i * 12 }}
                        />
                    ))}
                </div>
                <div className="text-xs text-green-400 font-semibold">Al Ain Date Palm Oasis — UNESCO Heritage Site</div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-6 justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl">🌧️</motion.div>
                        <div className="text-xs text-yellow-400 font-bold">Damaged Crops</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {['Yellow discoloration', 'Weakened leaves', 'Unusual damage pattern'].map((t, i) => (
                            <div key={i} className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300">⚠️ {t}</div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                {/* pH scale bar */}
                <div className="w-full max-w-xs">
                    <div className="text-xs text-slate-400 mb-2 text-center">pH Scale</div>
                    <div className="h-6 rounded-full overflow-hidden flex">
                        {['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'].map((c, i) => (
                            <div key={i} className="flex-1" style={{ background: c }} />
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0<br />Acidic</span>
                        <span className="text-center">7<br />Neutral</span>
                        <span className="text-right">14<br />Alkaline</span>
                    </div>
                    {/* Marker */}
                    <div className="relative mt-1">
                        <motion.div
                            animate={{ left: '29%' }}
                            initial={{ left: '29%' }}
                            className="absolute -top-1 text-xs text-red-400 font-bold"
                        >▲<br />4.2</motion.div>
                    </div>
                </div>
                <div className="text-xs text-teal-400 mt-4">Normal rain pH: 5.6 — measured: 4.2 (25× more acidic)</div>
            </div>
        ),
        null, null, // data table scenes
    ],

    mutation_dilemma: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-5xl">🧬</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-white font-semibold">National Genetics Center</div>
                        <div className="text-xs text-teal-400">Sheikh Khalifa Medical City, Abu Dhabi</div>
                        <div className="text-xs text-slate-400">Genetic counselling & screening</div>
                    </div>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-8 justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl">👨</div>
                        <div className="text-xs text-slate-300">Omar</div>
                        <div className="px-2 py-0.5 bg-amber-500/20 rounded text-xs text-amber-400">Carrier (Aa)</div>
                    </div>
                    <div className="text-3xl text-slate-500">+</div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl">👩</div>
                        <div className="text-xs text-slate-300">Layla</div>
                        <div className="px-2 py-0.5 bg-amber-500/20 rounded text-xs text-amber-400">Carrier (Aa)</div>
                    </div>
                </div>
                <div className="text-xs text-slate-400">Both carry autosomal recessive variant</div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                {/* Punnett square */}
                <div className="text-xs text-slate-400 mb-1">Punnett Square — Carrier × Carrier Cross</div>
                <div className="grid grid-cols-3 gap-1 text-center text-sm">
                    <div className="bg-transparent"></div>
                    <div className="bg-amber-500/20 rounded px-3 py-1 text-amber-300 font-bold">A</div>
                    <div className="bg-amber-500/20 rounded px-3 py-1 text-amber-300 font-bold">a</div>
                    <div className="bg-amber-500/20 rounded px-3 py-1 text-amber-300 font-bold">A</div>
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-emerald-500/20 border border-emerald-500/40 rounded px-3 py-2 text-emerald-300 font-semibold">AA</motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2 text-amber-300 font-semibold">Aa</motion.div>
                    <div className="bg-amber-500/20 rounded px-3 py-1 text-amber-300 font-bold">a</div>
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2 text-amber-300 font-semibold">Aa</motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }} className="bg-red-500/20 border border-red-500/40 rounded px-3 py-2 text-red-300 font-semibold">aa</motion.div>
                </div>
            </div>
        ),
        null, null, // data table scenes
    ],

    reaction_time: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-6xl">🏃</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-white font-semibold">Zayed Sports City</div>
                        <div className="text-xs text-teal-400">National Training Center</div>
                        <div className="text-xs text-slate-400">Olympic Performance Science</div>
                    </div>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-4 justify-center">
                    <div className="text-5xl">🏃</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-white font-semibold">Rashid</div>
                        <div className="text-xs text-teal-400">100m Sprint Specialist</div>
                        <div className="px-2 py-0.5 bg-teal-500/20 rounded text-xs text-teal-300">Baseline: 0.14s</div>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-center">
                    <div className="flex flex-col gap-1">
                        <div className="text-2xl">🏆</div>
                        <div className="text-xs text-slate-400">Asian Games<br />preparation</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-2xl">📉</motion.div>
                        <div className="text-xs text-red-400">Performance<br />declining</div>
                    </div>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="text-xs text-slate-400 mb-2">Reaction Time Test Setup</div>
                <div className="flex items-center gap-4 justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-4xl">🟢</motion.div>
                        <div className="text-xs text-slate-400">Stimulus</div>
                    </div>
                    <div className="text-slate-500 text-xl">→</div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl">⚡</div>
                        <div className="text-xs text-slate-400">Neural signal</div>
                    </div>
                    <div className="text-slate-500 text-xl">→</div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl">🏃</div>
                        <div className="text-xs text-slate-400">Response</div>
                    </div>
                </div>
                <div className="text-xs text-teal-400">Controlled lab conditions — multiple variables tested</div>
            </div>
        ),
        null, null, // data scenes
    ],

    unstable_slope: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-48 h-32">
                    {/* Mountain profile */}
                    <svg viewBox="0 0 200 130" className="w-full h-full">
                        <polygon points="0,130 100,10 200,130" fill="#78716c" stroke="#a8a29e" strokeWidth="2" />
                        <polygon points="0,130 60,50 130,80 200,130" fill="#44403c" stroke="#57534e" strokeWidth="1" />
                        <text x="10" y="120" fontSize="18">🏔️</text>
                        <text x="150" y="55" fontSize="14">⛰️</text>
                    </svg>
                </div>
                <div className="text-xs text-stone-400 font-semibold">Hajar Mountains, Hatta — UAE</div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-6 justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-5xl">🌧️</motion.div>
                        <div className="text-xs text-blue-400">300% above avg<br />rainfall</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-5xl">🌊</div>
                        <div className="text-xs text-blue-400">Wadis flooding</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-300 text-xs text-center">⚠️ Unusual weather — ground changes reported near homes</p>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative w-64 h-36 bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl overflow-hidden border border-stone-600/50">
                    {/* Slope with cracks */}
                    <svg viewBox="0 0 256 144" className="w-full h-full absolute inset-0">
                        <polygon points="0,144 128,20 256,144" fill="#78716c" />
                        <polygon points="0,144 80,60 180,100 256,144" fill="#57534e" />
                        {/* Crack lines */}
                        <motion.path
                            d="M 60 80 L 80 95 L 100 88 L 120 103"
                            stroke="#ef4444" strokeWidth="2.5" fill="none" strokeDasharray="4"
                            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.path
                            d="M 85 72 L 95 85 L 108 78"
                            stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="3"
                            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                        />
                        <text x="8" y="130" fontSize="22">🏠</text>
                        <text x="40" y="130" fontSize="22">🏠</text>
                    </svg>
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/20 rounded text-xs text-red-400">Cracks: 5-10cm wide</div>
                </div>
                <div className="text-xs text-red-400 font-semibold">Ground cracks extend 50m — not normal settling</div>
            </div>
        ),
        null, null, // data scenes
    ],

    invasive_species: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-end gap-2">
                    {[40, 60, 50, 70, 45, 65, 55].map((h, i) => (
                        <motion.div key={i} animate={{ scaleY: [1, 1.08, 1] }} transition={{ duration: 1.5 + i * 0.15, repeat: Infinity }}
                            className="w-5 bg-gradient-to-t from-green-900 to-green-600 rounded-t origin-bottom"
                            style={{ height: h }}
                        />
                    ))}
                </div>
                <div className="text-xs text-green-400 font-semibold">Abu Dhabi Mangrove Forests — Critical Coastal Ecosystem</div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-6 justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl">🚢</div>
                        <div className="text-xs text-slate-400">Ship ballast water<br />discharge</div>
                    </div>
                    <div className="text-slate-500">→</div>
                    <div className="flex flex-col items-center gap-1">
                        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl">🟢</motion.div>
                        <div className="text-xs text-green-400">Invasive algae<br />(no predators)</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-xs text-center">Exponential spread — 5% → 12% → 20% coverage in 3 months</p>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                {/* Coverage progress bars */}
                <div className="text-xs text-slate-400 mb-2">Algae Coverage — Monthly Spread</div>
                {[['Month 1', '5%', 5, '#22c55e'], ['Month 2', '12%', 12, '#eab308'], ['Month 3', '20%', 20, '#f97316'], ['Month 6 (projected)', '80%', 80, '#ef4444']].map(([label, pct, val, color], i) => (
                    <div key={i} className="w-full max-w-xs flex items-center gap-3">
                        <div className="w-24 text-xs text-slate-400 text-right">{label}</div>
                        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ delay: i * 0.2 + 0.3, duration: 0.6 }}
                                className="h-full rounded-full" style={{ background: color }} />
                        </div>
                        <div className="w-10 text-xs font-bold" style={{ color }}>{pct}</div>
                    </div>
                ))}
            </div>
        ),
        null, null,
    ],

    power_grid: [
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative">
                    <div className="text-5xl text-center mb-2">🌆</div>
                    <motion.div
                        animate={{ boxShadow: ['0 0 20px #f59e0b', '0 0 40px #ef4444', '0 0 20px #f59e0b'] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg"
                    >
                        <p className="text-red-300 text-xs text-center font-bold">🌡️ 48°C — Maximum AC Load</p>
                    </motion.div>
                </div>
                <div className="text-xs text-slate-400">Dubai heatwave — entire city at peak demand</div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-4xl">🖥️</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-white font-semibold">DEWA Smart Grid</div>
                        <div className="text-xs text-teal-400">Command Center</div>
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-xs text-red-400 font-bold">⚡ CRITICAL DEMAND</motion.div>
                    </div>
                </div>
            </div>
        ),
        null, null, // data table scenes
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                {/* Frequency gauge */}
                <div className="text-xs text-slate-400 mb-2">Grid Frequency Monitor</div>
                <div className="relative w-48 h-24">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                        <path d="M 10 90 A 80 80 0 0 1 190 90" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
                        <path d="M 10 90 A 80 80 0 0 1 100 10" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
                        <path d="M 100 10 A 80 80 0 0 1 190 90" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                        <motion.line
                            x1="100" y1="90"
                            animate={{ x2: [115, 95, 115], y2: [30, 35, 30] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"
                        />
                        <circle cx="100" cy="90" r="5" fill="#fbbf24" />
                        <text x="8" y="105" fontSize="10" fill="#22c55e">Safe</text>
                        <text x="158" y="105" fontSize="10" fill="#ef4444">⚠️</text>
                        <text x="82" y="22" fontSize="11" fill="white" fontWeight="bold">50 Hz</text>
                    </svg>
                </div>
                <div className="text-xs text-amber-400 font-semibold">Frequency dropping — 30 minutes to cascade failure</div>
            </div>
        ),
    ],

    heat_loss: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-5xl">🕌</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-white font-semibold">Al Fahidi Historical District</div>
                        <div className="text-xs text-teal-400">80-year-old building</div>
                        <div className="text-xs text-amber-400">Annual cooling cost: AED 180,000</div>
                    </div>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-4 justify-center">
                    <div className="text-4xl">🌡️</div>
                    <div className="flex flex-col gap-2">
                        <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-300">UAE climate: 70%+ cooling costs</div>
                        <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-xs text-teal-300">Budget: AED 400,000 for retrofit</div>
                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300">⚠️ Heritage regulations limit exterior changes</div>
                    </div>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                {/* Thermal imaging visualization */}
                <div className="text-xs text-slate-400 mb-2">Thermal Imaging Scan — Heat Gain Sources</div>
                <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-slate-700">
                    {/* Building outline */}
                    <div className="absolute inset-0 bg-slate-900">
                        {/* Windows - hot */}
                        <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute top-4 left-4 w-12 h-10 rounded" style={{ background: 'rgba(239,68,68,0.6)' }} />
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                            className="absolute top-4 right-4 w-12 h-10 rounded" style={{ background: 'rgba(239,68,68,0.5)' }} />
                        {/* Roof - warm */}
                        <div className="absolute top-0 inset-x-0 h-4" style={{ background: 'rgba(249,115,22,0.5)' }} />
                        {/* Walls - mild */}
                        <div className="absolute inset-y-0 left-0 w-2" style={{ background: 'rgba(234,179,8,0.3)' }} />
                        <div className="absolute inset-y-0 right-0 w-2" style={{ background: 'rgba(234,179,8,0.3)' }} />
                        {/* Door - gap */}
                        <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 0.8, repeat: Infinity }}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-14" style={{ background: 'rgba(249,115,22,0.4)' }} />
                    </div>
                    <div className="absolute bottom-1 right-1 text-xs text-orange-300 bg-slate-900/80 px-1 rounded">Thermal</div>
                </div>
                <div className="text-xs text-orange-400">Red = highest heat gain (windows 35%)</div>
            </div>
        ),
        null, null,
    ],

    aspirin_production: [
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-4">
                    <div className="text-5xl">💊</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-white font-semibold">Gulf Pharma, Abu Dhabi</div>
                        <div className="text-xs text-teal-400">50 million tablets/year</div>
                        <div className="text-xs text-slate-400">Hospital & clinic supply</div>
                    </div>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-4 justify-center">
                    <div className="text-4xl">🏥</div>
                    <div className="text-slate-500">←</div>
                    <div className="flex flex-col items-center gap-1">
                        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl">💊</motion.div>
                        <div className="text-xs text-teal-400">1000 tablets</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-xs text-center font-semibold">⚠️ Urgent order — pain management programme — 24 hours</p>
                </div>
                <div className="text-xs text-slate-400">Each tablet: exactly 500 mg acetylsalicylic acid</div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                {/* Reaction equation diagram */}
                <div className="text-xs text-slate-400 mb-1">Chemical Synthesis — Aspirin Production</div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="px-3 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-center">
                            <div className="text-white text-xs font-bold">Salicylic acid</div>
                            <div className="text-blue-300 text-xs">C₇H₆O₃</div>
                            <div className="text-slate-400 text-xs">138 g/mol</div>
                        </div>
                        <div className="text-teal-400 text-xs font-bold">1 mol</div>
                    </div>
                    <div className="text-slate-400 text-lg">+</div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="px-3 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-center">
                            <div className="text-white text-xs font-bold">Acetic anhydride</div>
                            <div className="text-purple-300 text-xs">C₄H₆O₃</div>
                            <div className="text-slate-400 text-xs">102 g/mol</div>
                        </div>
                        <div className="text-teal-400 text-xs font-bold">1 mol</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-teal-400 text-xl">→</motion.div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-center">
                            <div className="text-white text-xs font-bold">Aspirin</div>
                            <div className="text-emerald-300 text-xs">C₉H₈O₄</div>
                            <div className="text-slate-400 text-xs">180 g/mol</div>
                        </div>
                        <div className="text-teal-400 text-xs font-bold">1 mol</div>
                    </div>
                </div>
            </div>
        ),
        null, null,
    ],

    fuelproduction: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-6xl">🏭</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-white font-semibold">Jebel Ali Fuel Plant</div>
                        <div className="text-xs text-teal-400">Masdar Clean Energy Partner</div>
                        <div className="text-xs text-slate-400">Dubai International Airport Supply</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
                    ✈️ Hajj Season Demand Surge
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-6 justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl text-blue-400 font-bold">CH₄</div>
                        <div className="text-xs text-slate-400">Methane</div>
                    </div>
                    <div className="text-slate-500 text-xl">+</div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl text-blue-300">2H₂O</div>
                        <div className="text-xs text-slate-400">Steam</div>
                    </div>
                    <div className="text-teal-500 text-2xl">→</div>
                    <div className="flex flex-col items-center gap-2">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl text-teal-400 font-bold">4H₂</motion.div>
                        <div className="text-xs text-teal-400 font-bold">Hydrogen Fuel</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-xs text-center">1:4 Mole Ratio — Yield Optimization</p>
                </div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-8 justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-4xl">🧪</div>
                        <div className="text-xs text-slate-400">16g CH₄</div>
                        <div className="text-xs text-teal-400 font-bold">(1 mole)</div>
                    </div>
                    <div className="text-slate-500 text-xl">→</div>
                    <div className="flex flex-col items-center gap-1">
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-5xl">⛽</motion.div>
                        <div className="text-xs text-teal-400 font-bold">8g Hydrogen</div>
                        <div className="text-xs text-slate-400">(4 moles)</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/40 rounded-lg">
                    <p className="text-emerald-300 text-xs text-center font-semibold">✓ Production Estimate Verified</p>
                </div>
            </div>
        ),
    ],

    oxygen_failure: [
        () => (
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <motion.div animate={{ rotate: [0, 2, -2, 0], y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl">🚀</motion.div>
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute -top-2 -right-2 text-yellow-400 text-xl">✨</motion.div>
                </div>
                <div className="text-xs text-slate-400 text-center">Emirates Mars Crew Vehicle<br /><span className="text-teal-400">60 million km from Earth</span></div>
            </div>
        ),
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.5, repeat: Infinity }}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-sm font-bold text-center">🚨 ALARM — O₂ SYSTEM FAILURE</p>
                </motion.div>
                <div className="flex items-center gap-6 text-center">
                    <div className="flex flex-col gap-1">
                        <div className="text-3xl">⚗️</div>
                        <div className="text-xs text-slate-400">Electrolysis unit</div>
                        <div className="text-xs text-red-400 font-bold">FAILED</div>
                    </div>
                    <div className="text-slate-500">→</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-3xl">💨</div>
                        <div className="text-xs text-slate-400">O₂ generation</div>
                        <div className="text-xs text-red-400 font-bold">STOPPED</div>
                    </div>
                    <div className="text-slate-500">→</div>
                    <div className="flex flex-col gap-1">
                        <div className="text-3xl">👨‍🚀</div>
                        <div className="text-xs text-slate-400">4 crew</div>
                        <div className="text-xs text-amber-400 font-bold">72h backup</div>
                    </div>
                </div>
            </div>
        ),
        null, null, // data table scenes
        () => (
            <div className="flex flex-col items-center gap-4 w-full">
                {/* Electrolysis diagram */}
                <div className="text-xs text-slate-400 mb-1">Electrolysis Reaction — Lifeline Chemistry</div>
                <div className="flex items-center gap-3 justify-center">
                    <div className="px-3 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-center">
                        <div className="text-white text-xs font-bold">Water</div>
                        <div className="text-blue-300 font-bold">2H₂O</div>
                        <div className="text-slate-400 text-xs">200 kg available</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-xs text-yellow-400 mb-1">⚡ electricity</div>
                        <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-teal-400 text-xl">→</motion.div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-center">
                            <div className="text-emerald-300 font-bold text-xs">O₂ ← breathe</div>
                        </div>
                        <div className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/40 rounded text-center">
                            <div className="text-slate-400 text-xs">2H₂ (byproduct)</div>
                        </div>
                    </div>
                </div>
                <div className="text-xs text-teal-400">200 kg water → potential emergency oxygen source</div>
            </div>
        ),
    ],
};

const FallbackVisual = ({ avatar, scenarioId, sceneIndex }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3"
    >
        <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-8xl drop-shadow-2xl"
        >
            {avatar || '🧑‍🔬'}
        </motion.div>
    </motion.div>
);

export default function ScenarioVisual({ scenarioId, sceneIndex, showData, avatar }) {
    if (showData) return null; // Table takes over when showData=true

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
            className="w-full flex justify-center items-center"
        >
            <VisualComponent />
        </motion.div>
    );
}

