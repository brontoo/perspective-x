import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { setup, ID, noOverflow } from "./support/fixtures";
import {
  installOceanPlayback,
  finishCaption,
  startOcean,
  oceanTask,
  oceanBriefing,
  oceanAssessmentReady,
} from "./support/ocean-flow";
import { IONIC_SCENARIOS } from "../src/data/ionicMissions.mjs";
import { OCEAN_DIALOGUE } from "../src/data/oceanDome.mjs";
const A = "ionic_aquarium_mystery",
  D = "ionic_dessert_mystery";
const target = `/ScenarioPlayer?scenario=${A}`;
const shots = "docs/ocean-dome/screenshots";
const prior = {
  id: "prior-pass",
  student_id: ID,
  scenario_id: D,
  score: 80,
  completed_at: "2026-10-10T10:00:00Z",
  answers: { exitTicket: { score: 80, passed: true } },
};
const evidence = ["calcium", "solubility", "carbonate", "fingerprint"].map(
  (id) => ({
    id,
    label: `${id} test`,
    observation: `Collected ${id} evidence`,
    collectedAt: "2026-10-19T10:00:00Z",
  }),
);
const investigation = {
  evidence,
  formula: {
    cation: "Ca",
    anion: "CO3",
    positives: 1,
    negatives: 1,
    checked: true,
  },
  crystal: { model: "calcite", yaw: 120, pitch: 18, explored: true },
  water: { pH: 8.7, calcium: 610, alkalinity: 5.8, tested: true },
  mineral: "",
};
async function seed(page, answers = null) {
  return setup(page, {
    seedRows: [
      prior,
      ...(answers
        ? [
            {
              id: "ocean-draft",
              student_id: ID,
              scenario_id: A,
              score: null,
              completed_at: null,
              answers: {
                ...answers,
                meta: {
                  recordType: "mission_attempt",
                  updatedAt: "2026-10-01T10:00:00Z",
                },
              },
            },
          ]
        : []),
    ],
  });
}
async function snap(page, name) {
  mkdirSync(shots, { recursive: true });
  await page.locator(".od-novel").screenshot({ path: `${shots}/${name}.png` });
}
async function legible(locator) {
  const ratio = await locator.evaluate((element) => {
    const rgb = (value) =>
      value
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
    let parent = element,
      background;
    while (parent) {
      const colour = getComputedStyle(parent).backgroundColor;
      if (colour !== "transparent" && colour !== "rgba(0, 0, 0, 0)") {
        background = rgb(colour);
        break;
      }
      parent = parent.parentElement;
    }
    const luminance = (values) =>
      values
        .map((value) => value / 255)
        .map((value) =>
          value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
        )
        .reduce(
          (sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i],
          0,
        );
    const foreground = luminance(rgb(getComputedStyle(element).color)),
      back = luminance(background);
    return (
      (Math.max(foreground, back) + 0.05) / (Math.min(foreground, back) + 0.05)
    );
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
}

test("Start authorizes real MP3 playback; captions advance in order without Next", async ({
  page,
}) => {
  await seed(page);
  const files = [];
  page.on("request", (r) => {
    if (r.url().includes("/audio/scenarios/ionic_aquarium_mystery/"))
      files.push(r.url());
  });
  await page.goto(target);
  await expect(
    page.getByRole("button", { name: "Start scenario", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".od-workspace:visible")).toHaveCount(0);
  expect(files).toHaveLength(0);
  await page
    .getByRole("button", { name: "Start scenario", exact: true })
    .click();
  const audio = page.locator(".od-session>audio");
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(0);
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[0].line);
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mute", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /Next dialogue|Replay voice|Resume voice|Mute voice/,
    }),
  ).toHaveCount(0);
  await expect(audio).toHaveAttribute("data-dialogue-id", "OD_S01_NAR_02", {
    timeout: 15000,
  });
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[1].line);
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(0);
  expect(files.some((path) => path.includes("OD_S01_NAR_02"))).toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(audio).toHaveJSProperty("paused", true);
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(() => audio.evaluate((a) => a.paused)).toBe(false);
});

