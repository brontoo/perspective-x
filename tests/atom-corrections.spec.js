import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { atomSetup } from "./support/atom-flow";
import { checkpoint, draftFor } from "./support/atom-checkpoints.mjs";
import { setup, ID, noOverflow } from "./support/fixtures";
import { ATOM_REVISED_STILLS } from "../src/data/atomPresentation.mjs";
import { ATOM_MEDIA } from "../src/data/atomDive.mjs";
import { installOceanPlayback, oceanBriefing } from "./support/ocean-flow";
const target = "/ScenarioPlayer?scenario=atom_dive";
const root = page => page.locator(".px-atom-adventure");
const paint = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function start(page) { await page.getByRole("button", { name: /^(Start ATOM DIVE|Resume mission)$/ }).click(); await paint(page); await expect(page.locator(".px-atom-model-intro")).toBeHidden({ timeout: 10000 }); }
async function beat(page) {
  await expect(page.locator(".px-atom-model-intro")).toBeHidden({ timeout: 10000 });
  await paint(page);
  await page.locator(".px-atom-voice-audio").evaluate(el => el.dispatchEvent(new Event("ended")));
  await paint(page);
}
async function reach(page, step) {
  for (let i = 0; i < 100; i++) {
    if (await root(page).getAttribute("data-step") === step && await root(page).getAttribute("data-feedback") === "false") return;
    const video = page.locator(".px-atom-stage video");
    if (await video.count()) await video.evaluate(el => el.dispatchEvent(new Event("ended")));
    await beat(page);
  }
  throw new Error(`Automatic story did not reach ${step}`);
}
async function at(page, task, mutate) {
  const state = checkpoint(task); mutate?.(state);
  const data = await atomSetup(page, { seedRows: [draftFor(state, ID)] });
  await page.goto(target); await start(page);
  return { state, data };
}
async function shot(page, name) {
  mkdirSync("docs/atom-dive/screenshots/corrections", { recursive: true });
  await root(page).screenshot({ path: `docs/atom-dive/screenshots/corrections/${name}.png` });
}

test("one Start automatically plays the authored briefing, revised hovering ORBIT and neutral mirror; route waits", async ({ page }) => {
  await atomSetup(page);
  await page.goto(target);
  await expect(page.getByRole("button", { name: "Previous scene", exact: true })).toBeDisabled();
  await expect(page.locator(".px-atom-voice-audio")).not.toHaveAttribute("src", /mp3/);
  await start(page);
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
  await reach(page, "signal");
  await expect(page.locator(".px-atom-environment")).toHaveAttribute("src", ATOM_REVISED_STILLS.S02);
  await expect(page.locator(".px-atom-stage video")).toHaveCount(0);
  await shot(page, "s02-hovering-orbit");
  await reach(page, "launch");
  await expect(page.locator(".px-atom-environment")).toHaveAttribute("src", ATOM_REVISED_STILLS.S03);
  await shot(page, "s03-neutral-mirror");
  await reach(page, "order");
  await beat(page); await beat(page);
  await expect(root(page)).toHaveAttribute("data-step", "order");
  await expect(page.getByRole("button", { name: /^Ionic world first/ })).toBeEnabled();
});

