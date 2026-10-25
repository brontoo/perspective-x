import { useEffect, useRef, useState } from "react";

export function useAtomVoice(line, next) {
  const audio = useRef(null), current = useRef(line), generation = useRef(0), loaded = useRef(null);
  current.current = line;
  const [started, setStarted] = useState(false), [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false), [captionsOnly, setCaptionsOnly] = useState(false);
  const [finishedId, setFinishedId] = useState(null), [status, setStatus] = useState("Select Start to enable sound.");
  const preference = useRef({ muted, captionsOnly });
  preference.current = { muted, captionsOnly };
  function play(target = current.current) {
    const player = audio.current, token = ++generation.current;
    if (!target || !player) return;
    player.pause();
    player.currentTime = 0;
    loaded.current = target.id;
    setFinishedId(null);
    setPaused(false);
    if (preference.current.captionsOnly || !target.audio) {
      player.removeAttribute("src");
      setFinishedId(target.id);
      setStatus(target.audio ? "Captions only · continue at your own pace" : "Recording unavailable · readable captions remain available");
      return;
    }
    player.dataset.dialogueId = target.id;
    player.src = target.audio;
    player.muted = preference.current.muted;
    player.load();
    setStatus("Loading recording…");
    player.play().then(() => {
      if (token === generation.current) setStatus("Playing");
    }).catch(error => {
      if (token !== generation.current || error.name === "AbortError") return;
      if (error.name === "NotAllowedError") {
        setPaused(true);
        setStatus("Select Resume to permit audio, or choose captions only.");
      } else {
        setFinishedId(target.id);
        setStatus("Recording unavailable · continue with readable captions");
      }
    });
  }
  function start() { setStarted(true); play(); }
  useEffect(() => {
    if (started && line && loaded.current !== line.id) play(line);
  }, [started, line?.id]);
  useEffect(() => {
    if (!started || !next?.audio) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "audio";
    link.href = next.audio;
    document.head.appendChild(link);
    return () => link.remove();
  }, [started, next?.id]);
  function pause() { audio.current?.pause(); setPaused(true); setStatus("Paused"); }
  function resume() {
    setPaused(false);
    if (finishedId === current.current?.id || preference.current.captionsOnly) return;
    if (!audio.current?.getAttribute("src")) { play(); return; }
    const token = generation.current;
    audio.current?.play().then(() => {
      if (token === generation.current) setStatus("Playing");
    }).catch(() => {
      if (token === generation.current) { setPaused(true); setStatus("Audio needs permission. Choose Resume or captions only."); }
    });
  }
  useEffect(() => {
    const player = audio.current;
    const hide = () => { if (document.hidden) pause(); };
    const release = () => {
      generation.current++;
      player?.pause();
      if (player) player.currentTime = 0;
      player?.removeAttribute("src");
      player?.load();
    };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", release);
    return () => { document.removeEventListener("visibilitychange", hide); window.removeEventListener("pagehide", release); release(); };
  }, []);
  function toggleCaptions() {
    const value = !preference.current.captionsOnly;
    preference.current.captionsOnly = value;
    setCaptionsOnly(value);
    play();
  }
  return {
    audio, started, paused, muted, captionsOnly, status, finished: finishedId === line?.id,
    start, pause, resume, replay: () => play(), toggleCaptions,
    toggleMute: () => { const next = !preference.current.muted; preference.current.muted = next; setMuted(next); if (audio.current) audio.current.muted = next; },
    onEnded: event => { if (event.currentTarget.dataset.dialogueId === current.current?.id) { setFinishedId(current.current.id); setStatus("Recording complete"); } },
    onError: () => { if (started && current.current) { setFinishedId(current.current.id); setStatus("Recording unavailable · continue with readable captions"); } },
  };
}

export function AtomFilm({ film, paused, onBusy, onStatus }) {
  const video = useRef(null), lastVideo = useRef(null), [ended, setEnded] = useState(film.held), [failed, setFailed] = useState(false);
  const reduced = useRef(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [requested, setRequested] = useState(!film.held && !reduced.current);
  const callbacks = useRef({ onBusy, onStatus }); callbacks.current = { onBusy, onStatus };
  useEffect(() => () => {
    const player = lastVideo.current;
    player?.pause(); player?.removeAttribute("src"); player?.load();
  }, []);
  useEffect(() => {
    callbacks.current.onBusy(requested && !ended && !failed);
    return () => callbacks.current.onBusy(false);
  }, [requested, ended, failed]);
  useEffect(() => {
    if (!video.current || ended || failed || !requested) return;
    if (paused) video.current.pause();
    else video.current.play().catch(() => { setFailed(true); callbacks.current.onStatus("unavailable"); });
  }, [paused, requested, ended, failed]);
  function skip() {
    video.current?.pause(); setEnded(true); onBusy(false); onStatus("skipped");
  }
  return (
    <div className="ad-film" aria-label="Approved cinematic clip">
      {ended && !failed ? <img src={film.definition.end} alt="Actual final frame of the approved clip" /> :
        requested && !failed ? <video ref={node => { video.current = node; if (node) lastVideo.current = node; }} src={film.definition.url} muted playsInline preload="auto"
          onPlaying={() => onStatus("played")}
          onEnded={() => { setEnded(true); onBusy(false); }}
          onError={() => { setFailed(true); onBusy(false); onStatus("unavailable"); }} /> : null}
      <div className="ad-film-tools">
        {failed ? <span>Clip unavailable · approved scene and captions remain available</span> :
          !requested && !ended ? <button onClick={() => setRequested(true)}>Play clip (optional)</button> :
            !ended ? <button onClick={skip}>Skip clip</button> : <span>Final frame · dialogue continues independently</span>}
      </div>
    </div>
  );
}

export function useAtomFullscreen(root) {
  const [expanded, setExpanded] = useState(false), [native, setNative] = useState(false);
  const trigger = useRef(null);
  useEffect(() => {
    const changed = () => setNative(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, [root]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = event => {
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") { setExpanded(false); trigger.current?.focus(); }
      if (event.key !== "Tab") return;
      const focusable = [...root.current.querySelectorAll('button,input,select,textarea,summary,[tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0]?.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", key); };
  }, [expanded, root]);
  async function toggle(event) {
    trigger.current = event?.currentTarget || trigger.current;
    if (native) await document.exitFullscreen();
    else if (expanded) { setExpanded(false); trigger.current?.focus(); }
    else try { await root.current.requestFullscreen(); } catch { setExpanded(true); }
  }
  return { active: expanded || native, expanded, toggle };
}
