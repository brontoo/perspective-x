
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function RoleCard({ role, onClick, index, progress }) {
    const completedCount = progress?.completed_scenarios?.filter(s =>
        role.scenarios.includes(s)
    ).length || 0;
    
    const isFullyComplete = completedCount === role.scenarios.length;
    
    // Format difficulty label (avoid uppercase/all-caps unless simple badge styling)
    const formattedDifficulty = role.difficulty ? role.difficulty.charAt(0).toUpperCase() + role.difficulty.slice(1).toLowerCase() : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={onClick}
            className="flex flex-col justify-between h-full bg-white/75 backdrop-blur-md border border-cyan-100/80 hover:border-cyan-300/90 rounded-2xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)] transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
            {/* Subtle top cyan line accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-cyan-500 opacity-60" />

            <div>
                {/* Header row: Icon & Difficulty */}
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-cyan-50/80 border border-cyan-100 rounded-xl flex items-center justify-center text-2xl">
                        {role.icon}
                    </div>
                    <span className="bg-cyan-50/50 text-cyan-700 border border-cyan-100/60 text-xs px-2.5 py-1 rounded-md font-medium tracking-wide">
                        {formattedDifficulty}
                    </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-snug font-heading">
                    {role.title}
                </h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {role.description}
                </p>
            </div>

            {/* Bottom Section */}
            <div>
                {/* Meta row: Missions count */}
                <div className="flex items-center justify-between mb-4 text-xs font-medium text-slate-500">
                    <span>
                        {role.scenarios.length === 1 ? '1 Mission' : `${role.scenarios.length} Missions`}
                    </span>
                    {completedCount > 0 && (
                        <span className="text-cyan-600">
                            {completedCount} Completed
                        </span>
                    )}
                </div>

                {/* Start / Review Button (Cyan style) */}
                <div className="w-full bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-cyan-100/50">
                    <span className="text-sm">
                        {isFullyComplete ? 'Review Role' : 'Start Role'}
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
}

