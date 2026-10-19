import { expect } from "@playwright/test";

// Controlled native media events keep long narrative tests deterministic. The
// separate real-MP3 test verifies decoding and automatic playback in Chromium.
export async function installOceanPlayback(page) {
  await page.addInitScript(() => {
    window.__oceanPlayback = [];
    const nativePlay = HTMLMediaElement.prototype.play;
    const nativePause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function () {
      if (this.tagName === "AUDIO" && this.hasAttribute("data-dialogue-id")) {
        window.__oceanPlayer = this;
        window.__oceanPlayback.push({
          op: "play",
          id: this.dataset.dialogueId,
          src: this.getAttribute("src"),
        });
        this.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      }
      return nativePlay.call(this);
    };
    HTMLMediaElement.prototype.pause = function () {
      if (this.tagName === "AUDIO" && this.hasAttribute("data-dialogue-id")) {
        window.__oceanPlayback.push({
          op: "pause",
          id: this.dataset.dialogueId,
        });
        this.dispatchEvent(new Event("pause"));
      }
      return nativePause.call(this);
    };
  });
}
export async function finishCaption(page) {
  await page
    .locator(".od-session>audio")
    .evaluate((audio) => audio.dispatchEvent(new Event("ended")));
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
export async function startOcean(page) {
  await expect(page.locator(".od-novel")).toBeVisible();
  const start = page.getByRole("button", {
    name: "Start scenario",
    exact: true,
  });
  if (await start.count()) await start.click();
}
export async function oceanTask(page, step) {
  await startOcean(page);
  for (let count = 0; count < 100; count++) {
    const viewport = page.locator(".od-viewport");
    if (
      (!step || (await viewport.getAttribute("data-story-step")) === step) &&
      (await page.locator(".od-workspace:visible").count())
    )
      return;
    await finishCaption(page);
  }
  throw new Error(`Story did not reach task ${step}`);
}
export async function oceanBriefing(page) {
  await expect(page.locator(".od-viewport")).toBeVisible();
  await oceanTask(page, "first-decision");
}
export async function oceanStartInvestigation(page) {
  await oceanTask(page, "first-decision");
  await page
    .getByRole("button", {
      name: "Collect independent evidence from the isolated mineral",
      exact: true,
    })
    .click();
  await oceanTask(page, "calcium");
}
export async function oceanAssessmentReady(page) {
  const finish = page.getByRole("button", {
    name: /^(Complete Mission|Save result and review)$/,
  });
  for (let i = 0; i < 5; i++) {
    if (await finish.isEnabled()) return;
    await finishCaption(page);
  }
  await expect(finish).toBeEnabled();
}
