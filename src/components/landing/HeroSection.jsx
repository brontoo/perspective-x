
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, LogIn, ArrowRight, Users, Trophy, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import MetaballCanvas from './MetaballCanvas';

// ── HUD corner brackets ──────────────────────────────────────────────────────
function HUDCorners({ size = 'md', colorClass = 'border-cyan-500/50' }) {
    const sz = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-5 h-5' : 'w-3 h-3';
    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            <span className={`absolute top-0 left-0 ${sz} border-t-2 border-l-2 ${colorClass}`} />
            <span className={`absolute top-0 right-0 ${sz} border-t-2 border-r-2 ${colorClass}`} />
            <span className={`absolute bottom-0 left-0 ${sz} border-b-2 border-l-2 ${colorClass}`} />
            <span className={`absolute bottom-0 right-0 ${sz} border-b-2 border-r-2 ${colorClass}`} />
        </div>
    );
}

// ── Animated scan line ───────────────────────────────────────────────────────
function ScanLine({ scanDelay = 0 }) {
    return (
        <motion.div
            className="absolute left-0 right-0 h-px pointer-events-none z-20"
            style={{ background: 'linear-gradient(to right, transparent, rgba(6,182,212,0.55), transparent)' }}
            animate={{ top: ['-2px', '102%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 4, delay: scanDelay }}
        />
    );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function useCounter(target, duration = 1400) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (target === 0) { setValue(0); return; }
        let current = 0;
        const steps = duration / 16;
        const increment = target / steps;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { setValue(target); clearInterval(timer); }
            else setValue(Math.floor(current));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return value;
}

// ── Stat panel ───────────────────────────────────────────────────────────────
function StatPanel({ numericValue, suffix = '', label, icon, motionDelay, panelId, scanDelay }) {
    const counted = useCounter(numericValue, 1200);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: motionDelay }}
            whileHover={{ y: -2 }}
            className="relative glass-card p-4 text-center overflow-hidden"
        >
            <HUDCorners size="sm" colorClass="border-cyan-400/50" />
            <ScanLine scanDelay={scanDelay} />
            <span className="absolute top-1.5 right-2.5 text-[9px] font-mono text-[var(--lx-accent)]/70 tracking-widest select-none">
                {panelId}
            </span>
            <div className="mb-1.5">{icon}</div>
            <div className="text-3xl md:text-4xl font-black text-[var(--lx-text)] leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {numericValue === 0 ? '0' : `${counted}${suffix}`}
            </div>
            <div className="text-[10px] text-[var(--lx-text-muted)] uppercase tracking-widest font-mono mt-1.5">{label}</div>
        </motion.div>
    );
}

// ── Particle canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
    return <MetaballCanvas />;
}

