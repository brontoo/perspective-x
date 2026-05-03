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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return (
        <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg width="100%" height="100%" preserveAspectRatio="none">
                <defs>
                    <pattern id="ct-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ct-grid)" />
            </svg>
        </div>
    );
}

/* ── HUD corner brackets ────────────────────────────────────────────────── */
function HUDCorners({ colorClass = 'border-cyan-400', size = 'w-5 h-5' }) {
    return (
        <>
            <span className={`absolute top-0 left-0 ${size} border-t-2 border-l-2 ${colorClass}`} />
            <span className={`absolute top-0 right-0 ${size} border-t-2 border-r-2 ${colorClass}`} />
            <span className={`absolute bottom-0 left-0 ${size} border-b-2 border-l-2 ${colorClass}`} />
            <span className={`absolute bottom-0 right-0 ${size} border-b-2 border-r-2 ${colorClass}`} />
        </>
    );
}

/* ── Scan line ──────────────────────────────────────────────────────────── */
function ScanLine({ color = 'via-cyan-400/70' }) {
    return (
        <motion.div
            className={`absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${color} to-transparent pointer-events-none z-10`}
            initial={{ top: '0%' }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   BOOT MESSAGES
──────────────────────────────────────────────────────────────────────────── */
const BOOT_MESSAGES = [
    'PERSPECTIVE_X_SYSTEM_BOOT_INITIATED...',
    'LOADING_SCENARIO_PARAMETERS...',
    'ESTABLISHING_SECURE_CONNECTION...',
    'CALIBRATING_NEURAL_INTERFACE...',
    'SYNCHRONIZING_MISSION_DATA...',
    'CLEARANCE_VERIFICATION_PROTOCOL_ACTIVE...',
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
                        PERSPECTIVE_X
                    </span>
                    <span className="text-[var(--lx-glass-border-sub)] select-none">|</span>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={subPhase}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.25 }}
                            className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase select-none"
                        >
                            {subPhase === 'booting'   && 'Scenario Initialization Bootup'}
                            {subPhase === 'verifying' && 'Personnel Access Verification'}
                            {subPhase === 'granted'   && 'Access Authorized — Loading Mission'}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Animated progress indicators */}
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            className="w-7 h-1 bg-cyan-400"
                            style={{ borderRadius: '1px' }}
                            animate={{ opacity: [0.25, 1, 0.25] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.35 }}
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
                            {/* Dark terminal panel — escape room feel */}
                            <div
                                className="relative border-2 border-cyan-400/70 bg-slate-900 shadow-[0_0_80px_-10px_rgba(6,182,212,0.25),0_0_120px_-20px_rgba(6,182,212,0.12)]"
                                style={{ borderRadius: '6px' }}
                            >
                                <HUDCorners colorClass="border-cyan-400" size="w-5 h-5" />
                                <ScanLine />

                                {/* Terminal header */}
                                <div className="flex items-center gap-3 border-b border-slate-700/80 px-5 py-3">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-cyan-400"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 0.9, repeat: Infinity }}
                                    />
                                    <span className="text-[10px] font-mono text-cyan-400 tracking-widest flex-1">
                                        SYSTEM_BOOT :: CHAMBER_ACTIVATION
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
                                            <span className="text-cyan-300 text-[11px] font-mono tracking-wide">
                                                {line}
                                            </span>
                                            {i === termLines.length - 1 && (
                                                <motion.span
                                                    className="inline-block w-2 h-[13px] bg-cyan-400 ml-0.5"
                                                    animate={{ opacity: [1, 0] }}
                                                    transition={{ duration: 0.5, repeat: Infinity }}
                                                />
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
                                className="text-center text-base font-bold text-[var(--lx-text-sub)] mb-5 tracking-widest uppercase"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                PERSONNEL ACCESS VERIFICATION
                            </motion.h2>

                            {/* ID card */}
                            <motion.div
                                initial={{ scale: 0.93, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.15, duration: 0.35 }}
                                className="glass-card relative overflow-hidden"
                                style={{ borderRadius: '8px' }}
                            >
                                <HUDCorners colorClass="border-cyan-400" size="w-4 h-4" />
                                <ScanLine color="via-cyan-400/60" />

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
                                        <div className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-1.5 select-none">
                                            Authorized Personnel
                                        </div>
                                        <div
                                            className="text-base font-bold text-[var(--lx-text)] mb-3 leading-tight truncate"
                                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
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
                                                    Mission Clearance Level:
                                                </div>
                                                <div className="text-[11px] font-mono text-cyan-600 font-bold">
                                                    ALPHA
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
                                className="text-center text-base font-bold text-[var(--lx-text-sub)] mb-5 tracking-widest uppercase"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                PERSONNEL ACCESS VERIFICATION
                            </motion.h2>

                            {/* ID card — granted state */}
                            <div
                                className="glass-card relative border-2 border-emerald-400 shadow-[0_0_40px_-8px_rgba(34,197,94,0.3)] overflow-hidden"
                                style={{ borderRadius: '8px' }}
                            >
                                <HUDCorners colorClass="border-emerald-400" size="w-4 h-4" />

                                <div className="flex gap-5 p-6 items-start">
                                    <div
                                        className="w-20 h-20 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)] flex items-center justify-center text-4xl shrink-0 select-none"
                                        style={{ borderRadius: '6px' }}
                                    >
                                        {character?.avatar || '👩‍🔬'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase mb-1.5 select-none">
                                            Authorized Personnel
                                        </div>
                                        <div
                                            className="text-base font-bold text-[var(--lx-text)] mb-3 leading-tight truncate"
                                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
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
                                                    Mission Clearance Level:
                                                </div>
                                                <div className="text-[11px] font-mono text-cyan-600 font-bold">
                                                    ALPHA
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
                                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                        >
                                            ACCESS GRANTED
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
                                <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest select-none">
                                    LOADING_MISSION_BRIEFING
                                </span>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-1 h-1 rounded-full bg-cyan-400"
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
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
                                    Initializing Simulation
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
                                className="glass-card mt-3 px-5 py-3"
                                style={{ borderRadius: '4px' }}
                            >
                                <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-wider block text-center leading-relaxed">
                                    SYSTEM AI BRIEFING: Simulation parameters synchronized. Subject engagement protocols active. Prepare for neural interface calibration.
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
