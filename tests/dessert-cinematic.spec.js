import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { setup, ID, noOverflow } from "./support/fixtures";
import {
  dessertSetup,
  dessertAt,
  dessertStart,
  dessertBeat,
  dessertReach,
  dessertInvestigate,
  dessertDecide,
  dessertReflection,
  dessertAnswers,
  dessertFinish,
  dessertRoot as root,
  DESSERT_TARGET,
} from "./support/dessert-flow";
import {
  dessertCheckpoint,
  dessertDraft,
} from "./support/dessert-checkpoints.mjs";
import { DESSERT_MEDIA } from "../src/data/dessertFlow.mjs";
const draft = (page) =>
  page.evaluate(() =>
    JSON.parse(
      localStorage.getItem(
        "px-mission-draft:00000000-0000-4000-8000-000000000001:ionic_dessert_mystery",
      ),
    ),
  );
async function shot(page, name) {
  mkdirSync("docs/dessert/screenshots", { recursive: true });
  await root(page).screenshot({ path: `docs/dessert/screenshots/${name}.png` });
}

test("one Start uses the new opening and exact recordings, then waits at the investigation decision", async ({
  page,
}) => {
  await dessertSetup(page);
  await page.goto(DESSERT_TARGET);
  await expect(
    root(page).getByRole("button", { name: "Start Experience", exact: true }),
  ).toBeVisible();
  await expect(root(page).locator("audio")).not.toHaveAttribute("src", /mp3/);
  await shot(page, "opening");
  await dessertStart(page);
  await expect(root(page).locator(".px-dessert-dialogue")).toHaveAttribute(
    "data-dialogue-id",
    "CH01_SC01_002_NARRATOR",
  );
  await expect(
    root(page).getByRole("button", { name: "Next", exact: true }),
  ).toHaveCount(0);
  await dessertReach(page, "first");
  await dessertBeat(page);
  await expect(root(page)).toHaveAttribute("data-node", "first");
  await expect(
    root(page).getByRole("button", { name: /Use controlled scientific/ }),
  ).toBeEnabled();
  const d = await draft(page);
  expect(d.investigation.evidence).toHaveLength(0);
});
for (const [choice, name, scene] of [
  ["appearance", "Identify the powders by appearance", "n08"],
  ["taste", "Taste an unknown powder", "n09"],
  ["mix", "Mix the samples together", "n10"],
])
  test(`initial ${choice} plays only its prevention/correction scene and permits a safe revision`, async ({
    page,
  }) => {
    await dessertAt(page, "first");
    await root(page)
      .getByRole("button", { name: new RegExp(name) })
      .click();
    await expect(root(page)).toHaveAttribute("data-node", scene);
    await shot(page, `initial-${choice}`);
    await dessertReach(page, "first");
    const plays = await page.evaluate(() =>
      window.__dessertPlayback.filter((x) => x.op === "play").map((x) => x.id),
    );
    expect(
      plays.some((id) => id?.includes(`DEC01_${choice.toUpperCase()}`)),
    ).toBe(true);
    expect(plays.some((id) => id?.includes("CH04_END_"))).toBe(false);
    await root(page)
      .getByRole("button", { name: /Use controlled scientific/ })
      .click();
    await dessertReach(page, "calibrate");
    expect((await draft(page)).investigation.calibrated).toBe(false);
  });

test("complete controlled investigation requires calibration, nine actual readings, NaCl transfer and supported identification", async ({
  page,
}) => {
  test.setTimeout(120000);
  await dessertAt(page, "calibrate");
  await dessertInvestigate(page, { capture: true });
  const d = await draft(page);
  expect(d.investigation.calibrated).toBe(true);
  expect(
    d.investigation.evidence.filter((e) => /^[ABC]-/.test(e.id)),
  ).toHaveLength(9);
  expect(d.investigation.electron).toEqual({ kind: "NaCl", transferred: 1 });
  expect(d.investigation.identified).toBe(true);
  expect(d.dessertStory.result).toBeNull();
  await shot(page, "professional-decision");
});

