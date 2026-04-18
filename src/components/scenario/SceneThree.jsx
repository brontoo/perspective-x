import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, FileText, TrendingUp, MessageSquare, Activity, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ScenarioVisual from './ScenarioVisual';

// Custom typewriter hook for HUD feel
function useTypewriter(text, speed = 30) {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        if (!text) return;
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(i));
            i++;
            if (i >= text.length) clearInterval(timer);
        }, speed);
        return () => clearInterval(timer);
    }, [text]);
    return displayedText;
}

export default function SceneThree({ scene, scenarioId, previousDecision, scenarioTitle, onComplete, isTeacher = false, theme = {} }) {
    const fallbackConsequenceKey = Object.keys(scene.consequences)[0];
    const resolvedConsequenceKey = scene.consequences[previousDecision] ? previousDecision : fallbackConsequenceKey;
    const consequence = scene.consequences[resolvedConsequenceKey];
    const [followUpAnswer, setFollowUpAnswer] = useState('');
    const displayedOutcome = useTypewriter(consequence.outcome || '');

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';

    const sceneThreeDataTable = scene.data?.table
        ? scene.data.table
        : consequence?.newData
            ? {
                headers: ['Metric', 'Value'],
                rows: [['Observation', consequence.newData]],
            }
            : null;

    const handleContinue = () => {
        onComplete({
            followUpAnswer,
            consequence: resolvedConsequenceKey,
            consequenceData: consequence,
        });
    };

    const handleTeacherSkip = () => {
        onComplete({
            followUpAnswer: 'Teacher preview - skipped',
            consequence: resolvedConsequenceKey,
            consequenceData: consequence,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6"
        >
            {/* Scene Header */}
            <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${border} bg-slate-900/50 text-sm mb-4`}>
                    <span className={`font-bold ${text}`}>Scene 3</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{scene.title}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Consequences of Your Decision</h2>
            </div>

            {/* Consequence Reveal - HUD Style */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className={`relative overflow-hidden rounded-3xl border ${border} bg-slate-950/80 backdrop-blur-md shadow-2xl mb-8`}>
                    {/* Scanning Line */}
                    <div className="absolute inset-x-0 h-px bg-teal-500/10 animate-scan pointer-events-none" />
                    
                    <div className="p-8 relative">
                        {/* HUD Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-500/30 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-500/30 rounded-tr-lg" />

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-slate-900 border ${border}`}>
                                    <Zap className={`w-5 h-5 ${text} animate-pulse`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Impact Analysis</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-mono text-slate-500">PROCESSING OUTCOME...</span>
                                    </div>
                                </div>
                            </div>
                            <Activity className="w-6 h-6 text-teal-500/50" />
                        </div>

                        {/* Integrated Visual - Consequence Result */}
                        <div className="mb-6 h-48 bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                            <ScenarioVisual 
                                scenarioId={scenarioId} 
                                sceneIndex={2} 
                                avatar={scene.avatar}
                                title={scene.title}
                                subtitle={consequence.message}
                                dataTable={sceneThreeDataTable}
                            />
                        </div>

                        <div className="min-h-[100px] mb-6">
                            <p className="text-slate-300 leading-relaxed text-lg font-medium font-serif italic">
                                {displayedOutcome}
                                <span className="inline-block w-2 h-5 bg-teal-500 ml-1 animate-pulse" />
                            </p>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border ${border} bg-slate-800/40 relative overflow-hidden group`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <div className="flex items-start gap-3">
                                    <MessageSquare className={`w-3.5 h-3.5 ${text} flex-shrink-0 mt-0.5`} />
                                    <p className={`text-xs ${text} italic`}>{consequence.message}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-white/5">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Observation Data</span>
                                    <p className="text-[11px] text-emerald-300 font-mono">{consequence.newData || 'No data available'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Follow-up Question */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className={`bg-slate-900/50 border ${border} p-6 mb-8`}>
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className={`w-5 h-5 ${text}`} />
                        <h4 className="font-semibold text-white">Reflection Question</h4>
                    </div>
                    <p className="text-slate-300 mb-4">{scene.followUpQuestion}</p>
                    <Textarea
                        value={followUpAnswer}
                        onChange={(e) => setFollowUpAnswer(e.target.value)}
                        placeholder="Type your response..."
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px] resize-none"
                    />
                </Card>
            </motion.div>

            {/* Learning Objective */}
            <div className="mb-8 text-center">
                <div className={`p-4 rounded-xl bg-slate-800/50 border ${border} inline-block`}>
                    <span className="text-slate-500 text-sm">Learning Objective: </span>
                    <span className={`${text} text-sm font-medium`}>{scene.learningObjective}</span>
                </div>
            </div>

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
            >
                <Button
                    onClick={handleContinue}
                    disabled={followUpAnswer.length < 20 && !isTeacher}
                    size="lg"
                    className={`bg-gradient-to-r ${accent} hover:opacity-90 text-white px-8 disabled:opacity-50`}
                >
                    View Impact Report
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {followUpAnswer.length < 20 && !isTeacher && (
                    <p className="text-slate-500 text-sm mt-2">Please write a thoughtful response (at least 20 characters)</p>
                )}

                {isTeacher && followUpAnswer.length < 20 && (
                    <div className="mt-4">
                        <Button onClick={handleTeacherSkip} variant="outline"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                            Skip (Teacher Preview)
                        </Button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}