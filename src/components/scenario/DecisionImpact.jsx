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
        className="max-w-3xl mx-auto px-6 relative"
      >
        {/* Background page */}
        <div className="relative rounded-3xl border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-950/80 via-slate-950 to-teal-950/80 overflow-hidden shadow-2xl shadow-emerald-900/40 p-8">
          <GreenLines />
          <SuccessParticles />

          <div className="relative z-10">
            {/* Icon + title */}
            <div className="flex flex-col items-center text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6"
              >
                <Trophy className="w-12 h-12 text-white drop-shadow" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-sm font-semibold mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  Scenario Passed — Excellent Decision
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                  Mission Success! 🎉
                </h2>
                <p className="text-emerald-400 text-lg font-medium">Your choices made a real difference.</p>
              </motion.div>
            </div>

            {/* Impact message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-emerald-900/40 border-emerald-400/40 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-emerald-200 font-semibold text-lg mb-2">What your decision saved:</h3>
                    <p className="text-emerald-100 leading-relaxed text-base">{impactText}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Consequence detail */}
            {consequence && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <Card className="bg-slate-900/60 border-emerald-500/30 p-5 mb-8">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Simulation Outcome
                  </h4>
                  <p className="text-slate-300 leading-relaxed mb-2">{consequence.outcome}</p>
                  {consequence.newData && (
                    <p className="text-emerald-300 text-sm font-medium">{consequence.newData}</p>
                  )}
                </Card>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <Button
                onClick={onContinueToExit}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white px-10 py-6 text-lg font-bold rounded-2xl shadow-xl shadow-emerald-900/40"
              >
                Continue to Exit Ticket
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
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
      className="max-w-3xl mx-auto px-6 relative"
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

      <div className="relative rounded-3xl border-2 border-red-500/60 bg-gradient-to-br from-red-950/80 via-slate-950 to-rose-950/80 overflow-hidden shadow-2xl shadow-red-900/40 p-8">
        <RedLines />
        <FailurePulse />

        <div className="relative z-10">
          {/* Icon + title */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-xl shadow-red-500/40 mb-6"
            >
              <Skull className="w-12 h-12 text-red-100 drop-shadow" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-sm font-semibold mb-3">
                <AlertOctagon className="w-4 h-4" />
                Scenario Failed — Critical Outcome
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                Decision Failed ❌
              </h2>
              <p className="text-red-400 text-lg font-medium">Your choices led to a harmful outcome.</p>
            </motion.div>
          </div>

          {/* Accountability message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-red-950/60 border-red-500/50 p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Skull className="w-5 h-5 text-red-300" />
                </div>
                <div>
                  <h3 className="text-red-200 font-semibold text-lg mb-2">You are responsible for:</h3>
                  <p className="text-red-100 leading-relaxed text-base font-medium">{impactText}</p>
                  <p className="text-red-300 text-sm mt-3 italic">
                    A scientist's decisions have real consequences. Review the evidence and choose again.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Consequence detail */}
          {consequence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <Card className="bg-slate-900/60 border-red-500/30 p-5 mb-8">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  What Happened in the Simulation
                </h4>
                <p className="text-slate-300 leading-relaxed mb-2">{consequence.outcome}</p>
                {consequence.newData && (
                  <p className="text-red-300 text-sm font-medium">{consequence.newData}</p>
                )}
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-red-200 text-sm font-semibold mb-1">Why this is a failure:</p>
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
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={onRetryScene1}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white px-8 py-5 text-base font-bold rounded-2xl shadow-lg shadow-red-900/40"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retry from Scene 1
            </Button>

            <Button
              onClick={onReplayVideo}
              size="lg"
              variant="outline"
              className="border-red-500/50 text-red-300 hover:bg-red-500/10 px-8 py-5 text-base font-semibold rounded-2xl"
            >
              <Video className="w-5 h-5 mr-2" />
              Replay Scenario Video
            </Button>
          </motion.div>

          {/* teacher override */}
          {isTeacher && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-4"
            >
              <Button
                onClick={onContinueToExit}
                variant="ghost"
                className="text-purple-400 hover:bg-purple-500/10 text-sm"
              >
                Skip to Exit Ticket (Teacher)
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
