import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { recordSceneVisit, previousVisitedScene } from "@/lib/expedition/sceneTrail.mjs";
import { useAutomaticBeat, useRecordedPlayback } from "./useRecordedPlayback";
import { AtomFilm } from "../atom/AtomMedia";
import DessertFilm from '../dessert/DessertFilm';
import CrystalView from "../atom/CrystalView";
import { TransferModel } from "../atom/AtomModels";
import "./scene-review.css";

const empty = { reviewing: false, notebookOpen: false, recordScene: () => {}, seedTrail: () => {}, openReview: () => {}, previous: null };
const Context = createContext(empty);
export const useSceneReview = () => useContext(Context);
export const usePlaybackSuspended = () => { const state = useSceneReview(); return state.reviewing || state.notebookOpen; };

export function SceneReviewProvider({ children, initialTrail = [], onTrail, onReviewChange, notebookOpen, ready = true }) {
  const [trail, setTrail] = useState([]), [review, setReview] = useState(null);
  const trailRef = useRef([]), reviewRef = useRef(null), seeded = useRef(false), callback = useRef(onTrail), readyRef = useRef(ready);
  callback.current = onTrail; readyRef.current = ready; reviewRef.current = review;
  useLayoutEffect(() => {
    if (!ready || seeded.current) return;
    const safe = Array.isArray(initialTrail) ? initialTrail : [];
    seeded.current = true; trailRef.current = safe; setTrail(safe);
  }, [ready, initialTrail]);
  const recordScene = useCallback((scene, line) => {
    if (!readyRef.current || reviewRef.current) return;
    const next = recordSceneVisit(trailRef.current, scene, line);
    if (next === trailRef.current) return;
    trailRef.current = next; setTrail(next); callback.current?.(next);
  }, []);
  const openReview = useCallback(visit => { if (visit?.lines?.length || visit?.art || visit?.video) setReview({ ...visit, muted: document.querySelector(".xp-mission-workspace audio,.xp-mission-workspace video")?.muted ?? visit.lines?.find(line => line.video)?.video?.muted ?? false }); }, []);
  const seedTrail = useCallback(value => { if (!trailRef.current.length && value.length && !reviewRef.current) { trailRef.current = value; setTrail(value); callback.current?.(value); } }, []);
  const value = useMemo(() => ({ reviewing: !!review, notebookOpen, recordScene, seedTrail, openReview, previous: previousVisitedScene(trail) }), [review, notebookOpen, recordScene, seedTrail, openReview, trail]);
  onReviewChange?.(!!review);
  useEffect(() => {
    if (!review) return;
    // Legacy players retain their DOM and local form state beneath the review dialog.
    const media = [...document.querySelectorAll("audio,video")].filter(element => !element.closest(".px-scene-review")).map(element => ({ element, time: element.currentTime, wasPlaying: !element.paused && !element.ended }));
    media.forEach(item => item.element.pause());
    const speech = window.speechSynthesis, speaking = speech?.speaking && !speech.paused;
    if (speaking) speech.pause();
    return () => {
      for (const { element, time, wasPlaying } of media) {
        if (!element.isConnected) continue;
        try { element.currentTime = time; } catch { /* unavailable legacy media */ }
        // Recorded-speech adapters own their own resume/hidden-tab policy.
        const controlled = element.matches(".px-atom-voice-audio,.od-session > audio,audio[data-recorded-playback]");
        if (wasPlaying && !controlled && !document.hidden && !notebookOpen) element.play().catch(() => {});
      }
      if (speaking && !document.hidden && !notebookOpen) speech.resume();
    };
  }, [!!review]);
  return <Context.Provider value={value}>{children}{review && <SceneReviewDialog visit={review} held={notebookOpen} onReturn={() => setReview(null)} />}</Context.Provider>;
}

export function PreviousSceneButton() {
  const state = useSceneReview();
  return <button type="button" className="px-previous-scene" disabled={!state.previous || state.reviewing} onClick={() => state.openReview(state.previous)}>Previous scene</button>;
}

