import { useEffect, useRef, useState } from "react";
import { useRecordedPlayback } from "../playback/useRecordedPlayback";
export const useAtomVoice = useRecordedPlayback;

export function AtomFilm({ film, paused, muted = false, onBusy, onStatus }) {
  const video = useRef(null), lastVideo = useRef(null), callbacks = useRef({ onBusy, onStatus });
  callbacks.current = { onBusy, onStatus };
  const reduced = useRef(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [ended, setEnded] = useState(!!film.held), [failed, setFailed] = useState(false);
  const [requested, setRequested] = useState(!film.held && (!reduced.current || film.definition.hasSpeech));
  useEffect(() => () => { const player = lastVideo.current; player?.pause(); player?.removeAttribute("src"); player?.load(); }, []);
  useEffect(() => { callbacks.current.onBusy(requested && !ended && !failed); }, [requested, ended, failed]);
  useEffect(() => {
    const player = video.current;
    if (!player || ended || failed || !requested) return;
    let active = true;
    if (paused) player.pause();
    else player.play().catch(error => { if (active && error.name !== "AbortError") { setFailed(true); callbacks.current.onBusy(false); callbacks.current.onStatus("unavailable"); } });
    return () => { active = false; };
  }, [paused, requested, ended, failed]);
  function done(status) { video.current?.pause(); setEnded(true); onBusy(false); onStatus(status); }
  return <div className="px-atom-film" aria-label="Cinematic scene">
    {ended && !failed && film.definition.end ? <img src={film.definition.end} alt="Final cinematic frame"/> : requested && !failed ?
      <video ref={node => { video.current = node; if (node) lastVideo.current = node; }} src={film.definition.url} muted={!film.definition.hasSpeech || muted} style={reduced.current && film.definition.hasSpeech ? { opacity: 0 } : undefined} playsInline preload="auto"
        onLoadedMetadata={event => { if (film.definition.startTime) event.currentTarget.currentTime = film.definition.startTime; }}
        onTimeUpdate={event => { if (!ended && film.definition.endTime && event.currentTarget.currentTime >= film.definition.endTime) done("complete"); }}
        onPlaying={() => onStatus("played")} onEnded={() => done("complete")}
        onError={() => { setFailed(true); onBusy(false); onStatus("unavailable"); }}/>: null}
    <div className="px-atom-film-tools">{failed ? <span>The scene continues with its still image.</span> : !requested && !ended ?
      <button onClick={() => setRequested(true)}>Play clip (optional)</button> : !ended ? <button onClick={() => done("skipped")}>Skip clip</button> : null}</div>
  </div>;
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
