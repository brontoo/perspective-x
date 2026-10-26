import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { ATOM_MEDIA, ATOM_STEPS, createAtomState, restoreAtomState, atomAction, activeAtomLine,
  bothModelsVerified, recoverySupported, gradeAtom, atomNotebook } from "../src/data/atomDive.mjs";

const act = (s, type, fields = {}) => atomAction(s, { type, ...fields });
function reach(s, task) {
  for (let n = 0; n < 120; n++) {
    if (ATOM_STEPS[s.step].task === task && !s.feedback) return s;
    const next = act(s, "continue");
    if (next === s) throw new Error(`Cannot pass uncompleted task ${s.step} to reach ${task}`);
    s = next;
  }
  throw new Error(`Did not reach ${task}`);
}
function metal(s) {
  s = act(reach(s, "metal"), "metalPatch", { patch: { inspected: ["cores", "electrons"], electrons: "delocalized", attraction: "cores-electrons", neutrality: "balanced" } });
  return act(s, "metalVerify");
}
function ionic(s) {
  s = act(reach(s, "transfer"), "ionicTransfer", { particle: "electron" });
  s = act(reach(s, "charges"), "ionicPatch", { patch: { sodium: "+1", chloride: "-1", nuclei: "unchanged" } });
  s = act(s, "chargesVerify");
  s = act(reach(s, "attraction"), "ionicPatch", { patch: { attraction: "opposite-ions" } });
  s = act(s, "attractionVerify");
  s = act(reach(s, "lattice"), "ionicPatch", { patch: { extended: true } });
  return act(s, "latticeVerify", { extended: true });
}
export function models(first = "metallic", random = () => .1) {
  let s = act(reach(createAtomState(random), "order"), "chooseOrder", { first });
  s = first === "metallic" ? ionic(metal(s)) : metal(ionic(s));
  return reach(s, "comparison");
}
export function comparisonPatch(s) {
  const m = String(s.comparison.sides.indexOf("metallic") + 1), i = String(s.comparison.sides.indexOf("ionic") + 1);
  return { world: m, particles: "cores-electrons", attraction: "cores-electrons", metalSequence: m, ionicSequence: i };
}