test("ordered scene changes stop at scientific tasks, and transport pauses progression", async ({
  page,
}) => {
  await installOceanPlayback(page);
  await seed(page);
  await page.goto(target);
  await startOcean(page);
  const audio = page.locator(".od-session>audio");
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  await expect(audio).toHaveJSProperty("muted", true);
  await page.getByLabel("Playback speed", { exact: true }).selectOption("1.25");
  await expect(audio).toHaveJSProperty("playbackRate", 1.25);
  await finishCaption(page);
  await expect(audio).toHaveAttribute("data-dialogue-id", "OD_S01_NAR_02");
  await finishCaption(page);
  await expect(audio).toHaveAttribute("data-dialogue-id", "OD_S02_NOO_01");
  await expect(page.locator(".od-art")).toHaveAttribute(
    "src",
    /02_preparations/,
  );
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await finishCaption(page);
  await expect(audio).toHaveAttribute("data-dialogue-id", "OD_S02_NOO_01");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(audio).toHaveAttribute("data-dialogue-id", "OD_S02_KHA_02");
  await oceanTask(page, "first-decision");
  await expect(
    page.getByRole("button", { name: "Run calcium screening", exact: true }),
  ).toHaveCount(0);
  await finishCaption(page);
  await expect(page.locator(".od-viewport")).toHaveAttribute(
    "data-story-step",
    "first-decision",
  );
  await page
    .getByRole("button", {
      name: "Assume any white deposit is table salt",
      exact: true,
    })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "several minerals can look white",
  );
  await oceanTask(page, "first-decision");
  await page
    .getByRole("button", {
      name: "Collect independent evidence from the isolated mineral",
      exact: true,
    })
    .click();
  await oceanTask(page, "calcium");
  await page
    .getByRole("button", { name: "Run calcium screening", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "screening shows calcium",
  );
  await oceanTask(page, "solubility");
  await expect(
    page.getByRole("button", { name: "Test water solubility", exact: true }),
  ).toBeVisible();
});

test("native full screen survives a chapter transition, keeps the notebook usable and exits", async ({
  page,
}) => {
  await installOceanPlayback(page);
  await seed(page);
  await page.goto(target);
  await page.getByRole("button", { name: "Full screen", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.fullscreenElement?.classList.contains("od-session"),
      ),
    )
    .toBe(true);
  await startOcean(page);
  await finishCaption(page);
  await page
    .locator(".od-session")
    .screenshot({ path: `${shots}/fullscreen-desktop.png` });
  await oceanBriefing(page);
  await expect(page.locator(".od-viewport")).toHaveAttribute(
    "data-story-step",
    "first-decision",
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.fullscreenElement?.classList.contains("od-session"),
      ),
    )
    .toBe(true);
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .last()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Close notebook").click();
  await page
    .getByRole("button", { name: "Exit full screen", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement === null))
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Full screen", exact: true }),
  ).toBeVisible();
});

test("unsupported full screen expands to the viewport and Escape restores the page", async ({
  page,
}) => {
  await seed(page);
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new DOMException("Unavailable", "NotAllowedError"));
  });
  await page.goto(target);
  await page.getByRole("button", { name: "Full screen", exact: true }).click();
  await expect(page.locator(".od-session")).toHaveClass(/is-expanded/);
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(page.locator(".od-session")).not.toHaveClass(/is-expanded/);
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .not.toBe("hidden");
});

test("pause preserves decision input, hidden tabs pause, and navigation releases the persistent audio", async ({
  page,
}) => {
  await installOceanPlayback(page);
  await seed(page, { investigation, scene1: { selectedOption: "A" } });
  await page.goto(target);
  await oceanTask(page, "professional-decision");
  await page
    .getByLabel("Your evidence-based justification")
    .fill("Preserve this draft during playback pause.");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByLabel("Your evidence-based justification"),
  ).toHaveValue("Preserve this draft during playback pause.");
  await expect(
    page.getByRole("button", { name: "Commit my decision →", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Perspective X — Home", exact: true })
    .first()
    .click();
  await expect(page.locator(".od-session")).toHaveCount(0);
  expect(
    await page.evaluate(() => window.__oceanPlayer.getAttribute("src")),
  ).toBe(null);
});

test("blocked playback offers Resume without skipping, and missing audio advances with readable captions", async ({
  page,
}) => {
  await seed(page);
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      return Promise.reject(
        new DOMException("Gesture required", "NotAllowedError"),
      );
    };
  });
  await page.goto(target);
  await startOcean(page);
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[0].line);
  await expect(
    page.getByText("Select Resume to allow playback, or use captions only.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.clock.install();
  await page
    .getByRole("button", { name: "Captions only", exact: true })
    .click();
  await page.clock.runFor(
    OCEAN_DIALOGUE[0].line.split(/\s+/).length * 330 + 20,
  );
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[1].line);
});

