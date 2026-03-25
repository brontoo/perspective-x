import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Interactive particle system
function ParticleCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouse = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouse);

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = Math.random() * 30 + 1;
                this.color = `hsla(${170 + Math.random() * 30}, 70%, ${50 + Math.random() * 20}%, ${0.3 + Math.random() * 0.4})`;
            }

            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create particles
        const createParticles = () => {
            particles = [];
            const numberOfParticles = Math.min(200, (canvas.width * canvas.height) / 8000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };
        createParticles();

        // Connect particles
        const connect = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(20, 184, 166, ${0.15 - distance / 800})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw gradient background
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 1.5
            );
            gradient.addColorStop(0, 'rgba(20, 184, 166, 0.05)');
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let particle of particles) {
                particle.update();
                particle.draw();
            }
            connect();
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouse);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0"
            style={{ background: 'transparent' }}
        />
    );
}

// Animated DNA helix
function DNAHelix() {
    return (
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden lg:block">
            <svg width="60" height="400" viewBox="0 0 60 400">
                {[...Array(20)].map((_, i) => (
                    <g key={i}>
                        <motion.circle
                            cx={30 + Math.sin(i * 0.5) * 20}
                            cy={i * 20 + 10}
                            r="4"
                            fill="#14b8a6"
                            animate={{
                                cx: [30 + Math.sin(i * 0.5) * 20, 30 + Math.sin(i * 0.5 + Math.PI) * 20, 30 + Math.sin(i * 0.5) * 20],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.circle
                            cx={30 + Math.sin(i * 0.5 + Math.PI) * 20}
                            cy={i * 20 + 10}
                            r="4"
                            fill="#8b5cf6"
                            animate={{
                                cx: [30 + Math.sin(i * 0.5 + Math.PI) * 20, 30 + Math.sin(i * 0.5) * 20, 30 + Math.sin(i * 0.5 + Math.PI) * 20],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.line
                            x1={30 + Math.sin(i * 0.5) * 20}
                            y1={i * 20 + 10}
                            x2={30 + Math.sin(i * 0.5 + Math.PI) * 20}
                            y2={i * 20 + 10}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="1"
                            animate={{
                                x1: [30 + Math.sin(i * 0.5) * 20, 30 + Math.sin(i * 0.5 + Math.PI) * 20, 30 + Math.sin(i * 0.5) * 20],
                                x2: [30 + Math.sin(i * 0.5 + Math.PI) * 20, 30 + Math.sin(i * 0.5) * 20, 30 + Math.sin(i * 0.5 + Math.PI) * 20],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}

// Floating molecules
function FloatingMolecules() {
    const molecules = [
        { x: '80%', y: '20%', delay: 0, size: 40 },
        { x: '85%', y: '60%', delay: 1, size: 30 },
        { x: '70%', y: '80%', delay: 2, size: 35 },
    ];

    return (
        <>
            {molecules.map((mol, i) => (
                <motion.div
                    key={i}
                    className="absolute pointer-events-none opacity-20"
                    style={{ left: mol.x, top: mol.y }}
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    }}
                >
                    <svg width={mol.size} height={mol.size} viewBox="0 0 50 50">
                        <circle cx="25" cy="15" r="8" fill="#14b8a6" />
                        <circle cx="15" cy="35" r="6" fill="#8b5cf6" />
                        <circle cx="35" cy="35" r="6" fill="#06b6d4" />
                        <line x1="25" y1="15" x2="15" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                        <line x1="25" y1="15" x2="35" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                        <line x1="15" y1="35" x2="35" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    </svg>
                </motion.div>
            ))}
        </>
    );
}

export default function HeroSection({ onStart }) {
    return (
        <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Interactive particle canvas */}
            <ParticleCanvas />

            {/* DNA Helix decoration */}
            <DNAHelix />

            {/* Floating molecules */}
            <FloatingMolecules />

            {/* Hexagon grid pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                            <polygon
                                points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4"
                                fill="none"
                                stroke="#14b8a6"
                                strokeWidth="0.5"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hexagons)" />
                </svg>
            </div>

            {/* Glowing orbs */}
            <motion.div
                className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.1, 0.15] }}
                transition={{ duration: 6, repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 mb-8 backdrop-blur-sm"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        >
                            <Sparkles className="w-5 h-5 text-teal-400" />
                        </motion.div>
                        <span className="text-teal-300 font-medium">Interactive Science Learning</span>
                    </motion.div>

                    {/* Main title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-4"
                    >
                        <span className="block text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 leading-tight drop-shadow-2xl">
                            Perspective X
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl md:text-3xl text-slate-400 mb-6 font-light"
                    >
                        Step Into the Role
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        In science, every decision has consequences. Experience real-world scenarios,
                        make critical choices, and see how your scientific reasoning shapes outcomes.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={onStart}
                            size="lg"
                            className="relative bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white px-14 py-8 text-xl rounded-2xl shadow-2xl shadow-teal-500/30 border-0 overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <Play className="w-6 h-6" />
                                Begin Your Journey
                            </span>
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                >
                    {[
                        { value: '10', label: 'Scenarios' },
                        { value: '6', label: 'Roles' },
                        { value: '5', label: 'Science Strands' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-teal-400 to-emerald-600 mb-2">
                                {stat.value}
                            </div>
                            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-7 h-12 rounded-full border-2 border-slate-700 flex items-start justify-center p-2">
                    <motion.div
                        className="w-2 h-3 bg-gradient-to-b from-teal-400 to-emerald-400 rounded-full"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </section>
    );
}