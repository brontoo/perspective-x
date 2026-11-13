import { test, expect } from "@playwright/test";
import { ID, setup } from "./support/fixtures";
import {
  dessertSetup,
  dessertAt,
  dessertStart,
  dessertBeat,
  dessertReach,
  dessertRoot as root,
  DESSERT_TARGET,
} from "./support/dessert-flow";
import {
  dessertCheckpoint,
  dessertDraft,
  dessertScenario,
} from "./support/dessert-checkpoints.mjs";
import { DESSERT_MEDIA, DESSERT_NODES } from "../src/data/dessertFlow.mjs";
import { mkdirSync } from "node:fs";

async function frameFits(page) {
  const metrics = await root(page).evaluate((el) => ({
    height: el.clientHeight,
    scroll: el.scrollHeight,
    width: el.clientWidth,
    scrollWidth: el.scrollWidth,
  }));
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.height + 1);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width + 1);
  for (const name of [
    "Previous scene",
    "Mission Notebook",
    "Exit full screen",
    "Pause",
    "Mute",
    "Replay line",
    "Captions only",
    "Hide captions",
  ]) {
    const box = await root(page)
      .getByRole("button", { name, exact: true })
      .boundingBox();
    expect(box, name).toBeTruthy();
    expect(box.y, name).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height, name).toBeLessThanOrEqual(
      page.viewportSize().height + 1,
    );
  }
  const dialogue = root(page).locator(".px-dessert-dialogue");
  await expect(dialogue).toBeVisible();
  expect(
    await dialogue.evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
  ).toBe(true);
}
for (const [width, height] of [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [820, 1180],
  [390, 844],
])
  test(`fullscreen teacher scene fits ${width}×${height} with bright artwork and visible controls`, async ({
    page,
  }) => {
    mkdirSync("docs/dessert/presentation/screenshots", { recursive: true });
    await page.setViewportSize({ width, height });
    const state = dessertCheckpoint("first");
    state.node = "n07";
    state.cursor = 2;
    state.ready = false;
    await dessertSetup(page, {
      teacher: true,
      seedRows: [dessertDraft(state, ID)],
    });
    await page.goto(DESSERT_TARGET + "&preview=true");
    await dessertStart(page);
    await root(page)
      .getByRole("button", { name: "Full screen", exact: true })
      .click();
    await expect(root(page)).toHaveClass(/is-fullscreen/);
    await expect(root(page).locator(".px-dessert-preview")).not.toHaveAttribute(
      "open",
      "",
    );
    await frameFits(page);
    expect(
      await root(page)
        .locator(".px-dessert-stage")
        .evaluate((el) => getComputedStyle(el, "::after").backgroundImage),
    ).toBe("none");
    await expect(root(page).locator(".px-dessert-scene-image")).toHaveCSS(
      "filter",
      "none",
    );
    await page.mouse.wheel(0, 600);
    await frameFits(page);
    await root(page).screenshot({
      path: `docs/dessert/presentation/screenshots/scene07-${width}.png`,
    });
    await root(page).locator(".px-dessert-preview > summary").click();
    await root(page)
      .getByLabel("Teacher scene preview", { exact: true })
      .selectOption("n02");
    await expect(root(page)).toHaveAttribute("data-node", "n02");
    await expect(root(page).locator(".px-dessert-preview")).not.toHaveAttribute(
      "open",
      "",
    );
    await expect(root(page).locator("audio")).toHaveAttribute(
      "data-dialogue-id",
      "CH01_SC02_001_MARIAM",
    );
  });

test("fallback presentation traps focus, fits resize, and offers history without a page scroll", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new Error("Use expanded presentation"));
  });
  await page.setViewportSize({ width: 1366, height: 768 });
  await dessertAt(page, "decision");
  await root(page)
    .getByRole("button", { name: "Full screen", exact: true })
    .click();
  await expect(root(page)).toHaveClass(/is-expanded/);
  await expect(root(page)).toHaveCSS("height", "768px");
  await root(page)
    .getByRole("button", { name: "Mission record", exact: true })
    .click();
  const dialog = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Mission record", exact: true }),
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Dialogue history");
  await dialog
    .getByRole("button", { name: "Close mission record", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root(page)).toHaveCSS("height", "844px");
  await page.keyboard.press("Escape");
  await expect(root(page)).not.toHaveClass(/is-expanded/);
  await expect(
    root(page).getByRole("button", { name: "Full screen", exact: true }),
  ).toBeFocused();
});

