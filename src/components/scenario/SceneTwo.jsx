import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, Timer, Sparkles, Activity, Cpu, ShieldAlert } from 'lucide-react';
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

export default function SceneTwo({ scene, scenarioId, scenarioTitle, onComplete, isTeacher = false, theme = {} }) {
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
            className="max-w-4xl mx-auto px-6"
        >
            {/* Scene Header */}
            <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${border} bg-slate-900/50 text-sm mb-4`}>
                    <span className={`font-bold ${text}`}>Scene 2</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{scene.title}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Time to Decide</h2>
            </div>

            {/* Narrative - HUD Style */}
            <div className={`relative overflow-hidden rounded-3xl border ${border} bg-slate-950/80 backdrop-blur-md shadow-2xl mb-8`}>
                {/* Scanning Line */}
                <div className="absolute inset-x-0 h-px bg-teal-500/10 animate-scan pointer-events-none" />
                
                <div className="p-8 relative">
                    {/* HUD Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-500/30 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-500/30 rounded-tr-lg" />

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-slate-900 border ${border}`}>
                                <Cpu className={`w-5 h-5 ${text} animate-pulse`} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Update Transmission</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[10px] font-mono text-slate-500">RECEIVING UPDATE...</span>
                                </div>
                            </div>
                        </div>
                        <Activity className="w-6 h-6 text-teal-500/50" />
                    </div>

                    {/* Integrated Visual */}
                    <div className="mb-6 h-48 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                        <ScenarioVisual 
                            scenarioId={scenarioId} 
                            sceneIndex={1} 
                            avatar={scene.avatar}
                        />
                    </div>

                    <div className="min-h-[80px]">
                        <p className="text-slate-300 leading-relaxed text-lg font-medium font-serif italic">
                            {displayedNarrative}
                            <span className="inline-block w-2 h-5 bg-teal-500 ml-1 animate-pulse" />
                        </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex gap-6 mt-6 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[7px] text-slate-500 uppercase">Timestamp</span>
                            <span className="text-[10px] font-mono text-slate-400">T+{Math.floor(Date.now()/1000000)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[7px] text-slate-500 uppercase">Impact Level</span>
                            <span className="text-[10px] font-mono text-blue-400">MODERATE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Think Timer */}
            {showThinkTimer && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
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
                <h3 className="text-xl font-semibold text-white mb-6 text-center">{scene.question}</h3>

                {/* Decision Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {scene.options.map((option) => {
                        const isSelected = selectedOption?.id === option.id;
                        return (
                            <motion.button
                                key={option.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(option)}
                                className={`text-left p-6 rounded-xl border-2 transition-all ${isSelected
                                        ? `bg-slate-800/80 ${border} ring-2 ring-offset-0`
                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                                    }`}
                                style={isSelected ? { boxShadow: 'none' } : {}}
                            >
                                {/* Option label + Radio */}
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${isSelected ? `${border} ${text} bg-slate-800/70` : 'border-slate-700 text-slate-400 bg-slate-900/60'}`}>
                                        Option {option.id}
                                    </span>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                            ? `bg-gradient-to-br ${accent} border-transparent`
                                            : 'border-slate-600'
                                        }`}>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 bg-white rounded-full"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h4 className="text-lg font-semibold text-white mb-2">{option.text}</h4>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {option.tags.map((tag, i) => (
                                        <span key={i} className={`text-xs px-2 py-1 rounded-full border ${isSelected ? `${border} ${text} bg-slate-800/50` : 'bg-slate-800 text-slate-400 border-transparent'
                                            }`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Ethical Focus */}
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
                        );
                    })}
                </div>

                {/* Justification */}
                {selectedOption && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Card className={`bg-slate-900/50 border ${border} p-6`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className={`w-5 h-5 ${text}`} />
                                <h4 className="font-semibold text-white">Justify Your Decision</h4>
                            </div>
                            <p className="text-slate-400 text-sm mb-3">{scene.justificationStarter}</p>
                            <Textarea
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Explain your scientific reasoning..."
                                className={`bg-slate-800/50 border-slate-700 focus:border-transparent text-white placeholder:text-slate-500 min-h-[100px] resize-none focus:ring-1`}
                            />
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Learning Objective */}
            <div className="mb-8 text-center">
                <div className={`p-4 rounded-xl bg-slate-800/50 border ${border} inline-block`}>
                    <span className="text-slate-500 text-sm">Learning Objective: </span>
                    <span className={`${text} text-sm font-medium`}>{scene.learningObjective}</span>
                </div>
            </div>

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedOption ? 1 : 0.3 }}
                className="text-center"
            >
                <Button
                    onClick={handleContinue}
                    disabled={!selectedOption || (justification.length < 10 && !isTeacher)}
                    size="lg"
                    className={`bg-gradient-to-r ${accent} hover:opacity-90 text-white px-8 disabled:opacity-50`}
                >
                    See Consequences
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {selectedOption && justification.length < 10 && !isTeacher && (
                    <p className="text-slate-500 text-sm mt-2">Please write at least a short justification</p>
                )}

                {isTeacher && !selectedOption && (
                    <div className="mt-4">
                        <Button onClick={handleTeacherSkip} variant="outline"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                            Skip (Teacher Preview)
                        </Button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}