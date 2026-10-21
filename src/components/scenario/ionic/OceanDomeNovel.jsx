import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { IONIC_STORIES, storyImage } from "@/data/ionicStories.mjs";
import { formulaResult } from "@/data/ionicScience.mjs";
import {
  OCEAN_BRIEFING,
  OCEAN_INVESTIGATION,
  OCEAN_DECISION,
  OCEAN_ASSESSMENT,
  OCEAN_FIRST_FEEDBACK,
  OCEAN_VIDEOS,
  OCEAN_SPEAKERS,
  oceanOutcome,
  oceanLines,
  oceanLine,
  oceanPortrait,
} from "@/data/oceanDome.mjs";
import IonicInvestigation from "./IonicInvestigation";
import { OceanFilm, useOceanVoice } from "./OceanMedia";
import "./ocean-dome.css";

const blankFlow = {
  step: 0,
  line: 0,
  feedback: [],
  feedbackIndex: 0,
  done: false,
  visitedModels: [],
};
const chapterTitle = {
  briefing: "You're Needed",
  investigation: "Find the Clues",
  decision: "Make the Call",
  outcome: "See What Happens!",
  assessment: "Prove Your Expertise",
};
const chapterNumber = {
  briefing: 1,
  investigation: 2,
  decision: 3,
  outcome: 4,
  assessment: 5,
};

// Presentation only: the existing response handlers and answer labels stay intact.
function StoryChoice({ number, children, onClick }) {
  return (
    <button className="od-story-choice" onClick={onClick}>
      <span className="od-choice-number" aria-hidden="true">
        {String(number).padStart(2, "0")}
      </span>
      <span className="od-choice-copy">{children}</span>
      <ArrowUpRight className="od-choice-arrow" size={18} aria-hidden="true" />
    </button>
  );
}