test("a missing recording automatically continues with readable captions", async ({
  page,
}) => {
  await seed(page);
  await page.route("**/audio/scenarios/ionic_aquarium_mystery/**", (r) =>
    r.fulfill({ status: 404, body: "" }),
  );
  await page.goto(target);
  await page.clock.install();
  await startOcean(page);
  await expect(
    page.getByText("Audio unavailable · continuing with captions", {
      exact: true,
    }),
  ).toBeVisible();
  await page.clock.runFor(
    OCEAN_DIALOGUE[0].line.split(/\s+/).length * 330 + 20,
  );
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[1].line);
});

for (const option of IONIC_SCENARIOS[A].scenes[1].options) {
  test(`automatic narration plays only the committed ${option.consequence} ending`, async ({
    page,
  }) => {
    await installOceanPlayback(page);
    await seed(page, { investigation, scene1: { selectedOption: "A" } });
    const films = [];
    page.on("request", (r) => {
      if (r.url().includes("/videos/scenarios/ionic_aquarium_mystery/"))
        films.push(r.url());
    });
    await page.goto(target);
    await oceanTask(page, "professional-decision");
    expect(films).toHaveLength(0);
    await legible(page.locator(".im-decision>span").last());
    await page
      .getByRole("radio")
      .nth(IONIC_SCENARIOS[A].scenes[1].options.indexOf(option))
      .check();
    await page.locator(".im-citations input").nth(0).check();
    await page.locator(".im-citations input").nth(1).check();
    await page
      .getByLabel("Your evidence-based justification")
      .fill(
        "The independent calcium and carbonate observations support the mineral hypothesis. Qualified staff should review the remaining uncertainty before action.",
      );
    await page
      .getByRole("button", { name: "Commit my decision →", exact: true })
      .click();
    await expect(page.locator(".od-viewport")).toHaveAttribute(
      "data-story-step",
      "chosen-ending",
    );
    await expect(page.locator(".od-novel video")).toHaveAttribute(
      "src",
      new RegExp(`ending-${option.consequence}\\.mp4\\.mp4$`),
    );
    await expect(page.locator(".od-caption")).toHaveText(
      OCEAN_DIALOGUE.find(
        (row) => row.scene === 14 && row.branch === option.consequence,
      ).line,
    );
    await snap(page, `ending-${option.consequence}`);
    await oceanTask(page, "reflection");
    expect(
      films.every((url) =>
        url.includes(`ending-${option.consequence}.mp4.mp4`),
      ),
    ).toBe(true);
  });
}

