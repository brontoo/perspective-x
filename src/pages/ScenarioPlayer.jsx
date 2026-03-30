import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS, ROLES } from '@/components/scenarios/scenarioData';
import { UAE_SCENARIOS } from '@/components/scenarios/uaeScenarioData';
import { X, Loader2, Clock, Target, BookOpen, Play, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CinematicTitle from '@/components/scenario/CinematicTitle';
import CinematicVideoIntro from '@/components/scenario/CinematicVideoIntro';
import SceneOne from '@/components/scenario/SceneOne';
import SceneTwo from '@/components/scenario/SceneTwo';
import SceneThree from '@/components/scenario/SceneThree';
import ExitTicket from '@/components/scenario/ExitTicket';
import ScenarioComplete from '@/components/scenario/ScenarioComplete';
import CompletionCertificate from '@/components/scenario/CompletionCertificate';

// ── Role theme config ──────────────────────────────────────────
const ROLE_THEMES = {
    fertilizerengineer: {
        bg: 'from-amber-950 via-slate-950 to-orange-950',
        accent: 'from-amber-500 to-orange-500',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/20',
        location: '📍 ADNOC Distribution — Abu Dhabi, UAE',
        alert: '⛽ Holiday Weekend — High Demand Alert',
        alertColor: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    },
    environmentalscientist: {
        bg: 'from-emerald-950 via-slate-950 to-teal-950',
        accent: 'from-emerald-500 to-teal-500',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        location: '📍 Environmental Monitoring Station — UAE',
        alert: '🌿 Ecosystem Alert — Urgent Assessment',
        alertColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    },
    biomedicalresearcher: {
        bg: 'from-purple-950 via-slate-950 to-pink-950',
        accent: 'from-purple-500 to-pink-500',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
        location: '📍 Biomedical Research Lab — UAE University',
        alert: '🧬 Research Priority — Critical Case',
        alertColor: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    },
    spacemissionchemist: {
        bg: 'from-blue-950 via-slate-950 to-indigo-950',
        accent: 'from-blue-500 to-indigo-500',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
        location: '📍 Space Mission Control — Deep Space',
        alert: '🚀 Mission Critical — Crew Safety Alert',
        alertColor: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    },
    industrialchemist: {
        bg: 'from-red-950 via-slate-950 to-rose-950',
        accent: 'from-red-500 to-rose-500',
        border: 'border-red-500/30',
        text: 'text-red-400',
        glow: 'shadow-red-500/20',
        location: '📍 Chemical Manufacturing Plant — UAE',
        alert: '⚠️ Safety Alert — Immediate Action Required',
        alertColor: 'bg-red-500/10 border-red-500/30 text-red-300',
    },
    geologist: {
        bg: 'from-orange-950 via-slate-950 to-amber-950',
        accent: 'from-orange-500 to-amber-500',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/20',
        location: '📍 Geological Survey Site — UAE',
        alert: '🪨 Hazard Alert — Site Assessment Active',
        alertColor: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    },
    pharmaceuticalscientist: {
        bg: 'from-teal-950 via-slate-950 to-cyan-950',
        accent: 'from-teal-500 to-cyan-500',
        border: 'border-teal-500/30',
        text: 'text-teal-400',
        glow: 'shadow-teal-500/20',
        location: '📍 Pharmaceutical Lab — UAE',
        alert: '💊 Production Alert — Quality Control',
        alertColor: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
    },
    energyengineer: {
        bg: 'from-yellow-950 via-slate-950 to-amber-950',
        accent: 'from-yellow-500 to-amber-500',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/20',
        location: '📍 Energy Grid Control — UAE',
        alert: '⚡ Grid Alert — High Demand Active',
        alertColor: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    },
};

const DEFAULT_THEME = {
    bg: 'from-slate-900 via-slate-950 to-slate-900',
    accent: 'from-teal-500 to-emerald-500',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    glow: 'shadow-teal-500/20',
    location: '📍 Science Lab',
    alert: null,
    alertColor: '',
};

export default function ScenarioPlayer() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const scenarioId = params.get('scenario');

    const [currentScene, setCurrentScene] = useState(-2);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(null);
    const [user, setUser] = useState(null);
    const [isTeacher, setIsTeacher] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [scenarioResult, setScenarioResult] = useState(null);
    const [profileName, setProfileName] = useState(null);

    const baseScenario = SCENARIOS[scenarioId];
    const uaeScenario = UAE_SCENARIOS?.[scenarioId];
    const scenario = baseScenario ? { ...baseScenario, ...(uaeScenario || {}) } : null;
    const role = Object.values(ROLES).find(r => r.scenarios.includes(scenarioId));
    const theme = ROLE_THEMES[role?.id] || DEFAULT_THEME;

    useEffect(() => { loadData(); }, [scenarioId]);

    const loadData = async () => {
        if (!scenario) { navigate('/'); return; }
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) { navigate('/login'); return; }
            setUser(currentUser);

            const { data: profile } = await supabase
                .from('profiles').select('*').eq('id', currentUser.id).single();

            const teacher = profile?.user_type === 'teacher';
            setIsTeacher(teacher);
            if (teacher) setCurrentScene(0);
            setProfileName(profile?.full_name || profile?.name || null);

            const { data: progressData } = await supabase
                .from('student_progress')
                .select('*')
                .eq('student_id', currentUser.id)
                .is('scenario_id', null)
                .maybeSingle();

            if (progressData) setProgress(progressData);
        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSceneComplete = (sceneNum, response) => {
        setResponses(prev => ({ ...prev, [`scene${sceneNum}`]: response }));
        setCurrentScene(prev => prev + 1);
    };

    const handleExitTicketComplete = async (exitTicketData) => {
        const result = {
            ...responses,
            exitTicket: exitTicketData,
            passed: exitTicketData.score >= 70
        };
        setScenarioResult(result);
        setResponses(result);

        if (!isTeacher && user) {
            try {
                const { data: existing } = await supabase
                    .from('student_progress').select('id')
                    .eq('student_id', user.id).eq('scenario_id', scenarioId).maybeSingle();

                if (existing) {
                    await supabase.from('student_progress')
                        .update({ answers: result, score: exitTicketData.score, completed_at: new Date().toISOString() })
                        .eq('id', existing.id);
                } else {
                    await supabase.from('student_progress').insert({
                        student_id: user.id, scenario_id: scenarioId,
                        scenario_title: scenario.title, answers: result,
                        score: exitTicketData.score, completed_at: new Date().toISOString()
                    });
                }

                if (result.passed) {
                    const currentRole = Object.values(ROLES).find(r => r.scenarios.includes(scenarioId));
                    const currentIndex = currentRole?.scenarios.indexOf(scenarioId);
                    const nextScenarioId = currentRole?.scenarios[currentIndex + 1];

                    const { data: overallRecord } = await supabase
                        .from('student_progress').select('*')
                        .eq('student_id', user.id).eq('role_id', currentRole?.id)
                        .is('scenario_id', null).maybeSingle();

                    const prevCompleted = overallRecord?.completed_scenarios || [];
                    const prevUnlocked = overallRecord?.unlocked_scenarios || [];
                    const updatedCompleted = [...new Set([...prevCompleted, scenarioId])];
                    const updatedUnlocked = nextScenarioId
                        ? [...new Set([...prevUnlocked, nextScenarioId])] : prevUnlocked;

                    if (overallRecord) {
                        await supabase.from('student_progress')
                            .update({ completed_scenarios: updatedCompleted, unlocked_scenarios: updatedUnlocked })
                            .eq('id', overallRecord.id);
                    } else {
                        await supabase.from('student_progress').insert({
                            student_id: user.id, scenario_id: null, role_id: currentRole?.id,
                            completed_scenarios: updatedCompleted, unlocked_scenarios: updatedUnlocked
                        });
                    }
                }
            } catch (e) {
                console.error('Error saving progress:', e);
            }
        }
        setCurrentScene(5);
    };

    const handleShowCertificate = () => setShowCertificate(true);

    if (!scenario) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <p className="text-slate-400 mb-4">Scenario not found</p>
                <Button onClick={() => navigate('/')}>Return Home</Button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
    );

    const getProgressPercentage = () => Math.max(0, ((currentScene + 2) / 6) * 100);

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.bg} relative`}>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />

            <AnimatePresence>
                {currentScene === -2 && (
                    <CinematicTitle
                        title={scenario.title}
                        subtitle={scenario.context?.substring(0, 100) + '...'}
                        character={scenario.character}
                        onComplete={() => setCurrentScene(-1)}
                    />
                )}
            </AnimatePresence>

            {currentScene > -2 && (
                <>
                    {/* ── Header ── */}
                    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">

                        {/* Location + Alert Banner */}
                        {theme.alert && (
                            <div className={`border-b ${theme.alertColor} px-6 py-2 flex items-center justify-between text-xs font-semibold`}>
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {theme.location}
                                </span>
                                <span>{theme.alert}</span>
                            </div>
                        )}

                        <div className="max-w-6xl mx-auto px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.accent} p-0.5 shadow-lg ${theme.glow}`}>
                                        <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-2xl">
                                            {scenario.badgeIcon}
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-white">{scenario.title}</h1>
                                        <p className={`text-sm font-medium ${theme.text}`}>
                                            {scenario.character?.name || scenario.role}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon"
                                    onClick={() => isTeacher
                                        ? navigate('/TeacherDashboard')
                                        : navigate(`/role-hub?role=${role?.id || ''}`)
                                    }
                                    className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${theme.accent}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getProgressPercentage()}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                            </div>

                            {isTeacher && (
                                <div className="mt-2">
                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                        👁️ Teacher Preview Mode - Full Access
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* ── Main Content ── */}
                    <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                        <AnimatePresence mode="wait">

                            {currentScene === -1 && (
                                <CinematicVideoIntro key="video" scenarioId={scenarioId}
                                    isTeacher={isTeacher} onComplete={() => setCurrentScene(0)} />
                            )}

                            {currentScene === 0 && (
                                <ScenarioIntro key="intro" scenario={scenario} theme={theme}
                                    onStart={() => setCurrentScene(1)} isTeacher={isTeacher} />
                            )}

                            {currentScene === 1 && (
                                <SceneOne key="scene1" scene={scenario.scenes[0]}
                                    scenarioTitle={scenario.title} theme={theme}
                                    onComplete={(r) => handleSceneComplete(1, r)}
                                    isTeacher={isTeacher} />
                            )}

                            {currentScene === 2 && (
                                <SceneTwo key="scene2" scene={scenario.scenes[1]}
                                    scenarioTitle={scenario.title} theme={theme}
                                    onComplete={(r) => handleSceneComplete(2, r)}
                                    isTeacher={isTeacher} />
                            )}

                            {currentScene === 3 && (
                                <SceneThree key="scene3" scene={scenario.scenes[2]}
                                    previousDecision={responses.scene2?.selectedOption}
                                    scenarioTitle={scenario.title} theme={theme}
                                    onComplete={(r) => { handleSceneComplete(3, r); setCurrentScene(4); }}
                                    isTeacher={isTeacher} />
                            )}

                            {currentScene === 4 && (
                                <ExitTicket key="exit" exitTicket={scenario.exitTicket}
                                    scenarioTitle={scenario.title} theme={theme}
                                    onComplete={handleExitTicketComplete}
                                    isTeacher={isTeacher} />
                            )}

                            {currentScene === 5 && (
                                <ScenarioComplete key="complete" scenario={scenario}
                                    responses={scenarioResult || responses}
                                    role={role} theme={theme}
                                    onShowCertificate={handleShowCertificate} />
                            )}

                        </AnimatePresence>
                    </main>
                </>
            )}

            {showCertificate && (
                <CompletionCertificate
                    studentName={profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    scenarioTitle={scenario.title}
                    percentage={scenarioResult?.exitTicket?.score || 85}
                    completionDate={new Date().toISOString()}
                    badgeIcon={scenario.badgeIcon}
                    onClose={() => setShowCertificate(false)}
                />
            )}
        </div>
    );
}

