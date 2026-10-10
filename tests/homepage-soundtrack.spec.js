import { test, expect } from "@playwright/test";
import { MUTE, launch, observe, control, audioState } from "./support/homepageAudio";
test.use({ launchOptions: launch("document-user-activation-required") });

test("blocked autoplay retries on a permitted homepage interaction and manual mute survives reload", async ({ page }) => {
  await observe(page, { blockUntilGesture: true }); await page.goto("/");
  await expect(page.getByRole("status")).toContainText("interact with the homepage");
  expect((await audioState(page)).attempts).toBe(1);
  expect(await page.evaluate(() => window.homeAudio[0].playRequests[0])).toEqual({ volume: 0.15, muted: false });
  await expect(control(page)).toHaveAttribute("aria-pressed", "false");
  await page.locator(".home-hero h1").click();
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(0.1);
  await control(page).click();
  expect((await audioState(page)).paused).toBe(true);
  expect(await page.evaluate(key => localStorage.getItem(key), MUTE)).toBe("true");
  await page.reload();
  await expect(control(page)).toBeVisible();
  expect((await audioState(page)).attempts).toBe(0);
  await page.locator(".home-hero h1").click();
  expect((await audioState(page)).paused).toBe(true);
  await control(page).focus(); await page.keyboard.press("Enter");
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(key => localStorage.getItem(key), MUTE)).toBe("false");
});

test("unsupported media and missing tab coordination fail truthfully", async ({ browser }) => {
  for (const mode of [{ fail: true }, { noLocks: true }, { missingAsset: true }]) {
    const context = await browser.newContext(); const page = await context.newPage();
    await observe(page, mode);
    if (mode.missingAsset) await page.route("**/audio/homepage/*.mp3", route => route.fulfill({ status: 404, body: "Missing MP3" }));
    await page.goto("/");
    await expect(control(page)).toBeDisabled();
    await expect(control(page)).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("status")).toContainText("unavailable");
    expect((await audioState(page)).paused).toBe(true);
    await context.close();
  }
});

