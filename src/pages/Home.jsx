
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ROLES } from '@/components/scenarios/scenarioData';
import HeroSection from '@/components/landing/HeroSection';
import RoleCard from '@/components/landing/RoleCard';
import LearningFocusSection from '@/components/landing/LearningFocusSection';
import { Loader2, LogOut, LayoutDashboard, LogIn } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) { setLoading(false); return; }

            setUser(currentUser);

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', currentUser.id)
                .single();

            const role = profile?.role || 'student';
            setUserRole(role);
            setUser({ ...currentUser, full_name: profile?.full_name });

            if (role !== 'teacher') {
                const { data: progressList } = await supabase
                    .from('student_progress')
                    .select('scenario_id, score')
                    .eq('student_id', currentUser.id)
                    .not('scenario_id', 'is', null);

                const completedScenarios = (progressList || [])
                    .filter(r => r.score >= 70)
                    .map(r => r.scenario_id);

                setProgress({ completed_scenarios: completedScenarios });
            }
        } catch (e) {
            console.log('Error loading home data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProgress(null);
        setUserRole(null);
    };

    const handleStart = () => {
        if (!user) { navigate('/SignIn'); return; }
        document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleRoleSelect = (roleId) => {
        if (!user) { navigate('/SignIn'); return; }
        navigate(`/RoleHub?role=${roleId}`);
    };

    return (
        <div className="min-h-screen lx-bg-ambient">

            {/* ── Header ── */}
            {!loading && (
                <div className="fixed top-0 left-0 right-0 z-50 glass-nav">
                    <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
                        {/* Logo */}
                        <span className="text-xs font-mono text-[var(--lx-accent)] tracking-widest hidden sm:block select-none">
                            PERSPECTIVE_X
                        </span>

                        {/* Right controls */}
                        <div className="flex items-center gap-3 ml-auto">
                            {user ? (
                                <>
                                    {/* Welcome chip */}
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass-panel border border-[var(--lx-glass-border-sub)]"
                                        style={{ borderRadius: 'var(--lx-r-btn)' }}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--lx-success)]" />
                                        <span className="text-[var(--lx-text-sub)] text-[11px] font-mono">
                                            {user.full_name || user.email?.split('@')[0]}
                                        </span>
                                    </div>

                                    {/* Dashboard */}
                                    <button
                                        onClick={() => navigate(userRole === 'teacher' ? '/TeacherDashboard' : '/Dashboard')}
                                        className="liquid-btn flex items-center gap-1.5 text-[11px] font-mono tracking-wider"
                                        style={{ borderRadius: 'var(--lx-r-btn)', padding: '6px 12px' }}>
                                        <LayoutDashboard className="w-3.5 h-3.5" />
                                        {userRole === 'teacher' ? 'TEACHER_DASHBOARD' : 'DASHBOARD'}
                                    </button>

                                    {/* Sign out */}
                                    <button
                                        onClick={handleLogout}
                                        title="Sign Out"
                                        className="liquid-btn-ghost p-1.5"
                                        style={{ borderRadius: 'var(--lx-r-btn)' }}>
                                        <LogOut className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => navigate('/SignIn')}
                                    className="liquid-btn-accent flex items-center gap-2 text-[11px] font-mono tracking-wider"
                                    style={{ borderRadius: 'var(--lx-r-btn)', padding: '6px 16px' }}>
                                    <LogIn className="w-3.5 h-3.5" />
                                    SIGN_IN / REGISTER
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for fixed header */}
            {!loading && <div className="h-11" />}

            {/* ── Hero ── */}
            <HeroSection onStart={handleStart} isLoggedIn={!!user} isLoading={loading} />

            {/* ── Learning focus ── */}
            <LearningFocusSection />

            {/* ── Roles section ── */}
            <section id="roles-section" className="pt-10 pb-20 px-6 relative z-10 lx-footer-surface">
                <div className="max-w-7xl mx-auto">

                    {/* HUD section divider */}
                    <div className="lx-divider mb-8" />
                    <div className="flex items-center gap-3 mb-8 -mt-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--lx-accent-glow)]" />
                        <span className="text-[10px] font-mono text-[var(--lx-accent)] tracking-widest uppercase px-3">
                            SCIENTIFIC_ROLES :: SELECTION_PROTOCOL
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--lx-accent-glow)]" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--lx-text)] mb-3"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Choose Your Role
                        </h2>
                        <p className="text-[var(--lx-text-sub)] max-w-2xl mx-auto text-sm leading-relaxed">
                            Each role offers unique scenarios based on real scientific challenges.
                            Complete scenarios to unlock more and earn badges.
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="flex flex-col items-center py-20 gap-3">
                            <Loader2 className="w-6 h-6 text-[var(--lx-accent)] animate-spin" />
                            <span className="text-[11px] font-mono text-[var(--lx-text-muted)] tracking-widest">
                                LOADING_ROLES...
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Object.values(ROLES).map((role, index) => (
                                <RoleCard
                                    key={role.id}
                                    role={role}
                                    index={index}
                                    progress={progress}
                                    onClick={() => handleRoleSelect(role.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-10 border-t border-[var(--lx-glass-border-sub)] glass-card relative z-10" style={{ borderRadius: 0 }}>
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <div className="text-[9px] font-mono text-[var(--lx-accent)]/60 tracking-widest mb-2 uppercase">
                        COORD_X:&nbsp;24.4539&nbsp;|&nbsp;COORD_Y:&nbsp;54.3773&nbsp;|&nbsp;AUH_FACILITY_PROTOCOL:&nbsp;SECURE
                    </div>
                    <p className="text-[var(--lx-text-muted)] text-xs">
                        © 2026 Um Al Emarat School • Perspective X | Developed by Teacher Riham Saleh
                    </p>
                </div>
            </footer>
        </div>
    );
}
