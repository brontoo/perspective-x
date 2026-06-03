/**
 * KenBurnsSlideshow.jsx
 *
 * A cinematic "Ken Burns" slideshow that plays AI-generated images with
 * smooth zoom/pan animations alongside an ElevenLabs MP3 narration track.
 * Subtitles are derived from the scenario content and timed proportionally
 * to the audio playback position (no external timestamps file required).
 *
 * Asset discovery (auto-detected at runtime):
 *   Images : /images/scenarios/[scenarioId]/1.jpg  (1–10, jpg/webp/png)
 *   Audio  : /audio/scenarios/[scenarioId].mp3
 *
 * If either asset is missing the parent (CinematicVideoIntro) will not
 * render this component at all, so no null-guard needed here.
 */

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Volume2, VolumeX, SkipForward,
    ChevronRight, Subtitles, RotateCcw, FileText, X,
    CheckCircle2,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Ken Burns effect presets
   Each entry describes how a single image should scale + translate over time.
   We rotate through them so consecutive images always feel different.
───────────────────────────────────────────────────────────────────────────── */
const KB_PRESETS = [
    // zoom in — drift upper-right
    { scaleFrom: 1.0, scaleTo: 1.14, xFrom: '0%',   xTo: '-2.5%', yFrom: '0%',   yTo: '-2%'  },
    // zoom in — drift lower-left
    { scaleFrom: 1.0, scaleTo: 1.14, xFrom: '0%',   xTo: '2.5%',  yFrom: '0%',   yTo: '2%'   },
    // zoom out — centre
    { scaleFrom: 1.14, scaleTo: 1.0, xFrom: '0%',   xTo: '0%',    yFrom: '0%',   yTo: '0%'   },
    // pan right at constant zoom
    { scaleFrom: 1.07, scaleTo: 1.07, xFrom: '-3%', xTo: '3%',    yFrom: '0%',   yTo: '0%'   },
    // pan left at constant zoom
    { scaleFrom: 1.07, scaleTo: 1.07, xFrom: '3%',  xTo: '-3%',   yFrom: '0%',   yTo: '0%'   },
    // pan up at constant zoom
    { scaleFrom: 1.07, scaleTo: 1.07, xFrom: '0%',  xTo: '0%',    yFrom: '2.5%', yTo: '-2.5%' },
    // zoom in — drift lower-right (slow)
    { scaleFrom: 1.0, scaleTo: 1.10, xFrom: '-1%',  xTo: '1%',    yFrom: '-1%',  yTo: '1%'   },
    // zoom out — drift upper-left
    { scaleFrom: 1.12, scaleTo: 1.0, xFrom: '2%',   xTo: '-2%',   yFrom: '1.5%', yTo: '-1.5%' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: split narration text into subtitle sentences
───────────────────────────────────────────────────────────────────────────── */
function buildSubtitleSegments(content) {
    const scenes = content?.scenes || [];

    // Collect narration text from every scene
    const texts = [
        content?.title ? `Mission: ${content.title}.` : '',
        ...scenes.map((s) => s.narration).filter(Boolean),
    ]
        .filter(Boolean)
        .join(' ');

    if (!texts.trim()) return [];

    // Split on sentence-ending punctuation — keep the delimiter
    const raw = texts.match(/[^.!?]+[.!?]+/g) || [texts];
    const segments = raw.map((s) => s.trim()).filter(Boolean);

    // Calculate total character length
    const totalChars = segments.reduce((sum, seg) => sum + seg.length, 0);

    let accumulatedPct = 0;
    return segments.map((text) => {
        const pctLength = totalChars > 0 ? text.length / totalChars : 0;
        const startPct = accumulatedPct;
        const endPct = accumulatedPct + pctLength;
        accumulatedPct = endPct;
        return { text, startPct, endPct };
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: format seconds → "m:ss"
───────────────────────────────────────────────────────────────────────────── */
function formatTime(secs) {
    if (!secs || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-component: animated progress bar (clickable / seekable)
───────────────────────────────────────────────────────────────────────────── */
function AudioProgressBar({ progress, currentTime, duration, onSeek }) {
    const barRef = useRef(null);

    const handleClick = (e) => {
        if (!onSeek || !barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onSeek(ratio * duration);
    };

    return (
        <div
            ref={barRef}
            onClick={handleClick}
            className="group relative w-full h-1 bg-white/20 rounded-full cursor-pointer"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
        >
            {/* Filled portion */}
            <div
                className="absolute inset-y-0 left-0 bg-cyan-400 rounded-full transition-none"
                style={{ width: `${progress}%` }}
            />
            {/* Thumb dot */}
            <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5"
                style={{ left: `${progress}%` }}
            />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-component: control button
───────────────────────────────────────────────────────────────────────────── */
function CtrlBtn({ onClick, title, active, disabled, children }) {
    return (
        <button
            onClick={onClick}
            title={title}
            aria-label={title}
            disabled={disabled}
            className={`p-2 rounded-lg transition-all select-none ${
                disabled
                    ? 'text-white/20 cursor-not-allowed'
                    : active
                    ? 'bg-cyan-500/30 text-cyan-300 hover:bg-cyan-500/40'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
        >
            {children}
        </button>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────────── */
export default function KenBurnsSlideshow({
    scenarioId,
    audioSrc,       // string — already-validated MP3 URL
    images,         // string[] — already-validated image URLs (1–N)
    content,        // UAE_VIDEO_CONTENT or buildFallbackVideoContent result
    onComplete,
    isTeacher = false,
    videoState = 'idle',
}) {
    /* ── Audio element ref ───────────────────────────────────────────────── */
    const audioRef = useRef(null);
    const isMountedRef = useRef(true);
    const onCompleteCalledRef = useRef(false);

    /* ── Playback state ──────────────────────────────────────────────────── */
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);          // 0-100
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [audioEnded, setAudioEnded] = useState(false);
    const [audioError, setAudioError] = useState(false);

    /* ── Image + Ken Burns state ─────────────────────────────────────────── */
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [presetOffset, setPresetOffset] = useState(0);  // rotates KB preset

    /* ── Subtitle state ──────────────────────────────────────────────────── */
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [showTranscript, setShowTranscript] = useState(false);
    const [currentSubtitleIdx, setCurrentSubtitleIdx] = useState(0);

    const subtitleSegments = useMemo(() => buildSubtitleSegments(content), [content]);
    const fullTranscript = subtitleSegments.map((s) => s.text).join(' ');
    const character = content?.character;

    /* ── Safe complete callback ──────────────────────────────────────────── */
    const safeOnComplete = useCallback(() => {
        if (onCompleteCalledRef.current) return;
        onCompleteCalledRef.current = true;
        onComplete?.();
    }, [onComplete]);

    /* ── Mount / unmount ─────────────────────────────────────────────────── */
    useEffect(() => {
        isMountedRef.current = true;

        if (videoState === 'completed') {
            safeOnComplete();
        }

        return () => {
            isMountedRef.current = false;
            // Stop audio when component unmounts
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [safeOnComplete, videoState]);

    /* ── Audio event handlers ────────────────────────────────────────────── */
    const handleLoadedMetadata = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        setDuration(audio.duration || 0);
    }, []);

    const handleTimeUpdate = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !isMountedRef.current) return;

        const ct = audio.currentTime;
        const dur = audio.duration;
        if (!dur) return;

        const pct = ct / dur;
        setCurrentTime(ct);
        setProgress(pct * 100);

        /* ── Subtitle: pick segment based on text length time allocation ── */
        if (subtitleSegments.length > 0) {
            const segIdx = subtitleSegments.findIndex((seg) => pct >= seg.startPct && pct <= seg.endPct);
            if (segIdx !== -1) {
                setCurrentSubtitleIdx(segIdx);
            } else if (pct > 0.99) {
                setCurrentSubtitleIdx(subtitleSegments.length - 1);
            }
        }

        /* ── Image cycling: advance when playback crosses image boundary ── */
        if (images.length > 1) {
            const imgIdx = Math.min(
                Math.floor(pct * images.length),
                images.length - 1,
            );
            setCurrentImageIdx((prev) => {
                if (imgIdx !== prev) {
                    // Advance Ken Burns preset on each image change
                    setPresetOffset((po) => (po + 1) % KB_PRESETS.length);
                    return imgIdx;
                }
                return prev;
            });
        }
    }, [subtitleSegments, images]);

    const handleAudioEnded = useCallback(() => {
        if (!isMountedRef.current) return;
        setIsPlaying(false);
        setAudioEnded(true);
        setProgress(100);
        setCurrentSubtitleIdx(subtitleSegments.length - 1);
        // Move to last image
        setCurrentImageIdx(images.length - 1);
    }, [subtitleSegments.length, images.length]);

    const handleAudioError = useCallback(() => {
        setAudioError(true);
        setIsPlaying(false);
    }, []);

    /* ── Controls ────────────────────────────────────────────────────────── */
    const handlePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.play()
            .then(() => { if (isMountedRef.current) setIsPlaying(true); })
            .catch(() => { if (isMountedRef.current) setIsPlaying(false); });
    }, []);

    const handlePause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        setIsPlaying(false);
    }, []);

    const togglePlayPause = useCallback(() => {
        if (isPlaying) handlePause();
        else handlePlay();
    }, [isPlaying, handlePlay, handlePause]);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        setIsMuted((prev) => {
            const next = !prev;
            if (audio) audio.muted = next;
            return next;
        });
    }, []);

    const handleReplay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        setProgress(0);
        setCurrentTime(0);
        setAudioEnded(false);
        setCurrentImageIdx(0);
        setPresetOffset(0);
        setCurrentSubtitleIdx(0);
        handlePlay();
    }, [handlePlay]);

    const handleSeek = useCallback((timeSeconds) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = timeSeconds;
    }, []);

    /* ── Auto-play on mount (500 ms delay for smooth entry animation) ────── */
    useEffect(() => {
        if (videoState === 'completed') return;
        const timer = setTimeout(() => {
            if (isMountedRef.current) handlePlay();
        }, 600);
        return () => clearTimeout(timer);
    }, [handlePlay, videoState]);

    /* ── Keyboard shortcuts ──────────────────────────────────────────────── */
    useEffect(() => {
        const onKey = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'Escape':
                    if (isTeacher) { e.preventDefault(); safeOnComplete(); }
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [togglePlayPause, toggleMute, isTeacher, safeOnComplete]);

    /* ─── Derived values ─────────────────────────────────────────────────── */
    const preset = KB_PRESETS[(currentImageIdx + presetOffset) % KB_PRESETS.length];
    // Each image is displayed for (audio duration / numImages) seconds
    const imageDuration = duration > 0 && images.length > 0 ? duration / images.length : 8;
    const currentImage = images[currentImageIdx] || images[0];
    const currentSubtitle = subtitleSegments[currentSubtitleIdx]?.text || '';

    /* ─── Render ─────────────────────────────────────────────────────────── */
    return (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col select-none">

            {/* ── Hidden audio element ─────────────────────────────────────── */}
            <audio
                ref={audioRef}
                src={audioSrc}
                preload="auto"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
            />

            {/* ══════════════════════════════════════════════════════════════
                KEN BURNS IMAGE LAYER
            ══════════════════════════════════════════════════════════════ */}
            <div className="absolute inset-0 overflow-hidden">
                {/* AnimatePresence mode="sync" allows old image to exit while new one enters */}
                <AnimatePresence mode="sync">
                    <motion.div
                        key={currentImageIdx}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.4, ease: 'easeInOut' }}
                    >
                        {/* Ken Burns animated container */}
                        <motion.div
                            className="absolute inset-0 will-change-transform"
                            initial={{
                                scale: preset.scaleFrom,
                                x: preset.xFrom,
                                y: preset.yFrom,
                            }}
                            animate={{
                                scale: preset.scaleTo,
                                x: preset.xTo,
                                y: preset.yTo,
                            }}
                            transition={{
                                duration: imageDuration + 1.4,
                                ease: 'linear',
                            }}
                        >
                            <img
                                src={currentImage}
                                alt=""
                                draggable={false}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Cinematic overlays ───────────────────────────────────────── */}
            {/* Top vignette */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />
            {/* Bottom vignette */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />
            {/* Side vignettes */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-10" />

            {/* Film grain overlay (subtle) */}
            <div
                className="absolute inset-0 pointer-events-none z-10 opacity-[0.035]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px',
                }}
            />

            {/* ══════════════════════════════════════════════════════════════
                TOP STATUS BAR
            ══════════════════════════════════════════════════════════════ */}
            <div className="relative z-20 flex items-center justify-between px-6 py-4">
                {/* Left: branding */}
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-white/50 text-xs font-mono tracking-[0.2em] uppercase">
                        Perspective X
                    </span>
                    <div className="w-px h-3 bg-white/20" />
                    <span className="text-cyan-400 text-xs font-mono tracking-[0.2em] uppercase">
                        Story
                    </span>
                    {isTeacher && (
                        <>
                            <div className="w-px h-3 bg-white/20" />
                            <span className="text-purple-300 text-xs font-mono bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">
                                Preview
                            </span>
                        </>
                    )}
                </div>

                {/* Right: image dots + skip */}
                <div className="flex items-center gap-4">
                    {/* Image progress dots */}
                    <div className="flex items-center gap-1.5">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-full transition-all duration-500 ${
                                    i === currentImageIdx
                                        ? 'w-4 h-1.5 bg-cyan-400'
                                        : i < currentImageIdx
                                        ? 'w-1.5 h-1.5 bg-white/50'
                                        : 'w-1.5 h-1.5 bg-white/20'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Skip button — always visible, enabled only for teacher */}
                    <button
                        onClick={isTeacher ? safeOnComplete : undefined}
                        disabled={!isTeacher}
                        className={`flex items-center gap-1.5 text-xs font-mono tracking-wider border px-2.5 py-1 rounded transition-all ${
                            isTeacher
                                ? 'border-white/30 text-white/70 hover:text-white hover:border-white/60 cursor-pointer'
                                : 'border-white/10 text-white/20 cursor-not-allowed'
                        }`}
                    >
                        <SkipForward className="w-3 h-3" />
                        Skip Story
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                CENTRE — "Begin Analysis" overlay (shown after audio ends)
            ══════════════════════════════════════════════════════════════ */}
            <div className="relative z-20 flex-1 flex items-center justify-center">
                <AnimatePresence>
                    {audioEnded && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="text-center"
                        >
                            <motion.div
                                className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 mx-auto mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.1 }}
                            >
                                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                            </motion.div>
                            <p className="text-white/60 text-sm font-mono tracking-wider mb-6">
                                Briefing complete
                            </p>
                            <motion.button
                                onClick={safeOnComplete}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="relative overflow-hidden flex items-center gap-2.5 text-sm font-mono tracking-widest font-bold px-8 py-3.5 rounded-lg shadow-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
                                    boxShadow: '0 0 32px rgba(6,182,212,0.4)',
                                }}
                            >
                                {/* Sheen sweep */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                />
                                <Play className="w-4 h-4 fill-current relative z-10" />
                                <span className="relative z-10">Start Mission</span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Audio error fallback */}
                {audioError && !audioEnded && (
                    <div className="text-center">
                        <p className="text-white/50 text-sm mb-4">Audio unavailable</p>
                        <button
                            onClick={safeOnComplete}
                            className="text-cyan-400 font-mono text-sm border border-cyan-400/30 px-6 py-2.5 rounded-lg hover:bg-cyan-500/10 transition-colors"
                        >
                            Continue to Mission →
                        </button>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                SUBTITLE BAND
            ══════════════════════════════════════════════════════════════ */}
            {showSubtitles && !audioEnded && currentSubtitle && (
                <div className="relative z-20 px-6 pb-4">
                    <div className="max-w-3xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSubtitleIdx}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                {/* Character name */}
                                {character?.name && (
                                    <p className="text-cyan-400 text-[11px] font-mono tracking-widest mb-1.5 uppercase">
                                        {character.name}
                                    </p>
                                )}
                                {/* Subtitle text */}
                                <p
                                    className="text-white text-base md:text-lg font-semibold leading-relaxed"
                                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
                                >
                                    {currentSubtitle}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                BOTTOM CONTROLS BAR
            ══════════════════════════════════════════════════════════════ */}
            <div className="relative z-20 px-6 pb-5">
                {/* Progress / seek bar */}
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-white/40 text-[11px] font-mono tabular-nums w-10 shrink-0">
                        {formatTime(currentTime)}
                    </span>
                    <AudioProgressBar
                        progress={progress}
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={handleSeek}
                    />
                    <span className="text-white/40 text-[11px] font-mono tabular-nums w-10 shrink-0 text-right">
                        {formatTime(duration)}
                    </span>
                </div>

                {/* Control row */}
                <div className="flex items-center justify-between">
                    {/* Left: character avatar + playback controls */}
                    <div className="flex items-center gap-1">
                        {/* Avatar */}
                        {character?.avatar && (
                            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-lg mr-2">
                                {character.avatar}
                            </div>
                        )}

                        <CtrlBtn onClick={togglePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying
                                ? <Pause className="w-5 h-5" />
                                : <Play className="w-5 h-5" />
                            }
                        </CtrlBtn>

                        <CtrlBtn onClick={handleReplay} title="Restart">
                            <RotateCcw className="w-4 h-4" />
                        </CtrlBtn>

                        <CtrlBtn
                            onClick={toggleMute}
                            title={isMuted ? 'Unmute' : 'Mute'}
                            active={isMuted}
                        >
                            {isMuted
                                ? <VolumeX className="w-4 h-4" />
                                : <Volume2 className="w-4 h-4" />
                            }
                        </CtrlBtn>
                    </div>

                    {/* Centre: scenario title */}
                    <div className="hidden md:block text-center">
                        <p className="text-white/60 text-xs font-mono tracking-wider truncate max-w-xs">
                            {content?.title || 'Scenario Briefing'}
                        </p>
                    </div>

                    {/* Right: subtitle toggle + transcript */}
                    <div className="flex items-center gap-1">
                        <CtrlBtn
                            onClick={() => setShowSubtitles((s) => !s)}
                            title="Toggle subtitles"
                            active={showSubtitles}
                        >
                            <Subtitles className="w-4 h-4" />
                        </CtrlBtn>

                        <CtrlBtn
                            onClick={() => setShowTranscript((t) => !t)}
                            title="Show transcript"
                            active={showTranscript}
                        >
                            <FileText className="w-4 h-4" />
                        </CtrlBtn>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                TRANSCRIPT DRAWER (slides up from bottom)
            ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showTranscript && (
                    <motion.div
                        className="absolute inset-x-0 bottom-0 z-30"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div
                            className="mx-4 mb-4 rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(10, 15, 30, 0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-cyan-400" />
                                    <span className="text-white text-sm font-semibold">Full Transcript</span>
                                </div>
                                <button
                                    onClick={() => setShowTranscript(false)}
                                    className="text-white/40 hover:text-white transition-colors p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Scrollable transcript body */}
                            <div className="px-5 py-4 max-h-48 overflow-y-auto">
                                <p className="text-white/75 text-sm leading-relaxed">
                                    {fullTranscript || 'No transcript available.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
