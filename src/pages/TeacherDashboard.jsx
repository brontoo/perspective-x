import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ROLES, SCENARIOS } from '@/components/scenarios/scenarioData';
import {
    Users, BookOpen, Settings, BarChart3, Lock, Unlock,
    Star, AlertCircle, ChevronRight, Loader2, LogOut,
    GraduationCap, CheckCircle2, Clock, Target, Home, Eye,
    MessageSquare, Send, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scenarioSettings, setScenarioSettings] = useState({});
    const [students, setStudents] = useState([]);
    const [studentProgress, setStudentProgress] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackForm, setFeedbackForm] = useState({ student_email: '', message: '', type: 'general', scenario_id: '' });
    const [sendingFeedback, setSendingFeedback] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            // Load scenario settings
            const settings = await base44.entities.ScenarioSettings.list();
            const settingsMap = {};
            settings.forEach(s => {
                settingsMap[s.scenario_id] = s;
            });
            setScenarioSettings(settingsMap);

            // Load all student progress
            const allProgress = await base44.entities.StudentProgress.list();
            setStudentProgress(allProgress);

            // Load students
            const userList = await base44.entities.User.list();
            setStudents(userList.filter(u => u.user_type === 'student'));

            // Load feedbacks
            const feedbackList = await base44.entities.TeacherFeedback.list('-created_date');
            setFeedbacks(feedbackList);
        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
    };

    const updateScenarioSetting = async (scenarioId, field, value) => {
        try {
            const existing = scenarioSettings[scenarioId];
            if (existing) {
                await base44.entities.ScenarioSettings.update(existing.id, { [field]: value });
                setScenarioSettings({
                    ...scenarioSettings,
                    [scenarioId]: { ...existing, [field]: value }
                });
            } else {
                const newSetting = await base44.entities.ScenarioSettings.create({
                    scenario_id: scenarioId,
                    [field]: value
                });
                setScenarioSettings({
                    ...scenarioSettings,
                    [scenarioId]: newSetting
                });
            }
        } catch (e) {
            console.error('Error updating setting:', e);
        }
    };

    const sendFeedback = async () => {
        if (!feedbackForm.student_email || !feedbackForm.message) return;
        setSendingFeedback(true);
        const newFb = await base44.entities.TeacherFeedback.create({
            ...feedbackForm,
            teacher_name: user?.full_name || 'Teacher'
        });
        setFeedbacks([newFb, ...feedbacks]);
        setFeedbackForm({ student_email: '', message: '', type: 'general', scenario_id: '' });
        setSendingFeedback(false);
    };

    const deleteFeedback = async (id) => {
        await base44.entities.TeacherFeedback.delete(id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
    };

    const handleLogout = () => {
        base44.auth.logout(createPageUrl('SignIn'));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    const totalScenarios = Object.keys(SCENARIOS).length;
    const completedByStudents = studentProgress.reduce((sum, p) => sum + (p.completed_scenarios?.length || 0), 0);

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
                            <p className="text-sm text-slate-400">Welcome, {user?.full_name || 'Teacher'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => navigate(createPageUrl('Home'))} className="text-slate-400 hover:text-white">
                            <Home className="w-5 h-5 mr-2" />
                            Home
                        </Button>
                        <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-white">
                            <LogOut className="w-5 h-5 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Students</p>
                                <p className="text-2xl font-bold text-white">{students.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-teal-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Scenarios</p>
                                <p className="text-2xl font-bold text-white">{totalScenarios}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Completions</p>
                                <p className="text-2xl font-bold text-white">{completedByStudents}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Target className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Avg Progress</p>
                                <p className="text-2xl font-bold text-white">
                                    {students.length > 0 ? Math.round(completedByStudents / students.length / totalScenarios * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="scenarios" className="space-y-6">
                    <TabsList className="bg-slate-900 border border-slate-800">
                        <TabsTrigger value="scenarios" className="data-[state=active]:bg-teal-500/20">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Scenarios
                        </TabsTrigger>
                        <TabsTrigger value="students" className="data-[state=active]:bg-teal-500/20">
                            <Users className="w-4 h-4 mr-2" />
                            Student Progress
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="data-[state=active]:bg-teal-500/20">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Feedback
                        </TabsTrigger>
                    </TabsList>

                    {/* Scenarios Management */}
                    <TabsContent value="scenarios">
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Scenario Settings</h2>

                            <div className="space-y-4">
                                {Object.entries(SCENARIOS).map(([id, scenario]) => {
                                    const settings = scenarioSettings[id] || {};
                                    const difficulty = settings.difficulty_override || 'on-level';

                                    return (
                                        <motion.div
                                            key={id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* Scenario info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-2xl">{scenario.badgeIcon}</span>
                                                        <div>
                                                            <h3 className="text-white font-semibold">{scenario.title}</h3>
                                                            <p className="text-slate-500 text-sm">{scenario.strand} • {scenario.estimatedTime} min</p>
                                                        </div>
                                                    </div>

                                                    {/* Difficulty badge */}
                                                    <Badge className={`
                            ${difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                            difficulty === 'on-level' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                                'bg-red-500/20 text-red-400 border-red-500/30'}
                          `}>
                                                        {difficulty === 'beginner' ? '🟢 Beginner' :
                                                            difficulty === 'on-level' ? '🟡 On-Level' :
                                                                '🔴 High Achievers'}
                                                    </Badge>
                                                </div>

                                                {/* Controls */}
                                                <div className="flex flex-wrap items-center gap-4">
                                                    {/* Preview button */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                                        onClick={() => navigate(createPageUrl('ScenarioPlayer') + `?scenario=${id}`)}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Preview
                                                    </Button>
                                                    {/* Difficulty selector */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 text-sm">Level:</span>
                                                        <Select
                                                            value={difficulty}
                                                            onValueChange={(v) => updateScenarioSetting(id, 'difficulty_override', v)}
                                                        >
                                                            <SelectTrigger className="w-36 bg-slate-800 border-slate-700">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                                <SelectItem value="on-level">On-Level</SelectItem>
                                                                <SelectItem value="high-achievers">High Achievers</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Mandatory toggle */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 text-sm">Mandatory:</span>
                                                        <Switch
                                                            checked={settings.is_mandatory || false}
                                                            onCheckedChange={(v) => updateScenarioSetting(id, 'is_mandatory', v)}
                                                        />
                                                    </div>

                                                    {/* Lock toggle */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 text-sm">
                                                            {settings.is_locked ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                                                        </span>
                                                        <Switch
                                                            checked={!settings.is_locked}
                                                            onCheckedChange={(v) => updateScenarioSetting(id, 'is_locked', !v)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Student Progress */}
                    <TabsContent value="students">
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Student Progress</h2>

                            {studentProgress.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No student progress data yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {studentProgress.map((progress, index) => {
                                        const completed = progress.completed_scenarios?.length || 0;
                                        const percentage = (completed / totalScenarios) * 100;

                                        return (
                                            <div
                                                key={progress.id}
                                                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                                                            {(progress.created_by || 'S')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{progress.created_by || `Student ${index + 1}`}</p>
                                                            <p className="text-slate-500 text-sm">{completed}/{totalScenarios} scenarios completed</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {progress.badges?.map((badge, i) => (
                                                            <span key={i} className="text-lg" title={badge}>🏆</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                    {/* Feedback Tab */}
                    <TabsContent value="feedback">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Send Feedback Form */}
                            <Card className="bg-slate-900/50 border-slate-800 p-6">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-teal-400" />
                                    Send Feedback
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Student Email</label>
                                        <Input
                                            placeholder="student@email.com"
                                            value={feedbackForm.student_email}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, student_email: e.target.value })}
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Type</label>
                                        <select
                                            value={feedbackForm.type}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm"
                                        >
                                            <option value="general">General</option>
                                            <option value="praise">Praise</option>
                                            <option value="improvement">Needs Improvement</option>
                                            <option value="assignment">Assignment Note</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Scenario (optional)</label>
                                        <select
                                            value={feedbackForm.scenario_id}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, scenario_id: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm"
                                        >
                                            <option value="">All Scenarios</option>
                                            {Object.entries(SCENARIOS).map(([id, s]) => (
                                                <option key={id} value={id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm mb-1 block">Message</label>
                                        <Textarea
                                            placeholder="Write your feedback here..."
                                            value={feedbackForm.message}
                                            onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                                            className="bg-slate-800 border-slate-700 text-white h-28"
                                        />
                                    </div>
                                    <Button
                                        onClick={sendFeedback}
                                        disabled={sendingFeedback || !feedbackForm.student_email || !feedbackForm.message}
                                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 border-0"
                                    >
                                        {sendingFeedback ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                        Send Feedback
                                    </Button>
                                </div>
                            </Card>

                            {/* Feedback History */}
                            <Card className="bg-slate-900/50 border-slate-800 p-6">
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
                                                        <button
                                                            onClick={() => deleteFeedback(fb.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                                                        >
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
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}