for (const world of ["metallic","ionic"]) test(`fresh ${world}-first route controls state, narration, camera, model and withheld video ID on resume`, async ({ page }) => {
  await atomSetup(page); await page.goto(target); await start(page); await reach(page, "order");
  if (world === "metallic") await page.clock.install();
  await page.getByRole("button", { name: new RegExp(`^${world === "metallic" ? "Metallic" : "Ionic"} world first`) }).click();
  await paint(page);
  if (world === "metallic") {
    const intro = page.locator(".px-atom-model-intro");
    await expect(intro.getByRole("heading", { name: "Metallic structure model" })).toBeVisible();
    await expect(page.locator(".px-atom-world-view")).toHaveCount(0);
    const plays = await page.evaluate(() => window.__atomPlays.filter(row => row.op === "play").length);
    await shot(page, "metallic-model-introduction");
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.clock.runFor(8000);
    await expect(intro).toBeVisible();
    expect(await page.evaluate(() => window.__atomPlays.filter(row => row.op === "play").length)).toBe(plays);
    await page.getByRole("button", { name: "Resume", exact: true }).click();
    await page.clock.runFor(4000);
    await expect(intro).toBeHidden();
  } else await expect(page.locator(".px-atom-model-intro")).toHaveCount(0);
  await expect(page.locator(".px-atom-stage")).toHaveAttribute("data-world", world);
  await expect(page.locator(".px-atom-stage")).toHaveAttribute("data-video-id", world === "metallic" ? "AD_V02_enter_metallic.mp4" : "AD_V04_enter_ionic.mp4");
  await expect(page.locator(".px-atom-world-view .px-atom-crystal")).toHaveAttribute("data-world", world);
  if (world === "metallic") {
    await beat(page);
    await expect(page.locator(".px-atom-caption")).toHaveText("I recorded positive centres everywhere. Where was the negative charge?");
    await expect(page.getByText("Positive metal ion core · nucleus + inner electrons", { exact: true })).toBeVisible();
  }
  await shot(page, `${world}-first-orbit-view`);
  const task = world === "metallic" ? "metalTask" : "ionicTransfer";
  await reach(page, task);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('px-mission-draft:00000000-0000-4000-8000-000000000001:atom_dive')));
  expect(saved.atomDive.order[0]).toBe(world);
  expect(saved.atomDive.evidence).toHaveLength(0);
  await page.reload(); await start(page);
  await expect(root(page)).toHaveAttribute("data-step", task);
  await expect(page.locator(".px-atom-stage")).toHaveAttribute("data-world", world);
  await noOverflow(page);
});

test("comparison stays visible as a narrated review and advances without selection or verification", async ({ page }) => {
  const { state } = await at(page, "comparison", value => { value.step = "comparisonBrief"; value.cursor = 0; });
  const models = page.locator(".px-atom-comparison-models svg");
  await expect(models).toHaveCount(2);
  await models.first().evaluate(el => window.__retainedComparison = el);
  await reach(page, "comparisonTask");
  await expect(page.getByRole("heading", { name: "Metallic structure", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ionic structure", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Choose Model/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Verify location and both formation matches", exact: true })).toHaveCount(0);
  await expect(page.locator(".px-atom-task select")).toHaveCount(0);
  await shot(page, "s09-narrated-comparison");
  await beat(page);
  await expect(models).toHaveCount(2);
  expect(await models.first().evaluate(el => el === window.__retainedComparison)).toBe(true);
  await reach(page, "recovery");
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('px-mission-draft:00000000-0000-4000-8000-000000000001:atom_dive')));
  expect(draft.atomDive.evidence).toEqual(state.evidence);
  expect(draft.atomDive.attempts).toEqual(state.attempts);
  expect(draft.atomDive.comparison.reviewed).toBe(true);
  expect(draft.atomDive.comparison.supported).toBe(false);
  expect(draft.atomDive.corrections.some(row => row.condition === "final-supported")).toBe(false);
});

test("speech and film finish independently; duplicate and stale completion callbacks never double-advance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const add = EventTarget.prototype.addEventListener;
    window.__endedCallbacks = [];
    EventTarget.prototype.addEventListener = function (name, fn, options) {
      if (name === "ended" && this instanceof HTMLAudioElement) window.__endedCallbacks.push(fn);
      return add.call(this, name, fn, options);
    };
  });
  await at(page, "reflection", state => { state.step = "homecoming"; state.cursor = 0; });
  await page.evaluate(() => window.__staleEnded = window.__endedCallbacks.at(-1));
  await beat(page); await beat(page);
  await expect(page.locator(".px-atom-dialogue")).toHaveAttribute("data-dialogue-id", "AD_S11_HAM_01");
  await page.locator(".px-atom-stage video").evaluate(el => el.dispatchEvent(new Event("ended")));
  await paint(page);
  await expect(page.locator(".px-atom-dialogue")).toHaveAttribute("data-dialogue-id", "AD_S11_RAS_02");
  await page.evaluate(() => { window.__staleEnded(new Event("ended")); window.__staleEnded(new Event("ended")); });
  await paint(page);
  await expect(page.locator(".px-atom-dialogue")).toHaveAttribute("data-dialogue-id", "AD_S11_RAS_02");
});

