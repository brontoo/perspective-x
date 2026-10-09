import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { LEARNING_PATHS, getPathProgress } from "@/data/learningPaths";
import { SCENARIOS, ROLES, SKILLS } from "@/components/scenarios/scenarioData";
import { canOpenMission } from "@/lib/perspective/progress.mjs";
import usePortalData from "@/lib/expedition/usePortalData";
import PortalShell, {
  DataState,
  Progress,
  RoleArtwork,
} from "@/components/expedition/PortalShell";
const ART = {
  chemistry: "industrial_chemist",
  biology: "biomedical_researcher",
  physics: "energy_engineer",
  earth_science: "geologist",
  sustainability: "environmental_scientist",
  uae_innovation: "space_mission_chemist",
};
export default function LearningPath() {
  const data = usePortalData();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const path = LEARNING_PATHS[params.get("path")];
  const [error, setError] = useState("");
  const recommendation = data.feedback.find(
    (f) => f.type === "path_recommendation",
  )?.message;
  async function launch(id) {
    setError("");
    try {
      const { data: rows, error: e } = await supabase
        .from("scenario_settings")
        .select("*");
      if (e) throw e;
      const settings = Object.fromEntries(
        (rows || []).map((s) => [s.scenario_id, s]),
      );
      if (!canOpenMission(id, ROLES, data.passed, settings))
        throw new Error(
          settings[id]?.is_locked
            ? "Your teacher has locked this mission."
            : "Complete the earlier missions in this professional role first.",
        );
      navigate(`/ScenarioPlayer?scenario=${id}`);
    } catch (e) {
      setError(e.message);
    }
  }
  if (data.loading || data.error) return <DataState data={data} />;
  if (!path)
    return (
      <PortalShell data={data}>
        <section className="xp-catalogue-heading">
          <p className="px-eyebrow">Connect the science</p>
          <h1>Your learning pathways</h1>
          <p>
            Explore six interconnected academic journeys. Your mission evidence
            builds a bigger picture.
          </p>
        </section>
        <div className="xp-path-grid">
          {Object.values(LEARNING_PATHS).map((p) => {
            const progress = getPathProgress(p.id, data.passed);
            return (
              <Link
                key={p.id}
                to={`/LearningPath?path=${p.id}`}
                className="xp-path-card"
              >
                <RoleArtwork
                  roleId={ART[p.id]}
                  alt={`${p.title} scientific environment`}
                  loading="lazy"
                />
                <div className="xp-card-body">
                  <p className="px-eyebrow">
                    {p.difficulty}
                    {recommendation === p.id
                      ? " · Recommended by your teacher"
                      : ""}
                  </p>
                  <h2>
                    {p.emoji} {p.title}
                  </h2>
                  <p>{p.description}</p>
                  <Progress done={progress.completed} total={progress.total} />
                  <span className="px-button">Explore pathway →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </PortalShell>
    );
  const progress = getPathProgress(path.id, data.passed);
  const next = path.scenarios.find(
    (id) =>
      !data.passed.includes(id) &&
      canOpenMission(id, ROLES, data.passed, data.settings),
  );
  return (
    <PortalShell data={data} back="/LearningPath" backLabel="All pathways">
      <section className="xp-role-hero xp-path-hero">
        <RoleArtwork
          roleId={ART[path.id]}
          alt={`${path.title} scientific environment`}
        />
        <div>
          <p className="px-eyebrow">
            {path.difficulty} · {path.estimatedMinutes} minutes across the
            pathway
          </p>
          <h1>{path.title}</h1>
          <p>{path.description}</p>
          <Progress done={progress.completed} total={progress.total} />
          {next && (
            <button className="px-button" onClick={() => launch(next)}>
              Next activity: {SCENARIOS[next].title} →
            </button>
          )}
          {progress.isComplete && (
            <p className="xp-completed">
              ✓ Path complete · {path.completionBadge}
            </p>
          )}
        </div>
      </section>
      {recommendation === path.id && (
        <p className="xp-teacher-note">
          Your teacher recommended this learning pathway.
        </p>
      )}
      {error && (
        <p className="px-error" role="alert">
          {error}
        </p>
      )}
      <section className="xp-path-layout">
        <div>
          <h2>Your scientific journey</h2>
          <ol className="xp-path-list">
            {path.scenarios.map((id, i) => {
              const s = SCENARIOS[id];
              const completed = data.passed.includes(id);
              const allowed = canOpenMission(
                id,
                ROLES,
                data.passed,
                data.settings,
              );
              const role = Object.values(ROLES).find((r) =>
                r.scenarios.includes(id),
              );
              return (
                <li key={id}>
                  <span
                    className={`xp-path-node ${completed ? "is-done" : ""}`}
                  >
                    {completed ? "✓" : i + 1}
                  </span>
                  <div>
                    <p className="px-eyebrow">
                      {s.strand} · {s.estimatedTime || 15} min
                    </p>
                    <h3>{s.title}</h3>
                    <p>{s.scienceFocus?.join(" · ")}</p>
                    <div className="xp-actions">
                      <button
                        className="px-button"
                        disabled={!allowed}
                        onClick={() => launch(id)}
                      >
                        {data.settings[id]?.is_locked
                          ? "Locked by teacher"
                          : completed
                            ? "Replay mission"
                            : allowed
                              ? "Explore mission"
                              : "Complete earlier role missions"}
                      </button>
                      <Link
                        className="px-text-button"
                        to={`/RoleHub?role=${role.id}`}
                      >
                        View role journey
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <aside className="xp-side-panel">
          <h2>Skills you’ll develop</h2>
          {path.skills.map((key) => (
            <p key={key}>
              {SKILLS[key]?.name ||
                SKILLS[key]?.label ||
                key.replaceAll("_", " ")}
            </p>
          ))}
          <h3>Learning objectives</h3>
          <ul>
            {[
              ...new Set(
                path.scenarios.flatMap(
                  (id) => SCENARIOS[id].scienceFocus || [],
                ),
              ),
            ].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="px-muted">
            Use each mission’s evidence to connect ideas across the pathway.
          </p>
        </aside>
      </section>
    </PortalShell>
  );
}