test("formula feedback requires revision; successful identification advances chapters automatically", async ({
  page,
}) => {
  await installOceanPlayback(page);
  await seed(page, {
    investigation: {
      ...investigation,
      formula: {
        cation: "Ca",
        anion: "Cl",
        positives: 1,
        negatives: 1,
        checked: false,
      },
      oceanStory: { step: 6, line: 2 },
    },
  });
  await page.goto(target);
  await oceanTask(page, "formula");
  await page
    .getByRole("button", { name: "Check charge balance", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "Check the total charge",
  );
  await oceanTask(page, "formula");
  const formula = page.getByRole("region", { name: "Ionic formula builder" });
  const transfer = await page.evaluateHandle(() => {
    const d = new DataTransfer();
    d.setData("text/plain", "CO3");
    return d;
  });
  await formula
    .getByLabel("Anion drop zone")
    .dispatchEvent("drop", { dataTransfer: transfer });
  await legible(formula.getByLabel("Anion drop zone").locator("strong"));
  await formula
    .getByRole("button", { name: "Add cation", exact: true })
    .click();
  await formula.getByRole("button", { name: "Add anion", exact: true }).click();
  await formula
    .getByRole("button", { name: "Check charge balance", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "simplest whole-number ratio",
  );
  await oceanTask(page, "formula");
  await formula
    .getByRole("button", { name: "Remove cation", exact: true })
    .click();
  await formula
    .getByRole("button", { name: "Remove anion", exact: true })
    .click();
  await formula
    .getByRole("button", { name: "Check charge balance", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "neutral formula CaCO3",
  );
  await oceanTask(page, "crystal");
  await snap(page, "04-crystal-desktop");
});

for (const wrong of [1, 2]) {
  test(`${wrong === 1 ? "80% earns badge" : "60% earns no badge"} after automatic graded feedback`, async ({
    page,
  }) => {
    await installOceanPlayback(page);
    const state = await seed(page, {
      investigation,
      scene1: { selectedOption: "A" },
      scene2: { selectedOption: "A", consequence: "isolate-review" },
      reflection: "Independent evidence supports qualified review.",
    });
    await page.goto(target);
    await oceanTask(page, "expertise");
    await expect(page.locator(".im-assessment")).toHaveCount(5);
    await expect(
      page.getByText("Supported answer:", { exact: false }),
    ).toHaveCount(0);
    await legible(page.locator(".im-assessment label>span").first());
    for (const [i, q] of IONIC_SCENARIOS[A].exitTicket.mcqs.entries())
      await page
        .getByRole("radio", {
          name: q.options.find((o) => (i < wrong ? !o.correct : o.correct))
            .text,
          exact: true,
        })
        .check();
    await page
      .getByRole("button", { name: "Submit final assessment", exact: true })
      .click();
    const passed = wrong === 1;
    await expect(page.locator(".od-session>audio")).toHaveAttribute(
      "data-dialogue-id",
      passed ? "OD_S16_HAM_02" : "OD_S16_HAM_04",
    );
    await oceanAssessmentReady(page);
    const finish = page.getByRole("button", {
      name: passed ? "Complete Mission" : "Save result and review",
      exact: true,
    });
    await finish.scrollIntoViewIfNeeded();
    await snap(page, `assessment-${passed ? "80-pass" : "60-retry"}`);
    await finish.click();
    await expect(page.locator(".xp-completion")).toBeVisible();
    await expect(page.locator(".xp-earned-badge")).toHaveCount(passed ? 1 : 0);
    expect(
      state.progressRows.some(
        (r) => r.scenario_id === A && r.score === (passed ? 80 : 60),
      ),
    ).toBe(true);
  });
}
for (const width of [820, 390]) {
  test(`Start and fullscreen fit at ${width}px without horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1180 });
    await installOceanPlayback(page);
    await seed(page);
    await page.goto(target);
    await noOverflow(page);
    await snap(page, `start-${width}`);
    await page
      .getByRole("button", { name: "Full screen", exact: true })
      .click();
    await startOcean(page);
    await finishCaption(page);
    await expect(
      page.getByRole("button", { name: "Pause", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page
      .locator(".od-session")
      .screenshot({ path: `${shots}/fullscreen-${width}.png` });
    await page
      .getByRole("button", { name: "Exit full screen", exact: true })
      .click();
  });
}

test("missing scene image and film keep automatic narration and the fallback briefing usable", async ({
  page,
}) => {
  await installOceanPlayback(page);
  await seed(page);
  await page.route("**/images/scenarios/ionic_aquarium_mystery/story/**", (r) =>
    r.abort(),
  );
  await page.route("**/videos/scenarios/ionic_aquarium_mystery/**", (r) =>
    r.abort(),
  );
  await page.goto(target);
  await expect(page.locator(".od-art")).toHaveAttribute(
    "src",
    "/images/ionic/aquarium-lab.webp",
  );
  await startOcean(page);
  for (let i = 0; i < 5; i++) await finishCaption(page);
  await expect(page.locator(".od-viewport")).toHaveAttribute(
    "data-story-step",
    "incident",
  );
  await expect(
    page.getByText("Film unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".od-caption")).toContainText("without warning");
  await oceanTask(page, "first-decision");
  await expect(
    page.getByRole("button", {
      name: "Collect independent evidence from the isolated mineral",
      exact: true,
    }),
  ).toBeVisible();
});
