import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS, ROLES } from '@/components/scenarios/scenarioData';
import { UAE_SCENARIOS } from '@/components/scenarios/uaeScenarioData';
import { X, Loader2, Clock, Target, BookOpen, Play, MapPin, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CinematicTitle from '@/components/scenario/CinematicTitle';
import CinematicVideoIntro from '@/components/scenario/CinematicVideoIntro';
import SceneOne from '@/components/scenario/SceneOne';
import SceneTwo from '@/components/scenario/SceneTwo';
import SceneThree from '@/components/scenario/SceneThree';
import DecisionImpact from '@/components/scenario/DecisionImpact';
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

const PHASE = {
    TITLE: -2,
    VIDEO: -1,
    INTRO: 0,
    SCENE1: 1,
    SCENE2: 2,
    SCENE3: 3,
    IMPACT: 4,
    EXIT: 5,
    COMPLETE: 6,
};

export default function ScenarioPlayer() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const scenarioId = params.get('scenario');

    const [currentScene, setCurrentScene] = useState(PHASE.TITLE);
    const [responses, setResponses] = useState({});
    const [scenarioResult, setScenarioResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(null);
    const [user, setUser] = useState(null);
    const [isTeacher, setIsTeacher] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [profileName, setProfileName] = useState(null);
    const [videoState, setVideoState] = useState('idle');

    const videoCompletedRef = useRef(false);
    const currentSceneRef = useRef(currentScene);
    const mainRef = useRef(null);
    const loadedOnceRef = useRef(false);

    useEffect(() => {
        currentSceneRef.current = currentScene;
        console.log('📊 Scene updated:', currentScene);
    }, [currentScene]);

    useLayoutEffect(() => {
        const id = requestAnimationFrame(() => {
            if (mainRef.current) {
                mainRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
            } else {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            }
        });

        return () => cancelAnimationFrame(id);
    }, [currentScene]);

    const baseScenario = SCENARIOS[scenarioId];
    const uaeScenario = UAE_SCENARIOS?.[scenarioId];
    const scenario = baseScenario ? { ...baseScenario, ...(uaeScenario || {}) } : null;
    const role = Object.values(ROLES).find(r => r.scenarios.includes(scenarioId));
    const theme = ROLE_THEMES[role?.id] || DEFAULT_THEME;

    const advanceFrom = useCallback((expectedPhase, nextPhase) => {
        console.log(`[ADVANCE] Trying: ${expectedPhase} -> ${nextPhase}. Current: ${currentSceneRef.current}`);

        setCurrentScene(prev => {
            if (prev !== expectedPhase) {
                console.warn(`[BLOCKED] Expected ${expectedPhase} but current is ${prev}`);
                return prev;
            }
            console.log(`[SUCCESS] Moving to ${nextPhase}`);
            return nextPhase;
        });
    }, []);

    const handleTitleComplete = useCallback(() => {
        advanceFrom(PHASE.TITLE, PHASE.VIDEO);
    }, [advanceFrom]);

    const handleVideoComplete = useCallback(() => {
        if (videoCompletedRef.current || currentSceneRef.current !== PHASE.VIDEO) {
            console.log('🔒 Video complete blocked');
            return;
        }
        console.log('🎥 Video FINISHED');
        videoCompletedRef.current = true;
        setVideoState('completed'); // ✅ هذا الحل!
        advanceFrom(PHASE.VIDEO, PHASE.INTRO);
    }, [advanceFrom]);

    const handleStartScenario = useCallback(() => {
        console.log('🚀 Begin clicked - current:', currentSceneRef.current);

        if (currentSceneRef.current !== PHASE.INTRO) {
            console.warn('🚫 Begin blocked - wrong phase');
            return;
        }

        advanceFrom(PHASE.INTRO, PHASE.SCENE1);
    }, [advanceFrom]);

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            if (!scenario) {
                navigate('/');
                return;
            }

            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (cancelled) return;
                if (!currentUser) {
                    navigate('/login');
                    return;
                }

                setUser(currentUser);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (cancelled) return;

                // Check URL params first
                const params = new URLSearchParams(window.location.search);
                const isPreview = params.get('preview') === 'true';

                const isTeacherRole = profile?.role === 'teacher';
                setIsTeacher(isTeacherRole || isPreview);

                // Only reset phase state on FIRST load — never re-reset
                // if the user has already progressed past TITLE
                if (!loadedOnceRef.current) {
                    loadedOnceRef.current = true;
                    videoCompletedRef.current = false;
                    setVideoState('idle');
                    setCurrentScene(PHASE.TITLE);
                }

                setProfileName(profile?.full_name || profile?.name || null);

                const { data: progressData } = await supabase
                    .from('student_progress')
                    .select('*')
                    .eq('student_id', currentUser.id)
                    .is('scenario_id', null)
                    .maybeSingle();

                if (cancelled) return;
                if (progressData) setProgress(progressData);
            } catch (e) {
                console.error('Error loading data:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadData();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenarioId]);

    const handleSceneComplete = (sceneNum, response) => {
        setResponses(prev => ({ ...prev, [`scene${sceneNum}`]: response }));
        setCurrentScene(prev => prev + 1);
    };

    // After Scene 3 reveals consequence → go to IMPACT page
    const handleScene3Complete = (response) => {
        setResponses(prev => ({ ...prev, scene3: response }));
        setCurrentScene(PHASE.IMPACT);
    };

    // Impact page actions
    const handleImpactContinueToExit = () => setCurrentScene(PHASE.EXIT);

    const handleImpactRetryScene1 = () => {
        setResponses(prev => ({ ...prev, scene1: undefined, scene2: undefined, scene3: undefined }));
        setCurrentScene(PHASE.SCENE1);
    };

    const handleImpactReplayVideo = () => {
        videoCompletedRef.current = false;
        setVideoState('idle');
        setResponses(prev => ({ ...prev, scene1: undefined, scene2: undefined, scene3: undefined }));
        setCurrentScene(PHASE.VIDEO);
    };

    const handleGoBack = () => {
        if (!isTeacher) return;
        if (currentScene > PHASE.INTRO) {
            setCurrentScene(prev => prev - 1);
        }
    };

    const handleGoForward = () => {
        if (!isTeacher) return;
        if (currentScene < PHASE.COMPLETE) {
            setCurrentScene(prev => prev + 1);
        }
    };

    const handleExitTicketComplete = async (exitTicketData) => {
        const result = {
            ...responses,
            exitTicket: exitTicketData,
            passed: exitTicketData.score >= 70,
        };

        setScenarioResult(result);
        setResponses(result);

        if (!isTeacher && user) {
            try {
                const { data: existingRows } = await supabase
                    .from('student_progress')
                    .select('id')
                    .eq('student_id', user.id)
                    .eq('scenario_id', scenarioId)
                    .limit(1);

                const existing = existingRows?.[0];

                if (existing) {
                    await supabase
                        .from('student_progress')
                        .update({
                            answers: result,
                            score: exitTicketData.score,
                            completed_at: new Date().toISOString(),
                        })
                        .eq('id', existing.id);
                } else {
                    await supabase.from('student_progress').insert({
                        student_id: user.id,
                        scenario_id: scenarioId,
                        scenario_title: scenario.title,
                        answers: result,
                        score: exitTicketData.score,
                        completed_at: new Date().toISOString(),
                    });
                }
            } catch (e) {
                console.error('Error saving progress:', e);
            }
        }

        setCurrentScene(PHASE.COMPLETE);
    };

    const handleShowCertificate = () => setShowCertificate(true);

    if (!scenario) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">Scenario not found</p>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    const getProgressPercentage = () => Math.max(0, Math.min(100, ((currentScene + 2) / 8) * 100));

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.bg} relative`}>
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }}
            />

            <AnimatePresence>
                {currentScene === PHASE.TITLE && (
                    <CinematicTitle
                        title={scenario.title}
                        subtitle={scenario.context?.substring(0, 100) + '...'}
                        character={scenario.character}
                        onComplete={handleTitleComplete}
                    />
                )}
            </AnimatePresence>

            {currentScene > PHASE.TITLE && (
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

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        isTeacher
                                            ? navigate('/TeacherDashboard')
                                            : navigate(`/role-hub?role=${role?.id || ''}`)
                                    }
                                    className="text-slate-400 hover:text-white"
                                >
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
                                <div className="mt-2 flex items-center justify-between">
                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                        👁️ Teacher Preview Mode - Full Access
                                    </Badge>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGoBack}
                                            disabled={currentScene <= PHASE.INTRO}
                                            className="h-8 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs gap-1"
                                        >
                                            <SkipBack className="w-3 h-3" />
                                            Previous Scene
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGoForward}
                                            disabled={currentScene >= PHASE.COMPLETE}
                                            className="h-8 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs gap-1"
                                        >
                                            Next Scene
                                            <SkipForward className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    <main ref={mainRef} className="max-w-6xl mx-auto px-6 py-8 relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`phase-${currentScene}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {currentScene === PHASE.VIDEO && videoState !== 'completed' && (
                                    <motion.div
                                        key="video-intro"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <CinematicVideoIntro
                                            scenarioId={scenarioId}
                                            isTeacher={isTeacher}
                                            videoState={videoState}
                                            onComplete={handleVideoComplete}
                                        />
                                    </motion.div>
                                )}


                                {currentScene === PHASE.INTRO && (
                                    <ScenarioIntro
                                        scenario={scenario}
                                        theme={theme}
                                        onStart={handleStartScenario}
                                        isTeacher={isTeacher}
                                    />
                                )}

                                {currentScene === PHASE.SCENE1 && (
                                    <SceneOne
                                        scene={scenario.scenes[0]}
                                        scenarioId={scenarioId}
                                        scenarioTitle={scenario.title}
                                        theme={theme}
                                        onComplete={(r) => handleSceneComplete(1, r)}
                                        isTeacher={isTeacher}
                                    />
                                )}

                                {currentScene === PHASE.SCENE2 && (
                                    <SceneTwo
                                        scene={scenario.scenes[1]}
                                        scenarioTitle={scenario.title}
                                        theme={theme}
                                        onComplete={(r) => handleSceneComplete(2, r)}
                                        isTeacher={isTeacher}
                                    />
                                )}

                                {currentScene === PHASE.SCENE3 && (
                                    <SceneThree
                                        scene={scenario.scenes[2]}
                                        previousDecision={responses.scene2?.consequence}
                                        scenarioTitle={scenario.title}
                                        theme={theme}
                                        onComplete={handleScene3Complete}
                                        isTeacher={isTeacher}
                                    />
                                )}

                                {currentScene === PHASE.IMPACT && (() => {
                                    const consequenceKey = responses.scene2?.consequence;
                                    const scene3 = scenario.scenes[2];
                                    const rawConsequence = scene3?.consequences?.[consequenceKey]
                                        || scene3?.consequences?.[Object.keys(scene3?.consequences || {})[0]];
                                    const consequence = rawConsequence
                                        ? { ...rawConsequence, key: consequenceKey }
                                        : { key: consequenceKey };
                                    return (
                                        <DecisionImpact
                                            consequence={consequence}
                                            scenarioId={scenarioId}
                                            onContinueToExit={handleImpactContinueToExit}
                                            onRetryScene1={handleImpactRetryScene1}
                                            onReplayVideo={handleImpactReplayVideo}
                                            isTeacher={isTeacher}
                                            theme={theme}
                                        />
                                    );
                                })()}

                                {currentScene === PHASE.EXIT && (
                                    <ExitTicket
                                        exitTicket={scenario.exitTicket}
                                        scenarioTitle={scenario.title}
                                        theme={theme}
                                        onComplete={handleExitTicketComplete}
                                        isTeacher={isTeacher}
                                    />
                                )}

                                {currentScene === PHASE.COMPLETE && (
                                    <ScenarioComplete
                                        scenario={scenario}
                                        responses={scenarioResult || responses}
                                        role={role}
                                        theme={theme}
                                        onShowCertificate={handleShowCertificate}
                                    />
                                )}


                            </motion.div>
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
        >
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
                        <p className="text-slate-400 text-base">
                            {scenario.character?.title || scenario.role}
                        </p>
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
                        <div
                            key={i}
                            className={`p-4 rounded-2xl bg-slate-800/50 border ${theme.border} text-center`}
                        >
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
                            <span
                                key={i}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border ${theme.border} ${theme.text} bg-slate-800/50`}
                            >
                                {focus}
                            </span>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={onStart}
                    size="lg"
                    className={`w-full bg-gradient-to-r ${theme.accent} hover:opacity-90 py-7 text-lg font-bold rounded-2xl shadow-xl`}
                >
                    <Play className="w-5 h-5 mr-2" />
                    {isTeacher ? 'Preview Scenario' : 'Begin Scenario'}
                </Button>
            </div>
        </motion.div>
    );
}