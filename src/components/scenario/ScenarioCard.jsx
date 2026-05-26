import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock, Lock, CheckCircle2, ChevronRight,
    Beaker, Dna, Mountain, Zap, Rocket,
} from 'lucide-react';

const strandIcons = {
    'Chemistry': Beaker,
    'Biology': Dna,
    'Earth Science': Mountain,
    'Physics': Zap,
    'Space Science': Rocket,
};

const difficultyLabel = {
    'beginner': 'Beginner',
    'on-level': 'On-Level',
    'high-achievers': 'Advanced',
};

const difficultyColors = {
    'beginner':       'text-emerald-600 bg-emerald-50 border-emerald-200',
    'on-level':       'text-amber-600   bg-amber-50   border-amber-200',
    'high-achievers': 'text-red-600     bg-red-50     border-red-200',
};

export default function ScenarioCard({ scenario, status, index, onClick, settings, roleTitle }) {
    const difficulty = settings?.difficulty_override || 'on-level';
    const isMandatory = settings?.is_mandatory;
    const StrandIcon  = strandIcons[scenario.strand] || Beaker;

    const isLocked    = status === 'locked';
    const isUnlocked  = status === 'unlocked';
    const isCompleted = status === 'completed';

    const num = String(index + 1).padStart(2, '0');

    const shellClass = isLocked
        ? 'opacity-50 cursor-default'
        : isCompleted
        ? 'cursor-pointer'
        : 'cursor-pointer';

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.07 }}
            whileHover={!isLocked ? { y: -2, transition: { duration: 0.18 } } : {}}
            onClick={!isLocked ? onClick : undefined}
            className={`glass-card bg-white/5 relative group overflow-hidden transition-all duration-250 ${shellClass} ${!isLocked && !isCompleted ? 'hover:shadow-[var(--lx-shadow-glow)]' : ''}`}
        >
            <div className="flex items-stretch">
                {/* ── Left accent column ── */}
                <div className={`flex flex-col items-center justify-center gap-1 px-3 py-4 border-r min-w-[56px] ${
                    isLocked
                        ? 'bg-[var(--lx-glass)]/30 border-[var(--lx-glass-border-sub)]'
                        : isCompleted
                        ? 'bg-[var(--lx-success)]/10 border-[var(--lx-success)]/20'
                        : 'bg-[var(--lx-accent-soft)] border-[var(--lx-glass-border-sub)]'
                }`}>
                    <StrandIcon className={`w-4 h-4 ${
                        isLocked ? 'text-[var(--lx-text-muted)]'
                        : isCompleted ? 'text-[var(--lx-success)]'
                        : 'text-[var(--lx-accent)]'
                    }`} />
                    <span className={`text-[11px] font-mono font-bold tabular-nums ${
                        isLocked ? 'text-[var(--lx-text-muted)]'
                        : isCompleted ? 'text-[var(--lx-success)]'
                        : 'text-[var(--lx-accent)]'
                    }`}>
                        {num}
                    </span>
                </div>

                {/* ── Main content ── */}
                <div className="flex-1 min-w-0 p-4">

                    {/* Row 1: title + status badge */}
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3
                            className={`font-bold text-sm leading-snug ${isLocked ? 'text-[var(--lx-text-muted)]' : 'text-[var(--lx-text)]'}`}
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            {scenario.title}
                        </h3>
                        {/* Role title badge */}
                        {roleTitle && (
                            <span className="glass-badge text-[9px] font-mono px-2 py-0.5 ml-2" style={{ backgroundColor: 'rgba(var(--lx-accent-rgb),0.1)' }}>
                                {roleTitle}
                            </span>
                        )}

                        {isLocked && (
                            <span className="glass-badge glass-badge-danger shrink-0 flex items-center gap-1 text-[10px] px-2 py-0.5">
                                <Lock className="w-2.5 h-2.5" /> Locked by Teacher
                            </span>
                        )}
                        {isUnlocked && (
                            <span className="glass-badge glass-badge-success shrink-0 text-[10px] px-2 py-0.5">
                                Start Mission
                            </span>
                        )}
                        {isCompleted && (
                            <span className="glass-badge glass-badge-success shrink-0 flex items-center gap-1 text-[10px] px-2 py-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                            </span>
                        )}
                    </div>

                    {/* Row 2: context snippet */}
                    <p className={`text-[12px] leading-relaxed mb-3 ${isLocked ? 'text-[var(--lx-text-muted)]' : 'text-[var(--lx-text-sub)]'}`}>
                        {scenario.context}
                    </p>
                    {/* Info row */}
                    <div className="flex flex-wrap text-[10px] text-[var(--lx-text-muted)] gap-2 mb-2">
                        {roleTitle && <span className="px-2 py-0.5 bg-[var(--lx-accent-soft)]/20 rounded">Role: {roleTitle}</span>}
                        {scenario.strand && <span className="px-2 py-0.5 bg-[var(--lx-accent-soft)]/20 rounded">Topic: {scenario.strand}</span>}
                        {scenario.estimatedTime && <span className="px-2 py-0.5 bg-[var(--lx-accent-soft)]/20 rounded">Time: {scenario.estimatedTime}m</span>}
                        {difficultyLabel[difficulty] && <span className="px-2 py-0.5 bg-[var(--lx-accent-soft)]/20 rounded">Difficulty: {difficultyLabel[difficulty] || 'On-Level'}</span>}
                    </div>
                    {/* Row 3: meta pills + action */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">

                        {/* Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`flex items-center gap-1 text-[10px] font-mono ${isLocked ? 'text-[var(--lx-text-muted)]' : 'text-[var(--lx-text-muted)]'}`}>
                                <Clock className="w-3 h-3" />
                                {scenario.estimatedTime}m
                            </span>

                            <span className="glass-badge text-[9px] font-mono px-1.5 py-0.5">
                                {scenario.strand}
                            </span>

                            <span className={`glass-badge text-[10px] px-2 py-0.5 border ${difficultyColors[difficulty]}`}>
                                {difficultyLabel[difficulty] || 'On-Level'}
                            </span>

                            {isMandatory && !isLocked && (
                                <span className="glass-badge text-[10px] text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 font-medium">
                                    Required
                                </span>
                            )}
                        </div>

                        {/* Action */}
                        {isUnlocked && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="liquid-btn-accent shrink-0 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide px-3 py-1.5"
                                style={{ borderRadius: 'var(--lx-r-btn)' }}
                                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                            >
                                Start Mission
                                <ChevronRight className="w-3 h-3" />
                            </motion.button>
                        )}

                        {isCompleted && (
                            <div className="shrink-0 flex items-center gap-2">
                                {scenario.badgeIcon && (
                                    <span className="text-base leading-none">{scenario.badgeIcon}</span>
                                )}
                                <button
                                    className="liquid-btn text-[11px] font-semibold px-2.5 py-1"
                                    style={{ borderRadius: 'var(--lx-r-btn)' }}
                                    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                                >
                                    Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
