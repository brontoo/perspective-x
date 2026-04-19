import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Lock, CheckCircle2, Play, Beaker, Dna, Mountain, Zap, Rocket, AlertCircle } from 'lucide-react';
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
            whileHover={config.interactive ? { 
                y: -8, 
                transition: { duration: 0.3, ease: 'easeOut' }
            } : {}}
            onClick={config.interactive ? onClick : undefined}
            className={`group relative rounded-3xl border p-7 transition-all duration-500 overflow-hidden ${config.bgClass} ${config.interactive ? 'cursor-pointer hover:shadow-2xl hover:shadow-black/40' : 'opacity-50'}`}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {/* Glowing Corner */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-60 transition-opacity duration-700 ${config.iconClass.replace('text', 'bg')}`} />

            {/* Scanning Line Animation */}
            {config.interactive && (
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-y-full group-hover:animate-scan pointer-events-none" />
            )}

            {/* Status indicator */}
            <div className="absolute top-5 right-5 z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${config.bgClass} backdrop-blur-md border border-white/10 shadow-lg`}>
                    <StatusIcon className={`w-6 h-6 ${config.iconClass} drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]`} />
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
                <div className="flex flex-wrap gap-2 mb-6">
                    {scenario.scienceFocus.slice(0, 3).map((focus, i) => (
                        <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900/80 text-slate-400 border border-slate-700/50 backdrop-blur-sm group-hover:border-slate-600 transition-colors">
                            {focus}
                        </span>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{scenario.estimatedTime} MIN</span>
                    </div>

                    {status === 'completed' && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            <span className="text-lg">{scenario.badgeIcon}</span>
                            <span className="text-[10px] text-emerald-400 font-bold tracking-tighter uppercase">{scenario.badge}</span>
                        </div>
                    )}

                    {status === 'unlocked' && (
                        <div className="flex items-center gap-1 text-teal-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                            <span>START MISSION</span>
                            <Play className="w-3 h-3 fill-current" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}