import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS, ROLES } from '@/components/scenarios/scenarioData';
import { UAE_SCENARIOS } from '@/components/scenarios/uaeScenarioData';
import { X, Loader2, MapPin, SkipBack, SkipForward, Notebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CinematicTitle from '@/components/scenario/CinematicTitle';
import CinematicVideoIntro from '@/components/scenario/CinematicVideoIntro';
import ScenarioIntro from '@/components/scenario/ScenarioIntro';
import CharacterBriefing from '@/components/scenario/CharacterBriefing';
import SceneOne from '@/components/scenario/SceneOne';
import SceneTwo from '@/components/scenario/SceneTwo';
import ConsequenceViewer from '@/components/scenario/ConsequenceViewer';
import ReflectionPrompt from '@/components/scenario/ReflectionPrompt';
import ExitTicket from '@/components/scenario/ExitTicket';
import ScenarioComplete from '@/components/scenario/ScenarioComplete';
import CompletionCertificate from '@/components/scenario/CompletionCertificate';
import { normalizeRoleThemeKey, getBadgeLevel, getAdaptedScene } from '@/components/scenario/scenarioHelpers';
import { evaluateScenarioOutcome } from '@/components/scenario/scenarioAnswerKey';
import { normalizeScenario } from '@/data/scenarioSchema';
import { ROLE_THEMES, DEFAULT_THEME } from '@/lib/roleThemes';
import { useScenarioAudio } from '@/hooks/useScenarioAudio';
import { t as motionT } from '@/lib/motionPresets';
import StoryRecap from '@/components/scenario/StoryRecap';
import MissionNotebook from '@/components/scenario/MissionNotebook';

// ── Finite phase machine ───────────────────────────────────────
// 'title' auto-advances (fullscreen cinematic, no header)
// All phases after 'title' render inside the header/main layout
const PHASE_SEQUENCE = ['video', 'intro', 'recap', 'briefing', 'scene1', 'scene2', 'consequence', 'reflection', 'exit', 'complete'];

const PHASE_PROGRESS = {
    video:       5,
    intro:      15,
    recap:      20,
    briefing:   30,
    scene1:     45,
    scene2:     60,
    consequence:75,
    reflection: 85,
    exit:       95,
    complete:  100,
};

const STEPS = ['Story', 'Your Role', 'Evidence', 'Choice', 'Result', 'Reflection', 'Final Check', 'Complete'];

const getActiveStepIndex = (currentPhase) => {
    switch (currentPhase) {
        case 'video':
        case 'intro':
            return 0;
        case 'briefing':
            return 1;
        case 'scene1':
            return 2;
        case 'scene2':
            return 3;
        case 'consequence':
            return 4;
        case 'reflection':
            return 5;
        case 'exit':
            return 6;
        case 'complete':
            return 7;
        default:
            return -1;
    }
};

const PHASE_DEFAULTS = {
    video: {
        title: 'Story',
        helper: 'Watch the cinematic introduction to understand the scenario narrative.',
    },
    intro: {
        title: 'Story',
        helper: 'Review the background, curriculum standards, and timeframe for this mission.',
    },
    recap: {
        title: 'Story Recap',
        helper: 'Quick overview before you step into your role.',
    },
    briefing: {
        title: 'Your Role',
        helper: 'Study your character details, responsibilities, and stakes in this mission.',
    },
    scene1: {
        title: 'Evidence',
        helper: 'Examine the data table, logs, and telemetry to build your understanding.',
    },
    scene2: {
        title: 'Make Your Choice',
        helper: 'Evaluate the options and make a scientifically justified choice.',
    },
    consequence: {
        title: 'Result',
        helper: 'See the immediate outcome and scientific impact of your choice.',
    },
    reflection: {
        title: 'Reflection',
        helper: 'Reflect on how scientific principles explain the observed outcome.',
    },
    exit: {
        title: 'Final Check',
        helper: 'Demonstrate your learning by answering the evaluation questions.',
    },
    complete: {
        title: 'Complete',
        helper: 'Review your results, retry if needed, or claim your completion certificate.',
    }
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
    const [difficultyMode, setDifficultyMode] = useState('on-level');

    // ── UI state ───────────────────────────────────────────────
    const [showCertificate, setShowCertificate] = useState(false);
    const [attemptCount, setAttemptCount] = useState(1);
    const [notebookOpen, setNotebookOpen] = useState(false);

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
        playPhaseTransition();
     
    }, [phase]);

    // ── Scenario / role / theme lookup ─────────────────────────
    const baseScenario = SCENARIOS[scenarioId];
    const uaeScenario = UAE_SCENARIOS?.[scenarioId];
    const rawScenario = baseScenario ? { ...baseScenario, ...(uaeScenario || {}) } : null;
    const scenario = rawScenario ? normalizeScenario(rawScenario) : null;
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

                // Use simple module-level cache to prevent redundant profile fetches during rapid navigation
                if (!window.__scenarioPlayerCache) window.__scenarioPlayerCache = { profile: null, lastFetch: 0 };
                const cache = window.__scenarioPlayerCache;
                
                let profile = cache.profile;
                if (!profile || Date.now() - cache.lastFetch > 300000) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUser.id)
                        .single();
                    profile = data;
                    cache.profile = data;
                    cache.lastFetch = Date.now();
                }

                if (cancelled) return;

                setProfileName(profile?.full_name || profile?.name || null);

                // Fetch scenario settings
                const { data: setting } = await supabase
                    .from('scenario_settings')
                    .eq('scenario_id', scenarioId)
                    .maybeSingle();

                // Fetch student difficulty overrides
                const { data: feedbackOverrides } = await supabase
                    .from('teacher_feedback')
                    .select('*')
                    .eq('student_email', currentUser.email)
                    .eq('type', 'difficulty_override')
                    .order('created_at', { ascending: false });

                const studentOverride = feedbackOverrides?.find(f => f.scenario_id === scenarioId)
                    || feedbackOverrides?.find(f => f.scenario_id === 'all');

                const activeDifficulty = studentOverride?.message || setting?.difficulty_override || 'on-level';
                setDifficultyMode(activeDifficulty);

                const urlParams = new URLSearchParams(window.location.search);
                const isPreview = urlParams.get('preview') === 'true';
                setIsTeacher((profile?.role === 'teacher') || isPreview);

                if (!loadedOnceRef.current) {
                    loadedOnceRef.current = true;
                    videoCompletedRef.current = false;
                    setVideoState('idle');
                    setPhase('title');
                }
            } catch (e) {
                console.error('Error loading scenario data:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadData();
        return () => { cancelled = true; };
         
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
        setPhase('recap');
    }, []);

    const handleRecapContinue = useCallback(() => {
        setPhase('briefing');
    }, []);


    const handleBriefingComplete = useCallback(() => {
        setPhase('scene1');
    }, []);

    const handleScene1Complete = useCallback((data) => {
        setResponses((prev) => ({ ...prev, scene1: data }));
        setPhase('scene2');
    }, []);

    const handleScene2Complete = useCallback((data) => {
        setResponses((prev) => ({ ...prev, scene2: data }));
        setPhase('consequence');
    }, []);

    const handleConsequenceComplete = useCallback(() => {
        setPhase('reflection');
    }, []);

    const handleReflectionComplete = useCallback((reflectionAnswer) => {
        setResponses((prev) => ({ ...prev, reflection: reflectionAnswer }));
        setPhase('exit');
    }, []);

    const handleSaveNotebook = useCallback(async (notebookNotes) => {
        setResponses((prev) => {
            const next = { ...prev, notebook: notebookNotes };
            
            // Background save to Supabase
            if (!isTeacher && user && scenarioId) {
                supabase
                    .from('student_progress')
                    .select('id')
                    .eq('student_id', user.id)
                    .eq('scenario_id', scenarioId)
                    .limit(1)
                    .then(({ data: existingRows }) => {
                        const existing = existingRows?.[0];
                        if (existing) {
                            supabase
                                .from('student_progress')
                                .update({
                                    answers: next,
                                    completed_at: new Date().toISOString(),
                                })
                                .eq('id', existing.id)
                                .then(({ error }) => {
                                    if (error) console.error('Error auto-saving notebook:', error);
                                });
                        } else {
                            supabase
                                .from('student_progress')
                                .insert({
                                    student_id: user.id,
                                    scenario_id: scenarioId,
                                    scenario_title: scenario.title,
                                    answers: next,
                                    completed_at: new Date().toISOString(),
                                })
                                .then(({ error }) => {
                                    if (error) console.error('Error auto-saving notebook:', error);
                                });
                        }
                    });
            }
            
            return next;
        });
    }, [isTeacher, user, scenarioId, scenario?.title]);

    const handleExitTicketComplete = async (exitTicketData) => {
        const passed = Boolean(exitTicketData?.passed ?? (exitTicketData?.score >= 80));
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
            reflection: undefined,
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
            <div className="min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="hud-panel p-8 text-center">
                    <p className="text-[var(--lx-text-muted)] mb-4 font-mono text-sm">Scenario not found</p>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen lx-bg-ambient flex items-center justify-center">
                <div className="hud-panel p-5 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                    <span className="text-[11px] font-mono text-[var(--lx-text-muted)] tracking-widest">Loading...</span>
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
                    <header className="sticky top-0 z-40 glass-nav">
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
                                        <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                                            {scenario.badgeIcon}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="text-xl font-bold text-slate-800">{scenario.title}</h1>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold tracking-wider ${
                                                difficultyMode === 'beginner' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                                                difficultyMode === 'high-achievers' ? 'text-rose-600 bg-rose-50 border-rose-200' :
                                                'text-amber-600 bg-amber-50 border-amber-200'
                                            }`}>
                                                {difficultyMode === 'beginner' ? 'Guided Mode' :
                                                 difficultyMode === 'high-achievers' ? 'Challenge Mode' :
                                                 'Standard Mode'}
                                            </span>
                                        </div>
                                        <p className={`text-sm font-semibold ${theme.text}`}>
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
                                    className="text-[var(--lx-text-muted)] hover:text-slate-900"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Student Journey Steps */}
                            {phase !== 'title' && phase !== 'video' && (
                                <>
                                    {/* Desktop Stepper */}
                                    <div className="hidden md:flex items-center justify-between mb-4 mt-2 text-[11px] font-mono tracking-wider select-none bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                        {STEPS.map((stepText, idx) => {
                                            const activeIdx = getActiveStepIndex(phase);
                                            const isActive = activeIdx === idx;
                                            const isCompleted = activeIdx > idx;
                                            return (
                                                <div key={stepText} className="flex items-center gap-1.5 flex-1 justify-center last:flex-none">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                                                            isActive ? 'bg-[#14b8a6] text-white border-[#14b8a6] shadow-sm' :
                                                            isCompleted ? 'bg-emerald-500 text-white border-emerald-500' :
                                                            'bg-white text-slate-400 border-slate-200'
                                                        }`}>
                                                            {idx + 1}
                                                        </span>
                                                        <span className={`font-semibold ${
                                                            isActive ? 'text-slate-900 font-bold' : 
                                                            isCompleted ? 'text-emerald-600' : 
                                                            'text-slate-400'
                                                        }`}>
                                                            {stepText}
                                                        </span>
                                                    </div>
                                                    {idx < STEPS.length - 1 && (
                                                        <span className="text-slate-300 mx-auto font-sans font-normal">→</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Mobile step indicator */}
                                    <div className="flex md:hidden items-center justify-between mb-3 text-xs font-mono font-bold text-[#14b8a6] select-none">
                                        <span>Step {getActiveStepIndex(phase) + 1} of 8</span>
                                        <span className="text-slate-700">{STEPS[getActiveStepIndex(phase)] || ''}</span>
                                    </div>
                                </>
                            )}

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
                        {PHASE_DEFAULTS[phase] && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 bg-white border border-slate-200 p-4 rounded-xl shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#14b8a6]" />
                                    <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-700">
                                        Current Stage: {PHASE_DEFAULTS[phase].title}
                                    </span>
                                </div>
                                <p className="text-sm font-sans font-semibold text-slate-700 mt-1">
                                    {PHASE_DEFAULTS[phase].helper}
                                </p>
                            </motion.div>
                        )}
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

                                {phase === 'recap' && (
                                    <StoryRecap
                                        scenario={scenario}
                                        onContinue={handleRecapContinue}
                                        theme={theme}
                                    />
                                )}

                                {phase === 'briefing' && (
                                    <CharacterBriefing
                                        scenario={scenario}
                                        onNext={handleBriefingComplete}
                                        isTeacher={isTeacher}
                                    />
                                )}

                                {phase === 'scene1' && (
                                    <SceneOne
                                        scene={getAdaptedScene(scenario.scenes[0], difficultyMode)}
                                        scenarioId={scenarioId}
                                        scenarioTitle={scenario.title}
                                        onComplete={handleScene1Complete}
                                        isTeacher={isTeacher}
                                        theme={theme}
                                        difficultyMode={difficultyMode}
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

                                {phase === 'consequence' && (
                                    <ConsequenceViewer
                                        scenario={scenario}
                                        consequenceKey={responses.scene2?.consequence}
                                        onNext={handleConsequenceComplete}
                                        isTeacher={isTeacher}
                                        theme={theme}
                                    />
                                )}

                                {phase === 'reflection' && (
                                    <ReflectionPrompt
                                        scenario={scenario}
                                        onComplete={handleReflectionComplete}
                                        isTeacher={isTeacher}
                                        theme={theme}
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
                                                ? evaluateScenarioOutcome(scenarioId, responses.scene2.consequence, scenario)
                                                : null
                                        }
                                        scenarioId={scenarioId}
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

            {showCertificate && (() => {
                const percentage = scenarioResult?.exitTicket?.score ?? responses?.exitTicket?.score ?? 85;
                const activeResponses = scenarioResult || responses;
                const levelName = getBadgeLevel(
                    percentage,
                    activeResponses.scene2?.consequence,
                    activeResponses.scene2?.justification,
                    scenario.id,
                    difficultyMode
                );
                return (
                    <CompletionCertificate
                        studentName={profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                        scenarioTitle={scenario.title}
                        percentage={percentage}
                        completionDate={new Date().toISOString()}
                        badgeIcon={scenario.badgeIcon}
                        badge={scenario.badge}
                        badgeLevel={levelName}
                        onClose={() => setShowCertificate(false)}
                    />
                );
            })()}

            {/* Floating Notebook Toggle Button */}
            {phase !== 'title' && phase !== 'video' && phase !== 'intro' && phase !== 'recap' && phase !== 'briefing' && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setNotebookOpen(true)}
                    className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/50 shadow-2xl p-4 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                    <Notebook className="w-5 h-5 text-cyan-400" />
                     <span className="text-xs font-mono font-bold tracking-wider pr-1 hidden sm:inline">Notebook</span>
                </motion.button>
            )}

            {/* Mission Notebook Drawer/Panel */}
            {phase !== 'title' && phase !== 'video' && (
                <MissionNotebook
                    scenario={scenario}
                    responses={responses}
                    onSave={handleSaveNotebook}
                    isOpen={notebookOpen}
                    onClose={() => setNotebookOpen(false)}
                    currentPhase={phase}
                />
            )}
        </div>
    );
}
