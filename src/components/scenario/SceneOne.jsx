import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, Timer, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ScenarioVisual from './ScenarioVisual';

export default function SceneOne({ scene, scenarioId, scenarioTitle, onComplete, isTeacher = false, theme = {} }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [justification, setJustification] = useState('');
    const [showThinkTimer, setShowThinkTimer] = useState(true);
    const [thinkTime, setThinkTime] = useState(120);

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';
    const glow = theme.glow || 'shadow-teal-500/20';

    useEffect(() => {
        if (showThinkTimer && thinkTime > 0) {
            const timer = setTimeout(() => setThinkTime(thinkTime - 1), 1000);
            return () => clearTimeout(timer);
        } else if (thinkTime === 0) {
            setShowThinkTimer(false);
        }
    }, [showThinkTimer, thinkTime]);

    const handleSelect = (option) => setSelectedOption(option);

    const handleContinue = () => {
        onComplete({
            selectedOption: selectedOption.id,
            consequence: selectedOption.consequence,
            justification: justification
        });
    };

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
            className="max-w-6xl mx-auto"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Visual & Narrative */}
                <div className="space-y-6">
                    <Card className={`overflow-hidden border ${border} bg-slate-900/50 backdrop-blur-sm shadow-2xl ${glow}`}>
                        <div className="relative aspect-video">
                            {/* Scenario Visual Component */}
                            <ScenarioVisual scenarioId={scenarioId} sceneIndex={0} />
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg bg-slate-800 border ${border}`}>
                                    <AlertCircle className={`w-5 h-5 ${text}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Current Situation</h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                {scene.narrative}
                            </p>
                        </div>
                    </Card>

                    {/* Scientific Context / Learning Objective */}
                    <Card className="bg-slate-800/40 border-slate-700 p-4">
                        <div className="flex items-start gap-3">
                            <BookOpen className="w-5 h-5 text-slate-400 mt-1" />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Learning Objective</p>
                                <p className="text-slate-300 text-sm">{scene.learningObjective}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Decisions */}
                <div className="space-y-6">
                    <div className="text-center lg:text-left mb-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${border} bg-slate-900/50 text-sm mb-4`}>
                            <span className={`font-bold ${text}`}>Initial Assessment</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">{scene.question}</h2>
                    </div>

                    {/* Think Timer */}
                    {showThinkTimer && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
                                <span className="text-amber-200 text-sm font-medium">Critical Thinking Phase:</span>
                                <span className="text-xl font-bold text-amber-400 font-mono ml-auto">{thinkTime}s</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {scene.options.map((option) => {
                            const isSelected = selectedOption?.id === option.id;
                            return (
                                <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.01, x: 4 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleSelect(option)}
                                    className={`group text-left p-5 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                            ? `bg-slate-800/80 ${border} shadow-lg ${glow}`
                                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${isSelected ? `bg-gradient-to-br ${accent} border-transparent` : 'bg-slate-800 border-slate-700'
                                            }`}>
                                            {option.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-white mb-1">{option.text}</h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {option.tags?.map((tag, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                ? `bg-gradient-to-br ${accent} border-transparent`
                                                : 'border-slate-700'
                                            }`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Justification Area */}
                    <AnimatePresence>
                        {selectedOption && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <Card className={`bg-slate-900/80 border ${border} p-6 mt-4 shadow-xl`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className={`w-5 h-5 ${text}`} />
                                        <h4 className="font-bold text-white text-sm">Scientific Justification</h4>
                                    </div>
                                    <p className="text-slate-400 text-xs mb-3 italic">
                                        {scene.justificationStarter || 'Why did you choose this option?'}
                                    </p>
                                    <Textarea
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        placeholder="Enter your scientific reasoning..."
                                        className="bg-slate-950/50 border-slate-700 text-white min-h-[100px] focus:ring-1 focus:ring-teal-500"
                                    />
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Button */}
                    <div className="pt-6">
                        <Button
                            onClick={handleContinue}
                            disabled={!selectedOption || (justification.length < 15 && !isTeacher)}
                            size="lg"
                            className={`w-full py-8 text-lg font-bold rounded-2xl bg-gradient-to-r ${accent} shadow-xl hover:opacity-90 disabled:opacity-40 transition-all`}
                        >
                            Confirm Decision
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>

                        {selectedOption && justification.length < 15 && !isTeacher && (
                            <p className="text-amber-500/80 text-xs text-center mt-3 font-medium animate-pulse">
                                Please provide a more detailed justification (min 15 characters)
                            </p>
                        )}

                        {isTeacher && (
                            <Button
                                variant="outline"
                                onClick={handleTeacherSkip}
                                className="w-full mt-4 border-dashed border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                            >
                                Skip to Consequences (Teacher Mode)
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}