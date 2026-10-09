import { test, expect } from "@playwright/test";
import { setup, ID, HISTORY, noOverflow } from "./support/fixtures";
import { SCENARIOS } from "../src/components/scenarios/scenarioData";
import { UAE_SCENARIOS } from "../src/components/scenarios/uaeScenarioData";
import { normalizeExitTicketQuestions } from "../src/components/scenario/scenarioHelpers";
const scientificDraft = {
  scene1: {
    selectedOption: "C",
    justification: "The measurement exceeds the reference nitrate limit.",
  },
  scene2: {
    selectedOption: "A",
    justification: "Use measured evidence to choose appropriate treatment.",
    consequence: "best",
  },
  reflection:
    "I supported my recommendation with measurements and reviewed possible consequences.",
  meta: { updatedAt: "2026-10-10T11:00:00Z", recordType: "mission_attempt" },
};
async function seedDraft(page, draft = scientificDraft) {
  await page.addInitScript(
    ({ id, draft }) => {
      if (window.top !== window) return;
      const key = `px-mission-draft:${id}:water_contamination`;
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(draft));
    },
    { id: ID, draft },
  );
}
async function assess(page, correct = true) {
  const s = {
    ...SCENARIOS.water_contamination,
    ...UAE_SCENARIOS.water_contamination,
  };
  for (const q of normalizeExitTicketQuestions(
    s.exitTicket,
    "water_contamination",
  )) {
    await page
      .getByRole("button")
      .filter({
        hasText: q.options.find((o) => (correct ? o.correct : !o.correct)).text,
      })
      .click();
  }
  await page
    .getByRole("button", {
      name: correct ? "Complete Mission" : "Review and Try Again",
      exact: true,
    })
    .click();
}
test("student result persists separately, unlocks progression, and exports certificate", async ({
  page,
}) => {
  test.setTimeout(60000);
  const state = await setup(page);
  await seedDraft(page);
  await page.goto("/ScenarioPlayer?scenario=water_contamination");
  await assess(page);
  await expect(page.locator(".xp-completion")).toContainText(
    "Assessment result saved",
  );
  expect(state.progressRows.find((r) => r.id === "attempt-1")).toEqual(
    HISTORY[0],
  );
  const newRow = state.progressRows.find((r) => r.id.startsWith("new-attempt"));
  expect(newRow.score).toBe(100);
  expect(newRow.answers.exitTicket.passed).toBe(true);
  expect(newRow.completed_at).toBeTruthy();
  await page.screenshot({
    path: "docs/remaining-portal/completion-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "View certificate" }).click();
  await expect(page.getByRole("dialog")).toContainText("Test Learner");
  await page.screenshot({
    path: "docs/remaining-portal/certificate-desktop.png",
    fullPage: false,
  });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /PNG/i }).click();
  await expect(await download).toBeTruthy();
  const pdf = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF", exact: true }).click();
  expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  await page.getByRole("button", { name: /Close certificate/i }).click();
  await page.getByRole("button", { name: "Next available mission" }).click();
  await expect(page).toHaveURL(/scenario=acid_rain/);
});
test("failed assessment and rejected result saving do not award certificate", async ({
  page,
}) => {
  test.setTimeout(60000);
  const state = await setup(page, { empty: true, failWrites: true });
  await seedDraft(page);
  await page.goto("/ScenarioPlayer?scenario=water_contamination");
  await assess(page, false);
  await expect(page.locator(".xp-completion")).toContainText(
    "Keep building your expertise",
  );
  await expect(
    page.getByRole("button", { name: "View certificate" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Next available mission" }),
  ).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText(
    "Your earlier records are unchanged",
  );
  expect(state.progressRows).toHaveLength(0);
});
test("interface review screenshots and keyboard notebook close", async ({
  page,
}) => {
  await setup(page);
  for (const [name, url] of Object.entries({
    "role-hub": "/RoleHub?role=environmental_scientist",
    "learning-paths": "/LearningPath",
    "learning-path": "/LearningPath?path=chemistry",
    reflection: "/RoleReflection?role=environmental_scientist",
    profile: "/ProfileSettings",
  })) {
    await page.goto(url);
    await expect(page.locator(".xp-main h1")).toBeVisible();
    await page.screenshot({
      path: `docs/remaining-portal/${name}-desktop.png`,
      fullPage: true,
    });
  }
  await seedDraft(page, {
    notebook: { evidenceNotes: "Measured evidence" },
    meta: { updatedAt: new Date().toISOString() },
  });
  await page.goto("/ScenarioPlayer?scenario=water_contamination");
  await expect(
    page.getByRole("button", { name: "Accept assignment" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/remaining-portal/mission-assignment-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await page.screenshot({
    path: "docs/remaining-portal/notebook-desktop.png",
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: "docs/remaining-portal/mission-mobile.png",
    fullPage: true,
  });
});
