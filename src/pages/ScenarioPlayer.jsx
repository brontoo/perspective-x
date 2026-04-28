import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS, ROLES } from '@/components/scenarios/scenarioData';
import { UAE_SCENARIOS } from '@/components/scenarios/uaeScenarioData';
import { X, Loader2, MapPin, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CinematicTitle from '@/components/scenario/CinematicTitle';
import CinematicVideoIntro from '@/components/scenario/CinematicVideoIntro';
import ScenarioIntro from '@/components/scenario/ScenarioIntro';
import SceneOne from '@/components/scenario/SceneOne';
import SceneTwo from '@/components/scenario/SceneTwo';
import DecisionImpact from '@/components/scenario/DecisionImpact';
import ExitTicket from '@/components/scenario/ExitTicket';
import ScenarioComplete from '@/components/scenario/ScenarioComplete';
import CompletionCertificate from '@/components/scenario/CompletionCertificate';
import { normalizeRoleThemeKey } from '@/components/scenario/scenarioHelpers';
import { evaluateScenarioOutcome } from '@/components/scenario/scenarioAnswerKey';

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
    processsafetyengineer: {
        bg: 'from-cyan-950 via-slate-950 to-blue-950',
        accent: 'from-cyan-500 to-blue-500',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        glow: 'shadow-cyan-500/20',
        location: '📍 ADNOC Gas Operations — Abu Dhabi, UAE',
        alert: '🧯 Pressure Alert — Engineering Review Required',
        alertColor: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
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

// ── Finite phase machine ───────────────────────────────────────
// 'title' auto-advances (fullscreen cinematic, no header)
// All phases after 'title' render inside the header/main layout
const PHASE_SEQUENCE = ['video', 'intro', 'scene1', 'scene2', 'impact', 'exit', 'complete'];

const PHASE_PROGRESS = {
    video:    5,
    intro:    15,
    scene1:   30,
    scene2:   55,
    impact:   70,
    exit:     85,
    complete: 100,
};

export default function ScenarioPlayer() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const scenarioId = params.get('scenario');

    // ── Core flow state ────────────────────────────────────────
    const [phase, setPhase] = useState('title');
    const [responses, setResponses] = useState({});
    const [scenarioResult, setScenarioResult] = useState(null);

    // ── Auth / profile state ───────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isTeacher, setIsTeacher] = useState(false);
    const [profileName, setProfileName] = useState(null);

    // ── UI state ───────────────────────────────────────────────
    const [showCertificate, setShowCertificate] = useState(false);
    const [attemptCount, setAttemptCount] = useState(1);

    // ── Video state (prevents double-fire) ────────────────────
    const videoCompletedRef = useRef(false);
    const [videoState, setVideoState] = useState('idle');

    const mainRef = useRef(null);
    const loadedOnceRef = useRef(false);

    // Scroll to top on every phase change
    useLayoutEffect(() => {
        const id = requestAnimationFrame(() => {
            if (mainRef.current) {
                mainRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
            } else {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            }
        });
        return () => cancelAnimationFrame(id);
    }, [phase]);

    // ── Scenario / role / theme lookup ─────────────────────────
    const baseScenario = SCENARIOS[scenarioId];
    const uaeScenario = UAE_SCENARIOS?.[scenarioId];
    const scenario = baseScenario ? { ...baseScenario, ...(uaeScenario || {}) } : null;
    const role = Object.values(ROLES).find((r) => r.scenarios.includes(scenarioId));
    const theme = ROLE_THEMES[normalizeRoleThemeKey(role?.id)] || DEFAULT_THEME;

    // ── Auth + profile loading ─────────────────────────────────
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

                const urlParams = new URLSearchParams(window.location.search);
                const isPreview = urlParams.get('preview') === 'true';
                setIsTeacher((profile?.role === 'teacher') || isPreview);

                if (!loadedOnceRef.current) {
                    loadedOnceRef.current = true;
                    videoCompletedRef.current = false;
                    setVideoState('idle');
                    setPhase('title');
                }

                setProfileName(profile?.full_name || profile?.name || null);
            } catch (e) {
                console.error('Error loading scenario data:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadData();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scenarioId]);

    // ── Phase transition handlers ──────────────────────────────

    const handleTitleComplete = useCallback(() => {
        setPhase('video');
    }, []);

    const handleVideoComplete = useCallback(() => {
        if (videoCompletedRef.current) return;
        videoCompletedRef.current = true;
        setVideoState('completed');
        setPhase('intro');
    }, []);

    const handleIntroStart = useCallback(() => {
        setPhase('scene1');
    }, []);

    const handleScene1Complete = useCallback((data) => {
        setResponses((prev) => ({ ...prev, scene1: data }));
        setPhase('scene2');
    }, []);

    const handleScene2Complete = useCallback((data) => {
        setResponses((prev) => ({ ...prev, scene2: data }));
        setPhase('impact');
    }, []);

    // Called only on SUCCESS path inside DecisionImpact
    const handleImpactComplete = useCallback((scene3Data) => {
        setResponses((prev) => ({ ...prev, scene3: scene3Data }));
        setPhase('exit');
    }, []);

    const handleExitTicketComplete = async (exitTicketData) => {
        const passed = Boolean(exitTicketData?.passed ?? (exitTicketData?.score >= 70));
        const result = {
            ...responses,
            exitTicket: { ...exitTicketData, passed },
            passed,
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

        setPhase('complete');
    };

    // Retry: back to Scene 1 (keeps video played, resets decisions)
    const handleRetry = useCallback(() => {
        setAttemptCount((prev) => prev + 1);
        setResponses((prev) => ({
            ...prev,
            scene1: undefined,
            scene2: undefined,
            scene3: undefined,
            exitTicket: undefined,
            passed: undefined,
        }));
        setScenarioResult(null);
        setPhase('scene1');
    }, []);

    // Rewatch: back to video intro, resets all decisions
    const handleRewatch = useCallback(() => {
        videoCompletedRef.current = false;
        setVideoState('idle');
        setAttemptCount((prev) => prev + 1);
        setResponses({});
        setScenarioResult(null);
        setPhase('video');
    }, []);

    // ── Teacher navigation ─────────────────────────────────────
    const phaseIndex = PHASE_SEQUENCE.indexOf(phase);

    const handleGoBack = () => {
        if (!isTeacher || phaseIndex <= 0) return;
        setPhase(PHASE_SEQUENCE[phaseIndex - 1]);
    };

    const handleGoForward = () => {
        if (!isTeacher || phaseIndex >= PHASE_SEQUENCE.length - 1) return;
        setPhase(PHASE_SEQUENCE[phaseIndex + 1]);
    };

    const getProgressPercentage = () => PHASE_PROGRESS[phase] ?? 0;

    // ── Early returns ──────────────────────────────────────────
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

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.bg} relative`}>
            {/* Subtle grid texture */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* ── TITLE phase: fullscreen overlay, no header ── */}
            <AnimatePresence>
                {phase === 'title' && (
                    <CinematicTitle
                        title={scenario.title}
                        subtitle={scenario.context?.substring(0, 100) + '...'}
                        character={scenario.character}
                        onComplete={handleTitleComplete}
                    />
                )}
            </AnimatePresence>

            {/* ── All subsequent phases: header + main layout ── */}
            {phase !== 'title' && (
                <>
                    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
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

                            {/* Progress bar */}
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
                                        👁️ Teacher Preview Mode — Full Access
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGoBack}
                                            disabled={phaseIndex <= 0}
                                            className="h-8 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs gap-1"
                                        >
                                            <SkipBack className="w-3 h-3" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGoForward}
                                            disabled={phaseIndex >= PHASE_SEQUENCE.length - 1}
                                            className="h-8 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs gap-1"
                                        >
                                            Next
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
                                key={phase}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* ─── FLOW CONTROLLER ────────────────────────────────────── */}

                                {phase === 'video' && (
                                    <CinematicVideoIntro
                                        scenarioId={scenarioId}
                                        isTeacher={isTeacher}
                                        videoState={videoState}
                                        onComplete={handleVideoComplete}
                                    />
                                )}

                                {phase === 'intro' && (
                                    <ScenarioIntro
                                        scenario={scenario}
                                        onStart={handleIntroStart}
                                        isTeacher={isTeacher}
                                        theme={theme}
                                    />
                                )}

                                {phase === 'scene1' && (
                                    <SceneOne
                                        scene={scenario.scenes[0]}
                                        scenarioId={scenarioId}
                                        scenarioTitle={scenario.title}
                                        onComplete={handleScene1Complete}
                                        isTeacher={isTeacher}
                                        theme={theme}
                                    />
                                )}

                                {phase === 'scene2' && (
                                    <SceneTwo
                                        scene={scenario.scenes[1]}
                                        scenarioId={scenarioId}
                                        scenarioTitle={scenario.title}
                                        onComplete={handleScene2Complete}
                                        isTeacher={isTeacher}
                                        theme={theme}
                                    />
                                )}

                                {phase === 'impact' && (
                                    <DecisionImpact
                                        scenario={scenario}
                                        scenarioId={scenarioId}
                                        consequenceKey={responses.scene2?.consequence}
                                        theme={theme}
                                        isTeacher={isTeacher}
                                        onComplete={handleImpactComplete}
                                        onRetry={handleRetry}
                                        onRewatch={handleRewatch}
                                    />
                                )}

                                {phase === 'exit' && (
                                    <ExitTicket
                                        exitTicket={scenario.exitTicket}
                                        scenarioTitle={scenario.title}
                                        theme={theme}
                                        onComplete={handleExitTicketComplete}
                                        isTeacher={isTeacher}
                                        missionResult={
                                            responses.scene2?.consequence
                                                ? evaluateScenarioOutcome(scenarioId, responses.scene2.consequence)
                                                : null
                                        }
                                    />
                                )}

                                {phase === 'complete' && (
                                    <ScenarioComplete
                                        scenario={scenario}
                                        responses={scenarioResult || responses}
                                        role={role}
                                        theme={theme}
                                        onShowCertificate={() => setShowCertificate(true)}
                                        onRetry={handleRetry}
                                        attemptCount={attemptCount}
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
