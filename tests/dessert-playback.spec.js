import { test, expect } from "@playwright/test";
import { setup, ID } from "./support/fixtures";
import {
  dessertStart,
  dessertRoot as root,
  dessertSetup,
  dessertAt,
  dessertBeat,
  DESSERT_TARGET,
} from "./support/dessert-flow";
import {
  dessertCheckpoint,
  dessertDraft,
} from "./support/dessert-checkpoints.mjs";
import { createDessertState, DESSERT_MEDIA } from "../src/data/dessertFlow.mjs";

test("native MP3 and original muted MP4 play together; the actual final frame holds while speech continues", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const state = createDessertState();
  state.cursor = 0;
  await setup(page, { seedRows: [dessertDraft(state, ID)] });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  const audio = root(page).locator("audio"),
    video = root(page).locator("video");
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(0.2);
  await expect
    .poll(() => video.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.2);
  await expect(video).toHaveJSProperty("muted", true);
  await expect(video).toHaveJSProperty("playbackRate", 1);
  await expect(video).toHaveJSProperty("loop", false);
  await expect(
    root(page).getByAltText("Final cinematic frame", { exact: true }),
  ).toBeVisible({ timeout: 10000 });
  await expect(
    root(page).getByAltText("Final cinematic frame", { exact: true }),
  ).toHaveAttribute("src", DESSERT_MEDIA.videos.V01.end);
  await expect(audio).toHaveJSProperty("paused", false);
  await expect(audio).toHaveAttribute(
    "data-dialogue-id",
    "CH01_SC01_002_NARRATOR",
  );
  await root(page).screenshot({
    path: "docs/dessert/screenshots/native-opening-playback.png",
  });
});

test("native pause, notebook and Previous scene preserve the same recording position, including after reload", async ({
  page,
}) => {
  test.setTimeout(60000);
  const state = dessertCheckpoint("decision");
  state.node = "n20";
  state.cursor = 0;
  state.ready = false;
  await setup(page, { seedRows: [dessertDraft(state, ID)] });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  const audio = root(page).locator("audio");
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(0.3);
  const id = await audio.getAttribute("data-dialogue-id");
  await root(page).getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await audio.evaluate((a) => a.currentTime);
  await page.waitForTimeout(250);
  expect(
    Math.abs((await audio.evaluate((a) => a.currentTime)) - paused),
  ).toBeLessThan(0.03);
  await root(page).getByRole("button", { name: "Resume", exact: true }).click();
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(paused + 0.1);
  await root(page)
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await expect(audio).toHaveJSProperty("paused", true);
  await page.getByLabel("Close notebook", { exact: true }).click();
  await expect(audio).toHaveAttribute("data-dialogue-id", id);
  await root(page)
    .getByRole("button", { name: "Previous scene", exact: true })
    .click();
  const reviewAt = await audio.evaluate((a) => a.currentTime);
  await expect(audio).toHaveJSProperty("paused", true);
  const dialog = page.getByRole("dialog", {
    name: "Previous scene review",
    exact: true,
  });
  await expect
    .poll(() => dialog.locator("audio").evaluate((a) => a.currentTime))
    .toBeGreaterThan(0.1);
  expect(
    Math.abs((await audio.evaluate((a) => a.currentTime)) - reviewAt),
  ).toBeLessThan(0.03);
  await dialog
    .getByRole("button", { name: "Return to current scene", exact: true })
    .click();
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(reviewAt + 0.1);
  await root(page).getByRole("button", { name: "Pause", exact: true }).click();
  const finalTime = await audio.evaluate((a) => a.currentTime);
  await page.reload();
  await dessertStart(page);
  await expect(audio).toHaveAttribute("data-dialogue-id", id);
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThanOrEqual(finalTime - 0.05);
});

