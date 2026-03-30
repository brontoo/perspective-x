
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            if (!currentUser) {
                setLoading(false);
                return;
            }

            setUser(currentUser);

            // تحقق من الـ role
            // ✅ الجديد
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', currentUser.id)
                .single();

            const role = profile?.role || 'student';
            setUserRole(role);
            setUser({ ...currentUser, full_name: profile?.full_name }); // ← أضف الاسم للـ user


            // جلب تقدم الطالب فقط — لا توجيه تلقائي للمدرس
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
        if (!user) {
            navigate('/SignIn');
            return;
        }
        document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleRoleSelect = (roleId) => {
        if (!user) {
            navigate('/SignIn');
            return;
        }
        navigate(`/RoleHub?role=${roleId}`);
    };

    return (
        <div className="min-h-screen bg-slate-950">

            {/* ── Header ── */}
            {!loading && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
                    {user ? (
                        <>
                            {/* Welcome Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                                <span className="text-slate-400 text-xs">Welcome,</span>
                                <span className="text-teal-300 text-xs font-bold tracking-wide">
                                    {user.full_name || user.email?.split('@')[0]}
                                </span>
                            </div>

                            {/* Dashboard Button */}
                            <button
                                onClick={() => navigate(userRole === 'teacher' ? '/TeacherDashboard' : '/Dashboard')}
                                className="flex items-center gap-1.5 text-teal-400 hover:text-white border border-teal-500/30 hover:border-teal-400/60 bg-teal-500/5 rounded-lg px-3 py-1.5 text-xs transition"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                {userRole === 'teacher' ? 'Teacher Dashboard' : 'Dashboard'}
                            </button>

                            {/* Sign Out Button */}
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="text-slate-400 hover:text-white p-2 rounded-lg transition"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/SignIn')}
                            className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 rounded-lg px-4 py-2 text-sm transition"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In / Sign Up
                        </button>
                    )}
                </div>

            )}

            {/* ── Hero ── */}
            <HeroSection onStart={handleStart} isLoggedIn={!!user} isLoading={loading} />

            <LearningFocusSection />

            {/* ── Roles Section ── */}
            <section id="roles-section" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Choose Your Role
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Each role offers unique scenarios based on real scientific challenges.
                            Complete scenarios to unlock more and earn badges.
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <footer className="py-12 border-t border-slate-800">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-slate-500 text-sm">
                        © 2026 Um Al Emarat School • Perspective X | Developed by Teacher Riham Saleh
                    </p>
                </div>
            </footer>
        </div>
    );
}