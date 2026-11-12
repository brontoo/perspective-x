import { expect } from "@playwright/test";
import { setup, ID } from "./fixtures";
import {
  dessertCheckpoint,
  dessertDraft,
  dessertScenario,
} from "./dessert-checkpoints.mjs";
export const DESSERT_TARGET = "/ScenarioPlayer?scenario=ionic_dessert_mystery";
export const dessertRoot = (page) => page.locator(".px-dessert[data-node]");
const paint = (page) =>
  page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
export async function installDessertPlayback(page) {
  await page.addInitScript(() => {
    window.__dessertPlayback = [];
    const play = HTMLMediaElement.prototype.play,
      pause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function () {
      if (
        this.classList.contains("px-dessert-voice") ||
        this.classList.contains("px-atom-review-audio") ||
        (this.tagName === "VIDEO" &&
          this.getAttribute("src")?.includes("ionic_dessert_mystery"))
      ) {
        window.__dessertPlayback.push({
          op: "play",
          id: this.dataset.dialogueId,
          src: this.getAttribute("src"),
        });
        this.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      }
      return play.call(this);
    };
    HTMLMediaElement.prototype.pause = function () {
      if (this.classList.contains("px-dessert-voice"))
        window.__dessertPlayback.push({
          op: "pause",
          id: this.dataset.dialogueId,
        });
      return pause.call(this);
    };
  });
}
export async function dessertSetup(page, options = {}) {
  await installDessertPlayback(page);
  return setup(page, { empty: true, ...options });
}
export async function dessertStart(page) {
  await expect(dessertRoot(page)).toBeVisible();
  const button = dessertRoot(page).getByRole("button", {
    name: /^(Start Experience|Resume Experience)$/,
  });
  if (await button.count()) await button.click();
  await paint(page);
}
export async function dessertBeat(page) {
  await paint(page);
  await page.evaluate(() => {
    const r = document.querySelector(".px-dessert[data-node]");
    r?.querySelector("video")?.dispatchEvent(new Event("ended"));
    r?.querySelector(".px-dessert-voice")?.dispatchEvent(new Event("ended"));
  });
  await paint(page);
}

