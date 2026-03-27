
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { SCENARIOS, ROLES } from '@/components/scenarios/scenarioData';
import { UAE_SCENARIOS } from '@/components/scenarios/uaeScenarioData';
import { X, Loader2, Clock, Target, BookOpen, Play } from 'lucide-react';
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

            // جلب سجل التقدم العام (بدون scenario_id)
            const { data: progressData } = await supabase
                .from('student_progress')
                .select('*')
                .eq('student_id', currentUser.id)
                .is('scenario_id', null)
                .maybeSingle();

            if (progressData) {
                setProgress(progressData);
            }
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
                // ── 1. حفظ نتيجة هذا السيناريو ──
                const { data: existing } = await supabase
                    .from('student_progress')
                    .select('id')
                    .eq('student_id', user.id)
                    .eq('scenario_id', scenarioId)
                    .maybeSingle();

                if (existing) {
                    await supabase.from('student_progress')
                        .update({
                            answers: result,
                            score: exitTicketData.score,
                            completed_at: new Date().toISOString()
                        })
                        .eq('id', existing.id);
                } else {
                    await supabase.from('student_progress').insert({
                        student_id: user.id,
                        scenario_id: scenarioId,
                        scenario_title: scenario.title,
                        answers: result,
                        score: exitTicketData.score,
                        completed_at: new Date().toISOString()
                    });
                }

                // ── 2. تحديث سجل التقدم العام وفتح السيناريو التالي ──
                if (result.passed) {
                    const currentRole = Object.values(ROLES).find(r => r.scenarios.includes(scenarioId));
                    const currentIndex = currentRole?.scenarios.indexOf(scenarioId);
                    const nextScenarioId = currentRole?.scenarios[currentIndex + 1];

                    // جلب سجل التقدم العام (scenario_id = null)
                    const { data: overallRecord } = await supabase
                        .from('student_progress')
                        .select('*')
                        .eq('student_id', user.id)
                        .is('scenario_id', null)
                        .maybeSingle();

                    const prevCompleted = overallRecord?.completed_scenarios || [];
                    const prevUnlocked = overallRecord?.unlocked_scenarios || [];

                    const updatedCompleted = [...new Set([...prevCompleted, scenarioId])];
                    const updatedUnlocked = nextScenarioId
                        ? [...new Set([...prevUnlocked, nextScenarioId])]
                        : prevUnlocked;

                    if (overallRecord) {
                        await supabase.from('student_progress')
                            .update({
                                completed_scenarios: updatedCompleted,
                                unlocked_scenarios: updatedUnlocked
                            })
                            .eq('id', overallRecord.id);
                    } else {
                        await supabase.from('student_progress').insert({
                            student_id: user.id,
                            scenario_id: null,
                            completed_scenarios: updatedCompleted,
                            unlocked_scenarios: updatedUnlocked
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
    const role = Object.values(ROLES).find(r => r.scenarios.includes(scenarioId));

    return (
        <div className="min-h-screen bg-slate-950">

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
                    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
                        <div className="max-w-6xl mx-auto px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{scenario.badgeIcon}</span>
                                    <div>
                                        <h1 className="text-xl font-bold text-white">{scenario.title}</h1>
                                        <p className="text-sm text-slate-400">{scenario.character?.name || scenario.role}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon"
                                    onClick={() => navigate(`/role-hub?role=${role?.id || 'environmental_scientist'}`)}
                                    className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getProgressPercentage()}%` }}
                                    transition={{ duration: 0.3 }} />
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

                    <main className="max-w-6xl mx-auto px-6 py-8">
                        <AnimatePresence mode="wait">

                            {currentScene === -1 && (
                                <CinematicVideoIntro key="video" scenarioId={scenarioId}
                                    isTeacher={isTeacher} onComplete={() => setCurrentScene(0)} />
                            )}

                            {currentScene === 0 && (
                                <ScenarioIntro key="intro" scenario={scenario}
                                    onStart={() => setCurrentScene(1)} isTeacher={isTeacher} />
                            )}

                            {currentScene === 1 && (
                                <SceneOne key="scene1" scene={scenario.scenes[0]}
                                    scenarioTitle={scenario.title}
                                    onComplete={(r) => handleSceneComplete(1, r)}
                                    isTeacher={isTeacher} />
                            )}

                            {currentScene === 2 && (
                                <SceneTwo key="scene2" scene={scenario.scenes[1]}
                                    scenarioTitle={scenario.title}
                                    onComplete={(r) => handleSceneComplete(2, r)}
                                    isTeacher={isTeacher} />
                            )}

                            {currentScene === 3 && (
                                <SceneThree key="scene3" scene={scenario.scenes[2]}
                                    previousDecision={responses.scene2?.selectedOption}
                                    scenarioTitle={scenario.title}
                                    onComplete={(r) => { handleSceneComplete(3, r); setCurrentScene(4); }}
                                    isTeacher={isTeacher} />
                            )}

                            {currentScene === 4 && (
                                <ExitTicket key="exit" exitTicket={scenario.exitTicket}
                                    scenarioTitle={scenario.title}
                                    onComplete={handleExitTicketComplete}
                                    isTeacher={isTeacher} />
                            )}

                            {currentScene === 5 && (
                                <ScenarioComplete key="complete" scenario={scenario}
                                    responses={scenarioResult || responses}
                                    role={role}
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

// ── Scenario Intro ──
function ScenarioIntro({ scenario, onStart, isTeacher }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-8">

                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/30 to-emerald-500/30 flex items-center justify-center text-5xl border border-teal-500/30">
                        {scenario.character?.avatar || '🧑‍🔬'}
                    </div>
                    <div>
                        <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Role</p>
                        <h2 className="text-2xl font-bold text-white mb-1">{scenario.character?.name || 'Your Role'}</h2>
                        <p className="text-slate-400">{scenario.character?.title || scenario.role}</p>
                    </div>
                </div>

                {scenario.roleQuote && (
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border-l-4 border-teal-500">
                        <p className="text-slate-300 italic">"{scenario.roleQuote}"</p>
                    </div>
                )}

                {scenario.uaeContext && (
                    <div className="mb-6 bg-gradient-to-r from-teal-500/10 to-purple-500/10 rounded-xl p-4 border border-teal-500/20">
                        <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">🇦🇪 UAE Context</p>
                        <p className="text-slate-300 text-sm">{scenario.uaeContext}</p>
                    </div>
                )}

                <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{scenario.estimatedTime} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Target className="w-4 h-4" />
                        <span className="text-sm">{scenario.strand}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">{scenario.scienceFocus?.length || 4} concepts</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Science Focus</h3>
                    <div className="flex flex-wrap gap-2">
                        {scenario.scienceFocus?.map((focus, i) => (
                            <Badge key={i} variant="outline" className="border-slate-700 text-slate-300">
                                {focus}
                            </Badge>
                        ))}
                    </div>
                </div>

                <Button onClick={onStart} size="lg"
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 py-6 text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    {isTeacher ? 'Preview Scenario' : 'Begin Scenario'}
                </Button>
            </div>
        </motion.div>
    );
}