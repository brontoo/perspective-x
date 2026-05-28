
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ROLES, SCENARIOS, BADGES, SKILLS } from '@/components/scenarios/scenarioData';
import { getBadgeLevel, BADGE_LEVELS } from '@/components/scenario/scenarioHelpers';
import {
    ArrowRight, Trophy, Target, BookOpen, Loader2,
    MessageSquare, LogOut, Settings, Home, Zap,
    CheckCircle2, Star, Bell, ChevronRight, Lock
} from 'lucide-react';


export default function Dashboard() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [assignedMode, setAssignedMode] = useState('on-level');


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
                const completedScenarios = [
                    ...new Set(
                        progressRows
                            .filter(r => r.scenario_id !== null && r.score >= 80)
                            .map(r => r.scenario_id)
                    )
                ];

                const finishedScenarios = [
                    ...new Set(
                        progressRows
                            .filter(r => r.scenario_id !== null)
                            .map(r => r.scenario_id)
                    )
                ];

                const badgesMap = {};
                const badges = [];

                finishedScenarios.forEach(id => {
                    const latestRow = progressRows.find(r => r.scenario_id === id);
                    const scenarioData = SCENARIOS[id];
                    if (latestRow && scenarioData && scenarioData.badge) {
                        const ans = typeof latestRow.answers === 'string'
                            ? JSON.parse(latestRow.answers)
                            : latestRow.answers || {};
                        const levelName = getBadgeLevel(
                            latestRow.score || 0,
                            ans.scene2?.consequence,
                            ans.scene2?.justification,
                            id
                        );
                        badgesMap[scenarioData.badge] = levelName;
                        badges.push(scenarioData.badge);
                    }
                });

                const skillsMap = {};
                const skillKeys = Object.keys(SKILLS);

                skillKeys.forEach(key => { skillsMap[key] = 0; });

                skillKeys.forEach(skillKey => {
                    const mappedScenarioIds = Object.keys(SCENARIOS).filter(scenarioId => {
                        const sData = SCENARIOS[scenarioId];
                        return sData && sData.skills && sData.skills.includes(skillKey);
                    });

                    if (mappedScenarioIds.length === 0) return;

                    let totalScoreGained = 0;

                    mappedScenarioIds.forEach(scenarioId => {
                        const matchingRows = progressRows.filter(r => r.scenario_id === scenarioId && r.score >= 80);
                        if (matchingRows.length > 0) {
                            const bestScore = Math.max(...matchingRows.map(r => r.score || 0));
                            totalScoreGained += bestScore;
                        }
                    });

                    skillsMap[skillKey] = Math.round(totalScoreGained / mappedScenarioIds.length);
                });

                const allDecisions = completedScenarios.flatMap(scenarioId => {
                    const latestRow = progressRows.find(r =>
                        r.scenario_id === scenarioId && r.score >= 80
                    );
                    if (!latestRow?.answers) return [];

                    const ans = typeof latestRow.answers === 'string'
                        ? JSON.parse(latestRow.answers)
                        : latestRow.answers;

                    return ['scene1', 'scene2', 'scene3']
                        .filter(scene => ans[scene]?.selectedOption)
                        .map(scene => ({
                            scenario_id: scenarioId,
                            scene: scene,
                            decision: ans[scene]?.selectedOption,
                            justification: ans[scene]?.justification
                        }));
                });

                const totalTime = completedScenarios.length * 15;

                setProgress({
                    completed_scenarios: completedScenarios,
                    badges: [...new Set(badges)],
                    badgesMap: badgesMap,
                    decision_history: allDecisions,
                    total_time_spent: totalTime,
                    skills: skillsMap
                });
            }

            const { data: feedbackList } = await supabase
                .from('teacher_feedback')
                .select('*')
                .eq('student_email', currentUser.email)
                .order('created_at', { ascending: false });

            const difficultyOverride = (feedbackList || []).find(fb => fb.type === 'difficulty_override');
            const mode = difficultyOverride?.message || 'on-level';
            setAssignedMode(mode);

            const filteredFeedbacks = (feedbackList || []).filter(fb => fb.type !== 'difficulty_override');
            setFeedbacks(filteredFeedbacks);

            const unread = filteredFeedbacks.filter(fb => {
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
    const completedCount = progress?.completed_scenarios?.length || 0;
    const earnedBadges = progress?.badges?.length || 0;
    const overallPercentage = Math.round((completedCount / totalScenarios) * 100);
    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

    // Find the recommended next mission (first incomplete scenario across all roles)
    const nextMission = React.useMemo(() => {
        if (!progress) return null;
        for (const role of Object.values(ROLES)) {
            for (const sid of role.scenarios) {
                if (!progress.completed_scenarios?.includes(sid) && SCENARIOS[sid]) {
                    return { ...SCENARIOS[sid], id: sid, roleTitle: role.title, roleIcon: role.icon };
                }
            }
        }
        return null;
    }, [progress]);

    // Top 3 skills sorted by score desc
    const topSkills = React.useMemo(() => {
        if (!progress?.skills) return [];
        return Object.entries(SKILLS)
            .map(([key, skill]) => ({ key, ...skill, score: progress.skills[key] || 0 }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);
    }, [progress]);

    // Most recent teacher feedback (up to 3)
    const recentFeedback = feedbacks.slice(0, 3);

    if (loading) {
        return (
            <div className="min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="glass-card p-6 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[var(--lx-accent)] animate-spin" />
                    <span className="text-sm text-[var(--lx-text-muted)]">Loading your dashboard...</span>
                </div>
            </div>
        );
    }

    const modeLabel = assignedMode === 'beginner' ? 'Guided Mode' :
                      assignedMode === 'high-achievers' ? 'Challenge Mode' : 'Standard Mode';
    const modeColor = assignedMode === 'beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      assignedMode === 'high-achievers' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200';

    return (
        <div className="min-h-screen lx-bg-ambient">

            {/* ─── Navigation Header ─── */}
            <header className="sticky top-0 z-50 glass-nav">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                            {displayName[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-[var(--lx-text)]">My Learning Dashboard</h1>
                            <p className="text-xs text-[var(--lx-text-muted)]">Hello, {displayName} 👋</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <button
                                onClick={() => document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="relative p-2 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition rounded-lg hover:bg-[var(--lx-accent-soft)]"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            </button>
                        )}
                        <button onClick={() => navigate('/leaderboard')}
                            className="flex items-center gap-1.5 text-amber-500 hover:text-amber-600 transition text-sm px-3 py-2 rounded-lg hover:bg-amber-50">
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:block text-sm">Leaderboard</span>
                        </button>
                        <button onClick={() => navigate('/ProfileSettings')}
                            className="flex items-center gap-1.5 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition text-sm px-3 py-2 rounded-lg hover:bg-[var(--lx-accent-soft)]">
                            <Settings className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate('/')}
                            className="flex items-center gap-1.5 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition text-sm px-3 py-2 rounded-lg hover:bg-[var(--lx-accent-soft)]">
                            <Home className="w-4 h-4" />
                        </button>
                        <button onClick={handleLogout}
                            className="flex items-center gap-1.5 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] transition text-sm px-3 py-2 rounded-lg hover:bg-[var(--lx-accent-soft)]">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

                {/* ─── 1. Welcome Hero ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-7 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-white/20 to-emerald-50/40 pointer-events-none" />
                    <div className="relative flex flex-col md:flex-row md:items-center gap-6">

                        {/* Welcome text */}
                        <div className="flex-1">
                            <p className="text-sm text-teal-600 font-semibold mb-1">Welcome back!</p>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{displayName}</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${modeColor}`}>
                                    {modeLabel}
                                </span>
                                {completedCount > 0 && (
                                    <span className="text-xs px-2.5 py-1 rounded-full border font-semibold bg-slate-50 text-slate-700 border-slate-200">
                                        {completedCount} mission{completedCount !== 1 ? 's' : ''} complete
                                    </span>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="mb-1 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-medium">Your progress</span>
                                <span className="text-sm font-bold text-teal-600">{overallPercentage}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallPercentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {completedCount} of {totalScenarios} missions completed · {totalScenarios - completedCount} to go
                            </p>
                        </div>

                        {/* Continue button */}
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => nextMission
                                    ? navigate(`/ScenarioPlayer?scenario=${nextMission.id}`)
                                    : navigate('/RoleHub')
                                }
                                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:from-teal-600 hover:to-emerald-600 transition-all text-sm whitespace-nowrap"
                            >
                                {completedCount === 0 ? 'Start Learning' : 'Continue Learning'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <div className="flex gap-5 text-center">
                                <div>
                                    <p className="text-xl font-black text-amber-500">{earnedBadges}</p>
                                    <p className="text-xs text-slate-500">Badges</p>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-purple-500">{progress?.decision_history?.length || 0}</p>
                                    <p className="text-xs text-slate-500">Decisions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── 2. Quick Stats Row ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        { label: 'Missions Done', value: `${completedCount}/${totalScenarios}`, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
                        { label: 'Badges Earned', value: earnedBadges, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                        { label: 'Choices Made', value: progress?.decision_history?.length || 0, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                        { label: 'Time Learning', value: `~${progress?.total_time_spent || 0} min`, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    ].map((stat, i) => (
                        <div key={i} className={`glass-card p-5 border ${stat.border}`}>
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* ─── 3. Recommended Next Mission ─── */}
                {nextMission && (
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" />
                            Recommended Next Mission
                        </h2>
                        <button
                            onClick={() => navigate(`/ScenarioPlayer?scenario=${nextMission.id}`)}
                            className="glass-card w-full text-left p-5 border border-teal-100 bg-gradient-to-r from-teal-50/60 to-emerald-50/40 hover:border-teal-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-teal-100 shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
                                    {nextMission.badgeIcon || nextMission.roleIcon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-mono text-teal-600 uppercase tracking-wider font-bold">{nextMission.roleTitle}</p>
                                    <h3 className="text-slate-900 font-bold text-base truncate">{nextMission.title}</h3>
                                    <p className="text-slate-500 text-xs mt-0.5">{nextMission.strand} · ~{nextMission.estimatedTime} min</p>
                                </div>
                                <div className="flex items-center gap-2 text-teal-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                    Start <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>
                    </motion.div>
                )}

                {/* ─── 4. Badges ─── */}
                {earnedBadges > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                Your Badges
                            </h2>
                            <span className="text-xs text-slate-500">{earnedBadges} earned</span>
                        </div>
                        <div className="glass-card p-5">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {Object.entries(BADGES).map(([badgeName, badge]) => {
                                    const earned = progress?.badges?.includes(badgeName);
                                    if (!earned) return null;
                                    const levelName = progress?.badgesMap?.[badgeName] || 'Bronze';
                                    const levelMeta = BADGE_LEVELS[levelName] || BADGE_LEVELS.Bronze;

                                    const cardBg =
                                        levelName === 'Platinum' ? 'bg-gradient-to-br from-cyan-50 to-indigo-50 border-cyan-200' :
                                        levelName === 'Gold' ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' :
                                        levelName === 'Silver' ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200' :
                                        'bg-amber-50/60 border-amber-100';

                                    return (
                                        <div key={badgeName} className={`rounded-xl p-3 text-center border ${cardBg} transition-all hover:scale-105`}>
                                            <div className="text-3xl mb-1.5">{badge.icon}</div>
                                            <p className="text-[10px] font-semibold text-slate-700 leading-tight">{badgeName}</p>
                                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border mt-1 inline-block ${levelMeta.color}`}>
                                                {levelName}
                                            </span>
                                        </div>
                                    );
                                })}
                                {/* Show locked slots for not-yet-earned */}
                                {Object.entries(BADGES).filter(([b]) => !progress?.badges?.includes(b)).slice(0, 3).map(([badgeName, badge]) => (
                                    <div key={badgeName} className="rounded-xl p-3 text-center border border-slate-100 bg-slate-50 opacity-40">
                                        <div className="text-3xl mb-1.5 grayscale">{badge.icon}</div>
                                        <Lock className="w-3 h-3 text-slate-400 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Badges - empty state */}
                {earnedBadges === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Your Badges
                        </h2>
                        <div className="glass-card p-8 text-center">
                            <div className="text-4xl mb-3">🏅</div>
                            <p className="text-slate-600 font-semibold text-sm">Complete your first mission to earn a badge!</p>
                            <p className="text-slate-400 text-xs mt-1">Badges show up here once you finish a scenario.</p>
                        </div>
                    </motion.div>
                )}

                {/* ─── 5. Skills Progress ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        Skills You're Building
                    </h2>
                    <div className="glass-card p-5">
                        {topSkills.every(s => s.score === 0) ? (
                            <div className="text-center py-6">
                                <p className="text-slate-500 text-sm">Complete missions to grow your skills!</p>
                                <p className="text-slate-400 text-xs mt-1">Your science skills will appear here as you learn.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {Object.entries(SKILLS).map(([key, skill]) => {
                                    const value = progress?.skills?.[key] || 0;
                                    const barColor = value >= 80 ? 'bg-emerald-500' :
                                                     value >= 50 ? 'bg-teal-500' :
                                                     value >= 20 ? 'bg-amber-400' : 'bg-slate-300';
                                    const textColor = value >= 80 ? 'text-emerald-600' :
                                                      value >= 50 ? 'text-teal-600' :
                                                      value >= 20 ? 'text-amber-600' : 'text-slate-400';
                                    const label = value >= 80 ? 'Great!' : value >= 50 ? 'Good' : value >= 20 ? 'Growing' : 'Not started';

                                    return (
                                        <div key={key} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-700 font-medium flex items-center gap-1.5">
                                                    <span>{skill.icon}</span> {skill.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
                                                    <span className="text-slate-400 text-xs font-mono">{value}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${value}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                                    className={`h-full ${barColor} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ─── 6. Teacher Feedback ─── */}
                <motion.div
                    id="feedback-section"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            Messages from Your Teacher
                            {unreadCount > 0 && (
                                <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                                    {unreadCount} new
                                </span>
                            )}
                        </h2>
                        {feedbacks.length > 0 && (
                            <span className="text-xs text-slate-400">{feedbacks.length} message{feedbacks.length !== 1 ? 's' : ''}</span>
                        )}
                    </div>

                    {feedbacks.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm font-medium">No messages yet</p>
                            <p className="text-slate-400 text-xs mt-1">Your teacher's feedback will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentFeedback.map(fb => {
                                const isNew = (new Date() - new Date(fb.created_at)) / (1000 * 60 * 60) < 24;
                                const typeIcon = { praise: '🌟', improvement: '💡', assignment: '📋', general: '💬' }[fb.type] || '💬';
                                const typeLabel = { praise: 'Great work!', improvement: 'Something to work on', assignment: 'Assignment', general: 'Message' }[fb.type] || 'Message';
                                const cardStyle = {
                                    praise: 'border-emerald-200 bg-emerald-50/60',
                                    improvement: 'border-amber-200 bg-amber-50/60',
                                    assignment: 'border-blue-200 bg-blue-50/60',
                                    general: 'border-slate-200 bg-white',
                                }[fb.type] || 'border-slate-200 bg-white';

                                return (
                                    <motion.div key={fb.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`glass-card p-5 border ${cardStyle} relative`}
                                    >
                                        {isNew && (
                                            <span className="absolute top-3 right-3 text-[10px] bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">New</span>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl leading-none mt-0.5">{typeIcon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className="text-slate-800 font-bold text-sm">{fb.teacher_name || 'Your Teacher'}</p>
                                                    <span className="text-slate-400 text-xs">·</span>
                                                    <span className="text-slate-500 text-xs">{typeLabel}</span>
                                                    <span className="text-slate-400 text-xs">·</span>
                                                    <span className="text-slate-400 text-xs">{new Date(fb.created_at).toLocaleDateString()}</span>
                                                </div>
                                                {fb.scenario_id && (
                                                    <p className="text-slate-400 text-xs mb-2">About: {SCENARIOS[fb.scenario_id]?.title || fb.scenario_id}</p>
                                                )}
                                                <p className="text-slate-700 text-sm leading-relaxed">{fb.message}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {feedbacks.length > 3 && (
                                <button
                                    onClick={() => navigate('/Dashboard/feedback')}
                                    className="w-full glass-card p-3 text-center text-sm text-teal-600 font-semibold hover:bg-teal-50 transition border border-teal-100 flex items-center justify-center gap-1"
                                >
                                    View all {feedbacks.length} messages <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* ─── 7. Mission Library (Role Cards) ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-teal-500" />
                            Mission Library
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(ROLES).map((role) => {
                            const completed = progress?.completed_scenarios?.filter(s =>
                                role.scenarios.includes(s)).length || 0;
                            const pct = Math.round((completed / role.scenarios.length) * 100);
                            const isDone = pct === 100;

                            return (
                                <button key={role.id}
                                    onClick={() => navigate(`/RoleHub?role=${role.id}`)}
                                    className={`glass-card w-full text-left p-5 hover:shadow-md transition-all group border ${isDone ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100 hover:border-teal-200'}`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{role.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-slate-800 font-bold text-sm truncate">{role.title}</h3>
                                            <p className="text-slate-500 text-xs">{completed}/{role.scenarios.length} missions</p>
                                        </div>
                                        {isDone ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        ) : (
                                            <span className="text-xs font-bold text-teal-600">{pct}%</span>
                                        )}
                                    </div>

                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mb-3">
                                        <div
                                            className={`h-full rounded-full transition-all ${isDone ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-teal-500 to-cyan-500'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>

                                    <div className="flex gap-1.5 flex-wrap">
                                        {role.scenarios.map(sid => {
                                            const isComp = progress?.completed_scenarios?.includes(sid);
                                            return (
                                                <div key={sid}
                                                    title={SCENARIOS[sid]?.title || sid}
                                                    className={`h-2 rounded-full transition-all ${isComp ? 'bg-emerald-500 w-6' : 'bg-slate-200 w-2'}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

            </main>
        </div>
    );
}