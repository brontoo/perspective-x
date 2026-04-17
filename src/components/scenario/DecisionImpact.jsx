import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, RotateCcw, Trophy, Skull, Video,
  CheckCircle2, AlertOctagon, ShieldCheck, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { evaluateScenarioOutcome } from '@/components/scenario/scenarioAnswerKey';

/* ─── floating particle helpers ─────────────────────────────── */
function SuccessParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.2,
    size: 6 + Math.random() * 10,
    color: ['#22c55e', '#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'][
      Math.floor(Math.random() * 6)
    ],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, bottom: '-10px', width: p.size, height: p.size, background: p.color }}
          animate={{ y: [0, -600], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.5, delay: p.delay, repeat: Infinity, repeatDelay: Math.random() * 2 }}
        />
      ))}
    </div>
  );
}

function FailurePulse() {
  return (
    <motion.div
      className="absolute inset-0 rounded-3xl bg-red-500/10 pointer-events-none z-0"
      animate={{ opacity: [0, 0.4, 0] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    />
  );
}

/* ─── audio ──────────────────────────────────────────────────── */
function playSuccessSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.connect(ctx.destination);

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      osc.connect(master);
      master.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.14);
      master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.14 + 0.03);
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.14 + 0.25);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 0.25);
    });
    setTimeout(() => ctx.close(), 2500);
  } catch (_) { /* silent */ }
}

function playFailureSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.connect(ctx.destination);

    for (let i = 0; i < 3; i++) {
      const s = ctx.currentTime + i * 0.55;
      const m = s + 0.24;
      const e = s + 0.48;

      const a = ctx.createOscillator();
      const b = ctx.createOscillator();
      a.type = 'sawtooth'; b.type = 'square';
      a.frequency.setValueAtTime(920, s);
      a.frequency.linearRampToValueAtTime(680, m);
      b.frequency.setValueAtTime(760, m);
      b.frequency.linearRampToValueAtTime(560, e);
      a.connect(master); b.connect(master);
      master.gain.setValueAtTime(0.0001, s);
      master.gain.linearRampToValueAtTime(0.22, s + 0.03);
      master.gain.linearRampToValueAtTime(0.2, m);
      master.gain.linearRampToValueAtTime(0.0001, e);
      a.start(s); a.stop(m);
      b.start(m); b.stop(e);
    }
    setTimeout(() => ctx.close(), 3000);
  } catch (_) { /* silent */ }
}

