import { test, expect } from "@playwright/test";
import { setup, noOverflow } from "./support/fixtures";
import fs from "node:fs/promises";

const sections = ["Overview", "Students", "Missions", "Feedback", "Analytics", "Class Debate"];
test("teacher tasks have one navigation with focused panels, keyboard support and reporting", async ({ page }) => {
  await setup(page, { teacher: true });
  await page.goto("/TeacherDashboard");
  const navigation = page.getByRole("tablist", { name: "Teacher sections" });
  await expect(navigation.getByRole("tab")).toHaveCount(6);
  await expect(page.getByRole("tab", { selected: true })).toHaveText("Overview");
  await expect(page.getByRole("button", {name:"Mission controls",exact:true})).toHaveCount(0);
  await expect(page.locator(".px-teacher-tools summary")).toHaveCount(0);
  for (const section of sections) {
    await page.getByRole("tab", {name:section,exact:true}).click();
    const panel = page.getByRole("tabpanel", {name:section,exact:true});
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", {name:section,exact:true}).first()).toBeVisible();
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
    await noOverflow(page);
  }
  await page.getByRole("tab", {name:"Overview",exact:true}).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", {name:"Students",exact:true})).toBeFocused();
  await expect(page.getByRole("tab", {selected:true})).toHaveText("Students");
  const download = page.waitForEvent("download");
  await page.getByRole("button", {name:"Export CSV",exact:true}).click();
  expect((await download).suggestedFilename()).toMatch(/\.csv$/);
});

test("mission search and access filters retain the original teaching controls", async ({page}) => {
  const state = await setup(page, {teacher:true, settingsRows:[{scenario_id:"acid_rain",is_locked:true}]});
  await page.goto("/TeacherDashboard");
  await page.getByRole("tab", {name:"Missions",exact:true}).click();
  await page.getByLabel("Find a mission", {exact:true}).fill("Invisible");
  await expect(page.getByRole("heading", {name:"The Invisible Threat",exact:true})).toBeVisible();
  await expect(page.getByRole("heading", {name:"Acid Rain Alert",exact:true})).toHaveCount(0);
  await page.getByLabel("Find a mission", {exact:true}).fill("");
  await page.getByLabel("Mission access", {exact:true}).selectOption("locked");
  await expect(page.getByRole("heading", {name:"Acid Rain Alert",exact:true})).toBeVisible();
  await expect(page.getByRole("heading", {name:"The Invisible Threat",exact:true})).toHaveCount(0);
  await page.getByRole("button", {name:"Teaching guide",exact:true}).click();
  await expect(page.getByRole("button", {name:"Hide teaching guide",exact:true})).toBeVisible();
  await expect(page.getByRole("button", {name:"Preview mission",exact:true})).toBeVisible();
  await page.getByLabel("Find a mission", {exact:true}).fill("no-such-mission");
  await expect(page.getByText("No missions match your filters.")).toBeVisible();
  expect(state.writes).toEqual([]);
});

for (const width of [1440, 768, 390]) {
  test(`teacher workspace remains clear and usable at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:1000});
    await setup(page, {teacher:true});
    await page.goto("/TeacherDashboard");
    await fs.mkdir("test-results/teacher-workspace",{recursive:true});
    await expect(page.getByRole("tab",{name:"Overview",exact:true})).toBeVisible();
    await noOverflow(page);
    await page.screenshot({path:`test-results/teacher-workspace/overview-${width}.png`,fullPage:true});
    for (const section of ["Missions", "Students", "Feedback", "Analytics", "Class Debate"]) {
      await page.getByRole("tab",{name:section,exact:true}).click();
      await expect(page.getByRole("tabpanel",{name:section,exact:true})).toBeVisible();
      await noOverflow(page);
    }
  });
}
