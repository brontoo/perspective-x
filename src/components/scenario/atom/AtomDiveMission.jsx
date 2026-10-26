import { useEffect, useRef, useState } from "react";
import { ATOM_MEDIA, ATOM_STEPS, ATOM_SPEAKERS, atomLine, activeAtomLine, nextAtomLine, atomAction, restoreAtomState } from "@/data/atomDive.mjs";
import { atomArt, atomMovie, atomVisual, atomSceneDescriptor, atomReviewLine, atomTrailFromVisited } from "@/data/atomPresentation.mjs";
import { useAtomVoice, AtomFilm, useAtomFullscreen } from "./AtomMedia";
import { useAutomaticBeat } from "../playback/useRecordedPlayback";
import usePausableTimers from "../playback/usePausableTimers";
import { PreviousSceneButton, useSceneReview, usePlaybackSuspended } from "../playback/ScenarioReview";
import { MetallicActivity, IonicActivity, ComparisonActivity, StructureModel } from "./AtomModels";
import CrystalView from "./CrystalView";
import "./atom-dive.css";

export default function AtomDiveMission({ value, onDraft, onComplete, onNotebook }) {
  const [state, setState] = useState(() => restoreAtomState(value));
  const current = useRef(state); current.current = state;
  const callbacks = useRef({ onDraft, onComplete }); callbacks.current = { onDraft, onComplete };
  const root = useRef(null), fullscreen = useAtomFullscreen(root), review = useSceneReview(), suspended = usePlaybackSuspended();
  const [reviewModel, setReviewModel] = useState(null), [automatic, setAutomatic] = useState(true);
  const [metalIntroduced, setMetalIntroduced] = useState(false);
  const step = ATOM_STEPS[state.step], task = step.task, narrative = !!state.feedback || !!step.lines;
  const caption = activeAtomLine(state), beat = `${step.scene}:${state.step}:${state.cursor}:${state.feedback?.cursor ?? "story"}:${state.attempts.length}`;
  const metalIntroPending = !metalIntroduced && ["metalEntry", "metalBrief"].includes(state.step);
  const voice = useAtomVoice(narrative && !metalIntroPending ? caption : null, metalIntroPending ? null : nextAtomLine(state), { scope: beat, held: suspended });
  const showingMetalIntro = voice.started && metalIntroPending;
  const introTimers = usePausableTimers(suspended || voice.paused);
  useEffect(() => {
    if (!showingMetalIntro) return;
    const timer = introTimers.setTimeout(() => setMetalIntroduced(true), 4000);
    return () => introTimers.clearTimeout(timer);
  }, [showingMetalIntro, introTimers]);
  const [filmState, setFilmState] = useState({ key: null, done: false });
  const filmMount = useRef({ key: null, held: false });
  const filmLine = (step.lines || []).slice(0, state.cursor + 1).map(atomLine).reverse().find(line => line?.video);
  const movie = atomMovie(narrative ? caption?.video || filmLine?.video : null), filmKey = movie && `${step.scene}:${movie.id}`;
  if (filmMount.current.key !== filmKey) filmMount.current = { key: filmKey, held: !!state.videos[movie?.id] };
  const filmDone = !movie || movie.withheld || filmMount.current.held || filmState.key === filmKey && filmState.done;
  const [failedArt, setFailedArt] = useState(new Set());
  const art = atomArt(step.scene), visual = atomVisual(step.scene, state, caption);
  const hasTask = voice.started && !showingMetalIntro && (!!task || step.scene === "S09");
  const canContinue = voice.started && voice.finished && !voice.paused && filmDone;
  const saved = useRef(false);
  function send(event) {
    if (suspended) return;
    const previous = current.current, next = atomAction(previous, event);
    if (next === previous) return;
    current.current = next; setState(next); callbacks.current.onDraft(next);
  }
  useEffect(() => { if (voice.started && narrative && !suspended && !metalIntroPending) send({ type: "visit" }); }, [voice.started, caption?.id, beat, suspended, metalIntroPending]);
  useEffect(() => {
    if (!voice.started || suspended || metalIntroPending) return;
    review.seedTrail(atomTrailFromVisited(state));
    review.recordScene(atomSceneDescriptor(state, step.scene, caption), narrative ? atomReviewLine(caption) : null);
  }, [state, voice.started, suspended, metalIntroPending, review.recordScene]);
  useAutomaticBeat({ enabled: automatic && narrative && !suspended && !metalIntroPending, voice, filmDone, onAdvance: () => send({ type: "continue" }) });
  useEffect(() => {
    if (automatic && state.step === "result" && state.result && !state.feedback && !saved.current && !suspended) {
      saved.current = true; callbacks.current.onComplete(state.result);
    }
  }, [state.step, state.feedback, state.result, suspended, automatic]);
  useEffect(() => {
    if (state.feedback && step.scene === "S09") root.current?.querySelector(".px-atom-comparison-models")?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [state.feedback, step.scene]);
  function playReview(id) {
    const line = atomLine(id);
    if (line) review.openReview({ ...atomSceneDescriptor(state, step.scene, line), lines: [atomReviewLine(line)] });
  }
  function readQuestion(index) {
    const line = ATOM_MEDIA.dialogue.find(line => line.condition === `question-${index + 1}-read`);
    send({ type: "readQuestion", id: line.id }); playReview(line.id);
  }
  return <section ref={root} className={`px-atom-adventure ${fullscreen.active ? "is-fullscreen" : ""} ${fullscreen.expanded ? "is-expanded" : ""}`} aria-label="ATOM DIVE cinematic mission" data-step={state.step} data-feedback={state.feedback ? "true" : "false"}>
    <audio className="px-atom-voice-audio" ref={voice.audio} hidden preload="none" />
    <header className="px-atom-storybar">
      <div><span>ATOM DIVE</span><strong>{step.scene} / {step.label}</strong></div>
      <div className="px-atom-top-actions"><span>{Number(state.metal.verified) + Number(state.ionic.verified)}/2 investigations verified</span>
        <PreviousSceneButton /><button onClick={onNotebook}>Mission Notebook</button>
        <button onClick={fullscreen.toggle} aria-pressed={fullscreen.active}>{fullscreen.active ? "Exit full screen" : "Full screen"}</button></div>
    </header>
    <div className={`px-atom-stage ${hasTask ? "is-task" : ""}`} data-world={visual?.kind || (visual?.sides ? "comparison" : "laboratory")} data-video-id={movie?.id} data-media-status={movie?.withheld ? "withheld" : "active"}>
      {art && !failedArt.has(art) && <img className="px-atom-environment" src={art} alt={`${step.scene} story environment`} onError={() => setFailedArt(previous => new Set([...previous, art]))} />}
      {movie && !movie.withheld && voice.started && !showingMetalIntro && <AtomFilm key={filmKey} film={{ id: movie.id, definition: movie, held: filmMount.current.held }} paused={voice.paused}
        onBusy={busy => setFilmState({ key: filmKey, done: !busy })} onStatus={status => { if (current.current.step === state.step) send({ type: "video", id: movie.id, status }); }} />}
      <p className="px-atom-fiction">Fictional educational simulation · Masdar City</p>
      {showingMetalIntro && <section className="px-atom-model-intro" role="status" aria-live="polite">
        <p className="px-atom-eyebrow">ORBIT view · Atomic lens</p>
        <h2>Metallic structure model</h2>
        <p>ORBIT’s atomic lens will now reveal a simplified model of the metallic structure.</p>
      </section>}
      {voice.started && !showingMetalIntro && visual?.kind && !hasTask && <section className="px-atom-world-view" aria-label="ORBIT first-person scientific view">
        <p className="px-atom-eyebrow">{visual.recovered ? "External discovery view · ORBIT recovered" : "ORBIT view · Atomic lens"}</p>
        <CrystalView kind={visual.kind} electrons={visual.electrons} coreLabel={visual.kind === "metallic"} />
        {visual.recovered && <svg className="px-atom-recovered-orbit" viewBox="0 0 240 150" role="img" aria-label="Recovered virtual ORBIT, pearl-white robot with cyan eyes and fins"><path d="M51 85 5 117 70 107M189 85l46 32-65-10" fill="#dce1e2" stroke="#8b9da5"/><ellipse cx="120" cy="72" rx="78" ry="58" fill="#edf0ee" stroke="#8299a5" strokeWidth="3"/><rect x="62" y="39" width="116" height="66" rx="30" fill="#203747"/><ellipse cx="96" cy="69" rx="8" ry="15" fill="#8cf1ed"/><ellipse cx="144" cy="69" rx="8" ry="15" fill="#8cf1ed"/></svg>}
      </section>}
      {!voice.started && <section className="px-atom-welcome">
        <p className="px-atom-eyebrow">An illustrated scientific adventure / 10–15 minutes</p>
        <h2>Lost in the Invisible</h2>
        <p>ORBIT’s return map is incomplete. Investigate two atomic worlds, reconstruct their bonding models, and use the evidence to bring the virtual explorer home.</p>
        <p>Start once to hear the story. It pauses for your investigations and decisions. Both worlds are required; scientific activities are untimed.</p>
        <button className="px-atom-primary" onClick={() => { voice.start(); send({ type: "visit" }); }}>{state.step === "opening" ? "Start ATOM DIVE" : "Resume mission"}</button>
      </section>}
      {hasTask && <div className="px-atom-task"><fieldset className="px-atom-response" disabled={voice.paused || narrative}>
        {task === "order" && <section aria-label="Investigation order" className="px-atom-lab">
          <p className="px-atom-eyebrow">Your route / Both worlds required</p><h2>Where will you investigate first?</h2>
          <p>Your choice changes the order, not the evidence you need. The final comparison unlocks after both investigations are verified.</p>
          <div className="px-atom-order"><button onClick={() => send({ type: "chooseOrder", first: "metallic" })}><strong>Metallic world first</strong><span>Inspect ion cores and valence electrons.</span></button>
            <button onClick={() => send({ type: "chooseOrder", first: "ionic" })}><strong>Ionic world first</strong><span>Reconstruct sodium/chlorine formation.</span></button></div>
        </section>}
        {task === "metal" && <MetallicActivity value={state.metal} send={send} />}
        {["transfer", "charges", "attraction", "lattice"].includes(task) && <IonicActivity task={task} value={state.ionic} send={send} />}
        {step.scene === "S09" && <ComparisonActivity value={state.comparison} />}
        {task === "reflection" && <section className="px-atom-lab" aria-label="Mission reflection">
          <p className="px-atom-eyebrow">Back at the research studio</p><h2>Two worlds. What can you explain?</h2>
          <label className="px-atom-field">One difference in how the bonds form<textarea rows={3} value={state.reflection.formation} maxLength={3000} onChange={e => send({ type: "reflectionPatch", patch: { formation: e.target.value } })} /></label>
          <label className="px-atom-field">One difference in what holds the structures together<textarea rows={3} value={state.reflection.attraction} maxLength={3000} onChange={e => send({ type: "reflectionPatch", patch: { attraction: e.target.value } })} /></label>
          <p className="px-atom-model-note">Write at least 12 characters in each explanation. Your teacher can review your reflections alongside the model evidence.</p>
          <button className="px-atom-primary" disabled={!Object.values(state.reflection).every(v => v.trim().length >= 12)} onClick={() => send({ type: "reflectionSave" })}>Save reflection and continue</button>
        </section>}
        {task === "assessment" && <section className="px-atom-lab" aria-label="Five-question exit ticket">
          <p className="px-atom-eyebrow">Exit ticket / 4 out of 5 to pass</p><h2>Prove your understanding.</h2>
          <p>Answer all five, then submit. Correct answers and explanations appear after submission.</p>
          {ATOM_MEDIA.assessment.questions.map((q, index) => <fieldset className="px-atom-question" key={q.id}>
            <legend>{index + 1}. {q.prompt}</legend>
            <button className="px-atom-read-question" onClick={() => readQuestion(index)}>Read question {index + 1}</button>
            {Object.entries(q.options).map(([id, text]) => <label key={id}><input type="radio" name={q.id} checked={state.answers[q.id] === id} onChange={() => send({ type: "answer", id: q.id, answer: id })} /><span>{text}</span></label>)}
          </fieldset>)}
          <button className="px-atom-primary" disabled={!ATOM_MEDIA.assessment.questions.every(q => state.answers[q.id])} onClick={() => send({ type: "assess" })}>Submit all five answers</button>
        </section>}
        {task === "result" && state.result && <section className="px-atom-lab" aria-label="Assessment feedback">
          <p className="px-atom-eyebrow">Your scientific record</p><h2>{state.result.score}% · {state.result.passed ? "Understanding demonstrated" : "Keep building your explanation"}</h2>
          {ATOM_MEDIA.assessment.questions.map((q, i) => <details className="px-atom-answer-feedback" key={q.id}>
            <summary>{i + 1}. {state.answers[q.id] === q.answer ? "Correct" : "Review this concept"} · {q.prompt}</summary>
            <p>Your answer: {q.options[state.answers[q.id]]}</p><p>Supported answer: {q.options[q.answer]}</p><p>{q.explanation}</p>
          </details>)}
          <div className="px-atom-actions"><button onClick={() => setReviewModel(reviewModel === "metallic" ? null : "metallic")}>Review metallic model</button><button onClick={() => setReviewModel(reviewModel === "ionic" ? null : "ionic")}>Review ionic model</button></div>
          {reviewModel && <div className="px-atom-model-review"><StructureModel kind={reviewModel} /><p>Review only. Your submitted answers and earlier evidence remain unchanged.</p></div>}
          <button className="px-atom-primary" disabled={voice.paused} onClick={() => callbacks.current.onComplete(state.result)}>Save result and finish mission</button>
        </section>}
      </fieldset></div>}
      {voice.started && !showingMetalIntro && <section className={`px-atom-dialogue ${caption?.speaker === "NAR" ? "is-narrator" : ""}`} data-dialogue-id={caption?.id} aria-live="polite" aria-atomic="true">
        <p className="px-atom-speaker">{ATOM_SPEAKERS[caption?.speaker] || "Your investigation"}<span>{state.feedback ? "Reconsider using the evidence" : "ATOM DIVE"}</span></p>
        <p className="px-atom-caption">{caption?.text || "Use the model and record your evidence."}</p>
      </section>}
    </div>
    {voice.started && <div className="px-atom-controls">
      <div className="px-atom-transport" aria-label="Narration controls">
        <button onClick={voice.paused ? voice.resume : voice.pause}>{voice.paused ? "Resume" : "Pause"}</button>
        <button onClick={voice.toggleMute} aria-pressed={voice.muted}>{voice.muted ? "Unmute" : "Mute"}</button>
        <button onClick={narrative ? voice.replay : () => playReview(caption?.id)}>Replay</button>
        <button onClick={voice.toggleCaptions} aria-pressed={voice.captionsOnly}>{voice.captionsOnly ? "Enable audio" : "Captions only"}</button>
      </div>
      <label className="px-atom-playback-option">Story playback <select aria-label="Story playback" value={automatic ? "automatic" : "manual"} onChange={event => setAutomatic(event.target.value === "automatic")}><option value="automatic">Automatic</option><option value="manual">Manual reading</option></select></label>
      {voice.captionsOnly && <label className="px-atom-playback-option">Reading pace <select aria-label="Reading pace" value={voice.readingRate} onChange={event => voice.setReadingRate(Number(event.target.value))}><option value="0.75">Slower</option><option value="1">Standard</option><option value="1.5">Faster</option></select></label>}
      {!automatic && narrative && <button className="px-atom-primary" disabled={!canContinue} onClick={() => send({ type: "continue" })}>Continue</button>}
      <p role="status" className="px-atom-audio-status">{showingMetalIntro && !voice.paused ? "Opening the metallic structure model…" : voice.status}</p>
    </div>}
    <div className="px-atom-records">
      <details><summary>Conversation history · {state.visited.length} lines</summary>
        <ol>{state.visited.map((item, index) => { const line = atomLine(item.id); return line ? <li key={`${index}:${line.id}`}><strong>{ATOM_SPEAKERS[line.speaker]}</strong><p>{line.text}</p>
          <button onClick={() => playReview(line.id)}>Replay this dialogue</button></li> : null; })}</ol>
      </details>
      <details><summary>Verified evidence · {state.evidence.length} observations</summary>
        {!state.evidence.length && <p>Verified scientific explanations will appear here and in your Mission Notebook.</p>}
        {state.evidence.map(e => <p key={e.id}><strong>{e.label}</strong><br />{e.observation}</p>)}
        <p>Investigation order: {state.order.join(" → ") || "Not yet chosen"}</p><p>{state.attempts.length} reconsideration attempts and {state.corrections.length} verified actions recorded.</p>
      </details>
      <details className="px-atom-cast"><summary>Meet the research team · Approved character references</summary>
        <div>{Object.entries(ATOM_MEDIA.characters).map(([key, image]) => <figure key={key}><img src={image.url} loading="lazy" alt={key === "C_HAMAD" ? "Hamad in the approved white kandura and ghutra" : key === "C_ALYA" ? "Alya in the approved teal hijab" : key === "C_RASHID" ? "Rashid in the approved technical jacket" : "ORBIT, the virtual explorer"} /><figcaption>{key.replace("C_", "")}</figcaption></figure>)}</div>
      </details>
    </div>
    <footer className="px-atom-footer">The studio and incident are fictional. Masdar City is a real setting; no endorsement is implied. Artistic environments are conceptual simulations; use the precise scientific models as evidence.</footer>
  </section>;
}
