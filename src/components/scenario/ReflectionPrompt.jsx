import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, CheckCircle, ChevronRight } from 'lucide-react';

export default function ReflectionPrompt({ scenario, onComplete, isTeacher, theme }) {
    // State for the three guided prompts pre-populated with sentence starters
    const [whyChoice, setWhyChoice] = useState('I chose this because ');
    const [evidenceHelp, setEvidenceHelp] = useState('The evidence showed ');
    const [nextTime, setNextTime] = useState('Next time, I would ');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Validation checks to ensure students write something beyond the starter
    const isWhyChoiceValid = whyChoice.trim().length > 23;      // Starter "I chose this because " is 22 chars
    const isEvidenceHelpValid = evidenceHelp.trim().length > 21; // Starter "The evidence showed " is 20 chars
    const isNextTimeValid = nextTime.trim().length > 21;        // Starter "Next time, I would " is 19 chars

    const canSubmit = isTeacher || (isWhyChoiceValid && isEvidenceHelpValid && isNextTimeValid);

    const handleSubmit = () => {
        if (!canSubmit) return;
        setIsSubmitted(true);
        
        // Combine the guided responses into a formatted string to preserve saving compatibility
        const combinedReflection = `Why I made this choice:\n${whyChoice}\n\nWhat evidence helped:\n${evidenceHelp}\n\nWhat I would do differently next time:\n${nextTime}`;
        onComplete(combinedReflection);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            {/* Header / Banner */}
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                <span className="text-xs font-mono text-[#f59e0b] tracking-widest uppercase select-none font-bold">
                    Reflection
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#f59e0b]/40 to-transparent" />
            </div>

            <div className="bg-white/80 border border-slate-200/80 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl">
                {/* Visual Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Edit3 className="w-5 h-5 text-[#f59e0b]" />
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide font-sans">
                            Reflect on Your Decision
                        </h2>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">
                        Mission Review
                    </span>
                </div>

                <div className="p-8 space-y-6">
                    {/* Intro Note */}
                    <div className="bg-amber-50/50 border border-amber-200/50 p-5 rounded-xl text-slate-700 text-sm leading-relaxed font-medium">
                        Great work completing the intervention! Now, take a brief moment to reflect on your choices and how the scientific evidence guided your decisions.
                    </div>

                    {/* Guided Reflection Prompts */}
                    <div className="space-y-5">
                        
                        {/* Prompt 1 */}
                        <div className="space-y-2 bg-white/60 p-5 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:border-amber-200/50">
                            <label className="text-sm font-bold text-slate-700 block font-sans">
                                1. Why did you make this choice?
                            </label>
                            <textarea
                                value={whyChoice}
                                onChange={(e) => setWhyChoice(e.target.value)}
                                disabled={isSubmitted}
                                className="w-full min-h-[70px] bg-white border border-slate-200 hover:border-slate-300 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] rounded-lg p-3 text-slate-800 text-sm outline-none transition-colors resize-none font-sans leading-relaxed shadow-inner"
                            />
                            <div className="flex justify-end">
                                {isWhyChoiceValid ? (
                                    <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Ready
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-mono text-slate-400">
                                        Please complete the sentence starter
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Prompt 2 */}
                        <div className="space-y-2 bg-white/60 p-5 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:border-amber-200/50">
                            <label className="text-sm font-bold text-slate-700 block font-sans">
                                2. What evidence helped you?
                            </label>
                            <textarea
                                value={evidenceHelp}
                                onChange={(e) => setEvidenceHelp(e.target.value)}
                                disabled={isSubmitted}
                                className="w-full min-h-[70px] bg-white border border-slate-200 hover:border-slate-300 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] rounded-lg p-3 text-slate-800 text-sm outline-none transition-colors resize-none font-sans leading-relaxed shadow-inner"
                            />
                            <div className="flex justify-end">
                                {isEvidenceHelpValid ? (
                                    <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Ready
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-mono text-slate-400">
                                        Please complete the sentence starter
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Prompt 3 */}
                        <div className="space-y-2 bg-white/60 p-5 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:border-amber-200/50">
                            <label className="text-sm font-bold text-slate-700 block font-sans">
                                3. What would you do differently next time?
                            </label>
                            <textarea
                                value={nextTime}
                                onChange={(e) => setNextTime(e.target.value)}
                                disabled={isSubmitted}
                                className="w-full min-h-[70px] bg-white border border-slate-200 hover:border-slate-300 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] rounded-lg p-3 text-slate-800 text-sm outline-none transition-colors resize-none font-sans leading-relaxed shadow-inner"
                            />
                            <div className="flex justify-end">
                                {isNextTimeValid ? (
                                    <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Ready
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-mono text-slate-400">
                                        Please complete the sentence starter
                                    </span>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="pt-5 border-t border-slate-200/60 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitted}
                            className={`px-8 py-3.5 rounded-lg font-bold uppercase tracking-widest transition-colors flex items-center gap-2 font-sans text-sm shadow-lg ${
                                canSubmit && !isSubmitted
                                    ? 'bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-[#f59e0b]/20 cursor-pointer'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                            }`}
                        >
                            <span>Go to Final Check</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
