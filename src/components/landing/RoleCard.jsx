import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Target, Brain, Leaf, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const colorClasses = {
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        gradient: 'from-emerald-500/20 to-emerald-600/10',
        hover: 'hover:border-emerald-400/50',
        badge: 'bg-emerald-500/20 text-emerald-300'
    },
    purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        gradient: 'from-purple-500/20 to-purple-600/10',
        hover: 'hover:border-purple-400/50',
        badge: 'bg-purple-500/20 text-purple-300'
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        gradient: 'from-blue-500/20 to-blue-600/10',
        hover: 'hover:border-blue-400/50',
        badge: 'bg-blue-500/20 text-blue-300'
    },
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        gradient: 'from-amber-500/20 to-amber-600/10',
        hover: 'hover:border-amber-400/50',
        badge: 'bg-amber-500/20 text-amber-300'
    },
    red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        gradient: 'from-red-500/20 to-red-600/10',
        hover: 'hover:border-red-400/50',
        badge: 'bg-red-500/20 text-red-300'
    },
    orange: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        gradient: 'from-orange-500/20 to-orange-600/10',
        hover: 'hover:border-orange-400/50',
        badge: 'bg-orange-500/20 text-orange-300'
    }
};

const focusIcons = {
    'Critical thinking': Brain,
    'Scientific reasoning': Target,
    'Ethics': Leaf,
    'Data interpretation': BarChart3
};

export default function RoleCard({ role, onClick, index, progress }) {
    const colors = colorClasses[role.color] || colorClasses.emerald;
    const completedScenarios = progress?.completed_scenarios?.filter(s =>
        role.scenarios.includes(s)
    ).length || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={onClick}
            className={`relative cursor-pointer group`}
        >
            <div className={`relative rounded-3xl border ${colors.border} ${colors.hover} bg-gradient-to-br ${colors.gradient} backdrop-blur-sm p-8 transition-all duration-300 overflow-hidden`}>
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${colors.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

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
                            <span className={colors.text}>{completedScenarios}/{role.scenarios.length}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(completedScenarios / role.scenarios.length) * 100}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                                className={`h-full bg-gradient-to-r ${colors.gradient.replace('/20', '').replace('/10', '')} rounded-full`}
                                style={{
                                    background: `linear-gradient(to right, var(--${role.color}-500), var(--${role.color}-400))`
                                }}
                            />
                        </div>
                    </div>

                    {/* Action */}
                    <div className={`flex items-center gap-2 ${colors.text} font-medium group-hover:gap-3 transition-all`}>
                        <span>Enter Role</span>
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}