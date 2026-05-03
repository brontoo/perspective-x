import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, AlertTriangle, Cpu, Gauge,
    Play, Shield, Timer, Zap,
} from 'lucide-react';
import { ScenarioVisualPanel } from './ScenarioPrimitives';
import useTypewriter from './useTypewriter';

/* ── Inline micro-helpers ─────────────────────────────────────────────────── */

function useAnimatedValue(base, spread = 0.04, ms = 700) {
    const [val, setVal] = useState(base);
    useEffect(() => {
        const id = setInterval(() =>
            setVal(parseFloat((base + (Math.random() * 2 - 1) * base * spread).toFixed(2))),
            ms
        );
        return () => clearInterval(id);
    }, [base, spread, ms]);
    return val;
}

function MiniGraph({ base, spread = 0.05, count = 22, color = '#06b6d4' }) {
    const [pts, setPts] = useState(() =>
        Array.from({ length: count }, () => base + (Math.random() * 2 - 1) * base * spread)
    );
    useEffect(() => {
        const id = setInterval(() =>
            setPts(p => [...p.slice(1), base + (Math.random() * 2 - 1) * base * spread]),
            420
        );
        return () => clearInterval(id);
    }, [base, spread]);
    const min = Math.min(...pts), max = Math.max(...pts);
    const norm = pts.map(v => (v - min) / ((max - min) || 1));
    const w = 64, h = 22;
    const pStr = norm.map((v, i) => `${(i / (count - 1)) * w},${h - v * h}`).join(' ');
    return (
        <svg width={w} height={h} className="opacity-70">
            <polyline points={pStr} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}

function StatusDot({ elevated }) {
    return (
        <span className="relative flex w-2 h-2 shrink-0">
            {elevated && <span className="animate-ping absolute inset-0 rounded-full bg-amber-400 opacity-60" />}
            <span className={`relative w-2 h-2 rounded-full ${elevated ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        </span>
    );
}

function HUDCorners({ color = 'border-cyan-300' }) {
    return (
        <>
            <span className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${color}`} />
            <span className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${color}`} />
            <span className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${color}`} />
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${color}`} />
        </>
    );
}

function BlueprintGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]">
            <svg width="100%" height="100%">
                <defs>
                    <pattern id="s2-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#s2-grid)" />
            </svg>
        </div>
    );
}

function Panel({ children, className = '' }) {
    return (
        <div className={`glass-card relative overflow-hidden ${className}`}>
            <HUDCorners />
            {children}
        </div>
    );
}

function MetricRow({ label, base, unit, elevated = false }) {
    const live = useAnimatedValue(base, 0.03);
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-[var(--lx-glass-border-sub)] last:border-0">
            <div className="flex items-center gap-1.5">
                <StatusDot elevated={elevated} />
                <span className="text-[10px] font-mono text-[var(--lx-text-muted)] uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <MiniGraph base={base} color={elevated ? '#f59e0b' : '#06b6d4'} />
                <span className="text-[11px] font-mono font-bold text-[var(--lx-text)] w-16 text-right">
                    {live}<span className="text-[8px] text-[var(--lx-text-muted)] ml-0.5">{unit}</span>
                </span>
            </div>
        </div>
    );
}

function ToggleIndicator({ on }) {
    return (
        <div className={`relative flex items-center w-12 h-6 rounded-full border transition-all duration-300 shrink-0 ${
            on ? 'bg-emerald-500/20 border-emerald-400' : 'bg-red-500/10 border-red-400/50'
        }`}>
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={`absolute w-4 h-4 rounded-full border shadow-sm ${
                    on ? 'bg-emerald-400 border-emerald-300' : 'bg-red-400/70 border-red-300/50'
                }`}
                style={{ left: on ? '1.75rem' : '0.25rem' }}
            />
            <span className={`absolute text-[7px] font-mono font-bold tracking-widest select-none ${
                on ? 'left-1.5 text-emerald-500' : 'right-1.5 text-red-400/70'
            }`}>{on ? 'ON' : 'OFF'}</span>
        </div>
    );
}

/* ══════════════════════════════════ MAIN ════════════════════════════════════ */

export default function SceneTwo({ scene, scenarioId, scenarioTitle: _scenarioTitle, onComplete, isTeacher = false, theme = {} }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [justification, setJustification] = useState('');
    const [showThinkTimer, setShowThinkTimer] = useState(true);
    const [thinkTime, setThinkTime] = useState(120);

    const displayedNarrative = useTypewriter(scene.narrative || '');

    useEffect(() => {
        if (showThinkTimer && thinkTime > 0) {
            const timer = setTimeout(() => setThinkTime(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (thinkTime === 0) {
            setShowThinkTimer(false);
        }
    }, [showThinkTimer, thinkTime]);

    const handleContinue = () => {
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

    const letters = ['A', 'B', 'C', 'D'];
    const canSubmit = selectedOption && (justification.length >= 10 || isTeacher);
    const timerPct = (thinkTime / 120) * 100;
    const timerColor = thinkTime > 60 ? '#06b6d4' : thinkTime > 30 ? '#f59e0b' : '#ef4444';

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="max-w-[1280px] mx-auto px-4 py-4 pb-12"
        >
            {/* ── Phase label row ── */}
            <div className="flex items-center gap-3 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono text-amber-600 tracking-widest uppercase select-none">
                    PHASE_02 :: TACTICAL_DECISION_CONTROL
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-200/60 to-transparent" />
                <div className="h-3 w-16 overflow-hidden opacity-40" style={{ borderRadius: '2px' }}>
                    <div className="h-full" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg,#f59e0b 0,#f59e0b 4px,transparent 4px,transparent 8px)',
                    }} />
                </div>
            </div>

            {/* ══════════════════  3-COLUMN GRID  ══════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr_360px] gap-4 items-start">

                {/* ═══════════ LEFT: MISSION TELEMETRY ═══════════ */}
                <div className="flex flex-col gap-3">

                    {/* System telemetry */}
                    <Panel className="p-3">
                        <BlueprintGrid />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--lx-glass-border-sub)]">
                                <div className="p-1 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)]" style={{ borderRadius: '3px' }}>
                                    <Gauge className="w-3 h-3 text-cyan-600" />
                                </div>
                                <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">LIVE_TELEMETRY</span>
                            </div>
                            <MetricRow label="TEMP" base={37.8} unit="°C" elevated />
                            <MetricRow label="PRESSURE" base={1.42} unit="atm" elevated />
                            <MetricRow label="VOLTAGE" base={4.7} unit="V" />
                            <MetricRow label="pH" base={6.8} unit="pH" />
                        </div>
                    </Panel>

                    {/* Environment monitors */}
                    <Panel className="p-3">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--lx-glass-border-sub)]">
                                <div className="p-1 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)]" style={{ borderRadius: '3px' }}>
                                    <Activity className="w-3 h-3 text-cyan-600" />
                                </div>
                                <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">ENV_MONITORS</span>
                            </div>
                            {[
                                { label: 'CONTAINMENT', val: 'NOMINAL', ok: true },
                                { label: 'BIO_HAZARD', val: 'ELEVATED', ok: false },
                                { label: 'POWER_GRID', val: 'CRITICAL', ok: false },
                                { label: 'INTEGRITY', val: '74%', ok: true },
                            ].map(({ label, val, ok }) => (
                                <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-1.5">
                                        <StatusDot elevated={!ok} />
                                        <span className="text-[10px] font-mono text-[var(--lx-text-muted)]">{label}</span>
                                    </div>
                                    <span className={`text-[10px] font-mono font-bold ${ok ? 'text-[var(--lx-success)]' : 'text-[var(--lx-warning)]'}`}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    {/* Active alerts */}
                    <Panel className="p-3">
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[9px] font-mono text-amber-500 tracking-widest uppercase">ACTIVE_ALERTS</span>
                        </div>
                        <div className="space-y-1.5">
                            {[
                                'Pressure deviation in sector 4',
                                'Bio-containment protocol breach',
                                'Power reroute required',
                            ].map((alert, i) => (
                                <div key={i} className="flex items-start gap-1.5 p-1.5 bg-[var(--lx-warning-soft)] border border-[var(--lx-warning)]/30" style={{ borderRadius: '3px' }}>
                                    <AlertTriangle className="w-2.5 h-2.5 text-[var(--lx-warning)] shrink-0 mt-0.5" />
                                    <span className="text-[9px] font-mono text-[var(--lx-warning)] leading-tight">{alert}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    {/* Zap indicator */}
                    <Panel className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-3 h-3 text-cyan-600" />
                            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">DECISION_REQUIRED</span>
                        </div>
                        <p className="text-[10px] font-mono text-[var(--lx-text-muted)] leading-relaxed">
                            System awaiting protocol selection. All personnel on standby.
                        </p>
                        <div className="mt-2 h-1 bg-[var(--lx-glass-border-sub)] overflow-hidden" style={{ borderRadius: '2px' }}>
                            <motion.div
                                className="h-full bg-amber-400"
                                animate={{ width: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </div>
                    </Panel>
                </div>

                {/* ═══════════ CENTER: ANALYSIS WORKSPACE ═══════════ */}
                <div className="flex flex-col gap-4 min-h-0">

                    {/* Scene badge */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 lx-divider" />
                        <div className="flex items-center gap-2 px-3 py-1 border border-[var(--lx-warning)]/40 bg-[var(--lx-warning-soft)]" style={{ borderRadius: '3px' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lx-warning)]" />
                            <span className="text-[9px] font-mono text-[var(--lx-warning)] tracking-widest uppercase">
                                {scene.title || 'SCENE_02 :: DECISION_POINT'}
                            </span>
                        </div>
                        <div className="flex-1 lx-divider" />
                    </div>

                    {/* Scenario visual */}
                    <Panel>
                        <div className="h-36 overflow-hidden">
                            <ScenarioVisualPanel
                                scenarioId={scenarioId}
                                sceneIndex={1}
                                avatar={scene.avatar}
                                title={scene.title}
                                subtitle={scene.question}
                                border="border-cyan-400/30"
                            />
                        </div>
                    </Panel>

                    {/* Narrative */}
                    <Panel className="p-4">
                        <BlueprintGrid />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--lx-glass-border-sub)]">
                                <div className="p-1 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)]" style={{ borderRadius: '3px' }}>
                                    <Cpu className="w-3 h-3 text-cyan-600" />
                                </div>
                                <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">SITUATION_UPDATE</span>
                                <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            </div>
                            <motion.div
                                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none"
                                initial={{ top: '0%' }}
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 6, ease: 'linear' }}
                            />
                            <div className="text-[var(--lx-text)] text-sm leading-relaxed min-h-[80px]">
                                {displayedNarrative}
                                {displayedNarrative.length < (scene.narrative || '').length && (
                                    <span className="inline-block w-1.5 h-4 bg-cyan-500 ml-0.5 animate-pulse" />
                                )}
                            </div>
                        </div>
                    </Panel>

                    {/* Evidence data table */}
                    {scene.data?.table?.rows?.length > 0 && (
                        <Panel className="p-4 overflow-hidden">
                            <div className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-3">MISSION_DATA</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse">
                                    {scene.data.table.headers && (
                                        <thead>
                                            <tr className="border-b border-[var(--lx-glass-border-sub)] bg-[var(--lx-glass)]">
                                                {scene.data.table.headers.map((h, i) => (
                                                    <th key={i} className="text-left py-1.5 px-2 text-[10px] font-mono text-[var(--lx-text-muted)] uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                    )}
                                    <tbody>
                                        {scene.data.table.rows.map((row, i) => (
                                            <motion.tr
                                                key={i}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                                className="border-b border-[var(--lx-glass-border-sub)] last:border-0 hover:bg-[var(--lx-glass-hover)]/30 transition-colors"
                                            >
                                                {row.map((cell, j) => (
                                                    <td key={j} className="py-1.5 px-2 text-[11px] font-mono text-[var(--lx-text)]">{cell}</td>
                                                ))}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>
                    )}
                </div>

                {/* ═══════════ RIGHT: DECISION ENGINE ═══════════ */}
                <div className="flex flex-col gap-3">

                    {/* Hazard-stripe header */}
                    <div className="overflow-hidden border border-[var(--lx-dark-glass-border)]" style={{ borderRadius: '6px' }}>
                        <div className="h-3.5" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg,#f59e0b 0,#f59e0b 6px,#1e293b 6px,#1e293b 12px)',
                        }} />
                        <div className="bg-[var(--lx-dark-glass)] px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase">DECISION_PROTOCOL</span>
                            </div>
                            {showThinkTimer && (
                                <div className="flex items-center gap-1.5">
                                    <Timer className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] font-mono tabular-nums" style={{ color: timerColor }}>
                                        {String(Math.floor(thinkTime / 60)).padStart(2, '0')}:{String(thinkTime % 60).padStart(2, '0')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timer progress bar */}
                    {showThinkTimer && (
                        <div className="h-0.5 overflow-hidden" style={{ borderRadius: '1px', backgroundColor: 'var(--lx-glass-border)' }}>
                            <motion.div
                                className="h-full transition-all duration-1000"
                                style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
                            />
                        </div>
                    )}

                    {/* Critical question */}
                    <div className="glass-panel p-3" style={{ borderRadius: '6px' }}>
                        <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-1.5 select-none">CRITICAL_QUESTION</div>
                        <p className="text-[13px] text-[var(--lx-text)] font-medium leading-snug">{scene.question}</p>
                    </div>

                    {/* Toggle option cards */}
                    <div className="space-y-2">
                        {scene.options.map(({ id, text, tags, ethical }, idx) => {
                            const isSelected = selectedOption?.id === id;
                            const letter = letters[idx] ?? String.fromCharCode(65 + idx);
                            return (
                                <motion.button
                                    key={id}
                                    whileHover={{ x: 2 }}
                                    onClick={() => setSelectedOption(scene.options.find(o => o.id === id))}
                                    className={`w-full text-left p-3 border transition-all ${
                                        isSelected
                                            ? 'border-cyan-400/60 bg-cyan-500/5 shadow-[0_0_16px_-4px_rgba(6,182,212,0.25)]'
                                            : 'glass-panel border-[var(--lx-glass-border-sub)] hover:border-[var(--lx-glass-border)]'
                                    }`}
                                    style={{ borderRadius: '5px' }}
                                >
                                    <div className="flex items-start gap-2.5">
                                        {/* Letter badge */}
                                        <span className={`shrink-0 w-6 h-6 rounded border text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                                            isSelected
                                                ? 'bg-cyan-500 border-cyan-400 text-white'
                                                : 'border-[var(--lx-glass-border)] text-[var(--lx-text-sub)] bg-[var(--lx-glass)]'
                                        }`}>{letter}</span>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] text-[var(--lx-text)] font-medium leading-snug mb-1.5">{text}</p>
                                            {Array.isArray(tags) && tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {tags.map(tag => (
                                                        <span key={tag} className="text-[9px] font-mono text-[var(--lx-text-muted)] border border-[var(--lx-glass-border-sub)] px-1.5 py-0.5 select-none" style={{ borderRadius: '2px', background: 'var(--lx-glass)' }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {ethical && (
                                                <span className={`text-[9px] font-mono ${
                                                    ethical === 'environmental' ? 'text-emerald-600' :
                                                    ethical === 'economic'     ? 'text-amber-600'   :
                                                    ethical === 'safety'       ? 'text-blue-600'    :
                                                    ethical === 'scientific'   ? 'text-purple-600'  :
                                                    'text-[var(--lx-text-muted)]'
                                                }`}>⬡ {ethical}</span>
                                            )}
                                        </div>

                                        <ToggleIndicator on={isSelected} />
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Justification — slides in after selection */}
                    <AnimatePresence>
                        {selectedOption && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="glass-panel p-3" style={{ borderRadius: '6px' }}>
                                    <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-2 select-none">
                                        JUSTIFICATION_FOR_SELECTED_PROTOCOL
                                    </div>
                                    <textarea
                                        value={justification}
                                        onChange={e => setJustification(e.target.value)}
                                        placeholder={scene.justificationStarter || 'Enter your reasoning here based on scientific principles and observed data…'}
                                        className="glass-input w-full text-[12px] p-2 resize-none"
                                        style={{ borderRadius: '4px', minHeight: '80px' }}
                                    />
                                    {justification.length < 10 && !isTeacher && (
                                        <p className="text-[10px] font-mono text-[var(--lx-text-muted)] mt-1">
                                            {10 - justification.length} more characters required
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Learning objective */}
                    {scene.learningObjective && (
                        <div className="glass-panel p-3" style={{ borderRadius: '6px' }}>
                            <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-1 select-none">LEARNING_OBJECTIVE</div>
                            <p className="text-[11px] text-[var(--lx-text-sub)] leading-relaxed">{scene.learningObjective}</p>
                        </div>
                    )}

                    {/* INITIATE PROTOCOL */}
                    <motion.button
                        whileHover={canSubmit ? { scale: 1.01 } : {}}
                        whileTap={canSubmit ? { scale: 0.99 } : {}}
                        onClick={canSubmit ? handleContinue : undefined}
                        disabled={!canSubmit}
                        className={`w-full relative overflow-hidden py-4 text-sm font-bold tracking-widest uppercase transition-all group ${
                            canSubmit
                                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white cursor-pointer'
                                : 'bg-[var(--lx-glass)] text-[var(--lx-text-muted)] cursor-not-allowed border border-[var(--lx-glass-border-sub)]'
                        }`}
                        style={{ borderRadius: '4px', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {canSubmit && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                        )}
                        <div className="relative flex items-center justify-center gap-2">
                            <Play className="w-3.5 h-3.5 fill-current" />
                            INITIATE_PROTOCOL
                        </div>
                    </motion.button>

                    {/* Teacher skip */}
                    {isTeacher && !selectedOption && (
                        <button
                            onClick={handleTeacherSkip}
                            className="w-full py-2 text-[10px] font-mono text-purple-400 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                            style={{ borderRadius: '4px' }}
                        >
                            SKIP_PREVIEW :: Teacher
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
