import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { ATOM_MEDIA, createAtomState } from "../src/data/atomDive.mjs";
import { atomSetup, atomStart, atomContinue, atomReach, atomMetal, atomIonic, atomCompare } from "./support/atom-flow";
import { action, checkpoint, draftFor } from "./support/atom-checkpoints.mjs";
import { setup, ID, OTHER, noOverflow } from "./support/fixtures";
const target = "/ScenarioPlayer?scenario=atom_dive";
for (const first of ["metallic", "ionic"]) {
  test(`complete authored ${first}-first route, reflection, 80% assessment and immutable saved result`, async ({ page }) => {
    test.setTimeout(90000);
    const data = await atomSetup(page);
    await page.goto(target);
    await atomReach(page, "order");
    await page.getByRole("button", { name: new RegExp(`^${first === "metallic" ? "Metallic" : "Ionic"} world first`) }).click();
    if (first === "metallic") { await atomMetal(page); await atomIonic(page); }
    else { await atomIonic(page); await atomMetal(page); }
    await atomReach(page, "comparisonTask");
    await expect(page.getByText("2/2 investigations verified", { exact: true })).toBeVisible();
    mkdirSync("docs/atom-dive/screenshots", { recursive: true });
    await page.locator(".ad-adventure").screenshot({ path: `docs/atom-dive/screenshots/comparison-${first}.png` });
    await atomCompare(page);
    await atomReach(page, "reflection");
    await page.getByLabel("One difference in how the bonds form", { exact: true }).fill("Metal valence electrons delocalize; forming these ions involves electron transfer.");
    await page.getByLabel("One difference in what holds the structures together", { exact: true }).fill("Positive metal cores attract delocalized electrons, while opposite ions attract in the ionic lattice.");
    await page.getByRole("button", { name: "Save reflection and continue", exact: true }).click();
    await atomReach(page, "assessment");
    await expect(page.getByText("Supported answer:", { exact: false })).toHaveCount(0);
    for (const [index, q] of ATOM_MEDIA.assessment.questions.entries()) {
      const answer = index === 0 ? "A" : q.answer;
      await page.getByRole("radio", { name: q.options[answer], exact: true }).check();
    }
    await page.getByRole("button", { name: "Submit all five answers", exact: true }).click();
    await atomReach(page, "result");
    await expect(page.getByRole("heading", { name: "80% · Understanding demonstrated", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Save result and finish mission", exact: true }).click();
    await expect(page.locator(".xp-completion")).toBeVisible();
    expect(data.progressRows.some(row => row.scenario_id === "atom_dive" && row.score === 80 && row.answers.atomDive.evidence.length === 3)).toBe(true);
    await page.getByRole("button", { name: "Open completed notebook", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("Metallic reconstruction");
    await expect(page.getByRole("dialog")).toContainText("Ionic reconstruction");
  });
}

async function atCheckpoint(page, task, options = {}, reverse = false) {
  const initial = checkpoint(task, reverse);
  const data = await atomSetup(page, { seedRows: [draftFor(initial, ID)], ...options });
  await page.goto(target);
  await atomStart(page);
  return { initial, data };
}
const feedbackCases = [
  ["metal-transfer-error", "metal"], ["metal-electrons-escape", "metal"], ["metal-fixed-pair-error", "metal"], ["metal-attraction-error", "metal"],
  ["ionic-proton-error", "transfer"], ["ionic-charge-error", "charges"], ["ionic-electron-sea-error", "attraction"], ["ionic-molecule-error", "lattice"],
  ["final-wrong-world", "comparison"], ["final-same-bond-error", "comparison"], ["final-colour-only", "comparison"], ["final-no-evidence", "comparison"],
];
for (const [condition, task] of feedbackCases) test(`recorded ${condition} feedback is conditional, preserves evidence and allows revision`, async ({ page }) => {
  const { initial } = await atCheckpoint(page, task);
  const feedback = ATOM_MEDIA.dialogue.find(line => line.condition === condition);
  expect(await page.evaluate(id => window.__atomPlays.filter(item => item.id === id && item.op === "play").length, feedback.id)).toBe(0);
  if (task === "metal") {
    await page.getByRole("button", { name: "Inspect ion cores", exact: true }).click();
    await page.getByRole("button", { name: "Inspect valence electrons", exact: true }).click();
    const electron = { "metal-transfer-error": "transfer", "metal-electrons-escape": "escape", "metal-fixed-pair-error": "pairs" }[condition] || "delocalized";
    await page.getByLabel("Where do the valence electrons belong?", { exact: true }).selectOption(electron);
    await page.getByLabel("Which components attract?", { exact: true }).selectOption(condition === "metal-attraction-error" ? "positive-cores" : "cores-electrons");
    await page.getByLabel("Explain the overall charge", { exact: true }).selectOption("balanced");
    await page.getByRole("button", { name: "Verify metallic reconstruction", exact: true }).click();
  } else if (task === "transfer") await page.getByRole("button", { name: "Try moving a proton", exact: true }).click();
  else if (task === "charges") {
    await page.getByLabel("Sodium ion charge", { exact: true }).selectOption("-1");
    await page.getByLabel("Chloride ion charge", { exact: true }).selectOption("+1");
    await page.getByLabel("What happened to the nuclei?", { exact: true }).selectOption("unchanged");
    await page.getByRole("button", { name: "Verify charges and nuclei", exact: true }).click();
  } else if (task === "attraction") {
    await page.getByLabel("What holds this ionic structure together?", { exact: true }).selectOption("electron-sea");
    await page.getByRole("button", { name: "Verify ionic attraction", exact: true }).click();
  } else if (task === "lattice") await page.getByRole("button", { name: "Keep isolated NaCl molecules", exact: true }).click();
  else {
    const metallic = initial.comparison.sides.indexOf("metallic");
    await page.getByRole("button", { name: `Choose Model ${condition === "final-wrong-world" ? metallic ? "A" : "B" : metallic ? "B" : "A"}`, exact: true }).click();
    if (condition === "final-same-bond-error") await page.getByLabel("Attractive interaction supporting your location", { exact: true }).selectOption("identical");
    if (condition === "final-colour-only") await page.getByLabel("Particle evidence for your location", { exact: true }).selectOption("colour");
    await page.getByRole("button", { name: "Verify location and both formation matches", exact: true }).click();
  }
  await expect(page.locator(".ad-caption")).toHaveText(feedback.text);
  await expect(page.locator(".ad-voice-audio")).toHaveAttribute("src", feedback.audio);
  const step = { metal: "metalTask", transfer: "ionicTransfer", charges: "ionicCharges", attraction: "ionicAttraction", lattice: "ionicLattice", comparison: "comparisonTask" }[task];
  await atomReach(page, step);
  await page.getByText(new RegExp(`^Verified evidence · ${initial.evidence.length} observations$`)).click();
  await expect(page.locator(".ad-records")).toContainText("1 reconsideration attempts");
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('px-mission-draft:00000000-0000-4000-8000-000000000001:atom_dive')));
  expect(draft.atomDive.evidence).toEqual(initial.evidence);
  expect(draft.atomDive.attempts.at(-1).condition).toBe(condition);
});

test("all actual media URLs resolve and the approved character references remain accessible", async ({ page }) => {
  await atomSetup(page);
  const assets = [...Object.values(ATOM_MEDIA.images).map(image => image.url), ...Object.values(ATOM_MEDIA.videos).flatMap(video => [video.url, video.end]), ...ATOM_MEDIA.dialogue.map(line => line.audio)];
  for (let index = 0; index < assets.length; index += 8) {
    const responses = await Promise.all(assets.slice(index, index + 8).map(url => page.request.head(url)));
    for (const response of responses) expect(response.ok()).toBe(true);
  }
  await page.goto(target);
  await page.getByText("Meet the research team · Approved character references", { exact: true }).click();
  await expect(page.locator(".ad-cast img")).toHaveCount(4);
  for (const image of await page.locator(".ad-cast img").all()) await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
});

test("native MP3 starts on the user gesture, retains exact captions and waits for manual Continue", async ({ page }) => {
  await setup(page, { empty: true });
  await page.goto(target);
  const audio = page.locator(".ad-voice-audio");
  await expect(audio).not.toHaveAttribute("src", /mp3/);
  await atomStart(page);
  await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(0);
  await expect(page.locator(".ad-caption")).toHaveText(ATOM_MEDIA.dialogue[0].text);
  await expect(page.locator(".ad-controls > .ad-primary")).toBeEnabled({ timeout: 15000 });
  await expect(page.locator(".ad-dialogue")).toHaveAttribute("data-dialogue-id", "AD_S01_NAR_01");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".ad-voice-audio")).toHaveAttribute("data-dialogue-id", "AD_S01_HAM_02");
  await expect(page.locator(".ad-voice-audio")).toHaveCount(1);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(audio).toHaveJSProperty("paused", true);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect.poll(() => audio.evaluate(el => el.paused)).toBe(false);
});

test("saved models, comparison randomization and notebook notes survive reload; conversation replay changes no evidence", async ({ page }) => {
  const { initial } = await atCheckpoint(page, "comparison", {}, true);
  const labels = await page.locator(".ad-comparison-models svg").evaluateAll(items => items.map(el => el.getAttribute("aria-label")));
  await page.getByRole("button", { name: "Mission Notebook", exact: true }).first().click();
  await page.getByLabel("1. Scientific evidence — personal notes", { exact: true }).fill("Keep my comparison observations after refresh.");
  await page.getByLabel("Close notebook", { exact: true }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('px-mission-draft:00000000-0000-4000-8000-000000000001:atom_dive'))).toContain("Keep my comparison observations");
  await page.reload();
  await atomStart(page);
  await expect(page.locator(".ad-adventure")).toHaveAttribute("data-step", "comparisonTask");
  expect(await page.locator(".ad-comparison-models svg").evaluateAll(items => items.map(el => el.getAttribute("aria-label")))).toEqual(labels);
  await page.getByText(/^Conversation history/).click();
  await page.getByRole("button", { name: "Replay this dialogue", exact: true }).first().click();
  await expect(page.locator(".ad-caption")).toHaveText(ATOM_MEDIA.dialogue[0].text);
  await expect(page.getByRole("button", { name: "Return to current dialogue", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('px-mission-draft:00000000-0000-4000-8000-000000000001:atom_dive')));
  expect(saved.atomDive.evidence).toEqual(initial.evidence);
  expect(saved.atomDive.comparison.supported).toBe(false);
});

test("missing scene, film and recording retain readable manual progression; hidden-tab pause and navigation release audio", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await atomSetup(page);
  await page.route("**/images/scenarios/atom_dive/story/**", route => route.abort());
  await page.route("**/videos/scenarios/atom_dive/runtime/**", route => route.fulfill({ status: 404, body: "" }));
  await page.route("**/audio/scenarios/atom_dive/**", route => route.fulfill({ status: 404, body: "" }));
  await page.goto(target);
  await atomStart(page);
  await expect(page.locator(".ad-audio-status")).toContainText(/unavailable|captions/);
  await atomReach(page, "order");
  await expect(page.getByRole("button", { name: /^Metallic world first/ })).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await page.locator(".ad-voice-audio").evaluate(el => window.__lastAtomAudio = el);
  await page.getByRole("link", { name: "Perspective X — Home", exact: true }).first().click();
  await expect(page.locator(".ad-adventure")).toHaveCount(0);
  expect(await page.evaluate(() => window.__lastAtomAudio.getAttribute("src"))).toBe(null);
});