/* ─── animated line decorations ─────────────────────────────── */
function GreenLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {[10, 28, 46, 64, 82].map((top, i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
          style={{ top: `${top}%`, left: 0, right: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2], scaleX: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function RedLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {[10, 28, 46, 64, 82].map((top, i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
          style={{ top: `${top}%`, left: 0, right: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3], scaleX: [0.5, 1, 0.5] }}
          transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */
export default function DecisionImpact({
  consequence,
  scenarioId,
  onContinueToExit,
  onRetryScene1,
  onReplayVideo,
  isTeacher = false,
  theme = {},
}) {
  const { isSuccess, impactText } = evaluateScenarioOutcome(
    scenarioId,
    consequence?.key || '',
  );

  const accent = theme.accent || 'from-teal-500 to-emerald-500';

  const [alarmFlash, setAlarmFlash] = useState(false);

  /* play audio once on mount */
  useEffect(() => {
    if (isSuccess) {
      playSuccessSound();
    } else {
      playFailureSound();
      /* flashing red border effect */
      const timers = [];
      [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800].forEach((ms, idx) => {
        timers.push(setTimeout(() => setAlarmFlash(idx % 2 === 0), ms));
      });
      timers.push(setTimeout(() => setAlarmFlash(false), 2100));
      return () => timers.forEach(clearTimeout);
    }
  }, [isSuccess]);

  /* ── SUCCESS PAGE ────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto px-4 relative h-full flex items-center justify-center p-2 sm:p-6"
      >
        {/* Background page */}
        <div className="relative rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-950/90 via-slate-950 to-teal-950/90 overflow-hidden shadow-2xl shadow-emerald-900/40 p-6 lg:p-10 w-full">
          <GreenLines />
          <SuccessParticles />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* LEFT COLUMN: STATUS & ICON */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
              >
                <Trophy className="w-10 h-10 lg:w-16 lg:h-16 text-white drop-shadow" />
              </motion.div>

              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Mission Accomplished
                </motion.div>
                <h2 className="text-3xl lg:text-5xl font-black text-white mb-2 leading-none tracking-tight">
                  Success! 🎉
                </h2>
                <p className="text-emerald-400 text-base lg:text-lg font-medium max-w-md">
                  Your expert choices protected the project and the community.
                </p>
              </div>

              {/* Impact summary card */}
              <Card className="bg-emerald-400/5 border-emerald-400/20 p-5 w-full backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-emerald-200 font-bold text-sm uppercase tracking-widest mb-1">Impact Analysis:</h3>
                    <p className="text-emerald-50/90 leading-snug text-sm lg:text-base font-medium">
                      {impactText}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: OUTCOME & CTA */}
            <div className="flex flex-col gap-6">
              {consequence && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="bg-slate-900/60 border-emerald-500/20 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                       Simulation Data Stream
                    </h4>
                    <p className="text-slate-200 leading-relaxed mb-4 text-sm lg:text-base">
                      {consequence.outcome}
                    </p>
                    {consequence.newData && (
                      <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                        <p className="text-emerald-300 text-sm font-mono">{consequence.newData}</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-2"
              >
                <Button
                  onClick={onContinueToExit}
                  size="lg"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white h-16 text-xl font-bold rounded-2xl shadow-lg shadow-emerald-500/20 group"
                >
                  Continue to Certificate
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-center text-slate-500 text-[10px] mt-4 uppercase tracking-[0.2em]">
                  End of Scenario Protocol • Authorized Personnel Only
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── FAILURE PAGE ────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 relative h-full flex items-center justify-center p-2 sm:p-6"
    >
      <AnimatePresence>
        {alarmFlash && (
          <motion.div
            key="alarm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-3xl border-4 border-red-500 bg-red-500/15 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      <div className="relative rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/90 via-slate-950 to-rose-950/90 overflow-hidden shadow-2xl shadow-red-900/50 p-6 lg:p-10 w-full">
        <RedLines />
        <FailurePulse />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: STATUS & ICON */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
              className="w-20 h-20 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-xl shadow-red-500/40"
            >
              <Skull className="w-10 h-10 lg:w-16 lg:h-16 text-red-100 drop-shadow" />
            </motion.div>

            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold uppercase tracking-wider mb-4"
              >
                <AlertOctagon className="w-3 h-3" />
                Critical Error Detected
              </motion.div>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-2 leading-none tracking-tight">
                Decision Failed ❌
              </h2>
              <p className="text-red-400 text-base lg:text-lg font-medium max-w-md">
                Your choice led to negative consequences. Analyze the data and try again.
              </p>
            </div>

            {/* Responsibility Card */}
            <Card className="bg-red-400/5 border-red-400/20 p-5 w-full backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <AlertOctagon className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <h3 className="text-red-200 font-bold text-sm uppercase tracking-widest mb-1">Accountability Log:</h3>
                  <p className="text-red-50/90 leading-snug text-sm lg:text-base font-medium italic">
                    "{impactText}"
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: OUTCOME & ACTIONS */}
          <div className="flex flex-col gap-6">
            {consequence && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-slate-900/60 border-red-500/20 p-6 relative overflow-hidden">
                  <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Post-Incident Report
                  </h4>
                  <p className="text-slate-200 leading-relaxed mb-4 text-sm lg:text-base">
                    {consequence.outcome}
                  </p>
                  
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-1">Expert Evaluation:</p>
                    <p className="text-red-100 text-sm leading-relaxed">
                      {consequence.message}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={onRetryScene1}
                size="lg"
                className="flex-1 bg-red-600 hover:bg-red-500 text-white h-14 text-base font-bold rounded-xl shadow-lg shadow-red-900/40"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Retry Investigation
              </Button>

              <Button
                onClick={onReplayVideo}
                size="lg"
                variant="outline"
                className="flex-1 border-red-500/50 text-red-300 hover:bg-red-500/10 h-14 text-base font-bold rounded-xl"
              >
                <Video className="w-5 h-5 mr-2" />
                Re-examine Evidence
              </Button>
            </motion.div>

            {/* teacher override */}
            {isTeacher && (
              <Button
                onClick={onContinueToExit}
                variant="ghost"
                className="text-purple-400 hover:bg-purple-500/10 text-xs uppercase tracking-widest w-fit mx-auto"
              >
                Skip to Exit (Teacher Override)
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
