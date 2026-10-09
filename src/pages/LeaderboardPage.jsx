import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, Star, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { SCENARIOS } from "@/components/scenarios/scenarioData";
import { passedIds, rankRows } from "@/lib/perspective/progress.mjs";
import {
  Avatar,
  Empty,
  LoadState,
  Panel,
  PortalFooter,
  PortalHeader,
} from "@/components/perspective/Portal";

const PUBLIC_COLUMNS =
  "id,full_name,total_points,level,scenarios_completed,badges_count,rank";
export default function LeaderboardPage() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    user: null,
    profile: null,
    entries: [],
    count: 0,
    mine: null,
    earned: [],
  });
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user)
          throw new Error("Please sign in to see the leaderboard.");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id,full_name,role,avatar_path")
          .eq("id", user.id)
          .single();
        if (profileError) throw profileError;
        // Access and visibility are delegated to the existing server view/RLS, never public profile subscriptions.
        const results = await Promise.all([
          supabase
            .from("leaderboard_view")
            .select(PUBLIC_COLUMNS, { count: "exact" })
            .order("total_points", { ascending: false })
            .order("id", { ascending: true })
            .range(page * 50, page * 50 + 49),
          profile.role === "student"
            ? supabase
                .from("leaderboard_view")
                .select(PUBLIC_COLUMNS)
                .eq("id", user.id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          profile.role === "student"
            ? supabase
                .from("student_progress")
                .select("scenario_id,score,completed_at")
                .eq("student_id", user.id)
            : Promise.resolve({ data: [], error: null }),
        ]);
        const error = results.find((result) => result.error)?.error;
        if (error) throw error;
        const entries = rankRows(results[0].data || []).map((row, index) => ({
          ...row,
          displayRank: page * 50 + index + 1,
        }));
        const mine =
          entries.find((row) => row.id === user.id) || results[1].data;
        if (active)
          setState({
            loading: false,
            error: null,
            user,
            profile,
            entries,
            count: results[0].count ?? entries.length,
            mine,
            earned: passedIds(results[2].data || [], SCENARIOS),
          });
      } catch (e) {
        if (active)
          setState((s) => ({
            ...s,
            loading: false,
            error: e.message || "Please try again.",
          }));
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [page, refresh]);
  if (state.loading || state.error)
    return (
      <LoadState
        error={state.error}
        label="Loading scientific achievements…"
        onRetry={() => setRefresh((v) => v + 1)}
      />
    );
  const { entries, user, profile, mine, count, earned } = state;
  const teacher = profile.role === "teacher";
  const top = page === 0 ? entries.slice(0, 3) : [];
  function entryAvatar(entry, size = 40) {
    return (
      <Avatar
        user={entry.id === user.id ? user : null}
        profile={entry.id === user.id ? profile : null}
        name={entry.full_name || "Learner"}
        size={size}
      />
    );
  }
  return (
    <div className="px-ui px-leaderboard">
      <div className="px-scenic-shell">
        <PortalHeader user={user} profile={profile} />
        <section className="px-hero">
          <div className="px-hero-copy">
            <p className="px-eyebrow">
              Real science. Real choices. Real impact.
            </p>
            <h1>Leaderboard</h1>
            <p>Celebrate progress, impact, and scientific achievement.</p>
            <div className="px-filter-bar" aria-label="Leaderboard periods">
              <button aria-pressed="true" onClick={() => setPage(0)}>
                <Trophy
                  size={14}
                  style={{ display: "inline", verticalAlign: "middle" }}
                />{" "}
                Overall
              </button>
              <button disabled title="Time-scoped points are not available">
                Weekly
              </button>
              <button disabled title="Time-scoped points are not available">
                Monthly
              </button>
              <button
                disabled
                title="Scientific role rankings are not available"
              >
                By role
              </button>
            </div>
            <p style={{ fontSize: ".68rem", marginTop: 9 }}>
              Overall points · period and role rankings are not available.
            </p>
          </div>
          <div className="px-podium" aria-label="Top students">
            {top.map((entry, index) => (
              <article className="px-podium-card" key={entry.id}>
                <span className="px-rank-medal">
                  {["🥇", "🥈", "🥉"][index]} #{entry.displayRank}
                </span>
                {entryAvatar(entry, 72)}
                <h2>{entry.full_name || "Learner"}</h2>
                {entry.level && <p>{entry.level}</p>}
                <strong>
                  {Number(entry.total_points || 0).toLocaleString()} points
                </strong>
                <p>{entry.scenarios_completed ?? "—"} missions passed</p>
              </article>
            ))}
            {!top.length && (
              <Empty>
                {page
                  ? "See the first page for top achievements."
                  : "Recognition starts with real scientific learning."}
              </Empty>
            )}
          </div>
        </section>
      </div>
      <main className="px-content">
        <div className="px-ranking-grid">
          <Panel
            title="Full leaderboard"
            eyebrow="Scientific achievement"
            action={
              <button
                className="px-text-button"
                onClick={() => setRefresh((v) => v + 1)}
              >
                Refresh →
              </button>
            }
          >
            <p className="px-muted" style={{ marginBottom: 12 }}>
              Overall points, highest first. Equal points are ordered by stable
              student ID.
            </p>
            {entries.length ? (
              <>
                <div className="px-table-scroll">
                  <table className="px-ranking-table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Student</th>
                        <th scope="col">Level</th>
                        <th scope="col">Missions</th>
                        <th scope="col">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr
                          key={entry.id}
                          className={entry.id === user.id ? "px-my-row" : ""}
                        >
                          <td>{entry.displayRank}</td>
                          <td>
                            <span className="px-table-person">
                              {entryAvatar(entry, 30)}
                              {entry.full_name || "Learner"}
                              {entry.id === user.id && <small> · You</small>}
                            </span>
                          </td>
                          <td>{entry.level || "—"}</td>
                          <td>{entry.scenarios_completed ?? "—"}</td>
                          <td>
                            {Number(entry.total_points || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-pagination">
                  <button
                    className="px-secondary-button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-muted">
                    {page * 50 + 1}–{page * 50 + entries.length} of {count}
                  </span>
                  <button
                    className="px-secondary-button"
                    disabled={(page + 1) * 50 >= count}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <Empty>
                No leaderboard entries are available in your authorized view
                yet.
              </Empty>
            )}
          </Panel>
          <Panel
            title={teacher ? "Teacher view" : "Your rank"}
            action={
              <Link className="px-link" to="/ProfileSettings">
                My profile →
              </Link>
            }
          >
            {teacher ? (
              <Empty>
                Teacher accounts support learning and do not receive a student
                rank.
              </Empty>
            ) : mine ? (
              <>
                <div className="px-personal-rank">
                  <Avatar user={user} profile={profile} size={72} />
                  <div>
                    <h3>#{mine.displayRank || mine.rank || "—"}</h3>
                    <p>{profile.full_name || "Your profile"}</p>
                    {mine.level && <p className="px-muted">{mine.level}</p>}
                  </div>
                </div>
                <section className="px-metrics" aria-label="Your achievements">
                  {[
                    [Star, mine.total_points ?? 0, "Total points"],
                    [
                      BookOpen,
                      mine.scenarios_completed ?? 0,
                      "Missions passed",
                    ],
                    [Award, earned.length, "Earned badges"],
                  ].map(([Icon, value, label]) => (
                    <div className="px-metric" key={label}>
                      <Icon />
                      <strong>{Number(value).toLocaleString()}</strong>
                      <small>{label}</small>
                    </div>
                  ))}
                </section>
                <h3 style={{ margin: "20px 0 12px" }}>Your badges</h3>
                {earned.length ? (
                  <div className="px-badges">
                    {earned.map((id) => (
                      <div className="px-badge" key={id}>
                        <span>{SCENARIOS[id].badgeIcon || "★"}</span>
                        <strong>{SCENARIOS[id].badge}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty>Your earned mission badges will appear here.</Empty>
                )}
              </>
            ) : (
              <Empty>
                Your profile has no visible ranking yet. Keep exploring your
                missions.
              </Empty>
            )}
            <p className="px-muted" style={{ marginTop: 17 }}>
              Only records made available by your school are shown.
            </p>
          </Panel>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
