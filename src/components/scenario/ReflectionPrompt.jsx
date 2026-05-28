import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, CheckCircle, ChevronRight } from 'lucide-react';

export default function ReflectionPrompt({ scenario, onComplete, isTeacher, theme }) {
    // Dynamic reflection questions (from scenario or default)
    const reflectionQuestions = scenario?.reflection || [
        { id: 'whyChoice', question: 'Why did you make this choice?', starter: 'I chose this because ' },
        { id: 'evidenceHelp', question: 'What evidence helped you?', starter: 'The evidence showed ' },
        { id: 'nextTime', question: 'What would you do differently next time?', starter: 'Next time, I would ' }
    ];

    // State for dynamic prompts pre-populated with sentence starters
    const [answers, setAnswers] = useState(() => {
        const initial = {};
        reflectionQuestions.forEach((q) => {
            initial[q.id] = q.starter || '';
        });
        return initial;
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    // Validation checks to ensure students write something beyond the starter
    const isValid = (qId) => {
        const q = reflectionQuestions.find((x) => x.id === qId);
        if (!q) return false;
        const starter = q.starter || '';
        const answer = answers[qId] || '';
        // Require at least 2 non-whitespace characters beyond the starter
        return answer.trim().length > starter.trim().length + 1;
    };

    const canSubmit = isTeacher || reflectionQuestions.every((q) => isValid(q.id));

    const handleSubmit = () => {
        if (!canSubmit) return;
        setIsSubmitted(true);
        
        // Combine the guided responses into a formatted string to preserve saving compatibility
        const combinedReflection = reflectionQuestions
            .map((q) => `${q.question}\n${answers[q.id]}`)
            .join('\n\n');

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
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span className="text-xs font-mono text-[#f59e0b] tracking-wider select-none font-bold">
                    Reflection
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#f59e0b]/40 to-transparent" />
            </div>

            <div className="bg-white/80 border border-slate-200/80 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl">
                {/* Visual Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Edit3 className="w-5 h-5 text-[#f59e0b]" />
                        <h2 className="text-lg font-black text-slate-800 tracking-wide font-sans">
                            Reflect on Your Decision
                        </h2>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider font-bold">
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
                        {reflectionQuestions.map((q, idx) => {
                            const isQValid = isValid(q.id);
                            return (
                                <div key={q.id} className="space-y-2 bg-white/60 p-5 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:border-amber-200/50">
                                    <label className="text-sm font-bold text-slate-700 block font-sans">
                                        {idx + 1}. {q.question}
                                    </label>
                                    <textarea
                                        value={answers[q.id] || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        disabled={isSubmitted}
                                        className="w-full min-h-[70px] bg-white border border-slate-200 hover:border-slate-300 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] rounded-lg p-3 text-slate-800 text-sm outline-none transition-colors resize-none font-sans leading-relaxed shadow-inner"
                                    />
                                    <div className="flex justify-end">
                                        {isQValid ? (
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
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="pt-5 border-t border-slate-200/60 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitted}
                            className={`px-8 py-3.5 rounded-lg font-bold tracking-wider transition-colors flex items-center gap-2 font-sans text-sm shadow-lg ${
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