// ── Floating molecules decoration ────────────────────────────────────────────
function FloatingMolecules() {
    const molecules = [
        { x: '80%', y: '20%', delay: 0, size: 40 },
        { x: '85%', y: '60%', delay: 1, size: 30 },
        { x: '70%', y: '80%', delay: 2, size: 35 },
    ];
    return (
        <>
            {molecules.map((mol, i) => (
                <motion.div key={i} className="absolute pointer-events-none opacity-10"
                    style={{ left: mol.x, top: mol.y }}
                    animate={{ y: [0, -20, 0], rotate: [0, 360] }}
                    transition={{
                        y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    }}>
                    <svg width={mol.size} height={mol.size} viewBox="0 0 50 50">
                        <circle cx="25" cy="15" r="8" fill="#0891b2" />
                        <circle cx="15" cy="35" r="6" fill="#0e7490" />
                        <circle cx="35" cy="35" r="6" fill="#06b6d4" />
                        <line x1="25" y1="15" x2="15" y2="35" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
                        <line x1="25" y1="15" x2="35" y2="35" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
                        <line x1="15" y1="35" x2="35" y2="35" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
                    </svg>
                </motion.div>
            ))}
        </>
    );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function HeroSection({ onStart, isLoggedIn = false, isLoading = false, lastRole = null }) {
    const navigate = useNavigate();
    const [liveStats, setLiveStats] = useState({ students: 0, badges: 0 });

    // Inject Space Grotesk font once
    useEffect(() => {
        if (!document.getElementById('space-grotesk-font')) {
            const link = document.createElement('link');
            link.id = 'space-grotesk-font';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [{ count: students }, { data: progress }] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                    supabase.from('student_progress').select('score').not('scenario_id', 'is', null),
                ]);
                const completions = (progress || []).filter(r => r.score >= 70).length;
                setLiveStats({ students: students || 0, badges: completions });
            } catch (e) { console.log('Stats error:', e); }
        };
        fetchStats();
    }, []);

    const ctaLabel = isLoading ? 'Initializing...'
        : isLoggedIn && lastRole ? `Continue as ${lastRole}`
            : isLoggedIn ? 'Continue Mission'
                : 'Begin Your Journey';
    const ctaIcon = isLoggedIn
        ? <ArrowRight className="w-5 h-5" />
        : <Play className="w-5 h-5" />;

    return (
        <section className="relative min-h-[95vh] flex flex-col overflow-hidden lx-bg-ambient">
            <ParticleCanvas />
            <FloatingMolecules />

            {/* Blueprint square grid overlay */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{ opacity: 0.25 }}>
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="blueprint-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
                </svg>
            </div>

            {/* Subtle cyan ambient glow from top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none z-0"
                style={{ background: 'radial-gradient(ellipse at top, rgba(6,182,212,0.10) 0%, transparent 70%)' }} />

            {/* ── System status bar ── */}
            <div className="relative z-10 glass-nav shrink-0">
                <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                        <motion.span
                            className="flex items-center gap-1.5 text-[var(--lx-accent)] font-semibold"
                            animate={{ opacity: [1, 0.55, 1] }}
                            transition={{ duration: 2.5, repeat: Infinity }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lx-success)]" />
                            SYS_STATUS: ONLINE
                        </motion.span>
                        <span className="hidden sm:block text-[var(--lx-glass-border-sub)]">|</span>
                        <span className="hidden sm:block text-[var(--lx-text-sub)]">PERSPECTIVE_X_v4.0</span>
                        <span className="hidden md:block text-[var(--lx-glass-border-sub)]">|</span>
                        <span className="hidden md:block text-[var(--lx-text-sub)]">ACCESS: OPEN</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[11px] font-mono text-[var(--lx-text-muted)]">
                        <span>SECTORS: 9&nbsp;ACTIVE</span>
                        <span className="text-[var(--lx-glass-border-sub)]">|</span>
                        <span>24.45°N&nbsp;/&nbsp;54.37°E</span>
                    </div>
                </div>
            </div>

            {/* ── Main hero content ── */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
                <div className="max-w-5xl w-full mx-auto px-6 py-14 text-center">

                    {/* System protocol badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 glass-card"
                        style={{ borderRadius: 'var(--lx-r-btn)' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                            <Sparkles className="w-4 h-4 text-[var(--lx-accent)]" />
                        </motion.div>
                        <span className="text-[var(--lx-accent)] text-[11px] font-mono tracking-widest uppercase">
                            Interactive Science Learning Protocol
                        </span>
                        <span className="hidden sm:block text-[var(--lx-text-muted)] text-[10px] border-l border-[var(--lx-glass-border-sub)] pl-3 ml-1 font-mono">
                            Um Al Emarat School
                        </span>
                    </motion.div>

                    {/* Title block with HUD brackets */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative mx-auto max-w-2xl mb-6 py-4 px-8"
                    >
                        <HUDCorners size="lg" colorClass="border-cyan-500/40" />
                        <h1
                            className="lx-hero-title font-black"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            <span className="lx-text-gradient">
                                Perspective X
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.42 }}
                        className="text-xl md:text-2xl text-[var(--lx-text-sub)] mb-4 font-light"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Step Into the Role
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.52 }}
                        className="text-base text-[var(--lx-text-muted)] mb-12 max-w-xl mx-auto leading-relaxed">
                        In science, every decision has consequences. Experience real-world scenarios,
                        make critical choices, and see how your scientific reasoning shapes outcomes.
                    </motion.p>

                    {/* ── CTA buttons ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.62 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onStart}
                            disabled={isLoading}
                            className="liquid-btn-accent relative flex items-center gap-3 px-10 py-4 font-semibold text-base disabled:opacity-60 overflow-hidden"
                            style={{ borderRadius: 'var(--lx-r-btn)', fontFamily: "'Space Grotesk', sans-serif" }}>
                            <motion.div
                                className="absolute left-0 right-0 h-px bg-white/25 pointer-events-none"
                                animate={{ top: ['-1px', '101%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
                            {ctaIcon}
                            {ctaLabel}
                        </motion.button>

                        {!isLoading && !isLoggedIn && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/SignIn')}
                                className="liquid-btn flex items-center gap-3 px-8 py-4 text-base font-semibold"
                                style={{ borderRadius: 'var(--lx-r-btn)', fontFamily: "'Space Grotesk', sans-serif" }}>
                                <LogIn className="w-5 h-5" />
                                Access Terminal
                            </motion.button>
                        )}
                    </motion.div>

                    {/* ── Stat panels ── */}
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        <StatPanel
                            numericValue={liveStats.students}
                            suffix="+"
                            label="Active Students"
                            icon={<Users className="w-4 h-4 text-cyan-500 mx-auto" />}
                            motionDelay={0.9}
                            panelId="STU-001"
                            scanDelay={0}
                        />
                        <StatPanel
                            numericValue={liveStats.badges}
                            suffix=""
                            label="Badges Earned"
                            icon={<Trophy className="w-4 h-4 text-amber-500 mx-auto" />}
                            motionDelay={1.0}
                            panelId="ACH-001"
                            scanDelay={1.2}
                        />
                        <StatPanel
                            numericValue={10}
                            suffix=""
                            label="Live Scenarios"
                            icon={<BookOpen className="w-4 h-4 text-teal-600 mx-auto" />}
                            motionDelay={1.1}
                            panelId="SCN-001"
                            scanDelay={2.4}
                        />
                    </div>
                </div>
            </div>

            {/* ── Scroll indicator ── */}
            <div className="relative z-10 pb-8 flex flex-col items-center gap-2 shrink-0">
                <span className="text-slate-400 text-[10px] tracking-widest uppercase font-mono">Scroll</span>
                <div className="w-5 h-9 border border-cyan-400/50 rounded-full flex justify-center">
                    <motion.div
                        className="w-1 h-2.5 bg-cyan-500 rounded-full mt-1"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
            </div>
        </section>
    );
}
