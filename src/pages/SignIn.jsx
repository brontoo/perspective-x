import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
    Loader2, GraduationCap, Shield, Sparkles,
    ArrowRight, BookOpen, Star, BarChart3,
    Users, Lock, Trophy
} from 'lucide-react';

// Canvas particle background (same as HeroSection)
function ParticleCanvas() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animFrameId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouse = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouse);

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    p.x += dx / dist * 1.5;
                    p.y += dy / dist * 1.5;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(20, 184, 166, ${p.opacity})`;
                ctx.fill();
            });

            particles.forEach((p, i) => {
                particles.slice(i + 1).forEach(q => {
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = `rgba(20, 184, 166, ${0.08 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            animFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animFrameId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouse);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const roles = [
    {
        id: 'student',
        title: 'Student',
        subtitle: 'Join the Learning Journey',
        icon: GraduationCap,
        gradient: 'from-teal-400 to-emerald-500',
        glowColor: 'rgba(20,184,166,0.35)',
        borderColor: 'rgba(20,184,166,0.3)',
        hoverBorderColor: 'rgba(20,184,166,0.7)',
        accentColor: '#14b8a6',
        features: [
            { icon: BookOpen, text: 'Access immersive scenarios' },
            { icon: Trophy, text: 'Earn badges & certificates' },
            { icon: BarChart3, text: 'Track your skill growth' },
        ],
        description: 'Explore real-world science scenarios, make critical decisions, and develop expertise through immersive role-play.',
    },
    {
        id: 'teacher',
        title: 'Teacher',
        subtitle: 'Manage Your Classroom',
        icon: Shield,
        gradient: 'from-purple-400 to-pink-500',
        glowColor: 'rgba(168,85,247,0.35)',
        borderColor: 'rgba(168,85,247,0.3)',
        hoverBorderColor: 'rgba(168,85,247,0.7)',
        accentColor: '#a855f7',
        features: [
            { icon: Users, text: 'Monitor student progress' },
            { icon: Lock, text: 'Assign & unlock scenarios' },
            { icon: Star, text: 'Send feedback & reviews' },
        ],
        description: 'Oversee student learning, configure scenario difficulty, provide targeted feedback, and track academic progress.',
    },
];

export default function SignIn() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [hoveredRole, setHoveredRole] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const isAuth = await base44.auth.isAuthenticated();
            if (isAuth) {
                const user = await base44.auth.me();
                if (user.user_type === 'teacher') {
                    navigate(createPageUrl('TeacherDashboard'));
                } else {
                    navigate(createPageUrl('Home'));
                }
            } else {
                setChecking(false);
            }
        } catch (e) {
            setChecking(false);
        }
    };

    const handleSignIn = () => {
        base44.auth.redirectToLogin(window.location.href);
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
            {/* Particle canvas */}
            <ParticleCanvas />

            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute -left-60 top-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.18), transparent)' }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -right-60 top-1/3 w-[500px] h-[500px] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.18), transparent)' }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
                <motion.div
                    className="absolute left-1/2 -translate-x-1/2 -bottom-20 w-[900px] h-72 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, rgba(20,184,166,0.12), transparent)' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />
                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    {/* Logo icon */}
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl shadow-teal-500/40"
                        style={{
                            background: 'linear-gradient(135deg, #14b8a6, #10b981)',
                            boxShadow: '0 0 40px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                        animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.03, 1] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400">
                            Perspective-X
                        </span>
                    </h1>
                    <p className="text-2xl font-semibold text-white/80 mb-3 tracking-wide">Login</p>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                        Select your role below to sign in and begin your journey
                    </p>
                </motion.div>

                {/* Role Cards */}
                <div className="w-full max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        {roles.map((role, index) => {
                            const Icon = role.icon;
                            const isHovered = hoveredRole === role.id;
                            return (
                                <motion.div
                                    key={role.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.15, duration: 0.6, ease: 'easeOut' }}
                                    onHoverStart={() => setHoveredRole(role.id)}
                                    onHoverEnd={() => setHoveredRole(null)}
                                    onClick={handleSignIn}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="cursor-pointer relative rounded-3xl p-8 flex flex-col"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        backdropFilter: 'blur(24px)',
                                        WebkitBackdropFilter: 'blur(24px)',
                                        border: `1px solid ${isHovered ? role.hoverBorderColor : role.borderColor}`,
                                        boxShadow: isHovered
                                            ? `0 20px 60px ${role.glowColor}, 0 0 0 1px ${role.hoverBorderColor}, inset 0 1px 0 rgba(255,255,255,0.08)`
                                            : `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
                                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                                    }}
                                >
                                    {/* Inner glass shine */}
                                    <div
                                        className="absolute inset-0 rounded-3xl pointer-events-none"
                                        style={{
                                            background: isHovered
                                                ? `linear-gradient(135deg, ${role.accentColor}08, transparent 60%)`
                                                : 'linear-gradient(135deg, rgba(255,255,255,0.04), transparent 60%)',
                                            transition: 'background 0.3s ease',
                                        }}
                                    />

                                    {/* Animated glow ring on hover */}
                                    {isHovered && (
                                        <motion.div
                                            className="absolute inset-0 rounded-3xl pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{
                                                boxShadow: `inset 0 0 30px ${role.accentColor}15`,
                                            }}
                                        />
                                    )}

                                    {/* Icon */}
                                    <motion.div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
                                        style={{
                                            background: `linear-gradient(135deg, ${role.accentColor}20, ${role.accentColor}08)`,
                                            border: `1px solid ${role.accentColor}30`,
                                            boxShadow: isHovered ? `0 0 30px ${role.accentColor}40` : 'none',
                                            transition: 'box-shadow 0.3s ease',
                                        }}
                                        animate={isHovered ? { scale: [1, 1.08, 1] } : {}}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Icon className="w-10 h-10" style={{ color: role.accentColor }} />
                                    </motion.div>

                                    {/* Title */}
                                    <div className="mb-4 relative">
                                        <h2 className="text-2xl font-bold text-white mb-1">{role.title}</h2>
                                        <p
                                            className="text-sm font-medium"
                                            style={{ color: role.accentColor }}
                                        >
                                            {role.subtitle}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed relative">
                                        {role.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8 relative flex-1">
                                        {role.features.map((feature, i) => {
                                            const FeatureIcon = feature.icon;
                                            return (
                                                <motion.li
                                                    key={i}
                                                    className="flex items-center gap-3 text-sm text-slate-400"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 + index * 0.15 + i * 0.05 }}
                                                >
                                                    <div
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{
                                                            background: `${role.accentColor}15`,
                                                            border: `1px solid ${role.accentColor}25`,
                                                        }}
                                                    >
                                                        <FeatureIcon className="w-3.5 h-3.5" style={{ color: role.accentColor }} />
                                                    </div>
                                                    {feature.text}
                                                </motion.li>
                                            );
                                        })}
                                    </ul>

                                    {/* CTA Button */}
                                    <motion.div
                                        className="relative flex items-center justify-between py-3.5 px-5 rounded-2xl text-white font-semibold text-sm overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg, ${role.accentColor}, ${index === 0 ? '#10b981' : '#ec4899'})`,
                                            boxShadow: isHovered ? `0 8px 24px ${role.glowColor}` : '0 4px 12px rgba(0,0,0,0.3)',
                                            transition: 'box-shadow 0.3s ease',
                                        }}
                                    >
                                        {/* Shimmer effect */}
                                        {isHovered && (
                                            <motion.div
                                                className="absolute inset-0 pointer-events-none"
                                                style={{
                                                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                                                }}
                                                initial={{ x: '-100%' }}
                                                animate={{ x: '200%' }}
                                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                                            />
                                        )}
                                        <span>Sign in as {role.title}</span>
                                        <motion.div
                                            animate={isHovered ? { x: 4 } : { x: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-slate-700 text-xs mt-12 text-center"
                >
                    Your role is determined by your account type. Both options use the same secure sign-in.
                </motion.p>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center pb-6">
                <p className="text-slate-800 text-xs">Perspective-X • Interactive Science Learning Platform</p>
            </div>
        </div>
    );
}