test("a short completed line cannot cut off a required video and stale callbacks cannot skip the next recording", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await dessertAt(page, "ending", { choice: "A" });
  await page.evaluate(
    () =>
      (window.__voiceBefore =
        document.querySelector(".px-dessert-voice").dataset.dialogueId),
  );
  await root(page)
    .locator("audio")
    .evaluate((a) => a.dispatchEvent(new Event("ended")));
  await expect(root(page).locator("audio")).toHaveAttribute(
    "data-dialogue-id",
    "CH04_END_A_001_NARRATOR",
  );
  await root(page)
    .locator("video")
    .evaluate((v) => v.dispatchEvent(new Event("ended")));
  await expect(root(page).locator("audio")).toHaveAttribute(
    "data-dialogue-id",
    "CH04_END_A_004_MARIAM",
  );
  await expect(
    root(page).getByAltText("Final cinematic frame", { exact: true }),
  ).toBeVisible();
});

test("blocked audio offers Resume, mute and replay retain a single native player", async ({
  page,
}) => {
  await dessertSetup(page);
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let denied = false;
    HTMLMediaElement.prototype.play = function () {
      if (this.classList.contains("px-dessert-voice") && !denied) {
        denied = true;
        return Promise.reject(
          new DOMException("Browser permission", "NotAllowedError"),
        );
      }
      return play.call(this);
    };
  });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await expect(root(page).locator(".px-dessert-controls")).toContainText(
    "permit audio",
  );
  await root(page).getByRole("button", { name: "Resume", exact: true }).click();
  await root(page).getByRole("button", { name: "Mute", exact: true }).click();
  await root(page)
    .getByRole("button", { name: "Replay line", exact: true })
    .click();
  await expect(root(page).locator("audio")).toHaveCount(1);
  await expect(root(page).locator("audio")).toHaveJSProperty("muted", true);
});

test("captions-only reading is adjustable and pauses during explicit pause, notebook and hidden tab", async ({
  page,
}) => {
  await page.clock.install();
  await dessertSetup(page);
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  const skip = root(page).getByRole("button", {name:"Skip clip",exact:true});
  if (await skip.count()) await skip.click();
  await root(page)
    .getByRole("button", { name: "Captions only", exact: true })
    .click();
  await root(page)
    .getByLabel("Reading pace", { exact: true })
    .selectOption("1.5");
  const original = await root(page)
    .locator(".px-dessert-dialogue")
    .getAttribute("data-dialogue-id");
  await root(page).getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(60000);
  await expect(root(page).locator(".px-dessert-dialogue")).toHaveAttribute(
    "data-dialogue-id",
    original,
  );
  await root(page).getByRole("button", { name: "Resume", exact: true }).click();
  await root(page)
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await page.clock.runFor(60000);
  await expect(root(page).locator(".px-dessert-dialogue")).toHaveAttribute(
    "data-dialogue-id",
    original,
  );
  await page.getByLabel("Close notebook", { exact: true }).click();
  await page.clock.runFor(20000);
  await expect(root(page).locator(".px-dessert-dialogue")).not.toHaveAttribute(
    "data-dialogue-id",
    original,
  );
});

test("missing artwork and audio retain a usable readable fallback with no unrelated image substitution", async ({
  page,
}) => {
  await setup(page, { empty: true });
  await page.route(
    "**/images/scenarios/ionic_dessert_mystery/cinematic/IMAGE_01*",
    (r) => r.abort(),
  );
  await page.route(
    "**/audio/scenarios/ionic_dessert_mystery/cinematic/**",
    (r) => r.fulfill({ status: 404, body: "" }),
  );
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await expect(root(page).locator(".px-dessert-controls")).toContainText(
    /unavailable|captions/,
  );
  await expect(root(page).locator(".px-dessert-art-unavailable")).toBeVisible();
  await expect(root(page).locator(".px-dessert-scene-image")).toHaveCount(0);
  await expect(root(page).locator(".px-dessert-dialogue")).toContainText(
    "Only twelve minutes remain",
  );
});

