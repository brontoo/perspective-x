import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Captions,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  SlidersHorizontal,
  FastForward,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
export default function CinematicMissionControls({
  title,
  chapter,
  chapterTitles,
  playing,
  started,
  muted,
  captions,
  onPlay,
  onMute,
  onCaptions,
  onReplay,
  onSkip,
  onNotebook,
  back,
  volume,
  effectsVolume,
  onVolume,
  onEffectsVolume,
  interaction,
}) {
  const [settings, setSettings] = useState(false);
  return (
    <>
      <header className="cm-header">
        <Link to={back} className="cm-icon" aria-label="Exit mission">
          <ArrowLeft size={19} />
        </Link>
        <div className="cm-heading">
          <span className="cm-kicker">Perspective X · Interactive cinema</span>
          <h1>{title}</h1>
        </div>
        <button
          className="cm-icon"
          aria-label="Mission Notebook"
          onClick={onNotebook}
        >
          <BookOpen size={20} />
        </button>
      </header>
      <nav className="cm-transport" aria-label="Cinematic playback controls">
        <div className="cm-playback">
          <button
            className="cm-icon"
            aria-label={
              playing ? "Pause story" : started ? "Resume story" : "Play story"
            }
            onClick={onPlay}
          >
            {playing ? <Pause size={19} /> : <Play size={19} />}
          </button>
          <button
            className="cm-icon"
            aria-label={muted ? "Unmute mission" : "Mute mission"}
            aria-pressed={muted}
            onClick={onMute}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
          <button
            className="cm-icon"
            aria-label="Toggle captions"
            aria-pressed={captions}
            onClick={onCaptions}
          >
            <Captions size={19} />
          </button>
          <button
            className="cm-icon"
            aria-label="Replay current dialogue"
            onClick={onReplay}
            disabled={!started}
          >
            <RotateCcw size={18} />
          </button>
          <button
            className="cm-icon"
            aria-label="Audio settings"
            aria-expanded={settings}
            onClick={() => setSettings(!settings)}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
        <ol className="cm-chapters" aria-label="Five-chapter mission progress">
          {chapterTitles.map((label, i) => (
            <li
              key={label}
              aria-current={chapter === i ? "step" : undefined}
              className={chapter > i ? "is-done" : ""}
            >
              <span>{i + 1}</span>
              <strong>{label}</strong>
            </li>
          ))}
        </ol>
        {!interaction && (
          <button
            className="cm-skip"
            onClick={onSkip}
            disabled={!started}
            title="Skip this narrative scene; required investigations cannot be skipped"
          >
            Continue story <FastForward size={16} />
          </button>
        )}
      </nav>
      {settings && (
        <section className="cm-audio-settings" aria-label="Audio settings">
          <label>
            Dialogue volume{" "}
            <input
              type="range"
              min="0"
              max="1"
              step=".05"
              value={volume}
              onChange={(e) => onVolume(Number(e.target.value))}
            />
          </label>
          <label>
            Effects volume{" "}
            <input
              type="range"
              min="0"
              max="1"
              step=".05"
              value={effectsVolume}
              onChange={(e) => onEffectsVolume(Number(e.target.value))}
            />
          </label>
          <p>
            Device voices vary. Captions always support the story when speech is
            unavailable.
          </p>
          <button onClick={() => setSettings(false)}>
            Close audio settings
          </button>
        </section>
      )}
    </>
  );
}
