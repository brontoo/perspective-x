import { expect } from "@playwright/test";
import { setup } from "./fixtures";
import { ATOM_STEPS } from "../../src/data/atomDive.mjs";

// Real EasyList cosmetic selectors that must never hide learning controls.
export const ATOM_COSMETIC_FILTER = ".ad-primary, .ad-footer { display: none !important; }";

export async function atomSetup(page, options = {}) {
  await page.addInitScript(() => {
    window.__atomPlays = [];
    const play = HTMLMediaElement.prototype.play, pause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function () {
      if ((this.tagName === "AUDIO" && (this.classList.contains("px-atom-voice-audio") || this.classList.contains("px-atom-review-audio"))) || (this.tagName === "VIDEO" && this.getAttribute("src")?.includes("atom_dive"))) {
        window.__atomPlays.push({ id: this.dataset.dialogueId, src: this.getAttribute("src"), op: "play" });
        this.dispatchEvent(new Event("playing")); return Promise.resolve();
      }
      return play.call(this);
    };
    HTMLMediaElement.prototype.pause = function () {
      if (this.classList.contains("px-atom-voice-audio")) window.__atomPlays.push({ id: this.dataset.dialogueId, op: "pause" });
      return pause.call(this);
    };
  });
  return setup(page, { empty: true, ...options });
}
export async function atomStart(page) {
  await expect(page.locator(".px-atom-adventure")).toBeVisible();
  const start = page.getByRole("button", { name: /^(Start ATOM DIVE|Resume mission)$/ });
  if (await start.count()) await start.click();
  await expect(page.locator(".px-atom-model-intro")).toBeHidden({ timeout: 10000 });
  const mode = page.getByLabel("Story playback", { exact: true });
  if (await mode.count()) await mode.selectOption("manual");
}
export async function atomContinue(page) {
  await expect(page.locator(".px-atom-model-intro")).toBeHidden({ timeout: 10000 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const button = page.locator(".px-atom-controls > .px-atom-primary");
  const skip = page.getByRole("button", { name: "Skip clip", exact: true });
  if (await skip.count()) await skip.click();
  if (!(await button.isEnabled())) {
    const id = await page.locator(".px-atom-dialogue").getAttribute("data-dialogue-id");
    await expect(page.locator(".px-atom-voice-audio")).toHaveAttribute("data-dialogue-id", id);
    await page.locator(".px-atom-voice-audio").evaluate(el => el.dispatchEvent(new Event("ended")));
  }
  await button.click();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
export async function atomReach(page, step) {
  await atomStart(page);
  for (let i = 0; i < 100; i++) {
    if (await page.locator(".px-atom-adventure").getAttribute("data-step") === step &&
        await page.locator(".px-atom-adventure").getAttribute("data-feedback") === "false" &&
        (!ATOM_STEPS[step].task || await page.locator(".px-atom-task").count())) return;
    await atomContinue(page);
  }
  throw new Error(`Did not reach ATOM DIVE checkpoint ${step}`);
}
export async function atomMetal(page) {
  await atomReach(page, "metalTask");
  await page.getByRole("button", { name: "Inspect ion cores", exact: true }).click();
  await page.getByRole("button", { name: "Inspect valence electrons", exact: true }).click();
  await page.getByLabel("Where do the valence electrons belong?", { exact: true }).selectOption("delocalized");
  await page.getByLabel("Which components attract?", { exact: true }).selectOption("cores-electrons");
  await page.getByLabel("Explain the overall charge", { exact: true }).selectOption("balanced");
  await page.getByRole("button", { name: "Verify metallic reconstruction", exact: true }).click();
}
export async function atomIonic(page) {
  await atomReach(page, "ionicTransfer");
  await page.getByRole("button", { name: "Transfer one electron", exact: true }).click();
  await atomReach(page, "ionicCharges");
  await expect(page.getByRole("img", { name: /Sodium: 11 protons, 10 electrons/ })).toBeVisible();
  await page.getByLabel("Sodium ion charge", { exact: true }).selectOption("+1");
  await page.getByLabel("Chloride ion charge", { exact: true }).selectOption("-1");
  await page.getByLabel("What happened to the nuclei?", { exact: true }).selectOption("unchanged");
  await page.getByRole("button", { name: "Verify charges and nuclei", exact: true }).click();
  await atomReach(page, "ionicAttraction");
  await page.getByLabel("What holds this ionic structure together?", { exact: true }).selectOption("opposite-ions");
  await page.getByRole("button", { name: "Verify ionic attraction", exact: true }).click();
  await atomReach(page, "ionicLattice");
  await page.getByRole("button", { name: "Expand repeating lattice", exact: true }).click();
  await expect(page.getByRole("img", { name: /three-dimensional rock-salt/i })).toBeVisible();
  await page.getByRole("button", { name: "Verify extended structure", exact: true }).click();
}
export async function atomCompare(page) {
  await atomReach(page, "comparisonTask");
  await expect(page.locator(".px-atom-comparison-models svg")).toHaveCount(2);
  await expect(page.getByRole("button", { name: /^Choose Model/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Verify location and both formation matches", exact: true })).toHaveCount(0);
  await atomReach(page, "recovery");
}
