import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { setup, noOverflow } from "./support/fixtures";
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
  const audio = mission.locator("audio"), proceed = mission.getByRole("button", { name: "Continue", exact: true });
  await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(0);
  await expect(mission.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  // S01 has three authored spoken lines and no clip. Do not invent an opening video.
  for (const id of ["AD_S01_NAR_01", "AD_S01_HAM_02", "AD_S01_RAS_03"]) {
    await expect(audio).toHaveAttribute("data-dialogue-id", id);
    await expect(proceed).toBeEnabled({ timeout: 12000 });
    await proceed.click();
  }
  const video = mission.locator("video");
  await expect(audio).toHaveAttribute("data-dialogue-id", "AD_S02_ORB_01");
  await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(.2);
  expect(await video.evaluate(el => ({ loop: el.loop, rate: el.playbackRate, muted: el.muted })) )
    .toEqual({ loop: false, rate: 1, muted: true });
  const firstTime = await video.evaluate(el => el.currentTime);
  await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(firstTime + .15);
  await mission.screenshot({ path: `docs/atom-dive/screenshots/playing-filters-${width}.png` });
  await expect(mission.getByAltText("Actual final frame of the approved clip", { exact: true })).toBeVisible({ timeout: 7000 });
  await expect(mission.locator("footer")).toBeVisible();
  await expect(audio).toHaveCount(1);
  expect(data.writes).toHaveLength(0);
});
