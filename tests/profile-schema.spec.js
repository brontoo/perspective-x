import { test, expect } from "@playwright/test";
import { setup } from "./support/fixtures";

test("existing profiles without avatar_path can navigate and remove preset pictures", async ({ page }) => {
  const state = await setup(page, { missingAvatarColumn: true });
  const failedProfileReads = [];
  page.on("response", response => {
    if (response.url().includes("/rest/v1/profiles") && response.status() >= 400)
      failedProfileReads.push(response.status());
  });
  for (const route of ["/", "/Dashboard", "/Roles", "/RoleHub?role=environmental_scientist", "/LearningPath", "/LeaderboardPage", "/ProfileSettings"]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText("We couldn’t load this page")).toHaveCount(0);
    await expect(page.getByText("column profiles.avatar_path does not exist")).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Remove picture", exact: true }).click();
  await expect(page.getByText("Using your initials.")).toBeVisible();
  expect(state.writes.some(w => w.type === "metadata" && w.body.data.px_avatar_id === null)).toBe(true);
  expect(state.writes.some(w => w.type === "profiles" && Object.hasOwn(w.body, "avatar_path"))).toBe(false);
  expect(failedProfileReads).toEqual([]);
});

test("sign-in routes from the stored role when avatar_path is absent", async ({ page }) => {
  await setup(page, { guest: true, teacher: true, missingAvatarColumn: true });
  await page.goto("/SignIn");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("fixture-student@example.invalid");
  await page.locator('input[autocomplete="current-password"]').fill("valid-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/TeacherDashboard");
  await expect(page.getByRole("heading", { name: /Test Teacher/ })).toBeVisible();
});

test("missing photo column blocks uploads before writing storage and keeps presets usable", async ({ page }) => {
  const state = await setup(page, { missingAvatarColumn: true });
  const storageRequests = [];
  await page.route("**/storage/v1/**", route => {
    storageRequests.push(route.request().url());
    return route.fulfill({ contentType:"application/json", body:JSON.stringify({id:"avatars",public:false}) });
  });
  await page.goto("/ProfileSettings");
  const photo = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 4;
    canvas.getContext("2d").fillRect(0,0,4,4);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.locator("input[type=file]").setInputFiles({name:"test.png",mimeType:"image/png",buffer:Buffer.from(photo,"base64")});
  await page.getByRole("button", {name:"Save picture",exact:true}).click();
  await expect(page.getByRole("alert")).toContainText("Photo uploads are not configured");
  expect(storageRequests).toEqual([]);
  expect(state.writes).toEqual([]);
  await page.getByRole("button", {name:"Choose an avatar", exact:true}).click();
  await page.getByRole("button", {name:"Choose golden beanie avatar"}).click();
  await page.getByRole("button", {name:"Save picture",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("saved");
});
