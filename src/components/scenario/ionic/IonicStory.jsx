import { useCallback, useEffect, useRef, useState } from "react";
import { IONIC_STORIES, outcomeFilm, storyImage } from "@/data/ionicStories.mjs";
import { HAMAD } from "@/data/ionicMissions.mjs";
import "./ionic-story.css";

/**
 * Accessible visual-novel presentation for both ionic missions.
 * Speech and labels remain HTML; illustrations contain no baked-in text.
 * Web Speech voices vary by browser. Narration always remains readable.
 */
export default function IonicStory({ scenario, stage = "briefing", responses = {} }) {
  const script = IONIC_STORIES[scenario.id];
  const consequence = responses.scene2?.consequence;
  const lines = stage === "briefing" ? script.intro
    : stage === "investigation" ? script.investigation
    : stage === "decision" ? script.decision
    : stage === "outcome" ? script.outcomes[consequence] || script.ending
    : script.ending;
  const [index, setIndex] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [artFailed, setArtFailed] = useState(false);
  const [clipFailed, setClipFailed] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const utterance = useRef(null);
  const active = lines[Math.min(index, lines.length - 1)];
  const imagePath = storyImage(scenario.id, active.art);
  const fallback = scenario.artwork;
  const extras = script.firstChoices;
  const showPrompt = stage === "investigation" && index === 0;
  const film = stage === "outcome" ? outcomeFilm(scenario.id, consequence) : "";

  const stopVoice = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    utterance.current = null;
  }, []);
  useEffect(() => {
    setArtFailed(false);
    setClipFailed(false);
  }, [imagePath, film]);
  useEffect(() => () => stopVoice(), [stopVoice]);

  function speak(line = active) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    stopVoice();
    const message = new SpeechSynthesisUtterance(line.line);
    message.lang = "en-US";
    message.rate = speed;
    message.pitch = line.speaker === "Narrator" ? .88 : line.speaker === "Hamad" ? .94 : 1.06;
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang && v.lang.startsWith("en"));
    const preferred = line.speaker === "Narrator" ? voices[1] : line.speaker === "Hamad" ? voices[0] : voices[2] || voices[0];
    if (preferred) message.voice = preferred;
    utterance.current = message;
    window.speechSynthesis.speak(message);
  }
  function next() {
    stopVoice();
    if (index < lines.length - 1) {
      setIndex(n => n + 1);
      setSelected("");
      setShowFeedback(false);
    } else setIndex(0);
  }
  function chooseLine(n) {
    stopVoice();
    setIndex(n);
    setShowFeedback(false);
  }
  const feedback = extras.find(o => o.id === selected);
  return (
    <section className="ivn" aria-label={scenario.title + " illustrated story"} style={{ "--ivn-accent": script.accent }}>
      <div className="ivn-stage">
        <img
          key={artFailed ? fallback : imagePath}
          src={artFailed ? fallback : imagePath}
          alt=""
          aria-hidden="true"
          className="ivn-art"
          onError={() => setArtFailed(true)}
        />
        <div className="ivn-scrim" />
        <header className="ivn-topline">
          <div className="ivn-chapter">
            <small>CHAPTER {stage === "briefing" ? "1" : stage === "investigation" ? "2" : stage === "decision" ? "3" : stage === "outcome" ? "4" : "5"}</small>
            <strong>{active.title || (stage === "briefing" ? "You're Needed" : stage === "investigation" ? "Find the Clues" : stage === "decision" ? "Make the Call" : stage === "outcome" ? "See What Happens!" : "Prove Your Expertise")}</strong>
          </div>
          <div className="ivn-tools">
            <button type="button" className="ivn-tool" aria-expanded={logOpen} onClick={() => setLogOpen(v => !v)}>{logOpen ? "Close log" : "Conversation log"}</button>
            <button type="button" className="ivn-tool" onClick={() => {stopVoice();setVoiceOn(v => !v);}} aria-label={voiceOn ? "Disable voice" : "Enable voice"}>{voiceOn ? "Voice on" : "Voice off"}</button>
            <label className="ivn-speed">Speed <select aria-label="Voice speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value="0.8">0.8×</option><option value="1">1×</option><option value="1.2">1.2×</option></select></label>
          </div>
        </header>
        {active.speaker === "Hamad" && <img src={HAMAD.portrait} className="ivn-hamad" alt="" aria-hidden="true" />}
        <div className="ivn-dialogue">
          <span className="ivn-speaker">{active.speaker === "Narrator" ? "NARRATION" : active.speaker.toUpperCase()}</span>
          <p aria-live="polite">{active.line}</p>
          {active.subtitle && <small>{active.subtitle}</small>}
          <div className="ivn-dialogue-actions">
            <span className="ivn-step">{index + 1} / {lines.length}</span>
            <button type="button" className="ivn-tool" onClick={() => speak()} title="Replay the spoken line">▶ Read aloud</button>
            <button type="button" className="ivn-tool" onClick={next}>{index === lines.length - 1 ? "Replay story ↺" : "Next dialogue →"}</button>
          </div>
        </div>
      </div>
      {logOpen && <div className="ivn-log" aria-label="Conversation history">
        <h3>Conversation log</h3>
        {lines.slice(0, index + 1).map((line, n) => <button type="button" key={line.id} onClick={() => chooseLine(n)}><strong>{line.speaker}</strong><span>{line.line}</span></button>)}
      </div>}
      {showPrompt && <div className="ivn-prompt">
        <h3>First decision · How should we begin?</h3>
        <p>The story pauses while you choose. An unsupported idea can be revised.</p>
        <fieldset><legend>Choose your investigation method</legend>
          {extras.map(o => <label key={o.id} className={selected === o.id ? "chosen" : ""}>
            <input type="radio" name={"first-choice-" + scenario.id} checked={selected === o.id} onChange={() => {setSelected(o.id);setShowFeedback(false);}} />
            <span>{o.label}</span>
          </label>)}
        </fieldset>
        <button type="button" disabled={!selected} onClick={() => {stopVoice();setShowFeedback(true);}}>See the consequence</button>
        {showFeedback && <div role="status" className="ivn-response"><strong>{feedback?.correct ? "An evidence-based approach" : "A consequence to consider"}</strong><p>{feedback?.feedback}</p>{!feedback?.correct && <p>You can choose another response. No unsafe action is performed.</p>}</div>}
      </div>}
      {film && !clipFailed && <section className="ivn-optional-video">
        <p>Optional cinematic consequence · The story and transcript remain available above.</p>
        <video key={film} src={film} controls playsInline preload="none" poster={fallback} onError={() => setClipFailed(true)} aria-label={"Optional " + scenario.title + " cinematic outcome"} />
      </section>}
    </section>
  );
}
