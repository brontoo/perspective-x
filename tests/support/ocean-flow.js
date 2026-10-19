import { expect } from "@playwright/test";

// Read-only story mode exercises every caption without waiting for recordings.
export async function oceanTask(page, step) {
  for (let count = 0; count < 80; count++) {
    const next = page.getByRole("button", {
      name: "Next dialogue →",
      exact: true,
    });
    const viewport = page.locator(".od-viewport");
    if (
      (!step || (await viewport.getAttribute("data-story-step")) === step) &&
      (await page.locator(".od-workspace:visible").count()) &&
      !(await next.count())
    )
      return;
    await expect(next).toBeVisible();
    await next.click();
  }
  throw new Error(`Story did not reach task ${step}`);
}
export async function oceanBriefing(page) {
  await expect(page.locator(".od-viewport")).toBeVisible();
  await expect(page.locator(".od-art")).toHaveAttribute("src", /01_aquarium/);
  for (let count = 0; count < 30; count++) {
    const accept = page.getByRole("button", {
      name: "Accept assignment →",
      exact: true,
    });
    if (await accept.count()) {
      await accept.click();
      return;
    }
    await page
      .getByRole("button", { name: "Next dialogue →", exact: true })
      .click();
  }
  throw new Error("Assignment did not become available");
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
