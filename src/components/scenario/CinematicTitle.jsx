import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CinematicTitle({ title, subtitle, character, onComplete }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);
        };
        resize();

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width / 2;
                this.y = Math.random() * canvas.height / 2;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.color = Math.random() > 0.5 ? '#14b8a6' : '#8b5cf6';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width / 2 || this.y < 0 || this.y > canvas.height / 2) {
                    this.reset();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();

        const timer = setTimeout(() => {
            onComplete?.();
        }, 4000);

        return () => {
            cancelAnimationFrame(animationId);
            clearTimeout(timer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden">
            {/* Particle canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Holographic grid */}
            <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#14b8a6" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Glowing orbs */}
            <motion.div
                className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
                style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }}
                animate={{
                    scale: [1, 1.3, 1],
                    x: [-100, 100, -100],
                }}
                transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
                className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
                style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [100, -100, 100],
                }}
                transition={{ duration: 5, repeat: Infinity }}
            />

            {/* Main content */}
            <div className="relative z-10 text-center max-w-4xl px-6">
                {/* Mission badge */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/30 backdrop-blur-xl">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-teal-400"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-teal-300 text-sm font-medium tracking-wider">MISSION BRIEFING</span>
                    </div>
                </motion.div>

                {/* Holographic title frame */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative mb-6"
                >
                    {/* Glassmorphism background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl backdrop-blur-xl border border-white/10" />

                    {/* Corner decorations */}
                    <svg className="absolute top-0 left-0 w-16 h-16 text-teal-500/50" viewBox="0 0 100 100">
                        <path d="M0 30 L0 0 L30 0" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="absolute top-0 right-0 w-16 h-16 text-teal-500/50" viewBox="0 0 100 100">
                        <path d="M100 30 L100 0 L70 0" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="absolute bottom-0 left-0 w-16 h-16 text-teal-500/50" viewBox="0 0 100 100">
                        <path d="M0 70 L0 100 L30 100" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="absolute bottom-0 right-0 w-16 h-16 text-teal-500/50" viewBox="0 0 100 100">
                        <path d="M100 70 L100 100 L70 100" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>

                    <div className="relative p-10">
                        {/* Main title with glow */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 mb-4"
                            style={{
                                textShadow: '0 0 40px rgba(20, 184, 166, 0.5), 0 0 80px rgba(20, 184, 166, 0.3)',
                                filter: 'drop-shadow(0 0 20px rgba(20, 184, 166, 0.4))'
                            }}
                        >
                            {title}
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="text-xl text-slate-400"
                        >
                            {subtitle}
                        </motion.p>
                    </div>
                </motion.div>

                {/* Character intro */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex items-center justify-center gap-4"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/30 to-purple-500/30 border border-teal-500/30 flex items-center justify-center text-3xl backdrop-blur-xl">
                        {character?.avatar || '🧑‍🔬'}
                    </div>
                    <div className="text-left">
                        <p className="text-slate-500 text-sm">YOUR ROLE</p>
                        <p className="text-white font-semibold">{character?.name || 'Scientific Expert'}</p>
                    </div>
                </motion.div>

                {/* Loading indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-12"
                >
                    <div className="flex items-center justify-center gap-2">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-teal-400"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full bg-teal-400"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full bg-teal-400"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                        />
                    </div>
                    <p className="text-slate-600 text-sm mt-3">Initializing mission data...</p>
                </motion.div>
            </div>
        </div>
    );
}