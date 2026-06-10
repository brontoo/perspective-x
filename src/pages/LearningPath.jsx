import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS } from '@/components/scenarios/scenarioData';
import { LEARNING_PATHS, getPathProgress } from '@/data/learningPaths';
import {
    ArrowLeft, ArrowRight, CheckCircle2, Lock, Play,
    Loader2, Zap, BookOpen, Clock, Star, Trophy
} from 'lucide-react';

export default function LearningPath() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pathId = searchParams.get('path');

    const [completedScenarios, setCompletedScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendedPath, setRecommendedPath] = useState(null);

    const path = LEARNING_PATHS[pathId];

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/SignIn'); return; }

            const { data: rows } = await supabase
                .from('student_progress')
                .select('scenario_id, score')
                .eq('student_id', user.id)
                .gte('score', 80);

            const done = [...new Set((rows || []).map(r => r.scenario_id))];
            setCompletedScenarios(done);

            // Check if teacher recommended this path
            const { data: feedbackList } = await supabase
                .from('teacher_feedback')
                .select('*')
                .eq('student_email', user.email)
                .eq('type', 'path_recommendation')
                .order('created_at', { ascending: false })
                .limit(1);

            if (feedbackList && feedbackList.length > 0) {
                setRecommendedPath(feedbackList[0].message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="glass-card p-6 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[var(--lx-accent)] animate-spin" />
                    <span className="text-sm text-[var(--lx-text-muted)]">Loading path...</span>
                </div>
            </div>
        );
    }

    if (!path) {
        return (
            <div className="min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-sm">
                    <p className="text-slate-600 font-semibold mb-4">Learning path not found.</p>
                    <button onClick={() => navigate('/Dashboard')}
                        className="text-teal-600 font-bold text-sm flex items-center gap-1 mx-auto hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { completed, total, pct, nextScenarioId, isComplete } = getPathProgress(pathId, completedScenarios);
    const c = path.colorClasses;

    const isTeacherRecommended = recommendedPath === pathId;

    return (
        <div className="min-h-screen lx-bg-ambient">

            {/* ─── Header ─── */}
            <header className="sticky top-0 z-50 glass-nav">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/Dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${c.badge}`}>
                        {path.emoji} {path.title}
                    </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

                {/* ─── Teacher Recommendation Banner ─── */}
                {isTeacherRecommended && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4 border border-purple-200 bg-purple-50/70 flex items-center gap-3"
                    >
                        <span className="text-2xl">👨‍🏫</span>
                        <div>
                            <p className="text-purple-800 font-bold text-sm">Your teacher recommended this path for you!</p>
                            <p className="text-purple-600 text-xs mt-0.5">Work through each mission in order for the best learning experience.</p>
                        </div>
                    </motion.div>
                )}

                {/* ─── Path Hero ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass-card p-7 border ${c.border} ${c.bg} relative overflow-hidden`}
                >
                    <div className="absolute top-0 right-0 w-48 h-48 opacity-10 text-[10rem] leading-none pointer-events-none select-none">
                        {path.emoji}
                    </div>
                    <div className="relative">
                        {/* Title row */}
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">{path.emoji}</span>
                            <div>
                                <h1 className={`text-2xl font-extrabold ${c.heading}`}>{path.title}</h1>
                                <p className="text-slate-500 text-sm mt-0.5">{path.difficulty} · ~{path.estimatedMinutes} min total</p>
                            </div>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed mb-5 max-w-xl">{path.description}</p>

                        {/* Progress */}
                        <div className="mb-1 flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium">Your progress</span>
                            <span className={`text-sm font-bold ${c.heading}`}>{pct}%</span>
                        </div>
                        <div className="h-3 bg-white/70 rounded-full overflow-hidden border border-slate-200 mb-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                className={`h-full bg-gradient-to-r ${c.bar} rounded-full`}
                            />
                        </div>
                        <p className="text-xs text-slate-400">{completed} of {total} missions completed</p>

                        {/* CTA */}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            {isComplete ? (
                                <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border ${c.badge}`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Path Complete! {path.completionBadge}
                                </div>
                            ) : nextScenarioId ? (
                                <button
                                    onClick={() => navigate(`/ScenarioPlayer?scenario=${nextScenarioId}`)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition ${c.button}`}
                                >
                                    <Play className="w-4 h-4" />
                                    {completed === 0 ? 'Start Path' : 'Continue Path'}
                                </button>
                            ) : null}
                            {isComplete && (
                                <p className="text-slate-500 text-xs">{path.completionNote}</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ─── Mission List ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-500" />
                        Missions in this Path
                    </h2>

                    <div className="space-y-3">
                        {path.scenarios.map((sid, idx) => {
                            const scenario = SCENARIOS[sid];
                            if (!scenario) return null;

                            const isDone = completedScenarios.includes(sid);
                            const isNext = !isDone && sid === nextScenarioId;

                            return (
                                <motion.div
                                    key={sid}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * idx }}
                                >
                                    <button
                                        onClick={() => navigate(`/ScenarioPlayer?scenario=${sid}`)}
                                        className={`w-full glass-card p-5 text-left transition-all group border
                                            ${isDone
                                                ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300'
                                                : isNext
                                                ? `${c.border} ${c.bg} hover:shadow-md`
                                                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Step number / status icon */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 border
                                                ${isDone
                                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-600'
                                                    : isNext
                                                    ? `${c.icon} ${c.border}`
                                                    : 'bg-slate-100 border-slate-200 text-slate-400'
                                                }`}
                                            >
                                                {isDone
                                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    : scenario.badgeIcon || <span className="text-sm font-bold">{idx + 1}</span>
                                                }
                                            </div>

                                            {/* Mission details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                                        Mission {idx + 1}
                                                    </span>
                                                    {isNext && (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
                                                            Up Next
                                                        </span>
                                                    )}
                                                    {isDone && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
                                                            Done ✓
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`text-sm font-bold truncate mt-0.5 ${isDone ? 'text-emerald-800' : 'text-slate-800'}`}>
                                                    {scenario.title}
                                                </h3>
                                                <p className="text-slate-400 text-xs mt-0.5">
                                                    {scenario.strand || 'Science'} · ~{scenario.estimatedTime || 15} min
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1
                                                ${isDone ? 'text-emerald-400' : isNext ? c.heading.replace('text-', 'text-') : 'text-slate-300'}`}
                                            />
                                        </div>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ─── Skills Developed ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-slate-500" />
                        Skills You'll Develop
                    </h2>
                    <div className="glass-card p-5 border border-slate-100">
                        <div className="flex flex-wrap gap-2">
                            {path.skills.map(skillKey => {
                                const skillLabels = {
                                    data_interpretation: { label: 'Data Interpretation', icon: '📊' },
                                    scientific_reasoning: { label: 'Scientific Reasoning', icon: '🧬' },
                                    decision_making: { label: 'Decision-Making', icon: '🎯' },
                                    risk_analysis: { label: 'Risk Analysis', icon: '⚠️' },
                                    ethical_reasoning: { label: 'Ethical Reasoning', icon: '⚖️' },
                                    concept_application: { label: 'Concept Application', icon: '🧪' },
                                    communication: { label: 'Communication', icon: '📝' },
                                    reflection: { label: 'Reflection', icon: '🤔' },
                                };
                                const s = skillLabels[skillKey];
                                if (!s) return null;
                                return (
                                    <span key={skillKey}
                                        className={`text-sm px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 ${c.badge}`}>
                                        <span>{s.icon}</span> {s.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* ─── Completion card ─── */}
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`glass-card p-7 border ${c.border} ${c.bg} text-center`}
                    >
                        <div className="text-5xl mb-3">🎉</div>
                        <h3 className={`text-xl font-extrabold ${c.heading} mb-1`}>Path Complete!</h3>
                        <p className="text-slate-600 text-sm mb-3">{path.completionNote}</p>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${c.badge}`}>
                            <Trophy className="w-4 h-4" />
                            {path.completionBadge}
                        </div>
                    </motion.div>
                )}

                {/* ─── Footer navigation ─── */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={() => navigate('/Dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/RoleHub')}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium transition"
                    >
                        Browse by Role <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

            </main>
        </div>
    );
}
