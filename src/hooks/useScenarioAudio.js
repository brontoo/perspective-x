import { useRef, useCallback, useState } from 'react';

/* Synthetic audio feedback using the Web Audio API — no external libraries.
   All sounds are programmatically synthesized oscillators.
   AudioContext is created lazily on first user gesture to comply with browser policies. */

export function useScenarioAudio({ enabled = true } = {}) {
    const ctxRef = useRef(null);
    const [muted, setMuted] = useState(false);

    const getCtx = useCallback(() => {
        if (!ctxRef.current) {
            try {
                ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch {
                return null;
            }
        }
        // Resume suspended context (autoplay policy)
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume().catch(() => {});
        }
        return ctxRef.current;
    }, []);

    const shouldPlay = enabled && !muted;

    /* ── Primitive: play a single tone ── */
    const tone = useCallback((freq, type, duration, gainPeak, startDelay = 0) => {
        if (!shouldPlay) return;
        const ctx = getCtx();
        if (!ctx) return;
        try {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.value = freq;
            const t = ctx.currentTime + startDelay;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(gainPeak, t + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
            osc.start(t);
            osc.stop(t + duration + 0.01);
        } catch { /* silently fail if browser blocks audio */ }
    }, [shouldPlay, getCtx]);

    /* ── Short UI click ── */
    const playClick = useCallback(() => {
        tone(1100, 'sine', 0.05, 0.06);
    }, [tone]);

    /* ── System beep (confirmation / data submit) ── */
    const playBeep = useCallback(() => {
        tone(880, 'sine', 0.1, 0.055);
    }, [tone]);

    /* ── Phase transition sweep (440 → 880 Hz) ── */
    const playPhaseTransition = useCallback(() => {
        if (!shouldPlay) return;
        const ctx = getCtx();
        if (!ctx) return;
        try {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            const t = ctx.currentTime;
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.linearRampToValueAtTime(880, t + 0.12);
            gain.gain.setValueAtTime(0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t);
            osc.stop(t + 0.23);
        } catch {}
    }, [shouldPlay, getCtx]);

    /* ── Chamber unlock / success arpeggio (C5 → E5 → G5) ── */
    const playChamberUnlock = useCallback(() => {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            tone(freq, 'sine', 0.22, 0.065, i * 0.11);
        });
    }, [tone]);

    /* ── Warning alarm (descending minor: A4 → Eb4) ── */
    const playWarningAlarm = useCallback(() => {
        [440, 349.23, 311.13].forEach((freq, i) => {
            tone(freq, 'sawtooth', 0.25, 0.045, i * 0.15);
        });
    }, [tone]);

    /* ── Low-key system bloop (menu open / panel slide) ── */
    const playBloop = useCallback(() => {
        tone(660, 'sine', 0.08, 0.04);
    }, [tone]);

    /* ── Error double-buzz ── */
    const playError = useCallback(() => {
        tone(220, 'square', 0.08, 0.04, 0);
        tone(220, 'square', 0.08, 0.04, 0.12);
    }, [tone]);

    return {
        playClick,
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
