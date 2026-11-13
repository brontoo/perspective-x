import { useEffect, useRef, useState } from "react";

// Dessert-specific extension of AtomFilm's ownership/completion pattern.
// Retain the native last frame until the decoded end artwork can cover it.
export default function DessertFilm({
  film,
  poster,
  paused,
  playAllowed = true,
  onReady,
  onBusy,
  onStatus,
}) {
  const movie = film.definition;
  const video = useRef(null),
    last = useRef(null),
    live = useRef(true);
  const callbacks = useRef({ onReady, onBusy, onStatus });
  callbacks.current = { onReady, onBusy, onStatus };
  const reduced = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [requested, setRequested] = useState(!film.held && !reduced.current);
  const [authorized, setAuthorized] = useState(playAllowed);
  useEffect(() => {
    if (playAllowed) setAuthorized(true);
  }, [playAllowed]);
  const [ended, setEnded] = useState(!!film.held),
    [failed, setFailed] = useState(false),
    [frame, setFrame] = useState(false),
    [endFrame, setEndFrame] = useState(false);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      const player = last.current;
      player?.pause();
      player?.removeAttribute("src");
      player?.load();
    };
  }, []);
  useEffect(() => {
    const image = new Image();
    let valid = true;
    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        /* decoded on load */
      }
      if (valid) setEndFrame(true);
    };
    image.src = movie.end;
    return () => {
      valid = false;
      image.onload = null;
    };
  }, [movie.end]);
  useEffect(() => {
    callbacks.current.onReady(!requested || ended || failed || frame);
    callbacks.current.onBusy(requested && !ended && !failed);
  }, [requested, ended, failed, frame]);
  useEffect(() => {
    const player = video.current;
    if (!player || !frame || ended || failed || !requested || !authorized)
      return;
    let valid = true;
    if (paused) player.pause();
    else
      player.play().catch((error) => {
        if (valid && live.current && error.name !== "AbortError") {
          setFailed(true);
          callbacks.current.onStatus("unavailable");
        }
      });
    return () => {
      valid = false;
    };
  }, [paused, frame, ended, failed, requested, authorized]);
  function done(status) {
    if (!live.current) return;
    video.current?.pause();
    setEnded(true);
    callbacks.current.onStatus(status);
  }
  return (
    <div
      className="px-atom-film px-dessert-native-film"
      aria-label="Cinematic scene"
      data-film-ready={frame ? "true" : "false"}
    >
      {requested && !failed && (
        <video
          ref={(node) => {
            video.current = node;
            if (node) last.current = node;
          }}
          src={movie.url}
          poster={poster}
          muted
          playsInline
          preload="auto"
          style={{ opacity: frame ? 1 : 0 }}
          onLoadedMetadata={(event) => {
            if (movie.startTime)
              event.currentTarget.currentTime = Math.min(
                movie.startTime,
                Math.max(0, event.currentTarget.duration - 0.05),
              );
          }}
          onLoadedData={() => {
            if (live.current) setFrame(true);
          }}
          onPlaying={() => {
            if (live.current) callbacks.current.onStatus("played");
          }}
          onEnded={() => done("complete")}
          onError={() => {
            if (live.current) {
              setFailed(true);
              callbacks.current.onStatus("unavailable");
            }
          }}
        />
      )}
      {ended && endFrame && <img src={movie.end} alt="Final cinematic frame" />}
      <div className="px-atom-film-tools">
        {failed ? (
          <span>The scene continues with its still image.</span>
        ) : !requested && !ended ? (
          <button onClick={() => setRequested(true)}>
            Play clip (optional)
          </button>
        ) : !ended ? (
          <button onClick={() => done("skipped")}>Skip clip</button>
        ) : null}
      </div>
    </div>
  );
}
