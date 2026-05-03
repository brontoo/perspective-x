import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, AlertTriangle, CheckCircle2, ChevronRight, Cpu,
    FileText, Key, Lock, RefreshCw, Settings, Shield,
    Star, Video, XCircle, Zap,
} from 'lucide-react';
import ScenarioVisual from './ScenarioVisual';
import { ScenarioLearningObjective } from './ScenarioPrimitives';
import { toMetricRows } from './scenarioHelpers';
import useTypewriter from './useTypewriter';
import { evaluateScenarioOutcome } from './scenarioAnswerKey';

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */

function HUDCorners({ color = 'border-cyan-400/60', size = 'w-4 h-4' }) {
    return (
        <>
            <span className={`absolute top-0 left-0 ${size} border-t-2 border-l-2 ${color}`} />
            <span className={`absolute top-0 right-0 ${size} border-t-2 border-r-2 ${color}`} />
            <span className={`absolute bottom-0 left-0 ${size} border-b-2 border-l-2 ${color}`} />
            <span className={`absolute bottom-0 right-0 ${size} border-b-2 border-r-2 ${color}`} />
        </>
    );
}

function ScanLine({ color = 'via-cyan-400/30' }) {
    return (
        <motion.div
            className={`absolute inset-x-0 h-px bg-gradient-to-r from-transparent ${color} to-transparent pointer-events-none z-10`}
            initial={{ top: '0%' }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
        />
    );
}

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
            <circle cx="34" cy="34" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
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
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono text-cyan-600 tracking-widest uppercase select-none">
                    PHASE_03 :: SYSTEM_RESPONSE_LOG
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-200/60 to-transparent" />
            </div>

            {/* ══════════════  STAGE 1: CONSEQUENCE REVEAL  ══════════════ */}
            {!showReflect && !impactRevealed && (
                <Section>
                    <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4 items-start">

                        {/* LEFT: System logs */}
                        <div className="hud-panel relative overflow-hidden" style={{ borderRadius: '6px', minHeight: '420px' }}>
                            <HUDCorners color="border-cyan-700/40" size="w-3 h-3" />
                            <ScanLine />

                            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--lx-dark-glass-border)] bg-[var(--lx-dark-glass-hover)]">
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-3 h-3 text-cyan-500" />
                                    <span className="text-[9px] font-mono text-cyan-400 tracking-widest uppercase select-none">SYSTEM_LOGS</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                                    <span className="w-1.5 h-3 bg-cyan-500 animate-pulse" />
                                </motion.div>
                            </div>
                        </div>

                        {/* RIGHT: Consequence analysis */}
                        <div className="flex flex-col gap-4">

                            {/* Visual + status */}
                            <div className="hud-panel relative overflow-hidden" style={{ borderRadius: '6px' }}>
                                <HUDCorners color="border-cyan-600/40" size="w-3 h-3" />
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
                                        SYSTEM_STATUS: {outcome.isSuccess ? 'STABLE' : 'CRITICAL'}
                                    </div>
                                    <div className="min-h-[60px] mb-3">
                                        <p className="text-[var(--lx-text-inv)] text-sm leading-relaxed">
                                            {outcomeText}
                                            {outcomeTyping && <span className="inline-block w-1.5 h-4 bg-cyan-500 ml-0.5 animate-pulse" />}
                                        </p>
                                    </div>
                                    {consequence?.message && (
                                        <div className="border-l-2 border-cyan-500/60 pl-3">
                                            <div className="text-[8px] font-mono text-slate-500 tracking-widest uppercase mb-0.5">OUTCOME</div>
                                            <p className="text-[11px] font-mono text-cyan-400">{consequence.message}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scientific explanation */}
                            {consequence?.newData && (
                                <div className="hud-panel relative p-4 overflow-hidden" style={{ borderRadius: '6px' }}>
                                    <HUDCorners color="border-slate-600/50" size="w-3 h-3" />
                                    <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-2 select-none">SCIENTIFIC_EXPLANATION</div>
                                    <p className="text-sm text-[var(--lx-text-inv)] leading-relaxed">{consequence.newData}</p>
                                </div>
                            )}

                            {/* Metric data */}
                            {metricRows.length > 0 && (
                                <div className="hud-panel relative overflow-hidden" style={{ borderRadius: '6px' }}>
                                    <HUDCorners color="border-slate-600/50" size="w-3 h-3" />
                                    <div className="text-[9px] font-mono text-slate-500 tracking-widest uppercase p-3 pb-0 select-none">OBSERVATION_DATA</div>
                                    <div className="overflow-x-auto p-3 pt-2">
                                        <table className="w-full text-xs border-collapse">
                                            <tbody>
                                                {metricRows.map((row, i) => (
                                                    <motion.tr
                                                        key={i}
                                                        initial={{ opacity: 0, x: -4 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.07 }}
                                                        className="border-b border-[var(--lx-dark-glass-border)] last:border-0"
                                                    >
                                                        {row.map((cell, j) => (
                                                            <td key={j} className={`py-1.5 px-2 text-[11px] font-mono ${j === 0 ? 'text-[var(--lx-text-muted)]' : 'text-[var(--lx-text-inv)] font-semibold'}`}>{cell}</td>
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
                                    style={{ borderRadius: '4px', fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                    <div className="relative flex items-center justify-center gap-2">
                                        <ChevronRight className="w-4 h-4" />
                                        CONTINUE_TO_ANALYSIS
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
                            <div className="hud-panel relative overflow-hidden opacity-50" style={{ borderRadius: '6px', minHeight: '260px' }}>
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--lx-dark-glass-border)]">
                                    <Cpu className="w-3 h-3 text-[var(--lx-text-muted)]" />
                                    <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">SYSTEM_LOGS</span>
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
                            <div className="hud-panel relative p-5 overflow-hidden" style={{ borderRadius: '6px' }}>
                                <HUDCorners color="border-cyan-600/40" size="w-3 h-3" />
                                <ScanLine />

                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--lx-dark-glass-border)] relative z-10">
                                    <div className="p-1.5 bg-[var(--lx-dark-glass)] border border-[var(--lx-dark-glass-border)]" style={{ borderRadius: '3px' }}>
                                        <FileText className="w-3.5 h-3.5 text-cyan-500" />
                                    </div>
                                    <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">ANALYSIS_QUERY</span>
                                </div>

                                {scene2?.followUpQuestion && (
                                    <div className="border-l-2 border-cyan-500/60 pl-3 mb-4 relative z-10">
                                        <p className="text-[var(--lx-text-inv)] text-base leading-relaxed">{scene2.followUpQuestion}</p>
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
                                            : 'bg-[var(--lx-dark-glass)] text-[var(--lx-text-muted)] cursor-not-allowed border border-[var(--lx-dark-glass-border)]'
                                    }`}
                                    style={{ borderRadius: '4px', fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {(followUpAnswer.length >= 20 || isTeacher) && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                    )}
                                    <div className="relative flex items-center justify-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        VIEW_IMPACT_REPORT
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
                className="relative overflow-hidden border-2 border-emerald-500/40 bg-slate-950"
                style={{ borderRadius: '10px' }}
            >
                {/* Ambient green glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-slate-950 to-emerald-900/10" />
                    <motion.div
                        className="absolute inset-0"
                        animate={{ opacity: [0.15, 0.35, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(16,185,129,0.25) 0%, transparent 65%)' }}
                    />
                </div>

                <BlueprintGrid opacity={0.04} color="#10b981" id="success-grid" />
                <HUDCorners color="border-emerald-400/60" size="w-5 h-5" />
                <ScanLine color="via-emerald-400/25" />
                <ParticleBurst />

                {/* ── Top classification bar ── */}
                <div className="relative z-10 flex items-center justify-between bg-emerald-600/90 backdrop-blur-sm px-6 py-3 border-b border-emerald-400/30">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-2.5 h-2.5 rounded-full bg-white"
                        />
                        <span className="text-[11px] font-mono text-white tracking-widest uppercase select-none">
                            CHAMBER_UNLOCKED :: MISSION_CLEARED
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-emerald-200" />
                        <span className="text-[9px] font-mono text-emerald-200 tracking-widest">ACCESS_GRANTED</span>
                    </div>
                </div>

                <div className="relative z-10 p-8">

                    {/* ── Hero: Key + title ── */}
                    <div className="text-center mb-10">

                        {/* Key with pulsing rings */}
                        <div className="relative inline-flex items-center justify-center mb-6">
                            {/* Ring layers */}
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full border border-emerald-400/30"
                                    initial={{ width: 80, height: 80, opacity: 0.6 }}
                                    animate={{ width: 80 + i * 40, height: 80 + i * 40, opacity: 0 }}
                                    transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
                                />
                            ))}
                            {/* Key icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', bounce: 0.5, delay: 0.15 }}
                                className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-800/80 to-slate-900 border-2 border-emerald-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                            >
                                <span className="text-4xl select-none" role="img" aria-label="key">🗝️</span>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <h2 className="text-4xl font-bold text-emerald-400 mb-2 tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                CHAMBER UNLOCKED
                            </h2>
                            <p className="text-[var(--lx-text-muted)] text-sm font-mono tracking-widest uppercase mb-4">
                                Mission Accomplished — The room is secure
                            </p>
                            {outcome.impactText && (
                                <p className="text-[var(--lx-text-inv)] text-base leading-relaxed max-w-2xl mx-auto">
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
                            <span className="text-[10px] font-mono text-emerald-500 tracking-widest uppercase px-3 select-none">
                                IMPACT ANALYSIS :: DECISION BREAKDOWN
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/30 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Validation Metrics */}
                            <div className="hud-panel border border-emerald-500/25 p-5" style={{ borderRadius: '6px' }}>
                                <div className="text-[9px] font-mono text-emerald-500 tracking-widest uppercase mb-4 select-none">VALIDATION_METRICS</div>
                                <div className="flex items-center gap-5 mb-5">
                                    <CircleProgress pct={99.8} color="#10b981" />
                                    <div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Success Rate</div>
                                        <div className="text-2xl font-bold text-emerald-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>99.8%</div>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
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
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span className="text-[12px] font-mono text-[var(--lx-text-inv)]">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Factors */}
                            <div className="hud-panel border border-emerald-500/25 p-5" style={{ borderRadius: '6px' }}>
                                <div className="text-[9px] font-mono text-emerald-500 tracking-widest uppercase mb-4 select-none">KEY_FACTORS</div>
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
                                                <span className="text-[9px] font-mono font-bold text-emerald-400">{i + 1}</span>
                                            </div>
                                            <span className="text-[12px] text-[var(--lx-text-inv)] leading-snug">{factor}</span>
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
                            { icon: Key,          label: 'KEY_ACQUIRED',         color: 'border-amber-400/40 bg-amber-500/10 text-amber-300' },
                            { icon: Shield,        label: 'CHAMBER_ACCESS: GRANTED', color: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' },
                            { icon: CheckCircle2, label: 'MISSION_COMPLETE',      color: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300' },
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
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase select-none">NEXT_STEPS</span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-700 to-transparent" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={onProceed}
                                className="relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 font-bold text-sm tracking-widest uppercase group transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                                style={{ borderRadius: '4px', fontFamily: "'Space Grotesk', sans-serif", minWidth: '300px' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                <div className="relative flex items-center justify-center gap-2">
                                    <ChevronRight className="w-4 h-4" />
                                    PROCEED TO EXIT AUTHORIZATION
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
                className="relative overflow-hidden border-2 border-red-500/40 bg-slate-950"
                style={{ borderRadius: '10px' }}
            >
                {/* Ambient red/orange danger glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-950/60 via-slate-950 to-orange-950/30" />
                    <motion.div
                        className="absolute inset-0"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(239,68,68,0.25) 0%, transparent 65%)' }}
                    />
                </div>

                <BlueprintGrid opacity={0.03} color="#ef4444" id="failure-grid" />
                <HUDCorners color="border-red-500/50" size="w-5 h-5" />

                {/* Red scan line */}
                <motion.div
                    className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent pointer-events-none z-10"
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: 'linear' }}
                />

                {/* Corner warning triangles */}
                {['top-3 left-8', 'top-3 right-8', 'bottom-3 left-8', 'bottom-3 right-8'].map((pos) => (
                    <motion.div
                        key={pos}
                        className={`absolute ${pos} pointer-events-none`}
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                    >
                        <AlertTriangle className="w-4 h-4 text-amber-500/70" />
                    </motion.div>
                ))}

                {/* ── Top classification bar ── */}
                <div className="relative z-10 flex items-center justify-between bg-red-900/80 backdrop-blur-sm px-6 py-3 border-b border-red-500/30">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ opacity: [1, 0.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2.5 h-2.5 rounded-full bg-red-400"
                        />
                        <span className="text-[11px] font-mono text-red-200 tracking-widest uppercase select-none">
                            SYSTEM_FAILURE :: ACCESS_DENIED
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="text-[9px] font-mono text-amber-400 tracking-widest">ALARM_ACTIVE</span>
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
                            <h2 className="text-4xl font-bold text-red-400 mb-2 tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                ACCESS DENIED
                            </h2>
                            <p className="text-[var(--lx-text-muted)] text-sm font-mono tracking-widest uppercase mb-4">
                                Room Locked — Unintended Consequences
                            </p>
                            {outcome.impactText && (
                                <p className="text-[var(--lx-text-inv)] text-base leading-relaxed max-w-2xl mx-auto">
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
                            <span className="text-[10px] font-mono text-red-500 tracking-widest uppercase px-3 select-none">
                                IMPACT ANALYSIS :: NEGATIVE CONSEQUENCES
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/25 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Negative Consequences */}
                            <div className="hud-panel border border-red-500/25 p-5" style={{ borderRadius: '6px' }}>
                                <div className="text-[9px] font-mono text-red-400 tracking-widest uppercase mb-4 select-none">SYSTEM_CONSEQUENCES</div>
                                <div className="space-y-3">
                                    {errorItems.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.75 + i * 0.1 }}
                                            className="flex items-center justify-between py-1.5 border-b border-red-900/40 last:border-0"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="text-[12px] font-mono text-[var(--lx-text-inv)]">{item.label}</span>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-red-400">{item.val}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Scientific Error Report */}
                            <div className="hud-panel border border-red-500/25 p-5" style={{ borderRadius: '6px' }}>
                                <div className="text-[9px] font-mono text-red-400 tracking-widest uppercase mb-4 select-none">SCIENTIFIC_ERROR_REPORT</div>
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
                                            transition={{ delay: 0.8 + i * 0.1 }}
                                            className="flex items-start justify-between gap-2 py-1.5 border-b border-red-900/40 last:border-0"
                                        >
                                            <div>
                                                <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider mb-0.5">{item.label}</div>
                                                <div className="flex items-center gap-2">
                                                    {item.icon && <XCircle className="w-3 h-3 text-red-500 shrink-0" />}
                                                    <span className={`text-[11px] font-mono font-bold ${item.label === 'Core Temperature' ? 'text-red-400' : item.label === 'Variable Imbalance' ? 'text-amber-400' : 'text-slate-300'}`}>{item.val}</span>
                                                </div>
                                            </div>
                                            {item.graph && <UnstableGraph color={item.color} />}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Responsibility message ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="border border-amber-500/20 bg-amber-900/10 px-5 py-4 mb-8 text-center"
                        style={{ borderRadius: '6px' }}
                    >
                        <p className="text-[var(--lx-text-inv)] text-sm leading-relaxed">
                            Your decision triggered unintended consequences. Return to the mission evidence and reconsider the scientific data, or re-watch the briefing to re-examine the clues.
                        </p>
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
                                style={{ borderRadius: '4px', fontFamily: "'Space Grotesk', sans-serif", minWidth: '220px' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                <div className="relative flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    REVIEW MISSION
                                </div>
                            </motion.button>
                        )}
                        {onRewatch && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={onRewatch}
                                className="relative overflow-hidden border border-red-500/50 bg-red-900/20 hover:bg-red-900/40 text-red-300 hover:text-red-200 px-8 py-4 font-bold text-sm tracking-widest uppercase group transition-colors"
                                style={{ borderRadius: '4px', fontFamily: "'Space Grotesk', sans-serif", minWidth: '220px' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                <div className="relative flex items-center justify-center gap-2">
                                    <Video className="w-4 h-4" />
                                    WATCH BRIEFING AGAIN
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
                                OVERRIDE :: Proceed to Exit Ticket (Teacher)
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </Section>
    );
}