test("all eight story images, four character formats, 61 transcript/voice mappings and six exact clips resolve", () => {
  assert.equal(new Set(ATOM_MEDIA.story.story_sequence.map(s => s.art)).size, 8);
  assert.equal(Object.keys(ATOM_MEDIA.characters).length, 4);
  assert.equal(ATOM_MEDIA.dialogue.length, 61);
  assert.equal(new Set(ATOM_MEDIA.dialogue.map(l => l.id)).size, 61);
  for (const scene of ATOM_MEDIA.story.story_sequence) {
    assert.ok(scene.art.endsWith(".jpg")); assert.ok(fs.existsSync(`public${scene.art}`));
  }
  const sha = buffer => createHash("sha256").update(buffer).digest("hex");
  for (const line of ATOM_MEDIA.dialogue) {
    assert.ok(line.audio.includes(`/${line.scene}/${line.id}.mp3`));
    assert.equal(sha(fs.readFileSync(`public${line.audio}`)), line.sha256);
    const approved = execFileSync("git", ["show", `15eb615:public${line.audio}`], { maxBuffer: 32 * 1024 * 1024 });
    assert.equal(sha(approved), line.sha256);
  }
  assert.equal(Object.keys(ATOM_MEDIA.videos).length, 6);
  for (const clip of Object.values(ATOM_MEDIA.videos)) {
    const actual = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", `public${clip.url}`]));
    assert.ok(Number(actual.format.duration) <= 5);
    assert.equal(actual.streams.some(s => s.codec_type === "audio"), false);
    assert.ok(fs.existsSync(`public${clip.end}`));
  }
  const audit = JSON.parse(fs.readFileSync("docs/atom-dive/asset-audit.json"));
  assert.deepEqual(audit.unresolved, []); assert.deepEqual(audit.duplicate_recording_hashes, []);
  for (const row of audit.inventory.filter(row => row.format === "mp4")) {
    assert.equal(sha(fs.readFileSync(row.path)), row.sha256);
    const original = execFileSync("git", ["show", `15eb615:public/videos/scenarios/atom_dive/04_five_second_videos/${row.path.split('/').at(-1)}`], { maxBuffer: 32 * 1024 * 1024 });
    assert.equal(sha(original), row.sha256);
  }
});
for (const first of ["metallic", "ionic"]) test(`${first}-first route requires both scientific reconstructions and preserves stable comparison placement`, () => {
  let s = act(reach(createAtomState(() => .9), "order"), "chooseOrder", { first });
  assert.equal(act(s, "continue").metal.verified, false);
  s = first === "metallic" ? metal(s) : ionic(s);
  assert.equal(bothModelsVerified(s), false);
  s = first === "metallic" ? ionic(s) : metal(s);
  s = reach(s, "comparison");
  assert.equal(bothModelsVerified(s), true);
  assert.equal(recoverySupported(s), false);
  assert.deepEqual(s.order, [first, first === "metallic" ? "ionic" : "metallic"]);
  const restored = restoreAtomState(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored.comparison.sides, ["ionic", "metallic"]);
  assert.deepEqual(restored.evidence, s.evidence);
  const afterReview = reach(s, "reflection");
  assert.equal(afterReview.comparison.reviewed, true);
  assert.equal(afterReview.comparison.supported, false);
  assert.equal(afterReview.evidence.length, 2);
  assert.equal(afterReview.attempts.length, s.attempts.length);
  assert.equal(afterReview.corrections.length, s.corrections.length);
});

test("each metallic misconception selects only its authored feedback and keeps inspected evidence", () => {
  const base = reach(act(reach(createAtomState(), "order"), "chooseOrder", { first: "metallic" }), "metal");
  for (const [patch, condition] of [
    [{ electrons: "transfer" }, "metal-transfer-error"], [{ electrons: "escape" }, "metal-electrons-escape"],
    [{ electrons: "pairs" }, "metal-fixed-pair-error"], [{ electrons: "delocalized", attraction: "positive-cores" }, "metal-attraction-error"],
  ]) {
    const s = act(act(base, "metalPatch", { patch: { inspected: ["cores", "electrons"], neutrality: "balanced", ...patch } }), "metalVerify");
    assert.equal(activeAtomLine(s).condition, condition);
    assert.equal(s.metal.verified, false); assert.equal(s.attempts.length, 1);
    assert.equal(reach(s, "metal").metal.inspected.length, 2);
  }
});

test("ionic errors preserve nuclei and the verified metallic evidence; successful steps remain explicit", () => {
  let s = reach(metal(act(reach(createAtomState(), "order"), "chooseOrder", { first: "metallic" })), "transfer");
  let wrong = act(s, "ionicTransfer", { particle: "proton" });
  assert.equal(activeAtomLine(wrong).condition, "ionic-proton-error"); assert.equal(wrong.ionic.transferred, false);
  s = reach(act(s, "ionicTransfer", { particle: "electron" }), "charges");
  wrong = act(act(s, "ionicPatch", { patch: { sodium: "-1", chloride: "+1", nuclei: "unchanged" } }), "chargesVerify");
  assert.equal(activeAtomLine(wrong).condition, "ionic-charge-error");
  assert.equal(wrong.metal.verified, true); assert.equal(wrong.evidence[0].id, "metallic");
  s = reach(act(act(s, "ionicPatch", { patch: { sodium: "+1", chloride: "-1", nuclei: "unchanged" } }), "chargesVerify"), "attraction");
  wrong = act(act(s, "ionicPatch", { patch: { attraction: "electron-sea" } }), "attractionVerify");
  assert.equal(activeAtomLine(wrong).condition, "ionic-electron-sea-error");
  s = reach(act(act(s, "ionicPatch", { patch: { attraction: "opposite-ions" } }), "attractionVerify"), "lattice");
  wrong = act(s, "latticeVerify", { extended: false });
  assert.equal(activeAtomLine(wrong).condition, "ionic-molecule-error"); assert.equal(wrong.ionic.verified, false);
});

