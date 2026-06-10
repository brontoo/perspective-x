import { useEffect, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, LogIn, ArrowRight, Users, Trophy, BookOpen, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';


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
function StatPanel({ numericValue, suffix = '', label, icon, motionDelay }) {
    const counted = useCounter(numericValue, 1200);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: motionDelay }}
            whileHover={{ y: -2 }}
            className="relative glass-card p-4 text-center overflow-hidden"
        >
            <div className="mb-1.5">{icon}</div>
            <div className="text-3xl md:text-4xl font-black text-[var(--lx-text)] leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {numericValue === 0 ? '0' : `${counted}${suffix}`}
            </div>
            <div className="text-[10px] text-[var(--lx-text-muted)] uppercase tracking-widest font-mono mt-1.5">{label}</div>
        </motion.div>
    );
}

// ── Static Background Blobs (Lightweight) ────────────────────────────────────
function StaticBlobs() {
    useEffect(() => {
        const handleMouseMove = (e) => {
            const glow = document.getElementById('cursor-glow-effect');
            if (glow) {
                // Center the 400x400 element on the cursor
                glow.style.transform = `translate3d(${e.clientX - 200}px, ${e.clientY - 200}px, 0)`;
            }
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const sphereStyle = {
        background: 'radial-gradient(circle at 35% 35%, #00d9ff 0%, #007a99 35%, #003d5c 80%, #001f33 100%)',
        boxShadow: '0 15px 35px -5px rgba(0,0,0,0.2), inset -10px -10px 20px rgba(0,0,0,0.3)',
        borderRadius: '50%'
    };

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Top Left */}
            <div className="absolute -top-32 -left-20 w-[450px] h-[450px]" style={sphereStyle} />
            
            {/* Left Middle */}
            <div className="absolute top-[35%] left-10 w-28 h-28" style={sphereStyle} />

            {/* Center cluster behind X */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-90">
                <div className="absolute top-0 left-4 w-28 h-28" style={sphereStyle} />
                <div className="absolute top-12 left-24 w-36 h-36" style={sphereStyle} />
                <div className="absolute top-32 left-0 w-24 h-24" style={sphereStyle} />
                <div className="absolute top-36 left-20 w-32 h-32" style={sphereStyle} />
            </div>

            {/* Mouse Tracking Glow */}
            <div id="cursor-glow-effect" 
                 className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full mix-blend-color-dodge opacity-70 pointer-events-none z-50 flex items-center justify-center" 
                 style={{ 
                     background: 'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.6) 0%, rgba(0,217,255,0.2) 40%, transparent 70%)',
                     willChange: 'transform',
                     transform: 'translate3d(-500px, -500px, 0)' // Start off-screen
                 }}>
                <div className="w-16 h-16 rounded-full shadow-[0_0_60px_30px_rgba(0,255,255,0.8)]" style={{ background: '#00ffff' }} />
            </div>

            {/* Bottom Right large */}
            <div className="absolute -bottom-48 -right-20 w-[550px] h-[550px]" style={sphereStyle} />
            
            {/* Bottom Right small */}
            <div className="absolute bottom-16 right-56 w-40 h-40" style={sphereStyle} />
        </div>
    );
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
            : isLoggedIn ? 'Continue Scenario'
                : 'Begin Your Journey';
    const ctaIcon = isLoggedIn
        ? <ArrowRight className="w-5 h-5" />
        : <Play className="w-5 h-5" />;

    return (
        <section className="relative min-h-[95vh] flex flex-col overflow-hidden lx-bg-ambient">
            <StaticBlobs />
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
                            Interactive Science Learning
                        </span>
                        <span className="hidden sm:block text-[var(--lx-text-muted)] text-[10px] border-l border-[var(--lx-glass-border-sub)] pl-3 ml-1 font-mono">
                            Um Al Emarat School
                        </span>
                    </motion.div>

                    {/* Title block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative mx-auto max-w-2xl mb-4 py-4"
                    >
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
                        transition={{ delay: 0.52 }}
                        className="text-lg md:text-xl text-[var(--lx-text-sub)] mb-12 max-w-2xl mx-auto leading-relaxed font-semibold font-sans">
                        Step into a science role, check the evidence, make a choice, and see the result.
                    </motion.p>

                    {/* ── CTA buttons ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.62 }}
                        className="flex flex-wrap items-center justify-center gap-4 mb-16">

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onStart}
                            disabled={isLoading}
                            className="liquid-btn-accent relative flex items-center gap-3 px-8 py-4 font-semibold text-base disabled:opacity-60 overflow-hidden"
                            style={{ borderRadius: 'var(--lx-r-btn)' }}>
                            <Play className="w-5 h-5" />
                            Start Learning
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="liquid-btn flex items-center gap-3 px-8 py-4 text-base font-semibold"
                            style={{ borderRadius: 'var(--lx-r-btn)' }}>
                            <BookOpen className="w-5 h-5 text-cyan-600" />
                            Choose a Role
                        </motion.button>

                        {!isLoading && (
                            isLoggedIn ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={async () => {
                                        const { data: { user: currentUser } } = await supabase.auth.getUser();
                                        if (currentUser) {
                                            const { data: profile } = await supabase
                                                .from('profiles')
                                                .select('role')
                                                .eq('id', currentUser.id)
                                                .single();
                                            navigate(profile?.role === 'teacher' ? '/TeacherDashboard' : '/Dashboard');
                                        } else {
                                            navigate('/SignIn');
                                        }
                                    }}
                                    className="liquid-btn flex items-center gap-3 px-8 py-4 text-base font-semibold"
                                    style={{ borderRadius: 'var(--lx-r-btn)' }}>
                                    <LayoutDashboard className="w-5 h-5 text-purple-600" />
                                    Go to Dashboard
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/SignIn')}
                                    className="liquid-btn flex items-center gap-3 px-8 py-4 text-base font-semibold"
                                    style={{ borderRadius: 'var(--lx-r-btn)' }}>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </motion.button>
                            )
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
                        />
                        <StatPanel
                            numericValue={liveStats.badges}
                            suffix=""
                            label="Badges Earned"
                            icon={<Trophy className="w-4 h-4 text-amber-500 mx-auto" />}
                            motionDelay={1.0}
                        />
                        <StatPanel
                            numericValue={10}
                            suffix=""
                            label="Live Scenarios"
                            icon={<BookOpen className="w-4 h-4 text-teal-600 mx-auto" />}
                            motionDelay={1.1}
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
