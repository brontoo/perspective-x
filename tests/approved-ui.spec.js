import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
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
  } = {},
) {
  const user = { ...STUDENT, user_metadata: { ...STUDENT.user_metadata } };
  const profile = {
    ...PROFILE,
    role: teacher ? "teacher" : "student",
    full_name: teacher ? "Test Teacher" : "Test Learner",
  };
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
              ? empty
                ? []
                : HISTORY
              : table === "scenario_settings"
                ? locked
                  ? [{ scenario_id: "acid_rain", is_locked: true }]
                  : []
                : table === "leaderboard_view"
                  ? empty
                    ? []
                    : LEADERS
                  : [];
        for (const [key, value] of url.searchParams)
          if (value.startsWith("eq."))
            rows = rows.filter((row) => String(row[key]) === value.slice(3));
        if (table === "student_progress" && teacher)
          rows = rows.map((row) => ({ ...row, student_id: OTHER }));
        if (
          table === "leaderboard_view" &&
          url.searchParams.get("id") &&
          mineRank
        )
          rows = [{ ...LEADERS[1], rank: mineRank }];
        if (request.method() === "POST" || request.method() === "PATCH") {
          writes.push({ type: table, body });
          if (table === "profiles") Object.assign(profile, body);
          rows = [profile];
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
  return { writes, requests, user, profile };
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test("sign-in is public, supports password visibility, optional presets, and real errors", async ({
  page,
}) => {
  await setup(page, { guest: true });
  await page.goto("/SignIn");
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("fixture-student@example.invalid");
  await page
    .locator('input[autocomplete="current-password"]')
    .fill("wrong-password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(
    page.locator('input[autocomplete="current-password"]'),
  ).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Choose navy hijab avatar" }).click();
  await expect(
    page.getByRole("button", { name: "Choose navy hijab avatar" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Invalid login credentials",
  );
  await expect(page.getByRole("button", { name: "Google" })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await expect(page.getByRole("textbox", { name: "Full name" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Teacher", exact: true }),
  ).toHaveCount(0);
});
test("preset selection persists after authentication and appears on Dashboard", async ({
  page,
}) => {
  const { writes } = await setup(page, { guest: true });
  await page.goto("/SignIn");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("fixture-student@example.invalid");
  await page
    .locator('input[autocomplete="current-password"]')
    .fill("valid-password");
  await page
    .getByRole("button", { name: "Choose golden beanie avatar" })
    .click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/Dashboard");
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  expect(
    writes.some(
      (write) =>
        write.type === "metadata" &&
        write.body.data.px_avatar_id === "portrait-7",
    ),
  ).toBe(true);
  await expect(page.locator(".px-profile-link .px-avatar-preset")).toHaveCount(
    1,
  );
});
test("draft notebook does not award completion and saved history opens accessibly", async ({
  page,
}) => {
  await setup(page);
  await page.goto("/Dashboard");
  await expect(page.getByText("1 of 16 missions passed")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Acid Rain Alert", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View notebook →" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(
    "Original saved evidence",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("mission action rechecks locks and never launches a teacher-locked mission", async ({
  page,
}) => {
  await setup(page);
  await page.goto("/Dashboard");
  await expect(
    page.getByRole("button", { name: "Open Mission", exact: true }),
  ).toBeVisible();
  await page.route("**/rest/v1/scenario_settings?*", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ scenario_id: "acid_rain", is_locked: true }),
    }),
  );
  await page.getByRole("button", { name: "Open Mission", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("locked");
  await expect(page).toHaveURL(/Dashboard/);
});
test("student cannot load teacher data or see teacher controls", async ({
  page,
}) => {
  const { requests } = await setup(page);
  await page.goto("/TeacherDashboard");
  await expect(
    page.getByRole("heading", { name: "Teacher access required" }),
  ).toBeVisible();
  expect(
    requests.filter((path) => path === "/rest/v1/student_progress"),
  ).toHaveLength(0);
  await expect(
    page.getByText("Scenario Controls", { exact: true }),
  ).toHaveCount(0);
});
test("teacher operational controls and scenario locks remain available", async ({
  page,
}) => {
  await setup(page, { teacher: true });
  await page.goto("/TeacherDashboard");
  await expect(
    page.getByRole("heading", { name: "Test Teacher!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Missions", exact: true }).click();
  await page
    .getByRole("button", { name: "Manage Scenarios", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Scenario Controls" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Lock|Unlock/ }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Feedback", exact: true }).click();
  await expect(
    page.getByText("Send Feedback", { exact: true }).first(),
  ).toBeVisible();
});
test("leaderboard sorts points, highlights own rank, and disables unsupported periods", async ({
  page,
}) => {
  await setup(page);
  await page.goto("/leaderboard");
  await expect(
    page.getByRole("heading", { name: "Leaderboard", exact: true }),
  ).toBeVisible();
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("Synthetic Peer");
  await expect(rows.nth(1)).toHaveClass("px-my-row");
  await expect(
    page.getByRole("button", { name: "Weekly", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Monthly", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".px-personal-rank h3")).toHaveText("#2");
});
test("empty and backend-failure states do not invent statistics", async ({
  page,
}) => {
  await setup(page, { empty: true });
  await page.goto("/Dashboard");
  await expect(page.getByText("0 of 16 missions passed")).toBeVisible();
  await expect(
    page.getByText("No teacher messages yet.", { exact: false }),
  ).toBeVisible();
  await page.goto("/leaderboard");
  await expect(
    page.getByText("No leaderboard entries are available", { exact: false }),
  ).toBeVisible();
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Service unavailable" }),
    }),
  );
  await page.goto("/Dashboard");
  await expect(page.getByRole("alert")).toContainText("Service unavailable");
});
test("invalid uploads are rejected before any storage writes", async ({
  page,
}) => {
  const { writes } = await setup(page, { guest: true });
  await page.goto("/SignIn");
  await page.locator("input[type=file]").setInputFiles({
    name: "not-an-image.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.getByRole("alert")).toContainText("JPEG, PNG or WebP");
  expect(writes).toHaveLength(0);
});
for (const route of [
  "/SignIn",
  "/Dashboard",
  "/TeacherDashboard",
  "/leaderboard",
]) {
  test(`${route} responsive reference screenshots with synthetic records`, async ({
    page,
  }) => {
    await setup(page, {
      teacher: route === "/TeacherDashboard",
      guest: route === "/SignIn",
    });
    const desktop =
      route === "/SignIn"
        ? { width: 1448, height: 1086 }
        : route === "/Dashboard"
          ? { width: 1774, height: 887 }
          : { width: 1672, height: 941 };
    await fs.mkdir("test-results/screenshots", { recursive: true });
    for (const viewport of [
      desktop,
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 430, height: 932 },
      { width: 390, height: 844 },
      { width: 375, height: 812 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route);
      await expect(page.locator(".px-ui").first()).toBeVisible();
      await page.waitForTimeout(300);
      await noOverflow(page);
      await page.screenshot({
        path: `test-results/screenshots/${route.slice(1)}-${viewport.width}.png`,
        fullPage: true,
      });
    }
  });
}

async function validPhoto(page) {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 16;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ca6391";
    context.fillRect(0, 0, 16, 16);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  return Buffer.from(base64, "base64");
}

test("confirmation-required signup does not insert an unauthenticated profile", async ({
  page,
}) => {
  const { writes } = await setup(page, { guest: true });
  await page.route("**/auth/v1/signup", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: ID,
        email: STUDENT.email,
        user_metadata: { role: "student" },
      }),
    }),
  );
  await page.goto("/SignIn");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Full name" })
    .fill("Synthetic New Student");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill(STUDENT.email);
  await page.locator("input[autocomplete=new-password]").fill("valid-password");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Check your email");
  expect(writes).toHaveLength(0);
  await expect(page).toHaveURL(/SignIn/);
});
test("profile presets survive reload and do not overwrite storage paths", async ({
  page,
}) => {
  const { writes, user } = await setup(page);
  await page.goto("/ProfileSettings");
  await page
    .getByRole("button", { name: "Choose golden beanie avatar" })
    .click();
  await page.getByRole("button", { name: "Save picture", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  expect(user.user_metadata.px_avatar_id).toBe("portrait-7");
  expect(writes.filter((write) => write.type === "profiles")).toHaveLength(0);
  await page.reload();
  await expect(page.locator(".px-avatar-preset").first()).toBeVisible();
});
test("photo uploads fail closed for an unverified or public bucket", async ({
  page,
}) => {
  const { writes } = await setup(page);
  const uploads = [];
  await page.route("**/storage/v1/**", (route) => {
    if (route.request().method() === "POST")
      uploads.push(route.request().url());
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ id: "avatars", public: true }),
    });
  });
  await page.goto("/ProfileSettings");
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: await validPhoto(page),
    });
  await page.getByRole("button", { name: "Save picture", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("private avatars bucket");
  expect(uploads).toHaveLength(0);
  expect(writes).toHaveLength(0);
});
test("configured private photo upload stores a user-owned WebP path and renders signed URL", async ({
  page,
}) => {
  const { writes, profile } = await setup(page);
  const uploads = [];
  await page.route("**/storage/v1/**", (route) => {
    const req = route.request(),
      url = new URL(req.url());
    if (url.pathname === "/storage/v1/bucket/avatars")
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ id: "avatars", public: false }),
      });
    if (url.pathname.includes("/object/sign/")) {
      if (req.method() === "POST")
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            signedURL: "/object/sign/avatars/test.webp?token=fixture",
          }),
        });
      return route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
          "base64",
        ),
      });
    }
    uploads.push(url.pathname);
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ Key: url.pathname }),
    });
  });
  await page.goto("/ProfileSettings");
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: await validPhoto(page),
    });
  await page.getByRole("button", { name: "Save picture", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  expect(uploads).toHaveLength(1);
  expect(profile.avatar_path).toMatch(new RegExp(`^${ID}/[a-f0-9-]+\\.webp$`));
  expect(
    writes.some(
      (write) =>
        write.type === "metadata" && write.body.data.px_avatar_id === null,
    ),
  ).toBe(true);
  await expect(page.locator(".px-avatar img")).toBeVisible();
});
test("a student outside the visible leaderboard page still sees the server-provided own rank", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/rest/v1/leaderboard_view?*", (route) => {
    const mine = new URL(route.request().url()).searchParams.get("id");
    return route.fulfill({
      contentType: "application/json",
      headers: { "content-range": "0-0/100" },
      body: JSON.stringify(mine ? { ...LEADERS[1], rank: 80 } : [LEADERS[0]]),
    });
  });
  await page.goto("/leaderboard");
  await expect(page.locator(".px-personal-rank h3")).toHaveText("#80");
});
test("loading interior CSS leaves homepage computed styles unchanged", async ({
  page,
}) => {
  await setup(page, { guest: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const readStyles = () =>
    [
      ...document.querySelectorAll(
        "body,#root h1,#root h2,#root button,#root header,#root footer",
      ),
    ].map((element) => {
      const style = getComputedStyle(element);
      return {
        tag: element.tagName,
        text: element.tagName === "BODY" ? "" : element.textContent,
        styles: Object.fromEntries(
          [
            "color",
            "backgroundColor",
            "fontFamily",
            "fontSize",
            "fontWeight",
            "padding",
            "margin",
            "borderRadius",
            "display",
            "width",
            "height",
          ].map((key) => [key, style[key]]),
        ),
      };
    });
  const before = await page.evaluate(readStyles);
  await page.goto("/SignIn");
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const after = await page.evaluate(readStyles);
  expect(after).toEqual(before);
  await page.screenshot({
    path: "test-results/screenshots/Home-protected.png",
    fullPage: true,
  });
});

test('cinematic homepage uses interactive reference layout and guest portal routing', async ({ page }) => {
  await setup(page, { guest: true });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Perspective X', exact: true })).toBeVisible();
  await expect(page.locator('.home-slogan')).toHaveText('Real Science. Real Choices. Real Impact.');
  await expect(page.locator('.home-stats')).toContainText('Registered Students');
  await expect(page.getByRole('img', { name: 'Ministry of Education', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explore Roles', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Choose your perspective' })).toBeInViewport();
  await page.getByRole('button', { name: 'Start Your Mission', exact: true }).click();
  await expect(page).toHaveURL(/\/SignIn$/);
});

for (const teacher of [false, true]) test(`homepage Enter Portal routes authenticated ${teacher ? 'teacher' : 'student'} with own identity`, async ({ page }) => {
  await setup(page, { teacher });
  await page.goto('/');
  await expect(page.locator('.home-profile')).toContainText(teacher ? 'Test Teacher' : 'Test Learner');
  await expect(page.locator('.home-profile .px-avatar')).toBeVisible();
  await expect(page.locator('.home-account')).not.toContainText('Riham Saleh');
  await page.getByRole('button', { name: 'Enter Portal', exact: true }).first().click();
  await expect(page).toHaveURL(teacher ? /\/TeacherDashboard$/ : /\/Dashboard$/);
});

test('homepage reference composition responds at desktop tablet and mobile without fabricated student counts', async ({ page }) => {
  await setup(page, { guest: true, error: true });
  await page.goto('/');
  await expect(page.locator('.home-stats')).toContainText('Student count unavailable');
  await expect(page.locator('.home-stats > div:last-child strong')).toHaveText('—');
  for (const [width, height] of [[1448,1086],[1024,900],[768,1024],[390,844],[375,812]]) {
    await page.setViewportSize({width,height});
    await noOverflow(page);
    await expect(page.getByRole('button', {name:'Start Your Mission',exact:true})).toBeVisible();
    await page.screenshot({path:`test-results/screenshots/Home-cinematic-${width}.png`,fullPage:true});
  }
});
