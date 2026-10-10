import { getBadgeLevel } from "@/components/scenario/scenarioHelpers";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Target,
  Trophy,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ROLES, SCENARIOS, SKILLS } from "@/components/scenarios/scenarioData";
import { LEARNING_PATHS_LIST, getPathProgress } from "@/data/learningPaths";
import {
  CHAPTERS,
  answersOf,
  formatDate,
  isAssessed,
  missionState,
  nextMission,
  passedIds,
  canOpenMission,
} from "@/lib/perspective/progress.mjs";
import {
  PortalHeader,
  PortalFooter,
  Panel,
  Empty,
  LoadState,
  Journal,
} from "@/components/perspective/Portal";

export default function Dashboard() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    user: null,
    profile: null,
    rows: [],
    feedback: [],
    settings: {},
  });
  const [journal, setJournal] = useState(null);
  const [showRecords, setShowRecords] = useState(false);
  const dialog = useRef(null);
  const navigate = useNavigate();
  const [launchError, setLaunchError] = useState(null);
  const [launching, setLaunching] = useState(false);
  useEffect(() => {
    let active = true;
    load(() => active);
    return () => {
      active = false;
    };
  }, []);
  async function load(isActive = () => true) {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error("Please sign in to view your learning records.");
      const results = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single(),
        supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", user.id)
          .order("completed_at", { ascending: false }),
        supabase
          .from("teacher_feedback")
          .select("*")
          .eq("student_email", user.email)
          .order("created_at", { ascending: false }),
        supabase
          .from("scenario_settings")
          .select("scenario_id,is_locked,difficulty_override"),
      ]);
      const error = results.find((result) => result.error)?.error;
      if (error) throw error;
      if (isActive())
        setState({
          loading: false,
          error: null,
          user,
          profile: results[0].data,
          rows: results[1].data || [],
          feedback: results[2].data || [],
          settings: Object.fromEntries(
            (results[3].data || []).map((setting) => [
              setting.scenario_id,
              setting,
            ]),
          ),
        });
    } catch (e) {
      if (isActive())
        setState((previous) => ({
          ...previous,
          loading: false,
          error: e.message || "Please check your connection and try again.",
        }));
    }
  }
  if (state.loading || state.error)
    return <LoadState error={state.error} onRetry={() => load()} />;
  const { user, profile, rows, feedback, settings } = state;
  const passed = passedIds(rows, SCENARIOS);
  const next = nextMission(rows, SCENARIOS, ROLES, settings);
  const latest = rows.find(
    (row) =>
      SCENARIOS[row.scenario_id] && Object.keys(answersOf(row)).length > 0,
  );
  const answers = answersOf(latest);
  const notes = Object.values(answers.notebook || {}).filter(
    (value) => typeof value === "string" && value.trim(),
  );
  const decisions = ["scene1", "scene2"].filter(
    (scene) => answers[scene]?.selectedOption,
  );
  const badges = passed
    .map((id) => {
      const best = rows
        .filter(
          (row) =>
            row.scenario_id === id &&
            isAssessed(row) &&
            Number(row.score) >= 80,
        )
        .sort((a, b) => Number(b.score) - Number(a.score))[0];
      const recorded = answersOf(best);
      return {
        id,
        title: SCENARIOS[id].badge,
        icon: SCENARIOS[id].badgeIcon,
        level: getBadgeLevel(
          best.score,
          recorded.scene2?.consequence,
          recorded.scene2?.justification,
          id,
          recorded.exitTicket?.difficultyMode,
        ),
      };
    })
    .filter((b) => b.title);
  const messages = feedback.filter(
    (record) => record.type !== "difficulty_override",
  );
  const assessed = rows.filter(isAssessed);
  const average = assessed.length
    ? Math.round(
        assessed.reduce((sum, row) => sum + Number(row.score), 0) /
          assessed.length,
      )
    : null;
  const overall = Math.round(
    (passed.length / Object.keys(SCENARIOS).length) * 100,
  );
  async function launchMission() {
    if (!next || launching) return;
    setLaunching(true);
    setLaunchError(null);
    try {
      const [lockResult, progressResult] = await Promise.all([
        supabase
          .from("scenario_settings")
          .select("scenario_id,is_locked")
          .eq("scenario_id", next.id)
          .maybeSingle(),
        supabase
          .from("student_progress")
          .select("scenario_id,score,completed_at")
          .eq("student_id", user.id),
      ]);
      if (lockResult.error || progressResult.error)
        throw new Error("Unable to confirm mission access. Please try again.");
      const currentPassed = passedIds(progressResult.data || [], SCENARIOS);
      const freshSettings = { ...settings, [next.id]: lockResult.data || {} };
      if (!canOpenMission(next.id, ROLES, currentPassed, freshSettings))
        throw new Error(
          "This mission is locked. Please check with your teacher.",
        );
      navigate(`/ScenarioPlayer?scenario=${encodeURIComponent(next.id)}`);
    } catch (e) {
      setLaunchError(e.message);
    } finally {
      setLaunching(false);
    }
  }
  function openJournal(row = latest) {
    setJournal(row || null);
    requestAnimationFrame(() => dialog.current.showModal());
  }
  return (
    <div className="px-ui px-student">
      <div className="px-scenic-shell">
        <PortalHeader user={user} profile={profile} />
        <section className="px-hero">
          <div className="px-hero-copy">
            <p className="px-eyebrow">Your scientific journey</p>
            <h1>
              {rows.length ? "Welcome back," : "Welcome,"}
              <br />
              <span>
                {profile?.full_name?.split(" ")[0] || "Future Scientist"}.
              </span>
            </h1>
            <p>
              Continue your journey, explore new worlds, and make real choices
              for a more sustainable tomorrow.
            </p>
          </div>
          {next ? (
            <article className="px-featured">
              <div>
                <p className="px-eyebrow">Your next mission</p>
                <h2>{next.title}</h2>
                <p>Role: {next.role?.title}</p>
                <p className="px-status-chip">
                  {missionState(next.attempt)} · {next.strand}
                </p>
                <button
                  className="px-button"
                  disabled={launching}
                  onClick={launchMission}
                >
                  {launching
                    ? "Checking access…"
                    : next.attempt
                      ? "Open Mission"
                      : "Start Mission"}
                  <ArrowRight size={15} />
                </button>
                {launchError && <p role="alert">{launchError}</p>}
              </div>
              <img
                src={`/images/scenarios/${next.id}/1.jpeg`}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </article>
          ) : (
            <article className="px-featured">
              <div>
                <p className="px-eyebrow">Keep exploring</p>
                <h2>
                  {passed.length === Object.keys(SCENARIOS).length
                    ? "Your missions are complete"
                    : "Your next assignment is on its way"}
                </h2>
                <p>
                  {passed.length === Object.keys(SCENARIOS).length
                    ? "Revisit your roles and reflect on your learning."
                    : "Your teacher controls which missions are available."}
                </p>
                <Link className="px-button" to="/LearningPath">
                  Explore learning paths
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          )}
        </section>
      </div>
      <main className="px-content">
        <Panel
          className="px-journey"
          title="From exploration to real-world impact."
          eyebrow="My scientific journey"
          action={
            <span className="px-journey-subtitle">
              {passed.length} of {Object.keys(SCENARIOS).length} missions passed
            </span>
          }
        >
          <ol
            className="px-steps"
            aria-label="The five-chapter learning sequence"
          >
            {CHAPTERS.map((chapter, index) => (
              <li key={chapter}>
                <span className="px-step-icon">{index + 1}</span>
                <div>
                  <strong>{chapter}</strong>
                  <small>
                    {
                      [
                        "Understand the challenge",
                        "Explore the evidence",
                        "Choose a response",
                        "Reflect on the outcome",
                        "Transfer your learning",
                      ][index]
                    }
                  </small>
                </div>
              </li>
            ))}
          </ol>
          <p className="px-muted" style={{ marginTop: 10 }}>
            Your saved work is below. Open a mission to follow its chapter
            progress.
          </p>
        </Panel>
        <div className="px-student-grid">
          <Panel
            title="Your evidence, notes and decisions"
            eyebrow="Mission Notebook"
            action={
              <button className="px-text-button" onClick={() => openJournal()}>
                View notebook →
              </button>
            }
          >
            <div className="px-notebook-cards">
              <article className="px-notebook-card">
                <BookOpen size={24} />
                <h3>Saved evidence</h3>
                <p>
                  {latest
                    ? SCENARIOS[latest.scenario_id]?.title
                    : "Your record starts with your first mission."}
                </p>
                <small>{decisions.length} recorded decisions</small>
              </article>
              <article className="px-notebook-card">
                <FileText size={24} />
                <h3>Latest note</h3>
                <p>{notes.at(-1) || "No notes saved yet."}</p>
                {latest && <small>{formatDate(latest.completed_at)}</small>}
              </article>
              <article className="px-notebook-card">
                <Target size={24} />
                <h3>Your decision</h3>
                <p>
                  {answers.scene2?.justification ||
                    answers.scene1?.justification ||
                    "Your reasoning will appear here when you save it."}
                </p>
              </article>
            </div>
          </Panel>
          <Panel
            title="Achievements & progress"
            eyebrow="Keep making an impact"
            action={
              <button
                className="px-text-button"
                onClick={() => setShowRecords((v) => !v)}
              >
                View all →
              </button>
            }
          >
            {badges.length ? (
              <div className="px-badges">
                {badges.slice(0, 3).map((badge) => (
                  <div className="px-badge" key={badge.id}>
                    <span>{badge.icon || "★"}</span>
                    <strong>{badge.title}</strong>
                    <p>{badge.level} · Mission passed</p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                Pass your first mission to earn your first achievement.
              </Empty>
            )}
            <div
              className="px-progress"
              role="progressbar"
              aria-label="Missions passed"
              aria-valuenow={overall}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${overall}%` }} />
            </div>
            <p className="px-muted">
              {passed.length} / {Object.keys(SCENARIOS).length} missions passed
            </p>
          </Panel>
          <section
            className="px-metrics"
            aria-label="Your real learning statistics"
          >
            {[
              [BookOpen, passed.length, "Missions passed"],
              [Trophy, badges.length, "Badges earned"],
              [CheckCircle2, assessed.length, "Assessments"],
              [Target, average === null ? "—" : `${average}%`, "Average score"],
            ].map(([Icon, value, label]) => (
              <div className="px-metric" key={label}>
                <Icon />
                <strong>{value}</strong>
                <small>{label}</small>
              </div>
            ))}
          </section>
          <Panel title="Feedback & assignments" eyebrow="From your teacher">
            {messages.length ? (
              messages.slice(0, 3).map((message) => (
                <article className="px-feedback" key={message.id}>
                  <strong>{message.teacher_name || "Your teacher"}</strong>
                  <small>
                    {formatDate(message.created_at)}
                    {SCENARIOS[message.scenario_id]
                      ? ` · ${SCENARIOS[message.scenario_id].title}`
                      : ""}
                  </small>
                  <p>{message.message}</p>
                </article>
              ))
            ) : (
              <Empty>
                No teacher messages yet. New feedback will appear here.
              </Empty>
            )}
          </Panel>
        </div>
        <Panel className="px-explore" title={null}>
          <div className="px-explore-heading">
            <p className="px-eyebrow">Explore more roles</p>
            <h2>Take on a new perspective.</h2>
            <p className="px-muted" style={{ marginTop: 6 }}>
              Discover where science can take you.
            </p>
          </div>
          <div className="px-explore-roles">
            {Object.values(ROLES).map((role) => (
              <Link
                className="px-role-link"
                key={role.id}
                to={`/RoleHub?role=${role.id}`}
              >
                <span>{role.icon}</span>
                <div>
                  <strong>{role.title}</strong>
                  <small>
                    {role.scenarios.length}{" "}
                    {role.scenarios.length === 1 ? "mission" : "missions"}
                  </small>
                </div>
                <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </Panel>
        {showRecords && (
          <Panel
            className="px-records"
            title="Learning paths"
            action={
              <Link className="px-link" to="/LearningPath">
                View paths →
              </Link>
            }
          >
            <div className="px-explore-roles">
              {LEARNING_PATHS_LIST.map((path) => {
                const progress = getPathProgress(path.id, passed);
                return (
                  <Link
                    className="px-role-link"
                    to={`/LearningPath?path=${path.id}`}
                    key={path.id}
                  >
                    <span>{path.icon}</span>
                    <div>
                      <strong>{path.title}</strong>
                      <small>
                        {progress.completed} / {progress.total} missions
                      </small>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Panel>
        )}
        {showRecords && (
          <Panel className="px-records" title="Your skills">
            <div className="px-skills">
              {Object.entries(SKILLS).map(([key, skill]) => {
                const ids = Object.keys(SCENARIOS).filter((id) =>
                  SCENARIOS[id].skills?.includes(key),
                );
                const score = ids.length
                  ? Math.round(
                      ids.reduce(
                        (sum, id) =>
                          sum +
                          Math.max(
                            0,
                            ...rows
                              .filter(
                                (row) =>
                                  row.scenario_id === id &&
                                  isAssessed(row) &&
                                  Number(row.score) >= 80,
                              )
                              .map((row) => Number(row.score)),
                          ),
                        0,
                      ) / ids.length,
                    )
                  : 0;
                return (
                  <div key={key}>
                    <strong>
                      {skill.name || skill.title || key.replaceAll("_", " ")}
                    </strong>
                    <div
                      className="px-progress"
                      role="progressbar"
                      aria-label={skill.name || key}
                      aria-valuenow={score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span style={{ width: `${score}%` }} />
                    </div>
                    <span className="px-muted">{score}%</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
        {showRecords && (
          <Panel className="px-records" title="Your learning records">
            {rows.length ? (
              <ul>
                {rows
                  .filter((row) => SCENARIOS[row.scenario_id])
                  .map((row, index) => (
                    <li key={row.id || index}>
                      <h3>{SCENARIOS[row.scenario_id].title}</h3>
                      <p className="px-muted">
                        {missionState(row)} · {formatDate(row.completed_at)}
                      </p>
                      <button
                        className="px-text-button"
                        onClick={() => openJournal(row)}
                      >
                        View saved work →
                      </button>
                    </li>
                  ))}
              </ul>
            ) : (
              <Empty>
                Your completed assessments and saved notes will appear here.
              </Empty>
            )}
          </Panel>
        )}
      </main>
      <PortalFooter />
      <Journal
        dialogRef={dialog}
        row={journal}
        scenario={SCENARIOS[journal?.scenario_id]}
        answers={answersOf(journal)}
      />
    </div>
  );
}
