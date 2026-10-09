import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { SCENARIOS, ROLES } from "@/components/scenarios/scenarioData";
import { UAE_SCENARIOS } from "@/components/scenarios/uaeScenarioData";
import { normalizeScenario } from "@/data/scenarioSchema";
import {
  getMissionBlueprint,
  MISSION_CHAPTERS,
} from "@/data/missionBlueprints";
import {
  getAdaptedScene,
  getBadgeLevel,
} from "@/components/scenario/scenarioHelpers";
import { evaluateScenarioOutcome } from "@/components/scenario/scenarioAnswerKey";
import { canOpenMission, answersOf } from "@/lib/perspective/progress.mjs";
import {
  createAttemptWriter,
  draftKey,
  latestDraft,
} from "@/lib/expedition/attempts.mjs";
import usePortalData from "@/lib/expedition/usePortalData";
import PortalShell, {
  DataState,
  RoleArtwork,
} from "@/components/expedition/PortalShell";
import { ROLE_IDENTITIES } from "@/components/expedition/roleIdentity";
import MissionBrief from "@/components/scenario/MissionBrief";
import MissionNotebook from "@/components/scenario/MissionNotebook";
import ScenarioComplete from "@/components/scenario/ScenarioComplete";
import { useScenarioAudio } from "@/hooks/useScenarioAudio";
const CinematicVideoIntro = lazy(
  () => import("@/components/scenario/CinematicVideoIntro"),
);
const SceneOne = lazy(() => import("@/components/scenario/SceneOne"));
const SceneTwo = lazy(() => import("@/components/scenario/SceneTwo"));
const ConsequenceViewer = lazy(
  () => import("@/components/scenario/ConsequenceViewer"),
);
const ReflectionPrompt = lazy(
  () => import("@/components/scenario/ReflectionPrompt"),
);
const ExitTicket = lazy(() => import("@/components/scenario/ExitTicket"));
const CompletionCertificate = lazy(
  () => import("@/components/scenario/CompletionCertificate"),
);
const PHASES = [
  "video",
  "intro",
  "scene1",
  "scene2",
  "consequence",
  "reflection",
  "exit",
  "complete",
];
const chapterFor = (p) =>
  p === "scene1"
    ? 1
    : p === "scene2"
      ? 2
      : ["consequence", "reflection"].includes(p)
        ? 3
        : ["exit", "complete"].includes(p)
          ? 4
          : 0;
