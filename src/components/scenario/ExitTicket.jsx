import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, BookOpen, Lightbulb, ShieldCheck
} from 'lucide-react';
import { normalizeExitTicketQuestions } from './scenarioHelpers';

export default function ExitTicket({ exitTicket, scenarioTitle, onComplete, theme = {}, isTeacher = false, missionResult = null, scenarioId = null }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const questions = normalizeExitTicketQuestions(exitTicket, scenarioId);
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

    const handleAnswer = (optionId, isCorrect) => {
        if (selectedOptionId !== null) return; // Prevent double taps during feedback display

        setSelectedOptionId(optionId);

        // Record the answer immediately
        setAnswers((prev) => {
            const next = prev.filter((a) => a.questionId !== currentQuestion);
            next.push({ questionId: currentQuestion, option: optionId, isCorrect });
            return next;
        });

        // Show immediate feedback for 1500ms, then advance
        setTimeout(() => {
            setSelectedOptionId(null);
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion((p) => p + 1);
            } else {
                setShowResults(true);
            }
        }, 1500);
    };

    const handleSubmit = () => {
        onComplete({
            score,
            passed: score >= 80,
            mcq_answers: answers,
            reflection: "", // Kept for data structure compatibility
            transfer_answer: "", // Kept for data structure compatibility
            achievements: score >= 90 ? ['High Achiever'] : [],
        });
    };

    /* ── MCQ question panel ── */
    const renderQuestion = () => {
        const question = questions[currentQuestion];
        if (!question) return null;

        return (
            <motion.div
                key={`question-${currentQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                {/* Header row with step tracker */}
                <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg border border-cyan-100">
                            <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-mono text-slate-500 tracking-wider font-bold">
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                    </div>
                    <div className="flex gap-1.5">
                        {questions.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i < currentQuestion 
                                    ? 'bg-emerald-500' 
                                    : i === currentQuestion 
                                        ? 'bg-cyan-500 scale-125' 
                                        : 'bg-slate-200'
                            }`} />
                        ))}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-cyan-500 h-full rounded-full"
                        initial={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Question Box */}
                <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-xl shadow-sm">
                    <p className="text-xs font-mono text-slate-500 tracking-wider mb-1.5 font-bold">Question Prompts</p>
                    <p className="text-slate-800 text-lg font-bold leading-snug font-sans">{question.prompt}</p>
                </div>

                {/* Clear Spaced Options */}
                <div className="space-y-3.5">
                    {question.options.map((option, idx) => {
                        const isSelected = selectedOptionId === option.id;
                        
                        // Style evaluation for immediate feedback
                        let optionStyle = "border-slate-200 hover:border-cyan-300 bg-white/80 hover:bg-white";
                        let badgeStyle = "bg-slate-100 text-slate-600 border border-slate-200";
                        let iconToShow = String.fromCharCode(65 + idx);

                        if (selectedOptionId !== null) {
                            if (option.correct) {
                                optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.15)]";
                                badgeStyle = "bg-emerald-500 text-white border-emerald-500";
                                iconToShow = "✓";
                            } else if (isSelected) {
                                optionStyle = "border-rose-500 bg-rose-50 text-rose-800 shadow-[0_0_8px_rgba(244,63,94,0.15)]";
                                badgeStyle = "bg-rose-500 text-white border-rose-500";
                                iconToShow = "✗";
                            } else {
                                optionStyle = "opacity-50 border-slate-200 bg-white/40";
                                badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
                            }
                        }

                        return (
                            <motion.button
                                key={option.id}
                                disabled={selectedOptionId !== null}
                                onClick={() => handleAnswer(option.id, option.correct)}
                                aria-pressed={selectedOptionId === option.id}
                                className={`w-full text-left flex items-center gap-3 px-5 py-4 border rounded-xl transition-all duration-300 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 ${optionStyle}`}
                            >
                                <div className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold shrink-0 rounded-lg transition-all duration-300 ${badgeStyle}`}>
                                    {iconToShow === "✓" ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : iconToShow === "✗" ? (
                                        <span className="font-bold text-sm">✗</span>
                                    ) : (
                                        iconToShow
                                    )}
                                </div>
                                <p className="text-sm font-sans font-medium leading-snug">
                                    {option.text}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    /* ── Score panel in simple language ── */
    const renderResults = () => {
        const passed = score >= 80;

        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="space-y-6 text-center py-4"
            >
                {/* Visual score circle */}
                <div className="flex justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.4, delay: 0.15 }}
                        className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-lg ${
                            passed 
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-emerald-500/10' 
                                : 'border-amber-500 bg-amber-50/50 shadow-amber-500/10'
                        }`}
                    >
                        <span className={`text-3xl font-black font-mono leading-none ${passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {score}%
                        </span>
                        <span className="text-xs font-mono text-slate-500 mt-1 font-bold tracking-wider">
                            Score
                        </span>
                    </motion.div>
                </div>

                {/* Score descriptor in simple language */}
                <div className="space-y-2">
                    <h2 className={`text-2xl font-black tracking-wide font-sans ${passed ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {passed ? 'Passed Final Check!' : 'Review & Try Again'}
                    </h2>
                    <p className="text-slate-700 text-base leading-relaxed font-sans font-medium max-w-md mx-auto">
                        {passed 
                            ? `Great job! You answered ${correctAnswers} out of ${questions.length} questions correctly and demonstrated a solid understanding of the concepts.` 
                            : `You answered ${correctAnswers} out of ${questions.length} questions correctly. You need at least 80% to pass this check.`
                        }
                    </p>
                </div>

                {/* CTA Action button */}
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit}
                    className={`w-full py-4 font-bold text-base tracking-wider transition-all duration-300 rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 font-sans ${
                        passed
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                    }`}
                >
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>{passed ? 'Complete Mission' : 'Review and Try Again'}</span>
                </motion.button>
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
        >
            <div className="bg-white/85 border border-slate-200/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">

                {/* Top status bar */}
                <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200/80 px-6 py-3.5">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                        <span className="text-xs font-mono text-cyan-800 tracking-wider font-bold select-none">
                            Final Check
                        </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400 tracking-wider font-bold select-none">
                        Mission Phase 7 of 8
                    </span>
                </div>

                <div className="p-8">

                    {/* Branding */}
                    <div className="text-center mb-6">
                        <h1
                            className="text-2xl font-black text-slate-800 tracking-wider font-sans"
                        >
                            Final Check
                        </h1>
                        <p className="text-sm font-sans font-semibold text-slate-500 mt-1">
                            {showResults 
                                ? "Review your results below" 
                                : "Answer a few quick questions to complete the mission."
                            }
                        </p>
                    </div>

                    {/* Key concept reminder — failure only, before MCQs */}
                    {missionResult && !missionResult.isSuccess && missionResult.impactText && !showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 border border-amber-200/60 bg-amber-50/50 rounded-xl"
                        >
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-mono font-bold text-amber-700 tracking-wider mb-1">
                                        Consider As You Answer
                                    </p>
                                    <p className="text-slate-700 text-xs leading-relaxed font-medium">{missionResult.impactText}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {questions.length === 0 ? (
                        <p className="text-sm text-slate-500 font-mono text-center py-6">No questions configured for this scenario.</p>
                    ) : (
                        <AnimatePresence mode="wait">
                            {!showResults ? renderQuestion() : renderResults()}
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-4 text-center">
                    <p className="text-xs font-mono text-slate-400 font-bold tracking-wider">
                        Perspective X • Scientific Learning Labs
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
