import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, MessageCircle, RotateCcw } from 'lucide-react';

/** Short, evidence-based debrief inside chapter 4; keeps the legacy reflection string. */
export default function MissionReflection({ plan, onComplete, isTeacher = false, difficultyMode = 'on-level' }) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const minimum = difficultyMode === 'high-achievers' ? 24 : 12;
  const ready = answer.trim().length >= minimum;
  const submit = () => {
    if (submitted || (!ready && !isTeacher)) return;
    setSubmitted(true);
    onComplete(answer.trim() || '[Teacher preview — reflection skipped]');
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto rounded-[26px] bg-[#FFF9F6] border border-[#EDDCE5] shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#472B48] to-[#9E4771] text-white p-6 sm:p-8">
        <p className="text-xs font-bold text-[#FFE0EC] uppercase tracking-widest">Chapter 4 / 5 · See What Happens</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">One last scientific thought</h2>
        <p className="text-sm text-white/90 mt-2">A good scientist explains a decision—and is willing to improve it.</p>
      </div>
      <div className="p-6 sm:p-8 space-y-5">
        <div className="flex items-start gap-3 p-4 bg-[#F9EAF0] border border-[#EBCEDC] rounded-2xl">
          <MessageCircle className="w-5 h-5 mt-0.5 shrink-0 text-[#B14C76]"/>
          <div><p className="font-bold text-[#34243E] text-sm">Professional debrief</p><p className="text-sm text-[#564657] mt-1 leading-relaxed">{plan?.reflectionPrompt || 'Which evidence supported your choice?'}</p></div>
        </div>
        <label htmlFor="scientific-debrief" className="block text-sm font-bold text-[#34243E]">Your explanation <span className="font-normal text-[#8C7480]">(one or two sentences)</span></label>
        <textarea id="scientific-debrief" value={answer} onChange={e => setAnswer(e.target.value)} rows={4} placeholder="The evidence shows… Therefore, my recommendation is…" className="w-full rounded-2xl p-4 border border-[#DFCAD5] bg-white text-[#382B3F] placeholder:text-[#A992A0] focus:outline-none focus:ring-2 focus:ring-[#C4557B] resize-y" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => setShowHint(v => !v)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#96476B] hover:text-[#6B2B4D]"><Lightbulb size={16} /> {showHint ? 'Hide thinking tip' : 'Need a thinking tip?'}</button>
          <span className="text-xs text-[#8C7480]">{answer.trim().length} characters · aim for {minimum}+</span>
        </div>
        {showHint && <p className="text-sm leading-relaxed rounded-xl bg-[#FFF0E9] p-4 border border-[#F3D8CB] text-[#654E50]">Ask yourself: {plan?.outcomeLens || 'What changed after your action?'} Use one result and one scientific reason in your answer.</p>}
        <div className="flex justify-end">
          <button type="button" disabled={submitted || (!ready && !isTeacher)} onClick={submit} className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl bg-[#A83F70] hover:bg-[#872C59] text-white font-bold disabled:bg-[#D9C5D0] disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#A83F70]">Go to final check <ArrowRight size={17}/></button>
        </div>
      </div>
    </motion.section>
  );
}