function SceneReviewDialog({ visit, held, onReturn }) {
  const dialog = useRef(null), [index, setIndex] = useState(0), [filmDone, setFilmDone] = useState(false);
  const rows = visit.lines?.length ? visit.lines : [{ id: `${visit.key}-caption`, text: visit.text || visit.title, audio: null }];
  const row = rows[index], movie = row.video || (index === 0 ? visit.video : null);
  const [readyArt,setReadyArt]=useState(null),[readyFilm,setReadyFilm]=useState(null);
  const artKey=`${visit.key}:${visit.art}`;
  const ready=(!visit.waitForArtwork||!visit.art||readyArt===artKey)&&(visit.kind!=='dessert'||!movie||movie.withheld||readyFilm===index);
  const modelSides = visit.visual?.sides || (visit.key === "atom_dive:S06" ? ["metallic", "ionic"] : null);
  const voice = useRecordedPlayback(row, rows[index + 1], { scope: `scene-review:${visit.key}:${index}`, autoStart: true, held, initialMuted: visit.muted, ready });
  useEffect(() => { dialog.current.showModal(); }, []);
  useEffect(() => { setFilmDone(!movie || !!movie.withheld); }, [index, movie?.url]);
  useAutomaticBeat({ enabled: true, voice: movie?.hasSpeech && !row.audio ? { ...voice, finished: filmDone } : voice, filmDone: !movie || !!movie.withheld || filmDone, onAdvance: () => {
    if (index < rows.length - 1) setIndex(value => value + 1); else onReturn();
  } });
  return <dialog ref={dialog} className="px-scene-review" aria-label="Previous scene review" onCancel={event => { event.preventDefault(); onReturn(); }}>
    <audio className="px-atom-review-audio" ref={voice.audio} hidden preload="none" />
    <header><div><small>Previously visited scene · Review only</small><h2>{visit.title}</h2></div><button onClick={onReturn}>Return to current scene</button></header>
    <div className="px-scene-review-stage" data-scenario-kind={visit.kind} data-foreground-mask={visit.maskForeground ? "true" : undefined}>
      {visit.art && <img src={visit.art} alt="Previously visited scene artwork" onLoad={async event=>{const element=event.currentTarget;try{await element.decode();}catch{/* frame loaded */}if(element.isConnected)setReadyArt(artKey);}} onError={()=>setReadyArt(artKey)} />}
      {visit.visual?.ionicFormation && <TransferModel transferred={visit.visual.ionicFormation.transferred} verified={visit.visual.ionicFormation.transferred} attracting={visit.visual.ionicFormation.transferred} />}
      {visit.visual?.kind && <CrystalView kind={visit.visual.kind} coreLabel electrons={visit.visual.electrons} />}
      {modelSides && <div className="px-scene-review-models">{modelSides.map((kind,i) => <div key={i}><h3>Model {i ? "B" : "A"}</h3><CrystalView kind={kind} grayscale electrons coreLabel={false} /></div>)}</div>}
      {movie && !movie.withheld && (visit.kind==='dessert'?<DessertFilm key={`${visit.key}:${index}`} poster={visit.art} film={{definition:movie}} paused={voice.paused} playAllowed={voice.status === "Playing" || voice.captionsOnly || voice.finished || voice.status.includes("unavailable")} onReady={value=>{if(value)setReadyFilm(index);}} onBusy={busy=>setFilmDone(!busy)} onStatus={()=>{}}/>:<AtomFilm key={`${visit.key}:${index}`} film={{ definition: movie }} paused={voice.paused} muted={voice.muted} onBusy={busy => setFilmDone(!busy)} onStatus={() => {}} />)}
      {visit.maskForeground && <div className="px-scene-review-foreground-mask" aria-hidden="true" />}
      <section aria-live="polite"><strong>{row.speaker || "Your mission"}</strong><p>{row.text}</p></section>
    </div>
    {visit.response && <details><summary>Recorded response · Read only</summary><p>{visit.response}</p></details>}
    <footer><button onClick={voice.paused ? voice.resume : voice.pause}>{voice.paused ? "Resume" : "Pause"}</button><button onClick={voice.toggleMute}>{voice.muted ? "Unmute" : "Mute"}</button><button onClick={voice.replay}>Replay sentence</button><button onClick={voice.toggleCaptions}>{voice.captionsOnly ? "Enable audio" : "Captions only"}</button>
      {voice.captionsOnly && <label>Reading pace <select aria-label="Review reading pace" value={voice.readingRate} onChange={event => voice.setReadingRate(Number(event.target.value))}><option value="0.75">Slower</option><option value="1">Standard</option><option value="1.5">Faster</option></select></label>}
      <p role="status">{voice.status}</p></footer>
  </dialog>;
}
