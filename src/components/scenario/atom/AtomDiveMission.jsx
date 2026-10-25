import { useEffect, useRef, useState } from "react";
import { ATOM_MEDIA, ATOM_STEPS, ATOM_SPEAKERS, atomLine, activeAtomLine, nextAtomLine, atomAction, restoreAtomState } from "@/data/atomDive.mjs";
import { useAtomVoice, AtomFilm, useAtomFullscreen } from "./AtomMedia";
import { MetallicActivity, IonicActivity, ComparisonActivity, StructureModel } from "./AtomModels";
import "./atom-dive.css";

export default function AtomDiveMission({ value, onDraft, onComplete, onNotebook }) {
  const [state, setState] = useState(() => restoreAtomState(value));
  const current = useRef(state); current.current = state;
  const callbacks = useRef({ onDraft, onComplete }); callbacks.current = { onDraft, onComplete };
  const root = useRef(null), fullscreen = useAtomFullscreen(root);
  const [review, setReview] = useState(null), [reviewModel, setReviewModel] = useState(null);
  const step = ATOM_STEPS[state.step], task = step.task;
  const actual = activeAtomLine(state), caption = atomLine(review) || actual;
  const voice = useAtomVoice(caption, review ? null : nextAtomLine(state));
  const [film, setFilm] = useState(null), [filmBusy, setFilmBusy] = useState(false);
  const filmScene = useRef(null), filmAllowed = useRef(null);
  const [failedArt, setFailedArt] = useState(new Set()), [noArt, setNoArt] = useState(false);
  const scene = ATOM_MEDIA.story.story_sequence.find(scene => scene.id === step.scene);
  const art = failedArt.has(scene.art) ? ATOM_MEDIA.images.AD_I01_lab.url : scene.art;
  const hasTask = !!task && !state.feedback && voice.started;
  const canContinue = voice.started && voice.finished && !voice.paused && !filmBusy && !review;
  function send(event) {
    const previous = current.current, next = atomAction(previous, event);
    if (next === previous) return;
    current.current = next;
    if (next.step !== previous.step || next.feedback !== previous.feedback) setReview(null);
    setState(next);
    callbacks.current.onDraft(next);
    if (next.feedback && next.attempts.length > previous.attempts.length && activeAtomLine(next)?.id === caption?.id) voice.replay();
  }
  useEffect(() => { if (voice.started && !review) send({ type: "visit" }); }, [voice.started, actual?.id, state.attempts.length, review]);
  useEffect(() => { setNoArt(false); }, [scene.art]);
  useEffect(() => {
    if (!voice.started || review) return;
    if (filmScene.current !== step.scene) {
      const previousClip = (step.lines || []).slice(0, state.cursor + 1).map(atomLine).reverse().find(line => line?.video && current.current.videos[line.video]);
      setFilm(previousClip ? { id: previousClip.video, definition: ATOM_MEDIA.videos[previousClip.video], held: true } : null);
      setFilmBusy(false); filmScene.current = step.scene; filmAllowed.current = null;
    }
    if (caption?.video && filmAllowed.current !== caption.id) {
      filmAllowed.current = caption.id;
      const definition = ATOM_MEDIA.videos[caption.video], held = !!current.current.videos[caption.video];
      if (definition) { setFilm({ id: caption.video, definition, held }); setFilmBusy(!held && !window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    }
  }, [voice.started, step.scene, caption?.id, review]);
  const artFailed = () => {
    if (art === ATOM_MEDIA.images.AD_I01_lab.url) setNoArt(true);
    else setFailedArt(previous => new Set([...previous, scene.art]));
  };
  const sequence = state.feedback?.ids || step.lines || [];
  const cursor = state.feedback?.cursor ?? state.cursor;
  const buttonLabel = state.feedback ? state.step === "result" ? "View assessment feedback" : "Return to investigation" : cursor < sequence.length - 1 ? "Continue" : step.action || "Continue";
  function readQuestion(index) {
    const line = ATOM_MEDIA.dialogue.find(line => line.condition === `question-${index + 1}-read`);
    send({ type: "readQuestion", id: line.id }); playReview(line.id);
  }
  function playReview(id) { if (review === id) voice.replay(); else setReview(id); }
  return <section ref={root} className={`px-atom-adventure ${fullscreen.active ? "is-fullscreen" : ""} ${fullscreen.expanded ? "is-expanded" : ""}`} aria-label="ATOM DIVE cinematic mission" data-step={state.step}>
    <audio className="px-atom-voice-audio" ref={voice.audio} hidden preload="none" onEnded={voice.onEnded} onError={voice.onError} />
    <header className="px-atom-storybar">
      <div><span>ATOM DIVE</span><strong>{step.scene} / {step.label}</strong></div>
      <div className="px-atom-top-actions"><span>{Number(state.metal.verified) + Number(state.ionic.verified)}/2 investigations verified</span>
        <button onClick={() => { if (voice.started) voice.pause(); onNotebook(); }}>Mission Notebook</button>
        <button onClick={fullscreen.toggle} aria-pressed={fullscreen.active}>{fullscreen.active ? "Exit full screen" : "Full screen"}</button></div>
    </header>
    <div className={`px-atom-stage ${hasTask ? "is-task" : ""}`}>
      {!noArt && <img className="px-atom-environment" src={art} alt={`Approved ${step.scene} scene: ${step.label}`} onError={artFailed} />}
      {film && voice.started && <AtomFilm key={`${film.id}:${step.scene}`} film={film} paused={voice.paused || !!review}
        onBusy={setFilmBusy} onStatus={status => send({ type: "video", id: film.id, status })} />}
      <p className="px-atom-fiction">Fictional educational simulation · Masdar City · No actual shrinking or real rescue</p>
      {(failedArt.has(scene.art) || noArt) && <p className="px-atom-media-notice">Scene artwork unavailable. {noArt ? "The scientific activities and captions remain available." : "Using the approved research-room still."}</p>}
      {!voice.started && <section className="px-atom-welcome">
        <p className="px-atom-eyebrow">An illustrated scientific adventure / 10–15 minutes</p>
        <h2>Lost in the Invisible</h2>
        <p>ORBIT’s return map is incomplete. Investigate two atomic worlds, reconstruct their bonding models, and use the evidence to bring the virtual explorer home.</p>
        <p>Choose either investigation first. Both are required. You control the dialogue; scientific activities are untimed.</p>
        <button className="px-atom-primary" onClick={() => { voice.start(); send({ type: "visit" }); }}>{state.step === "opening" ? "Start ATOM DIVE" : "Resume mission"}</button>
      </section>}
      {hasTask && <div className="px-atom-task" inert={voice.paused ? "" : undefined}>
        {task === "order" && <section aria-label="Investigation order" className="px-atom-lab">
          <p className="px-atom-eyebrow">Your route / Both worlds required</p><h2>Where will you investigate first?</h2>
          <p>Your choice changes the order, not the evidence you need. The final comparison unlocks after both investigations are verified.</p>
          <div className="px-atom-order"><button onClick={() => send({ type: "chooseOrder", first: "metallic" })}><strong>Metallic world first</strong><span>Inspect ion cores and valence electrons.</span></button>
            <button onClick={() => send({ type: "chooseOrder", first: "ionic" })}><strong>Ionic world first</strong><span>Reconstruct sodium/chlorine formation.</span></button></div>
        </section>}
        {task === "metal" && <MetallicActivity value={state.metal} send={send} />}
        {["transfer", "charges", "attraction", "lattice"].includes(task) && <IonicActivity task={task} value={state.ionic} send={send} />}
        {task === "comparison" && <ComparisonActivity value={state.comparison} send={send} />}
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
          <button className="px-atom-primary" disabled={voice.paused || !!review} onClick={() => callbacks.current.onComplete(state.result)}>Save result and finish mission</button>
        </section>}
      </div>}
      {voice.started && <section className={`px-atom-dialogue ${caption?.speaker === "NAR" ? "is-narrator" : ""}`} data-dialogue-id={caption?.id} aria-live="polite" aria-atomic="true">
        <p className="px-atom-speaker">{ATOM_SPEAKERS[caption?.speaker] || "Your investigation"}<span>{review ? "Conversation review" : state.feedback ? "Reconsider using the evidence" : "ATOM DIVE"}</span></p>
        <p className="px-atom-caption">{caption?.text || "Use the model and record your evidence."}</p>
      </section>}
    </div>
    {voice.started && <div className="px-atom-controls">
      <div className="px-atom-transport" aria-label="Narration controls">
        <button onClick={voice.paused ? voice.resume : voice.pause}>{voice.paused ? "Resume" : "Pause"}</button>
        <button onClick={voice.toggleMute} aria-pressed={voice.muted}>{voice.muted ? "Unmute" : "Mute"}</button>
        <button onClick={voice.replay}>Replay</button>
        <button onClick={voice.toggleCaptions} aria-pressed={voice.captionsOnly}>{voice.captionsOnly ? "Enable audio" : "Captions only"}</button>
      </div>
      {review ? <button className="px-atom-primary" onClick={() => setReview(null)}>Return to current dialogue</button> :
        (state.feedback || step.lines) && <button className="px-atom-primary" disabled={!canContinue} onClick={() => send({ type: "continue" })}>{state.feedback && cursor < sequence.length - 1 ? "Continue" : buttonLabel}</button>}
      <p role="status" className="px-atom-audio-status">{voice.status}{filmBusy ? " · Clip playing; Skip clip is available" : ""}</p>
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
