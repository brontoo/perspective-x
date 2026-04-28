import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, RotateCcw,
    AlertCircle, CheckCircle2, Subtitles, BarChart3, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScenarioVisual from './ScenarioVisual';
import { SCENARIOS } from '../scenarios/scenarioData';
import { UAE_VIDEO_CONTENT, UAE_SCENARIOS } from '../scenarios/uaeScenarioData';

// Legacy data removed.



const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

const DEFAULT_SCENE_DURATION = 5500;

const toDataPoints = (table) => {
    if (!table || !Array.isArray(table.rows)) return [];
    return table.rows.slice(0, 4).map((row) => ({
        label: String(row?.[0] ?? 'Metric'),
        value: String(row?.[1] ?? '-'),
        status: 'info',
        benchmark: row?.[2] ? String(row[2]) : undefined,
    }));
};

export const buildFallbackVideoContent = (scenarioId) => {
    const baseScenario = SCENARIOS?.[scenarioId];
    if (!baseScenario) return null;

    const uaeScenario = UAE_SCENARIOS?.[scenarioId];
    const sceneOne = baseScenario.scenes?.[0];
    const sceneTwo = baseScenario.scenes?.[1];
    const sceneThree = baseScenario.scenes?.[2];
    const sceneOneTable = sceneOne?.data?.table;
    const optionsPreview = (sceneTwo?.options || [])
        .slice(0, 2)
        .map((opt) => opt?.text)
        .filter(Boolean)
        .join(' or ');

    const scenes = [
        {
            visual: `Mission briefing: ${baseScenario.title}`,
            narration: baseScenario.context || `Welcome to ${baseScenario.title}.`,
            duration: DEFAULT_SCENE_DURATION,
        },
        {
            visual: sceneOne?.title || 'Scientific situation analysis',
            narration: sceneOne?.narrative || baseScenario.context || 'Review the available evidence and scientific context.',
            duration: DEFAULT_SCENE_DURATION,
            showData: Boolean(sceneOneTable),
            dataPoints: toDataPoints(sceneOneTable),
            dataTable: sceneOneTable || undefined,
        },
        {
            visual: sceneTwo?.title || 'Decision preparation',
            narration: sceneTwo?.question
                ? `Your decision point is approaching. ${sceneTwo.question}`
                : (optionsPreview
                    ? `Prepare to choose between scientifically grounded options such as ${optionsPreview}.`
                    : 'Prepare to make an evidence-based decision and justify your reasoning.'),
            duration: DEFAULT_SCENE_DURATION,
        },
        {
            visual: sceneThree?.title || 'Impact and reflection',
            narration: sceneThree?.followUpQuestion
                ? `Your choice leads to consequences. Reflect on this: ${sceneThree.followUpQuestion}`
                : 'Your choice will create measurable consequences. Be ready to evaluate impact and reflect on your reasoning.',
            duration: DEFAULT_SCENE_DURATION,
        },
    ];

    return {
        title: uaeScenario?.title || baseScenario.title,
        titleAr: uaeScenario?.titleAr,
        character: uaeScenario?.character || baseScenario.character || null,
        scenes,
    };
};

const normalizeScenes = (rawScenes) => {
    if (!Array.isArray(rawScenes)) return [];

    return rawScenes
        .filter(Boolean)
        .map((scene, idx) => ({
            visual: scene.visual || `Scenario briefing ${idx + 1}`,
            narration: scene.narration || 'Please review this part of the briefing before continuing.',
            duration: Number.isFinite(scene.duration) && scene.duration > 0 ? scene.duration : DEFAULT_SCENE_DURATION,
            showData: Boolean(scene.showData || scene.dataTable || (Array.isArray(scene.dataPoints) && scene.dataPoints.length > 0)),
            dataPoints: Array.isArray(scene.dataPoints) ? scene.dataPoints : [],
            dataTable: scene.dataTable,
        }));
};

