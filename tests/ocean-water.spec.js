import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { setup, ID, noOverflow } from "./support/fixtures";
import { installOceanPlayback, oceanTask } from "./support/ocean-flow";

const target = "/ScenarioPlayer?scenario=ionic_aquarium_mystery";
const shots = "docs/ocean-dome/screenshots";
async function openLab(page) {
  await installOceanPlayback(page);
  const state = await setup(page, {
    seedRows: [
      { id: "dessert-pass", student_id: ID, scenario_id: "ionic_dessert_mystery", score: 80,
        completed_at: "2026-10-10T10:00:00Z", answers: { exitTicket: { score: 80, passed: true } } },
      { id: "ocean-draft", student_id: ID, scenario_id: "ionic_aquarium_mystery", score: null, completed_at: null,
        answers: { investigation: { oceanStory: { step: 8, line: 2 } },
          meta: { recordType: "mission_attempt", updatedAt: "2026-10-01T10:00:00Z" } } },
    ],
  });
  await page.goto(target);
  await oceanTask(page, "water");
  return state;
}
const lab = page => page.getByRole("region", { name: "Water chemistry simulator" });

test("one-factor trials reveal visible results only on Run and preserve the fixed reference", async ({ page }) => {
  await openLab(page);
  const activity = lab(page);
  const result = activity.locator(".wl-result");
  const sample = activity.locator(".wl-sample.is-trial");
  const record = page.getByRole("button", { name: "Record water-chemistry trends →", exact: true });
  await expect(sample.getByRole("img")).toHaveAccessibleName(/run a test to reveal/i);
  await expect(record).toBeDisabled();
  await activity.getByRole("button", { name: "Investigate pH", exact: true }).click();
  await expect(activity.getByLabel("pH", { exact: true })).toHaveValue("8.7");
  await expect(activity.getByLabel("Calcium (mg/L) held fixed", { exact: true })).toHaveText("420");
  await expect(activity.getByLabel("Alkalinity (meq/L) held fixed", { exact: true })).toHaveText("2.4");
  await activity.getByRole("radio", { name: "Less", exact: true }).check();
  await activity.getByRole("button", { name: "Run virtual water test", exact: true }).click();
  await expect(result).toContainText("High precipitation tendency");
  await expect(result).toContainText("3.98×");
  await expect(result).toContainText("Only pH changed");
  await expect(result).toContainText("Your prediction: less");
  await expect.poll(() => sample.locator(".wl-particle").count()).toBeGreaterThan(0);
  await expect(record).toBeEnabled();
  await expect(activity.locator(".wl-sample").first().getByRole("img")).toHaveAccessibleName(/relative tendency 1.00/);

  // Changing an input must not quietly rewrite the last measured sample.
  await activity.getByLabel("pH", { exact: true }).fill("7.8");
  await expect(record).toBeDisabled();
  await expect(result).toContainText("3.98×");
  await expect(activity.locator(".wl-run-actions")).toContainText("Settings changed");
  await activity.getByRole("button", { name: "Run virtual water test", exact: true }).click();
  await expect(result).toContainText("0.50×");
  await expect(sample.locator(".wl-particle")).toHaveCount(0);
  await expect(activity.locator(".wl-fresh-note")).toContainText("does not remove solid");
  await activity.getByText("Compare your runs · 2 saved trials", { exact: true }).click();
  await expect(activity.locator("tbody tr")).toHaveCount(2);
  await expect(activity.locator("tbody tr").first()).toContainText("3.98×");
  await expect(activity.locator("tbody tr").last()).toContainText("0.50×");
});

test("calcium and alkalinity experiments isolate their factors; history and notebook survive reload", async ({ page }) => {
  await openLab(page);
  const activity = lab(page);
  await activity.getByRole("button", { name: "Investigate calcium", exact: true }).click();
  await expect(activity.getByLabel("pH held fixed", { exact: true })).toHaveText("8.1");
  await expect(activity.getByLabel("Alkalinity (meq/L) held fixed", { exact: true })).toHaveText("2.4");
  await activity.getByRole("button", { name: "Run virtual water test", exact: true }).click();
  await expect(activity.locator(".wl-result")).toContainText("1.45×");
  await activity.getByRole("button", { name: "Investigate alkalinity", exact: true }).click();
  await expect(activity.getByLabel("pH held fixed", { exact: true })).toHaveText("8.1");
  await expect(activity.getByLabel("Calcium (mg/L) held fixed", { exact: true })).toHaveText("420");
  await activity.getByRole("button", { name: "Run virtual water test", exact: true }).click();
  await expect(activity.locator(".wl-result")).toContainText("2.42×");
  await page.locator(".od-ledger summary").click();
  await expect(page.locator(".od-ledger")).toContainText("relative tendency 2.42");
  // Wait for the real app's debounced draft persistence before refreshing.
  await expect.poll(() => page.evaluate(() => Object.values(localStorage).some(v => v.includes('"trials"')))).toBe(true);
  await page.reload();
  await oceanTask(page, "water");
  await expect(lab(page).locator(".wl-result")).toContainText("2.42×");
  await expect(lab(page).getByText("Compare your runs · 2 saved trials", { exact: true })).toBeVisible();
});

for (const width of [1440, 820, 390]) {
  test(`water activity is legible and usable at ${width}px, including fullscreen`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await openLab(page);
    const activity = lab(page);
    await activity.getByRole("button", { name: "Run virtual water test", exact: true }).click();
    await expect(activity.locator(".wl-result")).toContainText("13.97×");
    await expect.poll(() => activity.locator(".wl-sample.is-trial .wl-particle").count()).toBeGreaterThan(0);
    await noOverflow(page);
    await activity.locator(".wl-observation").scrollIntoViewIfNeeded();
    mkdirSync(shots, { recursive: true });
    await page.locator(".od-novel").screenshot({ path: `${shots}/water-lab-${width}.png` });
    await page.getByRole("button", { name: "Full screen", exact: true }).click();
    await expect(activity.getByRole("button", { name: "Run virtual water test", exact: true })).toBeEnabled();
    await activity.getByRole("button", { name: "Load starting reference", exact: true }).click();
    await activity.getByRole("button", { name: "Run virtual water test", exact: true }).click();
    await expect(activity.locator(".wl-result")).toContainText("1.00×");
    await expect(activity.locator(".wl-sample.is-trial .wl-particle")).toHaveCount(0);
    await noOverflow(page);
    await activity.locator(".wl-observation").scrollIntoViewIfNeeded();
    await page.locator(".od-session").screenshot({ path: `${shots}/water-lab-fullscreen-${width}.png` });
    await page.getByRole("button", { name: "Exit full screen", exact: true }).click();
  });
}
