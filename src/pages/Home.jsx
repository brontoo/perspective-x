import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ROLES } from '@/components/scenarios/scenarioData';
import HeroSection from '@/components/landing/HeroSection';
import RoleCard from '@/components/landing/RoleCard';
import LearningFocusSection from '@/components/landing/LearningFocusSection';
import { Loader2, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
    const navigate = useNavigate();
    const [showRoles, setShowRoles] = useState(false);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            // If teacher, redirect to teacher dashboard
            if (currentUser.user_type === 'teacher') {
                navigate(createPageUrl('TeacherDashboard'));
                return;
            }

            const progressList = await base44.entities.StudentProgress.list();
            if (progressList.length > 0) {
                setProgress(progressList[0]);
            }
        } catch (e) {
            console.log('No progress found');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        base44.auth.logout(createPageUrl('SignIn'));
    };

    const handleStart = () => {
        setShowRoles(true);
        setTimeout(() => {
            document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleRoleSelect = (roleId) => {
        navigate(createPageUrl('RoleHub') + `?role=${roleId}`);
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* User header */}
            {user && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
                    <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(createPageUrl('Dashboard'))}
                        className="text-teal-400 hover:text-white border border-teal-500/30 hover:border-teal-400/60 gap-1.5"
                        title="My Dashboard"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-xs">Dashboard</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white">
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <HeroSection onStart={handleStart} />

            <LearningFocusSection />

            {/* Roles Section */}
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

            {/* Footer */}
            <footer className="py-12 border-t border-slate-800">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-slate-500 text-sm">
                        Science Role-Play Learning Ecosystem • Designed for Interactive Learning
                    </p>
                </div>
            </footer>
        </div>
    );
}