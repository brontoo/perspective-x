import { test, expect } from "@playwright/test";
import { MUTE, launch, observe, control, audioState } from "./support/homepageAudio";
import fs from "node:fs/promises";
test.use({ launchOptions: launch("no-user-gesture-required") });

test("exact MP3 decodes, fades to 15% in three seconds and loops with one audio element", async ({ page }) => {
  await observe(page); await page.goto("/");
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  const initial = await audioState(page);
  expect(initial.count).toBe(1); expect(initial.loop).toBe(true);
  expect(initial.duration).toBeGreaterThan(113); expect(initial.duration).toBeLessThan(115);
  expect(initial.volume).toBeLessThan(0.12);
  await expect.poll(async () => (await audioState(page)).volume, { timeout: 6000 }).toBeCloseTo(0.15, 3);
  expect((await audioState(page)).ready).toBeGreaterThanOrEqual(3);
  // Observe actual decoded PCM, not merely a mocked play() promise.
  const energy = await page.evaluate(async () => {
    const context = new AudioContext();
    const source = context.createMediaElementSource(window.homeAudio[0]);
    const analyser = context.createAnalyser();
    source.connect(analyser); analyser.connect(context.destination);
    await context.resume();
    await new Promise(resolve => setTimeout(resolve, 250));
    const samples = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(samples);
    // Keep the graph connected through the remaining native loop check.
    window.homeAudioContext = context;
    return Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
  });
  expect(energy).toBeGreaterThan(0.00001);
  // Seek to the real track ending; native looping and the fade still run on the exact MP3.
  await page.evaluate(() => { const a = window.homeAudio[0]; a.currentTime = a.duration - 0.6; });
  await expect.poll(async () => (await audioState(page)).volume).toBeLessThan(0.11);
  await expect.poll(async () => (await audioState(page)).time).toBeLessThan(5);
  await expect.poll(async () => (await audioState(page)).volume, { timeout: 6000 }).toBeCloseTo(0.15, 3);
  expect((await audioState(page)).count).toBe(1);
  expect((await audioState(page)).paused).toBe(false);
});

test("hidden-tab pause retains position; page hide resets and prevents late resumes", async ({ page }) => {
  await observe(page); await page.goto("/");
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(0.2);
  await page.evaluate(() => {
    window.testHidden = true;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => window.testHidden });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect((await audioState(page)).paused).toBe(true);
  const pausedAt = (await audioState(page)).time;
  await page.evaluate(() => { window.testHidden = false; document.dispatchEvent(new Event("visibilitychange")); });
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  expect((await audioState(page)).time).toBeGreaterThanOrEqual(pausedAt);
  await page.evaluate(() => { window.dispatchEvent(new PageTransitionEvent("pagehide")); document.dispatchEvent(new Event("visibilitychange")); });
  expect((await audioState(page)).paused).toBe(true);
  expect((await audioState(page)).time).toBe(0);
});

test("real exclusive locks prevent simultaneous playback across two tabs and propagate mute", async ({ context, page }) => {
  await observe(page); await page.goto("/");
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  const second = await context.newPage(); await observe(second); await second.goto("/");
  await expect(second.getByRole("status")).toContainText("another tab");
  expect((await audioState(second)).attempts).toBe(0);
  await control(second).click();
  await expect(second.getByRole("status")).toContainText("another tab");
  expect((await audioState(second)).paused).toBe(true);
  expect((await audioState(page)).paused).toBe(false);
  await control(page).click();
  await expect.poll(() => second.evaluate(key => localStorage.getItem(key), MUTE)).toBe("true");
  await control(second).click();
  await expect(control(second)).toHaveAttribute("aria-pressed", "true");
  expect((await audioState(page)).paused).toBe(true);
  expect((await audioState(second)).paused).toBe(false);
  await control(second).click();
  expect((await audioState(page)).paused).toBe(true);
  expect((await audioState(second)).paused).toBe(true);
});

test("route transitions stop/reset audio before other pages and leave Our Story playback intact", async ({ page }) => {
  await observe(page); await page.goto("/");
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Our Story", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect((await audioState(page)).count).toBe(1);
  expect((await audioState(page)).paused).toBe(false);
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Explore Roles", exact: true }).click();
  await expect(page).toHaveURL(/\/Roles$/);
  expect((await audioState(page)).paused).toBe(true);
  expect((await audioState(page)).time).toBe(0);
  expect((await audioState(page)).src).toBe(null);
  for (const route of ["/SignIn", "/Dashboard", "/TeacherDashboard", "/ScenarioPlayer?scenario=water_contamination"]) {
    await page.evaluate(() => { history.pushState({}, "", "/"); dispatchEvent(new PopStateEvent("popstate")); });
    await expect(control(page)).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(path => { history.pushState({}, "", path); dispatchEvent(new PopStateEvent("popstate")); }, route);
    await expect(control(page)).toHaveCount(0);
    expect((await audioState(page)).paused).toBe(true);
    expect((await audioState(page)).time).toBe(0);
  }
});

test("pending playback cancellation cannot leak across navigation or release ownership early", async ({ context, page }) => {
  await observe(page, { delay: true }); await page.goto("/");
  await expect(control(page)).toBeVisible();
  await expect.poll(async () => (await audioState(page)).attempts).toBe(1);
  await page.getByRole("link", { name: "Explore Roles", exact: true }).click();
  await expect(page).toHaveURL(/\/Roles$/);
  expect((await audioState(page)).paused).toBe(true);
  const second = await context.newPage(); await observe(second); await second.goto("/");
  await expect(second.getByRole("status")).toContainText("another tab");
  await page.evaluate(() => window.settleHomePlay());
  await control(second).click();
  await expect(control(second)).toHaveAttribute("aria-pressed", "true");
  expect((await audioState(page)).paused).toBe(true);
  expect((await audioState(page)).time).toBe(0);
});

test("rapid mute toggles do not create duplicate players or unhandled rejections", async ({ page }) => {
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  await observe(page); await page.goto("/");
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  for (let i = 0; i < 8; i++) await control(page).click();
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  expect((await audioState(page)).count).toBe(1);
  expect(errors).toEqual([]);
  await control(page).click(); expect((await audioState(page)).paused).toBe(true);
});

test("navigation retains its approved appearance with one discreet control at three sizes", async ({ page }) => {
  await observe(page, { mute: true }); await page.goto("/");
  await fs.mkdir("test-results/homepage-music", { recursive: true });
  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await expect(control(page)).toBeVisible();
    const button = await control(page).boundingBox();
    const header = await page.locator(".home-nav").boundingBox();
    expect(button.y).toBeGreaterThanOrEqual(header.y);
    expect(button.y + button.height).toBeLessThanOrEqual(header.y + header.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: `test-results/homepage-music/home-${width}x${height}.png` });
  }
});
