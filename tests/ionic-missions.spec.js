import { test, expect } from "@playwright/test";
import { setup, noOverflow, ID, OTHER, HISTORY } from "./support/fixtures";
import { IONIC_SCENARIOS } from "../src/data/ionicMissions.mjs";
import { mkdirSync } from "node:fs";
import {
  oceanTask,
  oceanBriefing,
  oceanStartInvestigation,
} from "./support/ocean-flow";
const D = "ionic_dessert_mystery",
  A = "ionic_aquarium_mystery";
const snapshotDir = "docs/ionic-materials/screenshots";
const priorPass = {
  id: "dessert-pass",
  student_id: ID,
  scenario_id: D,
  score: 80,
  completed_at: "2026-10-10T10:00:00Z",
  answers: { exitTicket: { score: 80, passed: true } },
};
test("new teacher locks override a saved prerequisite and students cannot enable preview", async ({
  page,
}) => {
  const state = await setup(page, {
    seedRows: [priorPass],
    settingsRows: [{ scenario_id: A, is_locked: true }],
  });
  await page.goto(`/ScenarioPlayer?scenario=${A}&preview=true`);
  await expect(
    page.getByRole("heading", { name: "Mission unavailable" }),
  ).toBeVisible();
  expect(state.writes).toHaveLength(0);
});

