import { expect } from "@playwright/test";
const ID = "00000000-0000-4000-8000-000000000001";
const OTHER = "00000000-0000-4000-8000-000000000002";
const STUDENT = {
  id: ID,
  email: "fixture-student@example.invalid",
  aud: "authenticated",
  role: "authenticated",
  user_metadata: { full_name: "Test Learner", px_avatar_id: "portrait-2" },
};
const PROFILE = {
  id: ID,
  full_name: "Test Learner",
  role: "student",
  avatar_path: null,
};
const HISTORY = [
  {
    id: "attempt-1",
    student_id: ID,
    scenario_id: "water_contamination",
    score: 92,
    completed_at: "2026-10-09T10:00:00Z",
    answers: {
      scene1: {
        selectedOption: "C",
        justification: "The nitrate reading exceeds the stated reference.",
      },
      scene2: {
        selectedOption: "A",
        justification: "Use the measured evidence to recommend treatment.",
      },
      notebook: { evidenceNotes: "Original saved evidence" },
      exitTicket: { passed: true, score: 92 },
    },
  },
  {
    id: "attempt-2",
    student_id: ID,
    scenario_id: "acid_rain",
    score: null,
    completed_at: "2026-10-09T11:00:00Z",
    answers: { notebook: { evidenceNotes: "Draft lake measurements" } },
  },
];
const LEADERS = [
  {
    id: OTHER,
    full_name: "Synthetic Peer",
    total_points: 300,
    level: "Scientist",
    scenarios_completed: 3,
    badges_count: 3,
    rank: 1,
  },
  {
    id: ID,
    full_name: "Test Learner",
    total_points: 150,
    level: "Analyst",
    scenarios_completed: 1,
    badges_count: 1,
    rank: 2,
  },
];
async function setup(
  page,
  {
    teacher = false,
    guest = false,
    empty = false,
    locked = false,
    error = false,
    mineRank = null,
    seedRows = null,
    feedbackRows = [],
    settingsRows = null,
    failWrites = false,
  } = {},
) {
  const user = { ...STUDENT, user_metadata: { ...STUDENT.user_metadata } };
  const profile = {
    ...PROFILE,
    role: teacher ? "teacher" : "student",
    full_name: teacher ? "Test Teacher" : "Test Learner",
  };
  const progressRows = structuredClone(seedRows || (empty ? [] : HISTORY));
  const scenarioSettings = structuredClone(
    settingsRows ||
      (locked ? [{ scenario_id: "acid_rain", is_locked: true }] : []),
  );
  const writes = [];
  const requests = [];
  await page.route(
    "https://daobsxonesvcjmnalpdr.supabase.co/**",
    async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      requests.push(url.pathname);
      const body = request.postDataJSON?.();
      const json = (value, status = 200, headers = {}) =>
        route.fulfill({
          status,
          contentType: "application/json",
          headers,
          body: JSON.stringify(value),
        });
      if (url.pathname === "/auth/v1/settings")
        return json({ external: { email: true, google: false, azure: false } });
      if (url.pathname === "/auth/v1/token") {
        if (body?.password === "wrong-password")
          return json(
            {
              error: "invalid_grant",
              error_description: "Invalid login credentials",
              msg: "Invalid login credentials",
            },
            400,
          );
        return json({
          access_token: "fixture-token",
          refresh_token: "fixture-refresh",
          expires_in: 3600,
          token_type: "bearer",
          user,
        });
      }
      if (url.pathname === "/auth/v1/user") {
        if (request.method() === "PUT") {
          writes.push({ type: "metadata", body });
          Object.assign(user.user_metadata, body.data || {});
        }
        return json(user);
      }
      if (url.pathname === "/auth/v1/logout") return json({});
      if (url.pathname === "/auth/v1/recover") return json({});
      if (url.pathname.startsWith("/storage/"))
        return json(
          { message: "Storage is not configured in this synthetic test" },
          400,
        );
      if (url.pathname.startsWith("/rest/v1/")) {
        const table = url.pathname.split("/").at(-1);
        if (error)
          return json(
            { message: "Synthetic network failure", code: "TEST" },
            503,
          );
        let rows =
          table === "profiles"
            ? [
                profile,
                ...(teacher
                  ? [
                      {
                        id: OTHER,
                        full_name: "Synthetic Peer",
                        role: "student",
                      },
                    ]
                  : []),
              ]
            : table === "student_progress"
              ? progressRows
              : table === "scenario_settings"
                ? scenarioSettings
                : table === "leaderboard_view"
                  ? empty
                    ? []
                    : LEADERS
                  : table === "teacher_feedback"
                    ? feedbackRows
                    : [];
        for (const [key, value] of url.searchParams)
          if (value.startsWith("eq."))
            rows = rows.filter(
              (row) =>
                String(
                  key === "answers->meta->>revision"
                    ? row.answers?.meta?.revision
                    : row[key],
                ) === value.slice(3),
            );
          else if (value === "is.null")
            rows = rows.filter((row) => row[key] == null);
        if (table === "student_progress" && teacher && !seedRows)
          rows = rows.map((row) => ({ ...row, student_id: OTHER }));
        if (
          table === "leaderboard_view" &&
          url.searchParams.get("id") &&
          mineRank
        )
          rows = [{ ...LEADERS[1], rank: mineRank }];
        if (request.method() === "POST" || request.method() === "PATCH") {
          writes.push({
            type: table,
            body,
            method: request.method(),
            query: url.search,
          });
          if (failWrites)
            return json(
              { message: "Synthetic saving failure", code: "TEST" },
              503,
            );
          if (table === "profiles") {
            Object.assign(profile, body);
            rows = [profile];
          } else if (table === "student_progress") {
            if (request.method() === "POST") {
              const inserted = {
                ...(Array.isArray(body) ? body[0] : body),
                id: `new-attempt-${progressRows.length + 1}`,
              };
              progressRows.push(inserted);
              rows = [inserted];
            } else {
              rows.forEach((row) => Object.assign(row, body));
            }
          } else if (table === "scenario_settings") {
            if (request.method() === "POST") {
              const inserted = {
                ...body,
                id: `setting-${scenarioSettings.length + 1}`,
              };
              scenarioSettings.push(inserted);
              rows = [inserted];
            } else rows.forEach((row) => Object.assign(row, body));
          } else rows = [{ ...body, id: "fixture-insert" }];
        }
        const single = request.headers().accept?.includes("vnd.pgrst.object");
        return json(single ? rows[0] || null : rows, 200, {
          "content-range": `0-${Math.max(rows.length - 1, 0)}/${rows.length}`,
          "access-control-expose-headers": "content-range",
        });
      }
      return json({});
    },
  );
  // No live services are used by these UI tests; all identities/data are synthetic.
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ body: "", contentType: "text/css" }),
  );
  if (!guest)
    await page.addInitScript(
      ({ user }) => {
        if (window.top !== window) return;
        const payload = btoa(
          JSON.stringify({
            sub: user.id,
            role: "authenticated",
            exp: Math.floor(Date.now() / 1000) + 3600,
          }),
        );
        localStorage.setItem(
          "sb-daobsxonesvcjmnalpdr-auth-token",
          JSON.stringify({
            access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.fixture`,
            refresh_token: "fixture-refresh",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            expires_in: 3600,
            token_type: "bearer",
            user,
          }),
        );
      },
      { user },
    );
  return { writes, requests, user, profile, progressRows };
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

export { setup, noOverflow, ID, OTHER, STUDENT, PROFILE, HISTORY, LEADERS };
