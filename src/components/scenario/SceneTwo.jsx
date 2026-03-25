import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, Timer, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function SceneTwo({ scene, scenarioTitle, onComplete, isTeacher = false }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [justification, setJustification] = useState('');
    const [showThinkTimer, setShowThinkTimer] = useState(true);
    const [thinkTime, setThinkTime] = useState(30);

    useEffect(() => {
        if (showThinkTimer && thinkTime > 0) {
            const timer = setTimeout(() => setThinkTime(thinkTime - 1), 1000);
            return () => clearTimeout(timer);
        } else if (thinkTime === 0) {
            setShowThinkTimer(false);
        }
    }, [showThinkTimer, thinkTime]);

    const handleSelect = (option) => {
        setSelectedOption(option);
    };

    const handleContinue = () => {
        onComplete({
            selectedOption: selectedOption.id,
            consequence: selectedOption.consequence,
            justification: justification
        });
    };

    // Teachers can skip
    const handleTeacherSkip = () => {
        const defaultOption = scene.options[0];
        onComplete({
            selectedOption: defaultOption.id,
            consequence: defaultOption.consequence,
            justification: 'Teacher preview - skipped'
        });
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm mb-4">
                    <span className="font-semibold">Scene 2</span>
                    <span className="text-amber-400/60">•</span>
                    <span>{scene.title}</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">Time to Decide</h2>
            </div>

            {/* Narrative */}
            <Card className="bg-slate-900/50 border-slate-800 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">New Development</h3>
                        <p className="text-slate-300 leading-relaxed">{scene.narrative}</p>
                    </div>
                </div>
            </Card>

            {/* Think timer */}
            {showThinkTimer && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <Card className="bg-purple-500/10 border-purple-500/30 p-4">
                        <div className="flex items-center justify-center gap-4">
                            <Timer className="w-5 h-5 text-purple-400" />
                            <span className="text-purple-300">Think before you choose:</span>
                            <span className="text-2xl font-bold text-purple-400 font-mono w-12">{thinkTime}s</span>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Question */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-6 text-center">
                    {scene.question}
                </h3>

                {/* Decision cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {scene.options.map((option, index) => (
                        <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(option)}
                            className={`text-left p-6 rounded-xl border transition-all ${selectedOption?.id === option.id
                                    ? 'bg-teal-500/10 border-teal-500/50 ring-2 ring-teal-500/30'
                                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            {/* Icon */}
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-4xl">{option.icon}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOption?.id === option.id
                                        ? 'border-teal-500 bg-teal-500'
                                        : 'border-slate-600'
                                    }`}>
                                    {selectedOption?.id === option.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2 h-2 bg-white rounded-full"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <h4 className="text-lg font-semibold text-white mb-2">{option.text}</h4>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {option.tags.map((tag, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Ethical hint on hover */}
                            <div className="mt-3 pt-3 border-t border-slate-800">
                                <span className={`text-xs ${option.ethical === 'environmental' ? 'text-emerald-400' :
                                        option.ethical === 'economic' ? 'text-amber-400' :
                                            option.ethical === 'safety' ? 'text-blue-400' :
                                                option.ethical === 'scientific' ? 'text-purple-400' :
                                                    'text-slate-500'
                                    }`}>
                                    Focus: {option.ethical}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Justification */}
                {selectedOption && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Card className="bg-slate-900/50 border-slate-800 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-teal-400" />
                                <h4 className="font-semibold text-white">Justify Your Decision</h4>
                            </div>

                            <p className="text-slate-400 text-sm mb-3">{scene.justificationStarter}</p>

                            <Textarea
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Explain your scientific reasoning..."
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px] resize-none"
                            />
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Learning objective */}
            <div className="mb-8 text-center">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 inline-block">
                    <span className="text-slate-500 text-sm">Learning Objective: </span>
                    <span className="text-teal-400 text-sm font-medium">{scene.learningObjective}</span>
                </div>
            </div>

            {/* Continue button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedOption ? 1 : 0.3 }}
                className="text-center"
            >
                <Button
                    onClick={handleContinue}
                    disabled={!selectedOption || (justification.length < 10 && !isTeacher)}
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8 disabled:opacity-50"
                >
                    See Consequences
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {selectedOption && justification.length < 10 && !isTeacher && (
                    <p className="text-slate-500 text-sm mt-2">Please write at least a short justification</p>
                )}

                {/* Teacher skip */}
                {isTeacher && !selectedOption && (
                    <div className="mt-4">
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
        </motion.div>
    );
}