test("removed comparison form resumes as narrative review without creating a correct response", () => {
  const original = models();
  const old = { ...original, cursor: 0, feedback: { ids: ["AD_S09_HAM_93_FINAL_NO_EVIDENCE"], cursor: 0 },
    comparison: { ...original.comparison, world: "2", particles: "colour" } };
  const restored = restoreAtomState(JSON.parse(JSON.stringify(old)));
  assert.equal(restored.feedback, null);
  assert.equal(restored.step, "comparisonTask");
  assert.equal(restored.comparison.world, "2", "historical inputs are retained");
  assert.deepEqual(restored.evidence, old.evidence);
  assert.equal(act(restored, "comparisonVerify"), restored);
  const next = reach(restored, "reflection");
  assert.equal(next.comparison.reviewed, true);
  assert.equal(next.comparison.supported, false);
  assert.equal(next.evidence.length, 2);
  assert.equal(atomNotebook(next).scene2.selectedOption, null);
  const forged = { ...createAtomState(), step: "comparisonTask", cursor: 1 };
  assert.equal(act(forged, "continue").step, "comparisonTask", "both reconstructions remain required");
});

test("recovery, reflection and exact five-MCQ assessment are gated; 80% passes and 60% cannot earn a badge", () => {
  const source = JSON.parse(fs.readFileSync("docs/atom-dive/07_learning_and_handoff/exit_ticket.json"));
  assert.deepEqual(ATOM_MEDIA.assessment, source);
  let s = models();
  s = reach(s, "reflection");
  assert.equal(recoverySupported(s), true);
  assert.equal(act(s, "reflectionSave"), s);
  s = act(s, "reflectionPatch", { patch: { formation: "Metal valence electrons delocalize; this ionic example transfers an electron.", attraction: "Metal cores attract delocalized electrons; cations and anions attract in the ionic lattice." } });
  s = reach(act(s, "reflectionSave"), "assessment");
  assert.equal(act(s, "assess"), s);
  for (const wrong of [1, 2]) {
    const answers = Object.fromEntries(source.questions.map((q, index) => [q.id, index < wrong ? Object.keys(q.options).find(id => id !== q.answer) : q.answer]));
    const graded = act({ ...s, answers }, "assess");
    assert.equal(graded.result.score, wrong === 1 ? 80 : 60);
    assert.equal(graded.result.passed, wrong === 1);
    assert.equal(activeAtomLine(graded).condition, wrong === 1 ? "assessment-pass" : "assessment-review");
    assert.equal(act(graded, "answer", { id: "AD_Q1", answer: "B" }), graded);
    const notebook = atomNotebook(graded);
    assert.equal(notebook.investigation.evidence.length, 2);
    assert.equal(notebook.scene2.consequence, "route-restored");
    assert.match(notebook.reflection, /delocalize/);
  }
  assert.equal(gradeAtom({}), null);
});

test("normal dialogue sequences never contain error recordings; question replay does not bypass checkpoints", () => {
  for (const step of Object.values(ATOM_STEPS)) for (const id of step.lines || []) assert.ok(!id.includes("ERROR"));
  const s = createAtomState();
  assert.equal(act(s, "readQuestion", { id: "AD_S12_HAM_07_ASSESSMENT_PASS" }), s);
  assert.equal(act(s, "readQuestion", { id: "AD_S12_HAM_02_QUESTION_1_READ" }), s);
  assert.equal(act(s, "video", { id: "AD_V05_find_orbit.mp4", status: "played" }), s);
});