test("new role is discoverable, teacher locks apply, and teacher preview produces no student writes", async ({ page }) => {
  const student = await atomSetup(page, { settingsRows: [{ scenario_id: "atom_dive", is_locked: true }] });
  await page.goto("/Roles");
  await expect(page.getByRole("heading", { name: "Atomic Bonding Investigator", exact: true })).toBeVisible();
  await page.goto(target + "&preview=true");
  await expect(page.getByRole("heading", { name: "Mission unavailable", exact: true })).toBeVisible();
  expect(student.writes).toHaveLength(0);
  const teacher = await atomSetup(page, { teacher: true, settingsRows: [{ scenario_id: "atom_dive", is_locked: true }] });
  await page.goto(target);
  await atomReach(page, "order");
  await page.getByRole("button", { name: /^Metallic world first/ }).click();
  await atomMetal(page);
  await expect(page.getByText("1/2 investigations verified", { exact: true })).toBeVisible();
  expect(teacher.writes).toHaveLength(0);
  await page.goto("/TeacherDashboard");
  await page.getByRole("tab", { name: "Missions", exact: true }).click();
  await page.getByLabel("Find a mission", { exact: true }).fill("ATOM DIVE");
  await expect(page.getByText(ATOM_MEDIA.story.title, { exact: true }).first()).toBeVisible();
});

