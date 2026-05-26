import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, CheckCircle2,
    ChevronRight, Lock, Timer, Eye, FileText,
    BarChart3, Target, HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScenarioVisual from './ScenarioVisual';
import useTypewriter from './useTypewriter';

const SCENE_ONE_HINTS = {
  water_contamination: [
    "Look at the 'Safe Limit' column for each substance in the table.",
    "Compare the 'Measured' levels to the 'Safe Limit' values.",
    "Nitrate is measured at 55 ppm, which is higher than its safe limit of 50 ppm."
  ],
  reaction_gone_wrong: [
    "Check how fast the temperature is rising over the 5-minute timeframe.",
    "The temperature jumped from 80°C to 120°C. An uncontrolled rise in temperature is exothermic.",
    "If the temperature continues rising uncontrolled, the cooling system is likely failing to extract heat."
  ],
  acid_rain: [
    "Check the measured pH values across all forest and lake sites.",
    "Normal rain has a pH around 5.6. A lower pH means higher acidity.",
    "Forest Zone A shows a highly acidic pH of 4.2, coupled with high SO₂ levels."
  ],
  mutation_dilemma: [
    "Review the probability column in the Punnett Square table.",
    "Look for the probability associated with the 'aa' (Affected) genotype.",
    "When both parents are Aa, there is a 1 in 4 (25%) chance of passing on both recessive alleles (aa)."
  ],
  reaction_time: [
    "Compare each condition's reaction time to the sprinter's baseline of 0.14s.",
    "Look at the sleep deprivation (5 hours) result. It is 0.21s, which is +0.07s above baseline.",
    "Sleep deprivation caused the largest delay compared to stress, carb meals, or normal sleep."
  ],
  unstable_slope: [
    "Review the combination of slope factors: soil type, inclination, vegetation, and rain.",
    "Clay soil gets heavy and slippery when saturated with water, accelerating slide risk.",
    "A steep slope with clay soil, removed roots, and heavy rain has the absolute highest risk."
  ],
  invasive_species: [
    "Think about what floating weeds do to the surface of a lake.",
    "They block sunlight from reaching underwater plants, halting oxygen production.",
    "This blocks sunlight and depletes dissolved oxygen, destroying the aquatic food web."
  ],
  power_grid: [
    "Compare the total grid capacity with the peak demand during the heatwave.",
    "Generation capacity is 15,000 MW, but demand is spiking at 18,000 MW.",
    "The deficit is 3,000 MW, which reduces grid frequency and risks a total blackout."
  ],
  heat_loss: [
    "Find the building area responsible for the highest percentage of heat loss.",
    "Conduction heat loss is 35% through windows, 25% through roof, and 20% through walls.",
    "Windows represent the highest loss area, making them the primary upgrade priority."
  ],
  oxygen_failure: [
    "What chemical process splits water (H₂O) into oxygen (O₂) and hydrogen (H₂)?",
    "Look for the reaction that uses electricity to split water molecule bonds.",
    "Electrolysis is the process of using electric current to split water: 2H₂O → 2H₂ + O₂."
  ],
  aspirin_production: [
    "Aspirin synthesis uses a 1:1 mole ratio of salicylic acid to aspirin.",
    "Use the ratio of molar masses: 138 g/mol salicylic acid to 180 g/mol aspirin.",
    "Multiply the target mass of aspirin (500 g) by the mass ratio: 500 * (138/180) = 383 g."
  ],
  fuelproduction: [
    "Check the molar mass of sulfur (32 g/mol) and diatomic oxygen (32 g/mol).",
    "Calculate the moles: 64 g of S is 2 moles, and 64 g of O₂ is 2 moles.",
    "Both sulfur and oxygen have exactly 2 moles, which react in a 1:1 ratio."
  ],
  aspirin_percent_yield: [
    "Theoretical yield is the calculated maximum amount of product possible.",
    "It is a calculated limit based on stoichiometry, assuming a perfect reaction.",
    "It represents the maximum amount of product expected from the starting materials."
  ],
  gas_boyle_adnoc: [
    "Boyle's Law states that at a constant temperature, pressure is inversely proportional to volume.",
    "When volume decreases, gas particles collide more frequently, increasing pressure.",
    "Decreasing volume causes pressure to rise, and increasing volume causes pressure to drop."
  ],
  gas_charles_aviation: [
    "Charles's Law states that at a constant pressure, gas volume is directly proportional to temperature.",
    "Heating gas particles makes them move faster and push outward, expanding the volume.",
    "Increasing temperature causes volume to increase under constant pressure."
  ],
  gas_gaylussac_cylinder: [
    "In a rigid cylinder, the volume is fixed and cannot expand.",
    "Heating gas particles in a fixed container increases their collision force against the walls.",
    "Increasing the temperature in a sealed container causes gas pressure to increase."
  ]
};

