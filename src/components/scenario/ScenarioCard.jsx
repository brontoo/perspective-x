import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Lock, CheckCircle2, Play, Beaker, Dna, Mountain, Zap, Rocket, Star, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const strandIcons = {
    'Chemistry': Beaker,
    'Biology': Dna,
    'Earth Science': Mountain,
    'Physics': Zap,
    'Space Science': Rocket
};

const statusConfig = {
    completed: {
        icon: CheckCircle2,
        label: 'Completed',
        bgClass: 'bg-emerald-500/10 border-emerald-500/30',
        iconClass: 'text-emerald-400',
        interactive: true
    },
    unlocked: {
        icon: Play,
        label: 'Ready to Play',
        bgClass: 'bg-teal-500/10 border-teal-500/30',
        iconClass: 'text-teal-400',
        interactive: true
    },
    locked: {
        icon: Lock,
        label: 'Locked',
        bgClass: 'bg-slate-800/50 border-slate-700',
        iconClass: 'text-slate-500',
        interactive: false
    }
};

const difficultyConfig = {
    beginner: { label: '🟢 Beginner', bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    'on-level': { label: '🟡 On-Level', bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    'high-achievers': { label: '🔴 High Achievers', bgClass: 'bg-red-500/20 text-red-400 border-red-500/30' }
};

export default function ScenarioCard({ scenario, status, index, roleColor, onClick, settings }) {
    const difficulty = settings?.difficulty_override || 'on-level';
    const diffConfig = difficultyConfig[difficulty];
    const isMandatory = settings?.is_mandatory;
    const config = statusConfig[status];
    const StrandIcon = strandIcons[scenario.strand] || Beaker;
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={config.interactive ? { y: -4, scale: 1.01 } : {}}
            onClick={config.interactive ? onClick : undefined}
            className={`relative rounded-2xl border p-6 transition-all duration-300 ${config.bgClass} ${config.interactive ? 'cursor-pointer hover:shadow-xl hover:shadow-black/20' : 'opacity-60'}`}
        >
            {/* Status indicator */}
            <div className="absolute top-4 right-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgClass}`}>
                    <StatusIcon className={`w-5 h-5 ${config.iconClass}`} />
                </div>
            </div>

            {/* Content */}
            <div className="pr-12">
                {/* Difficulty & Mandatory badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className={`text-xs ${diffConfig.bgClass}`}>
                        {diffConfig.label}
                    </Badge>
                    {isMandatory && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Required
                        </Badge>
                    )}
                </div>

                {/* Strand badge */}
                <div className="flex items-center gap-2 mb-4">
                    <StrandIcon className="w-4 h-4 text-slate-400" />
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {scenario.strand}
                    </Badge>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2">{scenario.title}</h3>

                {/* Context preview */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {scenario.context}
                </p>

                {/* Science focus tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {scenario.scienceFocus.slice(0, 3).map((focus, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                            {focus}
                        </span>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{scenario.estimatedTime} min</span>
                    </div>

                    {status === 'completed' && (
                        <div className="flex items-center gap-1">
                            <span className="text-lg">{scenario.badgeIcon}</span>
                            <span className="text-xs text-emerald-400 font-medium">{scenario.badge}</span>
                        </div>
                    )}

                    {status === 'unlocked' && (
                        <span className="text-sm text-teal-400 font-medium">Start →</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}