import { useRef, useCallback, useState, useEffect } from "react";

/* Synthetic audio feedback using the Web Audio API — no external libraries.
   All sounds are programmatically synthesized oscillators.
   AudioContext is created lazily on first user gesture to comply with browser policies. */

export function useScenarioAudio({ enabled = true, volume = 1 } = {}) {
  const ctxRef = useRef(null);
  const nodes = useRef(new Set());
  const [muted, setMuted] = useState(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    // Resume suspended context (autoplay policy)
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const shouldPlay = enabled && !muted;
  const stopAll = useCallback(() => {
    for (const node of nodes.current) {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    }
    nodes.current.clear();
  }, []);
  useEffect(() => {
    if (!enabled || muted) stopAll();
  }, [enabled, muted, stopAll]);
  useEffect(
    () => () => {
      stopAll();
      ctxRef.current?.close?.().catch(() => {});
    },
    [stopAll],
  );

  /* ── Primitive: play a single tone ── */
  const tone = useCallback(
    (freq, type, duration, gainPeak, startDelay = 0) => {
      if (!shouldPlay || volume <= 0) return;
      const ctx = getCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        nodes.current.add(osc);
        osc.onended = () => {
          nodes.current.delete(osc);
          osc.disconnect();
          gain.disconnect();
        };
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.value = freq;
        const t = ctx.currentTime + startDelay;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(gainPeak * volume, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration + 0.01);
      } catch {
        /* silently fail if browser blocks audio */
      }
    },
    [shouldPlay, getCtx, volume],
  );

  /* ── Short UI click ── */
  const playClick = useCallback(() => {
    tone(1100, "sine", 0.05, 0.06);
  }, [tone]);

  /* ── System beep (confirmation / data submit) ── */
  const playBeep = useCallback(() => {
    tone(880, "sine", 0.1, 0.055);
  }, [tone]);

  /* ── Phase transition sweep (440 → 880 Hz) ── */
  const playPhaseTransition = useCallback(() => {
    if (!shouldPlay || volume <= 0) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      nodes.current.add(osc);
      osc.onended = () => {
        nodes.current.delete(osc);
        osc.disconnect();
        gain.disconnect();
      };
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(880, t + 0.12);
      gain.gain.setValueAtTime(0.04 * volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.23);
    } catch {}
  }, [shouldPlay, getCtx, volume]);

  /* ── Chamber unlock / success arpeggio (C5 → E5 → G5) ── */
  const playChamberUnlock = useCallback(() => {
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      tone(freq, "sine", 0.22, 0.065, i * 0.11);
    });
  }, [tone]);

  /* ── Warning alarm (descending minor: A4 → Eb4) ── */
  const playWarningAlarm = useCallback(() => {
    [440, 349.23, 311.13].forEach((freq, i) => {
      tone(freq, "sawtooth", 0.25, 0.045, i * 0.15);
    });
  }, [tone]);

  /* ── Low-key system bloop (menu open / panel slide) ── */
  const playBloop = useCallback(() => {
    tone(660, "sine", 0.08, 0.04);
  }, [tone]);

  /* ── Error double-buzz ── */
  const playError = useCallback(() => {
    tone(220, "square", 0.08, 0.04, 0);
    tone(220, "square", 0.08, 0.04, 0.12);
  }, [tone]);

  // Restrained abstract cues; no synthetic kitchen/crowd imitation or external APIs.
  const playCinematicCue = useCallback(
    (cue) => {
      const motifs = {
        atmosphere: [
          [196, 1.4, 0.018],
          [293.66, 1.2, 0.012],
        ],
        preparation: [
          [293.66, 0.25, 0.02],
          [349.23, 0.4, 0.015],
        ],
        incident: [
          [174.61, 0.45, 0.04],
          [164.81, 0.55, 0.025],
        ],
        arrival: [
          [261.63, 0.4, 0.04],
          [392, 0.6, 0.035],
        ],
        investigation: [
          [392, 0.18, 0.03],
          [523.25, 0.28, 0.035],
        ],
        instrument: [[880, 0.12, 0.04]],
        electron: [[659.25, 0.16, 0.035]],
        evidence: [[523.25, 0.18, 0.03]],
        decision: [[220, 0.5, 0.025]],
        supported: [
          [261.63, 0.8, 0.025],
          [329.63, 0.8, 0.022],
          [392, 1, 0.02],
        ],
        uncertain: [
          [196, 0.6, 0.023],
          [233.08, 0.8, 0.019],
        ],
        complete: [
          [523.25, 0.35, 0.04],
          [659.25, 0.4, 0.035],
          [783.99, 0.7, 0.03],
        ],
        tick: [[1000, 0.025, 0.012]],
      };
      (motifs[cue] || []).forEach(([freq, duration, gain], i) =>
        tone(freq, "sine", duration, gain, i * 0.12),
      );
    },
    [tone],
  );

  return {
    playClick,
    playCinematicCue,
    stopAll,
    playBeep,
    playPhaseTransition,
    playChamberUnlock,
    playWarningAlarm,
    playBloop,
    playError,
    muted,
    setMuted,
  };
}
