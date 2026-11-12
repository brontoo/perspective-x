import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { setup } from "./support/fixtures";
import {
  dessertStart,
  dessertRoot as root,
  dessertDecide,
  DESSERT_TARGET,
} from "./support/dessert-flow";
import { dessertScenario } from "./support/dessert-checkpoints.mjs";
import { isDessertLineActive } from "../src/data/dessertEditorial.mjs";

test("complete shortened successful route plays native recordings at 1x and measures actual elapsed time", async ({
  page,
}) => {
  test.skip(
    process.env.DESSERT_NATIVE_WALKTHROUGH !== "1",
    "Opt-in release walkthrough: approximately ten minutes of native recorded speech.",
  );
  test.setTimeout(16 * 60 * 1000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const fixture = await setup(page, { empty: true });
  await page.addInitScript(() => {
    window.__dessertNativeEvents = [];
    for (const type of ["playing", "ended"])
      document.addEventListener(
        type,
        (event) => {
          const el = event.target;
          if (
            !(el instanceof HTMLMediaElement) ||
            !el.closest(".px-dessert[data-node]")
          )
            return;
          window.__dessertNativeEvents.push({
            type,
            tag: el.tagName,
            id: el.dataset.dialogueId || null,
            src: el.getAttribute("src"),
            instance: el.dataset.playbackInstance || null,
            time: performance.now(),
            duration: el.duration,
            rate: el.playbackRate,
          });
        },
        true,
      );
  });
  await page.goto(DESSERT_TARGET);
  expect(
    await page.evaluate(() => HTMLMediaElement.prototype.play.toString()),
  ).toContain("[native code]");
  const began = Date.now();
  await dessertStart(page);
  const samples = { n14: [], n17: [], n18: [] };
  let previous = "";
  let observed = false;
  while (Date.now() - began < 14 * 60 * 1000) {
    if (!(await root(page).count())) break;
    const node = await root(page).getAttribute("data-node");
    if (node !== previous) {
      console.log(
        "Native walkthrough:",
        node,
        Math.round((Date.now() - began) / 1000) + "s",
      );
      previous = node;
    }
    if (
      (await root(page).getAttribute("data-ready")) === "true" &&
      (await root(page).getAttribute("data-feedback")) === "false"
    ) {
      observed = true;
      if (node === "first")
        await root(page)
          .getByRole("button", { name: /Use controlled scientific/ })
          .click();
      else if (node === "n12")
        await root(page)
          .getByRole("button", {
            name: "Calibrate with water-only control",
            exact: true,
          })
          .click();
      else if (node === "n13")
        await root(page)
          .getByRole("button", { name: "Measure conductivity", exact: true })
          .click();
      else if (["n14", "n17", "n18"].includes(node)) {
        const wanted = node === "n14" ? ["B", "C"] : ["A", "B", "C"];
        const sample = wanted.find((x) => !samples[node].includes(x));
        if (sample) {
          await root(page)
            .getByRole("button", { name: new RegExp(`^Sample ${sample}`) })
            .click();
          await root(page)
            .getByRole("button", {
              name:
                node === "n17"
                  ? "Measure pH"
                  : node === "n18"
                    ? "Run controlled virtual acid test"
                    : "Measure conductivity",
              exact: true,
            })
            .click();
          samples[node].push(sample);
        } else if (node === "n14") {
          await root(page)
            .getByRole("checkbox", { name: /Conductivity provides evidence/ })
            .check();
          await root(page)
            .getByRole("button", {
              name: "Record conductivity findings",
              exact: true,
            })
            .click();
        } else
          throw new Error(
            "Native walkthrough stalled at completed station " + node,
          );
      } else if (node === "n15")
        await root(page)
          .getByRole("button", { name: "Transfer one electron", exact: true })
          .click();
      else if (node === "n19") {
        for (const [sample, identity] of Object.entries({
          A: "sugar",
          B: "hydrogen-carbonate",
          C: "sodium-chloride",
        }))
          await root(page)
            .getByLabel(`Identity of Sample ${sample}`, { exact: true })
            .selectOption(identity);
        await root(page)
          .getByRole("button", {
            name: "Check all three identifications",
            exact: true,
          })
          .click();
      } else if (node === "n22") await dessertDecide(page, "A");
      else if (node === "n27") {
        await root(page)
          .getByLabel(
            "What did the consequence teach you about your evidence and decision?",
            { exact: true },
          )
          .fill(
            "I used the independent conductivity, pH and reaction evidence to support the identities. I would preserve the results and replace unlabelled containers with verified ingredients.",
          );
        await root(page)
          .getByRole("button", { name: "Save reflection", exact: true })
          .click();
      } else if (node.startsWith("question")) {
        const q = dessertScenario.exitTicket.mcqs[Number(node.slice(8)) - 1];
        await root(page)
          .getByRole("radio", {
            name: q.options.find((x) => x.correct).text,
            exact: true,
          })
          .check();
        await root(page)
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
      } else if (node === "assessment-submit")
        await root(page)
          .getByRole("button", { name: "Submit final assessment", exact: true })
          .click();
      else throw new Error("Unexpected native task " + node);
    }
    await page.waitForTimeout(150);
  }
  await expect(page.locator(".px-dessert-completed-review")).toBeVisible();
  const elapsedSeconds = (Date.now() - began) / 1000;
  const events = await page.evaluate(() => window.__dessertNativeEvents);
  const ended = events.filter((e) => e.tag === "AUDIO" && e.type === "ended");
  const records = ended.map((e) => e.id);
  expect(records).toHaveLength(76);
  expect(records.every(isDessertLineActive)).toBe(true);
  expect(ended.every((e) => e.rate === 1)).toBe(true);
  expect(observed).toBe(true);
  expect(records.some((id) => id.includes("SC21"))).toBe(false);
  const movies = events.filter((e) => e.tag === "VIDEO" && e.type === "ended");
  expect(movies).toHaveLength(3);
  expect(movies.every((e) => e.rate === 1)).toBe(true);
  const result = fixture.progressRows.filter(
    (r) => r.scenario_id === "ionic_dessert_mystery" && r.score === 100,
  );
  expect(result).toHaveLength(1);
  expect(
    result[0].answers.investigation.evidence.filter((e) =>
      /^[ABC]-/.test(e.id),
    ),
  ).toHaveLength(9);
  expect(elapsedSeconds).toBeGreaterThan(560);
  const report = {
    environment: "Local production build; Chromium; synthetic student",
    voiceSpeed: 1,
    elapsedSeconds,
    recordedSpeechSeconds: 571.899,
    videoMode: "Original muted MP4s, played concurrently at 1x",
    mandatoryFixedTransitionSeconds: 0,
    studentInteraction:
      "Required activities were operated by the browser test, not auto-completed by narration; elapsed time includes that automation and local buffering, not realistic student thinking time.",
    completedAudioCount: ended.length,
    clipIds: records,
    videoEndEvents: movies,
    resultScore: 100,
    assessedRows: result.length,
    events,
  };
  fs.mkdirSync("docs/dessert/editorial", { recursive: true });
  fs.writeFileSync(
    "docs/dessert/editorial/native-walkthrough.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  await page
    .locator(".px-dessert-completed-review")
    .screenshot({
      path: "docs/dessert/screenshots/editorial-native-completion.png",
    });
  console.log(
    "Native successful route completed in",
    elapsedSeconds,
    "seconds at 1x.",
  );
});
