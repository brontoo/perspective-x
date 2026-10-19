import { useEffect, useRef, useState } from "react";

// One player per mounted chapter. Replacing a caption releases its source before
// another recording can start; no Web Speech fallback changes the approved voice.
export function useOceanVoice(line) {
  const player = useRef(null);
  const saved = (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const [enabled, setEnabled] = useState(
    () => saved("px-ocean-voices") === "on",
  );
  const [muted, setMuted] = useState(() => saved("px-ocean-muted") === "on");
  const [rate, setRate] = useState(() => Number(saved("px-ocean-rate")) || 1);
  const [status, setStatus] = useState("off");
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    const audio = player.current;
    if (!audio || !enabled || !line?.audio) {
      setStatus(enabled ? "unavailable" : "off");
      return;
    }
    let disposed = false;
    const state = (value) => {
      if (!disposed) setStatus(value);
    };
    const ended = () => state("ended");
    const error = () => state("unavailable");
    const pause = () => {
      if (!audio.ended && !audio.error) state("paused");
    };
    const playing = () => state("playing");
    const hidden = () => {
      if (document.hidden) audio.pause();
    };
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", error);
    audio.addEventListener("pause", pause);
    audio.addEventListener("playing", playing);
    document.addEventListener("visibilitychange", hidden);
    audio.src = line.audio;
    audio.preload = "auto"; // Only the active recording is requested.
    state("loading");
    if (document.hidden) state("paused");
    else
      audio.play().catch(() => state(audio.error ? "unavailable" : "blocked"));
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", hidden);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", error);
      audio.removeEventListener("pause", pause);
      audio.removeEventListener("playing", playing);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, [line?.id, line?.audio, enabled, replay]);
  useEffect(() => {
    if (player.current) {
      player.current.defaultPlaybackRate = rate;
      player.current.playbackRate = rate;
    }
  }, [rate, line?.id, replay, enabled]);
  useEffect(() => {
    if (player.current) player.current.muted = muted;
  }, [muted]);
  useEffect(() => {
    try {
      sessionStorage.setItem("px-ocean-voices", enabled ? "on" : "off");
      sessionStorage.setItem("px-ocean-muted", muted ? "on" : "off");
      sessionStorage.setItem("px-ocean-rate", String(rate));
    } catch {
      /* Playback still works when browser storage is unavailable. */
    }
  }, [enabled, muted, rate]);
  const resume = () => player.current?.play().catch(() => setStatus("blocked"));
  return {
    player,
    enabled,
    muted,
    rate,
    status,
    // Loading/error and autoplay denial always expose an explicit text-only path.
    waiting:
      enabled && !!line?.audio && !["ended", "unavailable"].includes(status),
    controls: (
      <div className="od-voice" aria-label="Dialogue audio controls">
        <audio
          ref={player}
          data-dialogue-id={line?.id}
          aria-label="Approved character recording"
        />
        {!enabled ? (
          <button onClick={() => setEnabled(true)}>
            Enable character voices
          </button>
        ) : (
          <>
            <button
              onClick={
                status === "playing" ? () => player.current?.pause() : resume
              }
            >
              {status === "playing" ? "Pause voice" : "Resume voice"}
            </button>
            <button onClick={() => setMuted((v) => !v)} aria-pressed={muted}>
              {muted ? "Unmute voice" : "Mute voice"}
            </button>
          </>
        )}
        <button
          disabled={!line?.audio}
          onClick={() => {
            setEnabled(true);
            setReplay((v) => v + 1);
          }}
        >
          Replay voice
        </button>
        <label>
          Voice speed{" "}
          <select
            aria-label="Voice speed"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          >
            {[0.75, 1, 1.25, 1.5].map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </select>
        </label>
        {enabled && (
          <button onClick={() => setEnabled(false)}>
            Continue without voice
          </button>
        )}
        <span className="od-audio-status" role="status">
          {
            {
              off: "Voices off · read at your own pace",
              loading: "Loading recording…",
              playing: "Character speaking…",
              paused: "Voice paused",
              ended: "Recording complete",
              blocked:
                "Playback needs permission. Resume or continue without voice.",
              unavailable: "Recording unavailable · continue with the caption",
            }[status]
          }
        </span>
      </div>
    ),
  };
}

export function OceanFilm({ src, poster, label }) {
  const player = useRef(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const video = player.current;
    const hidden = () => {
      if (document.hidden) video?.pause();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, []);
  function stop(status) {
    const video = player.current;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    setStatus(status);
  }
  if (status === "error" || status === "skipped")
    return (
      <p className="od-film-note" role="status">
        {status === "error"
          ? "Film unavailable. The illustrated briefing and captions remain ready."
          : "Still-image mode. Continue with the captions."}
      </p>
    );
  return (
    <div className="od-film">
      <video
        ref={player}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        muted
        controls
        aria-label={label}
        onLoadedData={() => {
          setStatus("ready");
          if (
            !document.hidden &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          )
            player.current?.play().catch(() => {});
          else player.current?.pause();
        }}
        onEnded={() => setStatus("ended")}
        onVolumeChange={(event) => {
          if (!event.currentTarget.muted) event.currentTarget.muted = true;
        }}
        onError={() => stop("error")}
      />
      <div className="od-film-tools">
        <span role="status">
          {status === "loading"
            ? "Loading cinematic moment…"
            : "Original film · natural speed · character voices in dialogue controls"}
        </span>
        <button onClick={() => stop("skipped")}>Use still image</button>
      </div>
    </div>
  );
}
