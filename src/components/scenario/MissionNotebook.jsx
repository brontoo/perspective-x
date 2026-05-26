import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ChevronDown, ChevronUp, FileText, Sparkles, 
    CheckCircle2, Target, GraduationCap, Notebook 
} from 'lucide-react';

export default function MissionNotebook({
    scenario,
    responses,
    onSave,
    isOpen,
    onClose,
    currentPhase = 'scene1'
}) {
    // Local state for notebook notes, pre-filled from responses.notebook
    const [localNotes, setLocalNotes] = useState({
        evidenceNotes: responses.notebook?.evidenceNotes || '',
        thinkingNotes: responses.notebook?.thinkingNotes || '',
        choiceNotes: responses.notebook?.choiceNotes || '',
        whatHappenedNotes: responses.notebook?.whatHappenedNotes || '',
        learnedNotes: responses.notebook?.learnedNotes || '',
    });

    // Synchronize local state with responses.notebook if it updates from outside (e.g. reload)
    useEffect(() => {
        if (responses.notebook) {
            setLocalNotes({
                evidenceNotes: responses.notebook.evidenceNotes || '',
                thinkingNotes: responses.notebook.thinkingNotes || '',
                choiceNotes: responses.notebook.choiceNotes || '',
                whatHappenedNotes: responses.notebook.whatHappenedNotes || '',
                learnedNotes: responses.notebook.learnedNotes || '',
            });
        }
    }, [responses.notebook]);

    // Accordion expand/collapse states - expand active phase section by default
    const [expandedSections, setExpandedSections] = useState({
        evidence: currentPhase === 'scene1',
        thinking: currentPhase === 'scene2',
        choice: currentPhase === 'scene2',
        whatHappened: currentPhase === 'consequence',
        learned: currentPhase === 'reflection' || currentPhase === 'exit' || currentPhase === 'complete',
    });

    // Debounced auto-save
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only trigger save if notes have actually changed to prevent redundant updates
            const prev = responses.notebook || {};
            if (
                localNotes.evidenceNotes !== (prev.evidenceNotes || '') ||
                localNotes.thinkingNotes !== (prev.thinkingNotes || '') ||
                localNotes.choiceNotes !== (prev.choiceNotes || '') ||
                localNotes.whatHappenedNotes !== (prev.whatHappenedNotes || '') ||
                localNotes.learnedNotes !== (prev.learnedNotes || '')
            ) {
                onSave(localNotes);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [localNotes, onSave, responses.notebook]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleTextChange = (field, val) => {
        setLocalNotes(prev => ({
            ...prev,
            [field]: val
        }));
    };

    // Auto-fill resolvers
    const scene1OptId = responses.scene1?.selectedOption;
    const scene1Opt = scenario.scenes[0]?.options?.find(o => o.id === scene1OptId);
    const scene1OptText = scene1Opt ? scene1Opt.text : '';
    const scene1Just = responses.scene1?.justification || '';

    const scene2Just = responses.scene2?.justification || '';
    const scene2OptId = responses.scene2?.selectedOption;
    const scene2Opt = scenario.scenes[1]?.options?.find(o => o.id === scene2OptId);
    const scene2OptText = scene2Opt ? scene2Opt.text : '';

    const consequenceKey = responses.scene2?.consequence;
    const consequenceScene = scenario.scenes[2];
    const consequence = consequenceScene?.consequences?.[consequenceKey] || 
                        consequenceScene?.consequences?.[scene2Opt?.consequence];
    const outcomeText = consequence?.outcome || '';
    const explanationText = consequence?.message || '';

    const reflectionText = responses.reflection || '';

    const sections = [
        {
            key: 'evidence',
            title: '1. My Evidence',
            icon: <FileText className="w-4 h-4 text-cyan-600" />,
            notesField: 'evidenceNotes',
            placeholder: 'Write down key measurements, limits, or odd data points here...',
            autoFilled: scene1OptText || scene1Just ? (
                <div className="space-y-2">
                    {scene1OptText && (
                        <div>
                            <span className="text-[9px] font-mono text-cyan-700 font-bold block uppercase tracking-wider">Identified Clue</span>
                            <p className="text-xs text-slate-700 font-medium italic mt-0.5 bg-cyan-50/50 p-2 rounded border border-cyan-100/50">{scene1OptText}</p>
                        </div>
                    )}
                    {scene1Just && (
                        <div>
                            <span className="text-[9px] font-mono text-cyan-700 font-bold block uppercase tracking-wider">Scientific Justification</span>
                            <p className="text-xs text-slate-700 font-medium italic mt-0.5 bg-cyan-50/50 p-2 rounded border border-cyan-100/50">{scene1Just}</p>
                        </div>
                    )}
                </div>
            ) : null
        },
        {
            key: 'thinking',
            title: '2. My Thinking',
            icon: <Sparkles className="w-4 h-4 text-purple-600" />,
            notesField: 'thinkingNotes',
            placeholder: 'Reflect on what the evidence means, possible risks, or ideas...',
            autoFilled: scene2Just ? (
                <div>
                    <span className="text-[9px] font-mono text-purple-700 font-bold block uppercase tracking-wider">Structured Reasoning</span>
                    <div className="text-xs text-slate-700 font-medium italic mt-0.5 bg-purple-50/50 p-2 rounded border border-purple-100/50 whitespace-pre-wrap leading-relaxed">
                        {scene2Just}
                    </div>
                </div>
            ) : null
        },
        {
            key: 'choice',
            title: '3. My Choice',
            icon: <Target className="w-4 h-4 text-emerald-600" />,
            notesField: 'choiceNotes',
            placeholder: 'Record why you chose this action and what trade-offs you balanced...',
            autoFilled: scene2OptText ? (
                <div>
                    <span className="text-[9px] font-mono text-emerald-700 font-bold block uppercase tracking-wider">Action Taken</span>
                    <p className="text-xs text-slate-700 font-medium italic mt-0.5 bg-emerald-50/50 p-2 rounded border border-emerald-100/50">{scene2OptText}</p>
                </div>
            ) : null
        },
        {
            key: 'whatHappened',
            title: '4. What Happened',
            icon: <CheckCircle2 className="w-4 h-4 text-amber-600" />,
            notesField: 'whatHappenedNotes',
            placeholder: 'Write down your analysis of the consequence and scientific explanation...',
            autoFilled: outcomeText || explanationText ? (
                <div className="space-y-2">
                    {outcomeText && (
                        <div>
                            <span className="text-[9px] font-mono text-amber-700 font-bold block uppercase tracking-wider">Consequence Outcome</span>
                            <p className="text-xs text-slate-700 font-medium italic mt-0.5 bg-amber-50/50 p-2 rounded border border-amber-100/50">{outcomeText}</p>
                        </div>
                    )}
                    {explanationText && (
                        <div>
                            <span className="text-[9px] font-mono text-amber-700 font-bold block uppercase tracking-wider">Scientific Explanation</span>
                            <p className="text-xs text-slate-700 font-medium italic mt-0.5 bg-amber-50/50 p-2 rounded border border-amber-100/50">{explanationText}</p>
                        </div>
                    )}
                </div>
            ) : null
        },
        {
            key: 'learned',
            title: '5. What I Learned',
            icon: <GraduationCap className="w-4 h-4 text-indigo-600" />,
            notesField: 'learnedNotes',
            placeholder: 'Summarize the core science concepts learned and what you would do next time...',
            autoFilled: reflectionText ? (
                <div>
                    <span className="text-[9px] font-mono text-indigo-700 font-bold block uppercase tracking-wider">Final Reflection</span>
                    <div className="text-xs text-slate-700 font-medium italic mt-0.5 bg-indigo-50/50 p-2 rounded border border-indigo-100/50 whitespace-pre-wrap leading-relaxed">
                        {reflectionText}
                    </div>
                </div>
            ) : null
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sliding Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200/80 p-5 flex flex-col h-full overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-xl">
                                    <Notebook className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-800 tracking-tight font-sans">Mission Notebook</h2>
                                    <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5">Collect your thinking</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg border border-slate-150 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Collapsible content (scrollable) */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                            {sections.map(({ key, title, icon, notesField, placeholder, autoFilled }) => {
                                const isExpanded = !!expandedSections[key];
                                return (
                                    <div key={key} className="border border-slate-150 rounded-xl bg-white overflow-hidden shadow-sm transition-all duration-300">
                                        {/* Collapsible Header */}
                                        <button
                                            onClick={() => toggleSection(key)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {icon}
                                                <span className="text-sm font-bold text-slate-700 font-sans tracking-tight">{title}</span>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                            )}
                                        </button>

                                        {/* Expandable Body */}
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="overflow-hidden border-t border-slate-100"
                                                >
                                                    <div className="p-4 space-y-3.5 bg-white">
                                                        {/* Auto-filled card if data exists */}
                                                        {autoFilled ? (
                                                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100 shadow-inner">
                                                                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                                    Mission Record
                                                                </div>
                                                                {autoFilled}
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] font-mono text-slate-400 italic bg-slate-50/40 p-2.5 rounded border border-slate-100 text-center font-bold">
                                                                No mission record logged yet. This section auto-fills as you progress.
                                                            </div>
                                                        )}

                                                        {/* Custom Notes Textarea */}
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-mono text-slate-500 font-bold block uppercase tracking-wider">
                                                                My Notes
                                                            </label>
                                                            <textarea
                                                                value={localNotes[notesField]}
                                                                onChange={(e) => handleTextChange(notesField, e.target.value)}
                                                                placeholder={placeholder}
                                                                rows={3}
                                                                className="w-full min-h-[70px] bg-white border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg p-2.5 text-slate-800 text-xs outline-none resize-none font-sans leading-relaxed shadow-sm transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Status */}
                        <div className="border-t border-slate-100 pt-3.5 mt-2 shrink-0 flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                            <span>PERSPECTIVE X SYSTEM</span>
                            <span className="text-cyan-500 animate-pulse">● AUTO-SAVING</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
