
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { SCENARIOS } from '@/components/scenarios/scenarioData';

// ── HUD bracket corners (local) ───────────────────────────────────────────────
function HUDCorners({ colorClass = 'border-cyan-400/60' }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${colorClass}`} />
            <span className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${colorClass}`} />
            <span className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${colorClass}`} />
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${colorClass}`} />
        </div>
    );
}

// ── Color system (light theme) ────────────────────────────────────────────────
const colorClasses = {
    emerald: {
        iconBg: 'bg-emerald-50 border border-emerald-200',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        hud: 'border-emerald-400/60',
        dot: 'bg-emerald-500',
        hover: 'hover:border-emerald-300',
        glow: 'group-hover:shadow-emerald-100/80',
    },
    purple: {
        iconBg: 'bg-purple-50 border border-purple-200',
        text: 'text-purple-700',
        bar: 'bg-purple-500',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        hud: 'border-purple-400/60',
        dot: 'bg-purple-500',
        hover: 'hover:border-purple-300',
        glow: 'group-hover:shadow-purple-100/80',
    },
    blue: {
        iconBg: 'bg-blue-50 border border-blue-200',
        text: 'text-blue-700',
        bar: 'bg-blue-500',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        hud: 'border-blue-400/60',
        dot: 'bg-blue-500',
        hover: 'hover:border-blue-300',
        glow: 'group-hover:shadow-blue-100/80',
    },
    amber: {
        iconBg: 'bg-amber-50 border border-amber-200',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        hud: 'border-amber-400/60',
        dot: 'bg-amber-500',
        hover: 'hover:border-amber-300',
        glow: 'group-hover:shadow-amber-100/80',
    },
    red: {
        iconBg: 'bg-red-50 border border-red-200',
        text: 'text-red-700',
        bar: 'bg-red-500',
        badge: 'bg-red-50 text-red-700 border-red-200',
        hud: 'border-red-400/60',
        dot: 'bg-red-500',
        hover: 'hover:border-red-300',
        glow: 'group-hover:shadow-red-100/80',
    },
    orange: {
        iconBg: 'bg-orange-50 border border-orange-200',
        text: 'text-orange-700',
        bar: 'bg-orange-500',
        badge: 'bg-orange-50 text-orange-700 border-orange-200',
        hud: 'border-orange-400/60',
        dot: 'bg-orange-500',
        hover: 'hover:border-orange-300',
        glow: 'group-hover:shadow-orange-100/80',
    },
    teal: {
        iconBg: 'bg-teal-50 border border-teal-200',
        text: 'text-teal-700',
        bar: 'bg-teal-500',
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        hud: 'border-teal-400/60',
        dot: 'bg-teal-500',
        hover: 'hover:border-teal-300',
        glow: 'group-hover:shadow-teal-100/80',
    },
    green: {
        iconBg: 'bg-green-50 border border-green-200',
        text: 'text-green-700',
        bar: 'bg-green-500',
        badge: 'bg-green-50 text-green-700 border-green-200',
        hud: 'border-green-400/60',
        dot: 'bg-green-500',
        hover: 'hover:border-green-300',
        glow: 'group-hover:shadow-green-100/80',
    },
};

export default function RoleCard({ role, onClick, index, progress }) {
    const colors = colorClasses[role.color] || colorClasses.emerald;

    const completedCount = progress?.completed_scenarios?.filter(s =>
        role.scenarios.includes(s)
    ).length || 0;
    const percentage = Math.round((completedCount / role.scenarios.length) * 100);
    const isFullyComplete = percentage === 100;
    const isInProgress = completedCount > 0 && !isFullyComplete;

    const roleId = `ROLE-${String(index + 1).padStart(2, '0')}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={onClick}
            className="relative cursor-pointer group"
        >
            <div className="glass-card relative overflow-hidden transition-all duration-300 group-hover:shadow-[var(--lx-shadow-glow)]">

                {/* HUD brackets – appear on hover */}
                <HUDCorners colorClass={colors.hud} />

                {/* Top strip: role ID + status chip */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--lx-glass-border-sub)] bg-[var(--lx-glass)]/30">
                    <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest select-none">
                        {roleId}
                    </span>
                    {isFullyComplete ? (
                        <span className="glass-badge glass-badge-success flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 leading-none">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            COMPLETE
                        </span>
                    ) : isInProgress ? (
                        <span className="glass-badge glass-badge-warning flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lx-warning)] animate-pulse" />
                            IN_PROGRESS
                        </span>
                    ) : (
                        <span className="glass-badge glass-badge-accent flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lx-accent)]" />
                            READY
                        </span>
                    )}
                </div>

                {/* Card body */}
                <div className="p-6">
                    {/* Role icon */}
                    <div className={`w-14 h-14 ${colors.iconBg} flex items-center justify-center mb-4`}
                        style={{ borderRadius: '6px' }}>
                        <span className="text-3xl">{role.icon}</span>
                    </div>

                    {/* Title & description */}
                    <h3 className="text-xl font-bold text-[var(--lx-text)] mb-1.5 leading-snug"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {role.title}
                    </h3>
                    <p className="text-[var(--lx-text-sub)] text-sm mb-4 leading-relaxed">{role.description}</p>

                    {/* Difficulty badge */}
                    <span className={`glass-badge inline-block text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 mb-5`}
                        style={{ borderRadius: '2px' }}>
                        {role.difficulty}
                    </span>

                    {/* ── Progress ── */}
                    <div className="mb-5">
                        <div className="flex justify-between mb-1.5">
                            <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                                PROGRESS
                            </span>
                            <span className={`text-[10px] font-mono ${colors.text} font-semibold`}>
                                {completedCount}/{role.scenarios.length}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="glass-progress mb-2.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                                className={`glass-progress-bar ${colors.bar}`}
                            />
                        </div>

                        {/* Scenario segment dots */}
                        <div className="flex gap-1.5 flex-wrap">
                            {role.scenarios.map((scenarioId) => {
                                const isCompleted = progress?.completed_scenarios?.includes(scenarioId);
                                const scenario = SCENARIOS[scenarioId];
                                return (
                                    <div
                                        key={scenarioId}
                                        title={scenario?.title || scenarioId}
                                        className={`h-1 transition-all duration-500 ${
                                            isCompleted ? `w-4 ${colors.dot}` : 'w-1 bg-[var(--lx-glass-border-sub)]'
                                        }`}
                                        style={{ borderRadius: '2px' }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* CTA row */}
                    <div className={`flex items-center gap-2 ${colors.text} text-sm font-semibold group-hover:gap-3 transition-all`}
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <span className="font-mono text-[11px] tracking-widest uppercase">
                            {isFullyComplete ? '[ REVIEW ROLE ]' : '[ ENTER ROLE ]'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
