import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ROLES, SCENARIOS } from '@/components/scenarios/scenarioData';
import {
    ArrowLeft, Trophy, Sparkles, MessageSquare,
    Target, Briefcase, Loader2, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function RoleReflection() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const roleId = params.get('role');

    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const [responses, setResponses] = useState({
        skillImproved: '',
        hardestDecision: '',
        realWorldConnection: ''
    });

    const role = ROLES[roleId];

    useEffect(() => {
        if (!role) {
            navigate(createPageUrl('Home'));
            return;
        }
        loadProgress();
    }, [roleId]);

    const loadProgress = async () => {
        try {
            const progressList = await base44.entities.StudentProgress.list();
            if (progressList.length > 0) {
                setProgress(progressList[0]);
            }
        } catch (e) {
            console.error('Error:', e);
        } finally {
            setLoading(false);
        }
    };

    const completedInRole = progress?.completed_scenarios?.filter(s =>
        role?.scenarios.includes(s)
    ) || [];

    const handleSubmit = async () => {
        setSubmitted(true);
        // Could save reflection to database here
    };

    if (!role || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-lg"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-4">Reflection Complete!</h1>
                    <p className="text-slate-400 mb-8">
                        Your thoughtful reflection helps deepen your learning.
                        You've completed the {role.title} journey!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={createPageUrl('Home')}>
                            <Button size="lg" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white w-full sm:w-auto">
                                Explore Other Roles
                            </Button>
                        </Link>
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="outline" size="lg" className="border-slate-700 text-slate-300 w-full sm:w-auto">
                                View Dashboard
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        to={createPageUrl('RoleHub') + `?role=${roleId}`}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to {role.title}</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Role Reflection</span>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="text-5xl">{role.icon}</span>
                        <h1 className="text-3xl font-bold text-white">{role.title} Journey</h1>
                    </div>

                    <p className="text-slate-400">
                        You've completed {completedInRole.length} of {role.scenarios.length} scenarios.
                        Take a moment to reflect on your learning.
                    </p>
                </motion.div>

                {/* Questions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-8"
                >
                    {/* Question 1: Skill Improvement */}
                    <Card className="bg-slate-900/50 border-slate-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-teal-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">What skill improved most?</h3>
                        </div>

                        <RadioGroup
                            value={responses.skillImproved}
                            onValueChange={(v) => setResponses({ ...responses, skillImproved: v })}
                            className="space-y-3"
                        >
                            {['Data Analysis', 'Critical Thinking', 'Scientific Communication', 'Ethical Reasoning', 'Problem Solving'].map((skill) => (
                                <div key={skill} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                    <RadioGroupItem value={skill} id={skill} />
                                    <Label htmlFor={skill} className="text-slate-300 cursor-pointer flex-1">{skill}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </Card>

                    {/* Question 2: Hardest Decision */}
                    <Card className="bg-slate-900/50 border-slate-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">What decision was hardest?</h3>
                        </div>

                        <Textarea
                            value={responses.hardestDecision}
                            onChange={(e) => setResponses({ ...responses, hardestDecision: e.target.value })}
                            placeholder="Describe a decision that challenged you and why it was difficult..."
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px] resize-none"
                        />
                    </Card>

                    {/* Question 3: Real World Connection */}
                    <Card className="bg-slate-900/50 border-slate-800 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">How does this connect to real life or careers?</h3>
                        </div>

                        <Textarea
                            value={responses.realWorldConnection}
                            onChange={(e) => setResponses({ ...responses, realWorldConnection: e.target.value })}
                            placeholder="Explain how what you learned could apply to real-world situations or career paths..."
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px] resize-none"
                        />
                    </Card>
                </motion.div>

                {/* Submit */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <Button
                        onClick={handleSubmit}
                        disabled={!responses.skillImproved || responses.hardestDecision.length < 20 || responses.realWorldConnection.length < 20}
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12"
                    >
                        Complete Reflection
                        <Trophy className="w-5 h-5 ml-2" />
                    </Button>

                    <p className="text-slate-500 text-sm mt-3">
                        Answer all questions to submit your reflection
                    </p>
                </motion.div>
            </main>
        </div>
    );
}