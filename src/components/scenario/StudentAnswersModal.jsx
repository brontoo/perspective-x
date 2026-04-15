import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { SCENARIOS } from '@/components/scenarios/scenarioData';

export default function StudentAnswersModal({ isOpen, onClose, attempts = [], studentName }) {
    const [expandedAttempt, setExpandedAttempt] = useState(null);
    const normalizedAttempts = useMemo(() => {
        return [...attempts]
            .filter((attempt) => attempt?.scenario_id)
            .sort((left, right) => new Date(right?.completed_at || 0) - new Date(left?.completed_at || 0));
    }, [attempts]);

    const renderAnswerContent = (attempt) => {
        const answers = attempt.answers || {};
        const scenario = SCENARIOS[attempt.scenario_id] || {};

        return (
            <div className="space-y-6 mt-4">
                {/* Scene 1 Decision */}
                {answers.scene1 && (
                    <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/50">
                        <h4 className="text-teal-400 font-semibold mb-3 flex items-center gap-2">
                            🎬 Scene 1 - Decision
                        </h4>
                        <div className="text-slate-300 text-sm space-y-2">
                            {(answers.scene1.selectedOption || answers.scene1.decision_id) && (
                                <div>
                                    <p className="text-slate-400 text-xs">Decision Made:</p>
                                    <p className="text-white font-medium">{answers.scene1.selectedOption || answers.scene1.decision_id}</p>
                                </div>
                            )}
                            {(answers.scene1.justification || answers.scene1.reasoning) && (
                                <div>
                                    <p className="text-slate-400 text-xs">Reasoning:</p>
                                    <p className="text-white">{answers.scene1.justification || answers.scene1.reasoning}</p>
                                </div>
                            )}
                            {answers.scene1.consequence && (
                                <div>
                                    <p className="text-slate-400 text-xs">Consequence:</p>
                                    <p className="text-white">{answers.scene1.consequence}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Scene 2 Decision */}
                {answers.scene2 && (
                    <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/50">
                        <h4 className="text-teal-400 font-semibold mb-3 flex items-center gap-2">
                            🎬 Scene 2 - Decision
                        </h4>
                        <div className="text-slate-300 text-sm space-y-2">
                            {(answers.scene2.selectedOption || answers.scene2.decision_id) && (
                                <div>
                                    <p className="text-slate-400 text-xs">Decision Made:</p>
                                    <p className="text-white font-medium">{answers.scene2.selectedOption || answers.scene2.decision_id}</p>
                                </div>
                            )}
                            {(answers.scene2.justification || answers.scene2.reasoning) && (
                                <div>
                                    <p className="text-slate-400 text-xs">Reasoning:</p>
                                    <p className="text-white">{answers.scene2.justification || answers.scene2.reasoning}</p>
                                </div>
                            )}
                            {answers.scene2.consequence && (
                                <div>
                                    <p className="text-slate-400 text-xs">Consequence:</p>
                                    <p className="text-white">{answers.scene2.consequence}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Scene 3 Decision */}
                {answers.scene3 && (
                    <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/50">
                        <h4 className="text-teal-400 font-semibold mb-3 flex items-center gap-2">
                            🎬 Scene 3 - Decision
                        </h4>
                        <div className="text-slate-300 text-sm space-y-2">
                            {(answers.scene3.selectedOption || answers.scene3.decision_id) && (
                                <div>
                                    <p className="text-slate-400 text-xs">Decision Made:</p>
                                    <p className="text-white font-medium">{answers.scene3.selectedOption || answers.scene3.decision_id}</p>
                                </div>
                            )}
                            {(answers.scene3.justification || answers.scene3.reasoning) && (
                                <div>
                                    <p className="text-slate-400 text-xs">Reasoning:</p>
                                    <p className="text-white">{answers.scene3.justification || answers.scene3.reasoning}</p>
                                </div>
                            )}
                            {answers.scene3.consequence && (
                                <div>
                                    <p className="text-slate-400 text-xs">Consequence:</p>
                                    <p className="text-white">{answers.scene3.consequence}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Exit Ticket */}
                {answers.exitTicket && (
                    <div className="border border-emerald-700 rounded-xl p-4 bg-emerald-500/5">
                        <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                            🎫 Exit Ticket
                        </h4>
                        <div className="text-slate-300 text-sm space-y-3">
                            {/* MCQ Answers */}
                            {answers.exitTicket.mcq_answers && answers.exitTicket.mcq_answers.length > 0 && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold mb-2">Multiple Choice Answers:</p>
                                    <div className="space-y-1">
                                        {answers.exitTicket.mcq_answers.map((answer, idx) => (
                                            <div key={idx} className="text-xs text-slate-300 ml-2">
                                                Q{idx + 1}: <span className="text-white font-medium">{answer}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reflection */}
                            {answers.exitTicket.reflection && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold">Reflection:</p>
                                    <p className="text-white mt-1 bg-slate-900 p-2 rounded border border-slate-700">
                                        {answers.exitTicket.reflection}
                                    </p>
                                </div>
                            )}

                            {/* Transfer Answer */}
                            {answers.exitTicket.transfer_answer && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold">Transfer Application:</p>
                                    <p className="text-white mt-1 bg-slate-900 p-2 rounded border border-slate-700">
                                        {answers.exitTicket.transfer_answer}
                                    </p>
                                </div>
                            )}

                            {/* Score */}
                            {answers.exitTicket.score !== undefined && (
                                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                                    <span className="text-slate-400">Score:</span>
                                    <span className={`text-sm font-bold ${answers.exitTicket.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {answers.exitTicket.score}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Student Answers</h2>
                                    <p className="text-sm text-slate-400">{studentName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-lg hover:bg-slate-800 flex items-center justify-center transition"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                            {normalizedAttempts.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>لم يتم العثور على محاولات سيناريو</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {normalizedAttempts.map((attempt) => (
                                        <motion.div
                                            key={attempt.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/30 hover:bg-slate-800/50 transition"
                                        >
                                            {/* Attempt Header */}
                                            <button
                                                onClick={() => setExpandedAttempt(expandedAttempt === attempt.id ? null : attempt.id)}
                                                className="w-full p-4 flex items-center justify-between cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {attempt.score >= 70 ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <p className="text-white font-semibold truncate">
                                                            {SCENARIOS[attempt.scenario_id]?.title || attempt.scenario_id}
                                                        </p>
                                                        <p className="text-slate-400 text-xs">
                                                            {attempt.completed_at
                                                                ? new Date(attempt.completed_at).toLocaleDateString()
                                                                : 'Not completed'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                                    <span className={`text-sm font-bold px-3 py-1 rounded-lg ${attempt.score >= 70
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                        {attempt.score}%
                                                    </span>
                                                    <div className="text-slate-400">
                                                        {expandedAttempt === attempt.id ? '▼' : '▶'}
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Expanded Content */}
                                            <AnimatePresence>
                                                {expandedAttempt === attempt.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="border-t border-slate-700 px-4 pb-4 bg-slate-900/50"
                                                    >
                                                        {renderAnswerContent(attempt)}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-800 p-4 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