test("teacher review displays recorded scientific corrections and all five assessment responses", async ({ page }) => {
  const initial = checkpoint("assessment");
  const row = draftFor(initial, OTHER);
  row.score = 80; row.completed_at = "2026-10-25T08:00:00Z";
  row.answers.exitTicket = { score: 80, passed: true, mcq_answers: ATOM_MEDIA.assessment.questions.map((q, i) => ({ questionId: i, option: q.answer, isCorrect: i !== 0 })) };
  await atomSetup(page, { teacher: true, seedRows: [row] });
  await page.goto("/TeacherDashboard");
  await page.getByRole("tab", { name: "Students", exact: true }).click();
  await page.locator(".px-teacher-tools").getByText("Synthetic Peer", { exact: true }).click();
  await page.getByRole("button", { name: "View Answers", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByText(ATOM_MEDIA.story.title, { exact: false }).first().click();
  await expect(dialog).toContainText("Verified the metallic reconstruction and neutrality");
  await expect(dialog).toContainText("Question 5");
});

for (const width of [1440, 820, 390]) test(`scientific activity, keyboard controls and full screen fit at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await atCheckpoint(page, "metal");
  await noOverflow(page);
  await page.getByRole("button", { name: "Inspect ion cores", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Inspect ion cores", exact: true })).toHaveAttribute("aria-pressed", "true");
  mkdirSync("docs/atom-dive/screenshots", { recursive: true });
  await page.locator(".ad-adventure").screenshot({ path: `docs/atom-dive/screenshots/metallic-${width}.png` });
  await page.getByRole("button", { name: "Full screen", exact: true }).click();
  await expect(page.getByRole("button", { name: "Exit full screen", exact: true })).toBeVisible();
  await noOverflow(page);
  await page.locator(".ad-adventure").screenshot({ path: `docs/atom-dive/screenshots/fullscreen-${width}.png` });
  await page.getByRole("button", { name: "Exit full screen", exact: true }).click();
});

test("silent clip holds its true final frame without cutting dialogue; resume holds it without replay", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let state = createAtomState();
  for (let i = 0; i < 3; i++) state = action(state, "continue");
  await atomSetup(page, { seedRows: [draftFor(state, ID)] });
  await page.goto(target);
  await atomStart(page);
  const video = page.locator(".ad-film video");
  await expect(video).toBeVisible();
  expect(await video.evaluate(el => ({ muted: el.muted, loop: el.loop, rate: el.playbackRate }))).toEqual({ muted: true, loop: false, rate: 1 });
  const caption = await page.locator(".ad-caption").textContent();
  await video.evaluate(el => el.dispatchEvent(new Event("ended")));
  await expect(page.getByAltText("Actual final frame of the approved clip", { exact: true })).toHaveAttribute("src", ATOM_MEDIA.videos["AD_V01_last_signal.mp4"].end);
  await expect(page.locator(".ad-controls > .ad-primary")).toBeDisabled();
  await expect(page.locator(".ad-caption")).toHaveText(caption);
  await atomContinue(page);
  await page.reload();
  await atomStart(page);
  await expect(page.getByAltText("Actual final frame of the approved clip", { exact: true })).toBeVisible();
  await expect(page.locator(".ad-film video")).toHaveCount(0);
});

test("V03 and V05 wait for scientific verification; clip skips never bypass a model", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await atCheckpoint(page, "metal");
  await expect(page.locator(".ad-film video")).toHaveCount(0);
  await atomMetal(page);
  await atomContinue(page); await atomContinue(page);
  await expect(page.locator(".ad-film video")).toHaveAttribute("src", ATOM_MEDIA.videos["AD_V03_metallic_route.mp4"].url);
  await page.getByRole("button", { name: "Skip clip", exact: true }).click();
  await atomIonic(page);
  await atomReach(page, "comparisonTask");
  expect(await page.evaluate(() => window.__atomPlays.some(item => item.src?.includes("AD_V05")))).toBe(false);
  await expect(page.getByRole("button", { name: "Verify location and both formation matches", exact: true })).toBeVisible();
  await atomCompare(page);
  await atomContinue(page);
  await expect(page.locator(".ad-film video")).toHaveAttribute("src", ATOM_MEDIA.videos["AD_V05_find_orbit.mp4"].url);
  await page.getByRole("button", { name: "Skip clip", exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('px-mission-draft:00000000-0000-4000-8000-000000000001:atom_dive')));
  expect(saved.atomDive.evidence).toHaveLength(3);
  expect(saved.exitTicket).toBeUndefined();
});

test("repeating a misconception replays its recording, then the electron can be dragged to its target", async ({ page }) => {
  await atCheckpoint(page, "transfer");
  const line = ATOM_MEDIA.dialogue.find(row => row.condition === "ionic-proton-error");
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Try moving a proton", exact: true }).click();
    await expect.poll(() => page.evaluate(id => window.__atomPlays.filter(item => item.id === id && item.op === "play").length, line.id)).toBe(i + 1);
    await atomReach(page, "ionicTransfer");
  }
  await page.getByRole("button", { name: "Transfer one electron", exact: true }).dragTo(page.getByRole("button", { name: "Chlorine target · Accept one electron", exact: true }));
  await atomReach(page, "ionicCharges");
  await expect(page.getByRole("img", { name: /Sodium: 11 protons, 10 electrons/ })).toBeVisible();
  await page.locator(".ad-adventure").screenshot({ path: "docs/atom-dive/screenshots/ionic-transfer.png" });
});

test("60% saves without a badge and replay creates a new attempt without overwriting the result", async ({ page }) => {
  const { data } = await atCheckpoint(page, "assessment");
  for (const [index, q] of ATOM_MEDIA.assessment.questions.entries()) {
    const answer = index < 2 ? Object.keys(q.options).find(key => key !== q.answer) : q.answer;
    await page.getByRole("radio", { name: q.options[answer], exact: true }).check();
  }
  await page.getByRole("button", { name: "Submit all five answers", exact: true }).click();
  await atomReach(page, "result");
  await expect(page.getByRole("heading", { name: "60% · Keep building your explanation", exact: true })).toBeVisible();
  await page.locator(".ad-adventure").screenshot({ path: "docs/atom-dive/screenshots/assessment-review.png" });
  await page.getByRole("button", { name: "Save result and finish mission", exact: true }).click();
  await expect(page.locator(".xp-completion")).toContainText("No badge or certificate is earned");
  await expect(page.getByRole("button", { name: "View certificate", exact: true })).toHaveCount(0);
  await expect.poll(() => data.progressRows.find(row => row.score === 60)?.completed_at).toBeTruthy();
  const recorded = structuredClone(data.progressRows.find(row => row.score === 60));
  await page.getByRole("button", { name: "Replay mission", exact: true }).click();
  await atomReach(page, "order");
  await expect.poll(() => data.progressRows.length).toBeGreaterThan(1);
  expect(data.progressRows.find(row => row.id === recorded.id)).toEqual(recorded);
});

test("blocked playback offers Resume or captions; mute and replay retain one voice; fallback fullscreen handles notebook", async ({ page }) => {
  await atomSetup(page);
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let blocked = false;
    HTMLMediaElement.prototype.play = function () {
      if (this.classList.contains("ad-voice-audio") && !blocked) { blocked = true; return Promise.reject(new DOMException("Browser permission", "NotAllowedError")); }
      return play.call(this);
    };
    Element.prototype.requestFullscreen = () => Promise.reject(new Error("Native fullscreen unavailable"));
  });
  await page.goto(target);
  await page.locator(".ad-adventure").screenshot({ path: "docs/atom-dive/screenshots/opening.png" });
  await atomStart(page);
  await expect(page.locator(".ad-audio-status")).toContainText("permit audio");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.locator(".ad-audio-status")).toContainText("Playing");
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  await expect(page.locator(".ad-voice-audio")).toHaveJSProperty("muted", true);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(page.locator(".ad-voice-audio")).toHaveCount(1);
  await expect(page.locator(".ad-voice-audio")).toHaveJSProperty("muted", true);
  await page.getByRole("button", { name: "Captions only", exact: true }).click();
  await expect(page.locator(".ad-voice-audio")).not.toHaveAttribute("src", /mp3/);
  await expect(page.locator(".ad-controls > .ad-primary")).toBeEnabled();
  await page.getByRole("button", { name: "Full screen", exact: true }).click();
  await expect(page.locator(".ad-adventure")).toHaveClass(/is-expanded/);
  await page.locator(".ad-adventure").getByRole("button", { name: "Mission Notebook", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".ad-adventure")).toHaveClass(/is-expanded/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".ad-adventure")).not.toHaveClass(/is-expanded/);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});
