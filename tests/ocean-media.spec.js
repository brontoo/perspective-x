import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { setup, ID, noOverflow } from "./support/fixtures";
import { oceanTask, oceanBriefing } from "./support/ocean-flow";
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
async function fakeAudio(page) {
  await page.addInitScript(() => {
    window.__oceanPlayback = [];
    HTMLMediaElement.prototype.play = function () {
      if (this.tagName === "AUDIO" && this.hasAttribute("data-dialogue-id")) {
        window.__oceanPlayer = this;
        window.__oceanPlayback.push({
          op: "play",
          src: this.getAttribute("src"),
        });
        this.dispatchEvent(new Event("playing"));
      }
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      if (this.tagName === "AUDIO" && this.hasAttribute("data-dialogue-id")) {
        window.__oceanPlayback.push({
          op: "pause",
          src: this.getAttribute("src"),
        });
        this.dispatchEvent(new Event("pause"));
      }
    };
    HTMLMediaElement.prototype.load = function () {
      if (this.tagName === "AUDIO" && this.hasAttribute("data-dialogue-id"))
        window.__oceanPlayback.push({
          op: "load",
          src: this.getAttribute("src"),
        });
    };
  });
}

test("opening sequence requests only current art and no MP3 before permission; incident is naturally timed", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page);
  const media = [];
  page.on("request", (request) => {
    if (/\/scenarios\/ionic_aquarium_mystery\//.test(request.url()))
      media.push(decodeURI(request.url()));
  });
  await page.goto(target);
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[0].line);
  await expect(page.locator(".od-art")).toHaveJSProperty("complete", true);
  await expect
    .poll(() => media.filter((url) => url.endsWith(".mp3.mp3")).length)
    .toBe(0);
  expect(media.filter((url) => url.includes("/story/"))).toHaveLength(1);
  expect(media.filter((url) => url.includes("/videos/"))).toHaveLength(0);
  await snap(page, "01-marine-world-desktop");
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "Next dialogue →", exact: true })
      .click();
  await expect(page.locator(".od-viewport")).toHaveAttribute(
    "data-story-step",
    "incident",
  );
  const movie = page.getByLabel("Ocean Dome incident cinematic clip");
  await expect(movie).toHaveAttribute(
    "src",
    /video_01_water_turns_white\.mp4\.mp4$/,
  );
  await expect
    .poll(() => movie.evaluate((v) => v.duration))
    .toBeGreaterThan(10);
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  expect(
    await movie.evaluate((v) => ({
      rate: v.playbackRate,
      muted: v.muted,
      paused: v.paused,
    })),
  ).toEqual({ rate: 1, muted: true, paused: true });
  expect(
    media
      .filter((url) => url.includes("/videos/"))
      .every((url) => url.includes("video_01_water_turns_white")),
  ).toBe(true);
  await snap(page, "02-incident-desktop");
  await page
    .getByRole("button", { name: "Use still image", exact: true })
    .click();
  await expect(page.locator(".od-novel video")).toHaveCount(0);
  await expect(page.locator(".od-caption")).toContainText("without warning");
});

test("actual approved MP3 decodes, plays and unlocks the next caption only on ended", async ({
  page,
}) => {
  await seed(page);
  await page.goto(target);
  await page
    .getByRole("button", { name: "Enable character voices", exact: true })
    .click();
  const next = page.getByRole("button", {
    name: "Next dialogue →",
    exact: true,
  });
  await expect(next).toBeDisabled();
  const audio = page.locator(".od-voice audio");
  await expect(audio).toHaveAttribute("src", /OD_S01_NAR_01\.mp3\.mp3$/);
  await expect
    .poll(() => audio.evaluate((a) => a.currentTime))
    .toBeGreaterThan(0);
  await expect(next).toBeEnabled({ timeout: 20000 });
  await expect(audio).toHaveJSProperty("ended", true);
  await next.click();
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[1].line);
  await expect(next).toBeDisabled();
  await page
    .getByRole("button", { name: "Continue without voice", exact: true })
    .click();
  await expect(next).toBeEnabled();
  await expect(audio).not.toHaveAttribute("src", /./);
});

