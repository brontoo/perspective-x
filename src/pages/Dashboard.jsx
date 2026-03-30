
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ROLES, SCENARIOS, BADGES, SKILLS } from '@/components/scenarios/scenarioData';
import {
    ArrowLeft, Trophy, Target, BarChart3, Clock,
    ChevronRight, Star, Zap, BookOpen, Loader2,
    MessageSquare, Bell, CheckCheck, LogOut, Settings
} from 'lucide-react';


export default function Dashboard() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');


    useEffect(() => { loadProgress(); }, []);


    const loadProgress = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', currentUser.id)
                .single();
            setProfile(profileData);

            const { data: progressRows } = await supabase
                .from('student_progress')
                .select('*')
                .eq('student_id', currentUser.id)
                .order('completed_at', { ascending: false });

            if (progressRows && progressRows.length > 0) {
                const completedScenarios = progressRows
                    .filter(r => r.scenario_id !== null && r.score >= 70)
                    .map(r => r.scenario_id);
                const badges = progressRows
                    .filter(r => r.scenario_id !== null && r.score >= 70)
                    .map(r => SCENARIOS[r.scenario_id]?.badge)
                    .filter(Boolean);

                const skillsMap = {};
                const skillKeys = Object.keys(SKILLS);
                progressRows.forEach(row => {
                    const scenarioData = SCENARIOS[row.scenario_id];
                    if (scenarioData && row.score > 0) {
                        scenarioData.scienceFocus?.forEach((focus, i) => {
                            const key = skillKeys[i % skillKeys.length];
                            if (key) {
                                const gained = Math.round((row.score / 100) * 25);
                                skillsMap[key] = Math.min(100, (skillsMap[key] || 0) + gained);
                            }
                        });
                    }
                });

                setProgress({
                    completed_scenarios: completedScenarios,
                    badges: [...new Set(badges)],
                    decision_history: progressRows,
                    total_time_spent: progressRows.length * 15,
                    skills: skillsMap
                });
            }

            const { data: feedbackList } = await supabase
                .from('teacher_feedback')
                .select('*')
                .eq('student_email', currentUser.email)
                .order('created_at', { ascending: false });

            setFeedbacks(feedbackList || []);

            const unread = (feedbackList || []).filter(fb => {
                const diffHours = (new Date() - new Date(fb.created_at)) / (1000 * 60 * 60);
                return diffHours < 24;
            });
            setUnreadCount(unread.length);

        } catch (e) {
            console.error('Error loading progress:', e);
        } finally {
            setLoading(false);
        }
    };


    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };


    const totalScenarios = Object.keys(SCENARIOS).length;
    const completedScenarios = progress?.completed_scenarios?.length || 0;
    const earnedBadges = progress?.badges?.length || 0;
    const overallPercentage = Math.round((completedScenarios / totalScenarios) * 100);


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


    const tabs = [
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'skills', label: 'Skills', icon: Zap },
        { key: 'badges', label: 'Badges', icon: Trophy },
        { key: 'feedback', label: 'Feedback', icon: MessageSquare, badge: unreadCount },
        { key: 'roles', label: 'Roles', icon: BookOpen },
    ];


    const getLevel = () => {
        if (overallPercentage >= 80) return { label: 'Expert', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' };
        if (overallPercentage >= 50) return { label: 'Advanced', color: 'text-teal-400', bg: 'bg-teal-500/20 border-teal-500/30' };
        if (overallPercentage >= 20) return { label: 'Intermediate', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' };
        return { label: 'Beginner', color: 'text-slate-400', bg: 'bg-slate-700/50 border-slate-600/30' };
    };
    const level = getLevel();


    const displayName = profile?.full_name || user?.email?.split('@')[0];


    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                <span className="text-slate-400 text-xs">Welcome,</span>
                                <span className="text-teal-300 text-xs font-bold tracking-wide">
                                    {displayName}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* 🔔 Feedback Bell */}
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className="relative p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>

                        {/* 🏆 Leaderboard — جديد */}
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition text-sm px-3 py-2 rounded-lg hover:bg-amber-500/10">
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:block">Leaderboard</span>
                        </button>

                        {/* ⚙️ Settings */}
                        <button
                            onClick={() => navigate('/ProfileSettings')}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition text-sm px-3 py-2 rounded-lg hover:bg-slate-800">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:block">Settings</span>
                        </button>

                        {/* 🏠 Home */}
                        <button onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm px-3 py-2 rounded-lg hover:bg-slate-800">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:block">Home</span>
                        </button>

                        {/* 🚪 Sign Out */}
                        <button onClick={handleLogout}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm px-3 py-2 rounded-lg hover:bg-slate-800">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:block">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">

                {/* Hero Progress Banner */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-teal-500/10 via-slate-900/50 to-emerald-500/10 border border-teal-500/20 rounded-2xl p-8 mb-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-teal-500/30">
                                {displayName[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Welcome back,</p>
                                <p className="text-white font-bold text-xl">{displayName}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${level.bg} ${level.color}`}>
                                    {level.label}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400 text-sm">Overall Progress</span>
                                <span className="text-white font-bold text-lg">{overallPercentage}%</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallPercentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full relative">
                                    {overallPercentage > 5 && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-80" />
                                    )}
                                </motion.div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-slate-600 text-xs">{completedScenarios} completed</span>
                                <span className="text-slate-600 text-xs">{totalScenarios - completedScenarios} remaining</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-black text-amber-400">{earnedBadges}</p>
                                <p className="text-slate-500 text-xs">Badges</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-purple-400">{progress?.decision_history?.length || 0}</p>
                                <p className="text-slate-500 text-xs">Decisions</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className={`bg-gradient-to-br ${stat.from} ${stat.to} border ${stat.border} rounded-xl p-5`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.Icon className={`w-5 h-5 ${stat.text}`} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">{stat.label}</p>
                                    <p className="text-xl font-bold text-white">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit mb-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.key
                                ? 'bg-teal-500/20 text-teal-400'
                                : 'text-slate-400 hover:text-white'}`}>
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.badge > 0 && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Role Progress</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.values(ROLES).map((role) => {
                                    const completed = progress?.completed_scenarios?.filter(s =>
                                        role.scenarios.includes(s)).length || 0;
                                    const percentage = Math.round((completed / role.scenarios.length) * 100);
                                    return (
                                        <button key={role.id} onClick={() => navigate(`/RoleHub?role=${role.id}`)}
                                            className="bg-slate-800/50 border border-slate-700 hover:border-teal-500/30 rounded-xl p-5 text-left transition-all group w-full">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{role.icon}</span>
                                                    <div>
                                                        <h3 className="text-white font-semibold text-sm">{role.title}</h3>
                                                        <p className="text-slate-500 text-xs">{completed}/{role.scenarios.length} done</p>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-bold ${percentage === 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                    {percentage}%
                                                </span>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                                                <div className={`h-full rounded-full transition-all ${percentage === 100
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                    : 'bg-gradient-to-r from-teal-500 to-emerald-500'}`}
                                                    style={{ width: `${percentage}%` }} />
                                            </div>

                                            {/* Scenario dots */}
                                            <div className="flex gap-1.5 flex-wrap">
                                                {role.scenarios.map((scenarioId) => {
                                                    const isComp = progress?.completed_scenarios?.includes(scenarioId);
                                                    const scenario = SCENARIOS[scenarioId];
                                                    return (
                                                        <div key={scenarioId}
                                                            title={scenario?.title || scenarioId}
                                                            className={`h-2 rounded-full transition-all ${isComp
                                                                ? 'bg-emerald-500 w-6'
                                                                : 'bg-slate-600 w-2'}`} />
                                                    );
                                                })}
                                            </div>

                                            {percentage === 100 && (
                                                <div className="mt-2 flex items-center gap-1 text-emerald-400">
                                                    <Zap className="w-3 h-3" />
                                                    <span className="text-xs font-medium">Complete!</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Top Skills</h2>
                                <button onClick={() => setActiveTab('skills')}
                                    className="text-teal-400 text-sm hover:text-teal-300 transition flex items-center gap-1">
                                    View all <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(SKILLS).slice(0, 3).map(([key, skill]) => {
                                    const value = progress?.skills?.[key] || 0;
                                    const barColor = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-teal-500' : value >= 20 ? 'bg-amber-500' : 'bg-slate-600';
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-slate-300 text-sm">{skill.icon} {skill.name}</span>
                                                <span className="text-slate-400 text-sm font-semibold">{value}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${value}%` }}
                                                    transition={{ duration: 0.8, delay: 0.2 }}
                                                    className={`h-full ${barColor} rounded-full`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Skills Mastered</h2>
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
                                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${value}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className={`h-full ${barColor} rounded-full`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Object.entries(BADGES).map(([badgeName, badge]) => {
                                const earned = progress?.badges?.includes(badgeName);
                                return (
                                    <motion.div key={badgeName}
                                        whileHover={earned ? { scale: 1.05 } : {}}
                                        className={`rounded-xl p-6 text-center border transition-all ${earned
                                            ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10'
                                            : 'bg-slate-900/50 border-slate-800 opacity-40'}`}>
                                        <div className={`text-4xl mb-3 ${earned ? '' : 'grayscale'}`}>{badge.icon}</div>
                                        <p className={`text-sm font-medium ${earned ? 'text-white' : 'text-slate-500'}`}>{badgeName}</p>
                                        {earned ? (
                                            <div className="mt-2 flex items-center justify-center gap-1">
                                                <Star className="w-3 h-3 text-amber-400" />
                                                <span className="text-xs text-amber-400">Earned</span>
                                            </div>
                                        ) : (
                                            <p className="text-slate-600 text-xs mt-1">Locked</p>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                Teacher Feedback
                                {unreadCount > 0 && (
                                    <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </h2>
                            {feedbacks.length > 0 && (
                                <div className="flex items-center gap-1 text-slate-500 text-xs">
                                    <CheckCheck className="w-4 h-4" />
                                    {feedbacks.length} message{feedbacks.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                        {feedbacks.length === 0 ? (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
                                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">No feedback from your teacher yet.</p>
                                <p className="text-slate-600 text-xs mt-1">Feedback will appear here once your teacher reviews your work.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {feedbacks.map(fb => {
                                    const isNew = (new Date() - new Date(fb.created_at)) / (1000 * 60 * 60) < 24;
                                    const typeStyles = {
                                        praise: 'border-emerald-500/30 bg-emerald-500/5',
                                        improvement: 'border-amber-500/30 bg-amber-500/5',
                                        assignment: 'border-blue-500/30 bg-blue-500/5',
                                        general: 'border-slate-700 bg-slate-900/50',
                                    }[fb.type] || 'border-slate-700 bg-slate-900/50';
                                    const typeIcon = { praise: '🌟', improvement: '💡', assignment: '📋', general: '💬' }[fb.type] || '💬';
                                    return (
                                        <motion.div key={fb.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`rounded-xl p-5 border ${typeStyles} relative`}>
                                            {isNew && (
                                                <span className="absolute top-3 right-3 text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">New</span>
                                            )}
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{typeIcon}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-white font-medium text-sm">{fb.teacher_name || 'Teacher'}</p>
                                                        <span className="text-slate-600 text-xs">•</span>
                                                        <span className="text-slate-500 text-xs capitalize">{fb.type}</span>
                                                        <span className="text-slate-600 text-xs">•</span>
                                                        <span className="text-slate-600 text-xs">{new Date(fb.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    {fb.scenario_id && (
                                                        <p className="text-slate-500 text-xs mb-2">📚 Re: {SCENARIOS[fb.scenario_id]?.title || fb.scenario_id}</p>
                                                    )}
                                                    <p className="text-slate-300 text-sm leading-relaxed">{fb.message}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Roles Tab */}
                {activeTab === 'roles' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(ROLES).map((role) => {
                            const completed = progress?.completed_scenarios?.filter(s =>
                                role.scenarios.includes(s)).length || 0;
                            const percentage = Math.round((completed / role.scenarios.length) * 100);
                            return (
                                <button key={role.id} onClick={() => navigate(`/RoleHub?role=${role.id}`)}
                                    className="bg-slate-900/50 border border-slate-800 hover:border-teal-500/30 rounded-xl p-6 text-left transition-all group w-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{role.icon}</span>
                                            <div>
                                                <h3 className="text-white font-semibold">{role.title}</h3>
                                                <p className="text-slate-500 text-sm">{completed}/{role.scenarios.length} scenarios</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition-colors" />
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-slate-600 text-xs">{percentage}% complete</span>
                                        {percentage === 100 && (
                                            <div className="flex items-center gap-1 text-emerald-400">
                                                <Zap className="w-3 h-3" />
                                                <span className="text-xs font-medium">Done!</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </motion.div>
                )}

            </main>
        </div>
    );
}