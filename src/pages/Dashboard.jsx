
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ROLES, SCENARIOS, BADGES, SKILLS } from '@/components/scenarios/scenarioData';
import {
    ArrowLeft, Trophy, Target, BarChart3, Clock,
    ChevronRight, Star, Zap, BookOpen, Loader2, MessageSquare
} from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => { loadProgress(); }, []);

    const loadProgress = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            // جلب تقدم الطالب
            const { data: progressList } = await supabase
                .from('student_progress')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (progressList && progressList.length > 0) {
                setProgress(progressList[0]);
            }

            // جلب الـ feedback الخاص بهذا الطالب
            const { data: feedbackList } = await supabase
                .from('teacher_feedback')
                .select('*')
                .eq('student_email', currentUser.email)
                .order('created_at', { ascending: false });

            setFeedbacks(feedbackList || []);

        } catch (e) {
            console.error('Error loading progress:', e);
        } finally {
            setLoading(false);
        }
    };

    const totalScenarios = Object.keys(SCENARIOS).length;
    const completedScenarios = progress?.completed_scenarios?.length || 0;
    const earnedBadges = progress?.badges?.length || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    const stats = [
        { label: 'Scenarios', value: `${completedScenarios}/${totalScenarios}`, Icon: BookOpen, from: 'from-teal-500/10', to: 'to-emerald-500/10', border: 'border-teal-500/30', bg: 'bg-teal-500/20', text: 'text-teal-400' },
        { label: 'Badges', value: earnedBadges, Icon: Trophy, from: 'from-amber-500/10', to: 'to-yellow-500/10', border: 'border-amber-500/30', bg: 'bg-amber-500/20', text: 'text-amber-400' },
        { label: 'Decisions Made', value: progress?.decision_history?.length || 0, Icon: Target, from: 'from-purple-500/10', to: 'to-pink-500/10', border: 'border-purple-500/30', bg: 'bg-purple-500/20', text: 'text-purple-400' },
        { label: 'Time Spent', value: `${progress?.total_time_spent || 0}m`, Icon: Clock, from: 'from-blue-500/10', to: 'to-cyan-500/10', border: 'border-blue-500/30', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-bold text-white">Student Dashboard</h1>
                    </div>
                    <button onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Learning
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">

                {/* Overview Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-8">Your Progress</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className={`bg-gradient-to-br ${stat.from} ${stat.to} border ${stat.border} rounded-xl p-6`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                        <stat.Icon className={`w-6 h-6 ${stat.text}`} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">{stat.label}</p>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Skills Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Skills Mastered</h2>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="grid gap-6">
                            {Object.entries(SKILLS).map(([key, skill]) => {
                                const value = progress?.skills?.[key] || 0;
                                const color = value >= 80 ? 'text-emerald-400' : value >= 50 ? 'text-teal-400' : value >= 20 ? 'text-amber-400' : 'text-slate-500';
                                const barColor = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-teal-500' : value >= 20 ? 'bg-amber-500' : 'bg-slate-600';
                                return (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{skill.icon}</span>
                                                <div>
                                                    <p className="text-white font-medium">{skill.name}</p>
                                                    <p className="text-slate-500 text-sm">{skill.description}</p>
                                                </div>
                                            </div>
                                            <span className={`text-lg font-bold ${color}`}>{value}%</span>
                                        </div>
                                        {/* Progress bar بدون مكتبة */}
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                                style={{ width: `${value}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Badges Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Earned Badges</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(BADGES).map(([badgeName, badge]) => {
                            const earned = progress?.badges?.includes(badgeName);
                            return (
                                <div key={badgeName}
                                    className={`rounded-xl p-6 text-center border transition-all ${earned
                                        ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30'
                                        : 'bg-slate-900/50 border-slate-800 opacity-40'}`}>
                                    <div className={`text-4xl mb-3 ${earned ? '' : 'grayscale'}`}>{badge.icon}</div>
                                    <p className={`text-sm font-medium ${earned ? 'text-white' : 'text-slate-500'}`}>{badgeName}</p>
                                    {earned && (
                                        <div className="mt-2 flex items-center justify-center gap-1">
                                            <Star className="w-3 h-3 text-amber-400" />
                                            <span className="text-xs text-amber-400">Earned</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Teacher Feedback */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-purple-400" /> Teacher Feedback
                    </h2>
                    {feedbacks.length === 0 ? (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No feedback from your teacher yet.</p>
                            <p className="text-slate-600 text-xs mt-1">Feedback will appear here once your teacher reviews your work.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {feedbacks.map(fb => {
                                const typeStyles = {
                                    praise: 'border-emerald-500/30 bg-emerald-500/5',
                                    improvement: 'border-amber-500/30 bg-amber-500/5',
                                    assignment: 'border-blue-500/30 bg-blue-500/5',
                                    general: 'border-slate-700 bg-slate-900/50',
                                }[fb.type] || 'border-slate-700 bg-slate-900/50';
                                const typeIcon = { praise: '🌟', improvement: '💡', assignment: '📋', general: '💬' }[fb.type] || '💬';
                                return (
                                    <div key={fb.id} className={`rounded-xl p-5 border ${typeStyles}`}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{typeIcon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-white font-medium text-sm">{fb.teacher_name || 'Teacher'}</p>
                                                    <span className="text-slate-600 text-xs capitalize">{fb.type}</span>
                                                </div>
                                                {fb.scenario_id && (
                                                    <p className="text-slate-500 text-xs mb-2">Re: {SCENARIOS[fb.scenario_id]?.title || fb.scenario_id}</p>
                                                )}
                                                <p className="text-slate-300 text-sm leading-relaxed">{fb.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Role Progress */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-2xl font-bold text-white mb-6">Role Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(ROLES).map((role) => {
                            const completed = progress?.completed_scenarios?.filter(s =>
                                role.scenarios.includes(s)).length || 0;
                            const percentage = (completed / role.scenarios.length) * 100;
                            return (
                                <button key={role.id} onClick={() => navigate(`/RoleHub?role=${role.id}`)}
                                    className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl p-6 text-left transition-all group w-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{role.icon}</span>
                                            <div>
                                                <h3 className="text-white font-semibold">{role.title}</h3>
                                                <p className="text-slate-500 text-sm">{completed}/{role.scenarios.length} scenarios</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }} />
                                    </div>
                                    {percentage === 100 && (
                                        <div className="mt-3 flex items-center gap-1 text-emerald-400">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-sm font-medium">Complete!</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

            </main>
        </div>
    );
}