const tasks = {
  first: "first",
  calibrate: "n12",
  "sample-a": "n13",
  conductivity: "n14",
  electron: "n15",
  ph: "n17",
  acid: "n18",
  identity: "n19",
  decision: "n22",
  reflection: "n27",
  question: "question1",
  assessment: "assessment-submit",
};
export async function dessertReach(page, target, ready = true) {
  const wanted = tasks[target] || target;
  for (let i = 0; i < 260; i++) {
    const root = dessertRoot(page);
    if (!(await root.count()))
      throw new Error("Mission ended before " + wanted);
    const node = await root.getAttribute("data-node");
    if (
      node === wanted &&
      (!ready ||
        ((await root.getAttribute("data-ready")) === "true" &&
          (await root.getAttribute("data-feedback")) === "false"))
    )
      return;
    if (
      (await root.getAttribute("data-ready")) === "true" &&
      (await root.getAttribute("data-feedback")) === "false"
    )
      throw new Error(`Unanswered ${node} before ${wanted}`);
    await dessertBeat(page);
  }
  throw new Error("No checkpoint " + wanted);
}
export async function dessertAt(page, target, options = {}, mutate) {
  const state = dessertCheckpoint(target, options.choice || "A");
  mutate?.(state);
  const data = await dessertSetup(page, {
    seedRows: [dessertDraft(state, ID)],
    ...options,
  });
  await page.goto(DESSERT_TARGET);
  await dessertStart(page);
  return { state, data };
}
export async function dessertInvestigate(page, { capture = false } = {}) {
  await dessertReach(page, "calibrate");
  await dessertRoot(page)
    .getByRole("button", {
      name: "Calibrate with water-only control",
      exact: true,
    })
    .click();
  await dessertReach(page, "sample-a");
  await dessertRoot(page)
    .getByRole("button", { name: "Measure conductivity", exact: true })
    .click();
  await dessertReach(page, "conductivity");
  for (const sample of ["B", "C"]) {
    await dessertRoot(page)
      .getByRole("button", { name: new RegExp(`^Sample ${sample}`) })
      .click();
    await dessertRoot(page)
      .getByRole("button", { name: "Measure conductivity", exact: true })
      .click();
    await dessertReach(page, "conductivity");
  }
  await dessertRoot(page)
    .getByRole("checkbox", { name: /Conductivity provides evidence/ })
    .check();
  await dessertRoot(page)
    .getByRole("button", { name: "Record conductivity findings", exact: true })
    .click();
  await dessertReach(page, "electron");
  await dessertRoot(page)
    .getByRole("button", { name: "Transfer one electron", exact: true })
    .click();
  if (capture)
    await dessertRoot(page).screenshot({
      path: "docs/dessert/screenshots/electron-formation.png",
    });
  await dessertReach(page, "ph");
  for (const [i, sample] of ["A", "B", "C"].entries()) {
    await dessertRoot(page)
      .getByRole("button", { name: new RegExp(`^Sample ${sample}`) })
      .click();
    await dessertRoot(page)
      .getByRole("button", { name: "Measure pH", exact: true })
      .click();
    if (capture && sample === "B")
      await dessertRoot(page).screenshot({
        path: "docs/dessert/screenshots/ph-investigation.png",
      });
    if (i < 2) await dessertReach(page, "ph");
  }
  await dessertReach(page, "acid");
  for (const [i, sample] of ["A", "B", "C"].entries()) {
    await dessertRoot(page)
      .getByRole("button", { name: new RegExp(`^Sample ${sample}`) })
      .click();
    await dessertRoot(page)
      .getByRole("button", {
        name: "Run controlled virtual acid test",
        exact: true,
      })
      .click();
    if (capture && sample === "B")
      await dessertRoot(page).screenshot({
        path: "docs/dessert/screenshots/controlled-acid-reaction.png",
      });
    if (i < 2) await dessertReach(page, "acid");
  }
  await dessertReach(page, "identity");
  for (const [sample, identity] of Object.entries({
    A: "sugar",
    B: "hydrogen-carbonate",
    C: "sodium-chloride",
  }))
    await dessertRoot(page)
      .getByLabel(`Identity of Sample ${sample}`, { exact: true })
      .selectOption(identity);
  await dessertRoot(page)
    .getByRole("button", {
      name: "Check all three identifications",
      exact: true,
    })
    .click();
  await dessertReach(page, "decision");
}
export async function dessertDecide(page, choice = "A") {
  const root = dessertRoot(page);
  await root
    .locator(`input[name="dessert-decision"]`)
    .nth(["A", "B", "C", "D"].indexOf(choice))
    .check();
  await root
    .getByLabel("Your evidence-based justification", { exact: true })
    .fill(
      "Independent observations support the sample identities, but do not establish provenance, food grade or absence of contamination. Isolate the original jars and use sealed traceable replacements.",
    );
  const citations = root.locator(".px-dessert-citations input");
  await citations.nth(0).check();
  await citations.nth(1).check();
  await root
    .getByRole("button", { name: "Commit my decision", exact: true })
    .click();
}
export async function dessertReflection(page) {
  await dessertReach(page, "reflection");
  await dessertRoot(page)
    .getByLabel(
      "What did the consequence teach you about your evidence and decision?",
      { exact: true },
    )
    .fill(
      "I would preserve the independent measurements, isolate the original containers and obtain traceable food-grade replacements. Identity does not prove safety.",
    );
  await dessertRoot(page)
    .getByRole("button", { name: "Save reflection", exact: true })
    .click();
}
export async function dessertAnswers(page, wrong = 0) {
  for (const [i, q] of dessertScenario.exitTicket.mcqs.entries()) {
    await dessertReach(page, `question${i + 1}`);
    const answer = q.options.find((o) => (i < wrong ? !o.correct : o.correct));
    await dessertRoot(page)
      .getByRole("radio", { name: answer.text, exact: true })
      .check();
    await dessertRoot(page)
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await dessertReach(page, "assessment");
}
export async function dessertFinish(page) {
  for (let i = 0; i < 50; i++) {
    if (!(await dessertRoot(page).count())) break;
    await dessertBeat(page);
  }
  await expect(page.locator(".xp-completion")).toBeVisible();
}
