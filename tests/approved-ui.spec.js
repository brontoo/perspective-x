import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { setup, noOverflow, ID, OTHER, STUDENT, LEADERS } from "./support/fixtures";

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
  await page.getByRole("tab", { name: "Missions", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mission controls" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Lock|Unlock/ }).first(),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Feedback", exact: true }).click();
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
  await expect(page.getByRole("banner").locator(".px-avatar img")).toBeVisible();
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
  await expect(page).toHaveURL(/\/SignIn$/);
  await page.goto('/');
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
