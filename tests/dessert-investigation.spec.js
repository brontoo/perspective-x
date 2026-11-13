import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import {
  dessertAt,
  dessertSetup,
  dessertStart,
  dessertReach,
  dessertRoot as root,
  DESSERT_TARGET,
} from "./support/dessert-flow";
import { dessertScenario } from "./support/dessert-checkpoints.mjs";
import { createDessertOrder } from "../src/data/dessertAssessment.mjs";
const folder = "docs/dessert/investigation/screenshots";
async function shot(page, name) {
  mkdirSync(folder, { recursive: true });
  await root(page).screenshot({ path: `${folder}/${name}.png` });
}
async function fullscreen(page) {
  await root(page)
    .getByRole("button", { name: "Full screen", exact: true })
    .click();
}
async function applyTool(page, { miss = false } = {}) {
  const tool = root(page).locator(".px-dessert-held-tool"),
    canvas = root(page).locator(".px-dessert-tool-canvas");
  const t = await tool.boundingBox(),
    c = await canvas.boundingBox();
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 3);
  await page.mouse.down();
  await page.mouse.move(
    c.x + c.width * (miss ? 0.24 : 0.715),
    c.y + c.height * 0.32,
    { steps: 12 },
  );
  await page.mouse.up();
}
async function noRootScroll(page) {
  expect(
    await root(page).evaluate(
      (el) =>
        el.scrollHeight <= el.clientHeight + 1 &&
        el.scrollWidth <= el.clientWidth + 1,
    ),
  ).toBe(true);
}

