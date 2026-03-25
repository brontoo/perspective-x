import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DataDisplay from '@/components/scenario/DataDisplay';

export default function SceneOne({ scene, scenarioTitle, onComplete, isTeacher = false }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const handleSelect = (option) => {
        setSelectedOption(option);
        setShowFeedback(true);
    };

    const handleContinue = () => {
        onComplete({ selectedOption: selectedOption.id, isCorrect: selectedOption.correct });
    };

    // Teachers can skip without answering
    const handleTeacherSkip = () => {
        onComplete({ selectedOption: 'skipped', isCorrect: true });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6"
        >
            {/* Scene header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm mb-4">
                    <span className="font-semibold">Scene 1</span>
                    <span className="text-blue-400/60">•</span>
                    <span>{scene.title}</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">Understanding the Problem</h2>
            </div>

            {/* Narrative */}
            <Card className="bg-slate-900/50 border-slate-800 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Info className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Situation</h3>
                        <p className="text-slate-300 leading-relaxed">{scene.narrative}</p>
                    </div>
                </div>
            </Card>

            {/* Centralized Data Display */}
            {scene.data && (
                <div className="mb-8 flex justify-center">
                    <DataDisplay data={scene.data} />
                </div>
            )}

            {/* Question */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-6 text-center">
                    {scene.question}
                </h3>

                <div className="grid gap-3">
                    {scene.options.map((option, index) => (
                        <motion.button
                            key={option.id}
                            whileHover={{ scale: showFeedback ? 1 : 1.01 }}
                            whileTap={{ scale: showFeedback ? 1 : 0.99 }}
                            onClick={() => !showFeedback && handleSelect(option)}
                            disabled={showFeedback}
                            className={`w-full text-left p-5 rounded-xl border transition-all ${showFeedback && selectedOption?.id === option.id
                                    ? option.correct
                                        ? 'bg-emerald-500/10 border-emerald-500/50'
                                        : 'bg-red-500/10 border-red-500/50'
                                    : showFeedback && option.correct
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : selectedOption?.id === option.id
                                            ? 'bg-teal-500/10 border-teal-500/50'
                                            : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold ${showFeedback && selectedOption?.id === option.id
                                        ? option.correct ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                        : showFeedback && option.correct
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    {showFeedback && selectedOption?.id === option.id ? (
                                        option.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
                                    ) : option.id}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white">{option.text}</p>
                                    {showFeedback && (selectedOption?.id === option.id || option.correct) && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className={`mt-2 text-sm ${option.correct ? 'text-emerald-400' : 'text-slate-400'}`}
                                        >
                                            {option.feedback}
                                        </motion.p>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Learning objective badge */}
            {showFeedback && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <span className="text-slate-500 text-sm">Learning Objective: </span>
                        <span className="text-teal-400 text-sm font-medium">{scene.learningObjective}</span>
                    </div>
                </motion.div>
            )}

            {/* Continue button */}
            {showFeedback && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <Button
                        onClick={handleContinue}
                        size="lg"
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8"
                    >
                        Continue to Decision
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </motion.div>
            )}

            {/* Teacher skip button */}
            {isTeacher && !showFeedback && (
                <div className="text-center mt-4">
                    <Button
                        onClick={handleTeacherSkip}
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                        Skip (Teacher Preview)
                    </Button>
                </div>
            )}
        </motion.div>
    );
}