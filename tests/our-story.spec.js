import { test, expect } from "@playwright/test";
import { setup } from "./support/fixtures";
import fs from "node:fs/promises";

for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
  test(`Our Story is readable, scrollable and restores the homepage at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await setup(page, { guest: true });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Our Story", exact: true });
    await expect(page.getByRole("button", { name: "Enter Portal", exact: true })).toBeEnabled();
    await page.evaluate(() => document.fonts.ready);
    const before = await page.screenshot();
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Real science. Meaningful choices." });
    await expect(dialog).toBeVisible();
    await expect(dialog).toBeFocused();
    expect(await dialog.evaluate(element => element.scrollTop)).toBe(0);
    await expect(dialog.locator(".home-story-copy")).toHaveText("Perspective X invites learners to explore immersive scientific roles, tackle real-world challenges, and shape a more sustainable future for the UAE and beyond.");
    await expect(dialog.locator(".home-story-credit")).toHaveText("Um Al Emarat School · Riham Saleh — Portal Creator");
    await expect(dialog.getByRole("listitem")).toHaveCount(4);
    for (const label of ["Choose a Role", "Enter a Mission", "Make a Decision", "See Your Impact"]) {
      await expect(dialog.getByRole("listitem").filter({ hasText: label })).toHaveCount(1);
    }
    // The Close control is reachable even when mobile content needs internal scrolling.
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Tab");
    // Native dialogs may yield one Tab to browser chrome; background controls stay inert.
    expect(await page.locator(".home-nav").evaluate(element => element.contains(document.activeElement))).toBe(false);
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await dialog.evaluate(element => { element.scrollTop = 0; });
    const bounds = await dialog.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(height);
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
    await fs.mkdir("test-results/our-story", { recursive: true });
    await page.screenshot({ path: `test-results/our-story/story-${width}x${height}.png` });
    if (width <= 800) {
      await dialog.evaluate(element => { element.scrollTop = element.scrollHeight; });
      await page.screenshot({ path: `test-results/our-story/story-${width}x${height}-bottom.png` });
    }
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.evaluate(element => element.blur());
    expect(await page.screenshot()).toEqual(before);
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
}