for (const wrong of [0, 1, 2])
  test(`submission with ${wrong} wrong answers shows concise actual results without narrated answer feedback`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const { data } = await dessertAt(
      page,
      "assessment",
      { empty: false },
      (state) => {
        for (let i = 0; i < wrong; i++) {
          const q = dessertScenario.exitTicket.mcqs[i];
          state.answers[q.id] = q.options.find((o) => !o.correct).id;
        }
      },
    );
    await root(page)
      .getByRole("button", { name: "Full screen", exact: true })
      .click();
    await root(page)
      .getByRole("button", { name: "Submit final assessment", exact: true })
      .click();
    await expect(root(page).locator(".px-dessert-results")).toBeVisible();
    await expect(root(page)).toHaveClass(/is-fullscreen/);
    await expect(root(page).locator(".px-dessert-score")).toHaveText(
      `${100 - 20 * wrong}%`,
    );
    await expect(root(page).locator(".px-dessert-points")).toHaveText("150");
    await expect(
      root(page).getByText("Total Points", { exact: true }),
    ).toBeVisible();
    await expect(
      root(page).getByText("Points earned", { exact: true }),
    ).toHaveCount(0);
    await expect(root(page).locator(".px-dessert-badge")).toHaveAttribute(
      "data-earned",
      wrong < 2 ? "true" : "false",
    );
    const played = await page.evaluate(() =>
      window.__dessertPlayback.filter((x) => x.op === "play" && x.id),
    );
    expect(
      played.filter((x) =>
        /CH05_Q\d+_(CORRECT|INCORRECT)|CH05_SC28_/.test(x.id),
      ),
    ).toEqual([]);
    expect(
      data.progressRows.filter((r) => r.score === 100 - 20 * wrong),
    ).toHaveLength(1);
    await expect(
      root(page).getByRole("button", { name: "Finish mission", exact: true }),
    ).toBeVisible();
    expect(
      await root(page).evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    ).toBe(true);
    await root(page).screenshot({
      path: `docs/dessert/presentation/screenshots/result-${100 - 20 * wrong}.png`,
    });
    await root(page)
      .getByRole("button", { name: "Review answers", exact: true })
      .click();
    const review = page.getByRole("dialog", {
      name: "Optional answer review",
      exact: true,
    });
    await expect(review).toBeVisible();
    await expect(review.locator("h3")).toHaveCount(5);
    await review
      .getByRole("button", { name: "Close answer review", exact: true })
      .click();
    expect(
      data.progressRows.filter((r) => r.score === 100 - 20 * wrong),
    ).toHaveLength(1);
  });

test("unavailable cumulative points are hidden rather than replaced with the score", async ({
  page,
}) => {
  await dessertAt(page, "assessment");
  await root(page)
    .getByRole("button", { name: "Submit final assessment", exact: true })
    .click();
  await expect(root(page).locator(".px-dessert-badge")).toHaveAttribute(
    "data-earned",
    "true",
  );
  await expect(root(page).locator(".px-dessert-points")).toHaveCount(0);
});

test("failed persistence shows pending achievement and no fabricated points or certificate", async ({
  page,
}) => {
  await dessertAt(page, "assessment", { failWrites: true });
  await root(page)
    .getByRole("button", { name: "Submit final assessment", exact: true })
    .click();
  await expect(
    root(page).getByRole("button", {
      name: "Retry saving result",
      exact: true,
    }),
  ).toBeVisible();
  await expect(root(page).locator(".px-dessert-badge")).toHaveAttribute(
    "data-earned",
    "false",
  );
  await expect(root(page).locator(".px-dessert-points")).toHaveCount(0);
  await expect(
    root(page).getByRole("button", { name: "View certificate", exact: true }),
  ).toHaveCount(0);
});

test("a delayed illustration retains the old frame and caption; its narration cannot start early", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await dessertSetup(page);
  await page.route("**/cinematic/IMAGE_02*", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await dessertBeat(page);
  await expect(root(page)).toHaveAttribute("data-node", "n02");
  await expect(
    root(page).locator(".px-dessert-retained-image"),
  ).toHaveAttribute("src", DESSERT_MEDIA.images.IMAGE_01.url);
  await expect(root(page).locator(".px-dessert-scene-image")).toHaveCSS(
    "opacity",
    "0",
  );
  expect(
    await page.evaluate(() =>
      window.__dessertPlayback.some(
        (x) => x.op === "play" && x.id === "CH01_SC02_001_MARIAM",
      ),
    ),
  ).toBe(false);
  await dessertBeat(page);
  await expect(root(page)).toHaveAttribute("data-node", "n02");
  release();
  await expect(root(page).locator(".px-dessert-scene-image")).toHaveCSS(
    "opacity",
    "1",
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__dessertPlayback.some(
          (x) => x.op === "play" && x.id === "CH01_SC02_001_MARIAM",
        ),
      ),
    )
    .toBe(true);
});