test("incorrect identification plays the supplied mismatch cue and preserves editable conclusions and evidence", async ({
  page,
}) => {
  const { state } = await dessertAt(page, "identity");
  for (const a of ["A", "B", "C"])
    await root(page)
      .getByLabel(`Identity of Sample ${a}`, { exact: true })
      .selectOption("sugar");
  await root(page)
    .getByRole("button", {
      name: "Check all three identifications",
      exact: true,
    })
    .click();
  await expect(root(page).locator(".px-dessert-dialogue")).toHaveAttribute(
    "data-dialogue-id",
    "CH02_SC19_WRONG_HAMAD",
  );
  await dessertReach(page, "identity");
  await expect(
    root(page).getByLabel("Identity of Sample B", { exact: true }),
  ).toHaveValue("sugar");
  expect((await draft(page)).investigation.evidence).toEqual(
    state.investigation.evidence,
  );
  expect((await draft(page)).investigation.identified).toBe(false);
});
for (const choice of ["A", "B", "C", "D"])
  test(`committed decision ${choice} presents only its authored ending image, video and voices`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await dessertAt(page, "decision");
    await dessertDecide(page, choice);
    await dessertReach(page, `end${choice}`, false);
    await shot(page, `ending-${choice}`);
    const video = root(page).locator("video");
    await expect(video).toHaveAttribute(
      "src",
      DESSERT_MEDIA.videos[`V0${["A", "B", "C", "D"].indexOf(choice) + 3}`].url,
    );
    await expect(video).toHaveJSProperty("muted", true);
    await expect(video).toHaveJSProperty("loop", false);
    await dessertReach(page, "reflection");
    const played = await page.evaluate(() =>
      window.__dessertPlayback
        .filter((x) => x.op === "play")
        .map((x) => x.id)
        .filter((id) => id?.startsWith("CH04_END_")),
    );
    expect(played).toHaveLength(4);
    expect(played.every((id) => id.startsWith(`CH04_END_${choice}_`))).toBe(
      true,
    );
    expect((await draft(page)).scene2.consequence).toBe(
      {
        A: "verify-replace",
        B: "conductivity-only",
        C: "taste",
        D: "appearance",
      }[choice],
    );
  });