const inferCharacterGender = (character) => {
    const explicitGender = character?.gender?.toLowerCase();
    if (explicitGender === 'female' || explicitGender === 'male') {
        return explicitGender;
    }

    const femaleAvatars = new Set(['👩‍🔬', '👩‍⚕️', '👩‍💻', '👷‍♀️', '👩‍🚀']);
    const maleAvatars = new Set(['👨‍🔬', '👨‍💼', '👨‍🚀']);

    if (femaleAvatars.has(character?.avatar)) return 'female';
    if (maleAvatars.has(character?.avatar)) return 'male';

    const identityText = `${character?.name || ''} ${character?.title || ''}`.toLowerCase();
    const femalePatterns = ['fatima', 'mariam', 'noura', 'aisha', 'reem', 'sheikha'];
    const malePatterns = ['ahmed', 'sultan', 'khalid', 'khaled', 'hamad', 'hazza'];

    if (femalePatterns.some((pattern) => identityText.includes(pattern))) return 'female';
    if (malePatterns.some((pattern) => identityText.includes(pattern))) return 'male';

    return null;
};

const getGenderMatchedVoice = (character, voices) => {
    if (!voices || voices.length === 0) return null;

    const inferredGender = inferCharacterGender(character);
    const isFemale = inferredGender === 'female';

    const femalePatterns = ['samantha', 'karen', 'moira', 'fiona', 'tessa', 'zoe', 'veena', 'female', 'woman', 'emma', 'aria', 'jenny', 'michelle', 'ava', 'victoria', 'susan', 'heather', 'zira'];
    const malePatterns = ['daniel', 'alex', 'fred', 'tom', 'lee', 'aaron', 'gordon', 'reed', 'male', 'man', 'david', 'james', 'guy', 'ryan', 'matthew', 'oliver', 'mark', 'george', 'john'];
    const patterns = isFemale ? femalePatterns : malePatterns;

    const englishVoices = voices.filter(v => {
        const lang = v.lang?.toLowerCase() || '';
        return lang.startsWith('en') && !lang.includes('ar');
    });

    const enUSVoices = englishVoices.filter(v => v.lang?.toLowerCase() === 'en-us');
    const findMatch = (list) => list.find(v => patterns.some(p => v.name?.toLowerCase().includes(p)));

    return (
        findMatch(enUSVoices) ||
        findMatch(englishVoices) ||
        englishVoices.find(v => (isFemale ? v.name === 'Samantha' : v.name === 'Daniel')) ||
        englishVoices.find(v => v.name === 'Samantha') ||
        enUSVoices[0] ||
        englishVoices[0] ||
        voices.find(v => v.default) ||
        voices[0] ||
        null
    );
};