test("new missions use the existing teacher controls and teaching guide", async ({
  page,
}) => {
  const state = await setup(page, { teacher: true, empty: true });
  await page.goto("/TeacherDashboard");
  await page.getByRole("tab", { name: "Missions", exact: true }).click();
  await page
    .getByLabel("Find a mission", { exact: true })
    .fill("Final Dessert");
  await page
    .getByRole("button", { name: "Teaching guide", exact: true })
    .click();
  await expect(
    page.getByText("Chapter 3 · Ion Formation, Ionic Bonding & Conductivity", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Tasting is not an acceptable identification test/),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: `Lock ${IONIC_SCENARIOS[D].title}`,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: `Unlock ${IONIC_SCENARIOS[D].title}`,
      exact: true,
    }),
  ).toBeVisible();
  expect(
    state.writes.some(
      (w) =>
        w.type === "scenario_settings" &&
        w.body.scenario_id === D &&
        w.body.is_locked === true,
    ),
  ).toBe(true);
  const level = page
    .locator("select")
    .filter({ has: page.locator('option[value="high-achievers"]') });
  await level.selectOption("high-achievers");
  await expect
    .poll(() =>
      state.writes.some(
        (w) =>
          w.type === "scenario_settings" &&
          w.body.difficulty_override === "high-achievers",
      ),
    )
    .toBe(true);
});
test("teachers can review new investigation evidence and individual MCQ results", async ({
  page,
}) => {
  const questions = IONIC_SCENARIOS[D].exitTicket.mcqs;
  await setup(page, {
    teacher: true,
    seedRows: [
      {
        ...priorPass,
        student_id: OTHER,
        answers: {
          investigation: {
            evidence: [
              { id: "B-pH", label: "Sample B · pH", observation: "pH 8.3" },
            ],
          },
          exitTicket: {
            score: 80,
            passed: true,
            mcq_answers: questions.map((q, i) => ({
              questionId: i,
              option: q.options.find((o) => (i === 0 ? !o.correct : o.correct))
                .id,
              isCorrect: i > 0,
            })),
          },
        },
      },
    ],
  });
  await page.goto("/TeacherDashboard");
  await page.getByRole("tab", { name: "Students", exact: true }).click();
  await page
    .locator(".px-teacher-tools")
    .getByText("Synthetic Peer", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "View Answers", exact: true })
    .first()
    .click();
  await page.getByRole("dialog").locator("summary").first().click();
  await expect(
    page.getByRole("dialog").getByRole("heading", {
      name: "Interactive investigation evidence",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Sample B · pH: pH 8.3");
  await expect(page.getByRole("dialog")).toContainText(
    "Question 1: A · Needs review",
  );
});
async function openMission(page, id) {
  await page.goto(`/ScenarioPlayer?scenario=${id}`);
  await expect(page.locator(".im-cinema")).toBeVisible();
  if (id === A) {
    await oceanBriefing(page);
    await oceanStartInvestigation(page);
    return;
  }
  await expect(page.locator(".im-hamad")).toHaveAttribute(
    "src",
    "/images/ionic/hamad-al-zaabi.webp",
  );
  await expect(page.locator(".xp-chapters li")).toHaveCount(5);
  await expect(page.locator(".im-mission video")).toHaveCount(0);
  await page.getByRole("button", { name: "Accept assignment" }).click();
}
async function dessertInvestigation(page) {
  await page
    .getByRole("button", { name: "Calibrate with water-only control" })
    .click();
  for (const s of ["A", "B", "C"]) {
    await page
      .getByRole("button", { name: `Sample ${s}`, exact: true })
      .click();
    for (const label of [
      "Measure conductivity",
      "Measure pH",
      "Run isolated acid test",
    ])
      await page.getByRole("button", { name: label, exact: true }).click();
  }
  await page.getByRole("button", { name: "Transfer one electron" }).click();
  for (const [s, v] of [
    ["A", "sugar"],
    ["B", "hydrogen-carbonate"],
    ["C", "sodium-chloride"],
  ])
    await page.getByLabel(`Proposed identity for Sample ${s}`).selectOption(v);
  await expect(
    page.getByText("Your identification is supported.", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Submit identification", exact: true })
    .click();
  await expect(
    page.getByText("Your identification is supported.", { exact: true }),
  ).toBeVisible();
}
async function aquariumInvestigation(page) {
  for (const name of [
    "Run calcium screening",
    "Test water solubility",
    "Run isolated carbonate test",
    "Compare mineral fingerprint",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    if (name === "Run isolated carbonate test") {
      await oceanTask(page, "reaction");
      await page
        .getByRole("button", {
          name: "It supports carbonate evidence, to compare with other tests",
          exact: true,
        })
        .click();
    }
    await oceanTask(page);
  }
  const formula = page.getByRole("region", { name: "Ionic formula builder" });
  // Touch and keyboard use the same ion-selection operation as native drag-and-drop.
  await formula
    .getByRole("button", { name: "Choose carbonate ion", exact: true })
    .click();
  await formula
    .getByRole("button", { name: "Check charge balance", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "neutral formula CaCO3",
  );
  await oceanTask(page, "crystal");
  const crystal = page.getByRole("region", {
    name: "360 degree ionic crystal explorer",
  });
  const atom = crystal.locator("circle[data-kind=Na]").first(),
    x = await atom.getAttribute("cx");
  await crystal
    .getByRole("button", { name: "Rotate 90°", exact: true })
    .click();
  expect(await atom.getAttribute("cx")).not.toBe(x);
  await crystal
    .getByRole("button", { name: "Show coordination", exact: true })
    .click();
  await expect(crystal.getByRole("status")).toContainText(
    "Six nearest opposite-charge",
  );
  await crystal
    .getByRole("button", { name: "Apply shear to NaCl model", exact: true })
    .click();
  await expect(crystal.getByRole("status")).toContainText("Like charges");
  await crystal.getByLabel("Structure reference").selectOption("calcite");
  await crystal
    .getByRole("button", { name: "Show coordination", exact: true })
    .click();
  await expect(crystal.getByRole("status")).toContainText(
    "Six oxygen neighbours",
  );
  await page
    .getByRole("button", { name: "Record crystal comparison →", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText("ions are fixed");
  await oceanTask(page, "water");
  await page
    .getByRole("button", { name: "Run virtual water test", exact: true })
    .click();
  const water = page.getByRole("region", { name: "Water chemistry simulator" });
  await expect(water.locator(".im-reading")).toContainText(
    "High precipitation tendency",
  );
  await page
    .getByRole("button", { name: "Load starting reference", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Run virtual water test", exact: true })
    .click();
  await expect(water.locator(".im-reading")).toContainText(
    "Lower precipitation tendency",
  );
  mkdirSync("docs/ocean-dome/screenshots", { recursive: true });
  await page.locator(".od-novel").screenshot({
    path: `docs/ocean-dome/screenshots/05-water-${page.viewportSize().width}.png`,
  });
  await page
    .getByRole("button", {
      name: "Record water-chemistry trends →",
      exact: true,
    })
    .click();
  await oceanTask(page, "identification");
  await page
    .getByLabel("Proposed deposit identity")
    .selectOption("calcium-carbonate");
  await page
    .getByRole("button", { name: "Submit identification", exact: true })
    .click();
  await expect(page.locator(".od-caption")).toContainText(
    "combined evidence supports",
  );
  await page
    .getByRole("button", { name: "Next dialogue →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Next dialogue →", exact: true })
    .click();
}
async function decisionAndReflection(page, id, choice, teacher = false) {
  await page.getByRole("button", { name: "Continue to Make the Call" }).click();
  if (id === A) await oceanTask(page, "professional-decision");
  const s = IONIC_SCENARIOS[id],
    selected = s.scenes[1].options.find((o) => o.id === choice);
  await expect(page.locator(".im-feedback")).toHaveCount(0);
  await page
    .getByRole("radio")
    .nth(s.scenes[1].options.indexOf(selected))
    .check();
  if (!teacher)
    await expect(
      page.getByRole("button", { name: "Commit my decision" }),
    ).toBeDisabled();
  await page.locator(".im-citations input").nth(0).check();
  await page.locator(".im-citations input").nth(1).check();
  await page
    .getByLabel("Your evidence-based justification")
    .fill(
      "The independent test observations support my recommendation. I will retain the evidence and ask qualified staff to verify the remaining uncertainty.",
    );
  await page.getByRole("button", { name: "Commit my decision" }).click();
  if (id === A) await oceanTask(page, "reflection");
  await expect(page.locator(".im-outcome")).toContainText(
    s.scenes[2].consequences[selected.consequence].outcome,
  );
  await page
    .getByLabel(
      "What did the consequence teach you about your evidence and decision?",
    )
    .fill(
      "Independent evidence is stronger than appearance alone. I would retain the measurements and verify uncertainty before changing the system.",
    );
  await page
    .getByRole("button", { name: "Continue to Prove Your Expertise" })
    .click();
}
async function assess(page, id, wrong = 0) {
  if (id === A) await oceanTask(page, "expertise");
  const questions = IONIC_SCENARIOS[id].exitTicket.mcqs;
  await expect(page.locator(".im-feedback")).toHaveCount(0);
  for (const [i, q] of questions.entries()) {
    const answer = q.options.find((o) => (i < wrong ? !o.correct : o.correct));
    await page.getByRole("radio", { name: answer.text, exact: true }).check();
  }
  await expect(
    page.getByText("Supported answer:", { exact: false }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Submit final assessment", exact: true })
    .click();
  await expect(page.locator(".im-feedback")).toHaveCount(5);
  if (id === A && wrong < 2)
    await page
      .getByRole("button", { name: "Next dialogue →", exact: true })
      .click();
  await page
    .getByRole("button", {
      name: wrong < 2 ? "Complete Mission" : "Save result and review",
      exact: true,
    })
    .click();
  await expect(page.locator(".xp-completion")).toBeVisible();
}
test("both complete missions persist notebook, 80%/100% assessments and sequential unlock without altering earlier work", async ({
  page,
}) => {
  test.setTimeout(90000);
  const state = await setup(page);
  const original = structuredClone(state.progressRows);
  await page.goto(`/RoleHub?role=ionic_materials_specialist`);
  await expect(page.locator(".xp-mission-card").nth(1)).toContainText(
    "Pass the previous missions to unlock",
  );
  mkdirSync(snapshotDir, { recursive: true });
  await page.screenshot({
    path: `${snapshotDir}/role-journey-desktop.png`,
    fullPage: true,
  });
  await openMission(page, D);
  await dessertInvestigation(page);
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Sample B · pH: pH 8.3");
  await expect(page.getByRole("dialog")).toContainText(
    "Sample B: hydrogen carbonate",
  );
  await page.getByLabel("Close notebook").click();
  await decisionAndReflection(page, D, "A");
  await assess(page, D, 1);
  await expect(
    page
      .locator(".xp-completion")
      .getByText("Assessment result saved to your account", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".xp-earned-badge")).toContainText(
    "Ionic Evidence Investigator",
  );
  await page.screenshot({
    path: `${snapshotDir}/dessert-completion-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Next available mission" }).click();
  await expect(page.locator(".im-cinema")).toBeVisible();
  await oceanBriefing(page);
  await oceanStartInvestigation(page);
  await aquariumInvestigation(page);
  await decisionAndReflection(page, A, "B");
  await assess(page, A);
  await expect(
    page
      .locator(".xp-completion")
      .getByText("Assessment result saved to your account", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".xp-earned-badge")).toContainText(
    "Marine Mineral Analyst",
  );
  await page.screenshot({
    path: `${snapshotDir}/aquarium-completion-desktop.png`,
    fullPage: true,
  });
  expect(state.progressRows.slice(0, original.length)).toEqual(original);
  for (const [id, score] of [
    [D, 80],
    [A, 100],
  ]) {
    const row = state.progressRows.find(
      (r) => r.scenario_id === id && r.score === score,
    );
    expect(row.answers.investigation.evidence.length).toBeGreaterThan(6);
    expect(row.answers.exitTicket.answers).toHaveLength(5);
    expect(row.answers.reflection).toContain("Independent evidence");
    expect(row.student_id).toBe(ID);
  }
});
test("draft evidence restores mid-investigation, including personal notebook notes", async ({
  page,
}) => {
  await setup(page, { empty: true });
  await openMission(page, D);
  await page
    .getByRole("button", { name: "Calibrate with water-only control" })
    .click();
  await page
    .getByRole("button", { name: "Measure conductivity", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await page
    .getByLabel("1. Scientific evidence — personal notes")
    .fill("My control must be compared with each unknown.");
  await page
    .getByRole("button", { name: "Save notebook now", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Notebook and responses saved to your account",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Control recorded", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".im-evidence-ledger")).toContainText("4 μS/cm");
  await page
    .getByRole("button", { name: "Mission Notebook", exact: true })
    .click();
  await expect(
    page.getByLabel("1. Scientific evidence — personal notes"),
  ).toHaveValue("My control must be compared with each unknown.");
});
test("60% earns no badge or next mission; unsupported decision shows its own consequence", async ({
  page,
}) => {
  test.setTimeout(60000);
  await setup(page, { empty: true });
  await openMission(page, D);
  await dessertInvestigation(page);
  await decisionAndReflection(page, D, "C");
  await assess(page, D, 2);
  await expect(page.locator(".xp-completion")).toContainText("60%");
  await expect(page.locator(".xp-earned-badge")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Next available mission" }),
  ).toHaveCount(0);
  await page.goto(`/ScenarioPlayer?scenario=${A}`);
  await expect(
    page.getByRole("heading", { name: "Mission unavailable" }),
  ).toBeVisible();
});
test("failed saves cannot unlock the second mission; teacher locks and preview permissions remain enforced", async ({
  page,
}) => {
  test.setTimeout(60000);
  const state = await setup(page, { empty: true, failWrites: true });
  await openMission(page, D);
  await dessertInvestigation(page);
  await decisionAndReflection(page, D, "A");
  await assess(page, D);
  await expect(
    page.getByRole("button", { name: "Retry saving result", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next available mission" }),
  ).toHaveCount(0);
  expect(state.progressRows).toHaveLength(0);
  await page.goto(`/ScenarioPlayer?scenario=${A}&preview=true`);
  await expect(
    page.getByRole("heading", { name: "Mission unavailable" }),
  ).toBeVisible();
});
test("teacher dashboard includes both missions and preview creates no student records", async ({
  page,
}) => {
  test.setTimeout(60000);
  const state = await setup(page, { teacher: true, empty: true });
  await page.goto("/TeacherDashboard");
  await page.getByRole("tab", { name: /Missions/ }).click();
  for (const s of Object.values(IONIC_SCENARIOS))
    await expect(page.getByText(s.title, { exact: true })).toBeVisible();
  await openMission(page, A);
  await aquariumInvestigation(page);
  await decisionAndReflection(page, A, "D", true);
  await assess(page, A);
  await expect(page.locator(".xp-completion")).toContainText("Teacher preview");
  expect(
    state.writes.filter((w) => w.type === "student_progress"),
  ).toHaveLength(0);
});
for (const viewport of [
  { width: 1440, height: 960 },
  { width: 820, height: 1180 },
  { width: 390, height: 844 },
]) {
  test(`cinematic briefing and interactive models are accessible without horizontal overflow at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await setup(page, { seedRows: [...HISTORY, priorPass] });
    mkdirSync(snapshotDir, { recursive: true });
    for (const id of [D, A]) {
      await page.goto(`/ScenarioPlayer?scenario=${id}`);
      await expect(page.locator(".im-cinema")).toBeVisible();
      await noOverflow(page);
      const portrait = page.locator(id === A ? ".od-art" : ".im-hamad");
      expect(
        await portrait.evaluate((img) => img.complete && img.naturalWidth > 0),
      ).toBe(true);
      await page.screenshot({
        path: `${snapshotDir}/${id}-briefing-${viewport.width}.png`,
        fullPage: true,
      });
      if (id === A) {
        await oceanBriefing(page);
        await oceanStartInvestigation(page);
      } else
        await page.getByRole("button", { name: "Accept assignment" }).click();
      await expect(page.locator(".im-investigation")).toBeVisible();
      await noOverflow(page);
      if (id === A) {
        await page
          .getByText("Candidate reference library", { exact: true })
          .click();
        const contrast = await page
          .locator(".im-instrument table td")
          .first()
          .evaluate((cell) => {
            const colour = getComputedStyle(cell)
              .color.match(/[\d.]+/g)
              .slice(0, 3)
              .map(Number);
            let parent = cell,
              background;
            while (parent) {
              const candidate = getComputedStyle(parent).backgroundColor;
              if (
                candidate !== "rgba(0, 0, 0, 0)" &&
                candidate !== "transparent"
              ) {
                background = candidate
                  .match(/[\d.]+/g)
                  .slice(0, 3)
                  .map(Number);
                break;
              }
              parent = parent.parentElement;
            }
            const luminance = (c) =>
              c
                .map((v) => v / 255)
                .map((v) =>
                  v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
                )
                .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
            const a = luminance(colour),
              b = luminance(background);
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          });
        expect(contrast).toBeGreaterThanOrEqual(4.5);

        await aquariumInvestigation(page);
      }
      await page.screenshot({
        path: `${snapshotDir}/${id}-investigation-${viewport.width}.png`,
        fullPage: true,
      });
      await noOverflow(page);
    }
  });
}
