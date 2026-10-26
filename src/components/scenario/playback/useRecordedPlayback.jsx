import { useEffect, useRef, useState } from "react";

// A beat is identified by scene/checkpoint/cursor, not merely by its recording.
// Each launch also owns a generation: events from a cancelled source cannot finish it.
export function useRecordedPlayback(line, next, { scope, held = false, autoStart = false, initialMuted = false } = {}) {
  const audio = useRef(null), live = useRef({}), generation = useRef(0), cleanup = useRef(() => {}), loaded = useRef(null);
  const issued = useRef(0);
  const [started, setStarted] = useState(autoStart), [manualPause, setManualPause] = useState(false), [tabPause, setTabPause] = useState(false);
  const [muted, setMuted] = useState(initialMuted), [captionsOnly, setCaptionsOnly] = useState(false), [readingRate, setReadingRate] = useState(1);
  const [play, setPlay] = useState({ key: null, instance: 0, status: "ready", finished: false, reading: false });
  const key = `${scope || line?.scene || "scene"}:${line?.id || "none"}`;
  const paused = manualPause || tabPause || held;
  const reading = useRef({ remaining: 0 });
  live.current = { line, key, started, paused, muted, captionsOnly, readingRate };
  function launch() {
    const current = live.current, player = audio.current;
    if (!current.line || !player) return;
    cleanup.current();
    const instance = ++generation.current, activeKey = current.key;
    player.pause(); player.currentTime = 0; player.removeAttribute("src"); player.load();
    loaded.current = activeKey;
    const valid = () => generation.current === instance && live.current.key === activeKey;
    const update = patch => { if (valid()) setPlay(value => ({ ...value, ...patch })); };
    const read = (status = "captions") => {
      reading.current.remaining = Math.max(2400, Math.min(24000, current.line.text.split(/\s+/).length * 350));
      update({ status, reading: true, finished: false });
    };
    setPlay({ key: activeKey, instance, status: "loading", finished: false, reading: false });
    player.dataset.dialogueId = current.line.id;
    player.dataset.playbackInstance = String(instance);
    player.dataset.sceneId = current.line.scene || current.line.sceneId || "scene";
    const ended = () => update({ status: "complete", finished: true });
    const failed = () => { if (valid()) { player.pause(); read("unavailable"); } };
    const playing = () => update({ status: "playing" });
    const waiting = () => update({ status: "buffering" });
    const metadata = () => { if (valid() && current.line.startTime) player.currentTime = current.line.startTime; };
    const segment = () => { if (valid() && current.line.endTime && player.currentTime >= current.line.endTime) { player.pause(); ended(); } };
    player.addEventListener("ended", ended); player.addEventListener("error", failed);
    player.addEventListener("playing", playing); player.addEventListener("waiting", waiting);
    player.addEventListener("loadedmetadata", metadata); player.addEventListener("timeupdate", segment);
    cleanup.current = () => {
      player.removeEventListener("ended", ended); player.removeEventListener("error", failed);
      player.removeEventListener("playing", playing); player.removeEventListener("waiting", waiting);
      player.removeEventListener("loadedmetadata", metadata); player.removeEventListener("timeupdate", segment);
    };
    if (current.captionsOnly || !current.line.audio) { read(); return; }
    player.src = current.line.audio; player.muted = current.muted; player.load();
    if (!current.paused) { issued.current = instance; player.play().catch(error => {
      if (!valid() || error.name === "AbortError") return;
      if (error.name === "NotAllowedError") { setManualPause(true); update({ status: "blocked" }); }
      else failed();
    }); }
  }
  useEffect(() => {
    if (started && line && loaded.current !== key) launch();
  }, [started, key]);
  useEffect(() => {
    const player = audio.current;
    if (!started || !player || play.key !== key) return;
    if (paused || play.reading || play.finished) { player.pause(); if (paused) issued.current = 0; }
    else if (player.getAttribute("src") && issued.current !== play.instance) {
      const instance = generation.current;
      issued.current = instance;
      player.play().catch(error => {
        if (instance !== generation.current || error.name === "AbortError") return;
        if (error.name === "NotAllowedError") setManualPause(true);
      });
    }
  }, [started, paused, key, play.reading, play.finished, play.instance]);
  useEffect(() => {
    if (!started || paused || play.key !== key || !play.reading || play.finished) return;
    const began = performance.now(), instance = play.instance;
    const timer = setTimeout(() => {
      if (instance === generation.current && live.current.key === key && !live.current.paused)
        setPlay(value => ({ ...value, status: "complete", finished: true }));
    }, reading.current.remaining / readingRate);
    return () => { clearTimeout(timer); if (instance === generation.current) reading.current.remaining = Math.max(0, reading.current.remaining - (performance.now() - began) * readingRate); };
  }, [started, paused, key, play.reading, play.finished, play.instance, readingRate]);
  useEffect(() => { if (audio.current) audio.current.muted = muted; }, [muted]);
  useEffect(() => {
    if (!started || !next?.audio || captionsOnly || held) return;
    const abort = new AbortController();
    fetch(next.audio, { cache: "force-cache", signal: abort.signal }).catch(() => {});
    return () => abort.abort();
  }, [started, next?.audio, captionsOnly, held]);
  useEffect(() => {
    const player = audio.current;
    const hide = () => { if (document.hidden) { player?.pause(); setTabPause(true); } };
    const release = () => { generation.current++; cleanup.current(); player?.pause(); if (player) player.currentTime = 0; player?.removeAttribute("src"); player?.load(); loaded.current = null; };
    document.addEventListener("visibilitychange", hide); window.addEventListener("pagehide", release);
    return () => { document.removeEventListener("visibilitychange", hide); window.removeEventListener("pagehide", release); release(); };
  }, []);
  function resume() { setManualPause(false); setTabPause(false); if (!loaded.current && live.current.line) launch(); }
  return {
    audio, started, paused, muted, captionsOnly, readingRate, setReadingRate,
    instance: play.instance, completion: `${play.key}:${play.instance}`, finished: play.key === key && play.finished,
    status: paused ? play.status === "blocked" ? "Select Resume to permit audio, or choose captions only." : "Paused" : started && !line ? "Your investigation · story paused" :
      ({ ready: "Select Start to enable sound.", loading: "Loading recording…", buffering: "Buffering recording…", captions: "Reading captions", unavailable: "Recording unavailable · reading captions", playing: "Playing", complete: "Ready for your response", blocked: "Select Resume to permit audio." }[play.status] || "Preparing story…"),
    start: () => { live.current.started = true; live.current.paused = held; setStarted(true); setManualPause(false); setTabPause(false); launch(); },
    pause: () => { audio.current?.pause(); setManualPause(true); }, resume,
    replay: () => { setManualPause(false); setTabPause(false); live.current.paused = held; launch(); },
    toggleMute: () => setMuted(value => !value),
    toggleCaptions: () => { live.current.captionsOnly = !captionsOnly; live.current.paused = held; setManualPause(false); setTabPause(false); setCaptionsOnly(!captionsOnly); launch(); },
  };
}

export function useAutomaticBeat({ enabled, voice, filmDone = true, onAdvance }) {
  const consumed = useRef(null), advance = useRef(onAdvance); advance.current = onAdvance;
  useEffect(() => {
    if (!enabled || !voice.started || voice.paused || !voice.finished || !filmDone || consumed.current === voice.completion) return;
    consumed.current = voice.completion;
    advance.current();
  }, [enabled, voice.started, voice.paused, voice.finished, voice.completion, filmDone]);
}