test("voice pause, replay, history, speed, visibility and navigation release the previous recording", async ({
  page,
}) => {
  await fakeAudio(page);
  await seed(page);
  await page.goto(target);
  await page
    .getByRole("button", { name: "Enable character voices", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Next dialogue →", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Pause voice", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume voice", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Replay voice", exact: true }).click();
  await page.getByLabel("Voice speed", { exact: true }).selectOption("1.5");
  await expect(page.locator(".od-voice audio")).toHaveJSProperty(
    "playbackRate",
    1.5,
  );
  await page.getByRole("button", { name: "Mute voice", exact: true }).click();
  await expect(page.locator(".od-voice audio")).toHaveJSProperty("muted", true);
  await page.evaluate(() =>
    window.__oceanPlayer.dispatchEvent(new Event("ended")),
  );
  await page
    .getByRole("button", { name: "Next dialogue →", exact: true })
    .click();
  await expect(page.locator(".od-voice audio")).toHaveAttribute(
    "data-dialogue-id",
    "OD_S01_NAR_02",
  );
  await page.locator(".od-history summary").click();
  await page
    .getByRole("button", { name: "Replay this line", exact: true })
    .first()
    .click();
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[0].line);
  await expect(
    page.getByRole("button", { name: "Next dialogue →", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Return to current dialogue", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toHaveText(OCEAN_DIALOGUE[1].line);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Resume voice", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Perspective X — Home", exact: true })
    .first()
    .click();
  await expect(page.locator(".od-voice audio")).toHaveCount(0);
  const log = await page.evaluate(() => window.__oceanPlayback);
  const playIndices = log
    .map((entry, i) => (entry.op === "play" ? i : -1))
    .filter((i) => i >= 0);
  expect(playIndices.length).toBeGreaterThan(3);
  for (let i = 1; i < playIndices.length; i++)
    expect(
      log
        .slice(playIndices[i - 1] + 1, playIndices[i])
        .some((entry) => entry.op === "pause"),
    ).toBe(true);
  expect(log.at(-1)).toEqual({ op: "load", src: null });
});

test("missing image, audio and video fall back to readable captions and normal progression", async ({
  page,
}) => {
  await seed(page);
  await page.route(
    "**/images/scenarios/ionic_aquarium_mystery/story/**",
    (route) => route.abort(),
  );
  await page.route("**/audio/scenarios/ionic_aquarium_mystery/**", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.route("**/videos/scenarios/ionic_aquarium_mystery/**", (route) =>
    route.abort(),
  );
  await page.goto(target);
  await expect(page.locator(".od-art")).toHaveAttribute(
    "src",
    "/images/ionic/aquarium-lab.webp",
  );
  await page
    .getByRole("button", { name: "Enable character voices", exact: true })
    .click();
  await expect(
    page.getByText("Recording unavailable · continue with the caption", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Continue without voice", exact: true })
    .click();
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "Next dialogue →", exact: true })
      .click();
  await expect(
    page.getByText("Film unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next dialogue →", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Next dialogue →", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "water is turning white",
  );
});

for (const option of IONIC_SCENARIOS[A].scenes[1].options) {
  test(`only ${option.consequence} ending plays after its committed decision`, async ({
    page,
  }) => {
    await seed(page, { investigation, scene1: { selectedOption: "A" } });
    const films = [];
    page.on("request", (r) => {
      if (r.url().includes("/videos/scenarios/ionic_aquarium_mystery/"))
        films.push(decodeURI(r.url()));
    });
    await page.goto(target);
    await oceanTask(page, "professional-decision");
    await legible(page.locator(".im-decision>span").last());
    expect(films).toHaveLength(0);
    await page
      .getByRole("radio", {
        name: new RegExp(option.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      .check();
    await page.locator(".im-citations input").nth(0).check();
    await page.locator(".im-citations input").nth(1).check();
    await page
      .getByLabel("Your evidence-based justification")
      .fill(
        "The independent calcium and carbonate observations support the mineral hypothesis. Qualified staff must consider uncertainty before changing water conditions.",
      );
    await page
      .getByRole("button", { name: "Commit my decision →", exact: true })
      .click();
    await expect(page.locator(".od-viewport")).toHaveAttribute(
      "data-story-step",
      "chosen-ending",
    );
    await expect(page.locator(".od-novel video")).toHaveCount(1);
    await expect(page.locator(".od-novel video")).toHaveAttribute(
      "src",
      new RegExp(`ending-${option.consequence}\\.mp4\\.mp4$`),
    );
    await expect.poll(() => films.length).toBeGreaterThan(0);
    expect(
      films.every((url) =>
        url.includes(`ending-${option.consequence}.mp4.mp4`),
      ),
    ).toBe(true);
    const expected = OCEAN_DIALOGUE.find(
      (row) => row.scene === 14 && row.branch === option.consequence,
    );
    await expect(page.locator(".od-caption")).toHaveText(expected.line);
    await snap(page, `ending-${option.consequence}`);
    await oceanTask(page, "reflection");
    await expect(page.locator(".od-novel video")).toHaveCount(0);
    await expect(page.locator(".im-outcome")).toContainText(
      IONIC_SCENARIOS[A].scenes[2].consequences[option.consequence].outcome,
    );
  });
}

test("unsupported first choices provide feedback and revision without skipping an experiment", async ({
  page,
}) => {
  await seed(page, { investigation: { evidence: [] } });
  await page.goto(target);
  for (const [name, line] of [
    [
      "Assume any white deposit is table salt",
      "But several minerals can look white.",
    ],
    [
      "Add more salt to the demonstration loop",
      "Adding salt could change the water conditions",
    ],
    [
      "Add acid to the animal exhibit",
      "Never apply a laboratory identification test",
    ],
  ]) {
    await oceanTask(page, "first-decision");
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".od-caption")).toContainText(line);
    await expect(
      page.getByRole("button", { name: "Run calcium screening", exact: true }),
    ).toHaveCount(0);
  }
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
  await expect(page.locator(".od-novel video")).toHaveCount(0);
});

test("formula errors and nonminimal ratios require revision; native drag-and-drop records the supported formula", async ({
  page,
}) => {
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
  await snap(page, "03-formula-desktop");
  await page
    .getByRole("button", { name: "Check charge balance", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "Check the total charge",
  );
  await oceanTask(page, "formula");
  const formula = page.getByRole("region", { name: "Ionic formula builder" });
  // Playwright's cross-scroll dragTo has inconsistent HTML5 dataTransfer behaviour;
  // dispatch the native payload to verify the same drop handler with exact MIME data.
  const payload = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.setData("text/plain", "CO3");
    return data;
  });
  await formula
    .getByLabel("Anion drop zone")
    .dispatchEvent("drop", { dataTransfer: payload });
  await expect(formula.getByLabel("Anion drop zone")).toContainText("CO₃");
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
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "CaCO3; net charge 0; simplest ratio",
  );
  await page.getByLabel("Close notebook").click();
  await expect(page.locator(".xp-save-status")).toHaveText(
    "Notebook and responses saved to your account",
  );
  await page.reload();
  await expect(page.locator(".od-viewport")).toHaveAttribute(
    "data-story-step",
    "crystal",
  );
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "CaCO3; net charge 0; simplest ratio",
  );
});

for (const width of [820, 390]) {
  test(`Ocean Dome narration and workbench remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1180 });
    await seed(page);
    await page.goto(target);
    await expect(page.locator(".od-art")).toHaveJSProperty("complete", true);
    await noOverflow(page);
    await snap(page, `briefing-${width}`);
    await oceanBriefing(page);
    await oceanTask(page, "first-decision");
    await page
      .getByRole("button", {
        name: "Collect independent evidence from the isolated mineral",
        exact: true,
      })
      .click();
    await oceanTask(page, "calcium");
    await expect(
      page.getByRole("button", { name: "Run calcium screening", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await snap(page, `investigation-${width}`);
  });
}

test("an unsupported mineral hypothesis requires revision before progressing", async ({
  page,
}) => {
  await seed(page, {
    investigation: { ...investigation, oceanStory: { step: 9, line: 1 } },
  });
  await page.goto(target);
  await page
    .getByLabel("Proposed deposit identity")
    .selectOption("sodium-chloride");
  await page
    .getByRole("button", { name: "Submit identification", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "Does sodium chloride explain",
  );
  await expect(
    page.getByRole("button", {
      name: "Continue to Make the Call →",
      exact: true,
    }),
  ).toHaveCount(0);
  await oceanTask(page, "identification");
  await page
    .getByRole("button", { name: "Revisit my hypothesis", exact: true })
    .click();
  await page
    .getByLabel("Proposed deposit identity")
    .selectOption("calcium-carbonate");
  await page
    .getByRole("button", { name: "Submit identification", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "combined evidence supports calcium carbonate",
  );
  await page
    .getByRole("button", { name: "Next dialogue →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Next dialogue →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Continue to Make the Call →", exact: true })
    .click();
  await oceanTask(page, "professional-decision");
  await legible(page.locator(".im-decision>span").last());
  await expect(
    page.getByRole("button", { name: "Commit my decision →", exact: true }),
  ).toBeDisabled();
});

for (const wrong of [1, 2]) {
  test(`${wrong === 1 ? "80% earns badge" : "60% earns no badge"}; only the graded feedback recording can play`, async ({
    page,
  }) => {
    await fakeAudio(page);
    const state = await seed(page, {
      investigation,
      scene1: { selectedOption: "A" },
      scene2: { selectedOption: "A", consequence: "isolate-review" },
      reflection:
        "The isolated evidence supports a qualified scientific review.",
    });
    await page.goto(target);
    await oceanTask(page, "expertise");
    await expect(page.locator(".im-assessment")).toHaveCount(5);
    await legible(page.locator(".im-assessment legend").first());
    await legible(page.locator(".im-assessment label>span").first());
    await expect(
      page.getByText("Supported answer:", { exact: false }),
    ).toHaveCount(0);
    const questions = IONIC_SCENARIOS[A].exitTicket.mcqs;
    for (const [i, question] of questions.entries()) {
      const answer = question.options.find((option) =>
        i < wrong ? !option.correct : option.correct,
      );
      await page.getByRole("radio", { name: answer.text, exact: true }).check();
    }
    await page
      .getByRole("button", { name: "Submit final assessment", exact: true })
      .click();
    const passed = wrong === 1;
    await expect(page.locator(".im-assessment-result")).toContainText(
      passed ? "80%" : "60%",
    );
    await expect(page.locator(".od-voice audio")).toHaveAttribute(
      "data-dialogue-id",
      passed ? "OD_S16_HAM_02" : "OD_S16_HAM_04",
    );
    await page
      .getByRole("button", { name: "Enable character voices", exact: true })
      .click();
    const finish = page.getByRole("button", {
      name: passed ? "Complete Mission" : "Save result and review",
      exact: true,
    });
    await expect(finish).toBeDisabled();
    await expect(page.locator(".od-voice audio")).toHaveAttribute(
      "src",
      passed ? /OD_S16_HAM_02\.mp3\.mp3$/ : /OD_S16_HAM_04\.mp3\.mp3$/,
    );
    await page.evaluate(() =>
      window.__oceanPlayer.dispatchEvent(new Event("ended")),
    );
    if (passed) {
      await page
        .getByRole("button", { name: "Next dialogue →", exact: true })
        .click();
      await expect(page.locator(".od-caption")).toContainText(
        "Marine Mineral Analyst",
      );
      await page.evaluate(() =>
        window.__oceanPlayer.dispatchEvent(new Event("ended")),
      );
    }
    await expect(finish).toBeEnabled();
    await finish.scrollIntoViewIfNeeded();
    await snap(page, `assessment-${passed ? "80-pass" : "60-retry"}`);
    await finish.click();
    await expect(page.locator(".xp-completion")).toBeVisible();
    await expect(
      page
        .locator(".xp-completion")
        .getByText("Assessment result saved to your account", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".xp-earned-badge")).toHaveCount(passed ? 1 : 0);
    expect(
      state.progressRows.some(
        (row) => row.scenario_id === A && row.score === (passed ? 80 : 60),
      ),
    ).toBe(true);
  });
}
