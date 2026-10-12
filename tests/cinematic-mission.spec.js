import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { setup, ID, noOverflow } from "./support/fixtures";
import { reachCheckpoint, openMission } from "./support/ionicCinema";
import {
  DESSERT_PHOTOGRAPHS,
  ionicDessertTimeline,
} from "../src/data/cinematicMissions/ionicDessertTimeline.mjs";
import { POWDER_READINGS } from "../src/data/ionicScience.mjs";
import { IONIC_SCENARIOS } from "../src/data/ionicMissions.mjs";
const D = "ionic_dessert_mystery";
const screenshotDir = "docs/ionic-cinematic/screenshots";
function completeInvestigation() {
  return {
    calibrated: true,
    electron: { kind: "NaCl", transferred: 1 },
    identities: { A: "sugar", B: "hydrogen-carbonate", C: "sodium-chloride" },
    submitted: true,
    evidence: [
      {
        id: "control",
        label: "Water-only control",
        observation: "2 μS/cm background reading",
      },
      ...Object.entries(POWDER_READINGS).flatMap(([sample, r]) => [
        {
          id: `${sample}-conductivity`,
          label: `Sample ${sample} · conductivity`,
          observation: `${r.conductivity} μS/cm`,
        },
        {
          id: `${sample}-pH`,
          label: `Sample ${sample} · pH`,
          observation: `pH ${r.pH}`,
        },
        {
          id: `${sample}-fizz`,
          label: `Sample ${sample} · fizz`,
          observation: r.fizz,
        },
      ]),
    ],
  };
}
const decisionDraft = () => ({
  id: "preserved-draft",
  student_id: ID,
  scenario_id: D,
  score: null,
  completed_at: "2026-10-12T06:00:00Z",
  answers: {
    investigation: completeInvestigation(),
    scene1: { selectedOption: "A" },
    cinematic: {
      version: 1,
      sceneId: "decision",
      interaction: "decision",
      completedCheckpoints: ["conductivity", "electron", "clues"],
    },
    meta: {
      recordType: "mission_attempt",
      lastPhase: "scene2",
      updatedAt: "2026-10-12T06:00:00Z",
    },
  },
});
async function speechMock(page) {
  await page.addInitScript(() => {
    const tracker = { calls: [], cancels: 0, active: null, overlaps: 0 };
    window.__cinemaSpeech = tracker;
    const voices = ["Daniel", "Samantha", "Alex", "Susan", "George"].map(
      (name) => ({ name, lang: "en-GB", voiceURI: name }),
    );
    const synthesis = {
      getVoices: () => voices,
      addEventListener() {},
      removeEventListener() {},
      cancel() {
        tracker.cancels++;
        tracker.active = null;
      },
      speak(line) {
        if (tracker.active) tracker.overlaps++;
        tracker.active = line;
        tracker.calls.push({
          text: line.text,
          voice: line.voice.name,
          volume: line.volume,
        });
      },
    };
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: synthesis,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: class {
        constructor(text) {
          this.text = text;
        }
      },
    });
    tracker.finish = () => {
      const line = tracker.active;
      tracker.active = null;
      line?.onend?.();
    };
  });
}
test("all sixteen approved scene URLs resolve as WebP and opening photographs follow the authoritative order with incremental preloading", async ({
  page,
  request,
}) => {
  for (const file of DESSERT_PHOTOGRAPHS) {
    const response = await request.get(
      `/images/scenarios/${D}/cinematic/${file}`,
    );
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/webp");
  }
  const requests = [];
  page.on("request", (r) => {
    if (r.url().includes("/cinematic/") && r.url().includes(".webp"))
      requests.push(r.url());
  });
  await setup(page, { empty: true });
  await page.goto(`/ScenarioPlayer?scenario=${D}`);
  await expect(page.locator(".cm-player")).toBeVisible();
  await page
    .getByRole("button", { name: "Start cinematic mission", exact: true })
    .click();
  await page
    .locator(".cm-player")
    .evaluate((el) => (el.dataset.instanceProof = "persistent-stage"));
  for (let i = 0; i < 8; i++) {
    await expect(page.locator(".cm-shot img")).toHaveAttribute(
      "src",
      `/images/scenarios/${D}/cinematic/${DESSERT_PHOTOGRAPHS[i]}`,
    );
    await page
      .getByRole("button", { name: "Continue story", exact: true })
      .click();
  }
  await expect(page.locator(".cm-player")).toHaveAttribute(
    "data-checkpoint",
    "conductivity",
  );
  await expect(
    page.getByRole("button", { name: "Continue investigation", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".cm-player")).toHaveAttribute(
    "data-instance-proof",
    "persistent-stage",
  );
  expect(requests.some((url) => /13_|14_|15_|16_/.test(url))).toBe(false);
  await expect(
    page.getByRole("button", { name: "Continue story", exact: true }),
  ).toHaveCount(0);
});
test("available device speech gates long sentences, cancels on pause and exit, and keeps one consistent voice without overlap", async ({
  page,
}) => {
  await speechMock(page);
  await page.clock.install();
  await setup(page, { empty: true });
  await page.goto(`/ScenarioPlayer?scenario=${D}`);
  await page
    .getByRole("button", { name: "Start cinematic mission", exact: true })
    .click();
  await page.clock.runFor(3000);
  await expect(page.locator(".cm-captions")).toContainText(
    "Abu Dhabi. One competition. Twelve minutes left on the clock.",
  );
  await page.clock.runFor(7000);
  await expect(page.locator(".cm-player")).toHaveAttribute(
    "data-scene",
    "park",
  );
  await page.getByRole("button", { name: "Pause story", exact: true }).click();
  expect(await page.evaluate(() => window.__cinemaSpeech.active)).toBeNull();
  const count = await page.evaluate(() => window.__cinemaSpeech.calls.length);
  await page.clock.runFor(5000);
  expect(await page.evaluate(() => window.__cinemaSpeech.calls.length)).toBe(
    count,
  );
  await page
    .getByRole("button", { name: "Resume story", exact: true })
    .first()
    .click();
  await page.clock.runFor(200);
  const voices = await page.evaluate(() =>
    window.__cinemaSpeech.calls.map((c) => c.voice),
  );
  expect(new Set(voices).size).toBe(1);
  await page.evaluate(() => window.__cinemaSpeech.finish());
  await page.clock.runFor(300);
  await expect(page.locator(".cm-player")).toHaveAttribute(
    "data-scene",
    "finalists",
  );
  await page.getByRole("link", { name: "Exit mission", exact: true }).click();
  expect(await page.evaluate(() => window.__cinemaSpeech.active)).toBeNull();
  expect(await page.evaluate(() => window.__cinemaSpeech.overlaps)).toBe(0);
});
test("missing browser voices preserve readable captions even when the caption preference is off; mute survives reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: undefined,
      configurable: true,
    });
  });
  await page.clock.install();
  await setup(page, { empty: true });
  await page.goto(`/ScenarioPlayer?scenario=${D}`);
  await page
    .getByRole("button", { name: "Start cinematic mission", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Toggle captions", exact: true })
    .click();
  await page.clock.runFor(2500);
  await expect(page.locator(".cm-captions")).toContainText("Abu Dhabi.");
  await page.clock.runFor(9000);
  await expect(page.locator(".cm-player")).toHaveAttribute(
    "data-scene",
    "finalists",
  );
  await page.getByRole("button", { name: "Mute mission", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unmute mission", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("hidden tab pauses narration and freezes the clock until an explicit resume", async ({
  page,
}) => {
  await speechMock(page);
  await page.clock.install();
  await setup(page, { empty: true });
  await page.goto(`/ScenarioPlayer?scenario=${D}`);
  await page
    .getByRole("button", { name: "Start cinematic mission", exact: true })
    .click();
  await page.clock.runFor(2500);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Resume story", exact: true }).first(),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__cinemaSpeech.active)).toBeNull();
  await page.clock.runFor(20000);
  await expect(page.locator(".cm-player")).toHaveAttribute(
    "data-scene",
    "park",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".cm-player")).toHaveAttribute(
    "data-playing",
    "false",
  );
});
for (const [choice, key, photo] of [
  ["A", "verify-replace", 13],
  ["B", "conductivity-only", 14],
  ["C", "taste", 15],
  ["D", "appearance", 16],
]) {
  test(`decision ${choice} plays only its approved ending ${photo}, retains a partial justification, and keeps the same stage`, async ({
    page,
  }) => {
    const state = await setup(page, { seedRows: [decisionDraft()] });
    await page.goto(`/ScenarioPlayer?scenario=${D}`);
    await expect(page.locator(".cm-player")).toHaveAttribute(
      "data-checkpoint",
      "decision",
    );
    await page
      .locator(".cm-player")
      .evaluate((el) => (el.dataset.instanceProof = "persistent-stage"));
    await page.getByRole("radio").nth("ABCD".indexOf(choice)).check();
    await page.locator(".im-citations input").nth(0).check();
    await page.locator(".im-citations input").nth(1).check();
    const reason =
      "Independent observations support my recommendation. I will retain the data and verify the remaining uncertainty before using any ingredient.";
    await page.getByLabel("Your evidence-based justification").fill(reason);
    await page
      .getByRole("button", { name: "Mission Notebook", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save notebook now", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText(
      "Notebook and responses saved",
    );
    await page.getByLabel("Close notebook").click();
    await page.reload();
    await expect(
      page.getByLabel("Your evidence-based justification"),
    ).toHaveValue(reason);
    await page
      .locator(".cm-player")
      .evaluate((el) => (el.dataset.instanceProof = "persistent-stage"));
    await page.getByRole("button", { name: "Commit my decision" }).click();
    await expect(page.locator(".cm-player")).toHaveAttribute("data-scene", key);
    await expect(page.locator(".cm-shot img")).toHaveAttribute(
      "src",
      `/images/scenarios/${D}/cinematic/${DESSERT_PHOTOGRAPHS[photo - 1]}`,
    );
    expect(
      await page.locator(".cm-player").getAttribute("data-instance-proof"),
    ).toBe("persistent-stage");
    mkdirSync(screenshotDir, { recursive: true });
    await page.locator(".cm-shot img").evaluate((img) => img.decode());
    await page.screenshot({
      animations: "disabled",
      path: `${screenshotDir}/ending-${choice}.png`,
    });
    // Decision confirmation is a permitted gesture and resumes the selected story.
    await expect(page.locator(".cm-player")).toHaveAttribute(
      "data-playing",
      "true",
    );
    await reachCheckpoint(page, "reflection");
    await expect(page.locator(".cm-outcome-feedback")).toContainText(
      IONIC_SCENARIOS[D].scenes[2].consequences[key].outcome,
    );
    await expect(
      page.getByRole("button", { name: "Continue to Prove Your Expertise" }),
    ).toBeDisabled();
    const original = state.progressRows.find((r) => r.id === "preserved-draft");
    expect(original.answers.scene2).toBeUndefined();
  });
}
test("motion and premium blur freeze at the science overlay; reduced motion stays still and mobile keeps controls reachable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await setup(page, { empty: true });
  await page.goto(`/ScenarioPlayer?scenario=${D}`);
  await page
    .getByRole("button", { name: "Start cinematic mission", exact: true })
    .click();
  const before = await page
    .locator(".cm-shot")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(400);
  const after = await page
    .locator(".cm-shot")
    .evaluate((el) => getComputedStyle(el).transform);
  expect(after).not.toBe(before);
  await reachCheckpoint(page, "conductivity");
  await expect(page.locator(".cm-environment")).toHaveClass(/is-frozen/);
  await expect
    .poll(() =>
      page
        .locator(".cm-environment")
        .evaluate((el) => getComputedStyle(el).filter),
    )
    .toContain("blur(8px)");
  expect(
    await page
      .locator(".cm-interaction")
      .evaluate((el) => getComputedStyle(el).filter),
  ).toBe("none");
  expect(
    await page
      .locator(".cm-shot")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".cm-shot")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await expect(
    page.getByRole("button", { name: "Mission Notebook", exact: true }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Continue investigation", exact: true }),
  ).toBeDisabled();
  const scroll = await page.locator(".cm-interaction").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    return {
      scroll: el.scrollTop,
      body: document.documentElement.scrollHeight,
      viewport: innerHeight,
    };
  });
  expect(scroll.scroll).toBeGreaterThan(0);
  expect(scroll.body).toBeLessThanOrEqual(scroll.viewport + 1);
});
test("submitted hypotheses stay concealed and revision saves each original mapping and confidence", async ({
  page,
}) => {
  const row = decisionDraft();
  delete row.answers.scene1;
  row.answers.investigation.submitted = false;
  row.answers.cinematic = {
    sceneId: "second-test",
    interaction: "clues",
    completedCheckpoints: ["conductivity", "electron"],
  };
  row.answers.meta.lastPhase = "scene1";
  const state = await setup(page, { seedRows: [row] });
  await page.goto(`/ScenarioPlayer?scenario=${D}`);
  await page
    .getByLabel("Proposed identity for Sample B")
    .selectOption("sodium-chloride");
  await page.getByLabel("Your hypothesis confidence").selectOption("uncertain");
  await page
    .getByRole("button", { name: "Submit identification", exact: true })
    .click();
  await expect(page.getByText(/In this candidate set, A is sugar/)).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Revisit my hypothesis", exact: true })
    .click();
  await page
    .getByLabel("Proposed identity for Sample B")
    .selectOption("hydrogen-carbonate");
  await page.getByLabel("Your hypothesis confidence").selectOption("confident");
  await page
    .getByRole("button", { name: "Submit identification", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save notebook now", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Notebook and responses saved",
  );
  const saved = state.progressRows.find(
    (r) =>
      r.id !== "preserved-draft" &&
      r.answers.investigation?.hypothesisHistory?.length === 2,
  );
  expect(saved).toBeTruthy();
  expect(
    saved.answers.investigation.hypothesisHistory.map((h) => [
      h.identities.B,
      h.confidence,
    ]),
  ).toEqual([
    ["sodium-chloride", "uncertain"],
    ["hydrogen-carbonate", "confident"],
  ]);
  expect(saved.answers.scene2).toBeUndefined();
});
test("the original homepage track is stopped and reset before cinematic mission speech begins", async ({
  page,
}) => {
  const { observe, control, audioState } = await import(
    "./support/homepageAudio"
  );
  await speechMock(page);
  await observe(page);
  await page.goto("/");
  await expect(control(page)).toBeVisible();
  if ((await audioState(page)).paused) await control(page).click();
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    history.pushState({}, "", "/ScenarioPlayer?scenario=ionic_dessert_mystery");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.locator(".cm-player")).toBeVisible();
  const before = await audioState(page);
  expect(before.paused).toBe(true);
  expect(before.time).toBe(0);
  expect(before.src).toBe(null);
  await page
    .getByRole("button", { name: "Start cinematic mission", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.__cinemaSpeech.calls.length))
    .toBeGreaterThan(0);
  expect((await audioState(page)).paused).toBe(true);
  expect((await audioState(page)).src).toBe(null);
});
test("an existing homepage in another tab keeps exclusive audio; the mission uses captions until audio is released", async ({
  page,
  context,
}) => {
  const { observe, control, audioState } = await import(
    "./support/homepageAudio"
  );
  await observe(page);
  await page.goto("/");
  await expect(control(page)).toBeVisible();
  if ((await audioState(page)).paused) await control(page).click();
  await expect(control(page)).toHaveAttribute("aria-pressed", "true");
  const mission = await context.newPage();
  await speechMock(mission);
  await setup(mission, { empty: true });
  await mission.goto(`/ScenarioPlayer?scenario=${D}`);
  await mission
    .getByRole("button", { name: "Start cinematic mission", exact: true })
    .click();
  await expect(mission.locator(".cm-status")).toContainText(
    "Another tab owns audio",
  );
  await expect(mission.locator(".cm-captions")).toContainText("Abu Dhabi.");
  expect(await mission.evaluate(() => window.__cinemaSpeech.calls.length)).toBe(
    0,
  );
  expect((await audioState(page)).paused).toBe(false);
  await control(page).click();
  await mission
    .getByRole("button", { name: "Mute mission", exact: true })
    .click();
  await mission
    .getByRole("button", { name: "Unmute mission", exact: true })
    .click();
  await expect
    .poll(() => mission.evaluate(() => window.__cinemaSpeech.calls.length))
    .toBeGreaterThan(0);
  expect((await audioState(page)).paused).toBe(true);
  await mission.close();
});
test("a missing photograph has an explicit existing-artwork fallback and cannot block investigation", async ({
  page,
}) => {
  await page.route(`**/cinematic/01_park_establishing.webp`, (r) =>
    r.fulfill({ status: 404, body: "Missing test image" }),
  );
  await setup(page, { empty: true });
  await page.goto(`/ScenarioPlayer?scenario=${D}`);
  await expect(page.locator(".cm-shot img")).toHaveAttribute(
    "src",
    IONIC_SCENARIOS[D].artwork,
  );
  await expect(
    page.getByText(/This scene photograph is unavailable/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start cinematic mission", exact: true })
    .click();
  await reachCheckpoint(page, "conductivity");
  await expect(
    page.getByRole("button", {
      name: "Calibrate with water-only control",
      exact: true,
    }),
  ).toBeVisible();
});
