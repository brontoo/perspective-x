import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ROLES, SCENARIOS } from '@/components/scenarios/scenarioData';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ScenarioCard from '@/components/scenario/ScenarioCard';

export default function RoleHub() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const roleId = params.get('role');

    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scenarioSettings, setScenarioSettings] = useState({});
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

    const colorClasses = {
        emerald: { bg: 'from-emerald-900/50 to-slate-900', accent: 'text-emerald-400', border: 'border-emerald-500/30' },
        purple: { bg: 'from-purple-900/50 to-slate-900', accent: 'text-purple-400', border: 'border-purple-500/30' },
        blue: { bg: 'from-blue-900/50 to-slate-900', accent: 'text-blue-400', border: 'border-blue-500/30' },
        amber: { bg: 'from-amber-900/50 to-slate-900', accent: 'text-amber-400', border: 'border-amber-500/30' },
        red: { bg: 'from-red-900/50 to-slate-900', accent: 'text-red-400', border: 'border-red-500/30' },
        orange: { bg: 'from-orange-900/50 to-slate-900', accent: 'text-orange-400', border: 'border-orange-500/30' },
        teal: { bg: 'from-teal-900/50 to-slate-900', accent: 'text-teal-400', border: 'border-teal-500/30' },
        green: { bg: 'from-green-900/50 to-slate-900', accent: 'text-green-400', border: 'border-green-500/30' }
    };

    const colors = colorClasses[role.color] || colorClasses.emerald;

    return (
        <div className={`min-h-screen bg-gradient-to-br ${colors.bg}`}>
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Roles</span>
                    </Link>
                    <Badge className={`${colors.accent} bg-slate-800 border ${colors.border}`}>
                        {role.difficulty}
                    </Badge>
                </div>
            </header>

            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-start gap-8">
                        <div className="w-24 h-24 rounded-3xl bg-slate-800/50 flex items-center justify-center text-6xl border border-slate-700">
                            {role.icon}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{role.title}</h1>
                            <p className="text-xl text-slate-400 mb-6 leading-relaxed">{role.description}</p>
                            <div className="max-w-md">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Role Progress</span>
                                    <span className={colors.accent}>
                                        {progress?.completed_scenarios?.filter(s => role.scenarios.includes(s)).length || 0} / {role.scenarios.length} Scenarios
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((progress?.completed_scenarios?.filter(s => role.scenarios.includes(s)).length || 0) / role.scenarios.length) * 100}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Available Scenarios</h2>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    )}
                </div>
            </section>
        </div>
    );
}