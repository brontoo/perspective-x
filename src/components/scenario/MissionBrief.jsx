import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock3, ClipboardCheck, ShieldAlert, Sparkles, Target, UserRound, CheckCircle2 } from 'lucide-react';

/** The single mission briefing replaces the old Intro -> Recap -> Character sequence.
 * Existing video introductions continue to play BEFORE this component, unchanged.
 */
export default function MissionBrief({ scenario, plan, onStart, difficultyMode = 'on-level' }) {
  const objectives = plan?.objectives || [];
  const modeName = difficultyMode === 'beginner' ? 'Guided' : difficultyMode === 'high-achievers' ? 'Challenge' : 'Standard';

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#34243E] via-[#60334F] to-[#A94C6D] text-white shadow-xl border border-[#E8BDD0]/30">
        <div aria-hidden="true" className="absolute pointer-events-none -right-12 -top-28 w-80 h-80 bg-[#F5A286]/20 blur-3xl rounded-full" />
        <div className="relative grid lg:grid-cols-[1.15fr_.85fr] gap-0">
          <div className="p-6 sm:p-9 lg:p-11 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 tracking-wide"><ShieldAlert size={14} /> INCOMING ASSIGNMENT</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20">{plan?.signal || 'Scientific assignment'}</span>
            </div>
            <div className="space-y-2">
              <p className="uppercase tracking-[.18em] text-xs text-[#FFD6E5] font-bold">Chapter 1 / 5 · You're Needed</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">{scenario.title}</h2>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl">{plan?.situation || scenario.context}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFE2C7]"><ShieldAlert size={15} /> Why it matters</div>
              <p className="text-white/95 text-sm sm:text-base leading-relaxed">{plan?.stakes}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-white/85">
              <span className="inline-flex gap-1.5 items-center"><Clock3 size={15}/> About {scenario.estimatedTime || 15} min</span>
              <span className="inline-flex gap-1.5 items-center"><Sparkles size={15}/> {modeName} support</span>
              <span className="inline-flex gap-1.5 items-center"><ClipboardCheck size={15}/> Your work goes into the Mission Notebook</span>
            </div>
          </div>
          <aside className="bg-[#FFF9F6] text-[#332339] p-6 sm:p-8 lg:p-10 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#ECD9E3]">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E3ED] text-[#8E3A62] flex items-center justify-center shrink-0"><UserRound size={25}/></div>
              <div className="min-w-0">
                <p className="text-[11px] tracking-wider uppercase font-bold text-[#9C6581]">Your role pathway</p>
                <p className="font-extrabold text-base text-[#332339]">{scenario.role}</p>
                {plan?.roleLead && <p className="text-xs text-[#775E6D] mt-1">Role character: {plan.roleLead}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold flex items-center gap-2"><Target size={17} className="text-[#C4557B]" /> Your assignment</h3>
              <p className="text-sm text-[#584A57] leading-relaxed">{plan?.goal || scenario.studentMission}</p>
            </div>
            <div className="space-y-3">
              <p className="text-[11px] uppercase font-bold tracking-widest text-[#9C6581]">Science skills you'll use</p>
              {objectives.map((objective, index) => <div key={index} className="flex items-start gap-2.5"><CheckCircle2 size={16} className="text-[#B64F79] mt-0.5 shrink-0"/><p className="text-sm text-[#504456] leading-snug">{objective}</p></div>)}
            </div>
            <button type="button" onClick={onStart} className="w-full min-h-12 flex items-center justify-center gap-2 bg-[#A83F70] hover:bg-[#872C59] text-white font-bold rounded-xl shadow-lg shadow-[#A83F70]/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A83F70]">
              Accept assignment <ArrowRight size={18}/>
            </button>
            <p className="text-xs text-[#897583] text-center">No countdown. Take the time you need to investigate.</p>
          </aside>
        </div>
      </div>
    </motion.section>
  );
}
