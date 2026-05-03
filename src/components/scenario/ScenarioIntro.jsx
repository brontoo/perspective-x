import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, Play, MapPin, BookOpen, AlertTriangle } from 'lucide-react';

/* ── Shared sub-components ──────────────────────────────────────────────── */

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

function ScanLine() {
    return (
        <motion.div
            className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none z-10"
            initial={{ top: '8%' }}
            animate={{ top: ['8%', '100%'] }}
            transition={{ duration: 5, repeat: Infinity, repeatDelay: 8, ease: 'linear' }}
        />
    );
}

function BlueprintGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            <svg width="100%" height="100%">
                <defs>
                    <pattern id="si-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#si-grid)" />
            </svg>
        </div>
    );
}

/* ── Stat row ────────────────────────────────────────────────────────────── */
function StatRow({ label, value, icon: Icon }) {
    return (
        <div
            className="glass-card flex items-center justify-between px-4 py-3"
        >
            <div className="flex items-center gap-2.5">
                <div className="p-1.5 glass-panel border border-[var(--lx-glass-border-sub)]" style={{ borderRadius: '3px' }}>
                    <Icon className="w-3.5 h-3.5 text-[var(--lx-accent)]" />
                </div>
                <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                    {label}
                </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[var(--lx-text)]">
                {value}
            </span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ScenarioIntro({ scenario, onStart, isTeacher, theme }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto"
        >
            {/* ── Outer classified dossier frame ── */}
            <div className="glass-card relative overflow-hidden">
                <BlueprintGrid />
                <HUDCorners />
                <ScanLine />

                {/* Classification header bar */}
                <div className="flex items-center justify-between bg-[var(--lx-dark-glass)] px-6 py-2.5">
                    <div className="flex items-center gap-2.5">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-cyan-400"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                        />
                        <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase select-none">
                            MISSION_BRIEFING :: CLASSIFIED
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest select-none">
                            CLEARANCE: ALPHA
                        </span>
                        <div className="w-10 h-1 bg-cyan-500" style={{ borderRadius: '1px' }} />
                    </div>
                </div>

                <div className="relative z-10 p-8">

                    {/* ── Character + briefing row ── */}
                    <div className="flex flex-col md:flex-row gap-8 mb-8">

                        {/* Left: Personnel ID card */}
                        <motion.div
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15, duration: 0.35 }}
                            className="shrink-0"
                        >
                            <div
                                className="glass-card relative p-5 overflow-hidden"
                                style={{ width: '220px' }}
                            >
                                <HUDCorners size="w-3 h-3" color="border-cyan-300" />

                                <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-4 select-none">
                                    Mission Personnel
                                </div>

                                {/* Avatar */}
                                <div
                                    className="w-16 h-16 bg-[var(--lx-glass)] border border-[var(--lx-glass-border)] flex items-center justify-center text-4xl mb-4 select-none shadow-sm"
                                    style={{ borderRadius: '5px' }}
                                >
                                    {scenario.character?.avatar || '👩‍🔬'}
                                </div>

                                {/* Name */}
                                <div
                                    className="text-[15px] font-bold text-[var(--lx-text)] mb-4 leading-snug"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {scenario.character?.name || 'Authorized Personnel'}
                                </div>

                                <div className="space-y-2.5">
                                    <div>
                                        <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-0.5">
                                            Role:
                                        </div>
                                        <div className="text-[11px] font-mono text-[var(--lx-text-sub)] font-medium leading-snug">
                                            {scenario.character?.title || scenario.role}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[var(--lx-glass-border-sub)] pt-2.5">
                                        <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                                            Clearance:
                                        </div>
                                        <span
                                            className="glass-badge-success text-[9px] font-mono px-1.5 py-0.5 select-none"
                                            style={{ borderRadius: '2px' }}
                                        >
                                            ALPHA
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Strategic briefing */}
                        <motion.div
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.35 }}
                            className="flex-1 min-w-0"
                        >
                            {/* Dossier divider */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-px flex-1 bg-gradient-to-r from-[var(--lx-glass-border-sub)] to-transparent" />
                                <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase px-2 select-none">
                                    MISSION DOSSIER
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-l from-[var(--lx-glass-border-sub)] to-transparent" />
                            </div>

                            {/* Strategic briefing */}
                            <div className="flex items-start gap-2.5 mb-5">
                                <div
                                    className="p-1.5 glass-panel border border-[var(--lx-glass-border-sub)] shrink-0 mt-0.5"
                                    style={{ borderRadius: '3px' }}
                                >
                                    <BookOpen className="w-3.5 h-3.5 text-[var(--lx-accent)]" />
                                </div>
                                <div className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mt-1.5">
                                    Strategic Briefing
                                </div>
                            </div>

                            <div
                                className="border-l-2 border-cyan-400 pl-4 mb-6"
                            >
                                <p className="text-[var(--lx-text)] text-base italic leading-relaxed">
                                    "{scenario.roleQuote || 'Awaiting mission parameters...'}"
                                </p>
                            </div>

                            {/* UAE context */}
                            {scenario.uaeContext && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="w-3.5 h-3.5 text-[var(--lx-text-muted)]" />
                                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                                            Regional Intelligence
                                        </span>
                                    </div>
                                    <div
                                        className="glass-panel px-4 py-3"
                                        style={{ borderRadius: '4px' }}
                                    >
                                        <p className="text-[var(--lx-text-sub)] text-sm leading-relaxed">
                                            {scenario.uaeContext}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* ── Stats + science focus grid ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.35 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8"
                    >
                        {/* Stats column */}
                        <div className="space-y-2.5">
                            <StatRow
                                label="Mission Duration"
                                value={`${scenario.estimatedTime} MINUTES`}
                                icon={Clock}
                            />
                            <StatRow
                                label="Operational Strand"
                                value={scenario.strand}
                                icon={Target}
                            />
                            <StatRow
                                label="Risk Classification"
                                value="MODERATE"
                                icon={AlertTriangle}
                            />
                        </div>

                        {/* Science focus column */}
                        <div className="glass-card p-4">
                            <div className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-3 select-none">
                                Science Focus Areas
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {scenario.scienceFocus?.map((focus) => (
                                    <span
                                        key={focus}
                                        className="glass-badge text-[10px] font-mono px-2.5 py-1 hover:border-[var(--lx-accent)]/40 transition-colors"
                                    >
                                        {focus}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Accept Assignment CTA ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={onStart}
                            className="liquid-btn-accent w-full relative overflow-hidden font-bold py-5 text-base tracking-widest uppercase group"
                            style={{ borderRadius: 'var(--lx-r-card)', fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            {/* Sweep sheen */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                            <div className="relative flex items-center justify-center gap-3">
                                <Play className="w-5 h-5 fill-current shrink-0" />
                                {isTeacher ? 'PREVIEW_MISSION' : 'ACCEPT_ASSIGNMENT'}
                            </div>
                        </motion.button>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
}
