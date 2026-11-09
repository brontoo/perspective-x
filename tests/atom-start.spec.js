import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { setup, noOverflow } from "./support/fixtures";
import { checkpoint, draftFor } from "./support/atom-checkpoints.mjs";
import { ID } from "./support/fixtures";
import { ATOM_COSMETIC_FILTER } from "./support/atom-flow";

for (const width of [1227, 390]) test(`Start stays visible with advertising filters and plays real speech and motion at ${width}px`, async ({ page }) => {
  test.setTimeout(50000);
  await page.setViewportSize({ width, height: width === 390 ? 844 : 990 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const data = await setup(page, { teacher: true, empty: true });
  await page.goto("/ScenarioPlayer?scenario=atom_dive&preview=true");
  await page.addStyleTag({ content: ATOM_COSMETIC_FILTER });
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("crossorigin", "use-credentials");
  const mission = page.getByRole("region", { name: "ATOM DIVE cinematic mission", exact: true });
  const start = page.getByRole("button", { name: "Start ATOM DIVE", exact: true });
  await expect(start).toBeVisible();
  await noOverflow(page);
  mkdirSync("docs/atom-dive/screenshots", { recursive: true });
  await mission.screenshot({ path: `docs/atom-dive/screenshots/start-filters-${width}.png` });
  await start.click();
  let audio = mission.locator("audio");
  await expect(mission.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
  await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(0);
  await expect(mission.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  // Real completion events advance all three S01 lines without a Continue click.
  await expect(audio).toHaveAttribute("data-dialogue-id", "AD_S02_ORB_01", {timeout: 25000});
  await expect(mission.locator(".px-atom-stage")).toHaveAttribute("data-media-status", "withheld");
  await expect(mission.locator("video")).toHaveCount(0);
  await expect(mission.locator(".px-atom-environment")).toHaveAttribute("src", /revisions\/AD_I02_lost_signal.png/);
  // V06 is the retained native video; V01 is deliberately not played over the revised still.
  const checkpointState = checkpoint("reflection"); checkpointState.step = "homecoming"; checkpointState.cursor = 0;
  await setup(page, {teacher:true,seedRows:[draftFor(checkpointState,ID)]});
  await page.goto("/ScenarioPlayer?scenario=atom_dive&preview=true");
  await page.addStyleTag({content:ATOM_COSMETIC_FILTER});
  await page.getByRole("button", {name:"Resume mission",exact:true}).click();
  audio = mission.locator("audio");
  const video = mission.locator("video");
  await expect(audio).toHaveAttribute("data-dialogue-id", "AD_S11_HAM_01");
  await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(.2);
  expect(await video.evaluate(el => ({ loop: el.loop, rate: el.playbackRate, muted: el.muted })) )
    .toEqual({ loop: false, rate: 1, muted: true });
  const firstTime = await video.evaluate(el => el.currentTime);
  await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(firstTime + .15);
  await mission.screenshot({ path: `docs/atom-dive/screenshots/playing-filters-${width}.png` });
  await expect(mission.getByAltText("Final cinematic frame", { exact: true })).toBeVisible({ timeout: 7000 });
  await expect(mission.locator("footer")).toBeVisible();
  await expect(audio).toHaveCount(1);
  expect(data.writes).toHaveLength(0);
});
