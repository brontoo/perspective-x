
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Scale, BarChart3, Lightbulb } from 'lucide-react';

const focuses = [
    {
        icon: Brain,
        title: 'Critical Thinking',
        description: 'Analyze complex situations and evaluate evidence',
        color: 'cyan',
        id: 'SKL-001',
    },
    {
        icon: Target,
        title: 'Scientific Reasoning',
        description: 'Apply the scientific method to real problems',
        color: 'purple',
        id: 'SKL-002',
    },
    {
        icon: Scale,
        title: 'Ethical Decision-Making',
        description: 'Balance scientific facts with human values',
        color: 'amber',
        id: 'SKL-003',
    },
    {
        icon: BarChart3,
        title: 'Data Interpretation',
        description: 'Read graphs, tables, and scientific data',
        color: 'blue',
        id: 'SKL-004',
    },
    {
        icon: Lightbulb,
        title: 'Problem Solving',
        description: 'Find creative solutions under pressure',
        color: 'emerald',
        id: 'SKL-005',
    },
];

const colorMap = {
    cyan:    { icon: 'text-cyan-600',    bg: 'bg-cyan-50',    border: 'border-cyan-200',    hud: 'border-cyan-400/50'    },
    purple:  { icon: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200',  hud: 'border-purple-400/50'  },
    amber:   { icon: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   hud: 'border-amber-400/50'   },
    blue:    { icon: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    hud: 'border-blue-400/50'    },
    emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', hud: 'border-emerald-400/50' },
};

// ── HUD corner brackets ───────────────────────────────────────────────────────
function HUDCorners({ colorClass }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className={`absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 ${colorClass}`} />
            <span className={`absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 ${colorClass}`} />
            <span className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 ${colorClass}`} />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 ${colorClass}`} />
        </div>
    );
}

export default function LearningFocusSection() {
    return (
        <section className="pt-12 pb-16 relative z-10 lx-footer-surface">
            <div className="max-w-6xl mx-auto px-6">

                {/* HUD-style section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-14"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--lx-accent-glow)]" />
                        <span className="text-[10px] font-mono text-[var(--lx-accent)] tracking-widest uppercase px-3">
                            SKILL_MATRIX :: ACTIVE_PROTOCOLS
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--lx-accent-glow)]" />
                    </div>

                    <div className="text-center">
                        <h2 className="lx-section-title font-bold text-[var(--lx-text)] mb-3"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Skills You'll Develop
                        </h2>
                        <p className="text-[var(--lx-text-sub)] max-w-xl mx-auto text-sm leading-relaxed">
                            Each scenario is designed to strengthen specific scientific thinking skills
                        </p>
                    </div>
                </motion.div>

                {/* Skill cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {focuses.map((focus, index) => {
                        const c = colorMap[focus.color];
                        return (
                            <motion.div
                                key={focus.title}
                                initial={{ opacity: 0, scale: 0.92 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08 }}
                                whileHover={{ y: -3, scale: 1.02 }}
                                className="glass-card relative group p-5 text-center cursor-default overflow-hidden"
                            >
                                <HUDCorners colorClass={c.hud} />

                                {/* Panel ID */}
                                <span className="absolute top-1.5 right-2 text-[8px] font-mono text-[var(--lx-accent)]/50 tracking-widest select-none">
                                    {focus.id}
                                </span>

                                {/* Icon container */}
                                <div className={`w-10 h-10 ${c.bg} border ${c.border} flex items-center justify-center mx-auto mb-3`}
                                    style={{ borderRadius: '4px' }}>
                                    <focus.icon className={`w-5 h-5 ${c.icon}`} />
                                </div>

                                <h3 className="font-semibold text-[var(--lx-text)] text-xs mb-1.5 leading-snug"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    {focus.title}
                                </h3>
                                <p className="text-[11px] text-[var(--lx-text-muted)] leading-relaxed">
                                    {focus.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