export default function OceanDomeNovel({
  scenario,
  stage,
  responses,
  onDraft,
  onComplete,
  mode,
  renderDecision,
  renderOutcome,
  renderAssessment,
}) {
  const [flow, setFlow] = useState(() => ({
    ...blankFlow,
    ...(stage === "investigation" ? responses.investigation?.oceanStory : {}),
  }));
  const [history, setHistory] = useState(() =>
    stage === "investigation"
      ? responses.investigation?.oceanStory?.history || []
      : [],
  );
  const [review, setReview] = useState(null);
  const [notice, setNotice] = useState("");
  const [assessmentResult, setAssessmentResult] = useState(null);
  const record = useRef(responses.investigation || {});
  const callbacks = useRef({ onDraft });
  callbacks.current = { onDraft };
  const steps =
    stage === "briefing"
      ? OCEAN_BRIEFING
      : stage === "investigation"
        ? OCEAN_INVESTIGATION
        : stage === "decision"
          ? OCEAN_DECISION
          : stage === "outcome"
            ? oceanOutcome(responses.scene2?.consequence)
            : OCEAN_ASSESSMENT;
  const step = steps[flow.step] || steps[0];
  const feedback = flow.feedback.map(oceanLine).filter(Boolean);
  const active = feedback.length
    ? feedback[flow.feedbackIndex]
    : step?.lines[flow.line];
  const caption = review || active;

  const art = step ? storyImage(scenario.id, step.art) : scenario.artwork;
  const [failedArt, setFailedArt] = useState("");
  const lastLine = feedback.length
    ? flow.feedbackIndex === feedback.length - 1
    : flow.line === (step?.lines.length || 0) - 1;
  const nextStepData =
    steps[flow.step + 1] ||
    (stage === "briefing" ? OCEAN_INVESTIGATION[0] : null);
  const nextLine = review
    ? null
    : feedback.length
      ? !lastLine
        ? feedback[flow.feedbackIndex + 1]
        : flow.done
          ? nextStepData?.lines[0]
          : step?.lines[flow.line]
      : !lastLine
        ? step?.lines[flow.line + 1]
        : !step?.task || flow.done
          ? nextStepData?.lines[0]
          : null;
  const voice = useOceanVoice(caption, nextLine);
  const canAct =
    voice.started &&
    !voice.paused &&
    lastLine &&
    voice.finished &&
    !review &&
    !feedback.length &&
    !flow.done;
  const speaker = OCEAN_SPEAKERS[caption?.speakerCode];

  useEffect(() => {
    if (!active || !voice.started) return;
    setHistory((previous) =>
      previous.at(-1)?.id === active.id
        ? previous
        : [
            ...previous,
            {
              id: active.id,
              sceneId: active.sceneId,
              speaker: active.speaker,
              line: active.line,
            },
          ],
    );
    setReview(null);
  }, [active?.id, voice.started]);
  // Story cursor is stored alongside, never in place of, the existing evidence.
  useEffect(() => {
    if (stage !== "investigation") return;
    record.current = { ...record.current, oceanStory: { ...flow, history } };
    callbacks.current.onDraft(record.current);
  }, [flow, history, stage]);

  function feedbackLines(lines, done) {
    setNotice("");
    setFlow((previous) => ({
      ...previous,
      feedback: lines.map((line) => line.id),
      feedbackIndex: 0,
      done,
    }));
  }
  function advance() {
    if (voice.waiting || voice.paused || review || !step) return;
    if (feedback.length) {
      if (!lastLine)
        setFlow((previous) => ({
          ...previous,
          feedbackIndex: previous.feedbackIndex + 1,
        }));
      else if (!flow.done)
        setFlow((previous) => ({
          ...previous,
          feedback: [],
          feedbackIndex: 0,
        }));
      else if (stage === "investigation" && step.task === "identity")
        onComplete({
          selectedOption: "A",
          justification: (record.current.evidence || [])
            .map((item) => `${item.label}: ${item.observation}`)
            .join("\n"),
          identifications: record.current.mineral,
          scientificFeedback: "Supported hypothesis",
        });
      else if (stage !== "assessment") nextStep();
    } else if (!lastLine)
      setFlow((previous) => ({ ...previous, line: previous.line + 1 }));
    else if (!step.task || flow.done) {
      if (stage === "briefing" && flow.step === steps.length - 1) onComplete();
      else nextStep();
    }
  }
  const consumed = useRef(null);
  useEffect(() => {
    if (
      !voice.started ||
      voice.paused ||
      !voice.finished ||
      review ||
      !active ||
      !step
    )
      return;
    const token = `${step.id}:${active.id}:${flow.feedbackIndex}:${flow.done}`;
    if (consumed.current === token) return;
    consumed.current = token;
    advance();
  }, [
    voice.started,
    voice.paused,
    voice.finished,
    review,
    active?.id,
    flow.step,
    flow.line,
    flow.feedbackIndex,
    flow.done,
  ]);
  useEffect(() => {
    if (!voice.started || !nextStepData || !lastLine || review) return;
    const image = new Image();
    image.src = storyImage(scenario.id, nextStepData.art);
  }, [voice.started, nextStepData?.id, lastLine, review, scenario.id]);
  function nextStep() {
    setNotice("");
    if (flow.step < steps.length - 1)
      setFlow((previous) => ({
        ...previous,
        step: previous.step + 1,
        line: 0,
        feedback: [],
        feedbackIndex: 0,
        done: false,
      }));
  }
  function draft(next) {
    record.current = { ...next, oceanStory: { ...flow, history } };
    onDraft(record.current);
  }
  function interaction({ type, record: next, correct }) {
    if (!canAct || type !== step.task) return;
    if (type === "formula") {
      const f = next.formula,
        result = formulaResult(f.cation, f.anion, f.positives, f.negatives);
      const supported =
        f.cation === "Ca" && f.anion === "CO3" && result.balanced;
      feedbackLines(
        oceanLines(10, [
          supported ? 6 : result.charge === 0 && !result.minimal ? 5 : 4,
        ]),
        supported,
      );
      if (!supported && result.balanced)
        setNotice(
          "This formula balances, but does its composition match the calcium and carbonate observations? Revise your ion choices.",
        );
    } else if (type === "crystal") {
      const visited = [...new Set([...flow.visitedModels, next.crystal.model])];
      setFlow((previous) => ({ ...previous, visitedModels: visited }));
      // Let the student finish rotating and comparing before recording the conclusion.
    } else if (type === "identity") {
      feedbackLines(
        oceanLines(
          13,
          correct ? [5, 6, 7] : next.mineral === "sodium-chloride" ? [3] : [4],
        ),
        correct,
      );
    } else if (type === "water") {
      setFlow((previous) => ({ ...previous, waterReady: true }));
    } else if (step.after) feedbackLines(step.after, true);
    else setFlow((previous) => ({ ...previous, done: true }));
  }
  function firstChoice(id) {
    feedbackLines(OCEAN_FIRST_FEEDBACK[id], id === "measure");
  }
  function grade(result) {
    setAssessmentResult(result);
    feedbackLines(oceanLines(16, result.passed ? [2, 3] : [4]), true);
  }
  const endOfFeedback =
    !!feedback.length && lastLine && !voice.waiting && flow.done;
  const allowFormCompletion =
    voice.started &&
    !voice.paused &&
    !voice.waiting &&
    !review &&
    (canAct || endOfFeedback || flow.done);
  const showForm =
    voice.started &&
    step?.task &&
    lastLine &&
    voice.finished &&
    !review &&
    !feedback.length;
  const station =
    showForm &&
    [
      "calcium",
      "solubility",
      "carbonate",
      "fingerprint",
      "formula",
      "crystal",
      "water",
      "identity",
    ].includes(step.task)
      ? step.task
      : "none";
  const filmKey = step?.video;
  const movie = filmKey && OCEAN_VIDEOS[filmKey];

  return (
    <section
      className="im-mission im-aquarium od-novel"
      aria-label="Ocean Dome illustrated visual novel"
      data-started={voice.started ? "true" : "false"}
    >
      <div className="od-storybar">
        <span>
          Ocean Dome <b> / </b> Chapter {chapterNumber[stage]} ·{" "}
          {chapterTitle[stage]}
        </span>
        <div className="od-view-controls">
          <span>
            {active?.sceneId || "Teacher preview"} · Al Qana, Abu Dhabi
          </span>
          {voice.fullscreen && (
            <button onClick={voice.onNotebook}>Mission Notebook</button>
          )}
          <button
            onClick={voice.toggleFullscreen}
            aria-pressed={voice.fullscreen}
          >
            {voice.fullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </div>
      <div
        className={`od-viewport im-cinema ${showForm ? "has-workspace" : ""}`}
        data-story-step={step?.id}
      >
        <img
          className="od-art"
          src={failedArt === art ? scenario.artwork : art}
          alt={`Illustrated fictional ${step?.id || "aquarium"} scene`}
          onError={() => setFailedArt(art)}
        />
        {movie && (
          <OceanFilm
            key={`${step.id}:${movie}`}
            src={movie}
            poster={art}
            label={`Ocean Dome ${filmKey} cinematic clip`}
          />
        )}
        <div className="od-scene-label">
          <span>Fictional educational simulation</span>
          <h2>{scenario.title}</h2>
          <p>Separate demonstration loop · Animal exhibits unaffected</p>
        </div>
        {!step && (
          <div className="od-workspace" inert={voice.paused ? "" : undefined}>
            <h3>A decision is needed before its outcome can unfold.</h3>
            <p>
              Return to Make the Call in teacher preview and select one
              response.
            </p>
          </div>
        )}
        {!voice.started && (
          <div className="od-start-screen">
            <p className="od-eyebrow">Your scientific adventure awaits</p>
            <h3>Step into Ocean Dome</h3>
            <p>
              Start the story with synchronized character voices. The story will
              pause whenever your investigation needs a decision.
            </p>
            <button onClick={voice.start}>Start scenario</button>
          </div>
        )}
        {/* The investigation remains mounted, preserving the original instruments and draft. */}
        {stage === "investigation" && (
          <div
            className={`od-workspace ${station === "water" ? "od-water-workspace" : ""}`}
            inert={voice.paused ? "" : undefined}
            hidden={station === "none"}
          >
            <IonicInvestigation
              scenario={scenario}
              initialRecord={record.current}
              onDraft={draft}
              onComplete={onComplete}
              mode={mode}
              station={station}
              embedded
              onInteraction={interaction}
              canContinue={allowFormCompletion}
            />
            {station === "crystal" && (
              <button
                disabled={
                  !flow.visitedModels.includes("NaCl") ||
                  !flow.visitedModels.includes("calcite")
                }
                onClick={() => feedbackLines(step.after, true)}
              >
                Record crystal comparison →
              </button>
            )}
            {station === "water" && (
              <button
                disabled={!flow.waterReady || !record.current.water?.tested}
                onClick={() => feedbackLines(step.after, true)}
              >
                Record water-chemistry trends →
              </button>
            )}
          </div>
        )}
        {showForm && step.task === "first" && (
          <div
            className="od-workspace od-choice-panel od-choice-workspace"
            inert={voice.paused ? "" : undefined}
          >
            <p className="od-choice-kicker">
              Your move <span aria-hidden="true">/</span> Choose a response
            </p>
            <h3>How should we begin?</h3>
            {IONIC_STORIES[scenario.id].firstChoices.map((choice, index) => (
              <StoryChoice
                key={choice.id}
                number={index + 1}
                onClick={() => firstChoice(choice.id)}
              >
                {choice.label}
              </StoryChoice>
            ))}
          </div>
        )}
        {showForm && step.task === "interpret" && (
          <div
            className="od-workspace od-choice-panel od-choice-workspace"
            inert={voice.paused ? "" : undefined}
          >
            <p className="od-choice-kicker">
              Your move <span aria-hidden="true">/</span> Interpret the evidence
            </p>
            <h3>Interpret the isolated gas observation.</h3>
            <p>Use this result with the other independent tests.</p>
            <StoryChoice
              number={1}
              onClick={() => {
                setNotice(
                  "The gas observation supports carbonate behaviour; it does not identify the mineral alone.",
                );
                setFlow((previous) => ({ ...previous, done: true }));
              }}
            >
              It supports carbonate evidence, to compare with other tests
            </StoryChoice>
            <StoryChoice
              number={2}
              onClick={() =>
                setNotice(
                  "Revisit what was actually measured. Gas production does not establish that every white solid is table salt. Try again.",
                )
              }
            >
              It proves every white deposit is sodium chloride
            </StoryChoice>
          </div>
        )}
        {showForm && step.task === "decision" && (
          <div
            className="od-workspace od-choice-panel"
            inert={voice.paused ? "" : undefined}
          >
            {renderDecision(allowFormCompletion)}
          </div>
        )}
        {showForm && step.task === "reflection" && (
          <div className="od-workspace" inert={voice.paused ? "" : undefined}>
            {renderOutcome(allowFormCompletion)}
          </div>
        )}
        {stage === "assessment" && (showForm || !!assessmentResult) && (
          <div
            className="od-workspace od-choice-panel"
            inert={voice.paused ? "" : undefined}
          >
            {renderAssessment(
              grade,
              allowFormCompletion && (!assessmentResult || endOfFeedback),
            )}
          </div>
        )}
        <div
          hidden={!voice.started}
          className={`od-dialogue ${caption?.speakerCode === "NAR" ? "is-narrator" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {speaker?.portrait && (
            <img
              className="od-portrait"
              src={oceanPortrait(caption.speakerCode)}
              alt={`${speaker.name}, ${speaker.role}`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div>
            <p className="od-speaker">
              {caption?.speaker || "Your investigation"}{" "}
              <span>{speaker?.role}</span>
            </p>
            <p className="od-caption">
              {caption?.line ||
                "Choose a professional response to see its consequence."}
            </p>
          </div>
        </div>
      </div>
      {notice && (
        <p className="od-notice" role="status">
          {notice}
        </p>
      )}
      <div className="od-controls" hidden={!voice.started}>
        {voice.controls}
        {review && (
          <button onClick={() => setReview(null)}>Return to story</button>
        )}
      </div>
      <details className="od-history">
        <summary>Conversation history · {history.length} lines</summary>
        <ol>
          {history.map((entry, i) => (
            <li key={`${entry.id}:${i}`}>
              <span>
                {entry.sceneId} · {entry.speaker}
              </span>
              <p>{entry.line}</p>
              <button
                onClick={() => {
                  setReview(oceanLine(entry.id));
                  voice.setPaused(false);
                  voice.replay();
                }}
              >
                Play this line
              </button>
            </li>
          ))}
        </ol>
      </details>
      {stage === "investigation" && (
        <details className="od-ledger">
          <summary>
            Evidence notebook · {record.current.evidence?.length || 0}{" "}
            observations
          </summary>
          <ul>
            {record.current.evidence?.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong> — {item.observation}
              </li>
            ))}
          </ul>
        </details>
      )}
      <footer className="im-disclaimer">
        {scenario.fictionNotice} Illustrations and films establish the fictional
        setting; use the interactive instruments and HTML readings as scientific
        evidence.
      </footer>
    </section>
  );
}