test("story artwork and read-only review remain clear without a bottom blur mask", async ({
  page,
}) => {
  const state = createDessertState();
  state.node = "n03";
  state.cursor = 0;
  await dessertSetup(page, { seedRows: [dessertDraft(state, ID)] });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await expect(root(page).locator(".px-dessert-label-focus")).toHaveCount(0);
  await expect(root(page).locator(".px-dessert-art")).toHaveCSS("filter", "none");
  await root(page).screenshot({
    path: "docs/dessert/screenshots/three-powders-label-treatment.png",
  });
  await dessertBeat(page);
  await expect(root(page)).toHaveAttribute("data-node", "n04");
  await expect(root(page).locator(".px-dessert-stage")).toHaveAttribute(
    "data-video-id",
    "V02",
  );
  await root(page)
    .getByRole("button", { name: "Previous scene", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Previous scene review",
    exact: true,
  });
  await expect(
    dialog.locator(".px-scene-review-foreground-mask"),
  ).toHaveCount(0);
});

test("student preview query cannot bypass a teacher lock and old assessed attempts remain read-only", async ({
  page,
}) => {
  const data = await setup(page, {
    empty: true,
    settingsRows: [{ scenario_id: "ionic_dessert_mystery", is_locked: true }],
  });
  await page.goto(DESSERT_TARGET + "&preview=true");
  await expect(
    page.getByRole("heading", { name: "Mission unavailable", exact: true }),
  ).toBeVisible();
  expect(data.writes).toHaveLength(0);
});

test("navigation releases the mission recording source", async ({ page }) => {
  await dessertSetup(page);
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await root(page)
    .locator("audio")
    .evaluate((a) => (window.__departedDessertAudio = a));
  await page
    .getByRole("link", { name: "Perspective X — Home", exact: true })
    .first()
    .click();
  await expect(root(page)).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      window.__departedDessertAudio.getAttribute("src"),
    ),
  ).toBeNull();
});

test("previously assessed Dessert attempts remain readable without launching a new story or changing results", async ({
  page,
}) => {
  const old = {
    id: "legacy-dessert-result",
    student_id: ID,
    scenario_id: "ionic_dessert_mystery",
    score: 80,
    completed_at: "2026-10-20T10:00:00Z",
    answers: {
      investigation: {
        evidence: [
          { id: "B-pH", label: "Sample B · pH", observation: "pH 8.3" },
        ],
      },
      scene2: {
        selectedOption: "A",
        consequence: "verify-replace",
        justification:
          "Preserve the supported evidence and use traceable replacements.",
      },
      exitTicket: { score: 80, passed: true, mcq_answers: [] },
      meta: { recordType: "mission_attempt" },
    },
  };
  const data = await setup(page, { seedRows: [old] });
  await page.goto(DESSERT_TARGET + "&review=legacy-dessert-result");
  await expect(
    page.getByText("Reviewing a preserved attempt. Responses are read-only.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start Experience", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("dialog")).toContainText("pH 8.3");
  await page.getByLabel("Close notebook", { exact: true }).click();
  await page
    .getByRole("button", { name: "Review saved notebook", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("pH 8.3");
  expect(data.writes).toHaveLength(0);
  expect(data.progressRows).toEqual([old]);
});

test("slow recording loading never advances the story or awards evidence and can be paused before playback", async ({
  page,
}) => {
  await setup(page, { empty: true });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(
    "**/audio/scenarios/ionic_dessert_mystery/cinematic/NARRATOR/CH01_SC01_002_NARRATOR.mp3",
    async (route) => {
      await gate;
      await route.continue();
    },
  );
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  const audio = root(page).locator("audio");
  await expect(audio).toHaveAttribute(
    "data-dialogue-id",
    "CH01_SC01_002_NARRATOR",
  );
  await page.waitForTimeout(800);
  await expect(root(page)).toHaveAttribute("data-node", "n01");
  await expect(
    root(page).getByText("Scientific evidence · 0 observations", {
      exact: true,
    }),
  ).toBeVisible();
  await root(page).getByRole("button", { name: "Pause", exact: true }).click();
  release();
  await expect(audio).toHaveJSProperty("paused", true);
  await root(page).getByRole("button", { name: "Resume", exact: true }).click();
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(0.1);
  await expect(audio).toHaveAttribute(
    "data-dialogue-id",
    "CH01_SC01_002_NARRATOR",
  );
});
