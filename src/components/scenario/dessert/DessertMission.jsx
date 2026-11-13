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
import { useAtomFullscreen } from "../atom/AtomMedia";
import DessertTasks from "./DessertTasks";
import DessertArtwork from "./DessertArtwork";
import DessertFilm from "./DessertFilm";
import DessertResultReview from "./DessertResultReview";
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
  completion,
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
    [rate, setRate] = useState(1);
  const [readyArt, setReadyArt] = useState(null),
    [film, setFilm] = useState({ key: null, done: false, ready: false });
  const [recordsOpen, setRecordsOpen] = useState(false);
  const teacherToolbar = useRef(null);
  const recordsDialog = useRef(null);
  const node = dessertStep(state),
    active = dessertActiveLine(state),
    image = DESSERT_MEDIA.images[node.art];
  const visualReady = readyArt === image.url;
  const videoAt = node.videoAt ? node.lines.indexOf(node.videoAt) : 0;
  const movie =
    node.video && state.cursor >= videoAt
      ? DESSERT_MEDIA.videos[node.video]
      : null;
  const held = ["complete", "skipped"].includes(state.videos[state.node]);
  const filmReady = !movie || held || (film.key === state.node && film.ready);
  const filmDone = !movie || held || (film.key === state.node && film.done);
  const mediaReady = visualReady && filmReady;
  const scope = `dessert:${state.node}:${state.cursor}:${state.feedback?.cursor ?? "story"}:${state.investigation.attempts.length}:${state.firstAttempts.length}`;
  const voice = useRecordedPlayback(active, dessertNextLine(state), {
    scope,
    held: suspended || recordsOpen,
    ready: mediaReady,
    initialMuted: !!state.playback?.muted,
  });
  const lastCaption = useRef({
    line: DESSERT_MEDIA.recordings[state.lastLine],
    scene: state.visited.at(-1)?.scene,
  });
  const caption = visualReady
    ? active ||
      (lastCaption.current.scene === node.scene
        ? lastCaption.current.line
        : null)
    : lastCaption.current.line;
  useEffect(() => {
    if (mediaReady && active)
      lastCaption.current = { line: active, scene: node.scene };
  }, [mediaReady, active?.id, node.scene]);
  useEffect(() => {
    if (!full.active) return;
    document.documentElement.classList.add("px-dessert-presenting");
    return () =>
      document.documentElement.classList.remove("px-dessert-presenting");
  }, [full.active]);
  useEffect(() => {
    if (recordsOpen) recordsDialog.current?.showModal();
    else recordsDialog.current?.close();
  }, [recordsOpen]);
  useEffect(() => {
    if (state.completed) {
      voice.audio.current?.pause();
      voice.audio.current?.removeAttribute("src");
      voice.audio.current?.load();
    }
  }, [state.completed]);
  const restored = useRef(
      state.playback?.line === active?.id ? state.playback : null,
    ),
    resumeVideo = useRef(state.playback?.video),
    saved = useRef(false),
    lastCapture = useRef(0);
  const canAct =
    voice.started &&
    state.ready &&
    !state.feedback &&
    !voice.paused &&
    visualReady;
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
    enabled: automatic && !!active && !suspended && mediaReady,
    voice,
    filmDone,
    onAdvance: () => send({ type: "continue" }),
  });
  useEffect(() => {
    if (voice.started && active && !suspended && mediaReady)
      send({ type: "visit" });
  }, [voice.started, active?.id, scope, suspended, mediaReady]);
  useEffect(() => {
    if (!voice.started || suspended || !mediaReady) return;
    review.seedTrail(dessertTrailFromVisited(state));
    if (!active) return;
    review.recordScene(
      {
        key: `${scenario.id}:IMAGE_${node.scene}`,
        title: `Scene ${node.scene} · ${node.title}`,
        kind: "dessert",
        waitForArtwork: true,
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
  }, [
    voice.started,
    active?.id,
    scope,
    suspended,
    mediaReady,
    review.recordScene,
  ]);
  useEffect(() => {
    if (state.completed && state.result && !saved.current && !suspended) {
      saved.current = true;
      callbacks.current.onComplete(state.result);
    }
  }, [state.completed, state.result, suspended]);
  useEffect(() => {
    const next =
      state.feedback?.after && state.feedback.after !== "ready"
        ? DESSERT_NODES[state.feedback.after]
        : DESSERT_NODES[node.next];
    if (!voice.started || !next || (node.task === "first" && !state.feedback))
      return;
    const preload = new Image();
    const target = DESSERT_MEDIA.images[next.art];
    preload.srcset = `${target.smallUrl} 768w, ${target.url} 1376w`;
    preload.sizes = "(max-width: 768px) 100vw, 1376px";
    preload.src = target.url;
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
  function openReadOnly(visit) {
    setRecordsOpen(false);
    review.openReview({ ...visit, kind: "dessert", waitForArtwork: true });
  }
  function replayLine() {
    if (active) voice.replay();
    else if (caption)
      openReadOnly({
        key: `dessert-line:${caption.id}`,
        title: "Previously heard dialogue",
        kind: "dessert",
        waitForArtwork: true,
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
    if (full.active && teacherToolbar.current)
      teacherToolbar.current.open = false;
  }
  const taskVisible = voice.started && !!node.task && node.task !== "done";
  const recordsContent = (
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
                  openReadOnly({
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
  );
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
          {isTeacher && !state.completed && (
            <details
              className="px-dessert-preview"
              ref={teacherToolbar}
              open={!full.active}
            >
              <summary>Teacher preview</summary>
              <label>
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
            </details>
          )}
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
      {state.completed && state.result ? (
        <DessertResultReview
          state={state}
          scenario={scenario}
          completion={completion}
        />
      ) : (
        <>
          <div
            className={`px-dessert-stage ${taskVisible ? "has-task" : ""} ${node.scene === 15 ? "has-scientific-overlay" : ""}`}
            data-scene={node.scene}
            data-video-id={movie?.id || ""}
          >
            <DessertArtwork
              image={image}
              scene={node.scene}
              title={node.title}
              onReady={setReadyArt}
            >
              {movie && voice.started && visualReady && (
                <div className="px-dessert-film">
                  <DessertFilm
                    key={state.node}
                    poster={image.url}
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
                    playAllowed={
                      voice.status === "Playing" ||
                      voice.captionsOnly ||
                      voice.finished ||
                      voice.status.includes("unavailable")
                    }
                    onReady={(ready) => {
                      if (current.current.node === state.node)
                        setFilm((previous) => ({
                          ...previous,
                          key: state.node,
                          ready,
                        }));
                    }}
                    onBusy={(busy) => {
                      if (current.current.node === state.node)
                        setFilm((previous) => ({
                          ...previous,
                          key: state.node,
                          done: !busy,
                        }));
                    }}
                    onStatus={(status) => {
                      if (current.current.node === state.node)
                        send({ type: "video", id: movie.id, status });
                    }}
                  />
                </div>
              )}
            </DessertArtwork>
            {!visualReady && voice.started && (
              <p className="px-dessert-loading" role="status">
                Preparing the next scene…
              </p>
            )}
            <p className="px-dessert-fiction">
              Fictional educational simulation · Umm Al Emarat Park, Abu Dhabi
            </p>
            {!voice.started && (
              <section className="px-dessert-welcome">
                <small>A CINEMATIC SCIENCE INVESTIGATION</small>
                <h2>The Final Dessert</h2>
                <h3>12 Minutes to Disaster</h3>
                <p>
                  A recipe. Three unidentified powders. One professional
                  decision that science alone cannot make for you.
                </p>
                <p>
                  The competition deadline is fictional. Your investigations are
                  untimed.
                </p>
                <button
                  className="px-dessert-primary"
                  onClick={() => voice.start()}
                >
                  {state.node === "n01"
                    ? "Start Experience"
                    : "Resume Experience"}
                </button>
              </section>
            )}
            {taskVisible && (
              <div className="px-dessert-task">
                <fieldset
                  disabled={!canAct}
                  className="px-dessert-task-controls"
                >
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
                    voice.paused && !voice.awaitingVisual
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
                  {voice.paused && !voice.awaitingVisual ? "Resume" : "Pause"}
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
                  {voice.captionsOnly
                    ? "Enable recorded audio"
                    : "Captions only"}
                </button>
                <button
                  onClick={() => setCaptions((v) => !v)}
                  aria-pressed={captions}
                >
                  {captions ? "Hide captions" : "Show captions"}
                </button>
              </div>
              {full.active && (
                <button
                  className="px-dessert-record-trigger"
                  onClick={() => setRecordsOpen(true)}
                >
                  Mission record
                </button>
              )}
              <details className="px-dessert-options" open={!full.active}>
                <summary>Playback options</summary>
                <div className="px-dessert-options-content">
                  <label>
                    Story progression
                    <select
                      aria-label="Story progression"
                      value={automatic ? "automatic" : "manual"}
                      onChange={(e) =>
                        setAutomatic(e.target.value === "automatic")
                      }
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
                        onChange={(e) =>
                          voice.setReadingRate(Number(e.target.value))
                        }
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
              </details>
              <p role="status">
                {state.ready && state.notice && !voice.paused
                  ? state.notice
                  : voice.status}
              </p>
            </div>
          )}
          <dialog
            ref={recordsDialog}
            className="px-dessert-record-dialog"
            open={undefined}
            onCancel={(event) => {
              event.preventDefault();
              setRecordsOpen(false);
            }}
          >
            <header>
              <h2>Mission record</h2>
              <button autoFocus onClick={() => setRecordsOpen(false)}>
                Close mission record
              </button>
            </header>
            {full.active && (
              <div className="px-dessert-record-summary">
                <p>
                  {state.investigation.evidence.length} collected observations ·{" "}
                  {state.visited.length} heard lines
                </p>
                <button
                  onClick={() => {
                    setRecordsOpen(false);
                    onNotebook();
                  }}
                >
                  Open Mission Notebook
                </button>
                <button
                  onClick={() => {
                    setRecordsOpen(false);
                    replayLine();
                  }}
                >
                  Replay current dialogue
                </button>
              </div>
            )}
            {full.active && recordsContent}
          </dialog>
          {!full.active && recordsContent}
          <footer className="px-dessert-footer">
            A fictional competition and incident at a real UAE location. No
            venue endorsement is implied. Never taste or combine unknown
            substances. Readings are simulated educational values.
          </footer>
        </>
      )}
    </section>
  );
}
