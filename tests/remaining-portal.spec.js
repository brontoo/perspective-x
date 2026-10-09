import { test, expect } from "@playwright/test";
import { setup, noOverflow, ID, HISTORY } from "./support/fixtures";
import { ROLES, SCENARIOS } from "../src/components/scenarios/scenarioData";
import { UAE_SCENARIOS } from "../src/components/scenarios/uaeScenarioData";
import { LEARNING_PATHS } from "../src/data/learningPaths";
import { normalizeExitTicketQuestions } from "../src/components/scenario/scenarioHelpers";
test.describe.configure({ mode: "parallel" });
const allPassed = Object.keys(SCENARIOS).map((scenario_id, i) => ({
  id: `passed-${i}`,
  student_id: ID,
  scenario_id,
  score: 100,
  completed_at: "2026-10-10T10:00:00Z",
  answers: { exitTicket: { score: 100, passed: true } },
}));
test("nine role journeys and six pathways retain their scientific relationships", async ({
  page,
}) => {
  test.setTimeout(90000);
  await setup(page, { seedRows: allPassed });
  await page.goto("/Roles");
  await expect(page.locator(".xp-role-card")).toHaveCount(9);
  for (const role of Object.values(ROLES)) {
    await page.goto(`/RoleHub?role=${role.id}`);
    await expect(
      page.getByRole("heading", { name: role.title, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".xp-mission-card")).toHaveCount(
      role.scenarios.length,
    );
    await noOverflow(page);
  }
  await page.goto("/LearningPath");
  await expect(page.locator(".xp-path-card")).toHaveCount(6);
  for (const path of Object.values(LEARNING_PATHS)) {
    await page.goto(`/LearningPath?path=${path.id}`);
    await expect(
      page.getByRole("heading", { name: path.title, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".xp-path-list > li")).toHaveCount(
      path.scenarios.length,
    );
  }
});
test("teacher locks and prerequisites cannot be bypassed with preview query", async ({
  page,
}) => {
  const state = await setup(page, {
    empty: true,
    settingsRows: [{ scenario_id: "water_contamination", is_locked: true }],
  });
  for (const id of ["water_contamination", "acid_rain"]) {
    await page.goto(`/ScenarioPlayer?scenario=${id}&preview=true`);
    await expect(
      page.getByRole("heading", { name: "Mission unavailable" }),
    ).toBeVisible();
    await expect(
      page.getByText("Teacher preview — no student progress is saved"),
    ).toHaveCount(0);
  }
  expect(state.writes).toHaveLength(0);
});
for (const id of Object.keys(SCENARIOS))
  test(`all five chapters preserve original assessment: ${id}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    const state = await setup(page, { teacher: true, seedRows: [] });
    const s = { ...SCENARIOS[id], ...(UAE_SCENARIOS[id] || {}) };
    await page.goto(`/ScenarioPlayer?scenario=${id}`);
    await expect(page.locator(".xp-chapters li")).toHaveCount(5);
    await page.getByRole("button", { name: "Skip Story", exact: true }).click();
    await page.getByRole("button", { name: "Accept assignment" }).click();
    await page.getByRole("button", { name: "Make Your Choice" }).click();
    await page
      .getByRole("button", { name: "Skip to Result (Teacher)" })
      .click();
    await page
      .getByRole("button", { name: "SKIP PREVIEW", exact: true })
      .click();
    await page.getByRole("button", { name: "Continue to reflection" }).click();
    await page.getByRole("button", { name: "Go to Final Check" }).click();
    await page.clock.install();
    for (const q of normalizeExitTicketQuestions(s.exitTicket, id)) {
      const answer = q.options.find((o) => o.correct);
      await page.getByRole("button").filter({ hasText: answer.text }).click();
      await page.clock.fastForward(2000);
    }
    await page
      .getByRole("button", { name: "Complete Mission", exact: true })
      .click();
    await expect(page.locator(".xp-completion")).toBeVisible();
    await expect(page.locator(".xp-completion")).toContainText("100");
    expect(state.writes).toHaveLength(0);
  });
test("notebook saves a separate draft, restores it, and preserves assessed work", async ({
  page,
}) => {
  const state = await setup(page);
  await page.addInitScript(
    ({ id }) =>
      !localStorage.getItem(`px-mission-draft:${id}:water_contamination`) &&
      localStorage.setItem(
        `px-mission-draft:${id}:water_contamination`,
        JSON.stringify({
          notebook: { evidenceNotes: "Browser draft" },
          meta: { updatedAt: new Date().toISOString() },
        }),
      ),
    { id: ID },
  );
  await page.goto("/ScenarioPlayer?scenario=water_contamination");
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await page
    .getByLabel("1. Scientific evidence — personal notes")
    .fill("New measured evidence, distinct from the previous assessment.");
  await page.getByRole("button", { name: "Save notebook now" }).click();
  await expect(page.getByRole("dialog")).toContainText("saved to your account");
  expect(state.progressRows.find((r) => r.id === "attempt-1")).toEqual(
    HISTORY[0],
  );
  const draft = state.progressRows.find((r) => r.id.startsWith("new-attempt"));
  expect(draft.score).toBeNull();
  expect(draft.completed_at).toBeNull();
  expect(draft.answers.notebook.evidenceNotes).toContain(
    "New measured evidence",
  );
  await page.getByRole("button", { name: "Close notebook" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await expect(
    page.getByLabel("1. Scientific evidence — personal notes"),
  ).toHaveValue(/New measured evidence/);
});
test("failed reflection persistence retains draft and reports failure honestly", async ({
  page,
}) => {
  const state = await setup(page, { seedRows: allPassed, failWrites: true });
  await page.goto("/RoleReflection?role=environmental_scientist");
  await page.getByLabel("Data Analysis", { exact: true }).check();
  for (const textarea of await page.locator("textarea").all())
    await textarea.fill(
      "I compared the measurements and explained my decision using scientific evidence.",
    );
  await page
    .getByRole("button", { name: "Save professional reflection" })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "no previous responses were changed",
  );
  await expect(page.getByRole("status").last()).toContainText("Not saved");
  expect(state.progressRows).toEqual(allPassed);
});
for (const width of [1440, 1024, 768, 390, 375])
  test(`remaining pages responsive at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await setup(page, { seedRows: allPassed });
    await page.setViewportSize({ width, height: 950 });
    for (const url of [
      "/Roles",
      "/RoleHub?role=environmental_scientist",
      "/LearningPath",
      "/LearningPath?path=chemistry",
      "/RoleReflection?role=environmental_scientist",
      "/ProfileSettings",
    ]) {
      await page.goto(url);
      await expect(page.locator(".px-expedition main")).toBeVisible();
      await noOverflow(page);
    }
    await page.goto("/Roles");
    await expect(page.locator(".xp-role-card")).toHaveCount(9);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((img) => {
          img.loading = "eager";
          return img.decode().catch(() => {});
        }),
      );
    });
    await page.screenshot({
      path: `docs/remaining-portal/roles-${width}.png`,
      fullPage: true,
    });
  });
