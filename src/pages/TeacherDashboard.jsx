
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS, SKILLS } from '@/components/scenarios/scenarioData';
import {
    Users, BookOpen, Settings, Lock, Unlock,
    Loader2, LogOut, GraduationCap, CheckCircle2,
    Target, Home, Eye, MessageSquare, Send, Trash2,
    Trophy, Brain, ChevronDown, ChevronUp,
    UserCircle  // ✅ أيقونة Settings الشخصية
} from 'lucide-react';

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scenarioSettings, setScenarioSettings] = useState({});
    const [students, setStudents] = useState([]);
    const [studentProgress, setStudentProgress] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [activeTab, setActiveTab] = useState('scenarios');
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({
        student_email: '', message: '', type: 'general', scenario_id: ''
    });
    const [sendingFeedback, setSendingFeedback] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            const { data: profileData } = await supabase
                .from('profiles').select('*').eq('id', currentUser.id).single();
            setProfile(profileData);

            const { data: settings } = await supabase.from('scenario_settings').select('*');
            const settingsMap = {};
            (settings || []).forEach(s => { settingsMap[s.scenario_id] = s; });
            setScenarioSettings(settingsMap);

            const { data: studentList } = await supabase
                .from('profiles').select('*').eq('role', 'student');
            setStudents(studentList || []);

            const { data: progress } = await supabase
                .from('student_progress').select('*');
            setStudentProgress(progress || []);

            const { data: feedbackList } = await supabase
                .from('teacher_feedback').select('*').order('created_at', { ascending: false });
            setFeedbacks(feedbackList || []);

        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
    };

    const getStudentProgress = (studentId) => {
        const rows = studentProgress.filter(p => p.student_id === studentId);
        if (rows.length === 0) return null;

        const completedScenarios = rows.map(r => r.scenario_id);
        const badges = rows
            .filter(r => r.score >= 70)
            .map(r => SCENARIOS[r.scenario_id]?.badge)
            .filter(Boolean);

        const skillsMap = {};
        const skillKeys = Object.keys(SKILLS);
        rows.forEach(row => {
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

        return {
            completed_scenarios: completedScenarios,
            badges: [...new Set(badges)],
            skills: skillsMap,
            rows
        };
    };

    const updateScenarioSetting = async (scenarioId, field, value) => {
        const existing = scenarioSettings[scenarioId];
        if (existing) {
            await supabase.from('scenario_settings').update({ [field]: value }).eq('id', existing.id);
            setScenarioSettings({ ...scenarioSettings, [scenarioId]: { ...existing, [field]: value } });
        } else {
            const { data: newSetting } = await supabase.from('scenario_settings')
                .insert({ scenario_id: scenarioId, [field]: value }).select().single();
            setScenarioSettings({ ...scenarioSettings, [scenarioId]: newSetting });
        }
    };

    const sendFeedback = async () => {
        if (!feedbackForm.student_email || !feedbackForm.message) return;
        setSendingFeedback(true);
        const { data: newFb } = await supabase.from('teacher_feedback').insert({
            ...feedbackForm,
            teacher_id: user?.id,
            teacher_name: profile?.full_name || 'Teacher'
        }).select().single();
        if (newFb) setFeedbacks([newFb, ...feedbacks]);
        setFeedbackForm({ student_email: '', message: '', type: 'general', scenario_id: '' });
        setSendingFeedback(false);
    };

    const deleteFeedback = async (id) => {
        await supabase.from('teacher_feedback').delete().eq('id', id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/SignIn';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    const totalScenarios = Object.keys(SCENARIOS).length;

    const studentsWithProgress = students.filter(s => {
        const rows = studentProgress.filter(p => p.student_id === s.id);
        return rows.length > 0;
    });

    const avgProgress = students.length > 0
        ? Math.round(
            students.reduce((acc, s) => {
                const p = getStudentProgress(s.id);
                return acc + (p?.completed_scenarios?.length || 0);
            }, 0) / students.length / totalScenarios * 100
        )
        : 0;

    const stats = [
        { label: 'Students', value: students.length, Icon: Users, from: 'from-purple-500/10', to: 'to-pink-500/10', border: 'border-purple-500/30', bg: 'bg-purple-500/20', text: 'text-purple-400' },
        { label: 'Scenarios', value: totalScenarios, Icon: BookOpen, from: 'from-teal-500/10', to: 'to-emerald-500/10', border: 'border-teal-500/30', bg: 'bg-teal-500/20', text: 'text-teal-400' },
        { label: 'Completions', value: studentsWithProgress.length, Icon: CheckCircle2, from: 'from-amber-500/10', to: 'to-orange-500/10', border: 'border-amber-500/30', bg: 'bg-amber-500/20', text: 'text-amber-400' },
        { label: 'Avg Progress', value: `${avgProgress}%`, Icon: Target, from: 'from-blue-500/10', to: 'to-cyan-500/10', border: 'border-blue-500/30', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    ];

    const tabs = [
        { key: 'scenarios', label: 'Manage Scenarios', Icon: Settings },
        { key: 'students', label: 'Student Progress', Icon: Users },
        { key: 'feedback', label: 'Feedback', Icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Teacher Dashboard</h1>
                            <p className="text-sm text-slate-400">Welcome, {profile?.full_name || 'Teacher'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* ⚙️ Account Settings — الجديد */}
                        <button
                            onClick={() => navigate('/ProfileSettings')}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition text-sm px-3 py-2 rounded-lg hover:bg-slate-800">
                            <UserCircle className="w-4 h-4" />
                            <span className="hidden sm:block">Account</span>
                        </button>

                        {/* 🏠 Home */}
                        <button onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800 text-sm">
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:block">Home</span>
                        </button>

                        {/* 🚪 Sign Out */}
                        <button onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800 text-sm">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:block">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

                {/* Tabs */}
                <div className="space-y-6">
                    <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.key
                                    ? 'bg-teal-500/20 text-teal-400'
                                    : 'text-slate-400 hover:text-white'}`}>
                                <tab.Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Scenarios Tab ── */}
                    {activeTab === 'scenarios' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Scenario Settings</h2>
                            <div className="space-y-4">
                                {Object.entries(SCENARIOS).map(([id, scenario]) => {
                                    const settings = scenarioSettings[id] || {};
                                    const difficulty = settings.difficulty_override || 'on-level';
                                    return (
                                        <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-2xl">{scenario.badgeIcon}</span>
                                                        <div>
                                                            <h3 className="text-white font-semibold">{scenario.title}</h3>
                                                            <p className="text-slate-500 text-sm">{scenario.strand} • {scenario.estimatedTime} min</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                        difficulty === 'on-level' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                            'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                                                        {difficulty === 'beginner' ? '🟢 Beginner' :
                                                            difficulty === 'on-level' ? '🟡 On-Level' : '🔴 High Achievers'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <button onClick={() => navigate(`/ScenarioPlayer?scenario=${id}`)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-sm transition">
                                                        <Eye className="w-4 h-4" /> Preview
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 text-sm">Level:</span>
                                                        <select value={difficulty}
                                                            onChange={e => updateScenarioSetting(id, 'difficulty_override', e.target.value)}
                                                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm">
                                                            <option value="beginner">Beginner</option>
                                                            <option value="on-level">On-Level</option>
                                                            <option value="high-achievers">High Achievers</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 text-sm">Mandatory:</span>
                                                        <button onClick={() => updateScenarioSetting(id, 'is_mandatory', !settings.is_mandatory)}
                                                            className={`w-10 h-6 rounded-full transition-colors ${settings.is_mandatory ? 'bg-teal-500' : 'bg-slate-600'}`}>
                                                            <span className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${settings.is_mandatory ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {settings.is_locked ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                                                        <button onClick={() => updateScenarioSetting(id, 'is_locked', !settings.is_locked)}
                                                            className={`w-10 h-6 rounded-full transition-colors ${!settings.is_locked ? 'bg-teal-500' : 'bg-slate-600'}`}>
                                                            <span className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${!settings.is_locked ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Students Tab ── */}
                    {activeTab === 'students' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-2">Student Progress</h2>
                            <p className="text-slate-500 text-sm mb-6">{students.length} student{students.length !== 1 ? 's' : ''} registered</p>

                            {students.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No students registered yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {students.map((student, index) => {
                                        const progress = getStudentProgress(student.id);
                                        const completedCount = progress?.completed_scenarios?.length || 0;
                                        const percentage = Math.round((completedCount / totalScenarios) * 100);
                                        const badges = progress?.badges?.length || 0;
                                        const isExpanded = expandedStudent === student.id;
                                        const studentName = student.full_name || student.email?.split('@')[0] || `Student ${index + 1}`;

                                        return (
                                            <motion.div key={student.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden">

                                                <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-700/30 transition"
                                                    onClick={() => setExpandedStudent(isExpanded ? null : student.id)}>
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                        {studentName[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-semibold truncate">{studentName}</p>
                                                        <p className="text-slate-500 text-xs truncate">{student.email}</p>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-3">
                                                        <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-1.5">
                                                            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                                                            <span className="text-teal-400 text-xs font-semibold">{completedCount}/{totalScenarios}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                                                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                                            <span className="text-amber-400 text-xs font-semibold">{badges}</span>
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${percentage >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            percentage >= 30 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                'bg-slate-700/50 text-slate-400 border-slate-600/30'}`}>
                                                            {percentage}%
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-500">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </div>
                                                </div>

                                                <div className="px-4 pb-3">
                                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${percentage >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                                            percentage >= 30 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                                                'bg-slate-600'}`}
                                                            style={{ width: `${percentage}%` }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="border-t border-slate-700 p-4 bg-slate-900/50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <h4 className="text-slate-400 text-sm font-semibold mb-3 flex items-center gap-2">
                                                                    <Brain className="w-4 h-4" /> Skills
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {Object.entries(SKILLS).map(([key, skill]) => {
                                                                        const val = progress?.skills?.[key] || 0;
                                                                        return (
                                                                            <div key={key}>
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-slate-400 text-xs">{skill.icon} {skill.name}</span>
                                                                                    <span className={`text-xs font-semibold ${val >= 70 ? 'text-emerald-400' : val >= 40 ? 'text-amber-400' : 'text-slate-500'}`}>{val}%</span>
                                                                                </div>
                                                                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                                                    <div className={`h-full rounded-full ${val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-slate-600'}`}
                                                                                        style={{ width: `${val}%` }} />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-slate-400 text-sm font-semibold mb-3 flex items-center gap-2">
                                                                        <CheckCircle2 className="w-4 h-4" /> Completed Scenarios
                                                                    </h4>
                                                                    {completedCount === 0 ? (
                                                                        <p className="text-slate-600 text-xs">No scenarios completed yet</p>
                                                                    ) : (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {(progress?.completed_scenarios || []).map(sid => (
                                                                                <span key={sid} className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg px-2 py-1">
                                                                                    {SCENARIOS[sid]?.title || sid}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-slate-400 text-sm font-semibold mb-3 flex items-center gap-2">
                                                                        <Trophy className="w-4 h-4" /> Badges
                                                                    </h4>
                                                                    {badges === 0 ? (
                                                                        <p className="text-slate-600 text-xs">No badges earned yet</p>
                                                                    ) : (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {(progress?.badges || []).map(b => (
                                                                                <span key={b} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg px-2 py-1">
                                                                                    🏆 {b}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-slate-400 text-sm font-semibold mb-3 flex items-center gap-2">
                                                                        <Target className="w-4 h-4" /> Scores
                                                                    </h4>
                                                                    <div className="space-y-1">
                                                                        {(progress?.rows || []).map(row => (
                                                                            <div key={row.id} className="flex justify-between items-center">
                                                                                <span className="text-slate-400 text-xs truncate max-w-[160px]">
                                                                                    {SCENARIOS[row.scenario_id]?.title || row.scenario_id}
                                                                                </span>
                                                                                <span className={`text-xs font-bold ${row.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                                                    {row.score}%
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    onClick={() => {
                                                                        setFeedbackForm(f => ({ ...f, student_email: student.email }));
                                                                        setActiveTab('feedback');
                                                                    }}
                                                                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition">
                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                    Send Feedback to {studentName}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Feedback Tab ── */}
                    {activeTab === 'feedback' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-teal-400" /> Send Feedback
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Student</label>
                                        <select value={feedbackForm.student_email}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, student_email: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500">
                                            <option value="">Select a student...</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.email}>
                                                    {s.full_name || s.email?.split('@')[0]} — {s.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Type</label>
                                        <select value={feedbackForm.type}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500">
                                            <option value="general">💬 General</option>
                                            <option value="praise">🌟 Praise</option>
                                            <option value="improvement">💡 Needs Improvement</option>
                                            <option value="assignment">📋 Assignment Note</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Scenario (optional)</label>
                                        <select value={feedbackForm.scenario_id}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, scenario_id: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500">
                                            <option value="">All Scenarios</option>
                                            {Object.entries(SCENARIOS).map(([id, s]) => (
                                                <option key={id} value={id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Message</label>
                                        <textarea rows={4} placeholder="Write your feedback here..."
                                            value={feedbackForm.message}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition resize-none" />
                                    </div>
                                    <button onClick={sendFeedback}
                                        disabled={sendingFeedback || !feedbackForm.student_email || !feedbackForm.message}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50">
                                        {sendingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Send Feedback
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-purple-400" />
                                    Sent Feedback ({feedbacks.length})
                                </h2>
                                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                    {feedbacks.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No feedback sent yet</p>
                                        </div>
                                    ) : (
                                        feedbacks.map(fb => {
                                            const typeColor = {
                                                praise: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                                                improvement: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                                                assignment: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                                                general: 'text-slate-400 bg-slate-700/30 border-slate-600/30',
                                            }[fb.type] || 'text-slate-400 bg-slate-700/30 border-slate-600/30';
                                            return (
                                                <div key={fb.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 group">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <p className="text-white text-sm font-medium">{fb.student_email}</p>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor} capitalize`}>{fb.type}</span>
                                                        </div>
                                                        <button onClick={() => deleteFeedback(fb.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">{fb.message}</p>
                                                    {fb.scenario_id && (
                                                        <p className="text-slate-600 text-xs mt-2">Re: {SCENARIOS[fb.scenario_id]?.title || fb.scenario_id}</p>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}