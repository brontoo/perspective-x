import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Trophy, Star, ArrowRight, Home, CheckCircle2, XCircle,
    Award, RefreshCw, Lock, ShieldCheck, Key,
} from 'lucide-react';

/* ── Shared sub-components ─────────────────────────────────────────── */

function HUDCorners({ size = 'w-6 h-6', color = 'border-cyan-400' }) {
    return (
        <>
            <span className={`absolute top-0 left-0 ${size} border-t-2 border-l-2 ${color}`} />
            <span className={`absolute top-0 right-0 ${size} border-t-2 border-r-2 ${color}`} />
            <span className={`absolute bottom-0 left-0 ${size} border-b-2 border-l-2 ${color}`} />
            <span className={`absolute bottom-0 right-0 ${size} border-b-2 border-r-2 ${color}`} />
        </>
    );
}

function BlueprintGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            <svg width="100%" height="100%">
                <defs>
                    <pattern id="sc-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#sc-grid)" />
            </svg>
        </div>
    );
}

function MetricRow({ label, value, passed }) {
    return (
        <div className="glass-card flex items-center justify-between px-4 py-3">
            <span className="text-[11px] font-mono text-[var(--lx-text-sub)]">{label}</span>
            <span className={`text-[11px] font-mono font-bold ${passed ? 'text-[var(--lx-success)]' : 'text-[var(--lx-warning)]'}`}>
                {value}
            </span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ScenarioComplete({
    scenario,
    responses,
    role,
    onShowCertificate,
    onRetry,
    attemptCount = 1,
    theme = {},
}) {
    const passed = responses.exitTicket?.passed ?? responses.passed;
    const exitQuestionCount =
        scenario.exitTicket?.questions?.length || scenario.exitTicket?.mcqs?.length || 2;

    const exitScore = Math.round(Number(responses.exitTicket?.score) || 0);
    const correctCount = exitScore === 100
        ? exitQuestionCount
        : Math.round((exitScore / 100) * exitQuestionCount);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
        >
            <div className="glass-card relative overflow-hidden">
                <BlueprintGrid />
                <HUDCorners />

                {/* Top status bar */}
                <div className={`flex items-center justify-between px-6 py-2.5 ${passed ? 'bg-emerald-800' : 'bg-[var(--lx-dark-glass)]'}`}>
                    <div className="flex items-center gap-2.5">
                        <motion.div
                            className={`w-2 h-2 rounded-full ${passed ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                        />
                        <span className={`text-[10px] font-mono tracking-widest uppercase select-none ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {passed ? 'CHAMBER_CLEARED :: MISSION_COMPLETE' : 'ACCESS_DENIED :: RETRY_AVAILABLE'}
                        </span>
                    </div>
                    <div className={`text-[9px] font-mono tracking-widest select-none ${passed ? 'text-emerald-600' : 'text-[var(--lx-text-muted)]'}`}>
                        {passed ? 'STATUS: AUTHORIZED' : `ATTEMPT: ${attemptCount}`}
                    </div>
                </div>

                <div className="relative z-10 p-8">

                    {/* ── PASSED state ── */}
                    {passed ? (
                        <>
                            {/* Badge + headline */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                                    className="relative mb-6"
                                >
                                    {/* Pulse rings */}
                                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                                    <div className="absolute inset-[-6px] rounded-full bg-emerald-400/10" />

                                    <div
                                        className="relative w-24 h-24 border-2 border-[var(--lx-success)] bg-[var(--lx-success-soft)] flex items-center justify-center text-5xl shadow-lg"
                                        style={{ borderRadius: '12px' }}
                                    >
                                        {scenario.badgeIcon}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                        <span className="text-[9px] font-mono text-[var(--lx-success)] tracking-widest uppercase">KEY_ACQUIRED</span>
                                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                    </div>
                                    <h1
                                        className="text-3xl font-bold text-[var(--lx-text)] mb-2"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        Chamber Cleared
                                    </h1>
                                    <p className="text-[var(--lx-success)] font-mono text-sm">MISSION_COMPLETE — Escape Authorized</p>
                                </motion.div>
                            </div>

                            {/* Badge earned card */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                                className="border border-[var(--lx-warning)]/30 bg-[var(--lx-warning-soft)] px-5 py-4 mb-5"
                                style={{ borderRadius: '4px' }}
                            >
                                <div className="flex items-center gap-2.5 mb-2">
                                    <Trophy className="w-4 h-4 text-[var(--lx-warning)] shrink-0" />
                                    <span className="text-[10px] font-mono text-[var(--lx-warning)] tracking-widest uppercase font-bold">Badge Earned</span>
                                </div>
                                <p
                                    className="text-[var(--lx-text)] font-bold text-base"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {scenario.badge}
                                </p>
                                <p className="text-[var(--lx-text-muted)] text-xs mt-1">
                                    You demonstrated understanding of {scenario.scienceFocus[0].toLowerCase()} and made reasoned decisions.
                                </p>
                            </motion.div>

                            {/* Skills */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex flex-wrap gap-2 mb-6"
                            >
                                {['Data Analysis', 'Critical Thinking', 'Problem Solving'].map((skill) => (
                                    <span
                                        key={skill}
                                        className="glass-badge-accent flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1"
                                        style={{ borderRadius: '2px' }}
                                    >
                                        <Star className="w-3 h-3 shrink-0" />
                                        {skill} +10
                                    </span>
                                ))}
                            </motion.div>
                        </>
                    ) : (
                        /* ── FAILED state ── */
                        <>
                            <div className="flex flex-col items-center text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
                                    className="relative w-24 h-24 mb-5"
                                >
                                    <div
                                        className="w-full h-full border border-[var(--lx-glass-border-sub)] bg-[var(--lx-glass)] flex items-center justify-center text-5xl opacity-30 select-none"
                                        style={{ borderRadius: '12px' }}
                                    >
                                        {scenario.badgeIcon}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div
                                            className="w-10 h-10 glass-panel border border-[var(--lx-warning)]/40 flex items-center justify-center shadow-md"
                                            style={{ borderRadius: '8px' }}
                                        >
                                            <Lock className="w-5 h-5 text-amber-500" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {attemptCount > 1 && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 glass-panel border border-[var(--lx-glass-border-sub)] mb-3" style={{ borderRadius: '2px' }}>
                                            <RefreshCw className="w-3 h-3 text-[var(--lx-text-muted)]" />
                                            <span className="text-[10px] font-mono text-[var(--lx-text-muted)]">ATTEMPT_{attemptCount}</span>
                                        </div>
                                    )}
                                    <h1
                                        className="text-3xl font-bold text-[var(--lx-text)] mb-2"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        Almost Escaped
                                    </h1>
                                    <p className="text-[var(--lx-warning)] font-mono text-sm">CHAMBER_LOCKED — Score ≥ 70% to unlock</p>
                                </motion.div>
                            </div>

                            {/* Retry card */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                                className="border border-[var(--lx-warning)]/30 bg-[var(--lx-warning-soft)] px-5 py-4 mb-6"
                                style={{ borderRadius: '4px' }}
                            >
                                <div className="flex items-center gap-2.5 mb-2">
                                    <XCircle className="w-4 h-4 text-[var(--lx-warning)] shrink-0" />
                                    <span className="text-[10px] font-mono text-[var(--lx-warning)] tracking-widest uppercase font-bold">Keep Practicing</span>
                                </div>
                                <p className="text-[var(--lx-text-sub)] text-xs mb-4 leading-relaxed">
                                    Score at least 70% on the exit ticket and complete all reflections to unlock the next scenario.
                                </p>
                                {onRetry && (
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={onRetry}
                                        className="liquid-btn-accent w-full flex items-center justify-center gap-2 py-3 text-[11px] font-mono font-bold tracking-widest uppercase"
                                        style={{ borderRadius: '4px' }}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        RETRY_MISSION
                                    </motion.button>
                                )}
                            </motion.div>
                        </>
                    )}

                    {/* ── Exit ticket results ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: passed ? 0.85 : 0.65 }}
                        className="mb-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px flex-1 bg-[var(--lx-glass-border-sub)]" />
                            <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase px-2 select-none">
                                EXIT_TICKET_RESULTS
                            </span>
                            <div className="h-px flex-1 bg-[var(--lx-glass-border-sub)]" />
                        </div>

                        <div className="space-y-2">
                            <MetricRow
                                label="Concept Questions"
                                value={`${correctCount}/${exitQuestionCount} correct`}
                                passed={exitScore === 100}
                            />
                            <MetricRow
                                label="Questions Accuracy"
                                value={`${exitScore}%`}
                                passed={exitScore >= 70}
                            />
                            <MetricRow
                                label="Reflection"
                                value={responses.exitTicket?.reflection?.length >= 10 ? 'Completed' : 'Incomplete'}
                                passed={responses.exitTicket?.reflection?.length >= 10}
                            />
                            <MetricRow
                                label="Transfer Question"
                                value={responses.exitTicket?.transfer_answer?.length >= 10 ? 'Completed' : 'Incomplete'}
                                passed={responses.exitTicket?.transfer_answer?.length >= 10}
                            />
                        </div>
                    </motion.div>

                    {/* ── Certificate button ── */}
                    {passed && onShowCertificate && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="mb-5"
                        >
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={onShowCertificate}
                                className="liquid-btn-accent w-full flex items-center justify-center gap-2.5 py-3.5 text-[11px] font-mono font-bold tracking-widest uppercase relative overflow-hidden group"
                                style={{ borderRadius: '4px' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                <Award className="w-4 h-4 shrink-0" />
                                VIEW_EXIT_AUTHORIZATION_CERTIFICATE
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── Navigation actions ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: passed ? 1.15 : 0.85 }}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <Link to={`/role-hub?role=${role?.id || ''}`} className="flex-1">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="liquid-btn-ghost w-full flex items-center justify-center gap-2 py-3 text-[11px] font-mono font-bold tracking-widest uppercase"
                                style={{ borderRadius: '4px' }}
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                                NEXT_SCENARIO
                            </motion.button>
                        </Link>

                        <Link to="/Dashboard" className="flex-1">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="hud-panel w-full flex items-center justify-center gap-2 border border-[var(--lx-glass-border-sub)] text-[var(--lx-text)] py-3 text-[11px] font-mono font-bold tracking-widest uppercase transition-colors"
                                style={{ borderRadius: '4px' }}
                            >
                                <Home className="w-3.5 h-3.5" />
                                DASHBOARD
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
