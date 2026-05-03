import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, BookOpen, Award, BarChart2,
  ClipboardList, Star, AlertTriangle, Lightbulb, ShieldCheck,
} from 'lucide-react';
import { normalizeExitTicketQuestions } from './scenarioHelpers';

/* ── Shared sub-components ────────────────────────────────────────────── */

function HUDCorners({ size = 'w-6 h-6', color = 'border-cyan-400' }) {
    return (
        <>
            <span className={`absolute top-0 left-0 ${size} border-t-2 border-l-2 ${color}`} />
            <span className={`absolute top-0 right-0 ${size} border-t-2 border-r-2 ${color}`} />
            <span className={`absolute bottom-0 left-0 ${size} border-b-2 border-l-2 ${color}`} />
            <span className={`absolute bottom-0 right-0 ${size} border-b-2 border-r-2 ${color}`} />
        </>
    );
}

function BlueprintGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            <svg width="100%" height="100%">
                <defs>
                    <pattern id="et-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#et-grid)" />
            </svg>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ExitTicket({ exitTicket, scenarioTitle, onComplete, theme = {}, isTeacher = false, missionResult = null }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [reflection, setReflection] = useState('');
    const [transferAnswer, setTransferAnswer] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [achievements, setAchievements] = useState([]);

    const questions = normalizeExitTicketQuestions(exitTicket);
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

    useEffect(() => {
        if (showResults) {
            const earned = [];
            if (score >= 90) earned.push('Master Scientist');
            if (score >= 70) earned.push('Competent Researcher');
            if (answers.every((a) => a.isCorrect)) earned.push('Perfect Score');
            if (reflection.length > 200) earned.push('Deep Thinker');
            setAchievements(earned);
        }
    }, [showResults, answers, reflection, score]);

    const handleAnswer = (option, isCorrect) => {
        setAnswers((prev) => {
            const next = prev.filter((a) => a.questionId !== currentQuestion);
            next.push({ questionId: currentQuestion, option, isCorrect });
            return next;
        });
        if (currentQuestion < questions.length - 1) {
            setTimeout(() => setCurrentQuestion((p) => p + 1), 300);
        } else {
            setTimeout(() => setShowResults(true), 300);
        }
    };

    const handleSubmit = () => {
        const hasReflection = reflection.trim().length >= 10 || isTeacher;
        const hasTransfer = !exitTicket?.transferQuestion || transferAnswer.trim().length >= 10 || isTeacher;
        onComplete({
            score,
            passed: score >= 70 && hasReflection && hasTransfer,
            mcq_answers: answers,
            reflection,
            transfer_answer: transferAnswer,
            achievements,
        });
    };

    /* ── Adaptive header config ── */
    const headerConfig = missionResult === null
        ? { icon: ClipboardList, title: 'Final System Verification', sub: null, color: 'text-[var(--lx-accent)]', bg: null }
        : missionResult.isSuccess
            ? { icon: CheckCircle2, title: 'Consolidate Your Understanding', sub: 'Your decision showed good scientific reasoning — now test your knowledge.', color: 'text-[var(--lx-success)]', bg: 'border-[var(--lx-success)]/30 bg-[var(--lx-success-soft)]' }
            : { icon: AlertTriangle, title: 'Review Before You Retry', sub: 'Your decision had unintended consequences. The questions below will help you understand why.', color: 'text-[var(--lx-warning)]', bg: 'border-[var(--lx-warning)]/30 bg-[var(--lx-warning-soft)]' };

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
                className="space-y-5"
            >
                {/* Header row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)]" style={{ borderRadius: '3px' }}>
                            <BookOpen className="w-3.5 h-3.5 text-[var(--lx-accent)]" />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                            VERIFICATION_CHECKPOINT :: {currentQuestion + 1}/{questions.length}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {questions.map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${
                                i < currentQuestion ? 'bg-[var(--lx-success)]' : i === currentQuestion ? 'bg-[var(--lx-accent)]' : 'bg-[var(--lx-dark-glass-border)]'
                            }`} />
                        ))}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="glass-progress h-0.5" style={{ borderRadius: '1px' }}>
                    <motion.div
                        className="glass-progress-bar h-full"
                        initial={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Question text */}
                <div className="glass-card px-5 py-4" style={{ borderRadius: '4px' }}>
                    <p className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-2">SYSTEM_QUERY</p>
                    <p className="text-[var(--lx-text)] text-base font-semibold leading-snug">{question.prompt}</p>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                    {question.options.map((option, idx) => {
                        const isSelected = answers.some(
                            (a) => a.questionId === currentQuestion && a.option === option.id
                        );
                        return (
                            <motion.button
                                key={option.id}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.998 }}
                                onClick={() => handleAnswer(option.id, option.correct)}
                                className={`w-full text-left flex items-center gap-3 px-4 py-3 border transition-all ${
                                    isSelected
                                        ? 'glass-card border-[var(--lx-accent)] shadow-[var(--lx-shadow-glow)]'
                                        : 'glass-card border-[var(--lx-glass-border-sub)] hover:border-[var(--lx-accent)]/50'
                                }`}
                                style={{ borderRadius: '4px' }}
                            >
                                <div className={`w-7 h-7 flex items-center justify-center text-[11px] font-mono font-bold shrink-0 transition-all ${
                                    isSelected
                                        ? 'bg-[var(--lx-accent)] text-white border border-[var(--lx-accent)]'
                                        : 'bg-[var(--lx-dark-glass)] text-[var(--lx-text-inv)] border border-[var(--lx-dark-glass-border)]'
                                }`} style={{ borderRadius: '3px' }}>
                                    {isSelected
                                        ? <CheckCircle2 className="w-3.5 h-3.5" />
                                        : String.fromCharCode(65 + idx)}
                                </div>
                                <p className={`text-sm leading-snug ${isSelected ? 'text-[var(--lx-text)] font-medium' : 'text-[var(--lx-text-sub)]'}`}>
                                    {option.text}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    /* ── Results + reflection panel ── */
    const renderResults = () => {
        const canSubmit = isTeacher
            || (reflection.trim().length >= 10 && (!exitTicket?.transferQuestion || transferAnswer.trim().length >= 10));

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

                {/* Score banner */}
                <div className="glass-card flex items-center gap-5 px-5 py-4" style={{ borderRadius: '4px' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                        className={`w-16 h-16 flex items-center justify-center border-2 shrink-0 ${
                            score >= 70 ? 'border-[var(--lx-success)] bg-[var(--lx-success-soft)]' : 'border-[var(--lx-warning)] bg-[var(--lx-warning-soft)]'
                        }`}
                        style={{ borderRadius: '4px' }}
                    >
                        <span className={`text-xl font-bold font-mono ${score >= 70 ? 'text-[var(--lx-success)]' : 'text-[var(--lx-warning)]'}`}>
                            {score}%
                        </span>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-1">VERIFICATION_RESULT</p>
                        <p className={`text-sm font-bold ${score >= 70 ? 'text-[var(--lx-success)]' : 'text-[var(--lx-warning)]'}`}>
                            {score >= 70 ? 'SYSTEMS_NOMINAL — Knowledge Confirmed' : 'PARTIAL_VERIFICATION — Review Required'}
                        </p>
                        <p className="text-[11px] text-[var(--lx-text-muted)] mt-0.5 font-mono">
                            {correctAnswers}/{questions.length} CORRECT
                        </p>
                    </div>
                    <div className="hidden md:flex flex-col gap-1.5 w-28 shrink-0">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="w-3 h-3 text-[var(--lx-text-muted)] shrink-0" />
                            <div className="flex-1 h-1.5 bg-[var(--lx-dark-glass-border)] overflow-hidden" style={{ borderRadius: '2px' }}>
                                <motion.div
                                    className={`h-full ${score >= 70 ? 'bg-[var(--lx-success)]' : 'bg-[var(--lx-warning)]'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                />
                            </div>
                        </div>
                        <p className="text-[9px] font-mono text-[var(--lx-text-muted)] text-right">{score}/100_PCT</p>
                    </div>
                </div>

                {/* Achievements */}
                {achievements.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-2"
                    >
                        {achievements.map((a, i) => (
                            <span key={i} className="glass-badge-warning flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1" style={{ borderRadius: '2px' }}>
                                <Star className="w-3 h-3 text-amber-500 shrink-0" />
                                {a}
                                <Award className="w-3 h-3 shrink-0" />
                            </span>
                        ))}
                    </motion.div>
                )}

                {/* Reflection Point 1 */}
                <div className="glass-card" style={{ borderRadius: '4px' }}>
                    <div className="bg-[var(--lx-glass)]/20 border-b border-[var(--lx-glass-border-sub)] px-4 py-3">
                        <p className="text-[10px] font-mono font-bold text-[var(--lx-text-sub)] tracking-widest uppercase">
                            REFLECTION_POINT_1 :: System Anomaly Analysis
                        </p>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-[var(--lx-text-muted)] mb-3 leading-relaxed">
                            {exitTicket?.reflectionPrompt || `Justify your logic: Analyze the primary system anomaly you encountered and explain the scientific principles applied to resolve it. Support your conclusion with evidence from the lab.`}
                        </p>
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            rows={4}
                            placeholder="Enter analysis here..."
                            className="glass-input w-full resize-none font-mono"
                            style={{ borderRadius: '3px' }}
                        />
                        <div className="flex justify-between mt-1.5">
                            <span className="text-[9px] font-mono text-[var(--lx-text-muted)]">{reflection.length}/500_CHARS</span>
                            {reflection.length >= 10 && (
                                <span className="text-[9px] font-mono text-[var(--lx-success)]">◆ INPUT_ACCEPTED</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reflection Point 2 — Transfer Question */}
                {exitTicket?.transferQuestion && (
                    <div className="glass-card" style={{ borderRadius: '4px' }}>
                        <div className="bg-[var(--lx-glass)]/20 border-b border-[var(--lx-glass-border-sub)] px-4 py-3">
                            <p className="text-[10px] font-mono font-bold text-[var(--lx-text-sub)] tracking-widest uppercase">
                                REFLECTION_POINT_2 :: Critical Decision Point Evaluation
                            </p>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-[var(--lx-text-muted)] mb-3 leading-relaxed">{exitTicket.transferQuestion}</p>
                            <textarea
                                value={transferAnswer}
                                onChange={(e) => setTransferAnswer(e.target.value)}
                                rows={4}
                                placeholder="Apply this idea to a new situation..."
                                className="glass-input w-full resize-none font-mono"
                                style={{ borderRadius: '3px' }}
                            />
                            <div className="flex justify-between mt-1.5">
                                <span className="text-[9px] font-mono text-[var(--lx-text-muted)]">{transferAnswer.length}/500_CHARS</span>
                                {transferAnswer.length >= 10 && (
                                    <span className="text-[9px] font-mono text-[var(--lx-success)]">◆ INPUT_ACCEPTED</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit CTA */}
                <motion.button
                    whileHover={canSubmit ? { scale: 1.01 } : {}}
                    whileTap={canSubmit ? { scale: 0.99 } : {}}
                    onClick={canSubmit ? handleSubmit : undefined}
                    disabled={!canSubmit}
                    className={`w-full py-4 font-bold text-base tracking-widest uppercase transition-all relative overflow-hidden group ${
                        canSubmit
                            ? 'liquid-btn-accent cursor-pointer'
                            : 'bg-[var(--lx-glass-border-sub)] text-[var(--lx-text-muted)] cursor-not-allowed'
                    }`}
                    style={{ borderRadius: '4px', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    {canSubmit && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    )}
                    <div className="relative flex items-center justify-center gap-3">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        EXIT AUTHORIZATION
                    </div>
                </motion.button>
            </motion.div>
        );
    };

    /* ── Render ── */
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
        >
            <div className="glass-card relative overflow-hidden" style={{ borderRadius: '8px' }}>
                <BlueprintGrid />
                <HUDCorners />

                {/* Top bar */}
                <div className="flex items-center justify-between bg-[var(--lx-dark-glass)] px-6 py-2.5">
                    <div className="flex items-center gap-2.5">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-cyan-400"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                        />
                        <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase select-none">
                            FINAL_SYSTEM_VERIFICATION_TICKET :: CLEARANCE_REQUIRED
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest select-none">PROTOCOL: EXIT_AUTH</span>
                        <div className="w-10 h-1 bg-cyan-500" style={{ borderRadius: '1px' }} />
                    </div>
                </div>

                <div className="relative z-10 p-8">

                    {/* Branding */}
                    <div className="text-center mb-6">
                        <h1
                            className="text-2xl font-bold text-[var(--lx-text)]"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            Perspective X
                        </h1>
                        <p className="text-[11px] font-mono text-[var(--lx-text-muted)] tracking-widest mt-1">
                            Final System Verification Ticket — {scenarioTitle || 'Scenario'}
                        </p>
                    </div>

                    {/* Mission result banner */}
                    {missionResult !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start gap-3 px-4 py-3 mb-5 border ${headerConfig.bg}`}
                            style={{ borderRadius: '4px' }}
                        >
                            <headerConfig.icon className={`w-4 h-4 shrink-0 mt-0.5 ${headerConfig.color}`} />
                            <div>
                                <p className={`text-[10px] font-mono font-bold tracking-widest uppercase ${headerConfig.color}`}>
                                    {headerConfig.title}
                                </p>
                                {headerConfig.sub && (
                                    <p className="text-xs text-[var(--lx-text-sub)] mt-0.5 leading-relaxed">{headerConfig.sub}</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Key concept reminder — failure only, before MCQs */}
                    {missionResult && !missionResult.isSuccess && missionResult.impactText && !showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 px-4 py-3 border border-[var(--lx-warning)]/30 bg-[var(--lx-warning-soft)]"
                            style={{ borderRadius: '4px' }}
                        >
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-3.5 h-3.5 text-[var(--lx-warning)] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-mono font-bold text-[var(--lx-warning)] uppercase tracking-widest mb-1">
                                        CONSIDER_AS_YOU_ANSWER
                                    </p>
                                    <p className="text-[var(--lx-text)] text-xs leading-relaxed">{missionResult.impactText}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Section divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-[var(--lx-glass-border-sub)]" />
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase px-2 select-none">
                            {showResults ? 'REFLECTION_PROTOCOL' : 'VERIFICATION_SEQUENCE'}
                        </span>
                        <div className="h-px flex-1 bg-[var(--lx-glass-border-sub)]" />
                    </div>

                    {questions.length === 0 && (
                        <p className="text-sm text-[var(--lx-text-muted)] font-mono mb-6">No exit ticket questions are configured for this scenario.</p>
                    )}

                    <AnimatePresence mode="wait">
                        {!showResults && questions.length > 0 ? renderQuestion() : renderResults()}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--lx-glass-border-sub)] bg-[var(--lx-glass)]/20 px-8 py-3 text-center">
                    <p className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider">
                        © 2024 Perspective X. Scientific Learning Labs. All rights reserved.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
