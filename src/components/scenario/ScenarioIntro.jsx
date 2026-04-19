import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, BookOpen, Play, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScenarioIntro({ scenario, onStart, isTeacher, theme }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto"
        >
            <div className={`relative overflow-hidden rounded-[2.5rem] border ${theme.border} bg-slate-950/80 backdrop-blur-xl p-1 shadow-2xl ${theme.glow}`}>
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent animate-pulse" />
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="p-10 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                        <div className="relative group">
                            <motion.div
                                animate={{ boxShadow: ['0 0 0px rgba(20,184,166,0)', '0 0 20px rgba(20,184,166,0.3)', '0 0 0px rgba(20,184,166,0)'] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className={`w-32 h-32 rounded-[2rem] bg-gradient-to-br ${theme.accent} p-0.5 shadow-2xl relative z-10`}
                            >
                                <div className="w-full h-full rounded-[2rem] bg-slate-900 flex items-center justify-center text-6xl">
                                    {scenario.character?.avatar || '🧑‍🔬'}
                                </div>
                            </motion.div>
                            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-teal-500/40 rounded-tl-xl" />
                            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-teal-500/40 rounded-br-xl" />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-800 border ${theme.border} ${theme.text}`}>
                                    Mission Personnel
                                </span>
                                <span className="w-12 h-px bg-slate-800" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                {scenario.character?.name || 'Authorized Personnel'}
                            </h2>
                            <p className="text-slate-400 text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                {scenario.character?.title || scenario.role}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7 space-y-8">
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-1.5 rounded bg-slate-800 border border-white/5">
                                        <BookOpen className={`w-4 h-4 ${theme.text}`} />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Strategic Briefing</h4>
                                </div>
                                <div className={`rounded-3xl p-6 border-l-4 bg-slate-900/40 ${theme.border} backdrop-blur-sm`}>
                                    <p className="text-slate-200 italic text-xl leading-relaxed font-serif">
                                        "{scenario.roleQuote || 'Standing by for mission parameters...'}"
                                    </p>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-1.5 rounded bg-slate-800 border border-white/5">
                                        <MapPin className={`w-4 h-4 ${theme.text}`} />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Regional Intelligence</h4>
                                </div>
                                <div className={`rounded-3xl p-6 border bg-slate-900/40 ${theme.border}`}>
                                    <p className="text-slate-300 leading-relaxed text-sm">
                                        {scenario.uaeContext || 'No additional regional data available.'}
                                    </p>
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { icon: <Clock className="w-4 h-4" />, label: 'Mission Duration', value: `${scenario.estimatedTime} Minutes` },
                                    { icon: <Target className="w-4 h-4" />, label: 'Operational Strand', value: scenario.strand },
                                ].map((stat) => (
                                    <div key={stat.label} className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/60 border border-white/5 group hover:border-teal-500/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-slate-800 ${theme.text}`}>
                                                {stat.icon}
                                            </div>
                                            <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{stat.label}</span>
                                        </div>
                                        <span className="text-white font-mono font-bold">{stat.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={`p-6 rounded-3xl border ${theme.border} bg-slate-900/40`}>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Science Focus Areas</h4>
                                <div className="flex flex-wrap gap-2">
                                    {scenario.scienceFocus?.map((focus) => (
                                        <span key={focus} className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-white/5 bg-slate-800/80 text-slate-300 hover:border-teal-500/30 transition-colors">
                                            {focus}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={onStart}
                                size="lg"
                                className={`w-full bg-gradient-to-r ${theme.accent} hover:opacity-90 py-8 text-xl font-black rounded-[2rem] shadow-2xl group relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <div className="relative flex items-center justify-center gap-3 uppercase tracking-[0.1em]">
                                    <Play className="w-6 h-6 fill-current" />
                                    {isTeacher ? 'Preview Mission' : 'Accept Assignment'}
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}