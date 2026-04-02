import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS, SKILLS } from '@/components/scenarios/scenarioData';
import {
    Users, BookOpen, Settings, Lock, Unlock,
    Loader2, LogOut, GraduationCap, CheckCircle2,
    Target, Home, Eye, MessageSquare, Send, Trash2,
    Trophy, Brain, BarChart3, ChevronDown, ChevronUp,
    UserCircle, Download, X, XCircle, Repeat
} from 'lucide-react';


export default function TeacherDashboard() {
    const [feedbackFilter, setFeedbackFilter] = useState('all');
    const [feedbackSearch, setFeedbackSearch] = useState('');

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
    const [selectedAttempt, setSelectedAttempt] = useState(null);
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
        const allRows = studentProgress.filter(p => p.student_id === studentId);
        if (allRows.length === 0) return null;

        // Group by scenario_id and pick the BEST score for each
        const scenarioGroups = {};
        allRows.forEach(row => {
            if (!row.scenario_id) return; // Skip general progress if it exists
            const existing = scenarioGroups[row.scenario_id];
            if (!existing || (row.score || 0) > (existing.score || 0)) {
                scenarioGroups[row.scenario_id] = row;
            }
        });
        const uniqueRows = Object.values(scenarioGroups);

        const completedScenarios = uniqueRows.map(r => r.scenario_id);
        const badges = uniqueRows
            .filter(r => (r.score || 0) >= 70)
            .map(r => SCENARIOS[r.scenario_id]?.badge)
            .filter(Boolean);

        const skillsMap = {};
        const skillKeys = Object.keys(SKILLS);
        uniqueRows.forEach(row => {
            const scenarioData = SCENARIOS[row.scenario_id];
            if (scenarioData && (row.score || 0) > 0) {
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
            rows: uniqueRows // Use deduplicated rows for display and scoring
        };
    };

    const updateScenarioSetting = async (scenarioId, field, value) => {
        console.log('Updating:', scenarioId, field, value);
        const existing = scenarioSettings[scenarioId];
        try {
            if (existing?.id) {
                const { error } = await supabase
                    .from('scenario_settings')
                    .update({ [field]: value })
                    .eq('id', existing.id);
                if (error) console.error('Update error:', error);
                else setScenarioSettings({ ...scenarioSettings, [scenarioId]: { ...existing, [field]: value } });
            } else {
                const { data: newSetting, error } = await supabase
                    .from('scenario_settings')
                    .insert({ scenario_id: scenarioId, [field]: value })
                    .select().single();
                if (error) console.error('Insert error:', error);
                else if (newSetting) setScenarioSettings({ ...scenarioSettings, [scenarioId]: newSetting });
            }
        } catch (e) {
            console.error('Error:', e);
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
    const exportCSV = () => {
        const rows = [];

        // Header
        rows.push([
            'Student Name',
            'Email',
            'Scenario Title',
            'Score',
            'Passed',
            'Completed At'
        ].join(','));

        // Data rows
        students.forEach(student => {
            const studentName = student.full_name || student.email?.split('@')[0] || 'Unknown';
            const progressRows = studentProgress.filter(p =>
                p.student_id === student.id && p.scenario_id
            );

            if (progressRows.length === 0) {
                rows.push([
                    `"${studentName}"`,
                    `"${student.email}"`,
                    '"No scenarios completed"',
                    '0',
                    'No',
                    ''
                ].join(','));
            } else {
                progressRows.forEach(row => {
                    const scenarioTitle = SCENARIOS[row.scenario_id]?.title || row.scenario_id;
                    rows.push([
                        `"${studentName}"`,
                        `"${student.email}"`,
                        `"${scenarioTitle}"`,
                        row.score || 0,
                        (row.score || 0) >= 70 ? 'Yes' : 'No',
                        row.completed_at ? new Date(row.completed_at).toLocaleDateString() : ''
                    ].join(','));
                });
            }
        });

        // Download
        const csv = rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-progress-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
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
        { key: 'analytics', label: 'Analytics', Icon: BarChart3 },  // ← جديد
    ];
    // ── Analytics Data ──
    const scenarioCompletionData = Object.entries(SCENARIOS).map(([id, scenario]) => {
        const completions = studentProgress.filter(p => p.scenario_id === id);
        const avgScore = completions.length > 0
            ? Math.round(completions.reduce((a, b) => a + (b.score || 0), 0) / completions.length)
            : 0;
        return {
            name: scenario.title?.split(' ').slice(0, 3).join(' ') || id,
            completions: completions.length,
            avgScore
        };
    });

    const studentPerformanceData = students.map(student => {
        const rows = studentProgress.filter(p => p.student_id === student.id && p.scenario_id);
        const avgScore = rows.length > 0
            ? Math.round(rows.reduce((a, b) => a + (b.score || 0), 0) / rows.length)
            : 0;
        return {
            name: student.full_name || student.email?.split('@')[0] || 'Unknown',
            scenarios: rows.length,
            avgScore,
            passed: rows.filter(r => (r.score || 0) >= 70).length
        };
    });

    const passFailData = [
        { name: 'Passed ✅', value: studentProgress.filter(p => (p.score || 0) >= 70 && p.scenario_id).length },
        { name: 'Failed ❌', value: studentProgress.filter(p => (p.score || 0) < 70 && p.scenario_id).length }
    ];

    const PIE_COLORS = ['#14b8a6', '#f43f5e'];


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
                        {/* 🏆 Leaderboard — جديد */}
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition text-sm px-3 py-2 rounded-lg hover:bg-amber-500/10">
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:block">Leaderboard</span>
                        </button>

                        {/* ⚙️ Account Settings */}
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
                    <div className="flex justify-between items-center mb-2">
                        <div /> {/* spacer */}
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition text-sm font-medium"
                        >
                            📤 Export CSV
                        </button>
                    </div>

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
                                                                            <div key={row.id} className="flex justify-between items-center group/item hover:bg-slate-800/80 p-1 rounded-lg transition-colors">
                                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                                    <span className="text-slate-400 text-xs truncate max-w-[120px]">
                                                                                        {SCENARIOS[row.scenario_id]?.title || row.scenario_id}
                                                                                    </span>
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedAttempt({ ...row, student_name: studentName });
                                                                                        }}
                                                                                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-teal-400 transition"
                                                                                        title="View Detailed Answers"
                                                                                    >
                                                                                        <Eye className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </div>
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
                    )}{/* ── Feedback Tab ── */}
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

                                    {/* Quick Reply Templates */}
                                    <div>
                                        <label className="text-slate-400 text-sm mb-2 block">Quick Templates</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: '🌟 Great job!', text: 'Great job on completing this scenario! Your answers showed excellent understanding.' },
                                                { label: '💡 Try again', text: 'Good effort! Please review the scenario concepts and try again to improve your score.' },
                                                { label: '📋 Assignment', text: 'Please complete the assigned scenario before the deadline. Let me know if you need help.' },
                                                { label: '🎯 Almost there', text: "You're almost there! Focus on the exit ticket questions to boost your score above 70%." },
                                            ].map((t, i) => (
                                                <button key={i}
                                                    onClick={() => setFeedbackForm(f => ({ ...f, message: t.text }))}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-teal-500/50 transition">
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
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
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                        Sent Feedback ({feedbacks.length})
                                    </h2>
                                    {/* Filter */}
                                    <select
                                        value={feedbackFilter}
                                        onChange={e => setFeedbackFilter(e.target.value)}
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-400 text-xs focus:outline-none focus:border-teal-500">
                                        <option value="all">All Types</option>
                                        <option value="praise">🌟 Praise</option>
                                        <option value="improvement">💡 Improvement</option>
                                        <option value="assignment">📋 Assignment</option>
                                        <option value="general">💬 General</option>
                                    </select>
                                </div>

                                {/* Search */}
                                <input
                                    type="text"
                                    placeholder="Search feedback..."
                                    value={feedbackSearch}
                                    onChange={e => setFeedbackSearch(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500 mb-4 transition"
                                />

                                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                    {feedbacks
                                        .filter(fb =>
                                            (feedbackFilter === 'all' || fb.type === feedbackFilter) &&
                                            (fb.message?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                                                fb.student_email?.toLowerCase().includes(feedbackSearch.toLowerCase()))
                                        )
                                        .length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No feedback found</p>
                                        </div>
                                    ) : (
                                        feedbacks
                                            .filter(fb =>
                                                (feedbackFilter === 'all' || fb.type === feedbackFilter) &&
                                                (fb.message?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                                                    fb.student_email?.toLowerCase().includes(feedbackSearch.toLowerCase()))
                                            )
                                            .map(fb => {
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
                                                        <p className="text-slate-700 text-xs mt-1">
                                                            {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Analytics Tab ── */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Attempts', value: studentProgress.filter(p => p.scenario_id).length, color: 'teal' },
                                    {
                                        label: 'Pass Rate',
                                        value: `${studentProgress.filter(p => p.scenario_id).length > 0
                                            ? Math.round(studentProgress.filter(p => (p.score || 0) >= 70 && p.scenario_id).length
                                                / studentProgress.filter(p => p.scenario_id).length * 100)
                                            : 0}%`,
                                        color: 'emerald'
                                    },
                                    {
                                        label: 'Avg Score',
                                        value: `${studentProgress.filter(p => p.scenario_id).length > 0
                                            ? Math.round(studentProgress.filter(p => p.scenario_id)
                                                .reduce((a, b) => a + (b.score || 0), 0)
                                                / studentProgress.filter(p => p.scenario_id).length)
                                            : 0}%`,
                                        color: 'purple'
                                    },
                                    {
                                        label: 'Active Students',
                                        value: [...new Set(studentProgress.filter(p => p.scenario_id).map(p => p.student_id))].length,
                                        color: 'amber'
                                    },
                                ].map((card, i) => (
                                    <div key={i} className={`bg-${card.color}-500/10 border border-${card.color}-500/30 rounded-xl p-4 text-center`}>
                                        <p className={`text-${card.color}-400 text-2xl font-bold`}>{card.value}</p>
                                        <p className="text-slate-500 text-xs mt-1">{card.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Bar Chart — Completions per Scenario */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-teal-400" />
                                    Completions & Avg Score per Scenario
                                </h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={scenarioCompletionData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }}
                                            angle={-35} textAnchor="end" interval={0} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff' }} itemStyle={{ color: '#94a3b8' }} />
                                        <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: '20px' }} />
                                        <Bar dataKey="completions" fill="#14b8a6" name="Completions" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="avgScore" fill="#8b5cf6" name="Avg Score %" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Bar Chart — Student Performance */}
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        Student Performance
                                    </h3>
                                    {studentPerformanceData.length === 0 ? (
                                        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No student data yet</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={studentPerformanceData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                                    labelStyle={{ color: '#fff' }} itemStyle={{ color: '#94a3b8' }} />
                                                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                                <Bar dataKey="scenarios" fill="#14b8a6" name="Scenarios Done" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="passed" fill="#10b981" name="Passed" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="avgScore" fill="#8b5cf6" name="Avg Score %" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                {/* Pie Chart — Pass vs Fail */}
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-emerald-400" />
                                        Pass vs Fail Rate
                                    </h3>
                                    {passFailData[0].value + passFailData[1].value === 0 ? (
                                        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No attempts yet</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={passFailData} cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={90}
                                                    paddingAngle={4} dataKey="value">
                                                    {passFailData.map((_, i) => (
                                                        <Cell key={i} fill={PIE_COLORS[i]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#94a3b8' }} />
                                                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </main>
            {/* Student Answers Modal */}
            <StudentAnswersModal
                attempt={selectedAttempt}
                onClose={() => setSelectedAttempt(null)}
            />
        </div>
    );
}

// ── Student Answers Detailed View Modal ──
function StudentAnswersModal({ attempt, onClose }) {
    if (!attempt) return null;

    const scenario = SCENARIOS[attempt.scenario_id];
    const answers = typeof attempt.answers === 'string'
        ? JSON.parse(attempt.answers)
        : attempt.answers || {};

    const exitTicket = answers.exitTicket || {};

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Student Submission Details</h3>
                            <p className="text-xs text-slate-400">
                                {attempt.student_name} • {scenario?.title || attempt.scenario_id} • {attempt.score}%
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* 1. Scenes & Decisions */}
                    <section>
                        <h4 className="text-teal-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Scenario Decisions
                        </h4>
                        <div className="grid gap-4">
                            {[1, 2, 3].map((num) => {
                                const sceneAns = answers[`scene${num}`];
                                if (!sceneAns) return null;
                                const sceneData = scenario?.scenes[num - 1];
                                const selectedOption = sceneData?.options?.find(o => o.id === sceneAns.selectedOption);

                                return (
                                    <div key={num} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                                                {num}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-slate-300 text-xs font-semibold mb-1 uppercase tracking-wider">Scene {num}: {sceneData?.title}</p>
                                                <p className="text-white font-medium mb-3">{sceneData?.question}</p>
                                                
                                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 mb-3">
                                                    <p className="text-xs text-slate-500 mb-1 font-bold">STUDENT SELECTION:</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${selectedOption?.correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                            {sceneAns.selectedOption}
                                                        </span>
                                                        <span className="text-white text-sm font-semibold">{selectedOption?.text || 'Option ' + sceneAns.selectedOption}</span>
                                                        {selectedOption?.correct && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
                                                    </div>
                                                </div>

                                                <div className="bg-teal-500/5 rounded-lg p-3 border border-teal-500/10">
                                                    <p className="text-xs text-teal-500/60 mb-1 font-bold">JUSTIFICATION:</p>
                                                    <p className="text-slate-300 text-sm italic leading-relaxed">
                                                        "{sceneAns.justification || 'No justification provided'}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 2. Exit Ticket MCQs */}
                    <section>
                        <h4 className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Exit Ticket Quiz
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(scenario?.exitTicket?.mcqs || []).map((q, idx) => {
                                const ansId = exitTicket.mcq_answers?.[idx];
                                const isCorrect = q.options?.find(o => o.id === ansId)?.correct;
                                const correctOption = q.options?.find(o => o.correct);

                                return (
                                    <div key={idx} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                        <p className="text-white text-sm font-medium mb-2">{q.question}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full font-bold border ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                                {ansId || 'N/A'}
                                            </span>
                                            {!isCorrect && (
                                                <span className="text-slate-500">
                                                    Correct: <span className="text-emerald-400 font-bold">{correctOption?.id}</span>
                                                </span>
                                            )}
                                            {isCorrect ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                                            ) : (
                                                <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 3. Written Reflections */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Brain className="w-4 h-4" /> Reflection
                            </h4>
                            <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 min-h-[140px]">
                                <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-tight">Prompt: {scenario?.exitTicket?.reflectionPrompt}</p>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {exitTicket.reflection || 'No reflection provided'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Repeat className="w-4 h-4" /> Transfer Question
                            </h4>
                            <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 min-h-[140px]">
                                <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-tight">Prompt: {scenario?.exitTicket?.transferQuestion}</p>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {exitTicket.transfer_answer || 'No answer provided'}
                                </p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition font-bold text-sm"
                    >
                        Close Details
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