export default function CinematicVideoIntro({
    scenarioId,
    onComplete,
    isTeacher = false,
    videoState = 'idle',
}) {
    const content = UAE_VIDEO_CONTENT[scenarioId] || buildFallbackVideoContent(scenarioId);
    const character = content?.character || UAE_SCENARIOS[scenarioId]?.character;

    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [playbackState, setPlaybackState] = useState('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [progress, setProgress] = useState(0);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [voiceReady, setVoiceReady] = useState(false);
    const [error, setError] = useState(null);
    const [subtitleSegments, setSubtitleSegments] = useState([]);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

    const isMountedRef = useRef(true);
    const progressTimerRef = useRef(null);
    const autoAdvanceTimerRef = useRef(null);
    const segmentTimerRef = useRef(null);
    const iosKeepAliveRef = useRef(null);
    const sceneCompleteRef = useRef({ visual: false, narration: false });

    const onCompleteCalledRef = useRef(false);
    const safeOnComplete = useCallback(() => {
        if (onCompleteCalledRef.current) return;
        onCompleteCalledRef.current = true;
        onComplete?.();
    }, [onComplete]);

    const scenes = normalizeScenes(content?.scenes);
    const currentScene = scenes[currentSceneIndex];
    const totalScenes = scenes.length;
    const isLastScene = currentSceneIndex === totalScenes - 1;

    const stopAllPlayback = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }

        if (segmentTimerRef.current) {
            clearInterval(segmentTimerRef.current);
            segmentTimerRef.current = null;
        }

        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;

        if (videoState === 'completed') {
            stopAllPlayback();
            return;
        }

        if (isIOS() && 'speechSynthesis' in window) {
            iosKeepAliveRef.current = setInterval(() => {
                if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000);
        }

        return () => {
            isMountedRef.current = false;
            stopAllPlayback();

            if (iosKeepAliveRef.current) {
                clearInterval(iosKeepAliveRef.current);
                iosKeepAliveRef.current = null;
            }
        };
    }, [stopAllPlayback, videoState]);

    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            setVoiceReady(true);
            return;
        }

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0 && isMountedRef.current) {
                setSelectedVoice(getGenderMatchedVoice(character, voices));
                setVoiceReady(true);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        const timeout = setTimeout(() => {
            if (isMountedRef.current) setVoiceReady(true);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [character]);

    const segmentNarration = (text) => {
        if (!text) return [];

        const raw = text.split(/(?<=[.!?,])\s+|(?<=\w{3,})\s+(?=\w)/g);
        const segments = [];
        let current = '';

        for (const chunk of raw) {
            const candidate = current ? `${current} ${chunk}` : chunk;

            if (candidate.trim().split(/\s+/).length > 12 && current) {
                segments.push(current.trim());
                current = chunk;
            } else {
                current = candidate;
            }
        }

        if (current.trim()) segments.push(current.trim());

        if (segments.length <= 1 && text.split(/\s+/).length > 12) {
            const words = text.split(/\s+/);
            const fallback = [];
            for (let i = 0; i < words.length; i += 10) {
                fallback.push(words.slice(i, i + 10).join(' '));
            }
            return fallback;
        }

        return segments.length ? segments : [text];
    };

    const handleSceneComplete = useCallback(() => {
        if (!isMountedRef.current) return;

        stopAllPlayback();
        setPlaybackState('complete');

        if (isLastScene) {
            autoAdvanceTimerRef.current = setTimeout(() => {
                if (!isMountedRef.current) return;
                safeOnComplete();
            }, 1200);
            return;
        }

        autoAdvanceTimerRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            setSubtitleSegments([]);
            setCurrentSegmentIndex(0);
            setCurrentSceneIndex(prev => prev + 1);
            setPlaybackState('idle');
        }, 1500);
    }, [isLastScene, stopAllPlayback, safeOnComplete]);

    const checkCompletion = useCallback(() => {
        if (sceneCompleteRef.current.visual && sceneCompleteRef.current.narration) {
            handleSceneComplete();
        }
    }, [handleSceneComplete]);

    const playCurrentScene = useCallback(() => {
        if (!currentScene || !isMountedRef.current || videoState === 'completed') return;

        stopAllPlayback();
        sceneCompleteRef.current = { visual: false, narration: false };
        setProgress(0);
        setCurrentSegmentIndex(0);
        setPlaybackState('playing');
        setError(null);

        const duration = currentScene.duration || 6000;
        const text = currentScene.narration || '';
        const segments = segmentNarration(text);

        setSubtitleSegments(segments);

        let elapsed = 0;
        progressTimerRef.current = setInterval(() => {
            if (!isMountedRef.current) {
                clearInterval(progressTimerRef.current);
                return;
            }

            elapsed += 50;
            setProgress(Math.min((elapsed / duration) * 100, 100));

            if (elapsed >= duration) {
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
                sceneCompleteRef.current.visual = true;
                checkCompletion();
            }
        }, 50);

        if (segments.length > 1) {
            const segDuration = duration / segments.length;
            let segIdx = 0;

            segmentTimerRef.current = setInterval(() => {
                if (!isMountedRef.current) {
                    clearInterval(segmentTimerRef.current);
                    return;
                }

                segIdx++;
                if (segIdx >= segments.length) {
                    clearInterval(segmentTimerRef.current);
                    segmentTimerRef.current = null;
                    setCurrentSegmentIndex(segments.length - 1);
                } else {
                    setCurrentSegmentIndex(segIdx);
                }
            }, segDuration);
        }

        if (!isMuted && 'speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();

            const speakUtterance = () => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.85;
                utterance.pitch = 1;
                utterance.volume = 1;
                utterance.lang = 'en-US';

                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                    utterance.lang = selectedVoice.lang || 'en-US';
                }

                let segmentBoundaries = null;
                if (segments.length > 1) {
                    let charIdx = 0;
                    segmentBoundaries = segments.map(seg => {
                        const start = charIdx;
                        charIdx += seg.length + 1;
                        return start;
                    });
                }

                utterance.onboundary = (e) => {
                    if (!isMountedRef.current || !segmentBoundaries || e.name !== 'word') return;

                    let seg = 0;
                    for (let i = segmentBoundaries.length - 1; i >= 0; i--) {
                        if (e.charIndex >= segmentBoundaries[i]) {
                            seg = i;
                            break;
                        }
                    }
                    setCurrentSegmentIndex(seg);
                };

                utterance.onend = () => {
                    if (isMountedRef.current) {
                        sceneCompleteRef.current.narration = true;
                        checkCompletion();
                    }
                };

                utterance.onerror = (e) => {
                    if (e.error !== 'interrupted') {
                        console.warn('Speech error:', e.error);
                    }
                    if (isMountedRef.current) {
                        sceneCompleteRef.current.narration = true;
                        checkCompletion();
                    }
                };

                window.speechSynthesis.speak(utterance);
            };

            if (isIOS()) {
                setTimeout(speakUtterance, 250);
            } else {
                speakUtterance();
            }
        } else {
            setTimeout(() => {
                if (isMountedRef.current) {
                    sceneCompleteRef.current.narration = true;
                    checkCompletion();
                }
            }, duration);
        }
    }, [currentScene, isMuted, selectedVoice, stopAllPlayback, checkCompletion, videoState]);

    const goToNextScene = useCallback(() => {
        if (!isMountedRef.current) return;

        stopAllPlayback();
        setSubtitleSegments([]);
        setCurrentSegmentIndex(0);

        if (!isLastScene) {
            setCurrentSceneIndex(prev => prev + 1);
            setPlaybackState('idle');
        }
    }, [isLastScene, stopAllPlayback]);

    const goToPrevScene = useCallback(() => {
        if (!isMountedRef.current) return;

        stopAllPlayback();
        setSubtitleSegments([]);
        setCurrentSegmentIndex(0);

        if (currentSceneIndex > 0) {
            setCurrentSceneIndex(prev => prev - 1);
            setPlaybackState('idle');
        }
    }, [currentSceneIndex, stopAllPlayback]);

    const replayScene = useCallback(() => {
        if (!isMountedRef.current) return;

        stopAllPlayback();
        setSubtitleSegments([]);
        setCurrentSegmentIndex(0);
        setPlaybackState('idle');

        setTimeout(() => {
            if (isMountedRef.current) playCurrentScene();
        }, 100);
    }, [stopAllPlayback, playCurrentScene]);

    const togglePlayPause = useCallback(() => {
        if (playbackState === 'playing') {
            if ('speechSynthesis' in window) window.speechSynthesis.pause();
            clearInterval(progressTimerRef.current);
            clearInterval(segmentTimerRef.current);
            setPlaybackState('paused');
        } else if (playbackState === 'paused') {
            if ('speechSynthesis' in window) window.speechSynthesis.resume();
            setPlaybackState('playing');
        } else {
            playCurrentScene();
        }
    }, [playbackState, playCurrentScene]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            if (!prev && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            return !prev;
        });
    }, []);

    const teacherSkip = useCallback(() => {
        if (!isTeacher) return;
        safeOnComplete();
    }, [isTeacher, safeOnComplete]);

    useEffect(() => {
        if (voiceReady && playbackState === 'idle' && currentScene) {
            const timer = setTimeout(() => {
                if (isMountedRef.current) playCurrentScene();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [voiceReady, playbackState, currentSceneIndex, playCurrentScene, currentScene]);

    if (!content || scenes.length === 0) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Scenario Not Found</p>
                <p className="text-slate-400 mb-4">Could not load scenario: {scenarioId}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                </Button>
            </div>
        );
    }

    const totalProgress = ((currentSceneIndex + progress / 100) / totalScenes) * 100;
    const canAdvance = playbackState === 'complete' || isTeacher;

    return (
        <div className="max-w-5xl mx-auto">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={
                            playbackState === 'playing'
                                ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                                : playbackState === 'complete'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : playbackState === 'paused'
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                        : 'bg-slate-600 text-slate-300'
                        }>
                            {playbackState === 'playing' && (
                                <>
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse mr-1" />
                                    Playing
                                </>
                            )}
                            {playbackState === 'complete' && (
                                <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Complete
                                </>
                            )}
                            {playbackState === 'paused' && (
                                <>
                                    <Pause className="w-3 h-3 mr-1" />
                                    Paused
                                </>
                            )}
                            {playbackState === 'idle' && 'Ready'}
                        </Badge>

                        {isTeacher && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                Teacher Preview
                            </Badge>
                        )}
                    </div>

                    <div className="text-slate-500 text-sm">
                        Scene {currentSceneIndex + 1} / {totalScenes}
                    </div>
                </div>

                {error && (
                    <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300 text-sm">{error}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={replayScene} className="text-amber-400">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retry
                        </Button>
                    </div>
                )}

                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSceneIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col"
                        >
                            {currentScene?.visual && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-6 py-2 bg-slate-900/70 border-b border-slate-700/40 flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                    <p className="text-xs text-slate-400 font-medium tracking-wide truncate">
                                        {currentScene.visual}
                                    </p>
                                </motion.div>
                            )}

                            <div className="flex items-center justify-center p-5 sm:p-8 min-h-[260px] sm:min-h-[340px]">
                                {!currentScene?.showData && (
                                    <ScenarioVisual
                                        scenarioId={scenarioId}
                                        sceneIndex={currentSceneIndex}
                                        showData={false}
                                        avatar={character?.avatar}
                                    />
                                )}

                                {currentScene?.showData && currentScene?.dataTable && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="w-full max-w-4xl"
                                    >
                                        <div className="bg-slate-800/95 rounded-2xl p-4 sm:p-6 border-2 border-teal-500/30 shadow-2xl shadow-teal-500/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                                    <BarChart3 className="w-5 h-5 text-teal-400" />
                                                </div>
                                                <h3 className="text-sm sm:text-base font-bold text-white">
                                                    Scientific Data Analysis
                                                </h3>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b-2 border-teal-500/30">
                                                            {currentScene.dataTable.headers?.map((h, i) => (
                                                                <th
                                                                    key={i}
                                                                    className="text-left py-2 px-3 text-teal-400 font-bold uppercase tracking-wide text-xs"
                                                                >
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentScene.dataTable.rows?.map((row, i) => (
                                                            <motion.tr
                                                                key={i}
                                                                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.12 }}
                                                            >
                                                                {row.map((cell, j) => (
                                                                    <td
                                                                        key={j}
                                                                        className={`py-2.5 px-3 text-sm ${j === 0 ? 'text-white font-semibold' : 'text-slate-300'}`}
                                                                    >
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {!isMuted && playbackState === 'playing' && (
                        <motion.div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800/80 backdrop-blur px-2.5 py-1.5 rounded-full">
                            <Volume2 className="w-3.5 h-3.5 text-teal-400 mr-1" />
                            {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                                <motion.div
                                    key={i}
                                    className="w-0.5 bg-teal-400 rounded-full"
                                    animate={{ height: [h, h + 5, h] }}
                                    transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.06 }}
                                    style={{ height: h }}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>

                <div className="bg-slate-950/90 border-t border-slate-700/50 px-4 py-3 min-h-[80px]">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-lg flex-shrink-0 shadow-lg shadow-teal-500/20">
                            {character?.avatar || '🧑‍🔬'}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-teal-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                                {character?.name || 'Narrator'}
                            </p>

                            {showSubtitles && (
                                <div className="space-y-1">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={currentSegmentIndex}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-sm sm:text-base text-white font-medium leading-relaxed"
                                        >
                                            {subtitleSegments[currentSegmentIndex] || currentScene?.narration?.split(/[.!?]/) || ''}
                                        </motion.p>
                                    </AnimatePresence>

                                    {subtitleSegments[currentSegmentIndex + 1] && (
                                        <p className="text-xs text-slate-500 truncate">
                                            {subtitleSegments[currentSegmentIndex + 1]}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-16">Scene</span>
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-16">Total</span>
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                    style={{ width: `${totalProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlayPause}
                                className="text-slate-400 hover:text-white"
                            >
                                {playbackState === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToPrevScene}
                                disabled={currentSceneIndex === 0}
                                className="text-slate-400 hover:text-white disabled:opacity-30"
                            >
                                <SkipBack className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={replayScene}
                                className="text-slate-400 hover:text-white"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className="text-slate-400 hover:text-white"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowSubtitles(s => !s)}
                                className={`${showSubtitles ? 'text-teal-400' : 'text-slate-400'} hover:text-white`}
                            >
                                <Subtitles className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            {!isTeacher && !isLastScene && (
                                <Button
                                    onClick={goToNextScene}
                                    disabled={!canAdvance}
                                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50"
                                >
                                    Continue
                                    <SkipForward className="w-4 h-4 ml-2" />
                                </Button>
                            )}

                            {isTeacher && (
                                <>
                                    {!isLastScene && (
                                        <Button
                                            onClick={goToNextScene}
                                            disabled={!canAdvance}
                                            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50"
                                        >
                                            Continue
                                        </Button>
                                    )}

                                    <Button
                                        onClick={teacherSkip}
                                        variant="outline"
                                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                    >
                                        {isLastScene ? 'Finish Intro' : 'Skip'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {!isTeacher && playbackState === 'playing' && (
                        <p className="text-center text-slate-500 text-sm mt-3">
                            🔒 Complete the narration to continue
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}