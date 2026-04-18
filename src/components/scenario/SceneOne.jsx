import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, Timer, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ScenarioVisual from './ScenarioVisual';

// Custom typewriter hook for HUD feel
function useTypewriter(text, speed = 30) {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(i));
            i++;
            if (i >= text.length) clearInterval(timer);
        }, speed);
        return () => clearInterval(timer);
    }, [text]);
    return displayedText;
}

export default function SceneOne({ scene, scenarioId, scenarioTitle, onComplete, isTeacher = false, theme = {} }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [justification, setJustification] = useState('');
    const [showThinkTimer, setShowThinkTimer] = useState(true);
    const [thinkTime, setThinkTime] = useState(120);
    const displayedNarrative = useTypewriter(scene.narrative || '');

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';

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
                {/* Left Column */}
                <div className="space-y-6">
                    <Card className={`overflow-hidden border ${border} bg-slate-900/50 backdrop-blur-sm shadow-2xl ${theme.glow}`}>
                        <div className="relative aspect-video">
                            {/* Scenario Visual Component with safe defaults */}
                            <ScenarioVisualEngine 
                                type={scene.type || 'default'} 
                                data={scene.data || {}} 
                            />
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-xl bg-slate-800 border ${border}`}>
                                    <AlertCircle className={`w-6 h-6 ${text}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Current Situation</h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-lg space-y-4">
                                {scene.narrative}
                            </p>
                        </div>
                    </Card>

                    {/* Learning Objective */}
                    <Card className="bg-slate-800/40 border-slate-700 p-8">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Learning Objective</p>
                        <p className="text-slate-300 text-lg leading-relaxed">{scene.learningObjective}</p>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Question */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{scene.question}</h2>
                        <p className={`text-base ${text} font-medium`}>Select the best option below:</p>
                    </div>

                    {/* Think Timer */}
                    {showThinkTimer && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                            <div className="px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <p className="text-amber-200 text-base font-medium">
                                    Critical Thinking Phase: <span className="font-bold text-amber-400">{thinkTime}s</span>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Options List */}
                    <div className="space-y-4">
                        {scene.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                className={`w-full text-left p-5 rounded-xl border transition-all ${selectedOption?.id === option.id 
                                    ? `border-2 ${border} bg-slate-800/50` 
                                    : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/30'
                                }`}
                            >
                                <p className="font-medium text-white text-lg leading-snug">{option.text}</p>
                            </button>
                        ))}
                    </div>

                    {/* Justification */}
                    {selectedOption && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <Card className={`border ${border} bg-slate-900/50 p-8`}>
                                <h4 className="font-bold text-white text-xl mb-4">Scientific Justification</h4>
                                <p className="text-slate-400 text-base mb-4">
                                    {scene.justificationStarter || 'Explain your reasoning:'}
                                </p>
                                <Textarea
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    placeholder="Enter your scientific reasoning..."
                                    className="bg-slate-950/50 border-slate-700 text-white min-h-[120px] text-base"
                                />
                            </Card>

                            <div className={`p-5 rounded-xl border ${selectedOption.correct 
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' 
                                : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                            }`}>
                                <p className="text-base leading-relaxed">{selectedOption.feedback}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-6 space-y-4">
                        <Button
                            onClick={handleContinue}
                            disabled={!selectedOption || (justification.length < 15 && !isTeacher)}
                            size="lg"
                            className={`w-full bg-gradient-to-r ${accent}`}
                        >
                            Confirm Decision
                        </Button>

                        {selectedOption && justification.length < 15 && !isTeacher && (
                            <p className="text-amber-500/80 text-sm text-center">
                                Please provide a more detailed justification (min 15 characters)
                            </p>
                        )}

                        {isTeacher && (
                            <Button
                                variant="outline"
                                onClick={handleTeacherSkip}
                                className="w-full mt-3 border-dashed border-purple-500/50 text-purple-400"
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
