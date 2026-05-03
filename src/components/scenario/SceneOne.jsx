import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Activity, Thermometer, Gauge, Zap, CheckCircle2,
    ChevronRight, Lock, FlaskConical, Radio, Timer, Eye, FileText,
    BarChart3, Target, ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScenarioVisual from './ScenarioVisual';
import useTypewriter from './useTypewriter';

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
    const pulse = ['elevated', 'warning', 'critical', 'alert'].includes(level?.toLowerCase());
    const cls = map[level?.toLowerCase()] || map.normal;
    return (
        <span className="relative flex items-center justify-center w-3 h-3 shrink-0">
            {pulse && <span className={`absolute inset-0 rounded-full ${cls} animate-ping opacity-35`} />}
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
            {/* HUD corners */}
            <span className={`absolute top-0 left-0 w-4 h-4 border-t border-l ${dimmed ? 'border-slate-600/40' : 'border-cyan-400/50'}`} />
            <span className={`absolute top-0 right-0 w-4 h-4 border-t border-r ${dimmed ? 'border-slate-600/40' : 'border-cyan-400/50'}`} />
            <span className={`absolute bottom-0 left-0 w-4 h-4 border-b border-l ${dimmed ? 'border-slate-600/40' : 'border-cyan-400/50'}`} />
            <span className={`absolute bottom-0 right-0 w-4 h-4 border-b border-r ${dimmed ? 'border-slate-600/40' : 'border-cyan-400/50'}`} />

            {/* Panel header */}
            <div className={`flex items-center justify-between px-3.5 py-2.5 border-b ${
                dimmed ? 'border-slate-700/40 bg-slate-800/30' : 'border-cyan-500/20 bg-cyan-950/30'
            }`}>
                <div className="flex items-center gap-2">
                    {!dimmed && (
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.3, repeat: Infinity }}
                        />
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
        });
    };

    const handleTeacherSkip = () => {
        const defaultOption = scene.options[0];
        onComplete({
            selectedOption: defaultOption.id,
            consequence: defaultOption.consequence,
            justification: 'Teacher preview - skipped',
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border ${border} bg-[var(--lx-dark-glass)]`} style={{ borderRadius: '4px' }}>
                        <span className={`text-[10px] font-mono font-bold ${text} uppercase tracking-widest`}>
                            Phase 1
                        </span>
                        <span className="text-[var(--lx-dark-glass-border)] text-[10px]">•</span>
                        <span className="text-[10px] font-mono text-[var(--lx-text-inv)] uppercase tracking-wider">
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
                                    className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider px-2 py-1 border transition-all ${
                                        stage === s
                                            ? `${border} ${text} bg-[var(--lx-dark-glass)]`
                                            : 'border-[var(--lx-dark-glass-border)] text-[var(--lx-text-muted)]'
                                    } ${isTeacher ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                    style={{ borderRadius: '3px' }}
                                >
                                    <span className={`w-3 h-3 rounded-full border flex items-center justify-center text-[7px] font-bold ${
                                        stage === s ? `border-current bg-current/20` : 'border-slate-600'
                                    }`}>
                                        {i + 1}
                                    </span>
                                    {s}
                                </button>
                                {i < 2 && <ChevronRight className="w-2.5 h-2.5 text-slate-700" />}
                            </div>
                        ))}
                    </div>
                </div>

                {isTeacher && (
                    <span
                        className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-1 select-none"
                        style={{ borderRadius: '3px' }}
                    >
                        TEACHER MODE
                    </span>
                )}
            </div>

            {/* ── 3-column grid ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr_360px] gap-3 items-start">

                {/* ══════════════════════════════════════════════════════════
                    LEFT COLUMN: Mission Telemetry
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Panel label="Mission Telemetry" icon={Radio}>

                        {/* Real-time data stream */}
                        <div className="px-3.5 pt-3 pb-1">
                            <span className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase select-none">
                                Real-Time Data Stream
                            </span>
                        </div>

                        <MetricRow icon={Thermometer} label="Temp" value={temp.toFixed(1)} unit="°C" graph />
                        <MetricRow icon={Gauge}       label="Pressure" value={pressure.toFixed(1)} unit="kPa" graph />
                        <MetricRow icon={Zap}         label="Voltage" value={voltage.toFixed(1)} unit="V" graph />
                        <MetricRow icon={FlaskConical} label="pH" value={ph.toFixed(1)} unit="" highlight={ph > 7.4 || ph < 7.0} graph />

                        {/* Environment monitors */}
                        <div className="px-3.5 pt-3 pb-1 border-t border-[var(--lx-dark-glass-border)] mt-1">
                            <span className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase select-none">
                                Environment Monitors
                            </span>
                        </div>

                        {[
                            { label: 'Oxygen',    level: 'stable',   value: 'Stable'   },
                            { label: 'CO₂',       level: 'elevated', value: 'Elevated' },
                            { label: 'Bio-signs', level: 'normal',   value: 'Normal'   },
                            { label: 'Radiation', level: 'stable',   value: '0.04 mSv/h' },
                        ].map(({ label, level, value }) => (
                            <div key={label} className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--lx-dark-glass-border)]">
                                <div className="flex items-center gap-2">
                                    <StatusDot level={level} />
                                    <span className="text-[10px] font-mono text-slate-400">{label}</span>
                                </div>
                                <span className={`text-[10px] font-mono font-medium ${
                                    level === 'stable' || level === 'normal' ? 'text-emerald-400' :
                                    level === 'elevated' ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                    {value}
                                </span>
                            </div>
                        ))}

                        {/* System warnings */}
                        <div className="px-3.5 pt-3 pb-1 border-t border-[var(--lx-dark-glass-border)] mt-1">
                            <span className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase select-none">
                                System Warnings
                            </span>
                        </div>

                        <div className="px-3.5 py-3 space-y-2">
                            <motion.div
                                animate={{ opacity: [1, 0.6, 1] }}
                                transition={{ duration: 2.2, repeat: Infinity }}
                                className="flex items-start gap-2 p-2.5 bg-amber-500/8 border border-amber-500/25"
                                style={{ borderRadius: '4px' }}
                            >
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                                <span className="text-[9px] font-mono text-amber-300/80 leading-relaxed">
                                    ANOMALY_DETECTED: Parameter drift observed in subsystem
                                </span>
                            </motion.div>
                            <div className="flex items-start gap-2 p-2.5 bg-[var(--lx-dark-glass)] border border-[var(--lx-dark-glass-border)]" style={{ borderRadius: '4px' }}>
                                <ShieldAlert className="w-3 h-3 text-[var(--lx-text-muted)] shrink-0 mt-0.5" />
                                <span className="text-[9px] font-mono text-[var(--lx-text-muted)] leading-relaxed">
                                    SYS_CHECK: Analysis threshold monitoring active
                                </span>
                            </div>
                        </div>

                        {/* Stage indicator */}
                        <div className="px-3.5 py-2.5 border-t border-[var(--lx-dark-glass-border)] bg-[var(--lx-dark-glass)]/20">
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">Stage</span>
                                <span className={`text-[9px] font-mono font-bold ${text} uppercase tracking-wider`}>
                                    {stage}
                                </span>
                            </div>
                            <div className="mt-2 h-1 bg-[var(--lx-dark-glass)] overflow-hidden" style={{ borderRadius: '1px' }}>
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${accent}`}
                                    animate={{ width: stage === 'briefing' ? '33%' : stage === 'data' ? '66%' : '100%' }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </Panel>
                </motion.div>

                {/* ══════════════════════════════════════════════════════════
                    CENTER COLUMN: Analysis Workspace
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex flex-col gap-3"
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
                                className="flex flex-col gap-3"
                            >
                                <Panel label="Mission Briefing" icon={FileText}>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={`w-px h-8 bg-gradient-to-b ${accent}`} />
                                            <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">
                                                Incoming Transmission
                                            </span>
                                        </div>
                                        <p className="text-slate-200 leading-relaxed text-sm font-mono min-h-[120px]">
                                            {displayedNarrative}
                                            <motion.span
                                                className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 align-middle"
                                                animate={{ opacity: [1, 0, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                            />
                                        </p>
                                    </div>
                                </Panel>

                                {/* Auto-advance timer bar */}
                                {!isTeacher && (
                                    <div className="flex items-center gap-3 px-1">
                                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Processing</span>
                                        <div className="flex-1 h-[2px] bg-slate-800 overflow-hidden" style={{ borderRadius: '1px' }}>
                                            <motion.div
                                                className={`h-full bg-gradient-to-r ${accent}`}
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 5, ease: 'linear' }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Auto-advance</span>
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
                                className="flex flex-col gap-3"
                            >
                                <Panel label="Data Analysis" icon={BarChart3}>
                                    <div className="p-5">
                                        {sceneDataTable ? (
                                            <div className="overflow-hidden border border-[var(--lx-dark-glass-border)]" style={{ borderRadius: '4px' }}>
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b border-[var(--lx-dark-glass-border)] bg-[var(--lx-dark-glass)]">
                                                            {sceneDataTable.headers.map((h) => (
                                                                <th key={h} className="px-3 py-2.5 text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sceneDataTable.rows.map((row, rIdx) => (
                                                            <motion.tr
                                                                key={`${rIdx}-${row[0]}`}
                                                                initial={{ opacity: 0, x: -8 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: rIdx * 0.08, duration: 0.3 }}
                                                                className="border-b border-[var(--lx-dark-glass-border)] hover:bg-[var(--lx-dark-glass-hover)]/20"
                                                            >
                                                                {row.map((cell, cIdx) => (
                                                                    <td key={`${rIdx}-${cIdx}`} className={`px-3 py-2.5 text-sm ${cIdx === 0 ? 'text-white font-medium' : 'text-slate-300'}`}>
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="py-6 text-center">
                                                <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                                <p className="text-slate-500 text-sm">Qualitative analysis — review observations below.</p>
                                            </div>
                                        )}

                                        {sceneDataNotes.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {sceneDataNotes.map((note, i) => (
                                                    <div key={i} className="flex items-start gap-2 p-2.5 bg-[var(--lx-dark-glass)] border border-[var(--lx-dark-glass-border)]" style={{ borderRadius: '4px' }}>
                                                        <Eye className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                                                        <p className="text-xs text-slate-400 leading-relaxed">{note}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Narrative summary */}
                                        <div className="mt-4 p-3.5 bg-[var(--lx-dark-glass)] border-l-2 border-[var(--lx-accent)]/50">
                                            <p className="text-slate-300 text-sm leading-relaxed">{scene.narrative}</p>
                                        </div>
                                    </div>
                                </Panel>
                            </motion.div>
                        )}

                        {/* DECISION stage: center shows visualization + objective */}
                        {stage === 'decision' && (
                            <motion.div
                                key="decision-center"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-3"
                            >
                                <Panel label="Problem Area Visualization" icon={Eye}>
                                    <div className="p-4 flex items-center justify-center min-h-[220px]">
                                        <ScenarioVisual
                                            scenarioId={scenarioId}
                                            sceneIndex={0}
                                            avatar={scene.avatar}
                                            title={scene.title}
                                        />
                                    </div>
                                    <div className="px-4 pb-4">
                                        <p className="text-slate-400 text-sm leading-relaxed">{scene.narrative}</p>
                                    </div>
                                </Panel>

                                {scene.learningObjective && (
                                    <div className={`flex items-start gap-3 p-3.5 border ${border} hud-panel`} style={{ borderRadius: '6px' }}>
                                        <Target className={`w-4 h-4 ${text} shrink-0 mt-0.5`} />
                                        <div>
                                            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase block mb-1">Learning Objective</span>
                                            <p className={`text-sm ${text} font-medium leading-relaxed`}>{scene.learningObjective}</p>
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
                                className={`w-full bg-gradient-to-r ${accent} font-mono tracking-wider uppercase text-sm`}
                            >
                                {stage === 'briefing' ? 'Proceed to Data Analysis' : 'Begin Decision Phase'}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}
                </motion.div>

                {/* ══════════════════════════════════════════════════════════
                    RIGHT COLUMN: Decision Engine
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
                                <Panel label="Decision Engine" dimmed>
                                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
                                        <motion.div
                                            className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center bg-slate-800/60"
                                            animate={{ boxShadow: ['0 0 0 0px rgba(148,163,184,0.1)', '0 0 0 8px rgba(148,163,184,0)', '0 0 0 0px rgba(148,163,184,0)'] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Lock className="w-5 h-5 text-slate-600" />
                                        </motion.div>
                                        <div>
                                            <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">Decision Locked</p>
                                            <p className="text-slate-600 text-sm">Complete the {stage === 'briefing' ? 'mission briefing' : 'data analysis'} to unlock the decision interface.</p>
                                        </div>

                                        {/* Pulsing dots */}
                                        <div className="flex items-center gap-1 mt-2">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-slate-700"
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
                                <Panel label="Decision Engine" icon={Target}>
                                    <div className="p-4 space-y-4">

                                        {/* Think timer */}
                                        <AnimatePresence>
                                            {showThinkTimer && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex items-center justify-between p-3 bg-amber-500/8 border border-amber-500/25" style={{ borderRadius: '4px' }}>
                                                        <div className="flex items-center gap-2">
                                                            <Timer className="w-3.5 h-3.5 text-amber-400" />
                                                            <span className="text-[10px] font-mono text-amber-300 tracking-wider uppercase">Critical Thinking Phase</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">{thinkTime}s</span>
                                                            {isTeacher && (
                                                                <button
                                                                    onClick={() => setShowThinkTimer(false)}
                                                                    className="text-[9px] text-amber-500/70 hover:text-amber-400 font-mono"
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
                                        <div className="p-3.5 border border-red-500/20 bg-red-500/5" style={{ borderRadius: '4px' }}>
                                            <div className="flex items-center gap-1.5 mb-2.5">
                                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                                <span className="text-[9px] font-mono text-red-400 tracking-widest uppercase font-bold">Critical Question</span>
                                            </div>
                                            <p className="text-white font-semibold leading-snug text-sm">{scene.question}</p>
                                        </div>

                                        {/* Scientific justification textarea */}
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <FileText className="w-3 h-3 text-slate-400" />
                                                <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">Scientific Justification</span>
                                            </div>
                                            <div className="relative">
                                                <textarea
                                                    value={justification}
                                                    onChange={e => setJustification(e.target.value)}
                                                    placeholder={scene.justificationStarter || 'Enter your scientific reasoning using evidence from the data...'}
                                                    rows={3}
                                                    className="glass-input-dark w-full text-sm leading-relaxed px-3.5 py-3 resize-none focus:outline-none font-mono"
                                                    style={{ borderRadius: '4px' }}
                                                />
                                                {/* Classified watermark */}
                                                <span className="absolute bottom-2 right-3 text-[8px] font-mono text-slate-700 uppercase tracking-widest pointer-events-none select-none">
                                                    MISSION_LOG
                                                </span>
                                            </div>
                                            {!isTeacher && justification.length > 0 && justification.length < 15 && (
                                                <p className="text-[10px] font-mono text-amber-500/70 mt-1">
                                                    {15 - justification.length} more characters required
                                                </p>
                                            )}
                                        </div>

                                        {/* Answer options */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">
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
                                                        className={`w-full text-left flex items-start gap-3 p-3.5 border transition-all duration-200 ${
                                                            isSelected
                                                                ? 'border-cyan-400/60 bg-cyan-500/8 shadow-[0_0_16px_-4px_rgba(6,182,212,0.25)]'
                                                                : 'border-[var(--lx-dark-glass-border)] bg-[var(--lx-dark-glass)] hover:border-[var(--lx-accent)]/40 hover:bg-[var(--lx-dark-glass-hover)]'
                                                        }`}
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <span className={`shrink-0 w-6 h-6 rounded border flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
                                                            isSelected
                                                                ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                                                                : 'border-[var(--lx-dark-glass-border)] text-[var(--lx-text-muted)]'
                                                        }`}>
                                                            {letter}
                                                        </span>
                                                        <span className={`text-sm leading-snug transition-colors ${isSelected ? 'text-white' : 'text-[var(--lx-text-inv)]'}`}>
                                                            {optText}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        {/* Confidence note if no selection */}
                                        {!selectedOption && (
                                            <p className="text-[10px] font-mono text-slate-600 text-center">
                                                — Select a response to activate submission —
                                            </p>
                                        )}

                                        {/* CONFIRM DECISION */}
                                        <Button
                                            onClick={handleContinue}
                                            disabled={!canSubmit}
                                            size="lg"
                                            className={`w-full bg-gradient-to-r ${accent} font-mono tracking-widest uppercase disabled:opacity-40`}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Confirm Decision
                                        </Button>

                                        {/* Teacher skip */}
                                        {isTeacher && (
                                            <Button
                                                variant="outline"
                                                onClick={handleTeacherSkip}
                                                className="w-full border-dashed border-purple-500/40 text-purple-400 hover:bg-purple-500/10 font-mono text-xs"
                                            >
                                                Skip to Consequences (Teacher)
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
