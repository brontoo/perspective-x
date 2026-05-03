import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ROLES, SCENARIOS } from '@/components/scenarios/scenarioData';
import { ArrowLeft, Loader2, LayoutGrid, GitCommit, Lock, CheckCircle2, Play } from 'lucide-react';
import ScenarioCard from '@/components/scenario/ScenarioCard';
import ScenarioGrid from '@/components/scenario/ScenarioGrid';

export default function RoleHub() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const roleId = params.get('role');

    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scenarioSettings, setScenarioSettings] = useState({});
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'path'
    const intervalRef = useRef(null);

    const role = ROLES[roleId];

    useEffect(() => {
        if (!role) { navigate('/'); return; }

        loadProgress();

        // Polling كل 30 ثانية لجلب إعدادات المدرس
        intervalRef.current = setInterval(() => {
            fetchSettings();
        }, 30000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [roleId]);

    // جلب إعدادات السيناريوهات فقط (خفيف)
    const fetchSettings = async () => {
        try {
            const { data: settings } = await supabase
                .from('scenario_settings')
                .select('*');
            const settingsMap = {};
            settings?.forEach(s => { settingsMap[s.scenario_id] = s; });
            setScenarioSettings(settingsMap);
        } catch (e) {
            console.error('Error fetching settings:', e);
        }
    };

    const loadProgress = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            const { data: completedRows } = await supabase
                .from('student_progress')
                .select('scenario_id, score')
                .eq('student_id', user.id)
                .not('scenario_id', 'is', null);

            const completedScenarios = (completedRows || [])
                .filter(r => r.score >= 70)
                .map(r => r.scenario_id);

            const unlockedScenarios = [role.scenarios[0]];
            completedScenarios.forEach(scenarioId => {
                const idx = role.scenarios.indexOf(scenarioId);
                if (idx !== -1 && idx + 1 < role.scenarios.length) {
                    unlockedScenarios.push(role.scenarios[idx + 1]);
                }
            });

            setProgress({
                completed_scenarios: completedScenarios,
                unlocked_scenarios: [...new Set(unlockedScenarios)]
            });

            await fetchSettings();

        } catch (e) {
            console.error('Error loading progress:', e);
        } finally {
            setLoading(false);
        }
    };

    const isCompleted = (scenarioId) =>
        progress?.completed_scenarios?.includes(scenarioId) || false;

    const isUnlocked = (scenarioId) => {
        // المدرس يتحكم بالكامل — is_locked يأتي أولاً دائماً
        if (scenarioSettings[scenarioId]?.is_locked) return false;
        if (scenarioId === role?.scenarios[0]) return true;
        if (!progress) return false;
        if (progress.completed_scenarios?.includes(scenarioId)) return true;
        return progress.unlocked_scenarios?.includes(scenarioId);
    };

    const getScenarioStatus = (scenarioId) => {
        // is_locked يأتي أولاً دائماً
        if (scenarioSettings[scenarioId]?.is_locked) return 'locked';
        if (isCompleted(scenarioId)) return 'completed';
        if (isUnlocked(scenarioId)) return 'unlocked';
        return 'locked';
    };

    if (!role) return null;

    /* ── per-role light accent colours ── */
    const colorClasses = {
        emerald: { accent: 'text-emerald-700', border: 'border-emerald-200', chip: 'bg-emerald-50 border border-emerald-200 text-emerald-700', bar: 'bg-emerald-500' },
        purple:  { accent: 'text-purple-700',  border: 'border-purple-200',  chip: 'bg-purple-50  border border-purple-200  text-purple-700',  bar: 'bg-purple-500'  },
        blue:    { accent: 'text-blue-700',    border: 'border-blue-200',    chip: 'bg-blue-50    border border-blue-200    text-blue-700',    bar: 'bg-blue-500'    },
        amber:   { accent: 'text-amber-700',   border: 'border-amber-200',   chip: 'bg-amber-50   border border-amber-200   text-amber-700',   bar: 'bg-amber-500'   },
        red:     { accent: 'text-red-700',     border: 'border-red-200',     chip: 'bg-red-50     border border-red-200     text-red-700',     bar: 'bg-red-500'     },
        orange:  { accent: 'text-orange-700',  border: 'border-orange-200',  chip: 'bg-orange-50  border border-orange-200  text-orange-700',  bar: 'bg-orange-500'  },
        teal:    { accent: 'text-teal-700',    border: 'border-teal-200',    chip: 'bg-teal-50    border border-teal-200    text-teal-700',    bar: 'bg-teal-500'    },
        green:   { accent: 'text-green-700',   border: 'border-green-200',   chip: 'bg-green-50   border border-green-200   text-green-700',   bar: 'bg-green-500'   },
    };

    const colors = colorClasses[role.color] || colorClasses.emerald;

    const completedInRole = progress?.completed_scenarios?.filter(s => role.scenarios.includes(s)).length || 0;
    const roleProgress = Math.round((completedInRole / role.scenarios.length) * 100);

    return (
        <div className="min-h-screen lx-bg-ambient">

            {/* ── Sticky header ── */}
            <header className="sticky top-0 z-50 glass-nav">
                <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-[var(--lx-text-muted)] hover:text-[var(--lx-text)] text-[11px] font-mono tracking-widest uppercase transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        BACK_TO_ROLES
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* View toggle */}
                        <div className="flex glass-panel p-0.5 border border-[var(--lx-glass-border-sub)]" style={{ borderRadius: '6px' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 transition-all ${viewMode === 'grid' ? 'glass-card text-[var(--lx-accent)]' : 'text-[var(--lx-text-muted)] hover:text-[var(--lx-text-sub)]'}`}
                                style={{ borderRadius: '4px' }}
                                title="Grid view"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('path')}
                                className={`p-1.5 transition-all ${viewMode === 'path' ? 'glass-card text-[var(--lx-accent)]' : 'text-[var(--lx-text-muted)] hover:text-[var(--lx-text-sub)]'}`}
                                style={{ borderRadius: '4px' }}
                                title="Path view"
                            >
                                <GitCommit className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Difficulty chip */}
                        <span className={`glass-badge text-[10px] font-mono tracking-widest uppercase px-2.5 py-1`}>
                            {role.difficulty}
                        </span>
                    </div>
                </div>
            </header>

            {/* ── Role header ── */}
            <section className="border-b border-[var(--lx-glass-border-sub)] py-10 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card p-6 flex flex-col md:flex-row items-start gap-6"
                    >
                        {/* Role icon */}
                        <div className="glass-panel w-16 h-16 flex items-center justify-center text-4xl border border-[var(--lx-glass-border)] shrink-0"
                            style={{ borderRadius: '8px' }}>
                            {role.icon}
                        </div>

                        <div className="flex-1">
                            {/* HUD label */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1 h-1 rounded-full bg-[var(--lx-accent)]" />
                                <span className="text-[10px] font-mono text-[var(--lx-accent)] tracking-widest uppercase">
                                    SCENARIO_SELECTION_CHAMBER
                                </span>
                            </div>

                            <h1
                                className="text-3xl md:text-4xl font-bold text-[var(--lx-text)] mb-2"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                {role.title}
                            </h1>
                            <p className="text-[var(--lx-text-sub)] text-sm leading-relaxed mb-5 max-w-2xl">
                                {role.description}
                            </p>

                            {/* Progress bar */}
                            <div className="max-w-sm">
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-wider uppercase">
                                        ROLE PROGRESS
                                    </span>
                                    <span className={`text-[10px] font-mono font-semibold ${colors.accent}`}>
                                        {completedInRole}/{role.scenarios.length}
                                    </span>
                                </div>
                                <div className="glass-progress">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${roleProgress}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className={`glass-progress-bar ${colors.bar}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Scenarios section ── */}
            <section className="py-10 px-6 pb-20">
                <div className="max-w-6xl mx-auto">

                    {/* Section divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--lx-accent-glow)]" />
                        <span className="text-[10px] font-mono text-[var(--lx-accent)] tracking-widest uppercase px-3">
                            AVAILABLE_SCENARIOS :: {role.scenarios.length}_CHAMBERS
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--lx-accent-glow)]" />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-20 gap-3">
                            <Loader2 className="w-5 h-5 text-[var(--lx-accent)] animate-spin" />
                            <span className="text-[11px] font-mono text-[var(--lx-text-muted)] tracking-widest">
                                LOADING_CHAMBERS...
                            </span>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">

                            {viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <ScenarioGrid
                                        scenarioCount={role.scenarios.length}
                                        completedCount={completedInRole}
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            {role.scenarios.map((scenarioId, index) => {
                                                const scenario = SCENARIOS[scenarioId];
                                                if (!scenario) return null;
                                                const status = getScenarioStatus(scenarioId);
                                                return (
                                                    <ScenarioCard
                                                        key={scenarioId}
                                                        scenario={scenario}
                                                        status={status}
                                                        index={index}
                                                        roleColor={role.color}
                                                        settings={scenarioSettings[scenarioId]}
                                                        onClick={() => {
                                                            if (status !== 'locked') {
                                                                navigate(`/ScenarioPlayer?scenario=${scenarioId}`);
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </ScenarioGrid>
                                </motion.div>
                            ) : (

                                /* ── Path view ── */
                                <motion.div
                                    key="path"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    transition={{ duration: 0.25 }}
                                    className="relative flex flex-col items-center gap-10 py-8"
                                >
                                    {/* Vertical connecting line */}
                                    <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-[var(--lx-glass-border-sub)] via-[var(--lx-accent-glow)] to-[var(--lx-glass-border-sub)]" />

                                    {role.scenarios.map((scenarioId, index) => {
                                        const scenario = SCENARIOS[scenarioId];
                                        if (!scenario) return null;
                                        const status = getScenarioStatus(scenarioId);
                                        const isEven = index % 2 === 0;

                                        return (
                                            <motion.div
                                                key={scenarioId}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`relative w-full flex items-center gap-6 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                                            >
                                                {/* Card side */}
                                                <div className="flex-1 flex justify-center">
                                                    <div className="max-w-sm w-full">
                                                        <ScenarioCard
                                                            scenario={scenario}
                                                            status={status}
                                                            index={index}
                                                            roleColor={role.color}
                                                            settings={scenarioSettings[scenarioId]}
                                                            onClick={() => {
                                                                if (status !== 'locked') {
                                                                    navigate(`/ScenarioPlayer?scenario=${scenarioId}`);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Center node */}
                                                <div className="relative z-10 w-10 h-10 rounded-full glass-card border-2 border-[var(--lx-glass-border)] flex items-center justify-center">
                                                    {status === 'completed' ? (
                                                        <CheckCircle2 className="w-5 h-5 text-[var(--lx-success)]" />
                                                    ) : status === 'unlocked' ? (
                                                        <>
                                                            <div className="absolute inset-0 rounded-full bg-[var(--lx-accent)]/20 animate-ping" />
                                                            <Play className="w-4 h-4 text-[var(--lx-accent)] fill-[var(--lx-accent)]" />
                                                        </>
                                                    ) : (
                                                        <Lock className="w-4 h-4 text-[var(--lx-text-muted)]" />
                                                    )}
                                                </div>

                                                {/* Balance placeholder */}
                                                <div className="flex-1 hidden md:block" />
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </section>
        </div>
    );
}
