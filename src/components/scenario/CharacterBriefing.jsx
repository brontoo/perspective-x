import React from 'react';
import { motion } from 'framer-motion';

/**
 * Your Role (formerly CharacterBriefing) component displays a concise briefing for the student.
 * It pulls data from the `scenario` object.
 * Expected fields:
 *   scenario.role               – role name (e.g., "Engineer")
 *   scenario.character?.name    – mentor name
 *   scenario.character?.title   – mentor title
 *   scenario.character?.responsibilities – short responsibility sentence
 *   scenario.avatar (optional) – avatar image URL or emoji
 */
export default function CharacterBriefing({ scenario, onNext, isTeacher }) {
  const roleName = scenario.role || 'Your Role';
  const responsibility = scenario.character?.responsibilities || 'Complete your mission using the provided evidence.';
  const mentorName = scenario.character?.name || '';
  const mentorTitle = scenario.character?.title || '';
  const avatar = scenario.character?.avatar || '👩‍🔬';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Profile Card */}
      <div className="glass-card border border-slate-200 bg-white/80 rounded-xl p-6 shadow-md flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-4xl border border-slate-200 shadow-inner">
          {avatar}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">You are: {roleName}</h2>
          {mentorName && (
            <p className="text-sm text-slate-600 mt-1">
              Mentor: {mentorName}{mentorTitle ? `, ${mentorTitle}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card border border-slate-200 bg-white/80 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-cyan-700 uppercase mb-2">Your responsibility</h3>
          <p className="text-sm text-slate-700">{responsibility}</p>
        </div>
        <div className="glass-card border border-slate-200 bg-white/80 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-cyan-700 uppercase mb-2">Your tools</h3>
          <p className="text-sm text-slate-700">Evidence, data, visuals, and science knowledge</p>
        </div>
        <div className="glass-card border border-slate-200 bg-white/80 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-cyan-700 uppercase mb-2">Your goal</h3>
          <p className="text-sm text-slate-700">Make the best choice based on evidence</p>
        </div>
        <div className="glass-card border border-slate-200 bg-white/80 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-cyan-700 uppercase mb-2">Your mentor</h3>
          <p className="text-sm text-slate-700">
            {mentorName ? mentorName : '—'}{mentorTitle ? `, ${mentorTitle}` : ''}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold rounded-lg uppercase tracking-wider transition-colors shadow-md text-sm"
        >
          {isTeacher ? 'Preview Role' : 'Check the Evidence'}
        </button>
      </div>
    </motion.div>
  );
}
