import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Volume2, VolumeX, SkipForward, RotateCcw,
    AlertCircle, CheckCircle2, Loader2, Subtitles, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Timeline-based narration sync controller
class NarrationSyncController {
    constructor() {
        this.timeline = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isSynced = true;
        this.onSyncError = null;
        this.onProgress = null;
        this.onComplete = null;
    }

    setTimeline(timeline) {
        this.timeline = timeline.map((item, index) => ({
            ...item,
            index,
            startTime: item.startTime || 0,
            endTime: item.endTime || item.duration,
            narrationComplete: false,
            visualComplete: false
        }));
    }

    validateSync() {
        // Check all timeline items have matching narration
        const errors = [];
        this.timeline.forEach((item, i) => {
            if (!item.narration) {
                errors.push(`Scene ${i + 1}: Missing narration`);
            }
            if (!item.duration || item.duration <= 0) {
                errors.push(`Scene ${i + 1}: Invalid duration`);
            }
            if (item.dataPoints?.length > 0) {
                item.dataPoints.forEach((dp, j) => {
                    if (!dp.explanation) {
                        errors.push(`Scene ${i + 1}, Data ${j + 1}: Missing explanation`);
                    }
                });
            }
        });
        return { valid: errors.length === 0, errors };
    }

    getCurrentItem() {
        return this.timeline[this.currentIndex];
    }

    canAdvance() {
        const current = this.getCurrentItem();
        return current?.narrationComplete && current?.visualComplete;
    }

    markNarrationComplete() {
        if (this.timeline[this.currentIndex]) {
            this.timeline[this.currentIndex].narrationComplete = true;
        }
    }

    markVisualComplete() {
        if (this.timeline[this.currentIndex]) {
            this.timeline[this.currentIndex].visualComplete = true;
        }
    }

    advance() {
        if (this.canAdvance() && this.currentIndex < this.timeline.length - 1) {
            this.currentIndex++;
            return true;
        }
        return false;
    }

    reset() {
        this.currentIndex = 0;
        this.timeline.forEach(item => {
            item.narrationComplete = false;
            item.visualComplete = false;
        });
    }
}

// Voice selection based on character gender
const getVoiceForCharacter = (character, voices) => {
    const isFemale = character?.gender === 'female' ||
        ['fatima', 'mariam', 'noura', 'shaikha', 'reem'].some(name =>
            character?.name?.toLowerCase().includes(name)
        );

    // Priority: Arabic voices > English voices matching gender
    const arabicVoices = voices.filter(v => v.lang.includes('ar'));
    const englishVoices = voices.filter(v => v.lang.includes('en'));

    // Try to match gender
    const genderFilter = (v) => {
        const voiceName = v.name.toLowerCase();
        if (isFemale) {
            return voiceName.includes('female') || voiceName.includes('woman') ||
                voiceName.includes('zira') || voiceName.includes('samantha') ||
                voiceName.includes('karen') || voiceName.includes('moira') ||
                voiceName.includes('fiona') || voiceName.includes('victoria');
        } else {
            return voiceName.includes('male') || voiceName.includes('man') ||
                voiceName.includes('david') || voiceName.includes('daniel') ||
                voiceName.includes('james') || voiceName.includes('alex');
        }
    };

    // Try Arabic first
    let voice = arabicVoices.find(genderFilter) || arabicVoices[0];

    // Fallback to English
    if (!voice) {
        voice = englishVoices.find(genderFilter) ||
            englishVoices.find(v => v.name.includes('Google')) ||
            englishVoices[0] ||
            voices[0];
    }

    return voice;
};

