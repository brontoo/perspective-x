import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ROLES, SCENARIOS } from "@/components/scenarios/scenarioData";
import { UAE_SCENARIOS } from "@/components/scenarios/uaeScenarioData";
import { canOpenMission, answersOf } from "@/lib/perspective/progress.mjs";
import usePortalData from "@/lib/expedition/usePortalData";
import PortalShell, {
  DataState,
  Progress,
  RoleArtwork,
} from "@/components/expedition/PortalShell";
import { ROLE_IDENTITIES } from "@/components/expedition/roleIdentity";
import MissionCard from "@/components/expedition/MissionCard";
export default function RoleHub() {
  const data = usePortalData();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = ROLES[params.get("role")];
  const [view, setView] = useState("grid");
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);
  async function open(id) {
    setOpening(true);
    setError("");
    try {
      const { data: settings, error: e } = await supabase
        .from("scenario_settings")
        .select("*");
      if (e) throw e;
      const current = Object.fromEntries(
        (settings || []).map((s) => [s.scenario_id, s]),
      );
      if (!canOpenMission(id, ROLES, data.passed, current))
        throw new Error(
          current[id]?.is_locked
            ? "Your teacher has locked this mission."
            : "Complete the previous missions first.",
        );
      navigate(`/ScenarioPlayer?scenario=${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setOpening(false);
    }
  }
  if (data.loading || data.error) return <DataState data={data} />;
  if (!role)
    return (
      <PortalShell data={data} back="/Roles" backLabel="Choose a role">
        <h1>Select a professional role</h1>
        <Link className="px-button" to="/Roles">
          Browse all roles
        </Link>
      </PortalShell>
    );
  const identity = ROLE_IDENTITIES[role.id];
  const done = role.scenarios.filter((id) => data.passed.includes(id)).length;
  return (
    <PortalShell data={data} back="/Roles" backLabel="All roles">
      <section className="xp-role-hero">
        <RoleArtwork
          roleId={role.id}
          alt={`${identity.name}, fictional role mentor`}
        />
        <div>
          <p className="px-eyebrow">
            Professional perspective · {role.difficulty}
          </p>
          <h1>{role.title}</h1>
          <p>{role.description}</p>
          <p className="xp-impact">{identity.impact}</p>
          <small>Your role mentor: {identity.name} · Fictional character</small>
          <Progress done={done} total={role.scenarios.length} />
        </div>
      </section>
      <section className="xp-missions">
        <header className="xp-section-header">
          <div>
            <p className="px-eyebrow">Your professional journey</p>
            <h2>Your missions</h2>
          </div>
          <div className="xp-view-toggle" aria-label="Mission view">
            {["grid", "path"].map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "grid" ? "Grid View" : "Path View"}
              </button>
            ))}
          </div>
        </header>
        <p>
          Complete the missions in order. Teacher locks always take priority.
        </p>
        {error && (
          <p className="px-error" role="alert">
            {error}
          </p>
        )}
        <ol className="xp-journey-strip">
          {role.scenarios.map((id, i) => (
            <li
              key={id}
              className={
                data.settings[id]?.is_locked
                  ? "is-locked"
                  : data.passed.includes(id)
                    ? "is-done"
                    : canOpenMission(id, ROLES, data.passed, data.settings)
                      ? "is-available"
                      : "is-locked"
              }
            >
              <span>{data.passed.includes(id) ? "✓" : i + 1}</span>
              <strong>{SCENARIOS[id].title}</strong>
            </li>
          ))}
        </ol>
        <div
          className={view === "grid" ? "xp-mission-grid" : "xp-mission-path"}
        >
          {role.scenarios.map((id, index) => {
            const locked = data.settings[id]?.is_locked;
            const allowed = canOpenMission(
              id,
              ROLES,
              data.passed,
              data.settings,
            );
            const row = data.rows
              .filter(
                (r) =>
                  r.scenario_id === id &&
                  answersOf(r).meta?.recordType !== "role_reflection",
              )
              .sort(
                (a, b) =>
                  (Date.parse(b.completed_at) || 0) -
                  (Date.parse(a.completed_at) || 0),
              )[0];
            const override =
              data.feedback.find(
                (f) =>
                  f.type === "difficulty_override" &&
                  [id, "all"].includes(f.scenario_id),
              )?.message || data.settings[id]?.difficulty_override;
            return (
              <MissionCard
                key={id}
                scenario={{
                  ...SCENARIOS[id],
                  context: UAE_SCENARIOS[id]?.context || SCENARIOS[id].context,
                  roleId: role.id,
                }}
                index={index}
                status={
                  locked
                    ? "locked"
                    : data.passed.includes(id)
                      ? "completed"
                      : allowed
                        ? "available"
                        : "locked"
                }
                reason={
                  locked
                    ? "Locked by your teacher"
                    : !allowed
                      ? "Pass the previous missions to unlock this challenge"
                      : null
                }
                difficulty={
                  override === "beginner"
                    ? "Guided Mode"
                    : override === "high-achievers"
                      ? "Challenge Mode"
                      : SCENARIOS[id].difficulty
                }
                onOpen={opening ? undefined : () => open(id)}
                onReview={
                  row?.id
                    ? () =>
                        navigate(
                          `/ScenarioPlayer?scenario=${id}&review=${encodeURIComponent(row.id)}`,
                        )
                    : undefined
                }
              />
            );
          })}
        </div>
        {done === role.scenarios.length && (
          <section className="xp-reflection-invite">
            <h2>You completed this professional journey</h2>
            <p>
              Reflect on your decisions, scientific skills, and their real-world
              impact.
            </p>
            <Link className="px-button" to={`/RoleReflection?role=${role.id}`}>
              Reflect on your role →
            </Link>
          </section>
        )}
      </section>
    </PortalShell>
  );
}
