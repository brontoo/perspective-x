import React from 'react';
import { motion } from 'framer-motion';

function HUDCorner({ position }) {
    const posMap = {
        'tl': 'top-0 left-0 border-t-2 border-l-2',
        'tr': 'top-0 right-0 border-t-2 border-r-2',
        'bl': 'bottom-0 left-0 border-b-2 border-l-2',
        'br': 'bottom-0 right-0 border-b-2 border-r-2',
    };
    return (
        <span className={`absolute w-5 h-5 border-cyan-400 ${posMap[position]}`} />
    );
}

export default function ScenarioGrid({ children, scenarioCount = 0, completedCount = 0 }) {
    const pct = scenarioCount > 0 ? Math.round((completedCount / scenarioCount) * 100) : 0;

    return (
        <div className="relative">
            {/* Outer chamber frame */}
            <div className="glass-card relative" style={{ borderRadius: '8px' }}>
                {/* Large HUD corner brackets */}
                <HUDCorner position="tl" />
                <HUDCorner position="tr" />
                <HUDCorner position="bl" />
                <HUDCorner position="br" />

                {/* Chamber header bar */}
                <div className="flex items-center gap-4 px-5 py-3 border-b border-[var(--lx-glass-border-sub)] bg-[var(--lx-glass)]/20">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--lx-accent)] animate-pulse" />
                        <span className="text-[10px] font-mono text-[var(--lx-accent)] tracking-widest uppercase select-none">
                            CHAMBER_SELECTION
                        </span>
                    </div>

                    <div className="h-px flex-1 bg-[var(--lx-glass-border-sub)]" />

                    {/* Cleared indicator */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-wider select-none">
                            {completedCount}/{scenarioCount}&nbsp;CLEARED
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

                    <span className="text-[10px] font-mono text-[var(--lx-text-muted)]/60 tracking-widest select-none">
                        SYS:ACTIVE
                    </span>
                </div>

                {/* Scan line */}
                <div className="relative overflow-hidden">
                    <motion.div
                        className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lx-accent)]/50 to-transparent pointer-events-none z-10"
                        initial={{ top: 0 }}
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 5, repeat: Infinity, repeatDelay: 8, ease: 'linear' }}
                    />
                    <div className="p-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