test("every played opening line owns a decoded illustration from the same physical scene", async ({
  page,
}) => {
  await dessertSetup(page);
  await page.addInitScript(() => {
    window.__visualPairs = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this.classList.contains("px-dessert-voice")) {
        const root = document.querySelector(".px-dessert[data-node]"),
          image = root?.querySelector(".px-dessert-scene-image");
        window.__visualPairs.push({
          id: this.dataset.dialogueId,
          node: root?.dataset.node,
          scene: root?.querySelector(".px-dessert-art")?.dataset.artScene,
          complete: !!image?.complete,
          opacity: image ? getComputedStyle(image).opacity : null,
        });
      }
      return play.call(this);
    };
  });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await dessertReach(page, "first");
  const pairs = await page.evaluate(() => window.__visualPairs);
  expect(pairs.length).toBeGreaterThan(10);
  for (const pair of pairs) {
    expect(Number(pair.scene)).toBe(DESSERT_NODES[pair.node].scene);
    expect(pair.complete).toBe(true);
    expect(pair.opacity).toBe("1");
  }
});

test("blocked initial speech cannot silently advance its cinematic video before Resume", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await setup(page, { empty: true });
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let denied = false;
    HTMLMediaElement.prototype.play = function () {
      if (this.classList.contains("px-dessert-voice") && !denied) {
        denied = true;
        return Promise.reject(
          new DOMException("Permission required", "NotAllowedError"),
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
  const video = root(page).locator("video");
  await expect(video).toHaveJSProperty("paused", true);
  await page.waitForTimeout(250);
  expect(await video.evaluate((v) => v.currentTime)).toBe(0);
  await root(page).getByRole("button", { name: "Resume", exact: true }).click();
  await expect
    .poll(() => video.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.1);
  await expect
    .poll(() =>
      root(page)
        .locator("audio")
        .evaluate((a) => a.currentTime),
    )
    .toBeGreaterThan(0.1);
});

test("a delayed end-frame image leaves the real native final frame visible without a black replacement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await setup(page, { empty: true });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/cinematic/V01-end.webp", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  const video = root(page).locator("video");
  await expect(video).toHaveJSProperty("ended", true, { timeout: 10000 });
  await expect(video).toHaveCSS("opacity", "1");
  expect(await video.evaluate((v) => v.currentTime)).toBeGreaterThan(3.4);
  await expect(root(page).locator("audio")).toHaveJSProperty("paused", false);
  release();
  await expect(
    root(page).getByAltText("Final cinematic frame", { exact: true }),
  ).toBeVisible();
});

for (const [width, height] of [
  [1366, 768],
  [390, 844],
]) {
  test(`scientific workspace scrolls internally with reachable instruments at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await dessertAt(page, "conductivity");
    await root(page)
      .getByRole("button", { name: "Full screen", exact: true })
      .click();
    const workspace = root(page).locator(".px-dessert-task");
    await root(page)
      .getByRole("button", { name: /^Sample B/ })
      .click();
    await root(page)
      .getByRole("button", { name: "Measure conductivity", exact: true })
      .click();
    await expect(root(page).locator(".px-dessert-meter")).toContainText("1100");
    await dessertReach(page, "conductivity");
    const record = root(page).getByRole("button", {
      name: "Record conductivity findings",
      exact: true,
    });
    await record.scrollIntoViewIfNeeded();
    const area = await workspace.boundingBox(),
      button = await record.boundingBox();
    expect(button.y).toBeGreaterThanOrEqual(area.y);
    expect(button.y + button.height).toBeLessThanOrEqual(
      area.y + area.height + 1,
    );
    expect(
      await root(page).evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    ).toBe(true);
    await root(page).screenshot({
      path: `docs/dessert/presentation/screenshots/workspace-${width}.png`,
    });
  });

  test(`longest story caption remains fully readable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const state = dessertCheckpoint("reflection");
    state.cursor = 1;
    state.ready = false;
    await dessertSetup(page, { seedRows: [dessertDraft(state, ID)] });
    await page.goto(DESSERT_TARGET);
    await dessertStart(page);
    await root(page)
      .getByRole("button", { name: "Full screen", exact: true })
      .click();
    await expect(root(page).locator(".px-dessert-dialogue")).toContainText(
      "You observed that substances can look alike",
    );
    await frameFits(page);
  });
}

test("teacher assessment preview shows score without a student badge, points or progress writes", async ({
  page,
}) => {
  const { data } = await dessertAt(page, "assessment", { teacher: true });
  await root(page)
    .getByRole("button", { name: "Submit final assessment", exact: true })
    .click();
  await expect(root(page).locator(".px-dessert-score")).toHaveText("100%");
  await expect(root(page).locator(".px-dessert-badge")).toHaveAttribute(
    "data-earned",
    "false",
  );
  await expect(root(page).locator(".px-dessert-badge")).toContainText(
    "Preview only",
  );
  await expect(root(page).locator(".px-dessert-points")).toHaveCount(0);
  expect(data.writes).toHaveLength(0);
});
