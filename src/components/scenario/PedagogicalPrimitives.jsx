import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// ── Pedagogical Primitives ──────────────────────────────────────────────
// Standalone visual building blocks used across scenario visuals,
// consequence screens, and other learning-focused components.
// No dependency on ScenarioVisual to avoid circular imports.

const RISK_LEVELS = {
    low: { label: 'Low', segment: 0, color: 'bg-emerald-500', textColor: 'text-emerald-400', glowColor: 'shadow-emerald-500/30' },
    medium: { label: 'Medium', segment: 1, color: 'bg-amber-500', textColor: 'text-amber-400', glowColor: 'shadow-amber-500/30' },
    high: { label: 'High', segment: 2, color: 'bg-rose-500', textColor: 'text-rose-400', glowColor: 'shadow-rose-500/30' },
};

export function RiskMeter({ level = 'low', label = 'Risk Level', className = '' }) {
    const config = RISK_LEVELS[level] || RISK_LEVELS.low;

    return (
        <div className={`w-full max-w-xs ${className}`.trim()}>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-slate-400">{label}</span>
                <span className={`text-[10px] font-bold ${config.textColor}`}>{config.label}</span>
            </div>
            <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-slate-800/60 p-0.5">
                {['low', 'medium', 'high'].map((seg, i) => {
                    const segConfig = RISK_LEVELS[seg];
                    const isActive = i <= config.segment;
                    return (
                        <motion.div
                            key={seg}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isActive ? 1 : 0.15 }}
                            transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
                            className={`flex-1 rounded-full origin-left ${isActive ? segConfig.color : 'bg-slate-700/40'}`}
                        />
                    );
                })}
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-[8px] text-slate-500">Low</span>
                <span className="text-[8px] text-slate-500">Medium</span>
                <span className="text-[8px] text-slate-500">High</span>
            </div>
        </div>
    );
}

const STATUS_STYLES = {
    normal: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400' },
    critical: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-300', dot: 'bg-rose-400' },
    info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-400' },
};

export function DataLabel({ label, value, unit = '', status = 'info', className = '' }) {
    const style = STATUS_STYLES[status] || STATUS_STYLES.info;

    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${className}`.trim()}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            <span className="text-[10px] font-medium text-slate-400">{label}:</span>
            <span className={`text-xs font-bold font-mono ${style.text}`}>
                {value}{unit && <span className="text-[9px] ml-0.5 font-normal opacity-70">{unit}</span>}
            </span>
        </motion.div>
    );
}

export function BeforeAfterPanel({ 
    beforeLabel = 'Before', 
    afterLabel = 'After',
    beforeContent,
    afterContent,
    beforeRisk,
    afterRisk,
    riskLabel = 'Risk Level',
    className = '' 
}) {
    return (
        <div className={`w-full ${className}`.trim()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Before Panel */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                    <div className="px-3 py-1.5 bg-slate-700/40 border-b border-slate-600/30 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="text-[10px] font-bold text-slate-300">{beforeLabel}</span>
                    </div>
                    <div className="p-3">
                        {typeof beforeContent === 'string' 
                            ? <p className="text-sm text-slate-300">{beforeContent}</p>
                            : beforeContent}
                        {beforeRisk && (
                            <div className="mt-2">
                                <RiskMeter level={beforeRisk} label={riskLabel} />
                            </div>
                        )}
                    </div>
                </div>

                {/* After Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden"
                >
                    <div className="px-3 py-1.5 bg-slate-700/40 border-b border-slate-600/30 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        <span className="text-[10px] font-bold text-teal-300">{afterLabel}</span>
                    </div>
                    <div className="p-3">
                        {typeof afterContent === 'string'
                            ? <p className="text-sm text-slate-300">{afterContent}</p>
                            : afterContent}
                        {afterRisk && (
                            <div className="mt-2">
                                <RiskMeter level={afterRisk} label={riskLabel} />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Risk Change Arrow */}
            {beforeRisk && afterRisk && beforeRisk !== afterRisk && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center justify-center gap-2 mt-3 py-2"
                >
                    <span className={`text-xs font-bold ${RISK_LEVELS[beforeRisk]?.textColor || 'text-slate-400'}`}>
                        {RISK_LEVELS[beforeRisk]?.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <span className={`text-xs font-bold ${RISK_LEVELS[afterRisk]?.textColor || 'text-slate-400'}`}>
                        {RISK_LEVELS[afterRisk]?.label}
                    </span>
                </motion.div>
            )}
        </div>
    );
}