// Main synchronized video component
export default function NarrationSyncEngine({
    scenarioId,
    videoContent,
    character,
    isTeacher = false,
    onComplete,
    onError
}) {
    const [currentScene, setCurrentScene] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [progress, setProgress] = useState(0);
    const [narrationProgress, setNarrationProgress] = useState(0);
    const [syncStatus, setSyncStatus] = useState('ready'); // ready, playing, syncing, error, complete
    const [syncError, setSyncError] = useState(null);
    const [canSkip, setCanSkip] = useState(false);
    const [highlightedWords, setHighlightedWords] = useState([]);
    const [currentWord, setCurrentWord] = useState(0);
    const [voiceLoaded, setVoiceLoaded] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState(null);

    const syncController = useRef(new NarrationSyncController());
    const speechRef = useRef(null);
    const timerRef = useRef(null);
    const wordTimerRef = useRef(null);

    const scenes = videoContent?.scenes || [];
    const scene = scenes[currentScene];

    // Initialize voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis?.getVoices() || [];
            if (voices.length > 0) {
                const voice = getVoiceForCharacter(character, voices);
                setSelectedVoice(voice);
                setVoiceLoaded(true);
            }
        };

        loadVoices();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            clearInterval(timerRef.current);
            clearInterval(wordTimerRef.current);
        };
    }, [character]);

    // Initialize timeline
    useEffect(() => {
        if (scenes.length > 0) {
            syncController.current.setTimeline(scenes);
            const validation = syncController.current.validateSync();
            if (!validation.valid) {
                console.warn('Sync validation warnings:', validation.errors);
            }
        }
    }, [scenes]);

    // Word-by-word highlighting
    const startWordHighlighting = useCallback((text) => {
        const words = text.split(/\s+/);
        setHighlightedWords(words);
        setCurrentWord(0);

        const avgWordDuration = (scene?.duration || 5000) / words.length;

        wordTimerRef.current = setInterval(() => {
            setCurrentWord(prev => {
                if (prev >= words.length - 1) {
                    clearInterval(wordTimerRef.current);
                    return prev;
                }
                return prev + 1;
            });
        }, avgWordDuration);
    }, [scene?.duration]);

    // Speak with synchronization
    const speakWithSync = useCallback((text, onEnd) => {
        if (!('speechSynthesis' in window) || isMuted) {
            // If muted or no speech synthesis, wait for visual duration
            setTimeout(onEnd, scene?.duration || 5000);
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
            setSyncStatus('playing');
            startWordHighlighting(text);
        };

        utterance.onend = () => {
            syncController.current.markNarrationComplete();
            clearInterval(wordTimerRef.current);
            setHighlightedWords([]);
            onEnd?.();
        };

        utterance.onerror = (e) => {
            console.error('Speech error:', e);
            setSyncStatus('error');
            setSyncError('Voice narration failed. Retrying...');
            // Auto-retry after 1 second
            setTimeout(() => {
                setSyncError(null);
                speakWithSync(text, onEnd);
            }, 1000);
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isMuted, selectedVoice, startWordHighlighting, scene?.duration]);

    // Play current scene
    const playScene = useCallback(() => {
        if (!scene) return;

        setIsPlaying(true);
        setSyncStatus('syncing');
        setCanSkip(false);

        // Start visual progress
        let elapsed = 0;
        const duration = scene.duration || 5000;

        timerRef.current = setInterval(() => {
            elapsed += 50;
            const visualProgress = (elapsed / duration) * 100;
            setProgress(visualProgress);

            if (elapsed >= duration) {
                clearInterval(timerRef.current);
                syncController.current.markVisualComplete();
                checkSceneCompletion();
            }
        }, 50);

        // Start narration (synchronized)
        speakWithSync(scene.narration, () => {
            setNarrationProgress(100);
            checkSceneCompletion();
        });
    }, [scene, speakWithSync]);

    // Check if scene can advance
    const checkSceneCompletion = useCallback(() => {
        const canAdvance = syncController.current.canAdvance();

        if (canAdvance) {
            setSyncStatus('complete');
            setCanSkip(true);

            // Auto-advance after 1.5 seconds (unless teacher wants manual control)
            if (!isTeacher) {
                setTimeout(() => {
                    if (currentScene < scenes.length - 1) {
                        advanceScene();
                    } else {
                        onComplete?.();
                    }
                }, 1500);
            }
        }
    }, [currentScene, scenes.length, isTeacher, onComplete]);

    // Advance to next scene
    const advanceScene = useCallback(() => {
        if (currentScene < scenes.length - 1) {
            // Reset state
            window.speechSynthesis?.cancel();
            clearInterval(timerRef.current);
            clearInterval(wordTimerRef.current);

            setCurrentScene(prev => prev + 1);
            setProgress(0);
            setNarrationProgress(0);
            setCanSkip(false);
            setHighlightedWords([]);
            setCurrentWord(0);

            syncController.current.currentIndex = currentScene + 1;

            // Auto-play next scene
            setTimeout(() => {
                playScene();
            }, 500);
        } else {
            onComplete?.();
        }
    }, [currentScene, scenes.length, playScene, onComplete]);

    // Pause/Resume
    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            window.speechSynthesis?.pause();
            clearInterval(timerRef.current);
            clearInterval(wordTimerRef.current);
            setIsPlaying(false);
            setSyncStatus('ready');
        } else {
            window.speechSynthesis?.resume();
            setIsPlaying(true);
            setSyncStatus('playing');
        }
    }, [isPlaying]);

    // Replay current scene
    const replayScene = useCallback(() => {
        window.speechSynthesis?.cancel();
        clearInterval(timerRef.current);
        clearInterval(wordTimerRef.current);

        setProgress(0);
        setNarrationProgress(0);
        setCanSkip(false);
        setHighlightedWords([]);
        setCurrentWord(0);

        // Reset sync controller for current scene
        if (syncController.current.timeline[currentScene]) {
            syncController.current.timeline[currentScene].narrationComplete = false;
            syncController.current.timeline[currentScene].visualComplete = false;
        }

        setTimeout(playScene, 300);
    }, [currentScene, playScene]);

    // Teacher skip (bypasses sync requirements)
    const teacherSkip = useCallback(() => {
        if (!isTeacher) return;

        window.speechSynthesis?.cancel();
        clearInterval(timerRef.current);
        clearInterval(wordTimerRef.current);

        if (currentScene < scenes.length - 1) {
            setCurrentScene(prev => prev + 1);
            setProgress(0);
            setNarrationProgress(0);
        } else {
            onComplete?.();
        }
    }, [isTeacher, currentScene, scenes.length, onComplete]);

    // Mute toggle
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            if (!prev) {
                window.speechSynthesis?.cancel();
            }
            return !prev;
        });
    }, []);

    const stopControlEvent = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    // Start playback when component mounts
    useEffect(() => {
        if (voiceLoaded && scenes.length > 0 && !isPlaying) {
            const timer = setTimeout(playScene, 1000);
            return () => clearTimeout(timer);
        }
    }, [voiceLoaded, scenes.length]);

    if (!videoContent || scenes.length === 0) {
        return (
            <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading scenario data...</p>
            </div>
        );
    }

    const totalProgress = ((currentScene + progress / 100) / scenes.length) * 100;

    return (
        <div className="max-w-5xl mx-auto">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                {/* Sync status bar */}
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge className={`
              ${syncStatus === 'ready' ? 'bg-slate-600 text-slate-300' :
                                syncStatus === 'playing' || syncStatus === 'syncing' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                                    syncStatus === 'complete' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        'bg-red-500/20 text-red-400 border-red-500/30'}
            `}>
                            {syncStatus === 'ready' && 'Ready'}
                            {syncStatus === 'syncing' && <><Loader2 className="w-3 h-3 animate-spin mr-1" />Syncing</>}
                            {syncStatus === 'playing' && <><div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse mr-1" />Playing</>}
                            {syncStatus === 'complete' && <><CheckCircle2 className="w-3 h-3 mr-1" />Synced</>}
                            {syncStatus === 'error' && <><AlertCircle className="w-3 h-3 mr-1" />Error</>}
                        </Badge>

                        {isTeacher && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                Teacher Mode
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">
                            Scene {currentScene + 1} / {scenes.length}
                        </span>
                        {selectedVoice && (
                            <span className="text-slate-600 text-xs">
                                Voice: {selectedVoice.name.split(' ')[0]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Video display area */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                    {/* Sync error overlay */}
                    {syncError && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                            <div className="text-center p-6">
                                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                                <p className="text-white mb-2">{syncError}</p>
                                <Loader2 className="w-5 h-5 text-teal-400 animate-spin mx-auto" />
                            </div>
                        </div>
                    )}

                    {/* Scene content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentScene}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col"
                        >
                            {/* Visual content area */}
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center">
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="text-8xl mb-4"
                                    >
                                        {character?.avatar || '🧑‍🔬'}
                                    </motion.div>
                                    <p className="text-slate-500 text-sm italic max-w-md">{scene?.visual}</p>
                                </div>
                            </div>

                            {/* Data display with sync highlighting */}
                            {scene?.showData && scene?.dataTable && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mx-6 mb-4 bg-slate-800/90 backdrop-blur rounded-xl p-4 border border-teal-500/30"
                                >
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-700">
                                                    {scene.dataTable.headers?.map((h, i) => (
                                                        <th key={i} className="text-left py-2 px-3 text-slate-400 font-medium">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {scene.dataTable.rows?.map((row, i) => (
                                                    <motion.tr
                                                        key={i}
                                                        className="border-b border-slate-700/50"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.2 }}
                                                    >
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="py-2 px-3 text-white">{cell}</td>
                                                        ))}
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Character narration with subtitles */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-teal-500/30">
                                {character?.avatar || '🧑‍🔬'}
                            </div>
                            <div className="flex-1">
                                <p className="text-teal-400 text-sm font-medium mb-1">{character?.name || 'Narrator'}</p>

                                {/* Word-by-word subtitles */}
                                {showSubtitles && (
                                    <div className="text-white text-lg leading-relaxed">
                                        {highlightedWords.length > 0 ? (
                                            highlightedWords.map((word, i) => (
                                                <span
                                                    key={i}
                                                    className={`transition-all duration-150 ${i <= currentWord
                                                            ? 'text-white'
                                                            : 'text-slate-500'
                                                        } ${i === currentWord ? 'text-teal-300 font-medium' : ''}`}
                                                >
                                                    {word}{' '}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 italic">"{scene?.narration}"</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Audio visualizer */}
                    {!isMuted && isPlaying && syncStatus === 'playing' && (
                        <motion.div
                            className="absolute top-4 right-4 flex items-center gap-1 bg-slate-800/80 backdrop-blur px-3 py-2 rounded-full"
                        >
                            <Volume2 className="w-4 h-4 text-teal-400 mr-2" />
                            {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-teal-400 rounded-full"
                                    animate={{ height: [h, h + 4, h] }}
                                    transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                                    style={{ height: h }}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                    {/* Dual progress bars */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-16">Visual</span>
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-16">Total</span>
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    style={{ width: `${totalProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={(event) => {
                                    stopControlEvent(event);
                                    togglePlayPause();
                                }}
                                className="text-slate-400 hover:text-white"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={(event) => {
                                    stopControlEvent(event);
                                    replayScene();
                                }}
                                className="text-slate-400 hover:text-white"
                                title="Replay scene"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={(event) => {
                                    stopControlEvent(event);
                                    toggleMute();
                                }}
                                className="text-slate-400 hover:text-white"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={(event) => {
                                    stopControlEvent(event);
                                    setShowSubtitles(!showSubtitles);
                                }}
                                className={`${showSubtitles ? 'text-teal-400' : 'text-slate-400'} hover:text-white`}
                                title="Toggle subtitles"
                            >
                                <Subtitles className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Student: Can only proceed when scene is complete */}
                            {!isTeacher && (
                                <Button
                                    type="button"
                                    onClick={(event) => {
                                        stopControlEvent(event);
                                        advanceScene();
                                    }}
                                    disabled={!canSkip}
                                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50"
                                >
                                    {currentScene === scenes.length - 1 ? 'Start Scenario' : 'Continue'}
                                    <SkipForward className="w-4 h-4 ml-2" />
                                </Button>
                            )}

                            {/* Teacher: Can skip anytime */}
                            {isTeacher && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        onClick={(event) => {
                                            stopControlEvent(event);
                                            advanceScene();
                                        }}
                                        disabled={!canSkip}
                                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50"
                                    >
                                        Continue
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={(event) => {
                                            stopControlEvent(event);
                                            teacherSkip();
                                        }}
                                        variant="outline"
                                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                    >
                                        Skip Scene
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student lock message */}
                    {!isTeacher && !canSkip && isPlaying && (
                        <p className="text-center text-slate-500 text-sm mt-3">
                            🔒 Please watch the complete narration to continue
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}