test("previous scene preserves narrated comparison, historical inputs, notes and assessed attempts", async ({ page }) => {
  const { state, data } = await at(page, "comparison", value => { value.comparison.world = "2"; value.comparison.particles = "colour"; });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Mission Notebook", exact: true }).first().click();
  await page.getByLabel("1. Scientific evidence — personal notes", { exact: true }).fill("Retain my comparison observations.");
  await page.getByLabel("Close notebook", { exact: true }).click();
  await expect.poll(() => data.progressRows.some(row => row.scenario_id === "atom_dive" && row.answers.notebook?.evidenceNotes?.includes("Retain my comparison"))).toBe(true);
  const before = structuredClone(data.progressRows);
  const labels = await page.locator(".px-atom-comparison-models svg").evaluateAll(items => items.map(el => el.getAttribute("aria-label")));
  await page.getByRole("button", { name: "Previous scene", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Previous scene review", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("h2")).toContainText("S08");
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Return to current scene", exact: true }).click();
  await expect(root(page)).toHaveAttribute("data-step", "comparisonTask");
  expect(await page.locator(".px-atom-comparison-models svg").evaluateAll(items => items.map(el => el.getAttribute("aria-label")))).toEqual(labels);
  const current = await page.evaluate(() => JSON.parse(localStorage.getItem('px-mission-draft:00000000-0000-4000-8000-000000000001:atom_dive')));
  expect(current.atomDive.evidence).toEqual(state.evidence);
  expect(current.atomDive.comparison.world).toBe("2");
  expect(current.atomDive.comparison.particles).toBe("colour");
  expect(data.progressRows).toEqual(before);
});

test("notebook and hidden tab pause automatic advancement; captions-only has adjustable, pausable reading time", async ({ page }) => {
  await page.clock.install();
  await atomSetup(page); await page.goto(target); await start(page);
  const initial = await page.locator(".px-atom-dialogue").getAttribute("data-dialogue-id");
  await page.getByRole("button", { name: "Captions only", exact: true }).click();
  await page.getByLabel("Reading pace", { exact: true }).selectOption("1.5");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(20000);
  await expect(page.locator(".px-atom-dialogue")).toHaveAttribute("data-dialogue-id", initial);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Mission Notebook", exact: true }).first().click();
  await page.clock.runFor(20000);
  await expect(page.locator(".px-atom-dialogue")).toHaveAttribute("data-dialogue-id", initial);
  await page.getByLabel("Close notebook", { exact: true }).click();
  await page.clock.runFor(8000);
  await expect(page.locator(".px-atom-dialogue")).not.toHaveAttribute("data-dialogue-id", initial);
  const current = await page.locator(".px-atom-dialogue").getAttribute("data-dialogue-id");
  await page.evaluate(() => { Object.defineProperty(document,"hidden",{ configurable:true,value:true }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.clock.runFor(20000);
  await expect(page.locator(".px-atom-dialogue")).toHaveAttribute("data-dialogue-id", current);
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
});

test("legacy mission previous-scene review keeps the current investigation form mounted and editable afterward", async ({ page }) => {
  test.setTimeout(60000);
  await setup(page, { teacher:true,empty:true });
  await page.goto("/ScenarioPlayer?scenario=water_contamination");
  await page.getByRole("button", { name: "Skip Story", exact: true }).click();
  await page.getByRole("button", { name: /^Accept assignment/ }).click();
  const textarea = page.locator(".xp-mission-workspace textarea").first();
  if (await textarea.count()) await textarea.fill("Keep this scientific explanation while I review the assignment.");
  await page.locator(".xp-mission-heading").getByRole("button", { name: "Previous scene", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Previous scene review", exact: true });
  await expect(dialog.locator("h2")).toContainText("Your assignment");
  await dialog.screenshot({ path: "docs/atom-dive/screenshots/corrections/legacy-previous-scene.png" });
  await dialog.getByRole("button", { name: "Return to current scene", exact: true }).click();
  if (await textarea.count()) await expect(textarea).toHaveValue("Keep this scientific explanation while I review the assignment.");
  await expect(page.locator(".xp-mission-workspace")).toHaveAttribute("data-phase","scene1");
});

test("previous-scene review suspends a real recording and restores its exact live checkpoint and position", async ({ page }) => {
  const state = checkpoint("metal"); state.step = "metalEntry"; state.cursor = 2;
  await setup(page, { seedRows: [draftFor(state, ID)] });
  await page.goto(target); await start(page);
  const audio = page.locator(".px-atom-voice-audio");
  await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(.3);
  const line = await audio.getAttribute("data-dialogue-id");
  await page.getByRole("button",{name:"Previous scene",exact:true}).click();
  const savedTime = await audio.evaluate(el => el.currentTime);
  await expect(audio).toHaveJSProperty("paused", true);
  const dialog = page.getByRole("dialog",{name:"Previous scene review",exact:true});
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.locator("audio").evaluate(el => el.currentTime)).toBeGreaterThan(.1);
  expect(Math.abs(await audio.evaluate(el => el.currentTime) - savedTime)).toBeLessThan(.03);
  await dialog.getByRole("button",{name:"Return to current scene",exact:true}).click();
  await expect(audio).toHaveAttribute("data-dialogue-id",line);
  await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(savedTime + .15);
  await expect(root(page)).toHaveAttribute("data-step","metalEntry");
});

for (const width of [820,390]) test(`narrated comparison and fullscreen remain readable at ${width}px`, async ({ page }) => {
  await page.setViewportSize({width,height:width === 390 ? 844 : 1000});
  await at(page,"comparison");
  await page.getByRole("button",{name:"Full screen",exact:true}).click();
  await noOverflow(page);
  await expect(page.locator(".px-atom-comparison-models svg")).toHaveCount(2);
  await expect(page.locator(".px-atom-speaker")).toContainText("Hamad Al Zaabi");
  await expect(page.getByRole("button", { name: /^Choose Model/ })).toHaveCount(0);
  await shot(page,`s09-review-fullscreen-${width}`);
  await beat(page);
  await expect(page.locator(".px-atom-comparison-models svg")).toHaveCount(2);
  await page.getByRole("button",{name:"Exit full screen",exact:true}).click();
});

test("dessert adapter replays only the actually visited preceding scene and restores its current dialogue", async ({ page }) => {
  await setup(page, { empty:true });
  await page.goto("/ScenarioPlayer?scenario=ionic_dessert_mystery");
  await page.getByRole("button", { name: "Next dialogue →", exact:true }).click();
  const caption = await page.locator(".ivn-dialogue p").textContent();
  await page.locator(".xp-mission-heading").getByRole("button", { name: "Previous scene",exact:true }).click();
  const dialog = page.getByRole("dialog",{name:"Previous scene review",exact:true});
  await expect(dialog).toContainText("At Umm Al Emarat Park");
  await dialog.screenshot({ path: "docs/atom-dive/screenshots/corrections/dessert-previous-scene.png" });
  await dialog.getByRole("button",{name:"Return to current scene",exact:true}).click();
  await expect(page.locator(".ivn-dialogue p")).toHaveText(caption);
});

test("Ocean Dome adapter follows visited scene order across chapters without changing task state", async ({ page }) => {
  await installOceanPlayback(page);
  const data = await setup(page, { teacher:true,empty:true });
  await page.goto("/ScenarioPlayer?scenario=ionic_aquarium_mystery");
  await oceanBriefing(page);
  const caption = await page.locator(".od-caption").textContent();
  await page.locator(".od-view-controls").getByRole("button",{name:"Previous scene",exact:true}).click();
  const dialog = page.getByRole("dialog",{name:"Previous scene review",exact:true});
  await expect(dialog.locator("h2")).toContainText("S06");
  await dialog.screenshot({ path: "docs/atom-dive/screenshots/corrections/ocean-previous-scene.png" });
  await dialog.getByRole("button",{name:"Return to current scene",exact:true}).click();
  await expect(page.locator(".od-caption")).toHaveText(caption);
  await expect(page.locator(".od-viewport")).toHaveAttribute("data-story-step","first-decision");
  expect(data.writes).toHaveLength(0);
});

for (const first of ["metallic","ionic"]) test(`automatic ${first}-first complete mission saves exact five-question result without narrative Continue`, async ({ page }) => {
  test.setTimeout(60000);
  const data = await atomSetup(page); await page.goto(target); await start(page); await reach(page,"order");
  await page.getByRole("button",{name:new RegExp(`^${first === "metallic" ? "Metallic" : "Ionic"} world first`)}).click();
  async function metal() {
    await reach(page,"metalTask");
    await page.getByRole("button",{name:"Inspect ion cores",exact:true}).click();
    await page.getByRole("button",{name:"Inspect valence electrons",exact:true}).click();
    for (const [label,value] of [["Where do the valence electrons belong?","delocalized"],["Which components attract?","cores-electrons"],["Explain the overall charge","balanced"]]) await page.getByLabel(label,{exact:true}).selectOption(value);
    await page.getByRole("button",{name:"Verify metallic reconstruction",exact:true}).click();
  }
  async function ionic() {
    await reach(page,"ionicTransfer"); await page.getByRole("button",{name:"Transfer one electron",exact:true}).click();
    await reach(page,"ionicCharges");
    for (const [label,value] of [["Sodium ion charge","+1"],["Chloride ion charge","-1"],["What happened to the nuclei?","unchanged"]]) await page.getByLabel(label,{exact:true}).selectOption(value);
    await page.getByRole("button",{name:"Verify charges and nuclei",exact:true}).click();
    await reach(page,"ionicAttraction"); await page.getByLabel("What holds this ionic structure together?",{exact:true}).selectOption("opposite-ions");
    await page.getByRole("button",{name:"Verify ionic attraction",exact:true}).click();
    await reach(page,"ionicLattice"); await page.getByRole("button",{name:"Expand repeating lattice",exact:true}).click();
    await page.getByRole("button",{name:"Verify extended structure",exact:true}).click();
  }
  if(first === "metallic") { await metal(); await ionic(); } else { await ionic(); await metal(); }
  await reach(page,"comparisonTask");
  await expect(page.locator(".px-atom-comparison-models svg")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Verify location and both formation matches", exact: true })).toHaveCount(0);
  await reach(page,"reflection");
  await page.getByLabel("One difference in how the bonds form",{exact:true}).fill("Metal electrons delocalize; forming these ions transfers an electron.");
  await page.getByLabel("One difference in what holds the structures together",{exact:true}).fill("Positive cores attract delocalized electrons; opposite ions attract in the ionic lattice.");
  await page.getByRole("button",{name:"Save reflection and continue",exact:true}).click();
  await reach(page,"assessment");
  for(const q of ATOM_MEDIA.assessment.questions) await page.getByRole("radio",{name:q.options[q.answer],exact:true}).check();
  await page.getByRole("button",{name:"Submit all five answers",exact:true}).click();
  await beat(page);
  await expect(page.locator(".xp-completion")).toBeVisible();
  await expect(page.locator(".xp-completion")).toContainText("100%");
  expect(data.progressRows.filter(row=>row.scenario_id === "atom_dive" && row.score === 100)).toHaveLength(1);
  expect(data.progressRows.find(row=>row.score === 100).answers.exitTicket.mcq_answers).toHaveLength(5);
});

test("previous-scene playback returns automatically at its end without adding learning events", async ({ page }) => {
  const { state } = await at(page,"transfer");
  const storage = () => page.evaluate(() => JSON.parse(localStorage.getItem('px-mission-draft:00000000-0000-4000-8000-000000000001:atom_dive')));
  const before = await storage();
  await page.getByRole("button",{name:"Previous scene",exact:true}).click();
  for(let index=0;index<15;index++) {
    const dialog = page.getByRole("dialog",{name:"Previous scene review",exact:true});
    if (!await dialog.count()) break;
    await paint(page);
    await dialog.locator("audio").evaluate(el=>el.dispatchEvent(new Event("ended")));
    await paint(page);
  }
  await expect(page.getByRole("dialog",{name:"Previous scene review",exact:true})).toHaveCount(0);
  await expect(root(page)).toHaveAttribute("data-step","ionicTransfer");
  const after = await storage();
  expect(after.atomDive.evidence).toEqual(state.evidence);
  expect(after.atomDive.attempts).toEqual(before.atomDive.attempts);
  expect(after.atomDive.visited).toEqual(before.atomDive.visited);
});

test("the standard cinematic Previous scene toolbar fits a mobile viewport", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await setup(page,{teacher:true,empty:true});
  await page.goto("/ScenarioPlayer?scenario=water_contamination");
  const header = page.locator(".xp-mission-workspace .fixed").filter({has:page.getByRole("button",{name:"Previous scene",exact:true})}).first();
  await expect(header).toBeVisible();
  const dimensions = await header.evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  const button = header.getByRole("button",{name:"Previous scene",exact:true});
  const rect = await button.boundingBox();
  expect(rect.x).toBeGreaterThanOrEqual(0); expect(rect.x+rect.width).toBeLessThanOrEqual(390);
});

test("legacy recorded video review retains its embedded voice and responds to Mute", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"no-preference"});
  const movie = {url:"/videos/scenarios/water_contamination.mp4",hasSpeech:true,startTime:0,endTime:8};
  await setup(page,{teacher:true,seedRows:[{id:"legacy-media-draft",student_id:ID,scenario_id:"water_contamination",score:null,completed_at:null,answers:{
    scene1:{selectedOption:"A",justification:"Earlier scientific observations"},
    meta:{recordType:"mission_attempt",updatedAt:"2026-10-25T08:00:00Z",sceneTrail:[
      {key:"water_contamination:cinema:0",title:"Previously viewed recorded introduction",lines:[{id:"intro-recording",text:"Welcome to the scientific mission.",audio:null,video:movie}]},
      {key:"water_contamination:scene2",title:"Make the call",lines:[{id:"decision-checkpoint",text:"Consider your evidence.",audio:null}]}
    ]}
  }}]});
  await page.goto("/ScenarioPlayer?scenario=water_contamination");
  await expect(page.locator(".xp-mission-workspace")).toHaveAttribute("data-phase","scene2");
  await page.locator(".xp-mission-heading").getByRole("button",{name:"Previous scene",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Previous scene review",exact:true}), video=dialog.locator("video");
  await expect.poll(()=>video.evaluate(el=>el.currentTime)).toBeGreaterThan(.1);
  await expect(video).toHaveJSProperty("muted",false);
  await dialog.getByRole("button",{name:"Mute",exact:true}).click();
  await expect(video).toHaveJSProperty("muted",true);
  await dialog.getByRole("button",{name:"Return to current scene",exact:true}).click();
  await expect(page.locator(".xp-mission-workspace")).toHaveAttribute("data-phase","scene2");
});
