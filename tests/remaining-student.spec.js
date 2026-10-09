import { test, expect } from "@playwright/test";
import { setup, ID, HISTORY, noOverflow } from "./support/fixtures";
import { SCENARIOS } from "../src/components/scenarios/scenarioData";
import { UAE_SCENARIOS } from "../src/components/scenarios/uaeScenarioData";
test("student decisions and reasoning appear in notebook without changing graded history", async ({
  page,
}) => {
  test.setTimeout(45000);
  const state = await setup(page);
  await page.addInitScript(
    ({ id }) =>
      localStorage.setItem(
        `px-mission-draft:${id}:water_contamination`,
        JSON.stringify({
          notebook: {
            evidenceNotes: "Compare the sample with its safety limit.",
          },
          meta: { updatedAt: new Date().toISOString() },
        }),
      ),
    { id: ID },
  );
  await page.goto("/ScenarioPlayer?scenario=water_contamination");
  await page.getByRole("button", { name: "Accept assignment" }).click();
  await page.getByRole("button", { name: "Proceed to Evidence" }).click();
  await expect(
    page.getByRole("button", { name: "Make Your Choice" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/remaining-portal/mission-evidence-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Make Your Choice" }).click();
  const scene = {
    ...SCENARIOS.water_contamination,
    ...UAE_SCENARIOS.water_contamination,
  }.scenes;
  await page
    .getByRole("textbox")
    .fill(
      "The nitrate reading exceeds its stated safety limit, so the evidence indicates a water-quality risk.",
    );
  await page
    .getByRole("button")
    .filter({ hasText: scene[0].options[0].text })
    .click();
  await page
    .getByRole("button", { name: "Submit Choice", exact: true })
    .click();
  await expect(page.locator('[data-phase="scene2"]')).toBeVisible();
  await page
    .getByRole("button")
    .filter({ hasText: scene[1].options[0].text })
    .click();
  for (const textarea of await page
    .locator(".xp-mission-workspace textarea")
    .all())
    await textarea.fill(
      "I compared the measured evidence with the reference limit and considered the treatment risks.",
    );
  await page.screenshot({
    path: "docs/remaining-portal/mission-decision-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Submit Choice", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit My Choice", exact: true })
    .click();
  await expect(page.locator('[data-phase="consequence"]')).toBeVisible();
  await page.screenshot({
    path: "docs/remaining-portal/mission-consequences-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Captured mission response",
  );
  await page.getByRole("button", { name: "Save notebook now" }).click();
  await expect(page.getByRole("dialog")).toContainText("saved to your account");
  expect(state.progressRows.find((r) => r.id === "attempt-1")).toEqual(
    HISTORY[0],
  );
  const draft = state.progressRows.find((r) => r.id.startsWith("new-attempt"));
  expect(draft.answers.scene1.selectedOption).toBe(scene[0].options[0].id);
  expect(draft.answers.scene2.selectedOption).toBe(scene[1].options[0].id);
  expect(draft.score).toBeNull();
  await page.setViewportSize({ width: 375, height: 812 });
  await noOverflow(page);
  await page.screenshot({
    path: "docs/remaining-portal/notebook-mobile.png",
    fullPage: true,
  });
});
test("teacher mission controls and submission review retain original student answers", async ({
  page,
}) => {
  await setup(page, { teacher: true });
  await page.goto("/TeacherDashboard");
  await page.getByRole("button", { name: "Missions", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Lock The Invisible Threat",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Lock The Invisible Threat", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Unlock The Invisible Threat",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Unlock The Invisible Threat", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Lock The Invisible Threat",
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/remaining-portal/teacher-tools-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Students", exact: true }).click();
  await page
    .locator(".px-teacher-tools")
    .getByText("Synthetic Peer", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "View Answers", exact: true })
    .first()
    .click();
  await page.getByRole("dialog").locator("summary").first().click();
  await expect(page.getByRole("dialog")).toContainText(
    "Original saved evidence",
  );
  await page.screenshot({
    path: "docs/remaining-portal/teacher-review-desktop.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("professional reflection appends an unassessed record and remains readable after reload", async ({
  page,
}) => {
  const seedRows = ["water_contamination", "acid_rain", "invasive_species"].map(
    (scenario_id, i) => ({
      id: `passed-${i}`,
      student_id: ID,
      scenario_id,
      score: 100,
      completed_at: "2026-10-10T10:00:00Z",
      answers: { exitTicket: { score: 100, passed: true } },
    }),
  );
  const state = await setup(page, { seedRows });
  await page.goto("/RoleReflection?role=environmental_scientist");
  await page.getByLabel("Data Analysis", { exact: true }).check();
  for (const field of await page.locator("textarea").all())
    await field.fill(
      "I compared the measured evidence and supported my recommendation with chemistry.",
    );
  await page
    .getByRole("button", { name: "Save professional reflection" })
    .click();
  await expect(page.getByRole("status").last()).toContainText(
    "Reflection saved to your account",
  );
  expect(state.progressRows.slice(0, 3)).toEqual(seedRows);
  expect(state.progressRows[3].score).toBeNull();
  expect(state.progressRows[3].answers.meta.recordType).toBe("role_reflection");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Earlier reflections" }),
  ).toBeVisible();
});
test("profile name and password use existing authenticated connections with validation", async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto("/ProfileSettings");
  await page
    .getByLabel("Display Name", { exact: true })
    .fill("Updated Learner");
  await page.getByRole("button", { name: "Save Name", exact: true }).click();
  await expect(page.getByRole("banner")).toContainText("Updated Learner");
  await page
    .getByLabel("Current Password", { exact: true })
    .fill("wrong-password");
  await page
    .getByLabel("New Password", { exact: true })
    .fill("correct-password");
  await page
    .getByLabel("Confirm New Password", { exact: true })
    .fill("correct-password");
  await page
    .getByRole("button", { name: "Update Password", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    /Invalid login|current password/i,
  );
  expect(
    state.writes.filter((w) => w.type === "metadata" && w.body.password),
  ).toHaveLength(0);
});
