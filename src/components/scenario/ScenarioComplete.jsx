import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Trophy, Star, ArrowRight, Home, RefreshCw, CheckCircle2, XCircle, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import confetti from '@/components/ui/confetti';

export default function ScenarioComplete({ scenario, responses, role, onShowCertificate }) {
    const passed = responses.exitTicket?.passed;

    React.useEffect(() => {
        if (passed) {
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [passed]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto px-6 text-center"
        >
            {/* Badge celebration */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="mb-8"
            >
                <div className={`w-32 h-32 mx-auto rounded-3xl flex items-center justify-center text-7xl ${passed
                        ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30'
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}>
                    {passed ? scenario.badgeIcon : '📋'}
                </div>
            </motion.div>

            {/* Status */}
            {passed ? (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-4xl font-bold text-white mb-2">Scenario Complete!</h1>
                        <p className="text-xl text-emerald-400 mb-8">You've earned a new badge</p>
                    </motion.div>

                    {/* Badge card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30 p-6 mb-8">
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

                    {/* Skills gained */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mb-8"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Skills Improved</h3>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {['Data Analysis', 'Critical Thinking', 'Problem Solving'].map((skill, i) => (
                                <div key={skill} className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30">
                                    <Star className="w-4 h-4 text-teal-400" />
                                    <span className="text-teal-300 text-sm">{skill} +10</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            ) : (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
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

            {/* Exit ticket summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: passed ? 1 : 0.6 }}
            >
                <Card className="bg-slate-900/50 border-slate-800 p-6 mb-8 text-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Exit Ticket Results</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                            <span className="text-slate-400">Concept Questions</span>
                            <span className={`font-semibold ${responses.exitTicket?.score >= 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {responses.exitTicket?.score || 0}/2 correct
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                            <span className="text-slate-400">Reflection</span>
                            <span className={`font-semibold ${responses.exitTicket?.reflection?.length >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {responses.exitTicket?.reflection?.length >= 10 ? 'Completed' : 'Incomplete'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                            <span className="text-slate-400">Transfer Question</span>
                            <span className={`font-semibold ${responses.exitTicket?.transfer_answer?.length >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {responses.exitTicket?.transfer_answer?.length >= 10 ? 'Completed' : 'Incomplete'}
                            </span>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Certificate button for passed scenarios */}
            {passed && onShowCertificate && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mb-8"
                >
                    <Button
                        onClick={onShowCertificate}
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
                    >
                        <Award className="w-5 h-5 mr-2" />
                        View & Download Certificate
                    </Button>
                </motion.div>
            )}

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: passed ? 1.2 : 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
            >
                <Link to={createPageUrl('RoleHub') + `?role=${role?.id}`}>
                    <Button
                        variant="outline"
                        size="lg"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 w-full sm:w-auto"
                    >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Continue to Next Scenario
                    </Button>
                </Link>

                <Link to={createPageUrl('Dashboard')}>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white w-full sm:w-auto"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        View Dashboard
                    </Button>
                </Link>
            </motion.div>
        </motion.div>
    );
}