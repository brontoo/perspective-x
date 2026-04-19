import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SCENARIOS } from '@/components/scenarios/scenarioData';

const colorClasses = {
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        gradient: 'from-emerald-500/20 to-emerald-600/10',
        hover: 'hover:border-emerald-400/50',
        badge: 'bg-emerald-500/20 text-emerald-300',
        dot: 'bg-emerald-500'
    },
    purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        gradient: 'from-purple-500/20 to-purple-600/10',
        hover: 'hover:border-purple-400/50',
        badge: 'bg-purple-500/20 text-purple-300',
        dot: 'bg-purple-500'
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        gradient: 'from-blue-500/20 to-blue-600/10',
        hover: 'hover:border-blue-400/50',
        badge: 'bg-blue-500/20 text-blue-300',
        dot: 'bg-blue-500'
    },
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        gradient: 'from-amber-500/20 to-amber-600/10',
        hover: 'hover:border-amber-400/50',
        badge: 'bg-amber-500/20 text-amber-300',
        dot: 'bg-amber-500'
    },
    red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        gradient: 'from-red-500/20 to-red-600/10',
        hover: 'hover:border-red-400/50',
        badge: 'bg-red-500/20 text-red-300',
        dot: 'bg-red-500'
    },
    orange: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        gradient: 'from-orange-500/20 to-orange-600/10',
        hover: 'hover:border-orange-400/50',
        badge: 'bg-orange-500/20 text-orange-300',
        dot: 'bg-orange-500'
    },
    teal: {
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/30',
        text: 'text-teal-400',
        gradient: 'from-teal-500/20 to-teal-600/10',
        hover: 'hover:border-teal-400/50',
        badge: 'bg-teal-500/20 text-teal-300',
        dot: 'bg-teal-500'
    },
    green: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
        gradient: 'from-green-500/20 to-green-600/10',
        hover: 'hover:border-green-400/50',
        badge: 'bg-green-500/20 text-green-300',
        dot: 'bg-green-500'
    }
};

export default function RoleCard({ role, onClick, index, progress }) {
    const colors = colorClasses[role.color] || colorClasses.emerald;
    const completedCount = progress?.completed_scenarios?.filter(s =>
        role.scenarios.includes(s)
    ).length || 0;
    const percentage = Math.round((completedCount / role.scenarios.length) * 100);
    const isFullyComplete = percentage === 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={onClick}
            className="relative cursor-pointer group"
        >
            <div className={`relative rounded-3xl border ${colors.border} ${colors.hover} bg-gradient-to-br ${colors.gradient} backdrop-blur-sm p-8 transition-all duration-300 overflow-hidden`}>
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${colors.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

                {/* Complete badge */}
                {isFullyComplete && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-semibold">Complete</span>
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                        <span className="text-4xl">{role.icon}</span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-white mb-2">{role.title}</h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">{role.description}</p>

                    {/* Difficulty badge */}
                    <Badge className={`${colors.badge} border-0 mb-4`}>
                        {role.difficulty}
                    </Badge>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Progress</span>
                            <span className={colors.text}>{completedCount}/{role.scenarios.length}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                                className={`h-full ${colors.dot} rounded-full`}
                            />
                        </div>

                        {/* Scenario dots */}
                        <div className="flex gap-1.5 flex-wrap">
                            {role.scenarios.map((scenarioId) => {
                                const isCompleted = progress?.completed_scenarios?.includes(scenarioId);
                                const scenario = SCENARIOS[scenarioId];
                                return (
                                    <div
                                        key={scenarioId}
                                        title={scenario?.title || scenarioId}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${isCompleted
                                                ? `w-5 ${colors.dot}`
                                                : 'w-1.5 bg-slate-700'
                                            }`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Action */}
                    <div className={`flex items-center gap-2 ${colors.text} font-medium group-hover:gap-3 transition-all`}>
                        <span>{isFullyComplete ? 'Review Role' : 'Enter Role'}</span>
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}