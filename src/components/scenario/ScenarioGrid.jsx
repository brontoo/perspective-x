import React from 'react';
import { motion } from 'framer-motion';

export default function ScenarioGrid({ children, scenarioCount = 0, completedCount = 0 }) {
    const pct = scenarioCount > 0 ? Math.round((completedCount / scenarioCount) * 100) : 0;

    return (
        <div className="relative">
            {/* Outer chamber frame */}
            <div className="glass-card relative rounded-xl">
                {/* Chamber header bar */}
                <div className="flex items-center gap-4 px-5 py-3 border-b border-[var(--lx-glass-border-sub)] bg-[var(--lx-glass)]/20">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--lx-accent)]" />
                        <span className="text-xs font-semibold text-[var(--lx-accent)] select-none">
                            Chamber Selection
                        </span>
                    </div>

                    <div className="h-px flex-1 bg-[var(--lx-glass-border-sub)]" />

                    {/* Cleared indicator */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--lx-text-muted)] select-none">
                            {completedCount}/{scenarioCount} Completed
                        </span>
                        <div className="glass-progress w-16">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="glass-progress-bar bg-[var(--lx-accent)]"
                            />
                        </div>
                    </div>

                    <span className="text-xs text-[var(--lx-text-muted)]/60 select-none">
                        Active
                    </span>
                </div>

                <div className="relative overflow-hidden">
                    <div className="p-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
