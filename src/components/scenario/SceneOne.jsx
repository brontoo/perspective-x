import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ScenarioVisual from './ScenarioVisual';
import { ScenarioLearningObjective, ScenarioResponseCard, ScenarioStageHeader, ScenarioThinkTimer } from './ScenarioPrimitives';
import useTypewriter from './useTypewriter';

export default function SceneOne({ scene, scenarioId, scenarioTitle: _scenarioTitle, onComplete, isTeacher = false, theme = {} }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [justification, setJustification] = useState('');
    const [showThinkTimer, setShowThinkTimer] = useState(true);
    const [thinkTime, setThinkTime] = useState(120);
    const [stage, setStage] = useState('briefing');
    const displayedNarrative = useTypewriter(scene.narrative || '');

    const accent = theme.accent || 'from-teal-500 to-emerald-500';
    const border = theme.border || 'border-teal-500/30';
    const text = theme.text || 'text-teal-400';
    const sceneDataTable = scene.data?.table || null;
    const sceneDataNotes = [scene.data?.graphDescription, scene.data?.mapNote].filter(Boolean);

    useEffect(() => {
        if (stage !== 'briefing') {
            return undefined;
        }

        // Skip briefing in teacher preview mode
        if (isTeacher) {
            setStage('data');
            return;
        }

        const timer = setTimeout(() => {
            setStage('data');
        }, 5000);

        return () => clearTimeout(timer);
    }, [stage, isTeacher]);

    useEffect(() => {
        if (stage !== 'decision' || !showThinkTimer || thinkTime <= 0) {
            if (thinkTime === 0) {
                setShowThinkTimer(false);
            }
            return undefined;
        }

        const timer = setTimeout(() => setThinkTime((current) => current - 1), 1000);
        return () => clearTimeout(timer);
    }, [stage, showThinkTimer, thinkTime]);

    const handleContinue = () => {
        if (!selectedOption) {
            return;
        }

        onComplete({
            selectedOption: selectedOption.id,
            consequence: selectedOption.consequence,
            justification,
        });
    };

    const handleTeacherSkip = () => {
        const defaultOption = scene.options[0];
        onComplete({
            selectedOption: defaultOption.id,
            consequence: defaultOption.consequence,
            justification: 'Teacher preview - skipped',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto"
        >
            <ScenarioStageHeader
                sceneNumber="Scene 1"
                title={scene.title}
                subtitle="Understand the situation before making your first decision"
                border={border}
                text={text}
                className="mb-8"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className={`overflow-hidden border ${border} bg-slate-900/50 backdrop-blur-sm shadow-2xl ${theme.glow}`}>
                        <div className="relative aspect-video">
                            <ScenarioVisual
                                scenarioId={scenarioId}
                                sceneIndex={0}
                                avatar={scene.avatar}
                                title={scene.title}
                                subtitle={stage === 'data' ? 'Use the evidence below before making your decision.' : null}
                            />
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-xl bg-slate-800 border ${border}`}>
                                    <AlertCircle className={`w-6 h-6 ${text}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Current Situation</h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-lg">{scene.narrative}</p>
                        </div>
                    </Card>

                </div>

                <div className="space-y-6">
                    {stage === 'briefing' && (
                        <Card className={`border ${border} bg-slate-900/50 p-8`}>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Briefing</p>
                            <p className="text-slate-300 leading-relaxed text-lg min-h-[140px]">
                                {displayedNarrative}
                            </p>
                        </Card>
                    )}

                    {stage === 'data' && (
                        <Card className={`border ${border} bg-slate-900/50 p-8`}>
                            <h4 className="font-bold text-white text-xl mb-4">Data Analysis</h4>

                            {sceneDataTable ? (
                                <div className="overflow-hidden rounded-xl border border-slate-700">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-800/70 text-slate-300">
                                            <tr>
                                                {sceneDataTable.headers.map((header) => (
                                                    <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sceneDataTable.rows.map((row, rowIndex) => (
                                                <tr key={`${rowIndex}-${row[0]}`} className="border-t border-slate-800 text-slate-300">
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-slate-400">No structured data table is available for this scene.</p>
                            )}

                            {sceneDataNotes.length > 0 && (
                                <div className="mt-5 space-y-2">
                                    {sceneDataNotes.map((note) => (
                                        <p key={note} className="text-sm text-slate-400">{note}</p>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    {stage === 'decision' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{scene.question}</h2>
                                <p className={`text-base ${text} font-medium`}>Select the best option below:</p>
                            </div>

                                <ScenarioThinkTimer
                                    show={showThinkTimer}
                                    time={thinkTime}
                                    icon={Timer}
                                    label="Critical Thinking Phase"
                                    tone="amber"
                                    className="mb-6"
                                />

                            <div className="space-y-4">
                                {scene.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedOption(option)}
                                        className={`w-full text-left p-5 rounded-xl border transition-all ${selectedOption?.id === option.id
                                            ? `border-2 ${border} bg-slate-800/50`
                                            : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/30'
                                        }`}
                                    >
                                        <p className="font-medium text-white text-lg leading-snug">{option.text}</p>
                                    </button>
                                ))}
                            </div>

                            {selectedOption && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <ScenarioResponseCard
                                        title="Scientific Justification"
                                        prompt={scene.justificationStarter || 'Explain your reasoning:'}
                                        value={justification}
                                        onChange={setJustification}
                                        placeholder="Enter your scientific reasoning..."
                                        border={border}
                                        text={text}
                                        className="p-8"
                                    />

                                    <div className={`p-5 rounded-xl border ${selectedOption.correct
                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                        : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                                    }`}>
                                        <p className="text-base leading-relaxed">{selectedOption.feedback}</p>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}

                    <div className="pt-6 space-y-4">
                        {stage === 'decision' ? (
                            <>
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
                                        className="w-full border-dashed border-purple-500/50 text-purple-400"
                                    >
                                        Skip to Consequences (Teacher Mode)
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Button
                                onClick={() => setStage(stage === 'briefing' ? 'data' : 'decision')}
                                size="lg"
                                className={`w-full bg-gradient-to-r ${accent}`}
                            >
                                Continue
                            </Button>
                        )}

                        <ScenarioLearningObjective value={scene.learningObjective} border={border} text={text} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
