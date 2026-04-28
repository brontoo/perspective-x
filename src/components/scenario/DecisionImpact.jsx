import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, MessageSquare, TrendingUp, FileText, Activity, ArrowRight,
    CheckCircle2, XCircle, RefreshCw, Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ScenarioVisual from './ScenarioVisual';
import { ScenarioLearningObjective } from './ScenarioPrimitives';
import { toMetricRows } from './scenarioHelpers';
import useTypewriter from './useTypewriter';
import { evaluateScenarioOutcome } from './scenarioAnswerKey';

// Slide-in wrapper
function Section({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
}

export default function DecisionImpact({
    scenario,
    scenarioId,
    consequenceKey,
    theme = {},
    isTeacher = false,
    onComplete,
    onRetry,
    onRewatch,
}) {
    const scene2 = scenario.scenes[2];

    const consequence = consequenceKey && scene2?.consequences?.[consequenceKey]
        ? scene2.consequences[consequenceKey]
        : Object.values(scene2?.consequences || {})[0] || null;

    const [showReflect, setShowReflect] = useState(false);
    const [followUpAnswer, setFollowUpAnswer] = useState('');
    const [impactRevealed, setImpactRevealed] = useState(false);

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';

    const outcomeText = useTypewriter(consequence?.outcome || '');
    const outcomeTyping = outcomeText.length < (consequence?.outcome || '').length;

    const metricRows = scene2?.data?.table?.rows?.length
        ? scene2.data.table.rows
        : toMetricRows(consequence?.newData);

    const outcome = evaluateScenarioOutcome(scenarioId, consequenceKey);

    const handleSubmitReflection = () => {
        setImpactRevealed(true);
    };

    const handleProceedToExitTicket = () => {
        onComplete({
            scene3: {
                followUpAnswer,
                consequence: consequenceKey,
                consequenceData: consequence,
            },
        });
    };

    const handleTeacherSkip = () => {
        onComplete({
            scene3: {
                followUpAnswer: 'Teacher preview – skipped',
                consequence: consequenceKey,
                consequenceData: consequence,
            },
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-6 space-y-6 pb-16">

            {/* ─────────────────  REVEAL: CONSEQUENCES  ───────────────── */}
            <div className={`relative overflow-hidden rounded-3xl border ${border} bg-slate-950/80 backdrop-blur-md shadow-2xl`}>
                <div className="absolute inset-x-0 h-px bg-teal-500/10 animate-scan pointer-events-none" />
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-500/30 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-500/30 rounded-tr-lg" />

                <div className="p-6 space-y-5">
                    {/* HUD header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-slate-900 border ${border}`}>
                                <Zap className={`w-5 h-5 ${text} animate-pulse`} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Scene 3 — Consequences & Response</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-mono text-slate-500">
                                        {scene2?.title}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Activity className="w-6 h-6 text-teal-500/50" />
                    </div>

                    {/* Visual */}
                    <div className="h-40 rounded-2xl overflow-hidden border border-white/5 bg-slate-900/50 flex items-center justify-center">
                        <ScenarioVisual
                            scenarioId={scenarioId}
                            sceneIndex={2}
                            avatar={scene2?.avatar || scenario.character?.avatar}
                            title={scene2?.title}
                        />
                    </div>

                    {/* Outcome typewriter */}
                    <div className="min-h-[80px]">
                        <p className="text-slate-300 leading-relaxed text-lg font-medium font-serif italic">
                            {outcomeText}
                            {outcomeTyping && (
                                <span className="inline-block w-2 h-5 bg-teal-500 ml-1 animate-pulse" />
                            )}
                        </p>
                    </div>

                    {/* Message + observation data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${border} bg-slate-800/40`}>
                            <div className="flex items-start gap-3">
                                <MessageSquare className={`w-3.5 h-3.5 ${text} flex-shrink-0 mt-0.5`} />
                                <p className={`text-xs ${text} italic`}>
                                    {consequence?.message || 'No summary available.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-white/5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Observation Data</span>
                                <p className="text-[11px] text-emerald-300 font-mono">
                                    {consequence?.newData || 'No data available'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metric rows */}
                    {metricRows.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-slate-700">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-800/70 text-slate-300">
                                    <tr>
                                        <th className="px-3 py-2 font-semibold">Metric</th>
                                        <th className="px-3 py-2 font-semibold">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metricRows.map((row, i) => (
                                        <tr key={i} className="border-t border-slate-800 text-slate-300">
                                            {row.map((cell, j) => (
                                                <td key={j} className="px-3 py-2">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Continue to reflection — fades in 2 s */}
                    {!showReflect && !impactRevealed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 0.4 }}
                        >
                            <Button
                                onClick={() => setShowReflect(true)}
                                size="lg"
                                className={`w-full bg-gradient-to-r ${accent} hover:opacity-90`}
                            >
                                Continue to Reflection
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>

                            {isTeacher && (
                                <div className="text-center mt-3">
                                    <Button
                                        onClick={handleTeacherSkip}
                                        variant="outline"
                                        size="sm"
                                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                    >
                                        Skip (Teacher Preview)
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ────────────────────  REFLECT SECTION  ──────────────────────── */}
            {showReflect && !impactRevealed && (
                <Section>
                    <Card className={`border ${border} bg-slate-900/50 p-6 space-y-5`}>
                        <div className="flex items-center gap-2">
                            <FileText className={`w-5 h-5 ${text}`} />
                            <h4 className="font-semibold text-white">Reflection Question</h4>
                        </div>

                        {scene2?.followUpQuestion && (
                            <p className="text-slate-300 text-base leading-relaxed">{scene2.followUpQuestion}</p>
                        )}

                        <Textarea
                            value={followUpAnswer}
                            onChange={(e) => setFollowUpAnswer(e.target.value)}
                            placeholder="Type your reflection on what happened and why…"
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none min-h-[120px]"
                        />

                        <ScenarioLearningObjective
                            value={scene2?.learningObjective || scenario.scenes[0]?.learningObjective}
                            border={border}
                            text={text}
                        />

                        <Button
                            onClick={handleSubmitReflection}
                            disabled={followUpAnswer.length < 20 && !isTeacher}
                            size="lg"
                            className={`w-full bg-gradient-to-r ${accent} hover:opacity-90 disabled:opacity-50`}
                        >
                            View Impact Report
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>

                        {followUpAnswer.length < 20 && !isTeacher && (
                            <p className="text-slate-500 text-xs text-center">
                                Write a thoughtful reflection (min 20 characters)
                            </p>
                        )}
                    </Card>
                </Section>
            )}

            {/* ────────────────────  IMPACT ANALYSIS REVEAL  ───────────────── */}
            {impactRevealed && (
                <Section>
                    {outcome.isSuccess ? (
                        /* ── SUCCESS ── */
                        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-emerald-950/60 backdrop-blur-md shadow-2xl">
                            {/* Animated glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-xl" />

                            <div className="p-8 space-y-6 relative">
                                <div className="text-center space-y-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 mx-auto"
                                    >
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h2 className="text-3xl font-bold text-emerald-400 mb-2">Mission Successful</h2>
                                        <p className="text-slate-300 text-base leading-relaxed max-w-2xl mx-auto">
                                            {outcome.impactText}
                                        </p>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Button
                                        onClick={handleProceedToExitTicket}
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-semibold"
                                    >
                                        Proceed to Exit Ticket
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    ) : (
                        /* ── FAILURE ── */
                        <div className="relative overflow-hidden rounded-3xl border border-red-500/40 bg-red-950/60 backdrop-blur-md shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500/50 rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500/50 rounded-tr-xl" />

                            <div className="p-8 space-y-6 relative">
                                <div className="text-center space-y-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 mx-auto"
                                    >
                                        <XCircle className="w-10 h-10 text-red-400" />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h2 className="text-3xl font-bold text-red-400 mb-2">Unintended Consequences</h2>
                                        <p className="text-slate-300 text-base leading-relaxed max-w-2xl mx-auto">
                                            {outcome.impactText}
                                        </p>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="p-4 rounded-2xl border border-red-500/20 bg-slate-900/60 text-center"
                                >
                                    <p className="text-slate-400 text-sm">
                                        Return to the questions and reconsider the evidence, or re-watch the intro to refresh your understanding.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                >
                                    {onRetry && (
                                        <Button
                                            onClick={onRetry}
                                            size="lg"
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-semibold"
                                        >
                                            <RefreshCw className="w-5 h-5 mr-2" />
                                            Return to Questions
                                        </Button>
                                    )}
                                    {onRewatch && (
                                        <Button
                                            onClick={onRewatch}
                                            size="lg"
                                            variant="outline"
                                            className="border-red-500/40 text-red-300 hover:bg-red-500/10 font-semibold"
                                        >
                                            <Video className="w-5 h-5 mr-2" />
                                            Re-watch Intro Video
                                        </Button>
                                    )}
                                </motion.div>

                                {isTeacher && (
                                    <div className="text-center pt-2">
                                        <Button
                                            onClick={handleProceedToExitTicket}
                                            variant="outline"
                                            size="sm"
                                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                        >
                                            Override — Proceed to Exit Ticket (Teacher)
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Section>
            )}
        </div>
    );
}