// ── Scenario Intro ─────────────────────────────────────────────
function ScenarioIntro({ scenario, onStart, isTeacher, theme }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">

            <div className={`rounded-3xl border ${theme.border} bg-slate-900/60 backdrop-blur-sm p-8 shadow-2xl`}>

                {/* Avatar + Role */}
                <div className="flex items-center gap-6 mb-8">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${theme.accent} p-0.5 shadow-xl`}>
                        <div className="w-full h-full rounded-3xl bg-slate-900 flex items-center justify-center text-5xl">
                            {scenario.character?.avatar || '🧑‍🔬'}
                        </div>
                    </div>
                    <div>
                        <p className={`${theme.text} text-xs font-bold uppercase tracking-widest mb-1`}>Your Role</p>
                        <h2 className="text-3xl font-bold text-white mb-1">
                            {scenario.character?.name || 'Your Role'}
                        </h2>
                        <p className="text-slate-400 text-base">{scenario.character?.title || scenario.role}</p>
                    </div>
                </div>

                {/* Role Quote */}
                {scenario.roleQuote && (
                    <div className={`rounded-2xl p-5 mb-6 border-l-4 bg-slate-800/50 ${theme.border}`}>
                        <p className="text-slate-200 italic text-lg leading-relaxed">"{scenario.roleQuote}"</p>
                    </div>
                )}

                {/* UAE Context */}
                {scenario.uaeContext && (
                    <div className={`mb-6 rounded-2xl p-5 border bg-gradient-to-r from-slate-800/60 to-slate-900/60 ${theme.border}`}>
                        <p className={`${theme.text} text-xs font-bold uppercase tracking-widest mb-2`}>🇦🇪 UAE Context</p>
                        <p className="text-slate-300">{scenario.uaeContext}</p>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: <Clock className="w-5 h-5" />, label: 'Duration', value: `${scenario.estimatedTime} min` },
                        { icon: <Target className="w-5 h-5" />, label: 'Strand', value: scenario.strand },
                        { icon: <BookOpen className="w-5 h-5" />, label: 'Concepts', value: `${scenario.scienceFocus?.length || 4} topics` },
                    ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-2xl bg-slate-800/50 border ${theme.border} text-center`}>
                            <div className={`flex justify-center mb-2 ${theme.text}`}>{stat.icon}</div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-white font-bold text-sm">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Science Focus Tags */}
                <div className="mb-8">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Science Focus</p>
                    <div className="flex flex-wrap gap-2">
                        {scenario.scienceFocus?.map((focus, i) => (
                            <span key={i} className={`px-4 py-2 rounded-xl text-sm font-medium border ${theme.border} ${theme.text} bg-slate-800/50`}>
                                {focus}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <Button onClick={onStart} size="lg"
                    className={`w-full bg-gradient-to-r ${theme.accent} hover:opacity-90 py-7 text-lg font-bold rounded-2xl shadow-xl`}>
                    <Play className="w-5 h-5 mr-2" />
                    {isTeacher ? 'Preview Scenario' : 'Begin Scenario'}
                </Button>
            </div>
        </motion.div>
    );
}