const WARM_THEME = {
  accent: "from-rose-500 to-fuchsia-800",
  border: "border-rose-200",
  text: "text-purple-800",
  bg: "bg-rose-50",
  glow: "shadow-rose-200/20",
};
function resumePhase(record) {
  if (
    record.reflection &&
    record.scene2?.selectedOption &&
    record.scene1?.selectedOption
  )
    return "exit";
  if (record.scene2?.selectedOption && record.scene1?.selectedOption)
    return "consequence";
  if (record.scene1?.selectedOption) return "scene2";
  return "intro";
}
export default function ScenarioPlayer() {
  const data = usePortalData();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("scenario");
  const reviewId = params.get("review");
  const scenario = useMemo(
    () =>
      SCENARIOS[id]
        ? normalizeScenario({ ...SCENARIOS[id], ...(UAE_SCENARIOS[id] || {}) })
        : null,
    [id],
  );
  const role = Object.values(ROLES).find((r) => r.scenarios.includes(id));
  const plan = getMissionBlueprint(scenario, role?.id);
  const preview = data.profile?.role === "teacher";
  const [phase, setPhase] = useState("video");
  const [responses, setResponses] = useState({});
  const [notebook, setNotebook] = useState(false);
  const [certificate, setCertificate] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [accessError, setAccessError] = useState("");
  const [touched, setTouched] = useState(false);
  const [reviewRow, setReviewRow] = useState(null);
  const initialized = useRef("");
  const writer = useRef(null);
  const responseRef = useRef({});
  const finalizing = useRef(false);
  const savedResult = useRef(false);
  const audio = useScenarioAudio();
  const mode =
    data.feedback.find(
      (f) =>
        f.type === "difficulty_override" && [id, "all"].includes(f.scenario_id),
    )?.message ||
    data.settings[id]?.difficulty_override ||
    "on-level";
  const setRecord = useCallback((record) => {
    responseRef.current = record;
    setResponses(record);
  }, []);
  useEffect(() => {
    if (data.loading || data.error || !scenario || !data.user) return;
    const key = `${data.user.id}:${id}:${reviewId || ""}`;
    if (initialized.current === key) return;
    initialized.current = key;
    setAccessError("");
    setSaveError("");
    setSaveStatus("");
    setCertificate(false);
    setNotebook(false);
    setTouched(false);
    setReviewRow(null);
    finalizing.current = false;
    savedResult.current = false;
    setAttemptCount(1);
    if (reviewId) {
      const row = data.rows.find(
        (r) =>
          String(r.id) === reviewId &&
          r.scenario_id === id &&
          r.student_id === data.user.id,
      );
      if (!row) {
        setAccessError("This saved record is not available to your account.");
        return;
      }
      setReviewRow(row);
      setRecord(answersOf(row));
      setPhase("complete");
      setNotebook(true);
      setSaveStatus("Read-only saved attempt");
      return;
    }
    if (!preview && !canOpenMission(id, ROLES, data.passed, data.settings)) {
      setAccessError(
        data.settings[id]?.is_locked
          ? "Your teacher has locked this mission."
          : "Complete the earlier missions in this role first.",
      );
      return;
    }
    writer.current = createAttemptWriter(supabase, {
      userId: data.user.id,
      scenarioId: id,
      title: scenario.title,
      preview,
    });
    let draft = answersOf(latestDraft(data.rows, id));
    try {
      const local = localStorage.getItem(draftKey(data.user.id, id));
      if (local) {
        const parsed = JSON.parse(local);
        if (
          parsed?.meta?.updatedAt &&
          (!draft.meta?.updatedAt ||
            Date.parse(parsed.meta.updatedAt) >
              Date.parse(draft.meta.updatedAt))
        )
          draft = parsed;
      }
    } catch {
      setSaveError(
        "Browser draft storage is unavailable. Backend saving remains available.",
      );
    }
    setRecord(draft);
    setPhase(
      draft.exitTicket
        ? "complete"
        : Object.keys(draft).length
          ? resumePhase(draft)
          : "video",
    );
    if (draft.exitTicket) {
      finalizing.current = true;
      setSaveError(
        "An unsaved assessment result was restored from your browser. Retry saving to record it in your account.",
      );
    } else if (Object.keys(draft).length)
      setSaveStatus(
        "Earlier draft restored. Further work saves as a separate attempt.",
      );
  }, [
    id,
    reviewId,
    data.loading,
    data.error,
    data.user,
    scenario,
    preview,
    data.passed,
    data.settings,
    data.rows,
    setRecord,
  ]);
  const save = useCallback(
    async (snapshot, assessment = null) => {
      if (preview || reviewId) {
        setSaveStatus(
          preview
            ? "Teacher preview — not saved as student work"
            : "Read-only saved attempt",
        );
        return;
      }
      if (!writer.current) return;
      setSaveStatus("Saving…");
      setSaveError("");
      try {
        const result = await writer.current.persist(snapshot, assessment);
        setSaveStatus(
          assessment
            ? "Assessment result saved to your account"
            : "Notebook and responses saved to your account",
        );
        if (assessment) {
          savedResult.current = true;
          try {
            localStorage.removeItem(draftKey(data.user.id, id));
          } catch {
            /* backend save already confirmed */
          }
        }
        return result;
      } catch (e) {
        setSaveStatus("Not saved to your account");
        setSaveError(
          `${e.message || "Unable to save."} Your earlier records are unchanged. Your current work remains available here.`,
        );
        return null;
      }
    },
    [preview, reviewId, data.user, id],
  );
  useEffect(() => {
    if (
      data.loading ||
      !data.user ||
      !touched ||
      preview ||
      reviewId ||
      phase === "complete" ||
      finalizing.current
    )
      return;
    const snapshot = responses;
    try {
      localStorage.setItem(
        draftKey(data.user.id, id),
        JSON.stringify(snapshot),
      );
    } catch {
      setSaveError(
        "Browser draft storage is unavailable. Keep this page open until backend saving is confirmed.",
      );
    }
    const timer = setTimeout(() => save(snapshot), 850);
    return () => clearTimeout(timer);
  }, [
    responses,
    touched,
    phase,
    preview,
    reviewId,
    data.loading,
    data.user,
    id,
    save,
  ]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (phase === "complete") audio.playChamberUnlock();
    else if (!["video", "intro"].includes(phase)) audio.playPhaseTransition();
  }, [phase]);
  function capture(field, value, nextPhase) {
    const next = {
      ...responseRef.current,
      ...(field ? { [field]: value } : {}),
      meta: {
        ...responseRef.current.meta,
        recordType: "mission_attempt",
        lastPhase: nextPhase,
        updatedAt: new Date().toISOString(),
      },
    };
    setTouched(true);
    setRecord(next);
    setPhase(nextPhase);
  }
  function changeNotes(notes) {
    capture("notebook", notes, phase);
  }
  async function finish(assessment) {
    finalizing.current = true;
    const result = {
      ...responseRef.current,
      exitTicket: assessment,
      passed: assessment.passed,
      meta: {
        ...responseRef.current.meta,
        recordType: "mission_attempt",
        lastPhase: "complete",
        updatedAt: new Date().toISOString(),
      },
    };
    setRecord(result);
    if (!preview) {
      try {
        localStorage.setItem(
          draftKey(data.user.id, id),
          JSON.stringify(result),
        );
      } catch {
        /* keep live responses until save is confirmed */
      }
    }
    await save(result, assessment);
    setPhase("complete");
  }
  function replay() {
    writer.current = createAttemptWriter(supabase, {
      userId: data.user.id,
      scenarioId: id,
      title: scenario.title,
      preview,
    });
    finalizing.current = false;
    savedResult.current = false;
    setAttemptCount((n) => n + 1);
    setRecord({});
    setTouched(false);
    setSaveError("");
    setSaveStatus("New attempt — previous records are preserved");
    setPhase("video");
  }
  async function nextMission(nextId) {
    try {
      const { data: rows, error } = await supabase
        .from("scenario_settings")
        .select("*");
      if (error) throw error;
      const settings = Object.fromEntries(
        (rows || []).map((s) => [s.scenario_id, s]),
      );
      if (
        !canOpenMission(
          nextId,
          ROLES,
          [...data.passed, ...(responses.exitTicket?.passed ? [id] : [])],
          settings,
        )
      )
        throw new Error(
          "This mission is no longer available. Check your role journey.",
        );
      navigate(`/ScenarioPlayer?scenario=${nextId}`);
      data.refresh();
    } catch (e) {
      setSaveError(e.message);
    }
  }
  if (data.loading || data.error) return <DataState data={data} />;
  if (!scenario || !role)
    return (
      <PortalShell data={data} back="/Roles" backLabel="All roles">
        <h1>Mission not found</h1>
        <Link className="px-button" to="/Roles">
          Choose a role
        </Link>
      </PortalShell>
    );
  if (accessError)
    return (
      <PortalShell
        data={data}
        back={`/RoleHub?role=${role.id}`}
        backLabel="Role journey"
      >
        <h1>Mission unavailable</h1>
        <p role="alert">{accessError}</p>
        <Link className="px-button" to={`/RoleHub?role=${role.id}`}>
          Return to role
        </Link>
      </PortalShell>
    );
  const active = chapterFor(phase);
  const nextId = role.scenarios.find(
    (s) =>
      s !== id &&
      !data.passed.includes(s) &&
      canOpenMission(
        s,
        ROLES,
        [...data.passed, ...(responses.exitTicket?.passed ? [id] : [])],
        data.settings,
      ),
  );
  return (
    <PortalShell
      data={data}
      back={preview ? "/TeacherDashboard" : `/RoleHub?role=${role.id}`}
      backLabel={preview ? "Teacher Dashboard" : role.title}
      className="px-journey"
    >
      <section className="xp-mission-heading">
        <RoleArtwork roleId={role.id} alt="" />
        <div>
          <p className="px-eyebrow">
            {role.title} · {scenario.strand}
          </p>
          <h1>{scenario.title}</h1>
          <p>{scenario.role}</p>
          <span className="xp-difficulty">
            {mode === "beginner"
              ? "Guided Mode"
              : mode === "high-achievers"
                ? "Challenge Mode"
                : "Standard Mode"}
          </span>
          <small>
            Role mentor: {ROLE_IDENTITIES[role.id].name} · Fictional character
          </small>
        </div>
        <button className="px-outline-button" onClick={() => setNotebook(true)}>
          Mission Notebook
        </button>
      </section>
      {preview && (
        <div className="xp-preview-banner">
          <strong>Teacher preview — no student progress is saved</strong>
          <div className="xp-actions">
            <button
              className="px-outline-button"
              onClick={() =>
                setPhase(PHASES[Math.max(0, PHASES.indexOf(phase) - 1)])
              }
              disabled={phase === "video"}
            >
              Previous stage
            </button>
            <button
              className="px-outline-button"
              onClick={() =>
                setPhase(
                  PHASES[
                    Math.min(PHASES.length - 1, PHASES.indexOf(phase) + 1)
                  ],
                )
              }
              disabled={phase === "complete"}
            >
              Next stage
            </button>
          </div>
        </div>
      )}
      {reviewId && (
        <p className="xp-teacher-note">
          Reviewing a preserved attempt. Responses are read-only.
        </p>
      )}
      <ol className="xp-chapters" aria-label="Five-chapter mission progress">
        {MISSION_CHAPTERS.map((chapter, i) => (
          <li
            key={chapter.id}
            aria-current={active === i ? "step" : undefined}
            className={active === i ? "is-active" : active > i ? "is-done" : ""}
          >
            <span>{active > i ? "✓" : i + 1}</span>
            <strong>
              {chapter.title}
              {[0, 3].includes(i) ? "!" : ""}
            </strong>
          </li>
        ))}
      </ol>
      <div className="xp-mission-workspace" data-phase={phase}>
        <Suspense
          fallback={
            <p role="status" className="xp-loading">
              Preparing your scientific workspace…
            </p>
          }
        >
          {reviewId ? (
            <section className="xp-completion">
              <p className="px-eyebrow">Preserved scientific record</p>
              <h2>{scenario.title}</h2>
              <p>
                {reviewRow?.score == null
                  ? "Saved notebook draft"
                  : `Recorded assessment result: ${reviewRow.score}%`}
              </p>
              <button className="px-button" onClick={() => setNotebook(true)}>
                Review saved notebook
              </button>
            </section>
          ) : (
            <>
              {phase === "video" && (
                <CinematicVideoIntro
                  key={id}
                  scenarioId={id}
                  onComplete={() => setPhase("intro")}
                  isTeacher={preview}
                  theme={WARM_THEME}
                />
              )}{" "}
              {phase === "intro" && (
                <MissionBrief
                  scenario={scenario}
                  role={role}
                  plan={plan}
                  onStart={() => capture(null, null, "scene1")}
                />
              )}{" "}
              {phase === "scene1" && (
                <SceneOne
                  scene={getAdaptedScene(scenario.scenes[0], mode)}
                  scenarioId={id}
                  scenarioTitle={scenario.title}
                  onComplete={(value) => capture("scene1", value, "scene2")}
                  isTeacher={preview}
                  theme={WARM_THEME}
                  difficultyMode={mode}
                />
              )}{" "}
              {phase === "scene2" && (
                <SceneTwo
                  scene={scenario.scenes[1]}
                  scenarioId={id}
                  scenarioTitle={scenario.title}
                  onComplete={(value) =>
                    capture("scene2", value, "consequence")
                  }
                  isTeacher={preview}
                  theme={WARM_THEME}
                  difficultyMode={mode}
                />
              )}{" "}
              {phase === "consequence" &&
                (responses.scene2?.consequence ? (
                  <ConsequenceViewer
                    scenario={scenario}
                    consequenceKey={responses.scene2.consequence}
                    onNext={() => capture(null, null, "reflection")}
                    isTeacher={preview}
                    theme={WARM_THEME}
                  />
                ) : (
                  <div className="xp-empty">
                    <h2>Make a decision to explore its consequences</h2>
                    <button
                      className="px-button"
                      onClick={() => setPhase("scene2")}
                    >
                      Return to Make the Call
                    </button>
                  </div>
                ))}{" "}
              {phase === "reflection" && (
                <ReflectionPrompt
                  scenario={scenario}
                  onComplete={(value) => capture("reflection", value, "exit")}
                  isTeacher={preview}
                  theme={WARM_THEME}
                />
              )}{" "}
              {phase === "exit" && (
                <ExitTicket
                  exitTicket={scenario.exitTicket}
                  scenarioTitle={scenario.title}
                  theme={WARM_THEME}
                  onComplete={finish}
                  isTeacher={preview}
                  missionResult={
                    responses.scene2?.consequence
                      ? evaluateScenarioOutcome(
                          id,
                          responses.scene2.consequence,
                          scenario,
                        )
                      : null
                  }
                  scenarioId={id}
                />
              )}{" "}
              {phase === "complete" && (
                <ScenarioComplete
                  scenario={scenario}
                  responses={responses}
                  role={role}
                  onShowCertificate={() => setCertificate(true)}
                  onRetry={replay}
                  onNotebook={() => setNotebook(true)}
                  onNext={
                    savedResult.current &&
                    responses.exitTicket?.passed &&
                    nextId
                      ? () => nextMission(nextId)
                      : null
                  }
                  attemptCount={attemptCount}
                  difficultyMode={mode}
                  isTeacher={preview}
                  saveStatus={saveStatus}
                  saveError={saveError}
                  onRetrySave={() => save(responses, responses.exitTicket)}
                />
              )}
            </>
          )}
        </Suspense>
      </div>
      {phase !== "complete" && (
        <p className="xp-save-status" role="status">
          {saveStatus || "Your assignment begins when you accept the mission."}
        </p>
      )}
      {saveError && phase !== "complete" && (
        <p className="px-error" role="alert">
          {saveError}
        </p>
      )}
      <MissionNotebook
        scenario={scenario}
        responses={responses}
        onChange={changeNotes}
        onSave={() => save(responseRef.current)}
        isOpen={notebook}
        onClose={() => setNotebook(false)}
        readOnly={!!reviewId || phase === "complete"}
        saveStatus={saveStatus}
        saveError={saveError}
        feedback={data.feedback.filter((f) =>
          [id, "all"].includes(f.scenario_id),
        )}
      />
      {certificate && responses.exitTicket?.passed && savedResult.current && (
        <Suspense fallback={<p role="status">Preparing certificate…</p>}>
          <CompletionCertificate
            studentName={
              data.profile.full_name ||
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0]
            }
            scenarioTitle={scenario.title}
            percentage={responses.exitTicket.score}
            completionDate={new Date().toISOString()}
            badgeIcon={scenario.badgeIcon}
            badge={scenario.badge}
            badgeLevel={getBadgeLevel(
              responses.exitTicket.score,
              responses.scene2?.consequence,
              responses.scene2?.justification,
              id,
              mode,
            )}
            onClose={() => setCertificate(false)}
          />
        </Suspense>
      )}
    </PortalShell>
  );
}