for (const wrong of [1, 2])
  test(`assessment ${wrong === 1 ? "80% pass" : "60% retry"} shows concise results and saves exactly one result`, async ({
    page,
  }) => {
    const { data } = await dessertAt(page, "question");
    await dessertAnswers(page, wrong);
    await expect(
      root(page).getByText("Supported answer:", { exact: false }),
    ).toHaveCount(0);
    await root(page)
      .getByRole("button", { name: "Submit final assessment", exact: true })
      .click();
    await expect(root(page).locator(".px-dessert-results")).toBeVisible();
    await shot(page, wrong === 1 ? "achievement-pass" : "assessment-retry");
    await dessertFinish(page);
    await expect
      .poll(
        () =>
          data.progressRows.filter(
            (r) =>
              r.scenario_id === "ionic_dessert_mystery" &&
              r.score === 100 - wrong * 20,
          ).length,
      )
      .toBe(1);
    const r = data.progressRows.find((r) => r.score === 100 - wrong * 20);
    expect(r.answers.exitTicket.mcq_answers).toHaveLength(5);
    if (wrong === 2) {
      await expect(
        page.getByRole("button", { name: "View certificate", exact: true }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(() =>
          window.__dessertPlayback.some(
            (x) =>
              x.id?.includes("SC28_PASS") ||
              x.id === "SYSTEM_ACHIEVEMENT_EARNED_SYSTEM",
          ),
        ),
      ).toBe(false);
    }
  });

test("previous scene and notebook suspend current recording, inputs and committed observations without duplicated work", async ({
  page,
}) => {
  const { state, data } = await dessertAt(page, "decision");
  await root(page)
    .getByLabel("Your evidence-based justification", { exact: true })
    .fill(
      "Keep this unfinished justification while I review the previous scientific scene.",
    );
  await root(page)
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await page
    .getByLabel("1. Scientific evidence — personal notes", { exact: true })
    .fill("Keep my independently observed sample evidence.");
  await page.getByLabel("Close notebook", { exact: true }).click();
  await expect
    .poll(() =>
      data.progressRows.some((r) =>
        r.answers.notebook?.evidenceNotes?.includes("independently observed"),
      ),
    )
    .toBe(true);
  const before = structuredClone(data.progressRows);
  await root(page)
    .getByRole("button", { name: "Previous scene", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Previous scene review",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("h2")).toContainText("Scene 20");
  await dialog
    .getByRole("button", { name: "Return to current scene", exact: true })
    .click();
  await expect(
    root(page).getByLabel("Your evidence-based justification", { exact: true }),
  ).toHaveValue(
    "Keep this unfinished justification while I review the previous scientific scene.",
  );
  expect((await draft(page)).investigation.evidence).toEqual(
    state.investigation.evidence,
  );
  expect(data.progressRows).toEqual(before);
});

test("manual reading, mute, hidden-tab pause and caption fallback preserve the current beat", async ({
  page,
}) => {
  await dessertSetup(page);
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await root(page)
    .getByLabel("Story progression", { exact: true })
    .selectOption("manual");
  await dessertBeat(page);
  await expect(root(page)).toHaveAttribute("data-node", "n01");
  await root(page).getByRole("button", { name: "Next", exact: true }).click();
  await expect(root(page).locator("audio")).toHaveAttribute(
    "data-dialogue-id",
    "CH01_SC02_001_MARIAM",
  );
  await root(page).getByRole("button", { name: "Mute", exact: true }).click();
  await expect(root(page).locator("audio")).toHaveJSProperty("muted", true);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    root(page).getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await dessertBeat(page);
  await expect(root(page).locator("audio")).toHaveAttribute(
    "data-dialogue-id",
    "CH01_SC02_001_MARIAM",
  );
});
for (const width of [1440, 820, 390])
  test(`laboratory and fullscreen fit ${width}px with exact scientific readings`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await dessertAt(page, "conductivity");
    await noOverflow(page);
    await root(page)
      .getByRole("button", { name: "Full screen", exact: true })
      .click();
    await noOverflow(page);
    await root(page)
      .getByRole("button", { name: /^Sample B/ })
      .click();
    await root(page)
      .getByRole("button", { name: "Measure conductivity", exact: true })
      .click();
    await expect(root(page).locator(".px-dessert-meter")).toContainText("1100");
    await dessertReach(page, "conductivity");
    await shot(page, `laboratory-${width}`);
    await root(page)
      .getByRole("button", { name: "Exit full screen", exact: true })
      .click();
  });

test("old scientific drafts restore genuine observations without silently completing missing tests", async ({
  page,
}) => {
  const state = dessertCheckpoint("ph"),
    record = dessertDraft(state, ID);
  delete record.answers.dessertStory;
  await dessertSetup(page, { seedRows: [record] });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await dessertReach(page, "ph");
  const d = await draft(page);
  expect(d.investigation.evidence).toEqual(state.investigation.evidence);
  expect(d.investigation.identified).toBe(false);
});

test("teacher scene inspection is zero-write", async ({ page }) => {
  const data = await dessertSetup(page, { teacher: true });
  await page.goto(DESSERT_TARGET + "&preview=true");
  await dessertStart(page);
  await root(page)
    .getByLabel("Teacher scene preview", { exact: true })
    .selectOption("n19");
  await dessertReach(page, "identity");
  expect(data.writes).toHaveLength(0);
});

test("a legacy MgO draft presents the required NaCl formation model without granting transferred-electron credit", async ({
  page,
}) => {
  const state = dessertCheckpoint("electron");
  state.investigation.electron = { kind: "MgO", transferred: 2 };
  const record = dessertDraft(state, ID);
  delete record.answers.dessertStory;
  await dessertSetup(page, { seedRows: [record] });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await dessertReach(page, "electron");
  await expect(root(page).getByRole("combobox").first()).toHaveValue("NaCl");
  await expect(root(page).getByRole("status").first()).toContainText(
    "0 of 1 valence electrons transferred",
  );
  expect((await draft(page)).investigation.electron).toEqual({
    kind: "MgO",
    transferred: 2,
  });
  await root(page)
    .getByRole("button", { name: "Transfer one electron", exact: true })
    .click();
  await dessertReach(page, "ph");
  expect((await draft(page)).investigation.electron).toEqual({
    kind: "NaCl",
    transferred: 1,
  });
});

test("initial loading requests only the current and next recordings, not all 217 audio files or future endings", async ({
  page,
}) => {
  const urls = [];
  page.on("request", (r) => {
    if (r.url().includes("/cinematic/")) urls.push(r.url());
  });
  await dessertSetup(page);
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  await expect(root(page).locator("audio")).toHaveAttribute(
    "data-dialogue-id",
    "CH01_SC01_002_NARRATOR",
  );
  expect(
    new Set(urls.filter((u) => u.includes(".mp3"))).size,
  ).toBeLessThanOrEqual(2);
  expect(urls.some((u) => u.includes("V03_") || u.includes("CH04_END_"))).toBe(
    false,
  );
});