function HintSystem({ scenarioId, scene, hintCount, setHintCount }) {
    const customHints = SCENE_ONE_HINTS[scenarioId] || [
        "Review the key question and the data table provided.",
        "Check the measurements against the safe limits or baseline values.",
        "Analyze which option fits the clue or standard parameters of the system."
    ];

    return (
        <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">
                    Need Help?
                </span>
                {hintCount < 3 && (
                    <button
                        onClick={() => setHintCount(prev => prev + 1)}
                        className="text-xs font-mono text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 border border-slate-200 rounded"
                    >
                        <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
                        Need a Hint? ({hintCount}/3)
                    </button>
                )}
                {hintCount >= 3 && (
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        All hints revealed
                    </span>
                )}
            </div>

            {hintCount > 0 && (
                <div className="space-y-2">
                    {customHints.slice(0, hintCount).map((hint, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-slate-700 bg-white border border-slate-100 p-2.5 rounded flex gap-2"
                        >
                            <span className="text-cyan-500 font-bold font-mono">Hint {idx + 1}:</span>
                            <span className="font-sans font-medium">{hint}</span>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}


/* ── Animated metric hook ──────────────────────────────────────────────── */
function useAnimatedValue(base, variance, intervalMs = 1800) {
    const [value, setValue] = useState(base);
    useEffect(() => {
        const id = setInterval(() => {
            setValue(() => {
                const delta = (Math.random() - 0.5) * variance * 0.5;
                const next = base + delta;
                return Math.round(next * 10) / 10;
            });
        }, intervalMs);
        return () => clearInterval(id);
    }, [base, variance, intervalMs]);
    return value;
}

/* ── Mini sparkline ────────────────────────────────────────────────────── */
function MiniGraph({ color = '#06b6d4', pts = 22, heightPx = 28 }) {
    const [data, setData] = useState(() =>
        Array.from({ length: pts }, (_, i) => 0.45 + Math.sin(i * 0.45) * 0.25 + Math.random() * 0.15)
    );
    useEffect(() => {
        const id = setInterval(() => {
            setData(prev => {
                const arr = [...prev.slice(1)];
                const last = arr[arr.length - 1];
                arr.push(Math.max(0.08, Math.min(0.92, last + (Math.random() - 0.5) * 0.18)));
                return arr;
            });
        }, 420);
        return () => clearInterval(id);
    }, []);
    const w = 110;
    const h = heightPx;
    const polyPts = data.map((v, i) => `${(i / (pts - 1)) * w},${h - v * h}`).join(' ');
    return (
        <svg width={w} height={h} className="overflow-visible shrink-0">
            <polyline
                points={polyPts}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.85"
            />
        </svg>
    );
}

/* ── Status indicator ──────────────────────────────────────────────────── */
function StatusDot({ level }) {
    const map = {
        normal:   'bg-emerald-500',
        stable:   'bg-emerald-500',
        ok:       'bg-emerald-500',
        elevated: 'bg-amber-400',
        warning:  'bg-amber-400',
        critical: 'bg-red-500',
        alert:    'bg-red-500',
    };
    const cls = map[level?.toLowerCase()] || map.normal;
    return (
        <span className="relative flex items-center justify-center w-3 h-3 shrink-0">
            <span className={`w-2 h-2 rounded-full ${cls}`} />
        </span>
    );
}

/* ── Panel shell ───────────────────────────────────────────────────────── */
function Panel({ label, icon: Icon, status, children, className = '', dimmed = false }) {
    return (
        <div className={`hud-panel relative flex flex-col overflow-hidden transition-opacity duration-500 ${
            dimmed ? 'opacity-60' : ''
        } ${className}`}>

            {/* Panel header */}
            <div className={`flex items-center justify-between px-3.5 py-2.5 border-b ${
                dimmed ? 'border-slate-700/40 bg-slate-800/30' : 'border-cyan-500/20 bg-cyan-950/30'
            }`}>
                <div className="flex items-center gap-2">
                    {!dimmed && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                    {dimmed && <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                    <span className={`text-[9px] font-mono tracking-widest uppercase select-none ${dimmed ? 'text-slate-500' : 'text-cyan-400'}`}>
                        {Icon && <Icon className="w-2.5 h-2.5 inline mr-1.5 -mt-0.5" />}
                        {label}
                    </span>
                </div>
                {status}
            </div>

            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

/* ── Metric row ─────────────────────────────────────────────────────────── */
function MetricRow({ icon: Icon, label, value, unit, graph, highlight = false }) {
    return (
        <div className={`flex items-center justify-between gap-2 px-3.5 py-2 border-b border-[var(--lx-dark-glass-border)] ${highlight ? 'bg-amber-500/5' : ''}`}>
            <div className="flex items-center gap-1.5 shrink-0 w-24">
                <Icon className={`w-3 h-3 shrink-0 ${highlight ? 'text-amber-400' : 'text-cyan-500/70'}`} />
                <span className="text-[9px] font-mono text-[var(--lx-text-muted)] uppercase tracking-wider truncate">{label}</span>
            </div>
            <span className={`text-[11px] font-mono font-bold tabular-nums shrink-0 ${highlight ? 'text-amber-300' : 'text-cyan-300'}`}>
                {value}<span className="text-[9px] font-normal text-[var(--lx-text-muted)] ml-0.5">{unit}</span>
            </span>
            {graph && (
                <div className="flex-1 flex justify-end min-w-0">
                    <MiniGraph color={highlight ? '#f59e0b' : '#06b6d4'} heightPx={22} />
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function SceneOne({
    scene,
    scenarioId,
    scenarioTitle: _scenarioTitle,
    onComplete,
    isTeacher = false,
    theme = {},
}) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [justification, setJustification] = useState('');
    const [hintCount, setHintCount] = useState(0);
    const [showThinkTimer, setShowThinkTimer] = useState(true);
    const [thinkTime, setThinkTime] = useState(120);
    const [stage, setStage] = useState('briefing');
    const displayedNarrative = useTypewriter(scene.narrative || '');

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';
    const sceneDataTable = scene.data?.table || null;
    const sceneDataNotes = [scene.data?.graphDescription, scene.data?.mapNote].filter(Boolean);

    // Animated telemetry values
    const temp    = useAnimatedValue(43.2,  1.8, 1600);
    const pressure = useAnimatedValue(101.3, 0.6, 2100);
    const voltage  = useAnimatedValue(12.4,  0.4, 1900);
    const ph       = useAnimatedValue(7.2,   0.3, 2400);

    // Stage progression
    useEffect(() => {
        if (stage !== 'briefing') return undefined;
        if (isTeacher) { setStage('data'); return undefined; }
        const t = setTimeout(() => setStage('data'), 5000);
        return () => clearTimeout(t);
    }, [stage, isTeacher]);

    // Think timer
    useEffect(() => {
        if (stage !== 'decision' || !showThinkTimer || thinkTime <= 0) {
            if (thinkTime === 0) setShowThinkTimer(false);
            return undefined;
        }
        const t = setTimeout(() => setThinkTime(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [stage, showThinkTimer, thinkTime]);

    const handleContinue = () => {
        if (!selectedOption) return;
        onComplete({
            selectedOption: selectedOption.id,
            consequence: selectedOption.consequence,
            justification,
            hintsUsed: hintCount,
        });
    };

    const handleTeacherSkip = () => {
        const defaultOption = scene.options[0];
        onComplete({
            selectedOption: defaultOption.id,
            consequence: defaultOption.consequence,
            justification: 'Teacher preview - skipped',
            hintsUsed: 0,
        });
    };

    const isDecision = stage === 'decision';
    const canSubmit = selectedOption && (justification.length >= 15 || isTeacher);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="w-full"
        >
            {/* ── Scene identifier header ────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white/90 shadow-sm`} style={{ borderRadius: '6px' }}>
                        <span className={`text-xs font-mono font-bold ${text} uppercase tracking-widest`}>
                            Evidence
                        </span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-xs font-mono text-slate-800 uppercase tracking-wider font-semibold">
                            {scene.title}
                        </span>
                    </div>

                    {/* Stage progress dots */}
                    <div className="flex items-center gap-2">
                        {['briefing', 'data', 'decision'].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <button
                                    onClick={() => isTeacher && setStage(s)}
                                    disabled={!isTeacher}
                                    className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3 py-1.5 border transition-all ${
                                        stage === s
                                            ? `border-cyan-500 text-cyan-600 bg-cyan-50/50 font-bold`
                                            : 'border-slate-200 text-slate-500 bg-white/50 hover:bg-slate-50'
                                    } ${isTeacher ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                    style={{ borderRadius: '4px' }}
                                >
                                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                                        stage === s ? `border-current bg-current/10` : 'border-slate-300'
                                    }`}>
                                        {i + 1}
                                    </span>
                                    {s === 'briefing' ? 'Story' : s === 'data' ? 'Evidence' : 'Choice'}
                                </button>
                                {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            </div>
                        ))}
                    </div>
                </div>

                {isTeacher && (
                    <span
                        className="text-xs font-mono text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 select-none font-bold"
                        style={{ borderRadius: '4px' }}
                    >
                        TEACHER MODE
                    </span>
                )}
            </div>

            {/* ── 2-column grid ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">

                {/* ══════════════════════════════════════════════════════════
                    LEFT COLUMN: Analysis Workspace
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex flex-col gap-4"
                >
                    <AnimatePresence mode="wait">

                        {/* BRIEFING stage */}
                        {stage === 'briefing' && (
                            <motion.div
                                key="briefing"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-4"
                            >
                                <Panel label="Story" icon={FileText}>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={`w-px h-8 bg-gradient-to-b ${accent}`} />
                                            <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">
                                                Incoming Transmission
                                            </span>
                                        </div>
                                        <p className="text-slate-800 leading-relaxed text-base font-sans min-h-[120px]">
                                            {displayedNarrative}
                                            <motion.span
                                                className="inline-block w-0.5 h-4 bg-cyan-500 ml-0.5 align-middle"
                                                animate={{ opacity: [1, 0, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                            />
                                        </p>
                                    </div>
                                </Panel>

                                {/* Auto-advance timer bar */}
                                {!isTeacher && (
                                    <div className="flex items-center gap-3 px-1">
                                        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Processing</span>
                                        <div className="flex-1 h-[2px] bg-slate-200 overflow-hidden" style={{ borderRadius: '1px' }}>
                                            <motion.div
                                                className={`h-full bg-gradient-to-r ${accent}`}
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 5, ease: 'linear' }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Auto-advance</span>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* DATA stage */}
                        {stage === 'data' && (
                            <motion.div
                                key="data"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-4"
                            >
                                <Panel label="Evidence" icon={BarChart3}>
                                    <div className="p-6 space-y-6">
                                        {/* Key Question */}
                                        <div className="glass-card border border-slate-200 bg-white/80 rounded-xl p-4 shadow-sm">
                                            <h3 className="text-xs font-bold text-cyan-700 uppercase mb-2">Key Question</h3>
                                            <p className="text-sm text-slate-700 leading-relaxed">{scene.question}</p>
                                        </div>

                                        {/* Evidence Table */}
                                        {sceneDataTable ? (
                                            <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm glass-card bg-white/80">
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 bg-slate-50">
                                                            {sceneDataTable.headers.map((h) => (
                                                                <th key={h} className="px-3 py-2 font-mono text-slate-700 uppercase tracking-wider font-bold">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sceneDataTable.rows.map((row, rIdx) => (
                                                            <tr key={rIdx} className="border-b border-slate-100">
                                                                {row.map((cell, cIdx) => (
                                                                    <td key={cIdx} className="px-3 py-2 text-slate-700 font-medium">{cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <>
                                                <BarChart3 className="w-8 h-8 text-slate-400 mb-2" />
                                                <p className="text-slate-500 text-xs">No quantitative data available.</p>
                                            </>
                                        )}

                                        {/* Important Clue */}
                                        {scene.importantClue && (
                                            <div className="glass-card border border-slate-200 bg-white/80 rounded-xl p-4 shadow-sm">
                                                <h3 className="text-xs font-bold text-cyan-700 uppercase mb-2">Important Clue</h3>
                                                <p className="text-sm text-slate-700 leading-relaxed">{scene.importantClue}</p>
                                            </div>
                                        )}

                                        {/* Visual */}
                                        <div className="glass-card border border-slate-200 bg-white/80 rounded-xl p-4 shadow-sm">
                                            <ScenarioVisual scenarioId={scenarioId} sceneIndex={0} avatar={scene.avatar} title={scene.title} />
                                        </div>
                                    </div>
                                </Panel>
                            </motion.div>
                        )}

                        {/* DECISION stage */}
                        {stage === 'decision' && (
                            <motion.div
                                key="decision-center"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-4"
                            >
                                <Panel label="Problem Area Visualization" icon={Eye}>
                                    <div className="p-4 flex items-center justify-center min-h-[220px] bg-slate-50/50 rounded-b-lg">
                                        <ScenarioVisual
                                            scenarioId={scenarioId}
                                            sceneIndex={0}
                                            avatar={scene.avatar}
                                            title={scene.title}
                                        />
                                    </div>
                                    <div className="px-6 py-4 border-t border-slate-100 bg-white">
                                        <p className="text-slate-700 text-base leading-relaxed">{scene.narrative}</p>
                                    </div>
                                </Panel>

                                {scene.learningObjective && (
                                    <div className={`flex items-start gap-4 p-4 border border-slate-200 bg-white/80 shadow-sm`} style={{ borderRadius: '8px' }}>
                                        <Target className={`w-5 h-5 ${text} shrink-0 mt-0.5`} />
                                        <div>
                                            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase block mb-1">Learning Objective</span>
                                            <p className={`text-base text-slate-800 font-semibold leading-relaxed`}>{scene.learningObjective}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Continue button — in non-decision stages */}
                    {stage !== 'decision' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                onClick={() => setStage(stage === 'briefing' ? 'data' : 'decision')}
                                size="lg"
                                className={`w-full bg-gradient-to-r ${accent} font-mono tracking-wider uppercase text-sm py-6`}
                            >
                                {stage === 'briefing' ? 'Proceed to Evidence' : 'Make Your Choice'}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}
                </motion.div>

                {/* ══════════════════════════════════════════════════════════
                    RIGHT COLUMN: Decision Center
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <AnimatePresence mode="wait">

                        {/* LOCKED state (briefing/data stages) */}
                        {!isDecision && (
                            <motion.div
                                key="locked"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Panel label="Make Your Choice" dimmed>
                                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4 bg-slate-50/50">
                                        <motion.div
                                            className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm"
                                            animate={{ boxShadow: ['0 0 0 0px rgba(148,163,184,0.1)', '0 0 0 8px rgba(148,163,184,0)', '0 0 0 0px rgba(148,163,184,0)'] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Lock className="w-5 h-5 text-slate-400" />
                                        </motion.div>
                                        <div>
                                            <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">Choice Locked</p>
                                            <p className="text-slate-600 text-sm">Complete the {stage === 'briefing' ? 'Story' : 'Evidence'} to unlock the Choice interface.</p>
                                        </div>

                                        {/* Pulsing dots */}
                                        <div className="flex items-center gap-1 mt-2">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-slate-300"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </Panel>
                            </motion.div>
                        )}

                        {/* UNLOCKED decision interface */}
                        {isDecision && (
                            <motion.div
                                key="decision"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <Panel label="Make Your Choice" icon={Target}>
                                    <div className="p-5 space-y-5">

                                        {/* Think timer */}
                                        <AnimatePresence>
                                            {showThinkTimer && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200" style={{ borderRadius: '6px' }}>
                                                        <div className="flex items-center gap-2.5">
                                                            <Timer className="w-4.5 h-4.5 text-amber-600" />
                                                            <span className="text-xs font-mono text-amber-800 tracking-wider uppercase font-bold">Critical Thinking Phase</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold font-mono text-amber-700 tabular-nums">{thinkTime}s</span>
                                                            {isTeacher && (
                                                                <button
                                                                    onClick={() => setShowThinkTimer(false)}
                                                                    className="text-[10px] text-amber-600 hover:text-amber-700 font-mono font-bold"
                                                                >
                                                                    [SKIP]
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Critical question */}
                                        <div className="p-4 border border-red-200 bg-red-50/60" style={{ borderRadius: '6px' }}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                                <span className="text-[10px] font-mono text-red-700 tracking-widest uppercase font-bold">Critical Question</span>
                                            </div>
                                            <p className="text-slate-900 font-bold leading-snug text-base">{scene.question}</p>
                                        </div>

                                        {/* Scientific justification textarea */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <span className="text-xs font-mono text-slate-600 tracking-widest uppercase font-semibold">Scientific Justification</span>
                                            </div>
                                            <div className="relative">
                                                <textarea
                                                    value={justification}
                                                    onChange={e => setJustification(e.target.value)}
                                                    placeholder={scene.justificationStarter || 'Enter your scientific reasoning using evidence from the data...'}
                                                    rows={4}
                                                    className="glass-input w-full text-base leading-relaxed px-4 py-3.5 resize-none focus:outline-none"
                                                    style={{ borderRadius: '6px' }}
                                                />
                                                {/* Watermark */}
                                                <span className="absolute bottom-2 right-3 text-[8px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none select-none">
                                                    SCENARIO_LOG
                                                </span>
                                            </div>
                                            {!isTeacher && justification.length > 0 && justification.length < 15 && (
                                                <p className="text-xs font-mono text-amber-600 mt-1 font-bold">
                                                    {15 - justification.length} more characters required
                                                </p>
                                            )}
                                        </div>

                                        {/* Answer options */}
                                        <div className="space-y-3">
                                            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">
                                                Select Response
                                            </span>
                                            {scene.options.map(({ id, text: optText }, idx) => {
                                                const letter = String.fromCharCode(65 + idx);
                                                const isSelected = selectedOption?.id === id;
                                                return (
                                                    <motion.button
                                                        key={id}
                                                        whileHover={{ x: 2 }}
                                                        whileTap={{ scale: 0.99 }}
                                                        onClick={() => setSelectedOption(scene.options.find(o => o.id === id))}
                                                        className={`w-full text-left flex items-start gap-4 p-4 border transition-all duration-200 ${
                                                            isSelected
                                                                ? 'border-cyan-500 bg-cyan-50/50 shadow-md'
                                                                : 'border-slate-200 bg-white/80 hover:border-cyan-400 hover:bg-slate-50/80'
                                                        }`}
                                                        style={{ borderRadius: '8px' }}
                                                    >
                                                        <span className={`shrink-0 w-7 h-7 rounded border flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                                                            isSelected
                                                                ? 'border-cyan-500 text-cyan-600 bg-cyan-100/50'
                                                                : 'border-slate-200 text-slate-400 bg-slate-50'
                                                        }`}>
                                                            {letter}
                                                        </span>
                                                        <span className={`text-sm leading-snug transition-colors ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                                                            {optText}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        {/* Hint System */}
                                        <HintSystem scenarioId={scenarioId} scene={scene} hintCount={hintCount} setHintCount={setHintCount} />

                                        {/* Confidence note if no selection */}
                                        {!selectedOption && (
                                            <p className="text-xs font-mono text-slate-400 text-center font-bold">
                                                — Select a response to activate submission —
                                            </p>
                                        )}

                                        {/* CONFIRM DECISION */}
                                        <Button
                                            onClick={handleContinue}
                                            disabled={!canSubmit}
                                            size="lg"
                                            className={`w-full bg-gradient-to-r ${accent} font-mono tracking-widest uppercase disabled:opacity-40 py-6`}
                                        >
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Submit Choice
                                        </Button>

                                        {/* Teacher skip */}
                                        {isTeacher && (
                                            <Button
                                                variant="outline"
                                                onClick={handleTeacherSkip}
                                                className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 font-mono text-xs"
                                            >
                                                Skip to Result (Teacher)
                                            </Button>
                                        )}
                                    </div>
                                </Panel>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
}
