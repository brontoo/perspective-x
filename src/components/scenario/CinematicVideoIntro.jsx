import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, RotateCcw,
    AlertCircle, CheckCircle2, Subtitles, BarChart3, RefreshCw, ChevronRight,
} from 'lucide-react';
import { SCENARIOS } from '../scenarios/scenarioData';
import { UAE_VIDEO_CONTENT, UAE_SCENARIOS } from '../scenarios/uaeScenarioData';

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

/* ── UI helpers ─────────────────────────────────────────────────────────────── */

function BlueprintGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <svg width="100%" height="100%">
                <defs>
                    <pattern id="cvi-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cvi-grid)" />
            </svg>
        </div>
    );
}

function ControlBtn({ onClick, disabled, title, active, children }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 border transition-colors select-none ${
                disabled
                    ? 'border-[var(--lx-glass-border-sub)] text-[var(--lx-text-muted)] cursor-not-allowed opacity-40 glass-panel'
                    : active
                    ? 'border-[var(--lx-accent)] bg-[var(--lx-accent-soft)] text-[var(--lx-accent)] glass-panel'
                    : 'glass-panel border-[var(--lx-glass-border-sub)] text-[var(--lx-text-sub)] hover:text-[var(--lx-text)] hover:border-[var(--lx-accent)]/40'
            }`}
            style={{ borderRadius: '4px' }}
        >
            {children}
        </button>
    );
}

/* ── Main component ─────────────────────────────────────────────────────────── */

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

        // Last scene: user must click BEGIN ANALYSIS — no auto-advance
        if (isLastScene) return;

        autoAdvanceTimerRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            setSubtitleSegments([]);
            setCurrentSegmentIndex(0);
            setCurrentSceneIndex(prev => prev + 1);
            setPlaybackState('idle');
        }, 1500);
    }, [isLastScene, stopAllPlayback]);

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

    /* ── Error / empty state ─────────────────────────────────────────────────── */

    if (!content || scenes.length === 0) {
        return (
            <div className="fixed inset-0 z-50 lx-bg-ambient flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-10 h-10 text-[var(--lx-text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--lx-text-sub)] font-medium mb-1">Scenario Not Found</p>
                    <p className="text-[var(--lx-text-muted)] text-sm mb-4">Could not load: {scenarioId}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="liquid-btn flex items-center gap-2 mx-auto text-sm px-4 py-2"
                        style={{ borderRadius: '4px' }}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    const totalProgress = ((currentSceneIndex + progress / 100) / totalScenes) * 100;
    const canAdvance = playbackState === 'complete' || isTeacher;

    /* ── Fullscreen cinematic render ────────────────────────────────────────── */

    return (
        <div className="fixed inset-0 z-50 lx-bg-ambient overflow-hidden flex flex-col">

            {/* Light blueprint grid overlay */}
            <BlueprintGrid />

            {/* Outer HUD corners */}
            <span className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-cyan-400/25 pointer-events-none z-20" />
            <span className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-cyan-400/25 pointer-events-none z-20" />
            <span className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-cyan-400/25 pointer-events-none z-20" />
            <span className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-cyan-400/25 pointer-events-none z-20" />

            {/* Side accent lines */}
            <div className="absolute left-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent pointer-events-none z-10" />

            {/* ─── TOP STATUS BAR ──────────────────────────────────────────────── */}
            <div className="glass-nav relative z-10 flex items-center justify-between px-6 py-3 shrink-0">

                {/* Left: brand + phase label */}
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-cyan-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                    />
                    <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase select-none">
                        PERSPECTIVE_X
                    </span>
                    <div className="w-px h-3 bg-[var(--lx-glass-border-sub)]" />
                    <span className="text-[10px] font-mono text-[var(--lx-accent)] tracking-widest uppercase select-none">
                        CINEMATIC_BRIEFING
                    </span>
                    {isTeacher && (
                        <>
                            <div className="w-px h-3 bg-[var(--lx-glass-border-sub)]" />
                            <span
                                className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 select-none"
                                style={{ borderRadius: '2px' }}
                            >
                                PREVIEW
                            </span>
                        </>
                    )}
                </div>

                {/* Right: playback status + scene counter + skip */}
                <div className="flex items-center gap-3">

                    {/* Playback status pill */}
                    <AnimatePresence mode="wait">
                        {playbackState === 'playing' && (
                            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                <motion.div className="w-1 h-1 rounded-full bg-cyan-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />
                                <span className="text-[9px] font-mono text-cyan-600 tracking-widest uppercase">PLAYING</span>
                            </motion.div>
                        )}
                        {playbackState === 'paused' && (
                            <motion.div key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-amber-400" />
                                <span className="text-[9px] font-mono text-amber-600 tracking-widest uppercase">PAUSED</span>
                            </motion.div>
                        )}
                        {playbackState === 'complete' && (
                            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] font-mono text-emerald-600 tracking-widest uppercase">COMPLETE</span>
                            </motion.div>
                        )}
                        {playbackState === 'idle' && (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-widest uppercase">LOADING</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="w-px h-3 bg-[var(--lx-glass-border-sub)]" />

                    {/* Scene counter */}
                    <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tabular-nums select-none tracking-wider">
                        {String(currentSceneIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(totalScenes).padStart(2, '0')}
                    </span>

                    {/* Skip — active for teacher only */}
                    <button
                        onClick={isTeacher ? teacherSkip : undefined}
                        disabled={!isTeacher}
                        className={`flex items-center gap-1.5 text-[10px] font-mono tracking-wider border px-2.5 py-1 transition-all select-none glass-panel ${
                            isTeacher
                                ? 'border-[var(--lx-glass-border-sub)] text-[var(--lx-text-sub)] hover:text-[var(--lx-text)] hover:border-[var(--lx-accent)]/40 cursor-pointer'
                                : 'border-[var(--lx-glass-border-sub)] text-[var(--lx-text-muted)] cursor-not-allowed opacity-50'
                        }`}
                        style={{ borderRadius: '3px' }}
                    >
                        <SkipForward className="w-3 h-3" />
                        SKIP
                    </button>
                </div>
            </div>

            {/* ─── CENTRAL VIDEO PANEL ─────────────────────────────────────────── */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-4 min-h-0">
                <div
                    className="relative w-full max-w-4xl h-full flex flex-col border border-[var(--lx-dark-glass-border)] bg-slate-900 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.35)] overflow-hidden"
                    style={{ borderRadius: '8px' }}
                >
                    {/* Dark blueprint grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="cvi-dark-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#cvi-dark-grid)" />
                        </svg>
                    </div>

                    {/* Cyan HUD corner brackets */}
                    <span className="absolute top-0 left-0 w-5 h-5 border-t-[2px] border-l-[2px] border-cyan-400/50 z-10" />
                    <span className="absolute top-0 right-0 w-5 h-5 border-t-[2px] border-r-[2px] border-cyan-400/50 z-10" />
                    <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[2px] border-l-[2px] border-cyan-400/50 z-10" />
                    <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[2px] border-r-[2px] border-cyan-400/50 z-10" />

                    {/* Scan line — plays while briefing is active */}
                    {playbackState === 'playing' && (
                        <motion.div
                            className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent pointer-events-none z-20"
                            initial={{ top: '0%' }}
                            animate={{ top: ['0%', '100%'] }}
                            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
                        />
                    )}

                    {/* Top scene label bar */}
                    <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-[var(--lx-dark-glass-border)] bg-[var(--lx-dark-glass)]/60">
                        <div className="flex items-center gap-2 min-w-0">
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"
                                animate={playbackState === 'playing' ? { opacity: [1, 0.3, 1] } : { opacity: 0.6 }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            />
                            <span className="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase truncate select-none">
                                {currentScene?.visual || 'MISSION_BRIEFING'}
                            </span>
                        </div>

                        {/* Audio waveform indicator */}
                        {!isMuted && playbackState === 'playing' && (
                            <div className="flex items-center gap-0.5 shrink-0 ml-3">
                                {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-0.5 bg-cyan-400/50 rounded-full"
                                        animate={{ height: [h, h + 4, h] }}
                                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.07 }}
                                        style={{ height: h }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Main visual area ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSceneIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex-1 flex flex-col items-center justify-center p-8 min-h-0 overflow-hidden"
                        >
                            {!currentScene?.showData ? (
                                /* ── Character / avatar scene ── */
                                <>
                                    {/* Holographic avatar */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                        className="relative mb-6 shrink-0"
                                    >
                                        {/* Pulsing glow */}
                                        <motion.div
                                            className="absolute -inset-4 rounded-3xl pointer-events-none"
                                            animate={{
                                                boxShadow: [
                                                    '0 0 24px -6px rgba(6,182,212,0.25)',
                                                    '0 0 48px -6px rgba(6,182,212,0.45)',
                                                    '0 0 24px -6px rgba(6,182,212,0.25)',
                                                ],
                                            }}
                                            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                        {/* Outer ring */}
                                        <div className="absolute -inset-3 rounded-3xl border border-cyan-500/15" />
                                        {/* Avatar box */}
                                        <div
                                            className="relative w-20 h-20 bg-slate-800 border-2 border-cyan-500/50 flex items-center justify-center text-4xl shadow-[inset_0_2px_12px_rgba(0,0,0,0.4)]"
                                            style={{ borderRadius: '14px' }}
                                        >
                                            {character?.avatar || '🧑‍🔬'}
                                        </div>
                                        {/* Corner marks */}
                                        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/60" />
                                        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/60" />
                                        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/60" />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/60" />
                                    </motion.div>

                                    {/* Mission title */}
                                    <motion.h1
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25, duration: 0.45 }}
                                        className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center mb-3 px-4"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        {content?.title || 'Mission Briefing'}
                                    </motion.h1>

                                    {/* Module label */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.45 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-500/40" />
                                        <span className="text-[10px] font-mono text-cyan-400/60 tracking-widest uppercase select-none">
                                            CLASSIFIED :: MODULE_{String(currentSceneIndex + 1).padStart(2, '0')}
                                        </span>
                                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-500/40" />
                                    </motion.div>
                                </>
                            ) : (
                                /* ── Data table scene ── */
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-full max-w-2xl"
                                >
                                    <div
                                        className="border border-[var(--lx-dark-glass-border)] bg-[var(--lx-dark-glass)] overflow-hidden"
                                        style={{ borderRadius: '6px' }}
                                    >
                                        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[var(--lx-dark-glass-border)] bg-[var(--lx-dark-glass)]/80">
                                            <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <span className="text-[11px] font-mono text-cyan-400 tracking-widest uppercase">
                                                Scientific Data Analysis
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto p-3">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-[var(--lx-dark-glass-border)]">
                                                        {currentScene.dataTable?.headers?.map((h, i) => (
                                                            <th
                                                                key={i}
                                                                className="text-left px-3 py-2 text-[10px] font-mono text-cyan-400 uppercase tracking-wider"
                                                            >
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentScene.dataTable?.rows?.map((row, i) => (
                                                        <motion.tr
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="border-b border-[var(--lx-dark-glass-border)] hover:bg-[var(--lx-dark-glass-hover)]/20"
                                                        >
                                                            {row.map((cell, j) => (
                                                                <td
                                                                    key={j}
                                                                    className={`px-3 py-2 text-sm ${j === 0 ? 'text-white font-medium' : 'text-slate-300'}`}
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
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── BOTTOM CONTROLS + NARRATION ─────────────────────────────────── */}
            <div className="glass-nav relative z-10 shrink-0 border-t border-[var(--lx-glass-border-sub)]">

                {/* Progress bars */}
                <div className="px-6 pt-3 pb-2 space-y-1.5 border-b border-[var(--lx-glass-border-sub)]">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider uppercase w-9 shrink-0 select-none">
                            SCENE
                        </span>
                        <div className="glass-progress flex-1 h-[3px]" style={{ borderRadius: '2px' }}>
                            <div className="glass-progress-bar h-full transition-all duration-75" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tabular-nums w-7 text-right shrink-0 select-none">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider uppercase w-9 shrink-0 select-none">
                            TOTAL
                        </span>
                        <div className="glass-progress flex-1 h-[3px]" style={{ borderRadius: '2px' }}>
                            <div className="glass-progress-bar h-full transition-all duration-75" style={{ width: `${totalProgress}%`, background: 'var(--lx-accent-glow)' }} />
                        </div>
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tabular-nums w-7 text-right shrink-0 select-none">
                            {Math.round(totalProgress)}%
                        </span>
                    </div>
                </div>

                {/* Narration + controls row */}
                <div className="px-6 py-3 flex items-center gap-4">

                    {/* Character avatar + subtitle text */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                            className="w-8 h-8 shrink-0 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)] flex items-center justify-center text-xl select-none"
                            style={{ borderRadius: '6px' }}
                        >
                            {character?.avatar || '🧑‍🔬'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-mono text-cyan-600 tracking-widest uppercase block mb-0.5 select-none">
                                {character?.name || 'NARRATOR'}
                            </span>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={`${currentSceneIndex}-${currentSegmentIndex}`}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -3 }}
                                    transition={{ duration: 0.18 }}
                                    className="text-sm text-[var(--lx-text)] font-medium leading-relaxed line-clamp-2"
                                >
                                    {showSubtitles
                                        ? (subtitleSegments[currentSegmentIndex] || currentScene?.narration?.split(/[.!?]/)[0] || '...')
                                        : <span className="text-[var(--lx-text-muted)] italic text-xs">Subtitles off</span>
                                    }
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Playback controls */}
                    <div className="flex items-center gap-1 shrink-0">
                        <ControlBtn onClick={goToPrevScene} disabled={currentSceneIndex === 0} title="Previous scene">
                            <SkipBack className="w-3.5 h-3.5" />
                        </ControlBtn>
                        <ControlBtn onClick={togglePlayPause} title={playbackState === 'playing' ? 'Pause' : 'Play'}>
                            {playbackState === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </ControlBtn>
                        <ControlBtn onClick={replayScene} title="Replay scene">
                            <RotateCcw className="w-3.5 h-3.5" />
                        </ControlBtn>
                        <ControlBtn onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'} active={isMuted}>
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </ControlBtn>
                        <ControlBtn onClick={() => setShowSubtitles(s => !s)} title="Toggle subtitles" active={showSubtitles}>
                            <Subtitles className="w-3.5 h-3.5" />
                        </ControlBtn>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0">

                        {/* Non-last scene: CONTINUE (disabled until scene completes for students) */}
                        {!isLastScene && (
                            <motion.button
                                whileHover={canAdvance ? { scale: 1.02 } : {}}
                                whileTap={canAdvance ? { scale: 0.98 } : {}}
                                onClick={canAdvance ? goToNextScene : undefined}
                                disabled={!canAdvance}
                                className={`flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-4 py-2.5 border transition-all select-none ${
                                    canAdvance
                                        ? 'liquid-btn-accent cursor-pointer'
                                        : 'bg-[var(--lx-glass)]/30 text-[var(--lx-text-muted)] border-[var(--lx-glass-border-sub)] cursor-not-allowed'
                                }`}
                                style={{ borderRadius: '4px' }}
                            >
                                CONTINUE
                                <ChevronRight className="w-3.5 h-3.5" />
                            </motion.button>
                        )}

                        {/* Last scene: BEGIN ANALYSIS appears when playback complete */}
                        {isLastScene && (
                            <div className="relative min-w-[160px] h-[38px] flex items-center justify-end">
                                <AnimatePresence mode="wait">
                                    {playbackState === 'complete' ? (
                                        <motion.button
                                            key="begin"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.25 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={safeOnComplete}
                                            className="liquid-btn-accent relative overflow-hidden flex items-center gap-2 text-[10px] font-mono tracking-widest font-bold px-5 py-2.5 select-none"
                                            style={{ borderRadius: '4px' }}
                                        >
                                            {/* Sheen sweep */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                                            />
                                            <Play className="w-3.5 h-3.5 fill-current shrink-0 relative z-10" />
                                            <span className="relative z-10">BEGIN_ANALYSIS</span>
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="waiting"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider select-none"
                                        >
                                            <motion.div
                                                className="w-1 h-1 rounded-full bg-[var(--lx-dark-glass-border)]"
                                                animate={{ opacity: [1, 0.3, 1] }}
                                                transition={{ duration: 1.2, repeat: Infinity }}
                                            />
                                            AWAITING_COMPLETE
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
