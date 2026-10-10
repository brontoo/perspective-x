import { test, expect } from "@playwright/test";
import { setup } from "./support/fixtures";
import { createRequire } from "node:module";
import { CLOUD_REGIONS, coverGeometry, polygonCoverage } from "../src/components/landing/cinematicMotionGeometry.js";

// Use the PNG decoder already bundled with this project's pinned Playwright;
// no production dependency or image transformation is introduced.
const { PNG } = createRequire(import.meta.url)("../node_modules/playwright-core/lib/utilsBundle.js");

async function prepare(page) {
  await page.addInitScript(() => {
    localStorage.setItem("px-home-music-muted", "true");
    window.motionObservation = { draws: 0, seconds: 0 };
    const locations = new WeakMap();
    const prototype = WebGLRenderingContext.prototype;
    const getLocation = prototype.getUniformLocation;
    prototype.getUniformLocation = function (...args) {
      const result = getLocation.apply(this, args);
      if (result) locations.set(result, args[1]);
      return result;
    };
    const uniform = prototype.uniform1f;
    prototype.uniform1f = function (...args) {
      if (this.canvas.classList.contains("home-cinematic-motion") && locations.get(args[0]) === "uTime") {
        if (window.motionObservation.overrideSeconds != null) args[1] = window.motionObservation.overrideSeconds;
        window.motionObservation.seconds = args[1];
      }
      return uniform.apply(this, args);
    };
    const draw = prototype.drawArrays;
    prototype.drawArrays = function (...args) {
      if (this.canvas.classList.contains("home-cinematic-motion")) window.motionObservation.draws++;
      return draw.apply(this, args);
    };
  });
  await setup(page, { guest: true });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Sign In", exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}

function localizedDifference(before, after, scene, width, height) {
  const first = PNG.sync.read(before), second = PNG.sync.read(after);
  expect([second.width, second.height]).toEqual([first.width, first.height]);
  const geometry = coverGeometry(scene.width, scene.height, 1448, 1086, scene.position);
  let moved = 0, outside = 0;
  for (let y = 0; y < first.height; y++) {
    for (let x = 0; x < first.width; x++) {
      const index = (y * first.width + x) * 4;
      const delta = Math.max(...[0,1,2].map(channel => Math.abs(first.data[index + channel] - second.data[index + channel])));
      if (delta <= 1) continue; // One-level rasterization tolerance, never geometry tolerance.
      moved++;
      const sourceX = (x * width / first.width - scene.x - geometry.offsetX) / geometry.scale;
      const sourceY = (y * height / first.height - scene.y - geometry.offsetY) / geometry.scale;
      if (!CLOUD_REGIONS.some(({ points }) => polygonCoverage(sourceX, sourceY, points) > 0)) outside++;
    }
  }
  return { moved, outside };
}

for (const [width,height] of [[1920,1080],[1440,900],[768,1024],[390,844],[1366,600]]) {
  test(`only the registered cloud islands move at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await prepare(page);
    await expect(page.locator(".home-cinematic-motion")).toHaveAttribute("data-state", "reduced");
    const before = await page.screenshot();
    const selectors = ".home-nav,.home-hero,.home-bottom,.home-logo,.home-actions,.home-stats,.home-footer";
    const original = await page.locator(selectors).evaluateAll(elements => elements.map(element => ({ text: element.innerText, box: element.getBoundingClientRect().toJSON() })));
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const canvas = page.locator(".home-cinematic-motion");
    await expect(canvas).toHaveAttribute("data-state", "running");
    await expect.poll(() => page.evaluate(() => window.motionObservation.seconds), { timeout: 10000 }).toBeGreaterThan(3);
    // Compare two painted WebGL frames so switching compositor paths cannot
    // mistake text-shadow rasterization for animation outside a cloud mask.
    const activeBefore = await page.screenshot();
    const start = await page.evaluate(() => window.motionObservation.seconds);
    await expect.poll(() => page.evaluate(() => window.motionObservation.seconds), { timeout: 10000 }).toBeGreaterThan(start + 2);
    const after = await page.screenshot({ path: `test-results/cinematic-motion/active-${width}x${height}.png` });
    const scene = await page.locator(".home-scene").evaluate(element => ({ ...element.getBoundingClientRect().toJSON(), position: getComputedStyle(element).backgroundPosition }));
    const difference = localizedDifference(activeBefore, after, scene, width, height);
    expect(difference.moved).toBeGreaterThan(100);
    expect(difference.outside).toBe(0);
    expect(await page.locator(selectors).evaluateAll(elements => elements.map(element => ({ text: element.innerText, box: element.getBoundingClientRect().toJSON() })))).toEqual(original);
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([width,height]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(canvas).toHaveAttribute("data-state", "reduced");
    await expect.poll(async () => PNG.sync.read(await page.screenshot()).data.equals(PNG.sync.read(before).data)).toBe(true);
  });
}

test("motion pauses while hidden, resumes without a jump, and cleans up on navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await prepare(page);
  const canvas = page.locator(".home-cinematic-motion");
  await expect(canvas).toHaveAttribute("data-state", "running");
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
  await expect(canvas).toHaveCSS("pointer-events", "none");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-state", "paused");
  const paused = await page.evaluate(() => ({ ...window.motionObservation }));
  await page.waitForTimeout(1100);
  expect(await page.evaluate(() => ({ ...window.motionObservation }))).toEqual(paused);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-state", "running");
  await expect.poll(() => page.evaluate(() => window.motionObservation.draws)).toBeGreaterThan(paused.draws);
  expect(await page.evaluate(() => window.motionObservation.seconds)).toBeLessThan(paused.seconds + .5);
  await page.getByRole("button", { name: "Our Story", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/SignIn$/);
  await expect(canvas).toHaveCount(0);
  const stopped = await page.evaluate(() => window.motionObservation.draws);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.motionObservation.draws)).toBe(stopped);
  await page.goBack();
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-state", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-state", "reduced");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(canvas).toHaveAttribute("data-state", "running");
  await expect(canvas).toHaveCount(1);
});

test("unavailable graphics retains the exact static scene", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepare(page);
  await expect(page.locator(".home-cinematic-motion")).toHaveAttribute("data-state", "reduced");
  const before = await page.screenshot();
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return kind === "webgl" ? null : original.call(this, kind, ...args);
    };
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".home-cinematic-motion")).toHaveAttribute("data-state", "unavailable");
  expect(PNG.sync.read(await page.screenshot()).data.equals(PNG.sync.read(before).data)).toBe(true);
});

test("context loss falls back safely and high-DPR canvases remain capped", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 3, reducedMotion: "no-preference" });
  const page = await context.newPage();
  try {
    await prepare(page);
    const canvas = page.locator(".home-cinematic-motion");
    await expect(canvas).toHaveAttribute("data-state", "running");
    const pixels = await canvas.evaluate(element => ({ width: element.width, height: element.height, cssWidth: element.clientWidth }));
    expect(pixels.width).toBeLessThanOrEqual(Math.ceil(pixels.cssWidth * 1.25));
    expect(pixels.width * pixels.height).toBeLessThanOrEqual(2403000);
    await canvas.evaluate(element => element.getContext("webgl").getExtension("WEBGL_lose_context").loseContext());
    await expect(canvas).toHaveAttribute("data-state", "unavailable");
    await expect(canvas).toHaveCSS("visibility", "hidden");
    await page.getByRole("link", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL(/\/SignIn$/);
  } finally { await context.close(); }
});

test("the GPU texture field closes continuously over its complete 48-second cycle", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await prepare(page);
  await expect(page.locator(".home-cinematic-motion")).toHaveAttribute("data-state", "running");
  // Pin shader time in test instrumentation, after the three-second entry fade.
  await page.evaluate(() => { window.motionObservation.overrideSeconds = 4; });
  await expect.poll(() => page.evaluate(() => window.motionObservation.seconds)).toBe(4);
  const before = PNG.sync.read(await page.screenshot());
  await page.evaluate(() => { window.motionObservation.overrideSeconds = 52; });
  await expect.poll(() => page.evaluate(() => window.motionObservation.seconds)).toBe(52);
  const after = PNG.sync.read(await page.screenshot());
  let maximum = 0;
  for (let index = 0; index < before.data.length; index++) maximum = Math.max(maximum, Math.abs(before.data[index] - after.data[index]));
  expect(maximum).toBeLessThanOrEqual(1);
});

test("one renderer follows live resizing through every crop breakpoint", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await prepare(page);
  const canvas = page.locator(".home-cinematic-motion");
  await expect(canvas).toHaveAttribute("data-state", "running");
  for (const [width,height,position] of [[390,844,"60% 50%"],[768,1024,"59% 50%"],[1920,1080,"50% 50%"],[1366,600,"50% 50%"]]) {
    await page.setViewportSize({width,height});
    const scene = await page.locator(".home-scene").evaluate(element => ({ ...element.getBoundingClientRect().toJSON(), position: getComputedStyle(element).backgroundPosition }));
    expect(scene.position).toBe(position);
    const expected = coverGeometry(scene.width, scene.height, 1448, 1086, position);
    await expect.poll(async () => {
      const actual = await canvas.evaluate(element => {
        const gl = element.getContext("webgl"), program = gl.getParameter(gl.CURRENT_PROGRAM);
        const get = name => gl.getUniform(program, gl.getUniformLocation(program, name));
        return { width: get("uContainer")[0], height: get("uContainer")[1], x: get("uOffset")[0], y: get("uOffset")[1], scale: get("uCoverScale") };
      });
      return Math.max(Math.abs(actual.width - expected.width), Math.abs(actual.height - expected.height), Math.abs(actual.x - expected.offsetX), Math.abs(actual.y - expected.offsetY), Math.abs(actual.scale - expected.scale));
    }).toBeLessThan(.001);
    await expect(canvas).toHaveCount(1);
  }
});

test("leaving while the artwork is loading cancels late renderer initialization", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => localStorage.setItem("px-home-music-muted", "true"));
  await setup(page, { guest: true });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("**/home-cinematic.webp", async route => { await gate; await route.continue(); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".home-cinematic-motion")).toHaveAttribute("data-state", "loading");
  await page.getByRole("link", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/SignIn$/);
  release();
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".home-cinematic-motion")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
});
