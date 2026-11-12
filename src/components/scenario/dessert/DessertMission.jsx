import { useEffect, useRef, useState } from "react";
import {
  DESSERT_MEDIA,
  DESSERT_NODES,
  DESSERT_SPEAKERS,
  dessertStep,
  dessertActiveLine,
  dessertNextLine,
  dessertAction,
  dessertNotebook,
  restoreDessertState,
  dessertTrailFromVisited,
} from "@/data/dessertFlow.mjs";
import {
  useRecordedPlayback,
  useAutomaticBeat,
} from "../playback/useRecordedPlayback";
import {
  usePlaybackSuspended,
  useSceneReview,
  PreviousSceneButton,
} from "../playback/ScenarioReview";
import { AtomFilm, useAtomFullscreen } from "../atom/AtomMedia";
import DessertTasks from "./DessertTasks";
import "./dessert.css";

const CHAPTERS = [
  "You're Needed",
  "Find the Clues",
  "Make the Call",
  "See What Happens!",
  "Prove Your Expertise",
];
export default function DessertMission({
  scenario,
  responses,
  onDraft,
  onComplete,
  onNotebook,
  mode,
  isTeacher,
}) {
  const [state, setState] = useState(() => restoreDessertState(responses));
  const current = useRef(state);
  current.current = state;
  const callbacks = useRef({ onDraft, onComplete });
  callbacks.current = { onDraft, onComplete };
  const root = useRef(null),
    full = useAtomFullscreen(root),
    suspended = usePlaybackSuspended(),
    review = useSceneReview();
  const [automatic, setAutomatic] = useState(true),
    [captions, setCaptions] = useState(true),
    [rate, setRate] = useState(1),
    [failedArt, setFailedArt] = useState(false);
  const node = dessertStep(state),
    active = dessertActiveLine(state),
    caption = active || DESSERT_MEDIA.recordings[state.lastLine],
    scope = `dessert:${state.node}:${state.cursor}:${state.feedback?.cursor ?? "story"}:${state.investigation.attempts.length}:${state.firstAttempts.length}`;
  const voice = useRecordedPlayback(active, dessertNextLine(state), {
    scope,
    held: suspended,
    initialMuted: !!state.playback?.muted,
  });
  const restored = useRef(
      state.playback?.line === dessertActiveLine(state)?.id
        ? state.playback
        : null,
    ),
    resumeVideo = useRef(state.playback?.video),
    saved = useRef(false),
    lastCapture = useRef(0);
  const image = DESSERT_MEDIA.images[node.art];
  const videoAt = node.videoAt ? node.lines.indexOf(node.videoAt) : 0;
  const movie =
    node.video && state.cursor >= videoAt
      ? DESSERT_MEDIA.videos[node.video]
      : null;
  const held = ["complete", "skipped"].includes(state.videos[state.node]);
  const [film, setFilm] = useState({ key: null, done: false });
  const filmDone = !movie || held || (film.key === state.node && film.done);
  const canAct =
    voice.started && state.ready && !state.feedback && !voice.paused;
  function send(event) {
    if (suspended) return;
    const previous = current.current,
      next = dessertAction(previous, event, scenario);
    if (next === previous) return;
    current.current = next;
    setState(next);
    callbacks.current.onDraft(dessertNotebook(next));
  }
  useAutomaticBeat({
    enabled: automatic && !!active && !suspended,
    voice,
    filmDone,
    onAdvance: () => send({ type: "continue" }),
  });
  useEffect(() => {
    if (voice.started && active && !suspended) send({ type: "visit" });
  }, [voice.started, active?.id, scope, suspended]);
  useEffect(() => {
    if (!voice.started || suspended) return;
    review.seedTrail(dessertTrailFromVisited(state));
    if (!active) return;
    review.recordScene(
      {
        key: `${scenario.id}:IMAGE_${node.scene}`,
        title: `Scene ${node.scene} · ${node.title}`,
        art: node.scene === 15 ? null : image.url,
        maskForeground: [3, 4].includes(node.scene),
        visual:
          node.scene === 15
            ? {
                ionicFormation: {
                  transferred: state.investigation.electron.transferred > 0,
                },
              }
            : null,
        response: state.investigation.evidence
          .map((e) => `${e.label}: ${e.observation}`)
          .join("\n"),
      },
      {
        id: active.id,
        text: active.text,
        audio: active.audio,
        speaker: DESSERT_SPEAKERS[active.speaker],
        scene: String(node.scene),
        video:
          movie && active.id === node.videoAt
            ? { ...movie, startTime: undefined }
            : null,
      },
    );
  }, [voice.started, active?.id, scope, suspended, review.recordScene]);
  useEffect(() => {
    if (state.completed && state.result && !saved.current && !suspended) {
      saved.current = true;
      callbacks.current.onComplete(state.result);
    }
  }, [state.completed, state.result, suspended]);
  useEffect(() => {
    setFailedArt(false);
  }, [image.url]);
  useEffect(() => {
    const next =
      state.feedback?.after && state.feedback.after !== "ready"
        ? DESSERT_NODES[state.feedback.after]
        : DESSERT_NODES[node.next];
    if (!voice.started || !next) return;
    const preload = new Image();
    preload.src = DESSERT_MEDIA.images[next.art].smallUrl;
  }, [state.node, state.feedback?.after, voice.started]);
  useEffect(() => {
    if (voice.audio.current) voice.audio.current.playbackRate = rate;
  }, [rate, active?.id]);
  useEffect(() => {
    const audio = voice.audio.current;
    function resumePosition() {
      const position = restored.current;
      if (position?.line === audio.dataset.dialogueId && position.time > 0) {
        audio.currentTime = Math.min(
          position.time,
          Math.max(0, audio.duration - 0.1),
        );
        restored.current = null;
      }
    }
    audio.addEventListener("loadedmetadata", resumePosition);
    return () => audio.removeEventListener("loadedmetadata", resumePosition);
  }, []);
  function capturePlayback(event, force = false) {
    if (
      !voice.started ||
      suspended ||
      (!force && Date.now() - lastCapture.current < 2000) ||
      !active
    )
      return;
    lastCapture.current = Date.now();
    const video = root.current?.querySelector("video");
    send({
      type: "playback",
      value: {
        line: active.id,
        time: event.currentTarget.currentTime,
        muted: voice.muted,
        video: video ? { node: state.node, time: video.currentTime } : null,
      },
    });
  }
  function replayLine() {
    if (active) voice.replay();
    else if (caption)
      review.openReview({
        key: `dessert-line:${caption.id}`,
        title: "Previously heard dialogue",
        art: node.scene === 15 ? null : image.url,
        maskForeground: [3, 4].includes(node.scene),
        visual:
          node.scene === 15
            ? {
                ionicFormation: {
                  transferred: state.investigation.electron.transferred > 0,
                },
              }
            : null,
        lines: [{ ...caption, speaker: DESSERT_SPEAKERS[caption.speaker] }],
      });
  }
  function previewNode(value) {
    if (!isTeacher || suspended || !DESSERT_NODES[value]) return;
    const next = {
      ...current.current,
      node: value,
      cursor: 0,
      ready: !DESSERT_NODES[value].lines.length,
      feedback: null,
    };
    current.current = next;
    setState(next);
  }
  const taskVisible = voice.started && !!node.task && node.task !== "done";
  return (
    <section
      ref={root}
      className={`px-dessert ${full.active ? "is-fullscreen" : ""} ${full.expanded ? "is-expanded" : ""}`}
      data-node={state.node}
      data-paused={voice.paused ? "true" : undefined}
      data-ready={state.ready ? "true" : "false"}
      data-feedback={state.feedback ? "true" : "false"}
      aria-label="The Final Dessert cinematic mission"
    >
      <audio
        ref={voice.audio}
        className="px-dessert-voice"
        data-recorded-playback
        hidden
        preload="none"
        onTimeUpdate={capturePlayback}
      />
      <header className="px-dessert-header">
        <div>
          <small>THE FINAL DESSERT</small>
          <strong>
            Scene {node.scene} · {node.title}
          </strong>
        </div>
        <div className="px-dessert-actions">
          <PreviousSceneButton />
          <button
            onClick={() => {
              capturePlayback({ currentTarget: voice.audio.current }, true);
              onNotebook();
            }}
          >
            Mission Notebook
          </button>
          <button aria-pressed={full.active} onClick={full.toggle}>
            {full.active ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </header>
      <ol
        className="px-dessert-chapters"
        aria-label="Five-chapter mission progress"
      >
        {CHAPTERS.map((title, i) => (
          <li
            key={title}
            className={
              node.chapter === i + 1
                ? "is-current"
                : node.chapter > i + 1
                  ? "is-done"
                  : ""
            }
            aria-current={node.chapter === i + 1 ? "step" : undefined}
          >
            <span>{node.chapter > i + 1 ? "✓" : i + 1}</span>
            {title}
          </li>
        ))}
      </ol>
      {isTeacher && (
        <label className="px-dessert-preview">
          Teacher scene preview{" "}
          <select
            aria-label="Teacher scene preview"
            value={state.node}
            onChange={(e) => previewNode(e.target.value)}
          >
            {Object.entries(DESSERT_NODES)
              .filter(
                ([id, n]) =>
                  n.task !== "done" && !["pass", "retry"].includes(id),
              )
              .map(([id, n]) => (
                <option key={id} value={id}>
                  Scene {n.scene} · {n.title}
                </option>
              ))}
          </select>
          <small>
            Viewing a chapter does not create student evidence or a graded
            attempt.
          </small>
        </label>
      )}
      <div
        className={`px-dessert-stage ${taskVisible ? "has-task" : ""} ${node.scene === 15 ? "has-scientific-overlay" : ""}`}
        data-scene={node.scene}
        data-video-id={movie?.id || ""}
      >
        <div
          className={`px-dessert-art ${[3, 4].includes(node.scene) ? "has-label-mask" : ""}`}
        >
          {!failedArt ? (
            <img
              key={image.url}
              className="px-dessert-scene-image"
              src={image.url}
              srcSet={`${image.smallUrl} 768w, ${image.url} 1376w`}
              sizes="(max-width: 768px) 100vw, 1376px"
              loading="eager"
              fetchPriority={node.scene === 1 ? "high" : "auto"}
              alt={`Scene ${node.scene}: ${node.title}`}
              onError={() => setFailedArt(true)}
            />
          ) : (
            <p className="px-dessert-art-unavailable">
              Scene artwork is unavailable. The recorded story and scientific
              controls remain available.
            </p>
          )}
          {movie && voice.started && (
            <div className="px-dessert-film">
              <AtomFilm
                key={state.node}
                film={{
                  id: movie.id,
                  definition: {
                    ...movie,
                    startTime:
                      resumeVideo.current?.node === state.node
                        ? resumeVideo.current.time
                        : undefined,
                  },
                  held,
                }}
                paused={voice.paused}
                onBusy={(busy) => setFilm({ key: state.node, done: !busy })}
                onStatus={(status) => {
                  if (current.current.node === state.node)
                    send({ type: "video", id: movie.id, status });
                }}
              />
            </div>
          )}
          {[3, 4].includes(node.scene) && (
            <div className="px-dessert-label-focus" aria-hidden="true" />
          )}
        </div>
        <p className="px-dessert-fiction">
          Fictional educational simulation · Umm Al Emarat Park, Abu Dhabi
        </p>
        {!voice.started && (
          <section className="px-dessert-welcome">
            <small>A CINEMATIC SCIENCE INVESTIGATION</small>
            <h2>The Final Dessert</h2>
            <h3>12 Minutes to Disaster</h3>
            <p>
              A recipe. Three unidentified powders. One professional decision
              that science alone cannot make for you.
            </p>
            <p>
              The competition deadline is fictional. Your investigations are
              untimed.
            </p>
            <button
              className="px-dessert-primary"
              onClick={() => voice.start()}
            >
              {state.node === "n01" ? "Start Experience" : "Resume Experience"}
            </button>
          </section>
        )}
        {taskVisible && (
          <div className="px-dessert-task">
            <fieldset disabled={!canAct} className="px-dessert-task-controls">
              <DessertTasks
                key={state.node}
                state={state}
                node={node}
                scenario={scenario}
                send={send}
              />
            </fieldset>
          </div>
        )}
        {voice.started && node.chapter === 4 && state.decision && (
          <div className="px-dessert-outcome-banner">
            <span>
              {state.decision.selectedOption === "A"
                ? "Traceable replacements · Original unknowns isolated"
                : "Review this professional outcome"}
            </span>
            <p>
              {
                scenario.scenes[2].consequences[state.decision.consequence]
                  ?.outcome
              }
            </p>
          </div>
        )}
        {voice.started && state.result && (
          <section
            className="px-dessert-result"
            aria-label="Recorded assessment feedback"
          >
            <small>
              {state.result.passed
                ? "Understanding demonstrated"
                : "Review and try again"}
            </small>
            <h2>
              {state.result.score}% ·{" "}
              {state.result.passed
                ? "Ionic Evidence Investigator"
                : "Keep building your expertise"}
            </h2>
            {state.result.passed && state.node === "pass" && (
              <span className="px-dessert-achievement">
                Achievement earned · {scenario.badge}
              </span>
            )}
            {scenario.exitTicket.mcqs.map((q, i) => (
              <details key={q.id}>
                <summary>
                  {i + 1}. {q.question}
                </summary>
                <p>
                  Your answer:{" "}
                  {q.options.find((o) => o.id === state.answers[q.id])?.text}
                </p>
                <p>Supported answer: {q.options.find((o) => o.correct).text}</p>
                <p>{q.explanation}</p>
              </details>
            ))}
          </section>
        )}
        {voice.started &&
          (captions ||
            voice.captionsOnly ||
            voice.status.includes("unavailable")) &&
          caption && (
            <section
              className="px-dessert-dialogue"
              aria-live="polite"
              aria-atomic="true"
              data-dialogue-id={caption.id}
            >
              <div>
                <b>{DESSERT_SPEAKERS[caption.speaker]}</b>
                <span>
                  {state.feedback
                    ? "Investigation response"
                    : "The Final Dessert"}
                </span>
              </div>
              <p>{caption.text}</p>
            </section>
          )}
      </div>
      {voice.started && (
        <div className="px-dessert-controls">
          <div className="px-dessert-actions">
            <button
              onClick={
                voice.paused
                  ? voice.resume
                  : () => {
                      capturePlayback(
                        { currentTarget: voice.audio.current },
                        true,
                      );
                      voice.pause();
                    }
              }
            >
              {voice.paused ? "Resume" : "Pause"}
            </button>
            <button aria-pressed={voice.muted} onClick={voice.toggleMute}>
              {voice.muted ? "Unmute" : "Mute"}
            </button>
            <button onClick={replayLine}>Replay line</button>
            <button
              aria-pressed={voice.captionsOnly}
              onClick={() => {
                setCaptions(true);
                voice.toggleCaptions();
              }}
            >
              {voice.captionsOnly ? "Enable recorded audio" : "Captions only"}
            </button>
            <button
              onClick={() => setCaptions((v) => !v)}
              aria-pressed={captions}
            >
              {captions ? "Hide captions" : "Show captions"}
            </button>
          </div>
          <div className="px-dessert-options">
            <label>
              Story progression
              <select
                aria-label="Story progression"
                value={automatic ? "automatic" : "manual"}
                onChange={(e) => setAutomatic(e.target.value === "automatic")}
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual reading</option>
              </select>
            </label>
            <label>
              Voice speed
              <select
                aria-label="Voice speed"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              >
                <option value="0.8">0.8×</option>
                <option value="1">1×</option>
                <option value="1.2">1.2×</option>
              </select>
            </label>
            {voice.captionsOnly && (
              <label>
                Reading pace
                <select
                  aria-label="Reading pace"
                  value={voice.readingRate}
                  onChange={(e) => voice.setReadingRate(Number(e.target.value))}
                >
                  <option value="0.75">Slower</option>
                  <option value="1">Standard</option>
                  <option value="1.5">Faster</option>
                </select>
              </label>
            )}
            {!automatic && active && (
              <button
                className="px-dessert-primary"
                disabled={!voice.finished || voice.paused || !filmDone}
                onClick={() => send({ type: "continue" })}
              >
                Next
              </button>
            )}
          </div>
          <p role="status">{voice.status}</p>
        </div>
      )}
      <div className="px-dessert-records">
        <details>
          <summary>
            Dialogue history · {state.visited.length} recorded lines
          </summary>
          {state.visited.map((v, i) => {
            const line = DESSERT_MEDIA.recordings[v.id];
            return line ? (
              <div key={i}>
                <b>{DESSERT_SPEAKERS[line.speaker]}</b>
                <p>{line.text}</p>
                <button
                  onClick={() =>
                    review.openReview({
                      key: `dessert-history:${i}`,
                      title: "Previously heard dialogue",
                      art:
                        DESSERT_NODES[v.node]?.scene === 15
                          ? null
                          : DESSERT_MEDIA.images[
                              DESSERT_NODES[v.node]?.art || node.art
                            ].url,
                      maskForeground: [3, 4].includes(
                        DESSERT_NODES[v.node]?.scene,
                      ),
                      visual:
                        DESSERT_NODES[v.node]?.scene === 15
                          ? {
                              ionicFormation: {
                                transferred:
                                  state.investigation.electron.transferred > 0,
                              },
                            }
                          : null,
                      lines: [
                        { ...line, speaker: DESSERT_SPEAKERS[line.speaker] },
                      ],
                    })
                  }
                >
                  Replay this dialogue
                </button>
              </div>
            ) : null;
          })}
        </details>
        <details>
          <summary>
            Scientific evidence · {state.investigation.evidence.length}{" "}
            observations
          </summary>
          {state.investigation.evidence.map((e) => (
            <p key={e.id}>
              <b>{e.label}</b> · {e.observation}
            </p>
          ))}
        </details>
        <p>
          {mode === "beginner"
            ? "Guided mode · Collect controlled observations, then connect independent evidence."
            : mode === "high-achievers"
              ? "Challenge mode · Explain the limits of identification and ingredient traceability."
              : "Standard mode · Observe, compare, justify."}
        </p>
      </div>
      <footer className="px-dessert-footer">
        A fictional competition and incident at a real UAE location. No venue
        endorsement is implied. Never taste or combine unknown substances.
        Readings are simulated educational values.
      </footer>
    </section>
  );
}
