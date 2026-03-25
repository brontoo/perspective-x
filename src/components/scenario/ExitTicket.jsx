import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Ticket, Brain, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function ExitTicket({ exitTicket, scenarioTitle, onComplete, isTeacher = false }) {
    const ticket = exitTicket;
    const [currentSection, setCurrentSection] = useState(0); // 0=mcq1, 1=mcq2, 2=reflection, 3=transfer
    const [mcqAnswers, setMcqAnswers] = useState([]);
    const [reflection, setReflection] = useState('');
    const [transferAnswer, setTransferAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedMcq, setSelectedMcq] = useState(null);

    const handleMcqSelect = (option, mcqIndex) => {
        setSelectedMcq(option);
        setShowFeedback(true);

        setTimeout(() => {
            setMcqAnswers([...mcqAnswers, option.id]);
            setShowFeedback(false);
            setSelectedMcq(null);
            setCurrentSection(currentSection + 1);
        }, 1500);
    };

    const handleReflectionSubmit = () => {
        setCurrentSection(currentSection + 1);
    };

    const handleTransferSubmit = () => {
        // Calculate score
        const correctCount = mcqAnswers.reduce((count, answer, index) => {
            const correctAnswer = ticket.mcqs[index]?.options.find(o => o.correct);
            return answer === correctAnswer?.id ? count + 1 : count;
        }, 0);

        const scorePercentage = Math.round((correctCount / ticket.mcqs.length) * 100);
        const passed = scorePercentage >= 70 || isTeacher;

        onComplete({
            mcq_answers: mcqAnswers,
            reflection,
            transfer_answer: transferAnswer,
            score: scorePercentage,
            passed
        });
    };

    // Teacher quick complete
    const handleTeacherSkip = () => {
        onComplete({
            mcq_answers: ['A', 'B'],
            reflection: 'Teacher preview',
            transfer_answer: 'Teacher preview',
            score: 100,
            passed: true
        });
    };

    const renderMcqSection = (mcqIndex) => {
        const mcq = ticket.mcqs[mcqIndex];

        return (
            <motion.div
                key={`mcq-${mcqIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <div className="mb-6">
                    <span className="text-slate-500 text-sm">Question {mcqIndex + 1} of 2</span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-6">{mcq.question}</h3>

                <div className="grid gap-3">
                    {mcq.options.map((option) => (
                        <motion.button
                            key={option.id}
                            whileHover={{ scale: showFeedback ? 1 : 1.01 }}
                            whileTap={{ scale: showFeedback ? 1 : 0.99 }}
                            onClick={() => !showFeedback && handleMcqSelect(option, mcqIndex)}
                            disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${showFeedback && selectedMcq?.id === option.id
                                    ? option.correct
                                        ? 'bg-emerald-500/10 border-emerald-500/50'
                                        : 'bg-red-500/10 border-red-500/50'
                                    : showFeedback && option.correct
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold ${showFeedback && selectedMcq?.id === option.id
                                        ? option.correct ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    {showFeedback && selectedMcq?.id === option.id ? (
                                        option.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
                                    ) : option.id}
                                </div>
                                <p className="text-white">{option.text}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        );
    };

    const renderReflection = () => (
        <motion.div
            key="reflection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-slate-500 text-sm">Reflection</span>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">{ticket.reflectionPrompt}</h3>
            <p className="text-slate-400 text-sm mb-4">
                You can type or record a voice note (coming soon)
            </p>

            <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your thoughts..."
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[150px] resize-none mb-6"
            />

            <Button
                onClick={handleReflectionSubmit}
                disabled={reflection.length < 10}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
        </motion.div>
    );

    const renderTransfer = () => (
        <motion.div
            key="transfer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center gap-2 mb-6">
                <Repeat className="w-5 h-5 text-teal-400" />
                <span className="text-slate-500 text-sm">Transfer Question</span>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">{ticket.transferQuestion}</h3>

            <Textarea
                value={transferAnswer}
                onChange={(e) => setTransferAnswer(e.target.value)}
                placeholder="Apply what you've learned..."
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[150px] resize-none mb-6"
            />

            <Button
                onClick={handleTransferSubmit}
                disabled={transferAnswer.length < 10}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
            >
                Complete Scenario
                <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto px-6"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-4">
                    <Ticket className="w-4 h-4" />
                    <span className="font-semibold">Exit Ticket</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Demonstrate Your Learning</h2>
                <p className="text-slate-400">Complete this ticket to unlock the next scenario</p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-8">
                {[0, 1, 2, 3].map((step) => (
                    <div
                        key={step}
                        className={`w-3 h-3 rounded-full transition-all ${step < currentSection
                                ? 'bg-emerald-500'
                                : step === currentSection
                                    ? 'bg-teal-500'
                                    : 'bg-slate-700'
                            }`}
                    />
                ))}
            </div>

            {/* Content */}
            <Card className="bg-slate-900/50 border-slate-800 p-8">
                {currentSection === 0 && renderMcqSection(0)}
                {currentSection === 1 && renderMcqSection(1)}
                {currentSection === 2 && renderReflection()}
                {currentSection === 3 && renderTransfer()}
            </Card>

            {/* Pass criteria reminder */}
            <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                    ✓ Pass: 70%+ correct answers + reflection submitted
                </p>

                {/* Teacher skip */}
                {isTeacher && (
                    <Button
                        onClick={handleTeacherSkip}
                        variant="outline"
                        className="mt-4 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                        Skip Exit Ticket (Teacher Preview)
                    </Button>
                )}
            </div>
        </motion.div>
    );
}