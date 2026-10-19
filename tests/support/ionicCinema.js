import { expect } from "@playwright/test";
const D = "ionic_dessert_mystery";
export async function reachCheckpoint(page, target) {
  for (let i = 0; i < 20; i++) {
    if (
      (await page.locator(".cm-player").getAttribute("data-checkpoint")) ===
      target
    )
      return;
    const checkpoint = await page
      .locator(".cm-player")
      .getAttribute("data-checkpoint");
    expect(
      checkpoint,
      "Narrative skipping must never bypass a scientific gate",
    ).toBe("");
    await page
      .getByRole("button", { name: "Continue story", exact: true })
      .click();
  }
  throw new Error(`Did not reach ${target}`);
}
export async function startStory(page, id) {
  await expect(page.locator(".cm-player")).toBeVisible();
  await expect(page.locator(".cm-chapters li")).toHaveCount(5);
  await expect(page.locator(".cm-player video")).toHaveCount(0);
  await page
    .getByRole("button", {
      name: /Start cinematic mission|Resume cinematic mission/,
    })
    .click();
  await reachCheckpoint(page, id === D ? "conductivity" : "mineral");
}
export async function openMission(page, id) {
  await page.goto(`/ScenarioPlayer?scenario=${id}`);
  await startStory(page, id);
}
export async function dessertInvestigation(page) {
  await page
    .getByRole("button", { name: "Calibrate with water-only control" })
    .click();
  for (const s of ["A", "B", "C"]) {
    await page
      .getByRole("button", { name: `Sample ${s}`, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Measure conductivity", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Continue investigation", exact: true })
    .click();
  await reachCheckpoint(page, "electron");
  await page.getByRole("button", { name: "Transfer one electron" }).click();
  await page
    .getByRole("button", { name: "Continue investigation", exact: true })
    .click();
  await reachCheckpoint(page, "clues");
  for (const s of ["A", "B", "C"]) {
    await page
      .getByRole("button", { name: `Sample ${s}`, exact: true })
      .click();
    for (const name of ["Measure pH", "Run isolated acid test"])
      await page.getByRole("button", { name, exact: true }).click();
  }
  for (const [s, v] of [
    ["A", "sugar"],
    ["B", "hydrogen-carbonate"],
    ["C", "sodium-chloride"],
  ])
    await page.getByLabel(`Proposed identity for Sample ${s}`).selectOption(v);
  await page
    .getByRole("button", { name: "Submit identification", exact: true })
    .click();
  await expect(
    page.getByText("Your identification is supported.", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText(/In this candidate set, A is sugar/)).toHaveCount(
    0,
  );
  await expect(
    page.getByText("Hypothesis recorded — keep the evidence in view."),
  ).toBeVisible();
}
