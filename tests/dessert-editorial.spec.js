import { test, expect } from "@playwright/test";
import { ID } from "./support/fixtures";
import {
  dessertAt,
  dessertSetup,
  dessertStart,
  dessertReach,
  dessertBeat,
  dessertRoot as root,
  DESSERT_TARGET,
} from "./support/dessert-flow";
import {
  dessertCheckpoint,
  dessertDraft,
} from "./support/dessert-checkpoints.mjs";
import { isDessertLineActive } from "../src/data/dessertEditorial.mjs";

test.afterEach(async ({ page }) => {
  const played = await page.evaluate(() => window.__dessertPlayback || []);
  expect(
    played.filter(
      (row) => row.op === "play" && row.id && !isDessertLineActive(row.id),
    ),
  ).toEqual([]);
});

test("identification moves through IMAGE_19 → IMAGE_20 → IMAGE_22 with no cut lecture, blank beat or option narration", async ({
  page,
}) => {
  const images = [];
  page.on("request", (request) => {
    if (request.url().includes("/cinematic/IMAGE_")) images.push(request.url());
  });
  await dessertAt(page, "identity");
  for (const [sample, id] of Object.entries({
    A: "sugar",
    B: "hydrogen-carbonate",
    C: "sodium-chloride",
  }))
    await root(page)
      .getByLabel(`Identity of Sample ${sample}`, { exact: true })
      .selectOption(id);
  await root(page)
    .getByRole("button", {
      name: "Check all three identifications",
      exact: true,
    })
    .click();
  await dessertReach(page, "n20", false);
  await expect(root(page).locator(".px-dessert-scene-image")).toHaveAttribute(
    "src",
    /IMAGE_20/,
  );
  await root(page).screenshot({
    path: "docs/dessert/screenshots/editorial-scene20.png",
  });
  await dessertReach(page, "decision");
  await expect(root(page).locator(".px-dessert-scene-image")).toHaveAttribute(
    "src",
    /IMAGE_22/,
  );
  expect(images.some((url) => url.includes("IMAGE_21"))).toBe(false);
  await expect(
    root(page).getByRole("button", { name: /Read option/ }),
  ).toHaveCount(0);
  await expect(
    root(page).locator('input[name="dessert-decision"]'),
  ).toHaveCount(4);
});

test("decision errors remain accessible and immediate without playing a removed UI notification", async ({
  page,
}) => {
  await dessertAt(page, "decision");
  await root(page).locator('input[name="dessert-decision"]').first().check();
  const before = await page.evaluate(
    () => window.__dessertPlayback.filter((x) => x.op === "play").length,
  );
  await root(page)
    .getByRole("button", { name: "Commit my decision", exact: true })
    .click();
  await expect(root(page).getByRole("status")).toHaveText(
    "Provide a justification of at least sixty characters.",
  );
  await expect(root(page)).toHaveAttribute("data-ready", "true");
  await root(page)
    .getByLabel("Your evidence-based justification", { exact: true })
    .fill(
      "The observed sample identities do not justify returning unlabelled containers directly to the preparation station.",
    );
  await root(page)
    .getByRole("button", { name: "Commit my decision", exact: true })
    .click();
  await expect(root(page).getByRole("status")).toHaveText(
    "Select at least two pieces of evidence.",
  );
  await page.waitForTimeout(200);
  expect(
    await page.evaluate(
      () => window.__dessertPlayback.filter((x) => x.op === "play").length,
    ),
  ).toBe(before);
  await expect(root(page)).toHaveAttribute("data-node", "n22");
});

test("a saved scene-21 draft resumes at scene 22 and Previous Scene excludes archived CUT audio", async ({
  page,
}) => {
  const state = {
    ...dessertCheckpoint("decision"),
    version: 2,
    node: "n21",
    cursor: 0,
    ready: false,
    feedback: null,
  };
  const record = dessertDraft(state, ID);
  record.answers.notebook = {
    evidenceNotes: "Preserve my original nine observations and model.",
  };
  record.answers.meta.sceneTrail = [
    {
      key: "ionic_dessert_mystery:IMAGE_19",
      art: "/images/scenarios/ionic_dessert_mystery/cinematic/IMAGE_19.webp",
      lines: [
        {
          id: "CH02_SC19_003_HAMAD",
          text: "Use the combined evidence",
          audio:
            "/audio/scenarios/ionic_dessert_mystery/cinematic/HAMAD/CH02_SC19_003_HAMAD.mp3",
        },
      ],
    },
    {
      key: "ionic_dessert_mystery:IMAGE_20",
      title: "Scene 20 · The team needs a recommendation",
      lines: [
        {
          id: "CH03_SC20_001_MARIAM",
          text: "We know which sample is sugar.",
          audio:
            "/audio/scenarios/ionic_dessert_mystery/cinematic/MARIAM/CH03_SC20_001_MARIAM.mp3",
        },
        { id: "CH03_SC20_002_SAEED", text: "Excluded", audio: "/excluded.mp3" },
      ],
    },
    {
      key: "ionic_dessert_mystery:IMAGE_21",
      title: "Removed lecture",
      art: "/IMAGE_21.webp",
      lines: [
        { id: "CH03_SC21_001_HAMAD", text: "Excluded", audio: "/excluded.mp3" },
      ],
    },
  ];
  await dessertSetup(page, { seedRows: [record] });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await expect(root(page)).toHaveAttribute("data-node", "n22");
  await root(page)
    .getByRole("button", { name: "Previous scene", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Previous scene review",
    exact: true,
  });
  await expect(dialog.locator("h2")).toContainText("Scene 20");
  await expect(dialog.locator("audio")).toHaveAttribute(
    "data-dialogue-id",
    "CH03_SC20_001_MARIAM",
  );
  await dialog
    .getByRole("button", { name: "Return to current scene", exact: true })
    .click();
  await root(page)
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await expect(
    page.getByLabel("1. Scientific evidence — personal notes"),
  ).toHaveValue(record.answers.notebook.evidenceNotes);
});

test("a removed opening beat resumes at the actual falling-label recording and its V02 checkpoint", async ({
  page,
}) => {
  const state = {
    ...dessertCheckpoint("first"),
    version: 2,
    node: "n04",
    cursor: 0,
    ready: false,
    feedback: null,
    playback: { line: "CH01_SC04_001_NARRATOR", time: 3 },
  };
  await dessertSetup(page, { seedRows: [dessertDraft(state, ID)] });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await expect(root(page).locator("audio")).toHaveAttribute(
    "data-dialogue-id",
    "CH01_SC04_002_NARRATOR",
  );
  await expect(root(page).locator(".px-dessert-stage")).toHaveAttribute(
    "data-video-id",
    "V02",
  );
  await expect(
    root(page).getByText("Scientific evidence · 0 observations", {
      exact: true,
    }),
  ).toBeVisible();
});

test("teacher scene selection excludes scene 21 while retaining standard playback controls", async ({
  page,
}) => {
  await dessertSetup(page, { teacher: true });
  await page.goto(DESSERT_TARGET + "&preview=true");
  await dessertStart(page);
  await expect(
    root(page)
      .getByLabel("Teacher scene preview")
      .locator('option[value="n21"]'),
  ).toHaveCount(0);
  await expect(
    root(page).getByRole("combobox", { name: "Voice speed", exact: true }),
  ).toHaveValue("1");
  await dessertBeat(page);
});
