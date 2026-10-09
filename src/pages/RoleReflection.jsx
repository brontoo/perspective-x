import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ROLES } from "@/components/scenarios/scenarioData";
import { answersOf, formatDate } from "@/lib/perspective/progress.mjs";
import usePortalData from "@/lib/expedition/usePortalData";
import PortalShell, {
  DataState,
  Progress,
  RoleArtwork,
} from "@/components/expedition/PortalShell";
const FIELDS = [
  ["whatLearned", "What did you learn?"],
  ["hardestDecision", "What decision was hardest?"],
  ["impact", "How did your work affect the situation?"],
  ["realWorldConnection", "How does this connect to real life or careers?"],
];
export default function RoleReflection() {
  const data = usePortalData();
  const [params] = useSearchParams();
  const role = ROLES[params.get("role")];
  const [responses, setResponses] = useState({
    skillImproved: "",
    whatLearned: "",
    hardestDecision: "",
    impact: "",
    realWorldConnection: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const key =
    data.user && role ? `px-role-reflection:${data.user.id}:${role.id}` : null;
  useEffect(() => {
    if (!key) return;
    try {
      const stored = localStorage.getItem(key);
      if (stored) setResponses(JSON.parse(stored));
    } catch {
      /* A storage failure must not discard the editable form. */
    }
  }, [key]);
  function change(field, value) {
    const next = { ...responses, [field]: value };
    setResponses(next);
    setStatus("Unsaved reflection");
    try {
      if (key) localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setError(
        "Browser draft storage is unavailable. Keep this page open or copy your reflection before leaving.",
      );
    }
  }
  async function save() {
    setError("");
    setBusy(true);
    setStatus("Saving…");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.id !== data.user.id)
        throw new Error(
          "Sign in again before saving. Your draft remains here.",
        );
      const { error: e, data: saved } = await supabase
        .from("student_progress")
        .insert({
          student_id: user.id,
          scenario_id: null,
          scenario_title: `Role reflection: ${role.title}`,
          score: null,
          completed_at: null,
          answers: {
            meta: {
              recordType: "role_reflection",
              roleId: role.id,
              updatedAt: new Date().toISOString(),
            },
            roleReflection: responses,
          },
        })
        .select("id")
        .single();
      if (e || !saved) throw e || new Error("No saved record was returned.");
      setStatus("Reflection saved to your account");
      setError("");
    } catch (e) {
      setStatus("Not saved to your account");
      setError(
        `${e.message || "The backend could not save this reflection."} Your draft is kept in this browser; no previous responses were changed.`,
      );
    } finally {
      setBusy(false);
    }
  }
  if (data.loading || data.error) return <DataState data={data} />;
  if (!role)
    return (
      <PortalShell data={data} back="/Roles" backLabel="All roles">
        <h1>Choose a role to reflect on</h1>
        <Link className="px-button" to="/Roles">
          Explore roles
        </Link>
      </PortalShell>
    );
  const done = role.scenarios.filter((id) => data.passed.includes(id)).length;
  const saved = data.rows.filter(
    (r) =>
      answersOf(r).meta?.recordType === "role_reflection" &&
      answersOf(r).meta.roleId === role.id,
  );
  return (
    <PortalShell
      data={data}
      back={`/RoleHub?role=${role.id}`}
      backLabel={role.title}
    >
      <section className="xp-role-hero xp-reflection-hero">
        <RoleArtwork
          roleId={role.id}
          alt={`${role.title} professional environment`}
        />
        <div>
          <p className="px-eyebrow">From experience to understanding</p>
          <h1>Your {role.title.toLowerCase()} journey</h1>
          <p>
            Reflect on the evidence you used, the decisions you made, and the
            scientist you are becoming.
          </p>
          <Progress done={done} total={role.scenarios.length} />
        </div>
      </section>
      <section className="xp-reflection-form">
        <h2>What will you take forward?</h2>
        <p>
          {done === role.scenarios.length
            ? "You have passed every mission in this role."
            : "You can draft your reflection now. Pass every mission in this role before submitting your professional reflection."}
        </p>
        <fieldset>
          <legend>What skill improved most?</legend>
          {[
            "Data Analysis",
            "Critical Thinking",
            "Scientific Communication",
            "Ethical Reasoning",
            "Problem Solving",
          ].map((skill) => (
            <label className="xp-radio" key={skill}>
              <input
                type="radio"
                name="skill"
                value={skill}
                checked={responses.skillImproved === skill}
                onChange={() => change("skillImproved", skill)}
              />
              {skill}
            </label>
          ))}
        </fieldset>
        {FIELDS.map(([field, label]) => (
          <label key={field} className="xp-field">
            {label}
            <textarea
              maxLength={1500}
              rows={4}
              value={responses[field] || ""}
              onChange={(e) => change(field, e.target.value)}
              placeholder="Explain using your own mission experience…"
            />
          </label>
        ))}
        {error && (
          <p className="px-error" role="alert">
            {error}
          </p>
        )}
        <p role="status">
          {status ||
            "Your reflection is a draft until it is saved to your account."}
        </p>
        <button
          className="px-button"
          onClick={save}
          disabled={
            busy ||
            data.profile.role === "teacher" ||
            done !== role.scenarios.length ||
            !responses.skillImproved ||
            FIELDS.some(
              ([field]) => (responses[field] || "").trim().length < 20,
            )
          }
        >
          {busy ? "Saving…" : "Save professional reflection"}
        </button>
        {data.profile.role === "teacher" && (
          <p className="px-muted">
            Teacher preview: reflections are not recorded as student work.
          </p>
        )}
      </section>
      {saved.length > 0 && (
        <section className="xp-saved-reflections">
          <h2>Earlier reflections</h2>
          {saved.map((row) => (
            <details key={row.id}>
              <summary>
                Saved reflection · {formatDate(answersOf(row).meta.updatedAt)}
              </summary>
              <p>{answersOf(row).roleReflection?.skillImproved}</p>
              {FIELDS.map(([field, label]) => (
                <div key={field}>
                  <h3>{label}</h3>
                  <p>{answersOf(row).roleReflection?.[field]}</p>
                </div>
              ))}
            </details>
          ))}
        </section>
      )}
    </PortalShell>
  );
}
