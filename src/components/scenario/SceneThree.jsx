import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, FileText, TrendingUp, MessageSquare, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScenarioLearningObjective, ScenarioResponseCard, ScenarioStageHeader, ScenarioVisualPanel } from './ScenarioPrimitives';
import { toMetricRows } from './scenarioHelpers';
import useTypewriter from './useTypewriter';

export default function SceneThree({ scene, scenarioId, previousDecision, scenarioTitle: _scenarioTitle, scenarioAvatar, onComplete, isTeacher = false, theme = {} }) {
    const consequenceEntries = Object.entries(scene?.consequences || {});
    const fallbackConsequenceKey = consequenceEntries[0]?.[0] || null;
    const resolvedConsequenceKey = previousDecision && scene?.consequences?.[previousDecision]
        ? previousDecision
        : fallbackConsequenceKey;
    const consequence = resolvedConsequenceKey ? scene?.consequences?.[resolvedConsequenceKey] : null;
    const [followUpAnswer, setFollowUpAnswer] = useState('');
    const displayedOutcome = useTypewriter(consequence?.outcome || '');

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';

    const metricRows = scene.data?.table?.rows?.length
        ? scene.data.table.rows
        : toMetricRows(consequence?.newData);

    const sceneThreeDataTable = metricRows.length
        ? {
            headers: ['Metric', 'Value'],
            rows: metricRows,
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
            <ScenarioStageHeader
                sceneNumber="Scene 3"
                title={scene.title}
                subtitle="Consequences of Your Decision"
                border={border}
                text={text}
                className="mb-8"
            />

            {/* Consequence Reveal - HUD Style */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className={`relative overflow-hidden rounded-3xl border ${border} bg-slate-950/80 backdrop-blur-md shadow-2xl mb-8`}>
                    {/* Scanning Line */}
                    <div className="absolute inset-x-0 h-px bg-teal-500/10 animate-scan pointer-events-none z-0" />
                    
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

                        <ScenarioVisualPanel
                            scenarioId={scenarioId}
                            sceneIndex={2}
                            avatar={scene.avatar || scenarioAvatar}
                            title={scene.title}
                            subtitle={consequence?.message || consequence?.outcome || 'Outcome available below'}
                            dataTable={sceneThreeDataTable}
                            border={border}
                            className="mb-6"
                        />

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
                                    <p className={`text-xs ${text} italic`}>{consequence?.message || 'No additional summary available.'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-white/5">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Observation Data</span>
                                    <p className="text-[11px] text-emerald-300 font-mono">{consequence?.newData || 'No data available'}</p>
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
                <ScenarioResponseCard
                    icon={FileText}
                    title="Reflection Question"
                    prompt={scene.followUpQuestion}
                    value={followUpAnswer}
                    onChange={setFollowUpAnswer}
                    placeholder="Type your response..."
                    border={border}
                    text={text}
                    className="mb-8"
                />
            </motion.div>

            <ScenarioLearningObjective value={scene.learningObjective} border={border} text={text} className="mb-8" />

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
