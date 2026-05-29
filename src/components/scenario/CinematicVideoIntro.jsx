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

// Scenarios that have a completed video file and should play it as a single
// uninterrupted intro (no generated slides, no speech synthesis).
const FULL_VIDEO_SCENARIOS = new Set(['water_contamination']);

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
const [showTranscript, setShowTranscript] = useState(false);

    // Real video player states
    const [useRealVideo, setUseRealVideo] = useState(false);

    // Full-video mode: play the real video as one complete intro with its own
    // audio, hiding all generated slide content and speech synthesis.
    const useFullVideo = useRealVideo && FULL_VIDEO_SCENARIOS.has(scenarioId);
    const [videoLoading, setVideoLoading] = useState(true);

    const isMountedRef = useRef(true);
    const progressTimerRef = useRef(null);
    const autoAdvanceTimerRef = useRef(null);
    const segmentTimerRef = useRef(null);
    const iosKeepAliveRef = useRef(null);
    const sceneCompleteRef = useRef({ visual: false, narration: false });
    const videoRef = useRef(null);

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

    // Probe if the real video file exists on server/public directory
    useEffect(() => {
        if (!scenarioId) return;

        setVideoLoading(true);
        setUseRealVideo(false);

        const videoSrc = `/videos/scenarios/${scenarioId}.mp4`;
        const videoProbe = document.createElement('video');
        
        let timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
                setUseRealVideo(false);
                setVideoLoading(false);
            }
            cleanup();
        }, 3000);

        const handleProbeCanPlay = () => {
            clearTimeout(timeoutId);
            if (isMountedRef.current) {
                setUseRealVideo(true);
                setVideoLoading(false);
            }
            cleanup();
        };

        const handleProbeError = () => {
            clearTimeout(timeoutId);
            if (isMountedRef.current) {
                setUseRealVideo(false);
                setVideoLoading(false);
            }
            cleanup();
        };

        const cleanup = () => {
            videoProbe.removeEventListener('canplaythrough', handleProbeCanPlay);
            videoProbe.removeEventListener('error', handleProbeError);
        };

        videoProbe.addEventListener('canplaythrough', handleProbeCanPlay);
        videoProbe.addEventListener('error', handleProbeError);
        videoProbe.src = videoSrc;
        videoProbe.load();

        return () => {
            clearTimeout(timeoutId);
            cleanup();
        };
    }, [scenarioId]);

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
        if (!isMountedRef.current || videoState === 'completed') return;

        if (useRealVideo) {
            const video = videoRef.current;
            if (!video) return;
            stopAllPlayback();
            setPlaybackState('playing');
            // Full-video mode: unmute by default so the video's own audio plays
            if (useFullVideo) {
                video.muted = isMuted;
            }
            video.play().catch(err => {
                console.warn("Video play failed:", err);
                setPlaybackState('paused');
            });
            return;
        }

        if (!currentScene) return;
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

        if (!isMuted && !useFullVideo && 'speechSynthesis' in window && text) {
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
    }, [useRealVideo, useFullVideo, currentScene, isMuted, selectedVoice, stopAllPlayback, checkCompletion, videoState]);

    const getSceneStartTime = useCallback((sceneIdx) => {
        const video = videoRef.current;
        if (!video || !video.duration || scenes.length === 0) return 0;
        const totalSceneDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
        let elapsed = 0;
        for (let i = 0; i < sceneIdx; i++) {
            elapsed += (scenes[i].duration / totalSceneDuration) * video.duration;
        }
        return elapsed;
    }, [scenes]);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video || !useRealVideo) return;

        const curTime = video.currentTime;
        const dur = video.duration;
        if (!dur) return;

        const curProgress = (curTime / dur) * 100;
        setProgress(curProgress);

        const totalSceneDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
        let elapsedThreshold = 0;
        let activeSceneIdx = 0;

        for (let i = 0; i < scenes.length; i++) {
            const sceneShare = (scenes[i].duration / totalSceneDuration) * dur;
            if (curTime >= elapsedThreshold && curTime <= elapsedThreshold + sceneShare) {
                activeSceneIdx = i;
                break;
            }
            elapsedThreshold += sceneShare;
        }

        if (activeSceneIdx !== currentSceneIndex) {
            setCurrentSceneIndex(activeSceneIdx);
        }

        const activeScene = scenes[activeSceneIdx];
        if (activeScene) {
            const segments = segmentNarration(activeScene.narration || '');
            if (segments.length > 0) {
                const sceneShare = (activeScene.duration / totalSceneDuration) * dur;
                const sceneElapsedTime = curTime - (elapsedThreshold - (activeScene.duration / totalSceneDuration) * dur);
                const segmentShare = sceneShare / segments.length;
                const activeSegmentIdx = Math.min(
                    Math.floor(sceneElapsedTime / segmentShare),
                    segments.length - 1
                );
                
                setSubtitleSegments(segments);
                setCurrentSegmentIndex(activeSegmentIdx >= 0 ? activeSegmentIdx : 0);
            }
        }
    }, [useRealVideo, scenes, currentSceneIndex]);

    const handleVideoEnded = useCallback(() => {
        if (!isMountedRef.current) return;
        setPlaybackState('complete');
        setProgress(100);
        setCurrentSceneIndex(scenes.length - 1);
    }, [scenes.length]);

    const goToNextScene = useCallback(() => {
        if (!isMountedRef.current) return;

        if (useRealVideo) {
            const video = videoRef.current;
            if (!video) return;
            if (!isLastScene) {
                const nextTime = getSceneStartTime(currentSceneIndex + 1);
                video.currentTime = nextTime;
                video.play().catch(() => {});
                setPlaybackState('playing');
            }
        } else {
            stopAllPlayback();
            setSubtitleSegments([]);
            setCurrentSegmentIndex(0);

            if (!isLastScene) {
                setCurrentSceneIndex(prev => prev + 1);
                setPlaybackState('idle');
            }
        }
    }, [useRealVideo, currentSceneIndex, isLastScene, stopAllPlayback, getSceneStartTime]);

    const goToPrevScene = useCallback(() => {
        if (!isMountedRef.current) return;

        if (useRealVideo) {
            const video = videoRef.current;
            if (!video) return;
            if (currentSceneIndex > 0) {
                const prevTime = getSceneStartTime(currentSceneIndex - 1);
                video.currentTime = prevTime;
                video.play().catch(() => {});
                setPlaybackState('playing');
            }
        } else {
            stopAllPlayback();
            setSubtitleSegments([]);
            setCurrentSegmentIndex(0);

            if (currentSceneIndex > 0) {
                setCurrentSceneIndex(prev => prev - 1);
                setPlaybackState('idle');
            }
        }
    }, [useRealVideo, currentSceneIndex, stopAllPlayback, getSceneStartTime]);

    const replayScene = useCallback(() => {
        if (!isMountedRef.current) return;

        if (useRealVideo) {
            const video = videoRef.current;
            if (video) {
                video.currentTime = 0;
                video.play().catch(() => {});
                setPlaybackState('playing');
            }
        } else {
            stopAllPlayback();
            setSubtitleSegments([]);
            setCurrentSegmentIndex(0);
            setPlaybackState('idle');

            setTimeout(() => {
                if (isMountedRef.current) playCurrentScene();
            }, 100);
        }
    }, [useRealVideo, stopAllPlayback, playCurrentScene]);

    const togglePlayPause = useCallback(() => {
        if (useRealVideo) {
            const video = videoRef.current;
            if (!video) return;
            if (playbackState === 'playing') {
                video.pause();
                setPlaybackState('paused');
            } else {
                video.play().catch(() => {});
                setPlaybackState('playing');
            }
        } else {
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
        }
    }, [useRealVideo, playbackState, playCurrentScene]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            if (useRealVideo) {
                if (videoRef.current) {
                    videoRef.current.muted = next;
                }
            } else {
                if (next && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
            }
            return next;
        });
    }, [useRealVideo]);

    const teacherSkip = useCallback(() => {
        if (!isTeacher) return;
        safeOnComplete();
    }, [isTeacher, safeOnComplete]);

    useEffect(() => {
        const canStart = useRealVideo ? (playbackState === 'idle' && currentScene) : (voiceReady && playbackState === 'idle' && currentScene);
        if (canStart) {
            const timer = setTimeout(() => {
                if (isMountedRef.current) playCurrentScene();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [useRealVideo, voiceReady, playbackState, currentSceneIndex, playCurrentScene, currentScene]);

    /* ── Error / empty state ─────────────────────────────────────────────────── */

    if (videoLoading) {
        return (
            <div className="fixed inset-0 z-50 lx-bg-ambient flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-[var(--lx-text-sub)] font-mono text-sm tracking-wider">
                        Initializing system...
                    </p>
                </div>
            </div>
        );
    }

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

            {/* Side accent lines */}
            <div className="absolute left-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent pointer-events-none z-10" />

            {/* ─── TOP STATUS BAR ──────────────────────────────────────────────── */}
            <div className="glass-nav relative z-10 flex items-center justify-between px-6 py-3 shrink-0">

                {/* Left: brand + phase label */}
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tracking-wider select-none">
                        Perspective X
                    </span>
                    <div className="w-px h-3 bg-[var(--lx-glass-border-sub)]" />
                    <span className="text-[10px] font-mono text-[var(--lx-accent)] tracking-wider select-none">
                        Story
                    </span>
                    {isTeacher && (
                        <>
                            <div className="w-px h-3 bg-[var(--lx-glass-border-sub)]" />
                            <span
                                className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 select-none"
                                style={{ borderRadius: '2px' }}
                            >
                                Preview
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
                                <div className="w-1 h-1 rounded-full bg-cyan-500" />
                                <span className="text-[9px] font-mono text-cyan-600 tracking-wider">Playing</span>
                            </motion.div>
                        )}
                        {playbackState === 'paused' && (
                            <motion.div key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-amber-400" />
                                <span className="text-[9px] font-mono text-amber-600 tracking-wider">Paused</span>
                            </motion.div>
                        )}
                        {playbackState === 'complete' && (
                            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] font-mono text-emerald-600 tracking-wider">Complete</span>
                            </motion.div>
                        )}
                        {playbackState === 'idle' && (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider">Loading</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="w-px h-3 bg-[var(--lx-glass-border-sub)]" />

                    {/* Scene counter */}
                    {!useFullVideo && (
                        <span className="text-[10px] font-mono text-[var(--lx-text-muted)] tabular-nums select-none tracking-wider">
                            {String(currentSceneIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(totalScenes).padStart(2, '0')}
                        </span>
                    )}

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
                        Skip Story
                    </button>
                </div>
            </div>

            {/* ─── CENTRAL VIDEO PANEL ─────────────────────────────────────────── */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-4 min-h-0">
                <div
                    className="relative w-full max-w-4xl h-full flex flex-col border border-cyan-500/15 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-md overflow-hidden"
                    style={{ borderRadius: '8px' }}
                >
                    {/* Real Video background */}
                    {useRealVideo && (
                        <div className={`absolute inset-0 z-0 ${useFullVideo ? 'z-20' : ''}`}>
                            <video
                                ref={videoRef}
                                src={`/videos/scenarios/${scenarioId}.mp4`}
                                className="w-full h-full object-cover"
                                onTimeUpdate={useFullVideo ? undefined : handleTimeUpdate}
                                onEnded={handleVideoEnded}
                                playsInline
                                muted={isMuted}
                            />
                        </div>
                    )}

                    {/* Top scene label bar — hidden in full-video mode */}
                    {!useFullVideo && (
                        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-[var(--lx-glass-border-sub)] bg-white/20">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                                <span className="text-[10px] font-mono text-cyan-700 tracking-wider truncate select-none">
                                    {currentScene?.visual || 'Story'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ── Main visual area ── */}
                    {!useFullVideo && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSceneIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex-1 flex flex-col items-center justify-center p-8 min-h-0 overflow-hidden relative z-10"
                        >
                            {useRealVideo ? (
                                /* ── Real Video mode overlay ── */
                                currentScene?.showData && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-lg overflow-hidden border border-cyan-500/15 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-cyan-500/15 bg-cyan-500/5">
                                            <BarChart3 className="w-4 h-4 text-cyan-600 shrink-0" />
                                            <span className="text-[11px] font-mono text-cyan-700 tracking-wider font-semibold">
                                                Evidence
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto p-3">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-cyan-500/15">
                                                        {currentScene.dataTable?.headers?.map((h, i) => (
                                                            <th
                                                                key={i}
                                                                className="text-left px-3 py-2 text-[10px] font-mono text-cyan-700 tracking-wider"
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
                                                            className="border-b border-slate-100 hover:bg-slate-50"
                                                        >
                                                            {row.map((cell, j) => (
                                                                <td
                                                                    key={j}
                                                                    className={`px-3 py-2 text-sm ${j === 0 ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}
                                                                >
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )
                            ) : (
                                /* ── Fallback slide mode ── */
                                !currentScene?.showData ? (
                                    /* ── Character / avatar scene ── */
                                    <>
                                        {/* Holographic avatar */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                            className="relative mb-6 shrink-0"
                                        >
                                            {/* Outer ring */}
                                            <div className="absolute -inset-3 rounded-3xl border border-cyan-500/15" />
                                            {/* Avatar box */}
                                            <div
                                                className="relative w-20 h-20 bg-white border border-slate-200 flex items-center justify-center text-4xl shadow-sm animate-none"
                                                style={{ borderRadius: '14px' }}
                                            >
                                                {character?.avatar || '🧑‍🔬'}
                                            </div>
                                        </motion.div>

                                        {/* Mission title */}
                                        <motion.h1
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25, duration: 0.45 }}
                                            className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-3 px-4"
                                        >
                                            {content?.title || 'Scenario Briefing'}
                                        </motion.h1>

                                        {/* Module label */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.45 }}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-500/20" />
                                            <span className="text-[10px] font-mono text-cyan-600 tracking-wider select-none font-semibold">
                                                Story Part {String(currentSceneIndex + 1).padStart(2, '0')}
                                            </span>
                                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-500/20" />
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
                                            className="border border-[var(--lx-glass-border-sub)] bg-[var(--lx-glass)] overflow-hidden shadow-sm"
                                            style={{ borderRadius: '6px' }}
                                        >
                                            <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[var(--lx-glass-border-sub)] bg-[var(--lx-glass)]/20">
                                                <BarChart3 className="w-4 h-4 text-cyan-600 shrink-0" />
                                                <span className="text-[11px] font-mono text-cyan-700 tracking-wider font-semibold">
                                                    Evidence
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto p-3">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-[var(--lx-glass-border-sub)]">
                                                            {currentScene.dataTable?.headers?.map((h, i) => (
                                                                <th
                                                                    key={i}
                                                                    className="text-left px-3 py-2 text-[10px] font-mono text-cyan-700 tracking-wider"
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
                                                                className="border-b border-slate-100 hover:bg-[var(--lx-glass-hover)]/20"
                                                            >
                                                                {row.map((cell, j) => (
                                                                    <td
                                                                        key={j}
                                                                        className={`px-3 py-2 text-sm ${j === 0 ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}
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
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                    )}

                    {/* Full-video mode: just show the video, no overlays */}
                    {useFullVideo && (
                        <div className="flex-1" />
                    )}
                </div>
            </div>

            {/* ─── BOTTOM CONTROLS + NARRATION ─────────────────────────────────── */}
            <div className="glass-nav relative z-10 shrink-0 border-t border-[var(--lx-glass-border-sub)]">

                {/* Progress bars */}
                <div className="px-6 pt-3 pb-2 space-y-1.5 border-b border-[var(--lx-glass-border-sub)]">
                    {/* Full-video mode: single continuous progress bar */}
                    {useFullVideo ? (
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider w-14 shrink-0 select-none">
                                Progress
                            </span>
                            <div className="glass-progress flex-1 h-[3px]" style={{ borderRadius: '2px' }}>
                                <div className="glass-progress-bar h-full transition-all duration-75" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tabular-nums w-7 text-right shrink-0 select-none">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    ) : (
                    <>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider w-9 shrink-0 select-none">
                            Scene
                        </span>
                        <div className="glass-progress flex-1 h-[3px]" style={{ borderRadius: '2px' }}>
                            <div className="glass-progress-bar h-full transition-all duration-75" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tabular-nums w-7 text-right shrink-0 select-none">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider w-9 shrink-0 select-none">
                            Total
                        </span>
                        <div className="glass-progress flex-1 h-[3px]" style={{ borderRadius: '2px' }}>
                            <div className="glass-progress-bar h-full transition-all duration-75" style={{ width: `${totalProgress}%`, background: 'var(--lx-accent-glow)' }} />
                        </div>
                        <span className="text-[9px] font-mono text-[var(--lx-text-muted)] tabular-nums w-7 text-right shrink-0 select-none">
                            {Math.round(totalProgress)}%
                        </span>
                    </div>
                    </>
                    )}
                </div>

                {/* Narration + controls row */}
                <div className="px-6 py-3 flex items-center gap-4">

                    {/* Character avatar + subtitle text — hidden in full-video mode */}
                    {!useFullVideo && (
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                            className="w-8 h-8 shrink-0 bg-[var(--lx-glass)] border border-[var(--lx-glass-border-sub)] flex items-center justify-center text-xl select-none"
                            style={{ borderRadius: '6px' }}
                        >
                            {character?.avatar || '🧑‍🔬'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-mono text-cyan-600 tracking-wider block mb-0.5 select-none">
                                {character?.name || 'Narrator'}
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
                    )}

                    {/* Full-video mode: spacer so controls push right */}
                    {useFullVideo && <div className="flex-1" />}

                    {/* Playback controls */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* Prev/Next scene — only in multi-scene mode */}
                        {!useFullVideo && (
                            <ControlBtn onClick={goToPrevScene} disabled={currentSceneIndex === 0} title="Previous scene">
                                <SkipBack className="w-3.5 h-3.5" />
                            </ControlBtn>
                        )}
                        <ControlBtn onClick={togglePlayPause} title={playbackState === 'playing' ? 'Pause' : 'Play'}>
                            {playbackState === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </ControlBtn>
                        <ControlBtn onClick={replayScene} title="Replay">
                            <RotateCcw className="w-3.5 h-3.5" />
                        </ControlBtn>
                        <ControlBtn onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'} active={isMuted}>
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </ControlBtn>
                        {/* Subtitles & transcript — only in generated-slide mode */}
                        {!useFullVideo && (
                            <>
                            <ControlBtn onClick={() => setShowSubtitles(s => !s)} title="Toggle subtitles" active={showSubtitles}>
                                <Subtitles className="w-3.5 h-3.5" />
                            </ControlBtn>
                            <ControlBtn onClick={() => setShowTranscript(t => !t)} title={showTranscript ? "Hide Transcript" : "Show Transcript"} active={showTranscript}>
                                {showTranscript ? "Hide Transcript" : "Show Transcript"}
                            </ControlBtn>
                            </>
                        )}
                    </div>

                    {/* Action button */}
                    <div className="shrink-0">

                        {/* Full-video mode: Skip Story + Start Mission only */}
                        {useFullVideo ? (
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={safeOnComplete}
                                    className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-3 py-2 border border-[var(--lx-glass-border-sub)] text-[var(--lx-text-sub)] hover:text-[var(--lx-text)] hover:border-[var(--lx-accent)]/40 glass-panel select-none"
                                    style={{ borderRadius: '4px' }}
                                >
                                    <SkipForward className="w-3 h-3" />
                                    Skip Story
                                </motion.button>
                                {playbackState === 'complete' && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={safeOnComplete}
                                        className="liquid-btn-accent relative overflow-hidden flex items-center gap-2 text-[10px] font-mono tracking-widest font-bold px-5 py-2.5 select-none"
                                        style={{ borderRadius: '4px' }}
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                                        />
                                        <Play className="w-3.5 h-3.5 fill-current shrink-0 relative z-10" />
                                        <span className="relative z-10">Start Mission</span>
                                    </motion.button>
                                )}
                            </div>
                        ) : (
                        <>
                        {/* Non-last scene: CONTINUE (disabled until scene completes for students) */}
                        {!isLastScene && (
                            <motion.button
                                whileHover={canAdvance ? { scale: 1.02 } : {}}
                                whileTap={canAdvance ? { scale: 0.99 } : {}}
                                onClick={canAdvance ? goToNextScene : undefined}
                                disabled={!canAdvance}
                                className={`flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-4 py-2.5 border transition-all select-none ${
                                    canAdvance
                                        ? 'liquid-btn-accent cursor-pointer'
                                        : 'bg-[var(--lx-glass)]/30 text-[var(--lx-text-muted)] border-[var(--lx-glass-border-sub)] cursor-not-allowed'
                                }`}
                                style={{ borderRadius: '4px' }}
                            >
                                Continue
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
                                            <span className="relative z-10">Start Mission</span>
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="waiting"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 text-[9px] font-mono text-[var(--lx-text-muted)] tracking-wider select-none"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-none mr-1" />
                                            Keep Watching
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                        </>
                        )}
                    </div>
                </div>
{showTranscript && !useFullVideo && (
    <div className="px-6 py-2 text-sm text-[var(--lx-text-sub)] bg-[var(--lx-glass)]/30 border-t border-[var(--lx-glass-border-sub)]">
        {subtitleSegments.join(' ')}
    </div>
)}
            </div>
        </div>
    );
}
