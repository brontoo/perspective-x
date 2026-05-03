import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
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
import MissionHUD from '@/components/scenario/MissionHUD';
import { normalizeRoleThemeKey } from '@/components/scenario/scenarioHelpers';
import { evaluateScenarioOutcome } from '@/components/scenario/scenarioAnswerKey';
import { ROLE_THEMES, DEFAULT_THEME } from '@/lib/roleThemes';
import { useScenarioAudio } from '@/hooks/useScenarioAudio';
import { t as motionT } from '@/lib/motionPresets';

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

    // Audio feedback on phase transitions
    useEffect(() => {
        if (phase === 'title' || phase === 'video') return;
        if (phase === 'complete') {
            // Delay until after the component mounts
            const id = setTimeout(playChamberUnlock, 600);
            return () => clearTimeout(id);
        }
        if (phase === 'impact') {
            // Will be overridden by DecisionImpact success/failure result
            return;
        }
        playPhaseTransition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    // ── Scenario / role / theme lookup ─────────────────────────
    const baseScenario = SCENARIOS[scenarioId];
    const uaeScenario = UAE_SCENARIOS?.[scenarioId];
    const scenario = baseScenario ? { ...baseScenario, ...(uaeScenario || {}) } : null;
    const role = useMemo(
        () => Object.values(ROLES).find((r) => r.scenarios.includes(scenarioId)),
        [scenarioId]
    );
    const theme = useMemo(
        () => ROLE_THEMES[normalizeRoleThemeKey(role?.id)] || DEFAULT_THEME,
        [role?.id]
    );

    // ── Audio ──────────────────────────────────────────────────
    const { playPhaseTransition, playChamberUnlock, playWarningAlarm, playBeep } =
        useScenarioAudio();

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
            <div className="dark min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="hud-panel p-8 text-center">
                    <p className="text-[var(--lx-text-muted)] mb-4 font-mono text-sm">Scenario not found</p>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dark min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="hud-panel p-5 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                    <span className="text-[11px] font-mono text-[var(--lx-text-muted)] tracking-widest">LOADING...</span>
                </div>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className={`min-h-screen relative ${phase === 'intro' ? 'lx-bg-ambient' : `bg-gradient-to-br ${theme.bg}`}`}>
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

            {/* ── VIDEO phase: fullscreen cinematic, no header ── */}
            <AnimatePresence>
                {phase === 'video' && (
                    <CinematicVideoIntro
                        scenarioId={scenarioId}
                        isTeacher={isTeacher}
                        videoState={videoState}
                        onComplete={handleVideoComplete}
                    />
                )}
            </AnimatePresence>

            {/* ── All subsequent phases: header + main layout ── */}
            {phase !== 'title' && phase !== 'video' && (
                <>
                    <header className="sticky top-0 z-40 glass-nav-dark">
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
                                    className="text-[var(--lx-text-muted)] hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Progress bar */}
                            <div className="glass-progress">
                                <motion.div
                                    className={`glass-progress-bar bg-gradient-to-r ${theme.accent}`}
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
                                transition={motionT.phase}
                            >
                                {/* ─── FLOW CONTROLLER ────────────────────────────────────── */}

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

            {/* ── Persistent mission HUD — visible across all phases except title ── */}
            <MissionHUD
                scenario={scenario}
                scenarioId={scenarioId}
                phase={phase}
                progressPct={getProgressPercentage()}
                hudColor={theme.hudColor}
                roleTitle={role?.title || scenario?.character?.title || scenario?.role}
            />
        </div>
    );
}
