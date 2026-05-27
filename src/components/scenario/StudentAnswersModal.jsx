import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, CheckCircle2, XCircle } from 'lucide-react';
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

        return (
            <div className="space-y-6 mt-4">
                {/* Scene 1 Decision */}
                {answers.scene1 && (
                    <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/80 shadow-sm">
                        <h4 className="text-teal-600 font-bold mb-3 flex items-center gap-2 text-sm">
                            🎬 Scene 1 - Choice
                        </h4>
                        <div className="text-slate-700 text-sm space-y-2">
                            {(answers.scene1.selectedOption || answers.scene1.decision_id) && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Choice Made:</p>
                                    <p className="text-slate-800 font-bold mt-0.5">{answers.scene1.selectedOption || answers.scene1.decision_id}</p>
                                </div>
                            )}
                            {(answers.scene1.justification || answers.scene1.reasoning) && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Reasoning:</p>
                                    <p className="text-slate-850 mt-1 bg-white p-2.5 rounded-lg border border-slate-100 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                                        {answers.scene1.justification || answers.scene1.reasoning}
                                    </p>
                                </div>
                            )}
                            {answers.scene1.consequence && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Result:</p>
                                    <p className="text-slate-800 font-medium mt-0.5">{answers.scene1.consequence}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Scene 2 Decision */}
                {answers.scene2 && (
                    <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/80 shadow-sm">
                        <h4 className="text-teal-600 font-bold mb-3 flex items-center gap-2 text-sm">
                            🎬 Scene 2 - Choice
                        </h4>
                        <div className="text-slate-700 text-sm space-y-2">
                            {(answers.scene2.selectedOption || answers.scene2.decision_id) && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Choice Made:</p>
                                    <p className="text-slate-800 font-bold mt-0.5">{answers.scene2.selectedOption || answers.scene2.decision_id}</p>
                                </div>
                            )}
                            {(answers.scene2.justification || answers.scene2.reasoning) && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Reasoning:</p>
                                    <p className="text-slate-850 mt-1 bg-white p-2.5 rounded-lg border border-slate-100 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                                        {answers.scene2.justification || answers.scene2.reasoning}
                                    </p>
                                </div>
                            )}
                            {answers.scene2.formativeFeedback && (
                                <div className="mt-2.5 p-3 rounded-lg border border-cyan-100 bg-cyan-50/50">
                                    <p className="text-cyan-700 text-xs font-bold">Formative Feedback Given:</p>
                                    <p className="text-slate-700 text-xs italic mt-0.5">"{answers.scene2.formativeFeedback}"</p>
                                </div>
                            )}
                            {answers.scene2.consequence && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Result:</p>
                                    <p className="text-slate-800 font-medium mt-0.5">{answers.scene2.consequence}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Scene 3 Decision */}
                {answers.scene3 && (
                    <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/80 shadow-sm">
                        <h4 className="text-teal-600 font-bold mb-3 flex items-center gap-2 text-sm">
                            🎬 Scene 3 - Choice
                        </h4>
                        <div className="text-slate-700 text-sm space-y-2">
                            {(answers.scene3.selectedOption || answers.scene3.decision_id) && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Choice Made:</p>
                                    <p className="text-slate-800 font-bold mt-0.5">{answers.scene3.selectedOption || answers.scene3.decision_id}</p>
                                </div>
                            )}
                            {(answers.scene3.justification || answers.scene3.reasoning) && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Reasoning:</p>
                                    <p className="text-slate-850 mt-1 bg-white p-2.5 rounded-lg border border-slate-100 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                                        {answers.scene3.justification || answers.scene3.reasoning}
                                    </p>
                                </div>
                            )}
                            {answers.scene3.consequence && (
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold">Result:</p>
                                    <p className="text-slate-800 font-medium mt-0.5">{answers.scene3.consequence}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Final Check */}
                {answers.exitTicket && (
                    <div className="border border-emerald-200/80 rounded-xl p-4 bg-emerald-50/40 shadow-sm">
                        <h4 className="text-emerald-700 font-bold mb-3 flex items-center gap-2 text-sm">
                            🎫 Final Check
                        </h4>
                        <div className="text-slate-700 text-sm space-y-3">
                            {/* MCQ Answers */}
                            {answers.exitTicket.mcq_answers && answers.exitTicket.mcq_answers.length > 0 && (
                                <div>
                                    <p className="text-slate-500 text-xs font-bold mb-2">Multiple Choice Answers:</p>
                                    <div className="space-y-1">
                                        {answers.exitTicket.mcq_answers.map((answer, idx) => (
                                            <div key={idx} className="text-xs text-slate-755 ml-2">
                                                Q{idx + 1}: <span className="text-slate-900 font-semibold">{answer}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reflection */}
                            {answers.exitTicket.reflection && (
                                <div>
                                    <p className="text-slate-500 text-xs font-bold">Reflection:</p>
                                    <p className="text-slate-850 mt-1 bg-white p-2.5 rounded-lg border border-slate-100 font-medium leading-relaxed shadow-sm">
                                        {answers.exitTicket.reflection}
                                    </p>
                                </div>
                            )}

                            {/* Transfer Answer */}
                            {answers.exitTicket.transfer_answer && (
                                <div>
                                    <p className="text-slate-500 text-xs font-bold">Transfer Application:</p>
                                    <p className="text-slate-850 mt-1 bg-white p-2.5 rounded-lg border border-slate-100 font-medium leading-relaxed shadow-sm">
                                        {answers.exitTicket.transfer_answer}
                                    </p>
                                </div>
                            )}

                            {/* Score */}
                            {answers.exitTicket.score !== undefined && (
                                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80">
                                    <span className="text-slate-500 font-semibold">Score:</span>
                                    <span className={`text-sm font-extrabold ${answers.exitTicket.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
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
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 p-5 sm:p-6 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Student Answers</h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{studentName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition"
                            >
                                <X className="w-5 h-5 text-slate-500 hover:text-slate-700" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-white">
                            {normalizedAttempts.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-40" />
                                    <p className="font-semibold text-sm">No scenario attempts found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {normalizedAttempts.map((attempt) => (
                                        <motion.div
                                            key={attempt.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50 hover:bg-slate-50/80 transition-colors shadow-sm"
                                        >
                                            {/* Attempt Header */}
                                            <button
                                                onClick={() => setExpandedAttempt(expandedAttempt === attempt.id ? null : attempt.id)}
                                                className="w-full p-4 flex items-center justify-between cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {attempt.score >= 80 ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <p className="text-slate-800 font-bold truncate text-sm">
                                                            {SCENARIOS[attempt.scenario_id]?.title || attempt.scenario_id}
                                                        </p>
                                                        <p className="text-slate-500 text-xs font-semibold mt-0.5">
                                                            {attempt.completed_at
                                                                ? new Date(attempt.completed_at).toLocaleDateString()
                                                                : 'Not completed'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${attempt.score >= 80
                                                        ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                                                        : 'bg-amber-50/80 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {attempt.score}%
                                                    </span>
                                                    <div className="text-slate-400 font-mono text-xs">
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
                                                        className="border-t border-slate-200 px-4 pb-4 bg-white"
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
                        <div className="border-t border-slate-200/80 p-4 flex justify-end bg-slate-50/50">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-sm font-bold transition shadow-sm"
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
