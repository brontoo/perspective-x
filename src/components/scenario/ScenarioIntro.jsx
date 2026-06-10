import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, MapPin, BookOpen, GraduationCap, Award } from 'lucide-react';

/* ── Shared sub-components ──────────────────────────────────────────────── */



/* ── Stat row ────────────────────────────────────────────────────────────── */
function StatRow({ label, value, icon: Icon }) {
    return (
        <div className="bg-white border border-slate-200 flex items-center justify-between px-5 py-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <Icon className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">
                    {label}
                </span>
            </div>
            <span className="text-sm font-sans font-bold text-slate-800">
                {value}
            </span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ScenarioIntro({ scenario, onStart, isTeacher, theme }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            {/* ── Outer Case Study Frame ── */}
            <div className="glass-card border border-slate-200 bg-white/80 rounded-xl relative overflow-hidden shadow-2xl">

                {/* Case Study Header Bar */}
                <div className="flex items-center justify-between bg-slate-50/80 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
                        <span className="text-xs font-mono text-cyan-700 tracking-widest uppercase select-none font-bold">
                            Story
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase select-none font-semibold">
                            UAE National Curriculum
                        </span>
                    </div>
                </div>

                <div className="relative z-10 p-8">

                    {/* ── Character + Briefing Row ── */}
                    <div className="flex flex-col md:flex-row gap-8 mb-8">

                        {/* Left: Investigator Profile */}
                        <motion.div
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                            className="shrink-0"
                        >
                            <div className="bg-white border border-slate-200 relative p-6 rounded-xl w-full md:w-[240px] flex flex-col items-center text-center shadow-md">

                                <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-4 select-none font-semibold">
                                    My Role
                                </div>

                                {/* Avatar */}
                                <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-5xl mb-4 select-none shadow-inner">
                                    {scenario.character?.avatar || '👩‍🔬'}
                                </div>

                                {/* Name */}
                                <div className="text-lg font-bold text-slate-900 mb-2 leading-snug font-sans">
                                    {scenario.character?.name || 'Authorized Personnel'}
                                </div>

                                <div className="text-xs text-cyan-600 font-bold uppercase tracking-wider mb-4 font-mono">
                                    {scenario.character?.title || scenario.role}
                                </div>

                                <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">
                                        Role Difficulty
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">
                                        {scenario.difficulty || 'ON-TRACK'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Briefing / Context Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="flex-1 min-w-0 flex flex-col justify-between"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                                        <BookOpen className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <span className="text-xs font-mono text-slate-500 tracking-widest uppercase font-bold">
                                        Scenario Focus
                                    </span>
                                </div>

                                <div className="border-l-3 border-[#14b8a6] pl-4">
                                    <p className="text-slate-800 text-lg font-light leading-relaxed font-sans italic">
                                        "{scenario.roleQuote || 'Awaiting scenario parameters...'}"
                                    </p>
                                </div>

                                {/* UAE Context Panel */}
                                {scenario.uaeContext && (
                                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-lg shadow-inner">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                                            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">
                                                UAE Context & Location
                                            </span>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                            {scenario.uaeContext}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Stats + Science Focus Grid ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8"
                    >
                        {/* Stats column */}
                        <div className="space-y-3">
                            <StatRow
                                label="Estimated Time"
                                value={`${scenario.estimatedTime} Minutes`}
                                icon={Clock}
                            />
                            <StatRow
                                label="Core Discipline"
                                value={scenario.strand}
                                icon={GraduationCap}
                            />
                            <StatRow
                                label="Key Achievement"
                                value={scenario.badge || 'Scientific Explorer'}
                                icon={Award}
                            />
                        </div>

                        {/* Science Focus Column */}
                        <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-lg flex flex-col justify-between shadow-inner">
                            <div>
                                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase block mb-3 select-none font-bold">
                                    Target Learning Standards
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {scenario.scienceFocus?.map((focus) => (
                                        <span
                                            key={focus}
                                            className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md hover:border-cyan-500/40 transition-colors shadow-sm font-medium"
                                        >
                                            {focus}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Accept / Begin Button ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={onStart}
                            className="w-full relative overflow-hidden bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold py-4 text-base tracking-widest uppercase group transition-colors shadow-lg shadow-[#14b8a6]/20"
                            style={{ borderRadius: '8px', fontFamily: "inherit" }}
                        >
                            {/* Sweep sheen */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                            <div className="relative flex items-center justify-center gap-3">
                                <Play className="w-5 h-5 fill-current shrink-0" />
                                {isTeacher ? 'Preview Mission' : 'Start Mission'}
                            </div>
                        </motion.button>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
}
