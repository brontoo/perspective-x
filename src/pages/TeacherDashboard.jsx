import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS } from '@/components/scenarios/scenarioData';
import {
    Users, BookOpen, Settings, Lock, Unlock,
    Loader2, LogOut, GraduationCap, CheckCircle2,
    Target, Home, Eye, MessageSquare, Send, Trash2
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

            const { data: progress } = await supabase
                .from('student_progress').select('*, profiles(email, full_name)');
            setStudentProgress(progress || []);

            const { data: studentList } = await supabase
                .from('profiles').select('*').eq('role', 'student');
            setStudents(studentList || []);

            const { data: feedbackList } = await supabase
                .from('teacher_feedback').select('*').order('created_at', { ascending: false });
            setFeedbacks(feedbackList || []);

        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
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
    const completedByStudents = studentProgress.length;

    const stats = [
        { label: 'Students', value: students.length, Icon: Users, from: 'from-purple-500/10', to: 'to-pink-500/10', border: 'border-purple-500/30', bg: 'bg-purple-500/20', text: 'text-purple-400' },
        { label: 'Scenarios', value: totalScenarios, Icon: BookOpen, from: 'from-teal-500/10', to: 'to-emerald-500/10', border: 'border-teal-500/30', bg: 'bg-teal-500/20', text: 'text-teal-400' },
        { label: 'Completions', value: completedByStudents, Icon: CheckCircle2, from: 'from-amber-500/10', to: 'to-orange-500/10', border: 'border-amber-500/30', bg: 'bg-amber-500/20', text: 'text-amber-400' },
        { label: 'Avg Progress', value: students.length > 0 ? `${Math.round(completedByStudents / students.length / totalScenarios * 100)}%` : '0%', Icon: Target, from: 'from-blue-500/10', to: 'to-cyan-500/10', border: 'border-blue-500/30', bg: 'bg-blue-500/20', text: 'text-blue-400' },
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
                        <button onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800">
                            <Home className="w-4 h-4" /> Home
                        </button>
                        <button onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800">
                            <LogOut className="w-4 h-4" /> Sign Out
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
                    {/* Tab buttons */}
                    <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.key
                                        ? 'bg-teal-500/20 text-teal-400'
                                        : 'text-slate-400 hover:text-white'
                                    }`}>
                                <tab.Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Scenarios Tab */}
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
                                                                'bg-red-500/20 text-red-400 border-red-500/30'
                                                        }`}>
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
                                                        {settings.is_locked
                                                            ? <Lock className="w-4 h-4 text-red-400" />
                                                            : <Unlock className="w-4 h-4 text-emerald-400" />}
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

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Student Progress</h2>
                            {studentProgress.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No student progress data yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {studentProgress.map((progress, index) => {
                                        const studentName = progress.profiles?.full_name || progress.profiles?.email || `Student ${index + 1}`;
                                        const percentage = Math.min((progress.score || 0), 100);
                                        return (
                                            <div key={progress.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                                                            {studentName[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{studentName}</p>
                                                            <p className="text-slate-500 text-sm">
                                                                Scenario: {progress.scenario_title || progress.scenario_id} • Score: {progress.score || 0}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-slate-500 text-xs">
                                                        {new Date(progress.completed_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Feedback Tab */}
                    {activeTab === 'feedback' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Send Form */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-teal-400" /> Send Feedback
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Student Email</label>
                                        <input type="email" placeholder="student@email.com"
                                            value={feedbackForm.student_email}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, student_email: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition" />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Type</label>
                                        <select value={feedbackForm.type}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500">
                                            <option value="general">General</option>
                                            <option value="praise">Praise</option>
                                            <option value="improvement">Needs Improvement</option>
                                            <option value="assignment">Assignment Note</option>
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

                            {/* Feedback History */}
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