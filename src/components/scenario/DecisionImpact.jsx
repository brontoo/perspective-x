import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, AlertTriangle, CheckCircle2, ChevronRight, Cpu,
    FileText, Key, Lock, RefreshCw, Settings, Shield, Video,
} from 'lucide-react';
import ScenarioVisual from './ScenarioVisual';
import { ScenarioLearningObjective } from './ScenarioPrimitives';
import { toMetricRows } from './scenarioHelpers';
import useTypewriter from './useTypewriter';
import { evaluateScenarioOutcome } from './scenarioAnswerKey';

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */



function BlueprintGrid({ opacity = 0.03, color = '#06b6d4', id = 'di-grid' }) {
    return (
        <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
            <svg width="100%" height="100%">
                <defs>
                    <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke={color} strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${id})`} />
            </svg>
        </div>
    );
}

function Section({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay }}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUCCESS EXCLUSIVES
───────────────────────────────────────────────────────────────────────────── */

/* Particle burst — fires once on mount */
const BURST = Array.from({ length: 32 }, (_, i) => {
    const angle = (i / 32) * 360 + ((i % 4) - 1.5) * 6;
    const rad = (angle * Math.PI) / 180;
    const dist = 90 + (i % 6) * 20;
    return {
        id: i,
        dx: Math.cos(rad) * dist,
        dy: Math.sin(rad) * dist,
        size: 3 + (i % 4),
        color: ['#10b981','#34d399','#6ee7b7','#fbbf24','#fde68a'][i % 5],
        delay: (i % 10) * 0.035,
    };
});

function ParticleBurst() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {BURST.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{ width: p.size, height: p.size, background: p.color, left: '50%', top: '32%' }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0 }}
                    transition={{ duration: 1.1, delay: p.delay, ease: 'easeOut' }}
                />
            ))}
        </div>
    );
}

/* Circular progress (SVG) */
function CircleProgress({ pct = 99.8, color = '#10b981' }) {
    const r = 26;
    const C = 2 * Math.PI * r;
    return (
        <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
            <motion.circle
                cx="34" cy="34" r={r}
                fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: C * (1 - pct / 100) }}
                transition={{ duration: 1.6, delay: 0.8, ease: 'easeOut' }}
                transform="rotate(-90 34 34)"
            />
            <text x="34" y="38" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold" fontFamily="monospace">
                {pct}%
            </text>
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FAILURE EXCLUSIVES
───────────────────────────────────────────────────────────────────────────── */

/* Unstable waveform sparkline */
function UnstableGraph({ color = '#ef4444' }) {
    const raw = [22, 48, 11, 64, 28, 74, 14, 52, 40, 82, 16, 56, 33, 70, 20, 67, 26, 79, 13, 58, 44, 73];
    const w = 116, h = 36;
    const mn = Math.min(...raw), mx = Math.max(...raw);
    const pts = raw.map((v, i) => `${(i / (raw.length - 1)) * w},${h - ((v - mn) / (mx - mn)) * h}`).join(' ');
    return (
        <svg width={w} height={h}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.85" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOG LEVEL COLOURS
───────────────────────────────────────────────────────────────────────────── */
const LOG_COLOR = {
    INFO:     'text-cyan-400',
    WARN:     'text-amber-400',
    CRITICAL: 'text-red-400',
    ERROR:    'text-red-400',
    SUCCESS:  'text-emerald-400',
    DATA:     'text-slate-500',
};

/* ═════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════════════════════════════════════ */

export default function DecisionImpact({
    scenario,
    scenarioId,
    consequenceKey,
    theme = {},
    isTeacher = false,
    onComplete,
    onRetry,
    onRewatch,
}) {
    const scene2 = scenario.scenes[2];

    const consequence = consequenceKey && scene2?.consequences?.[consequenceKey]
        ? scene2.consequences[consequenceKey]
        : Object.values(scene2?.consequences || {})[0] || null;

    const [showReflect, setShowReflect] = useState(false);
    const [followUpAnswer, setFollowUpAnswer] = useState('');
    const [impactRevealed, setImpactRevealed] = useState(false);

    const outcomeText = useTypewriter(consequence?.outcome || '');
    const outcomeTyping = outcomeText.length < (consequence?.outcome || '').length;

    const metricRows = scene2?.data?.table?.rows?.length
        ? scene2.data.table.rows
        : toMetricRows(consequence?.newData);

    /* CRITICAL: preserve as-is */
    const outcome = evaluateScenarioOutcome(scenarioId, consequenceKey);

    const handleSubmitReflection = () => setImpactRevealed(true);

    const handleProceedToExitTicket = () => {
        onComplete({
            scene3: {
                followUpAnswer,
                consequence: consequenceKey,
                consequenceData: consequence,
            },
        });
    };

    const handleTeacherSkip = () => {
        onComplete({
            scene3: {
                followUpAnswer: 'Teacher preview – skipped',
                consequence: consequenceKey,
                consequenceData: consequence,
            },
        });
    };

    /* System log entries */
    const logEntries = useMemo(() => {
        const now = new Date();
        const ts = (off) => {
            const d = new Date(now.getTime() - (20 - off) * 1000);
            return `[${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}]`;
        };
        return [
            { t: ts(0),  level: 'INFO',                                   msg: `Decision '${consequenceKey || 'option'}' executed.` },
            { t: ts(2),  level: 'WARN',                                   msg: 'Pressure spike detected in containment field.' },
            { t: ts(4),  level: outcome.isSuccess ? 'INFO' : 'CRITICAL',  msg: outcome.isSuccess ? 'Field stabilizing.' : 'Containment fluctuations detected.' },
            { t: ts(7),  level: 'INFO',                                   msg: outcome.isSuccess ? 'Relief sequence initiated...' : 'Emergency override triggered...' },
            { t: ts(9),  level: outcome.isSuccess ? 'SUCCESS' : 'ERROR',  msg: outcome.isSuccess ? `Valve 'RV-01' activated.` : 'Override failed — cascade risk.' },
            { t: ts(11), level: 'INFO',                                   msg: outcome.isSuccess ? 'Parameters normalizing.' : 'Instability at critical level.' },
            { t: ts(13), level: 'INFO',                                   msg: 'Integrity checks complete.' },
            { t: ts(15), level: 'INFO',                                   msg: 'Logs archived for analysis.' },
        ];
    }, [consequenceKey, outcome.isSuccess]);

    const statusColor = outcome.isSuccess
        ? 'text-emerald-400 border-emerald-400/50 bg-emerald-500/10'
        : 'text-red-400 border-red-400/50 bg-red-500/10';

    return (
        <div className="max-w-[1280px] mx-auto px-4 py-4 pb-16">

            {/* Phase label */}
            <div className="flex items-center gap-3 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-600 tracking-widest uppercase select-none">
                    Phase 3 :: System Response Log
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-200/60 to-transparent" />
            </div>

            {/* ══════════════  STAGE 1: CONSEQUENCE REVEAL  ══════════════ */}
            {!showReflect && !impactRevealed && (
                <Section>
                    <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4 items-start">

                        {/* LEFT: System logs */}
                        <div className="hud-panel border border-cyan-500/15 relative overflow-hidden" style={{ borderRadius: '6px', minHeight: '420px' }}>

                            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white/40">
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-3 h-3 text-cyan-500" />
                                    <span className="text-[9px] font-mono text-cyan-500 tracking-widest uppercase select-none">Response Logs</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] font-mono text-slate-500">LIVE</span>
                                </div>
                            </div>

                            <div className="p-3 space-y-2">
                                {logEntries.map((entry, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.2, duration: 0.18 }}
                                        className="flex gap-1.5 items-start"
                                    >
                                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] shrink-0 tabular-nums">{entry.t}</span>
                                        <span className={`text-[9px] font-mono font-bold shrink-0 ${LOG_COLOR[entry.level] || 'text-[var(--lx-text-muted)]'}`}>{entry.level}:</span>
                                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] leading-tight">{entry.msg}</span>
                                    </motion.div>
                                ))}
                                <motion.div
                                    className="flex items-center gap-1 pt-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: logEntries.length * 0.2 + 0.3 }}
                                >
                                    <span className="text-[9px] font-mono text-[var(--lx-text-muted)]">›</span>
                                    <span className="w-1.5 h-3 bg-cyan-500" />
                                </motion.div>
                            </div>
                        </div>

                        {/* RIGHT: Consequence analysis */}
                        <div className="flex flex-col gap-4">

                            {/* Visual + status */}
                            <div className="hud-panel border border-cyan-500/15 relative overflow-hidden" style={{ borderRadius: '6px' }}>
                                <div className="h-32 overflow-hidden">
                                    <ScenarioVisual
                                        scenarioId={scenarioId}
                                        sceneIndex={2}
                                        avatar={scene2?.avatar || scenario.character?.avatar}
                                        title={scene2?.title}
                                    />
                                </div>
                                <div className="p-4">
                                    <div className={`inline-flex items-center gap-2 border px-3 py-1 mb-4 text-[10px] font-mono font-bold tracking-widest uppercase ${statusColor}`} style={{ borderRadius: '3px' }}>
                                        <Activity className="w-3 h-3" />
                                        System Status: {outcome.isSuccess ? 'STABLE' : 'CRITICAL'}
                                    </div>
                                    <div className="min-h-[60px] mb-3">
                                        <p className="text-slate-800 text-sm leading-relaxed">
                                            {outcomeText}
                                            {outcomeTyping && <span className="inline-block w-1.5 h-4 bg-cyan-500 ml-0.5" />}
                                        </p>
                                    </div>
                                    {consequence?.message && (
                                        <div className="border-l-2 border-cyan-500/60 pl-3">
                                            <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mb-0.5">OUTCOME</div>
                                            <p className="text-[11px] font-mono text-cyan-600">{consequence.message}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scientific explanation */}
                            {consequence?.newData && (
                                <div className="hud-panel border border-cyan-500/15 relative p-4 overflow-hidden" style={{ borderRadius: '6px' }}>
                                    <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-2 select-none">Scientific Explanation</div>
                                    <p className="text-sm text-slate-800 leading-relaxed">{consequence.newData}</p>
                                </div>
                            )}

                            {/* Metric data */}
                            {metricRows.length > 0 && (
                                <div className="hud-panel border border-cyan-500/15 relative overflow-hidden" style={{ borderRadius: '6px' }}>
                                    <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase p-3 pb-0 select-none">Observation Data</div>
                                    <div className="overflow-x-auto p-3 pt-2">
                                        <table className="w-full text-xs border-collapse">
                                            <tbody>
                                                {metricRows.map((row, i) => (
                                                    <motion.tr
                                                        key={i}
                                                        initial={{ opacity: 0, x: -4 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.07 }}
                                                        className="border-b border-slate-200 last:border-0"
                                                    >
                                                        {row.map((cell, j) => (
                                                            <td key={j} className={`py-1.5 px-2 text-[11px] font-mono ${j === 0 ? 'text-[var(--lx-text-muted)]' : 'text-slate-800 font-semibold'}`}>{cell}</td>
                                                        ))}
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.4 }}
                                className="flex flex-col gap-2"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setShowReflect(true)}
                                    className="liquid-btn-accent w-full relative overflow-hidden py-4 font-bold text-sm tracking-widest uppercase group"
                                    style={{ borderRadius: '4px' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                    <div className="relative flex items-center justify-center gap-2">
                                        <ChevronRight className="w-4 h-4" />
                                        Continue to Reflection
                                    </div>
                                </motion.button>
                                {isTeacher && (
                                    <button
                                        onClick={handleTeacherSkip}
                                        className="w-full py-2 text-[10px] font-mono text-purple-400 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                                        style={{ borderRadius: '4px' }}
                                    >
                                        SKIP_PREVIEW :: Teacher
                                    </button>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </Section>
            )}

            {/* ══════════════  STAGE 2: REFLECTION  ══════════════ */}
            <AnimatePresence>
                {showReflect && !impactRevealed && (
                    <Section delay={0.04}>
                        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4 items-start">

                            {/* Frozen log */}
                            <div className="hud-panel border border-cyan-500/15 relative overflow-hidden opacity-50" style={{ borderRadius: '6px', minHeight: '260px' }}>
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200">
                                    <Cpu className="w-3 h-3 text-[var(--lx-text-muted)]" />
                                    <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">Response Logs</span>
                                </div>
                                <div className="p-3 space-y-2">
                                    {logEntries.slice(0, 6).map((entry, i) => (
                                        <div key={i} className="flex gap-1.5">
                                            <span className="text-[9px] font-mono text-[var(--lx-text-muted)] shrink-0">{entry.t}</span>
                                            <span className="text-[9px] font-mono text-[var(--lx-text-muted)] leading-tight">{entry.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reflection panel */}
                            <div className="hud-panel border border-cyan-500/15 relative p-5 overflow-hidden" style={{ borderRadius: '6px' }}>

                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 relative z-10">
                                    <div className="p-1.5 bg-[var(--lx-glass)] border border-slate-200" style={{ borderRadius: '3px' }}>
                                        <FileText className="w-3.5 h-3.5 text-cyan-500" />
                                    </div>
                                    <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">Reflection Prompt</span>
                                </div>

                                {scene2?.followUpQuestion && (
                                    <div className="border-l-2 border-cyan-500/60 pl-3 mb-4 relative z-10">
                                        <p className="text-slate-800 text-base leading-relaxed">{scene2.followUpQuestion}</p>
                                    </div>
                                )}

                                <textarea
                                    value={followUpAnswer}
                                    onChange={e => setFollowUpAnswer(e.target.value)}
                                    placeholder="Type your reflection on what happened and why…"
                                    className="relative z-10 glass-input-dark w-full text-sm p-3 resize-none mb-4"
                                    style={{ borderRadius: '4px', minHeight: '120px' }}
                                />

                                {(scene2?.learningObjective || scenario.scenes[0]?.learningObjective) && (
                                    <ScenarioLearningObjective
                                        value={scene2?.learningObjective || scenario.scenes[0]?.learningObjective}
                                        border="border-cyan-500/30"
                                        text="text-cyan-400"
                                        className="mb-4 relative z-10"
                                    />
                                )}

                                <motion.button
                                    whileHover={followUpAnswer.length >= 20 || isTeacher ? { scale: 1.01 } : {}}
                                    whileTap={followUpAnswer.length >= 20 || isTeacher ? { scale: 0.99 } : {}}
                                    onClick={followUpAnswer.length >= 20 || isTeacher ? handleSubmitReflection : undefined}
                                    disabled={followUpAnswer.length < 20 && !isTeacher}
                                    className={`relative z-10 w-full overflow-hidden py-4 font-bold text-sm tracking-widest uppercase group transition-all ${
                                        followUpAnswer.length >= 20 || isTeacher
                                            ? 'liquid-btn-accent cursor-pointer'
                                            : 'bg-[var(--lx-glass)] text-[var(--lx-text-muted)] cursor-not-allowed border border-slate-200'
                                    }`}
                                    style={{ borderRadius: '4px' }}
                                >
                                    {(followUpAnswer.length >= 20 || isTeacher) && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                    )}
                                    <div className="relative flex items-center justify-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        View Impact Report
                                    </div>
                                </motion.button>

                                {followUpAnswer.length < 20 && !isTeacher && (
                                    <p className="text-[10px] font-mono text-[var(--lx-text-muted)] text-center mt-2">
                                        {20 - followUpAnswer.length} more characters required
                                    </p>
                                )}
                            </div>
                        </div>
                    </Section>
                )}
            </AnimatePresence>

            {/* ══════════════  STAGE 3: IMPACT ANALYSIS REVEAL  ══════════════ */}
            <AnimatePresence>
                {impactRevealed && (
                    outcome.isSuccess ? (
                        <ImpactSuccess
                            outcome={outcome}
                            consequence={consequence}
                            metricRows={metricRows}
                            onProceed={handleProceedToExitTicket}
                        />
                    ) : (
                        <ImpactFailure
                            outcome={outcome}
                            consequence={consequence}
                            metricRows={metricRows}
                            onRetry={onRetry}
                            onRewatch={onRewatch}
                            onTeacherOverride={handleProceedToExitTicket}
                            isTeacher={isTeacher}
                        />
                    )
                )}
            </AnimatePresence>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════════════════
   SUCCESS STATE — "Analysis: Room Secured State"
   Chamber unlocked · golden key · celebration · green system lighting
═════════════════════════════════════════════════════════════════════════════ */

function ImpactSuccess({ outcome, consequence, metricRows, onProceed }) {
    const keyFactors = [
        'Correct identification of critical system anomaly',
        'Timely activation of emergency stabilization protocol',
        'Precise calibration based on observed scientific data',
        'Secure isolation of primary containment parameters',
    ];

    return (
        <Section delay={0.04}>
            {/* ── Outer chamber shell ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative overflow-hidden border border-emerald-500/20 bg-white/80 shadow-2xl"
                style={{ borderRadius: '10px' }}
            >
                {/* Ambient green glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/10" />
                </div>

                <BlueprintGrid opacity={0.015} color="#10b981" id="success-grid" />

                {/* ── Top classification bar ── */}
                <div className="relative z-10 flex items-center justify-between bg-emerald-600/95 backdrop-blur-sm px-6 py-3 border-b border-emerald-400/30">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        <span className="text-[11px] font-mono text-white tracking-widest uppercase select-none">
                            Scenario Completed Successfully!
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-emerald-200" />
                        <span className="text-[9px] font-mono text-emerald-200 tracking-widest">Success!</span>
                    </div>
                </div>

                <div className="relative z-10 p-8">

                    {/* ── Hero: Key + title ── */}
                    <div className="text-center mb-10">

                        {/* Key with pulsing rings */}
                        <div className="relative inline-flex items-center justify-center mb-6">
                            {/* Key icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', bounce: 0.5, delay: 0.15 }}
                                className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                            >
                                <span className="text-4xl select-none" role="img" aria-label="key">🗝️</span>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <h2 className="text-4xl font-bold text-emerald-600 mb-2 tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Scenario Completed!
                            </h2>
                            <p className="text-[var(--lx-text-muted)] text-sm font-mono tracking-widest uppercase mb-4">
                                Scenario Completed Successfully
                            </p>
                            {outcome.impactText && (
                                <p className="text-slate-800 text-base leading-relaxed max-w-2xl mx-auto font-medium">
                                    {outcome.impactText}
                                </p>
                            )}
                        </motion.div>
                    </div>

                    {/* ── Impact Analysis & Decision Breakdown ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        {/* Section header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                            <span className="text-[10px] font-mono text-emerald-600 tracking-widest uppercase px-3 select-none">
                                Impact Analysis
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/30 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Validation Metrics */}
                            <div className="hud-panel border border-emerald-500/15 p-5 bg-white/50" style={{ borderRadius: '6px' }}>
                                <div className="text-[9px] font-mono text-emerald-600 tracking-widest uppercase mb-4 select-none">Validation Metrics</div>
                                <div className="flex items-center gap-5 mb-5">
                                    <CircleProgress pct={99.8} color="#10b981" />
                                    <div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Success Rate</div>
                                        <div className="text-2xl font-bold text-emerald-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>99.8%</div>
                                    </div>
                                </div>
                                <div className="space-y-2.5 font-medium">
                                    {[
                                        'Containment Protocol: Activated',
                                        'Bio-agent Risk: Neutralized',
                                        'System Integrity: Restored',
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + i * 0.12 }}
                                            className="flex items-center gap-2.5"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span className="text-[12px] font-mono text-slate-800">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Factors */}
                            <div className="hud-panel border border-emerald-500/15 p-5 bg-white/50" style={{ borderRadius: '6px' }}>
                                <div className="text-[9px] font-mono text-emerald-600 tracking-widest uppercase mb-4 select-none">Key Factors</div>
                                <div className="space-y-3">
                                    {keyFactors.map((factor, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.85 + i * 0.12 }}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                                <span className="text-[9px] font-mono font-bold text-emerald-600">{i + 1}</span>
                                            </div>
                                            <span className="text-[12px] text-slate-800 leading-snug font-medium">{factor}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Status badges ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="flex flex-wrap justify-center gap-3 mb-8"
                    >
                        {[
                            { icon: Key,          label: 'Key Acquired',         color: 'border-amber-500/20 bg-amber-500/10 text-amber-600 font-semibold' },
                            { icon: Shield,        label: 'Chamber Access: Granted', color: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 font-semibold' },
                            { icon: CheckCircle2, label: 'Scenario Completed',      color: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-600 font-semibold' },
                        ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className={`flex items-center gap-2 border px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase ${color}`} style={{ borderRadius: '3px' }}>
                                <Icon className="w-3 h-3" />
                                {label}
                            </div>
                        ))}
                    </motion.div>

                    {/* ── Next Steps + CTA ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase select-none">Next Steps</span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 to-transparent" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={onProceed}
                                className="relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 font-bold text-sm tracking-widest uppercase group transition-colors shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                style={{ borderRadius: '4px', minWidth: '300px' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                <div className="relative flex items-center justify-center gap-2">
                                    <ChevronRight className="w-4 h-4" />
                                    Proceed to Final Check
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </Section>
    );
}

/* ═════════════════════════════════════════════════════════════════════════════
   FAILURE STATE — "Analysis: System Unstable State"
   Access denied · red padlock · alarm · warning triangles
═════════════════════════════════════════════════════════════════════════════ */

function ImpactFailure({ outcome, consequence, metricRows, onRetry, onRewatch, onTeacherOverride, isTeacher }) {
    const errorItems = [
        { label: 'Containment Field Integrity', val: '12%' },
        { label: 'Potential Data Loss Risk', val: 'HIGH' },
        { label: 'Energy Surge Detected', val: 'SECTOR 4' },
        { label: 'Atmospheric Stabilizer', val: 'FAILURE' },
    ];

    return (
        <Section delay={0.04}>
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative overflow-hidden border border-red-500/20 bg-white/80 shadow-2xl"
                style={{ borderRadius: '10px' }}
            >
                {/* Ambient red/orange danger glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-white to-orange-50/10" />
                </div>

                <BlueprintGrid opacity={0.01} color="#ef4444" id="failure-grid" />

                {/* ── Top classification bar ── */}
                <div className="relative z-10 flex items-center justify-between bg-red-600/90 backdrop-blur-sm px-6 py-3 border-b border-red-500/30">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        <span className="text-[11px] font-mono text-white tracking-widest uppercase select-none">
                            Reassessment Needed
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-200" />
                        <span className="text-[9px] font-mono text-amber-200 tracking-widest">Needs Attention</span>
                    </div>
                </div>

                <div className="relative z-10 p-8">

                    {/* ── Hero: Padlock + title ── */}
                    <div className="text-center mb-10">

                        {/* Padlock with danger pulse */}
                        <div className="relative inline-flex items-center justify-center mb-6">
                            {/* Danger pulse rings */}
                            {[0, 1].map(i => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full border border-red-500/40"
                                    animate={{
                                        width: [80, 80 + 50 * (i + 1)],
                                        height: [80, 80 + 50 * (i + 1)],
                                        opacity: [0.7, 0],
                                    }}
                                    transition={{ duration: 1.4, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
                                />
                            ))}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', bounce: 0.4, delay: 0.15 }}
                                className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-red-900/80 to-slate-900 border-2 border-red-500/60 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                            >
                                <Lock className="w-9 h-9 text-red-400" />
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <h2 className="text-4xl font-bold text-red-600 mb-2 tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Reassessment Needed
                            </h2>
                            <p className="text-[var(--lx-text-muted)] text-sm font-mono tracking-widest uppercase mb-4">
                                Unintended Consequences
                            </p>
                            {outcome.impactText && (
                                <p className="text-slate-800 text-base leading-relaxed max-w-2xl mx-auto">
                                    {outcome.impactText}
                                </p>
                            )}
                        </motion.div>
                    </div>

                    {/* ── Impact Analysis ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />
                            <span className="text-[10px] font-mono text-red-600 tracking-widest uppercase px-3 select-none">
                                Impact Analysis
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/25 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Negative Consequences */}
                            <div className="hud-panel border border-red-500/25 p-5 bg-white/50" style={{ borderRadius: '6px' }}>
                                <div className="text-[9px] font-mono text-red-600 tracking-widest uppercase mb-4 select-none">System Consequences</div>
                                <div className="space-y-3">
                                    {errorItems.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.75 + i * 0.1 }}
                                            className="flex items-center justify-between py-1.5 border-b border-red-100 last:border-0"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="text-[12px] font-mono text-slate-800">{item.label}</span>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-red-500">{item.val}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Scientific Error Report */}
                            <div className="hud-panel border border-red-500/25 p-5 bg-white/50" style={{ borderRadius: '6px' }}>
                                <div className="text-[9px] font-mono text-red-600 tracking-widest uppercase mb-4 select-none">Scientific Error Report</div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Error Code', val: 'ISO-994 Decay Miscalculation', graph: false },
                                        { label: 'Core Temperature', val: 'CRITICAL (3500°C)', graph: true, color: '#ef4444' },
                                        { label: 'Variable Imbalance', val: 'Unstable Isotope Ratio', graph: true, color: '#f59e0b' },
                                        { label: 'Primary Reactor', val: 'OFFLINE', graph: false, icon: true },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + i * 0.12 }}
                                            className="flex flex-col gap-1.5 border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[12px] font-mono text-slate-600">{item.label}</span>
                                                <span className={`text-[12px] font-mono font-bold ${item.color ? '' : 'text-slate-800'}`} style={{ color: item.color }}>
                                                    {item.val}
                                                </span>
                                            </div>
                                            {item.graph && (
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: item.label.includes('Temperature') ? '90%' : '75%',
                                                            backgroundColor: item.color || '#ef4444'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Action buttons ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.25 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {onRetry && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={onRetry}
                                className="relative overflow-hidden bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 font-bold text-sm tracking-widest uppercase group transition-colors shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                                style={{ borderRadius: '4px', minWidth: '220px' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                <div className="relative flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Review Scenario
                                </div>
                            </motion.button>
                        )}
                        {onRewatch && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={onRewatch}
                                className="relative overflow-hidden border border-red-500/50 bg-red-50/20 hover:bg-red-50/40 text-red-600 hover:text-red-500 px-8 py-4 font-bold text-sm tracking-widest uppercase group transition-colors"
                                style={{ borderRadius: '4px', minWidth: '220px' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                <div className="relative flex items-center justify-center gap-2">
                                    <Video className="w-4 h-4" />
                                    Watch Briefing Again
                                </div>
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Teacher override */}
                    {isTeacher && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="text-center mt-5"
                        >
                            <button
                                onClick={onTeacherOverride}
                                className="px-5 py-2 text-[10px] font-mono text-purple-400 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                                style={{ borderRadius: '4px' }}
                            >
                                OVERRIDE :: Proceed to Final Check (Teacher)
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </Section>
    );
}
