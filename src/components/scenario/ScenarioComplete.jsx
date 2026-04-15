import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Trophy, Star, ArrowRight, Home, CheckCircle2, XCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ScenarioComplete({ scenario, responses, role, onShowCertificate, theme = {} }) {
    const passed = responses.exitTicket?.passed;

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';

    React.useEffect(() => {
        if (passed) {
            const duration = 3000;
            const end = Date.now() + duration;
            const frame = () => { if (Date.now() < end) requestAnimationFrame(frame); };
            frame();
        }
    }, [passed]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto px-6 text-center"
        >
            {/* Badge Celebration */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="mb-8"
            >
                {passed ? (
                    <div className={`w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br ${accent} p-1 shadow-2xl`}
                        style={{ boxShadow: '0 0 60px rgba(255,255,255,0.1)' }}>
                        <div className="w-full h-full rounded-3xl bg-slate-950 flex items-center justify-center text-7xl">
                            {scenario.badgeIcon}
                        </div>
                    </div>
                ) : (
                    <div className="w-32 h-32 mx-auto rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-7xl">
                        📋
                    </div>
                )}
            </motion.div>

            {/* Status */}
            {passed ? (
                <>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <h1 className="text-4xl font-bold text-white mb-2">Scenario Complete!</h1>
                        <p className="text-xl text-emerald-400 mb-8">You've earned a new badge</p>
                    </motion.div>

                    {/* Badge Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <Card className={`bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30 p-6 mb-8`}>
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Trophy className="w-6 h-6 text-amber-400" />
                                <span className="text-amber-400 font-semibold">Badge Earned</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{scenario.badge}</h2>
                            <p className="text-slate-400">
                                You demonstrated understanding of {scenario.scienceFocus[0].toLowerCase()} and made reasoned decisions.
                            </p>
                        </Card>
                    </motion.div>

                    {/* Skills Gained */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }} className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Skills Improved</h3>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {['Data Analysis', 'Critical Thinking', 'Problem Solving'].map((skill) => (
                                <div key={skill} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${border} bg-slate-900/50`}>
                                    <Star className={`w-4 h-4 ${text}`} />
                                    <span className={`${text} text-sm`}>{skill} +10</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            ) : (
                <>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <h1 className="text-4xl font-bold text-white mb-2">Almost There!</h1>
                        <p className="text-xl text-slate-400 mb-8">Review and try again to earn your badge</p>
                    </motion.div>

                    <Card className="bg-slate-900/50 border-slate-800 p-6 mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <XCircle className="w-6 h-6 text-amber-400" />
                            <span className="text-amber-400 font-semibold">Keep Practicing</span>
                        </div>
                        <p className="text-slate-400">
                            You need to score at least 70% on the exit ticket and complete the reflection to unlock the next scenario.
                        </p>
                    </Card>
                </>
            )}

            {/* Exit Ticket Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: passed ? 1 : 0.6 }}>
                <Card className={`bg-slate-900/50 border ${border} p-6 mb-8 text-left`}>
                    <h3 className={`text-lg font-semibold text-white mb-4 flex items-center gap-2`}>
                        <CheckCircle2 className={`w-5 h-5 ${text}`} />
                        Exit Ticket Results
                    </h3>
                    <div className="space-y-3">

                        {/* 1. Concept Questions */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${Number(responses.exitTicket?.score) === 100
                                ? border : 'border-slate-800'
                            } bg-slate-800/40`}>
                            <span className="text-slate-400">Concept Questions</span>
                            <span className={`font-semibold ${Number(responses.exitTicket?.score) === 100
                                    ? text : 'text-amber-400'
                                }`}>
                                {Number(responses.exitTicket?.score) === 100
                                    ? scenario.conceptQuestions?.length || 2
                                    : Math.round((Number(responses.exitTicket?.score) || 0) / 100 * (scenario.conceptQuestions?.length || 2))
                                }/{scenario.conceptQuestions?.length || 2} correct
                            </span>
                        </div>

                        {/* 2. Questions Accuracy */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${responses.exitTicket?.score >= (scenario.conceptQuestions?.length || 2)
                            ? border : 'border-slate-800'
                            } bg-slate-800/40`}>
                            <span className="text-slate-400">Questions Accuracy</span>
                            <span className={`font-semibold ${responses.exitTicket?.score >= (scenario.conceptQuestions?.length || 2)
                                ? text : 'text-amber-400'
                                }`}>
                                {Math.min(100, Math.round((Number(responses.exitTicket?.score) || 0) / (scenario.conceptQuestions?.length || 2) * 100))}%
                            </span>
                        </div>

                        {/* 3. Reflection */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${responses.exitTicket?.reflection?.length >= 10
                            ? border : 'border-slate-800'
                            } bg-slate-800/40`}>
                            <span className="text-slate-400">Reflection</span>
                            <span className={`font-semibold ${responses.exitTicket?.reflection?.length >= 10
                                ? text : 'text-amber-400'
                                }`}>
                                {responses.exitTicket?.reflection?.length >= 10 ? 'Completed' : 'Incomplete'}
                            </span>
                        </div>

                        {/* 4. Transfer Question */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${responses.exitTicket?.transfer_answer?.length >= 10
                            ? border : 'border-slate-800'
                            } bg-slate-800/40`}>
                            <span className="text-slate-400">Transfer Question</span>
                            <span className={`font-semibold ${responses.exitTicket?.transfer_answer?.length >= 10
                                ? text : 'text-amber-400'
                                }`}>
                                {responses.exitTicket?.transfer_answer?.length >= 10 ? 'Completed' : 'Incomplete'}
                            </span>
                        </div>

                    </div>
                </Card>
            </motion.div>

            {/* Certificate Button */}
            {passed && onShowCertificate && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }} className="mb-8">
                    <Button
                        onClick={onShowCertificate}
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 text-black font-semibold"
                    >
                        <Award className="w-5 h-5 mr-2" />
                        View & Download Certificate
                    </Button>
                </motion.div>
            )}

            {/* Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: passed ? 1.2 : 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center">

                <Link to={createPageUrl('RoleHub') + `?role=${role?.id}`}>
                    <Button variant="outline" size="lg"
                        className={`border ${border} ${text} hover:bg-slate-800 w-full sm:w-auto`}>
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Continue to Next Scenario
                    </Button>
                </Link>

                <Link to={createPageUrl('Dashboard')}>
                    <Button size="lg"
                        className={`bg-gradient-to-r ${accent} hover:opacity-90 text-white w-full sm:w-auto`}>
                        <Home className="w-5 h-5 mr-2" />
                        View Dashboard
                    </Button>
                </Link>
            </motion.div>
        </motion.div>
    );
}