test("briefing explains the problem, objectives, success and untimed duration before authorizing any playback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await dessertSetup(page);
  await page.goto(DESSERT_TARGET);
  for (const title of [
    "Main problem",
    "Learning objectives",
    "Success criteria",
  ])
    await expect(
      root(page).getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  await expect(root(page)).toContainText("20–30 minutes");
  await expect(root(page)).toContainText("your work is untimed");
  expect(
    await page.evaluate(() =>
      window.__dessertPlayback.filter((e) => e.op === "play"),
    ),
  ).toEqual([]);
  await shot(page, "briefing-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await fullscreen(page);
  await root(page)
    .getByRole("button", { name: "Start Experience", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    root(page).getByRole("button", { name: "Start Experience", exact: true }),
  ).toBeInViewport();
  await noRootScroll(page);
  await shot(page, "briefing-mobile");
});

for (const width of [1440, 390])
  test(`calibration requires an applied tool; pointer drag records a real observation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await dessertAt(page, "calibrate");
    await fullscreen(page);
    await expect(root(page).locator(".px-dessert-meter")).toContainText(
      "Awaiting calibration",
    );
    await root(page).locator(".px-dessert-held-tool").scrollIntoViewIfNeeded();
    await applyTool(page, { miss: true });
    await expect(root(page).locator(".px-dessert-meter")).toContainText(
      "Awaiting calibration",
    );
    await applyTool(page);
    await expect(root(page).locator(".px-dessert-meter")).toContainText(
      "2 µS/cm",
    );
    await noRootScroll(page);
    await shot(page, `calibration-${width}`);
    await dessertReach(page, "sample-a");
    await expect(root(page).locator(".px-dessert-meter")).toContainText(
      "Awaiting test",
    );
  });

test("dragging a conductivity probe measures the selected sample without leaking other sample readings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await dessertAt(page, "conductivity");
  await fullscreen(page);
  await root(page)
    .getByRole("button", { name: /^Sample B/ })
    .click();
  await expect(root(page).locator(".px-dessert-meter")).toContainText(
    "Awaiting test",
  );
  await applyTool(page);
  await expect(root(page).locator(".px-dessert-meter")).toContainText(
    "1100 µS/cm",
  );
  await expect(root(page).getByLabel("Recorded observations")).toContainText(
    "Sample B",
  );
  await shot(page, "conductivity");
  await dessertReach(page, "conductivity");
  await root(page)
    .getByRole("button", { name: /^Sample C/ })
    .click();
  await expect(root(page).locator(".px-dessert-meter")).toContainText(
    "Awaiting test",
  );
  await expect(root(page).locator(".px-dessert-held-tool")).toHaveCSS(
    "left",
    /./,
  );
});

test("keyboard pickup and beaker placement operate the pH probe", async ({
  page,
}) => {
  await dessertAt(page, "ph");
  await fullscreen(page);
  await root(page)
    .getByRole("button", { name: /^Sample B/ })
    .click();
  const probe = root(page).getByRole("button", {
    name: "pH probe",
    exact: true,
  });
  await probe.focus();
  await page.keyboard.press("Enter");
  const target = root(page).getByRole("button", {
    name: "Place ph probe in Sample B",
    exact: true,
  });
  await expect(target).toBeEnabled();
  await target.focus();
  await page.keyboard.press("Enter");
  await expect(root(page).locator(".px-dessert-meter")).toContainText("pH 8.3");
});

test("dropper produces observable CO2 bubbles only after it is applied to the isolated bicarbonate aliquot", async ({
  page,
}) => {
  await dessertAt(page, "acid");
  await fullscreen(page);
  await root(page)
    .getByRole("button", { name: /^Sample B/ })
    .click();
  await expect(root(page).locator(".px-dessert-bubble")).toHaveCount(0);
  await applyTool(page);
  await expect(root(page).locator(".px-dessert-meter")).toContainText(
    "CO₂ detected",
  );
  await expect(root(page).locator(".px-dessert-bubble")).toHaveCount(6);
  await shot(page, "virtual-reaction");
});

test("electron can be dragged to chlorine and the only background is the clean laboratory", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await dessertAt(page, "electron");
  await fullscreen(page);
  await expect(root(page).locator(".px-dessert-scene-image")).toHaveAttribute(
    "src",
    /IMAGE_11.webp$/,
  );
  await expect(root(page).locator(".px-dessert-task")).toHaveCSS(
    "background-color",
    "rgb(11, 41, 61)",
  );
  const handle = root(page).getByRole("button", {
      name: "Drag sodium valence electron to chlorine",
    }),
    a = await handle.boundingBox(),
    svg = root(page).locator(".im-instrument > svg"),
    r = await svg.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    r.x + (r.width * 415) / 550,
    r.y + (r.height * 93) / 215,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect(root(page).locator(".im-instrument")).toContainText(
    "1 of 1 valence electrons transferred",
  );
  await expect(svg).toHaveAttribute(
    "aria-label",
    /Na has 11 protons and 10 electrons; Cl has 17 protons and 18 electrons/,
  );
  await shot(page, "electron-transfer");
});

test("questions and options remain randomized across reload with matching recorded prompts and stable answer IDs", async ({
  page,
}) => {
  const order = createDessertOrder({ seed: 17 });
  await dessertAt(page, "question", {}, (s) => {
    s.quizOrder = order;
    s.ready = false;
    s.cursor = 0;
  });
  await fullscreen(page);
  const seen = [];
  for (let i = 0; i < 5; i++) {
    await dessertReach(page, `question${i + 1}`);
    const q = dessertScenario.exitTicket.mcqs[order.questions[i]];
    seen.push(q.id);
    await expect(root(page).locator("[data-question-id]")).toHaveAttribute(
      "data-question-id",
      q.id,
    );
    await expect(root(page).locator("audio")).toHaveAttribute(
      "data-dialogue-id",
      `CH05_Q0${order.questions[i] + 1}_QUESTION_NARRATOR`,
    );
    const options = await root(page)
      .locator(".px-dessert-quiz-options label span")
      .allTextContents();
    expect(options).toEqual(
      order.options[q.id].map((index) => q.options[index].text),
    );
    const box = await root(page).locator(".px-dessert-task").boundingBox();
    expect(box.width).toBeLessThan(page.viewportSize().width * 0.8);
    if (i === 0) {
      const record = await root(page).getByRole("button", { name: "Record answer", exact: true }).boundingBox();
      expect(record.y + record.height).toBeLessThanOrEqual(box.y + box.height + 1);
      await shot(page, "randomized-question");
      await page.reload();
      await dessertStart(page);
      await dessertReach(page, "question1");
      await expect(root(page).locator("[data-question-id]")).toHaveAttribute(
        "data-question-id",
        q.id,
      );
      expect(
        await root(page)
          .locator(".px-dessert-quiz-options label span")
          .allTextContents(),
      ).toEqual(options);
    }
    await root(page)
      .getByRole("radio", {
        name: q.options.find((o) => o.correct).text,
        exact: true,
      })
      .check();
    await root(page)
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  expect(new Set(seen).size).toBe(5);
  await dessertReach(page, "assessment");
  await root(page)
    .getByRole("button", { name: "Submit final assessment", exact: true })
    .click();
  await expect(root(page).locator(".px-dessert-score")).toHaveText("100%");
});

for (const [wrong, bonus, teacher] of [
  [0, 10, false],
  [2, 10, false],
  [0, 0, false],
  [0, 10, true],
])
  test(`enrichment records ${bonus} separate points with ${wrong} wrong core answers and teacher=${teacher}`, async ({
    page,
  }) => {
    const { data } = await dessertAt(
      page,
      "assessment",
      { empty: false, teacher },
      (s) => {
        for (const q of dessertScenario.exitTicket.mcqs.slice(0, wrong))
          s.answers[q.id] = q.options.find((o) => !o.correct).id;
      },
    );
    const challenge = root(page).locator(".px-dessert-enrichment");
    await challenge.locator("summary").click();
    await challenge
      .getByRole("radio", {
        name: bonus
          ? "MgCl₂ and MgO; the molten salts conduct because their ions can move."
          : "MgCl and MgO; equal numbers of ions always cancel the charges.",
        exact: true,
      })
      .check();
    await expect(root(page)).not.toContainText("One Mg²⁺ balances two");
    await root(page)
      .getByRole("button", { name: "Submit final assessment", exact: true })
      .click();
    await expect(root(page).locator(".px-dessert-score")).toHaveText(
      `${100 - wrong * 20}%`,
    );
    const result = root(page).locator(".px-dessert-bonus");
    if (teacher) {
      await expect(result).toContainText("Enrichment preview");
      expect(data.writes).toHaveLength(0);
      await expect(result).not.toHaveAttribute("data-bonus-points");
    } else {
      await expect(result).toHaveAttribute("data-bonus-points", String(bonus));
      const saved = data.progressRows.filter(
        (row) => row.score === 100 - wrong * 20,
      );
      expect(saved).toHaveLength(1);
      expect(saved[0].answers.exitTicket.enrichment.bonusPoints).toBe(bonus);
      await expect(root(page).locator(".px-dessert-points")).toHaveText("150");
      await expect(root(page).locator(".px-dessert-badge")).toHaveAttribute(
        "data-earned",
        wrong === 2 ? "false" : "true",
      );
      if (wrong === 0 && bonus === 10) await shot(page, "enrichment-result");
    }
  });

test.describe("touch access", () => {
  test.use({ hasTouch: true });
  test("a touch learner can pick up a tool and apply it without a precision drag", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await dessertAt(page, "sample-a");
    await fullscreen(page);
    await root(page)
      .getByRole("button", { name: "Conductivity probe", exact: true })
      .tap();
    await root(page)
      .getByRole("button", {
        name: "Place conductivity probe in Sample A",
        exact: true,
      })
      .tap();
    await expect(root(page).locator(".px-dessert-meter")).toContainText(
      "4 µS/cm",
    );
    await noRootScroll(page);
  });
});
