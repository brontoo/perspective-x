import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Award, RefreshCw, ArrowLeft, Notebook, ChevronDown, ChevronUp, 
    FileText, Sparkles, CheckCircle2, Target, GraduationCap 
} from 'lucide-react';

export default function ScenarioComplete({
    scenario,
    responses,
    role,
    onShowCertificate,
    onRetry,
    attemptCount = 1,
    theme = {},
}) {
    const passed = responses.exitTicket?.passed ?? responses.passed;
    const exitScore = Math.round(Number(responses.exitTicket?.score) || 0);

    const feedbackSentence = passed
        ? "Congratulations! You have successfully completed the mission and demonstrated great scientific critical thinking."
        : "You completed the mission check. Try again to improve your score and secure your certificate of mastery!";

    const [notebookExpanded, setNotebookExpanded] = useState(false);

    const notebookData = responses.notebook || {};
    const hasNotes = !!(notebookData.evidenceNotes || notebookData.thinkingNotes || notebookData.choiceNotes || notebookData.whatHappenedNotes || notebookData.learnedNotes);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto"
        >
            <div className="bg-white/80 border border-slate-200/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl p-8 space-y-8">
                
                {/* 1. Title */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 border border-cyan-100 rounded-full text-[10px] font-mono font-bold text-cyan-700 tracking-wider uppercase select-none">
                        Mission Status
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-wider font-sans">
                        Mission Complete
                    </h1>
                </div>

                {/* 2. Content Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6 shadow-inner">
                    {/* Mission Name */}
                    <div className="flex justify-between items-center pb-3.5 border-b border-slate-200/60">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">Mission</span>
                        <span className="text-base font-bold text-slate-800 font-sans text-right">{scenario.title}</span>
                    </div>

                    {/* Student Score */}
                    <div className="flex justify-between items-center pb-3.5 border-b border-slate-200/60">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">Your Score</span>
                        <span className={`text-lg font-black font-mono ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {exitScore}%
                        </span>
                    </div>

                    {/* Badge Earned */}
                    <div className="flex justify-between items-center pb-3.5 border-b border-slate-200/60">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">Badge Earned</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl select-none">{scenario.badgeIcon}</span>
                            <span className="text-sm font-bold text-slate-800 font-sans">{scenario.badge}</span>
                        </div>
                    </div>

                    {/* Positive Feedback Sentence */}
                    <div className={`p-4 rounded-xl text-center text-sm font-medium leading-relaxed font-sans border ${
                        passed 
                            ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-800' 
                            : 'bg-amber-50/50 border-amber-200/60 text-amber-800'
                    }`}>
                        {feedbackSentence}
                    </div>
                </div>

                {/* 2.5 Collapsible Mission Notebook Summary */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
                    <button
                        onClick={() => setNotebookExpanded(!notebookExpanded)}
                        className="w-full flex items-center justify-between p-4 text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <Notebook className="w-5 h-5 text-cyan-600 shrink-0" />
                            <div className="font-sans">
                                <h3 className="text-sm font-bold text-slate-800">My Mission Notebook Summary</h3>
                                <p className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                    {hasNotes ? 'Review your custom notes and milestones' : 'Review your auto-filled milestones'}
                                </p>
                            </div>
                        </div>
                        {notebookExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                    </button>

                    <AnimatePresence>
                        {notebookExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 max-h-[320px] overflow-y-auto"
                            >
                                {/* Section 1: Evidence */}
                                <div className="bg-white border border-slate-150 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-705">
                                        <FileText className="w-4 h-4 text-cyan-600" />
                                        <span>1. My Evidence</span>
                                    </div>
                                    {(scene1OptText || scene1Just) && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5 shadow-inner">
                                            {scene1OptText && (
                                                <div>
                                                    <span className="text-[9px] font-mono text-cyan-700 block uppercase font-bold tracking-wider">Identified Clue</span>
                                                    <p className="text-xs text-slate-650 font-medium italic mt-0.5">{scene1OptText}</p>
                                                </div>
                                            )}
                                            {scene1Just && (
                                                <div>
                                                    <span className="text-[9px] font-mono text-cyan-700 block uppercase font-bold tracking-wider">Scientific Justification</span>
                                                    <p className="text-xs text-slate-650 font-medium italic mt-0.5">{scene1Just}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {notebookData.evidenceNotes && (
                                        <div className="bg-cyan-50/20 border border-cyan-150/30 rounded-lg p-2.5">
                                            <span className="text-[9px] font-mono text-cyan-800 block uppercase font-bold tracking-wider">My Notes</span>
                                            <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">{notebookData.evidenceNotes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Section 2: Thinking */}
                                <div className="bg-white border border-slate-150 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-705">
                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                        <span>2. My Thinking</span>
                                    </div>
                                    {scene2Just && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 shadow-inner">
                                            <span className="text-[9px] font-mono text-purple-700 block uppercase font-bold tracking-wider">Structured Reasoning</span>
                                            <p className="text-xs text-slate-650 font-medium italic mt-0.5 whitespace-pre-wrap leading-relaxed">{scene2Just}</p>
                                        </div>
                                    )}
                                    {notebookData.thinkingNotes && (
                                        <div className="bg-purple-50/20 border border-purple-150/30 rounded-lg p-2.5">
                                            <span className="text-[9px] font-mono text-purple-800 block uppercase font-bold tracking-wider">My Notes</span>
                                            <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">{notebookData.thinkingNotes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Section 3: Choice */}
                                <div className="bg-white border border-slate-150 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-705">
                                        <Target className="w-4 h-4 text-emerald-600" />
                                        <span>3. My Choice</span>
                                    </div>
                                    {scene2OptText && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 shadow-inner">
                                            <span className="text-[9px] font-mono text-emerald-700 block uppercase font-bold tracking-wider">Action Taken</span>
                                            <p className="text-xs text-slate-650 font-medium italic mt-0.5">{scene2OptText}</p>
                                        </div>
                                    )}
                                    {notebookData.choiceNotes && (
                                        <div className="bg-emerald-50/20 border border-emerald-150/30 rounded-lg p-2.5">
                                            <span className="text-[9px] font-mono text-emerald-800 block uppercase font-bold tracking-wider">My Notes</span>
                                            <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">{notebookData.choiceNotes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Section 4: What Happened */}
                                <div className="bg-white border border-slate-150 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-705">
                                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                        <span>4. What Happened</span>
                                    </div>
                                    {(outcomeText || explanationText) && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5 shadow-inner">
                                            {outcomeText && (
                                                <div>
                                                    <span className="text-[9px] font-mono text-amber-700 block uppercase font-bold tracking-wider">Outcome</span>
                                                    <p className="text-xs text-slate-650 font-medium italic mt-0.5">{outcomeText}</p>
                                                </div>
                                            )}
                                            {explanationText && (
                                                <div>
                                                    <span className="text-[9px] font-mono text-amber-700 block uppercase font-bold tracking-wider">Science Explanation</span>
                                                    <p className="text-xs text-slate-650 font-medium italic mt-0.5">{explanationText}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {notebookData.whatHappenedNotes && (
                                        <div className="bg-amber-50/20 border border-amber-150/30 rounded-lg p-2.5">
                                            <span className="text-[9px] font-mono text-amber-800 block uppercase font-bold tracking-wider">My Notes</span>
                                            <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">{notebookData.whatHappenedNotes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Section 5: What I Learned */}
                                <div className="bg-white border border-slate-150 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-705">
                                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                                        <span>5. What I Learned</span>
                                    </div>
                                    {reflectionText && (
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 shadow-inner">
                                            <span className="text-[9px] font-mono text-indigo-700 block uppercase font-bold tracking-wider">Final Reflection</span>
                                            <p className="text-xs text-slate-650 font-medium italic mt-0.5 whitespace-pre-wrap leading-relaxed">{reflectionText}</p>
                                        </div>
                                    )}
                                    {notebookData.learnedNotes && (
                                        <div className="bg-indigo-50/20 border border-indigo-150/30 rounded-lg p-2.5">
                                            <span className="text-[9px] font-mono text-indigo-800 block uppercase font-bold tracking-wider">My Notes</span>
                                            <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">{notebookData.learnedNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Action Buttons */}
                <div className="flex flex-col gap-3.5">
                    {/* View Certificate */}
                    {passed && onShowCertificate && (
                        <button
                            onClick={onShowCertificate}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl uppercase tracking-widest transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 font-sans cursor-pointer"
                        >
                            <Award className="w-5 h-5 shrink-0" />
                            <span>View Certificate</span>
                        </button>
                    )}

                    <div className="grid grid-cols-2 gap-3.5">
                        {/* Try Again */}
                        <button
                            onClick={onRetry}
                            className="py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 font-sans text-xs cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4 shrink-0 text-slate-500" />
                            <span>Try Again</span>
                        </button>

                        {/* Back to Missions */}
                        <Link to={`/role-hub?role=${role?.id || ''}`} className="flex-grow">
                            <button
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center gap-2 font-sans text-xs cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4 shrink-0" />
                                <span>Back to Missions</span>
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
