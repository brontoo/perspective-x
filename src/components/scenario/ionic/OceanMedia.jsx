import { useContext, useEffect, useRef, useState } from "react";
import { OceanSessionContext } from "./OceanSession";

export function useOceanVoice(line, nextLine) {
  const session = useContext(OceanSessionContext);
  const {
    player,
    started,
    setStarted,
    paused,
    setPaused,
    enabled,
    setEnabled,
  } = session;
  const saved = (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const [muted, setMuted] = useState(() => saved("px-ocean-muted") === "on");
  const [rate, setRate] = useState(() => Number(saved("px-ocean-rate")) || 1);
  const [state, setState] = useState({ id: null, status: "off" });
  const [replay, setReplay] = useState(0);
  const completed = useRef(false);
  const status = state.id === line?.id ? state.status : "loading";
  const current = useRef({ line, started, enabled, paused });
  current.current = { line, started, enabled, paused };
  useEffect(() => {
    const audio = player.current;
    if (!audio || !line) return;
    let disposed = false;
    const update = (status) => {
      if (!disposed) setState({ id: line.id, status });
    };
    const ended = () => {
      completed.current = true;
      update("ended");
    };
    const failed = () => update("unavailable");
    const playing = () => update("playing");
    const stopped = () => {
      if (!completed.current && !audio.error) update("paused");
    };
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", failed);
    audio.addEventListener("playing", playing);
    audio.addEventListener("pause", stopped);
    completed.current = false;
    audio.dataset.dialogueId = line.id;
    audio.preload = "none";
    if (line.audio) audio.src = line.audio;
    update(line.audio ? "ready" : "unavailable");
    return () => {
      disposed = true;
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", failed);
      audio.removeEventListener("playing", playing);
      audio.removeEventListener("pause", stopped);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, [line?.id, line?.audio, replay, player]);
  useEffect(() => {
    const audio = player.current;
    if (!audio || !line) return;
    let disposed = false;
    if (!started || paused || !enabled) audio.pause();
    else if (!completed.current && !audio.error && line.audio) {
      audio.preload = "auto";
      audio.play().catch(() => {
        if (!disposed)
          setState({
            id: line.id,
            status: audio.error ? "unavailable" : "blocked",
          });
      });
    }
    return () => {
      disposed = true;
    };
  }, [line?.id, replay, started, paused, enabled, player]);
  const reading = !enabled || status === "unavailable" || !line?.audio;
  useEffect(() => {
    if (!started || paused || !reading || !line || document.hidden) return;
    const delay = Math.max(
      2400,
      Math.min(20000, line.line.split(/\s+/).length * 330),
    );
    const timer = setTimeout(() => {
      completed.current = true;
      setState({ id: line.id, status: "read" });
    }, delay);
    return () => clearTimeout(timer);
  }, [line?.id, started, paused, reading]);
  // Fetch just the next known recording into the browser cache while the current
  // line plays. No speculative decision/assessment answers are preloaded.
  useEffect(() => {
    if (!started || !enabled || paused || !nextLine?.audio) return;
    const abort = new AbortController();
    fetch(nextLine.audio, { cache: "force-cache", signal: abort.signal }).catch(
      () => {},
    );
    return () => abort.abort();
  }, [nextLine?.audio, started, enabled, paused]);
  useEffect(() => {
    if (player.current) {
      player.current.defaultPlaybackRate = rate;
      player.current.playbackRate = rate;
      player.current.muted = muted;
    }
    try {
      sessionStorage.setItem("px-ocean-muted", muted ? "on" : "off");
      sessionStorage.setItem("px-ocean-rate", String(rate));
    } catch {
      /* Optional preference storage. */
    }
  }, [rate, muted, line?.id, player]);
  function play() {
    const audio = player.current;
    if (!audio || !line?.audio) return;
    audio.preload = "auto";
    audio.play().catch(() => {
      if (current.current.line?.id === line.id)
        setState({
          id: line.id,
          status: audio.error ? "unavailable" : "blocked",
        });
    });
  }
  function start() {
    setEnabled(true);
    setPaused(false);
    setStarted(true);
    play();
  }
  function resume() {
    setPaused(false);
    if (status === "blocked" || status === "paused") play();
  }
  const finished =
    started && state.id === line?.id && ["ended", "read"].includes(status);
  return {
    ...session,
    player,
    muted,
    rate,
    status,
    finished,
    waiting: !finished,
    start,
    replay: () => setReplay((value) => value + 1),
    controls: started && (
      <div className="od-voice" aria-label="Playback controls">
        <button
          onClick={
            paused || status === "blocked"
              ? resume
              : () => {
                  setPaused(true);
                  player.current?.pause();
                }
          }
        >
          {paused || status === "blocked" ? "Resume" : "Pause"}
        </button>
        <button
          onClick={() => setMuted((value) => !value)}
          aria-pressed={muted}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <label>
          Speed{" "}
          <select
            aria-label="Playback speed"
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          >
            {[0.75, 1, 1.25, 1.5].map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </select>
        </label>
        <button
          aria-pressed={!enabled}
          onClick={() => setEnabled((value) => !value)}
        >
          {enabled ? "Captions only" : "Enable audio"}
        </button>
        <span className="od-audio-status" role="status">
          {!enabled
            ? "Captions · automatic playback"
            : paused
              ? "Paused"
              : {
                  loading: "Loading…",
                  ready: "Ready",
                  playing: "Playing",
                  ended: "Waiting for your response",
                  read: "Captions",
                  blocked:
                    "Select Resume to allow playback, or use captions only.",
                  unavailable: "Audio unavailable · continuing with captions",
                }[status]}
        </span>
      </div>
    ),
  };
}

export function OceanFilm({ src, poster, label }) {
  const session = useContext(OceanSessionContext);
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
  useEffect(() => {
    const video = player.current;
    if (!video) return;
    if (session.paused || !session.started) video.pause();
    else if (
      status === "ready" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      video.play().catch(() => {});
  }, [session.paused, session.started, status]);
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
            session.started &&
            !session.paused &&
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
