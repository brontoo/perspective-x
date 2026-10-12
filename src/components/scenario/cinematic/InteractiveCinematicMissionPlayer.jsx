import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { ionicDessertTimeline } from "@/data/cinematicMissions/ionicDessertTimeline.mjs";
import { ionicAquariumTimeline } from "@/data/cinematicMissions/ionicAquariumTimeline.mjs";
import {
  restoreRuntime,
  nextRuntime,
  phaseForScene,
  checkpointScene,
} from "@/data/cinematicMissions/runtime.mjs";
import { CinematicAudioController } from "./CinematicAudioController.mjs";
import { CinematicDialogueEngine } from "./CinematicDialogueEngine.mjs";
import { useScenarioAudio } from "@/hooks/useScenarioAudio";
import IonicInvestigation from "../ionic/IonicInvestigation";
import { MakeTheCall, Assessment } from "../ionic/IonicMission";
import CinematicSceneRenderer from "./CinematicSceneRenderer";
import CinematicMissionControls from "./CinematicMissionControls";
import CinematicInteractionOverlay from "./CinematicInteractionOverlay";
import CinematicReflection from "./CinematicReflection";
import useCinematicAudioLease from "./useCinematicAudioLease";
import "../ionic/ionic-missions.css";
import "./cinematic-mission.css";
const titles = [
  "You're Needed",
  "Find the Clues",
  "Make the Call",
  "See What Happens!",
  "Prove Your Expertise",
];
function storedMute() {
  try {
    return localStorage.getItem("px:cinematic:muted") === "true";
  } catch {
    return false;
  }
}
export default function InteractiveCinematicMissionPlayer({
  scenario,
  phase,
  responses,
  mode,
  isTeacher,
  onRuntimeChange,
  onRecord,
  onStageComplete,
  onNotebook,
  back,
  externalPaused,
  completion,
  previewControls,
  saveStatus,
  saveError,
}) {
  const manifest =
    scenario.id === "ionic_dessert_mystery"
      ? ionicDessertTimeline
      : ionicAquariumTimeline;
  const [runtime, setRuntime] = useState(() =>
    restoreRuntime(manifest, phase, responses, isTeacher),
  );
  const [started, setStarted] = useState(false),
    [playing, setPlaying] = useState(false),
    [muted, setMuted] = useState(storedMute);
  const [captions, setCaptions] = useState(true),
    [caption, setCaption] = useState(null),
    [volume, setVolume] = useState(0.85),
    [effectsVolume, setEffectsVolume] = useState(0.25);
  const [captionFallback, setCaptionFallback] = useState(false);
  const runtimeRef = useRef(runtime),
    expectedPhase = useRef(phase),
    audio = useRef(null),
    engine = useRef(null);
  const audioLease = useCinematicAudioLease(
    started && playing && !muted && !externalPaused,
  );
  const audioMuted = muted || audioLease !== "granted";
  const callbacks = useRef({});
  const effects = useScenarioAudio({
    enabled: started && playing && !audioMuted && !externalPaused,
    volume: effectsVolume,
  });
  callbacks.current = {
    onRuntimeChange,
    onStageComplete,
    cue: effects.playCinematicCue,
  };
  runtimeRef.current = runtime;
  const scene = manifest.scenes[runtime.sceneId];
  const checkpoint = runtime.interaction;
  useEffect(() => {
    audio.current = new CinematicAudioController();
    return () => {
      audio.current?.dispose();
    };
  }, []);
  function transition(next, persist = true) {
    runtimeRef.current = next;
    setRuntime(next);
    setCaption(null);
    expectedPhase.current =
      next.interaction === "complete"
        ? "complete"
        : phaseForScene(manifest.scenes[next.sceneId]);
    if (persist) callbacks.current.onRuntimeChange(next, expectedPhase.current);
  }
  useEffect(() => {
    if (phase === "complete") {
      const node = checkpointScene(manifest, "complete");
      if (runtimeRef.current.sceneId !== node.id) {
        setRuntime({
          ...runtimeRef.current,
          sceneId: node.id,
          interaction: "complete",
        });
        setCaption(null);
        effects.playCinematicCue("complete");
      }
    } else if (isTeacher && phase !== expectedPhase.current) {
      setRuntime(
        restoreRuntime(
          manifest,
          phase,
          { ...responses, cinematic: null },
          true,
        ),
      );
      expectedPhase.current = phase;
    }
  }, [phase, isTeacher]);
  useEffect(() => {
    const controller = audio.current;
    controller.configure({ muted: audioMuted, volume });
    controller.cancel();
    if (engine.current) {
      engine.current.setPaused(true);
      engine.current.setPaused(
        !playing || !!checkpoint || externalPaused || document.hidden,
      );
    }
  }, [audioMuted, volume]);
  useEffect(() => {
    const controller = audio.current;
    controller.configure({ muted: audioMuted, volume });
    effects.stopAll();
    setCaption(null);
    const active = new CinematicDialogueEngine({
      scene,
      audio: controller,
      onLine: (line) => {
        setCaption(line);
        setCaptionFallback(false);
      },
      onFallback: () => setCaptionFallback(true),
      onCue: (cue) => callbacks.current.cue(cue),
      onEnd: () => transition(nextRuntime(manifest, runtimeRef.current)),
    });
    engine.current = active;
    active.setPaused(
      !playing || !!checkpoint || externalPaused || document.hidden,
    );
    return () => {
      active.dispose();
      effects.stopAll();
    };
  }, [scene.id, checkpoint]);
  useEffect(() => {
    const pause =
      !started || !playing || !!checkpoint || externalPaused || document.hidden;
    engine.current?.setPaused(pause);
    if (pause) {
      audio.current?.cancel();
      effects.stopAll();
    }
  }, [playing, started, externalPaused, checkpoint]);
  useEffect(() => {
    const timer = setInterval(() => engine.current?.tick(100), 100);
    const hidden = () => {
      if (document.hidden) {
        setPlaying(false);
        engine.current?.setPaused(true);
        audio.current?.cancel();
        effects.stopAll();
      }
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  useEffect(() => {
    const next = manifest.scenes[scene.next];
    if (!next) return;
    const image = new Image();
    image.src =
      window.innerWidth <= 700 && next.mobileImage
        ? next.mobileImage
        : next.image;
  }, [scene.id]);
  useEffect(() => {
    if (
      !checkpoint ||
      !manifest.prompts[checkpoint] ||
      !started ||
      !playing ||
      audioMuted ||
      externalPaused
    )
      return;
    const event = {
      id: `${checkpoint}-prompt`,
      speaker: "Hamad",
      voiceProfile: "Hamad",
      text: manifest.prompts[checkpoint],
      subtitle: manifest.prompts[checkpoint],
      rate: 0.96,
    };
    audio.current.speak(
      event,
      () => {},
      () => {},
    );
    return () => audio.current?.cancel();
  }, [checkpoint, started, playing, audioMuted, externalPaused]);
  function play() {
    setStarted(true);
    setPlaying((value) => !value);
  }
  function toggleMute() {
    const value = !muted;
    setMuted(value);
    try {
      localStorage.setItem("px:cinematic:muted", String(value));
    } catch {
      /* optional preference */
    }
  }
  function replayLine() {
    setStarted(true);
    setPlaying(true);
    if (!checkpoint) engine.current?.replay();
    else if (manifest.prompts[checkpoint]) {
      const event = {
        id: `${checkpoint}-prompt`,
        speaker: "Hamad",
        voiceProfile: "Hamad",
        text: manifest.prompts[checkpoint],
        subtitle: manifest.prompts[checkpoint],
        rate: 0.96,
      };
      setCaption(event);
      audio.current.configure({ muted: audioMuted, volume });
      audio.current.speak(
        event,
        () => {},
        () => {},
      );
    }
  }
  function completeCheckpoint(value, evidenceId) {
    audio.current?.cancel();
    setStarted(true);
    setPlaying(true);
    if (checkpoint === "decision") {
      callbacks.current.onStageComplete("decision", value);
      transition(
        nextRuntime(manifest, runtimeRef.current, {
          checkpointComplete: true,
          consequence: value.consequence,
        }),
      );
    } else if (checkpoint === "clues" || checkpoint === "mineral") {
      callbacks.current.onStageComplete("investigation", value);
      transition(
        nextRuntime(manifest, runtimeRef.current, { checkpointComplete: true }),
      );
    } else if (checkpoint === "reflection") {
      onRecord("reflectionEvidence", evidenceId);
      callbacks.current.onStageComplete("reflection", value);
      transition(
        nextRuntime(manifest, runtimeRef.current, { checkpointComplete: true }),
      );
    } else if (checkpoint === "assessment")
      callbacks.current.onStageComplete("assessment", value);
    else
      transition(
        nextRuntime(manifest, runtimeRef.current, { checkpointComplete: true }),
      );
  }
  function recordInvestigation(value) {
    onRecord("investigation", value);
    const old = responses.investigation?.evidence || [];
    if (value.evidence.length !== old.length)
      effects.playCinematicCue(
        checkpoint === "electron" ? "electron" : "instrument",
      );
  }
  return (
    <section
      className={`im-mission cm-player im-${scenario.atmosphere} ${isTeacher ? "cm-is-preview" : ""}`}
      data-scene={scene.id}
      data-playing={started && playing && !checkpoint ? "true" : "false"}
      data-checkpoint={checkpoint || ""}
      aria-label="Interactive cinematic mission"
    >
      <CinematicSceneRenderer
        scene={scene}
        frozen={!!checkpoint}
        playing={started && playing && !externalPaused}
        fallback={scenario.artwork}
      />
      {manifest.provisionalArtwork && (
        <div className="cm-provisional">
          Ocean Dome · Existing approved artwork
        </div>
      )}
      <CinematicMissionControls
        title={scenario.title}
        chapter={scene.chapter}
        chapterTitles={titles}
        playing={playing}
        started={started}
        muted={muted}
        captions={captions}
        onPlay={play}
        onMute={toggleMute}
        onCaptions={() => setCaptions(!captions)}
        onReplay={replayLine}
        onSkip={() => engine.current?.skip()}
        onNotebook={onNotebook}
        back={back}
        volume={volume}
        effectsVolume={effectsVolume}
        onVolume={setVolume}
        onEffectsVolume={setEffectsVolume}
        interaction={checkpoint}
      />
      {!started && !checkpoint && (
        <div className="cm-start">
          <p className="cm-kicker">{scenario.location} · Fictional story</p>
          <h2>
            {scenario.id === "ionic_dessert_mystery" ? (
              <>
                Twelve minutes.
                <br />
                Three unknowns.
                <br />
                <em>Your call.</em>
              </>
            ) : (
              <>
                A cloudy sample.
                <br />A mineral mystery.
                <br />
                <em>Your evidence.</em>
              </>
            )}
          </h2>
          <p>
            {scenario.role}
            <br />
            Partner with Hamad Al Zaabi · Applied Chemistry Field Investigator
          </p>
          <button
            onClick={() => {
              setStarted(true);
              setPlaying(true);
            }}
          >
            <Play size={18} />
            {responses.cinematic
              ? "Resume cinematic mission"
              : "Start cinematic mission"}
          </button>
          <small>
            Investigate at your own pace. The deadline belongs to the story.
          </small>
        </div>
      )}
      {started && !playing && !checkpoint && (
        <div className="cm-paused">
          <button onClick={() => setPlaying(true)}>
            <Play size={20} /> Resume story
          </button>
          <p>The scene and dialogue are paused.</p>
        </div>
      )}
      {(captions || captionFallback) && caption && !checkpoint && (
        <div className="cm-captions" role="status" data-dialogue={caption.id}>
          <span>{caption.speaker}</span>
          <p>{caption.subtitle}</p>
        </div>
      )}
      {checkpoint && (
        <CinematicInteractionOverlay
          checkpoint={checkpoint}
          prompt={manifest.prompts[checkpoint]}
        >
          {["conductivity", "electron", "clues", "mineral"].includes(
            checkpoint,
          ) && (
            <IonicInvestigation
              key={checkpoint}
              scenario={scenario}
              checkpoint={checkpoint === "mineral" ? null : checkpoint}
              initialRecord={responses.investigation}
              onDraft={recordInvestigation}
              onComplete={completeCheckpoint}
              mode={mode}
            />
          )}
          {checkpoint === "decision" && (
            <>
              <p className="cm-kicker">
                Hamad is waiting for your recommendation
              </p>
              <MakeTheCall
                scenario={scenario}
                responses={responses}
                onDraft={(value) => onRecord("decisionDraft", value)}
                onComplete={completeCheckpoint}
                isTeacher={isTeacher}
              />
            </>
          )}
          {checkpoint === "reflection" && (
            <CinematicReflection
              scenario={scenario}
              responses={responses}
              onDraft={(value) => onRecord("reflectionDraft", value)}
              onComplete={completeCheckpoint}
            />
          )}
          {checkpoint === "assessment" && (
            <Assessment
              scenario={scenario}
              responses={responses}
              onDraft={(value) => onRecord("assessmentDraft", value)}
              onComplete={completeCheckpoint}
            />
          )}
          {checkpoint === "complete" && completion}
        </CinematicInteractionOverlay>
      )}
      {previewControls && (
        <div className="cm-teacher-preview">{previewControls}</div>
      )}
      <footer className="cm-status">
        <span>{scenario.fictionNotice}</span>
        <span role="status">
          {audioLease === "blocked"
            ? "Another tab owns audio. Captions remain available; mute and unmute to retry."
            : saveStatus}
        </span>
        {saveError && <span role="alert">{saveError}</span>}
      </footer>
    </section>
  );
}
