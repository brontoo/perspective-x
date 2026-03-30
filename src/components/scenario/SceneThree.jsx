import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, FileText, TrendingUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function SceneThree({ scene, previousDecision, scenarioTitle, onComplete, isTeacher = false, theme = {} }) {
    const consequence = scene.consequences[previousDecision] || scene.consequences[Object.keys(scene.consequences)[0]];
    const [followUpAnswer, setFollowUpAnswer] = useState('');

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';

    const handleContinue = () => {
        onComplete({ followUpAnswer, consequence: previousDecision });
    };

    const handleTeacherSkip = () => {
        onComplete({ followUpAnswer: 'Teacher preview - skipped', consequence: previousDecision });
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

            {/* Consequence Reveal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Card className={`bg-slate-900/50 border ${border} p-8 mb-6`}>
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${accent} bg-opacity-20 border ${border} flex items-center justify-center flex-shrink-0`}
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <Zap className={`w-7 h-7 ${text}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">What Happened</h3>
                            <p className="text-slate-300 leading-relaxed text-lg">{consequence.outcome}</p>
                        </div>
                    </div>

                    {/* Key Message */}
                    <div className={`p-4 rounded-xl border ${border} bg-slate-800/40 mb-6`}>
                        <div className="flex items-start gap-3">
                            <MessageSquare className={`w-5 h-5 ${text} flex-shrink-0 mt-0.5`} />
                            <p className={`${text} italic`}>{consequence.message}</p>
                        </div>
                    </div>

                    {/* Updated Data */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50">
                        <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="text-slate-500 text-sm block mb-1">Updated Data:</span>
                            <p className="text-emerald-300">{consequence.newData}</p>
                        </div>
                    </div>
                </Card>
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
                    Complete Exit Ticket
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