import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

/* ── Typewriter hook ─────────────────────────────────────────────────────── */
function useTypewriter(lines, active, delayMs = 360) {
    const [visible, setVisible] = useState([]);
    useEffect(() => {
        if (!active) { setVisible([]); return; }
        setVisible([]);
        const timers = lines.map((_, i) =>
            setTimeout(() => setVisible(prev => [...prev, lines[i]]), i * delayMs)
        );
        return () => timers.forEach(clearTimeout);
     
    }, [active]);
    return visible;
}

/* ── Animated integer counter ───────────────────────────────────────────── */
function useCounter(active, duration = 2200) {
    const [val, setVal] = useState(0);
    const rafRef = useRef(null);
    useEffect(() => {
        if (!active) { setVal(0); return; }
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min(100, Math.round(((now - start) / duration) * 100));
            setVal(p);
            if (p < 100) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [active, duration]);
    return val;
}

/* ── Side bar decorations ───────────────────────────────────────────────── */
function SideBar({ side }) {
    const base = side === 'left'
        ? 'left-4 bg-gradient-to-r from-cyan-400 to-cyan-400/0 origin-left'
        : 'right-4 bg-gradient-to-l from-cyan-400 to-cyan-400/0 origin-right';
    return (
        <div className={`absolute top-0 bottom-0 w-14 flex flex-col justify-center gap-2.5 opacity-35 ${side === 'left' ? 'left-4' : 'right-4'}`}>
            {[...Array(9)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`h-[3px] rounded-full ${base}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                />
            ))}
        </div>
    );
}

/* ── Blueprint grid ─────────────────────────────────────────────────────── */
function BlueprintGrid() {
    return null;
}

/* ── HUD corner brackets ────────────────────────────────────────────────── */
function HUDCorners() {
    return null;
}

/* ── Scan line ──────────────────────────────────────────────────────────── */
function ScanLine() {
    return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   BOOT MESSAGES
   ──────────────────────────────────────────────────────────────────────────── */
const BOOT_MESSAGES = [
    'Initializing Perspective X System...',
    'Loading scenario details...',
    'Connecting to learning modules...',
    'Setting up student dashboard...',
    'Syncing workspace files...',
    'Ready for student access...',
];

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function CinematicTitle({ title, subtitle, character, onComplete }) {
    // 'booting' → 'verifying' → 'granted'
    const [subPhase, setSubPhase] = useState('booting');

    const termLines   = useTypewriter(BOOT_MESSAGES, subPhase === 'booting', 340);
    const loadPct     = useCounter(subPhase === 'booting', 2200);

    /* Phase timeline */
    useEffect(() => {
        const t1 = setTimeout(() => setSubPhase('verifying'), 2600);
        const t2 = setTimeout(() => setSubPhase('granted'),   4000);
        const t3 = setTimeout(() => onComplete?.(),           5000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden lx-bg-ambient flex flex-col">
            <BlueprintGrid />
            <SideBar side="left" />
            <SideBar side="right" />

            {/* ── Top status bar ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 glass-nav flex items-center justify-between px-8 py-3"
            >
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold text-cyan-700 tracking-widest select-none">
                        Perspective X
                    </span>
                    <span className="text-[var(--lx-glass-border-sub)] select-none">|</span>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={subPhase}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.25 }}
                            className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase select-none font-semibold"
                        >
                            {subPhase === 'booting'   && 'Preparing scenario...'}
                            {subPhase === 'verifying' && 'Verifying credentials...'}
                            {subPhase === 'granted'   && 'Welcome! Loading scenario...'}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Animated progress indicators */}
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="w-7 h-1 bg-cyan-500 opacity-60"
                            style={{ borderRadius: '1px' }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* ── Main content ── */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-8">
                <AnimatePresence mode="wait">

                    {/* ════════ STEP 1: BOOTING ════════ */}
                    {subPhase === 'booting' && (
                        <motion.div
                            key="booting"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.35 }}
                            className="w-full max-w-xl"
                        >
                            {/* Light translucent panel */}
                            <div
                                className="relative border border-cyan-500/15 bg-white/70 backdrop-blur-md shadow-lg shadow-cyan-500/5"
                                style={{ borderRadius: '6px' }}
                            >
                                {/* Terminal header */}
                                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                    <span className="text-[10px] font-mono text-cyan-700 tracking-widest flex-1 font-semibold">
                                        Scenario Setup :: Initializing
                                    </span>
                                    <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tabular-nums">
                                        {String(loadPct).padStart(3, '0')}%
                                    </span>
                                </div>

                                {/* Terminal output */}
                                <div className="p-5 min-h-[192px]">
                                    {termLines.map((line, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <span className="text-cyan-600/70 text-[11px] select-none">›</span>
                                            <span className="text-slate-800 text-[11px] font-mono tracking-wide">
                                                {line}
                                            </span>
                                            {i === termLines.length - 1 && (
                                                <span className="inline-block w-2 h-[13px] bg-cyan-500 ml-0.5" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ════════ STEP 2: BIOMETRIC VERIFICATION ════════ */}
                    {subPhase === 'verifying' && (
                        <motion.div
                            key="verifying"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -18 }}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-sm"
                        >
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center text-base font-bold text-[var(--lx-text-sub)] mb-5 tracking-widest uppercase font-semibold"
                            >
                                Student Access Verification
                            </motion.h2>

                            {/* ID card */}
                            <motion.div
                                initial={{ scale: 0.93, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.15, duration: 0.35 }}
                                className="glass-card relative overflow-hidden"
                                style={{ borderRadius: '8px' }}
                            >
                                <div className="flex gap-5 p-6 items-start">
                                    {/* Avatar block */}
                                    <div
                                        className="w-20 h-20 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)] flex items-center justify-center text-4xl shrink-0 select-none"
                                        style={{ borderRadius: '6px' }}
                                    >
                                        {character?.avatar || '👩‍🔬'}
                                    </div>

                                    {/* Data */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-1.5 select-none font-semibold">
                                            Assigned Role
                                        </div>
                                        <div
                                            className="text-base font-bold text-[var(--lx-text)] mb-3 leading-tight truncate"
                                        >
                                            {character?.name || 'Scientific Expert'}
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                                                    Scientific Role:
                                                </div>
                                                <div className="text-[11px] font-mono text-[var(--lx-text-sub)] font-semibold">
                                                    {(character?.title || 'Researcher').toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                                                    Access Level:
                                                </div>
                                                <div className="text-[11px] font-mono text-cyan-600 font-bold">
                                                    Active
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ════════ STEP 3: ACCESS GRANTED ════════ */}
                    {subPhase === 'granted' && (
                        <motion.div
                            key="granted"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35 }}
                            className="w-full max-w-sm"
                        >
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-base font-bold text-[var(--lx-text-sub)] mb-5 tracking-widest uppercase font-semibold"
                            >
                                Student Access Verification
                            </motion.h2>

                            {/* ID card — granted state */}
                            <div
                                className="glass-card relative border-2 border-emerald-400 shadow-[0_0_40px_-8px_rgba(34,197,94,0.15)] overflow-hidden"
                                style={{ borderRadius: '8px' }}
                            >
                                <div className="flex gap-5 p-6 items-start">
                                    <div
                                        className="w-20 h-20 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)] flex items-center justify-center text-4xl shrink-0 select-none"
                                        style={{ borderRadius: '6px' }}
                                    >
                                        {character?.avatar || '👩‍🔬'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-1.5 select-none font-semibold">
                                            Assigned Role
                                        </div>
                                        <div
                                            className="text-base font-bold text-[var(--lx-text)] mb-3 leading-tight truncate"
                                        >
                                            {character?.name || 'Scientific Expert'}
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                                                    Scientific Role:
                                                </div>
                                                <div className="text-[11px] font-mono text-[var(--lx-text-sub)] font-semibold">
                                                    {(character?.title || 'Researcher').toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">
                                                    Access Level:
                                                </div>
                                                <div className="text-[11px] font-mono text-cyan-600 font-bold">
                                                    Active
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ACCESS GRANTED bar */}
                                <div className="px-4 pb-4">
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.55, ease: 'easeOut' }}
                                        style={{ transformOrigin: 'left', borderRadius: '3px' }}
                                        className="bg-emerald-500 flex items-center justify-center gap-3 py-3"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                        <span
                                            className="text-white font-bold text-sm tracking-widest uppercase"
                                        >
                                            Access Granted
                                        </span>
                                        <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Loading next step */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-5 flex items-center justify-center gap-2"
                            >
                                <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest select-none font-semibold">
                                    Loading Scenario Briefing...
                                </span>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <div
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-60"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* ── Bottom loading bar (bootup only) ── */}
            <AnimatePresence>
                {subPhase === 'booting' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className="relative z-10 px-8 pb-7"
                    >
                        <div className="max-w-xl mx-auto">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest">
                                    Preparing Scenario
                                </span>
                                <span className="text-[10px] font-mono text-cyan-600 tabular-nums">
                                    Loading... {loadPct}%
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="glass-progress h-2.5" style={{ borderRadius: '2px' }}>
                                <motion.div
                                    className="glass-progress-bar h-full"
                                    style={{ width: `${loadPct}%`, borderRadius: '2px' }}
                                />
                            </div>

                            {/* System AI briefing panel */}
                            <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="glass-card mt-3 px-5 py-3 shadow-sm border border-cyan-500/10"
                                style={{ borderRadius: '4px' }}
                            >
                                <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-wider block text-center leading-relaxed font-semibold">
                                    SCENARIO BRIEFING: Welcome to the interactive scenario. Please read the information carefully and make decisions based on scientific evidence.
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
