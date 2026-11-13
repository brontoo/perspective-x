import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import {
  DESSERT_MEDIA,
  DESSERT_NODES,
  DESSERT_OUTCOMES,
  dessertAudioRoutes,
  dessertStep,
  dessertActiveLine,
  dessertNotebook,
  restoreDessertState,
  measurementsComplete,
} from "../src/data/dessertFlow.mjs";
import {
  dessertScenario,
  dessertAct as act,
  dessertReady as ready,
  dessertCheckpoint as checkpoint,
} from "./support/dessert-checkpoints.mjs";

test("Dessert keeps its existing ID and exact five scientific questions and 80% threshold", () => {
  assert.equal(dessertScenario.id, "ionic_dessert_mystery");
  assert.equal(dessertScenario.exitTicket.mcqs.length, 5);
  assert.deepEqual(
    dessertScenario.exitTicket.mcqs.map((q) => q.id),
    ["d1", "d2", "d3", "d4", "d5"],
  );
});
test("28 real stills, six original videos and 217 original recordings retain all scripts; only 100 editorially approved recordings have active routes", () => {
  assert.equal(Object.keys(DESSERT_MEDIA.images).length, 28);
  assert.equal(Object.keys(DESSERT_MEDIA.videos).length, 6);
  const routes = dessertAudioRoutes();
  assert.equal(Object.keys(routes).length, 100);
  for (const [id, r] of Object.entries(DESSERT_MEDIA.recordings)) {
    if (routes[id]) assert.ok(routes[id].length);
    assert.ok(r.duration > 0);
    assert.equal(fs.readFileSync(r.sourceScript, "utf8").trim(), r.text);
    assert.equal(
      createHash("sha256")
        .update(fs.readFileSync("public" + r.audio))
        .digest("hex"),
      r.sha256,
    );
  }
  for (const [id, v] of Object.entries(DESSERT_MEDIA.videos)) {
    assert.ok(v.embeddedAudio);
    assert.ok(v.playbackMuted);
    assert.ok(v.duration > 0);
    assert.ok(fs.existsSync("public" + v.end));
    assert.equal(id, v.id);
  }
  assert.equal(DESSERT_NODES.n04.videoAt, "CH01_SC04_002_NARRATOR");
});
for (const [choice, scene] of [
  ["appearance", 8],
  ["taste", 9],
  ["mix", 10],
])
  test(`initial ${choice} proposal is prevented or corrected, retains evidence and returns to choice`, () => {
    const s = checkpoint("first");
    const wrong = act(s, "firstChoice", { choice });
    assert.equal(dessertStep(wrong).scene, scene);
    assert.deepEqual(wrong.investigation.evidence, []);
    assert.equal(wrong.investigation.calibrated, false);
    const revised = ready(wrong);
    assert.equal(dessertStep(revised).task, "first");
    assert.equal(revised.firstAttempts.length, 1);
    const safe = ready(act(revised, "firstChoice", { choice: "controlled" }));
    assert.equal(dessertStep(safe).task, "calibrate");
  });
test("watching media never measures a sample or skips an unanswered task; calibration precedes conductivity", () => {
  let s = checkpoint("calibrate");
  assert.equal(act(s, "continue"), s);
  const after = act(
    {
      ...checkpoint("sample-a"),
      investigation: {
        ...checkpoint("sample-a").investigation,
        calibrated: false,
      },
    },
    "measure",
    { sample: "A" },
  );
  assert.equal(
    after.investigation.evidence.some((e) => e.id === "A-conductivity"),
    false,
  );
  s = ready(act(s, "calibrate"));
  assert.equal(s.investigation.calibrated, true);
  assert.equal(s.investigation.evidence[0].id, "control");
});
test("all nine controlled observations and the NaCl transfer are required for identification; failed assignments retain data", () => {
  let s = checkpoint("identity");
  assert.equal(measurementsComplete(s), true);
  assert.equal(
    s.investigation.evidence.filter((e) => /^[ABC]-/.test(e.id)).length,
    9,
  );
  s = act(s, "identities", {
    values: { A: "sodium-chloride", B: "sugar", C: "hydrogen-carbonate" },
  });
  const wrong = act(s, "identify");
  assert.equal(wrong.investigation.identified, false);
  assert.equal(wrong.investigation.attempts.length, 1);
  assert.equal(dessertActiveLine(wrong).id, "CH02_SC19_WRONG_HAMAD");
  const missing = {
    ...s,
    investigation: {
      ...s.investigation,
      evidence: s.investigation.evidence.filter((e) => e.id !== "B-pH"),
    },
  };
  assert.equal(act(missing, "identify").investigation.identified, false);
  const revised = ready(wrong);
  assert.deepEqual(
    revised.investigation.identities,
    s.investigation.identities,
  );
  assert.equal(
    ready(
      act(
        act(revised, "identities", {
          values: { A: "sugar", B: "hydrogen-carbonate", C: "sodium-chloride" },
        }),
        "identify",
      ),
    ).node,
    "n22",
  );
});
for (const letter of ["A", "B", "C", "D"])
  test(`committed ${letter} routes only to its own cinematic ending and is immutable after submission`, () => {
    const s = checkpoint("ending", letter),
      n = dessertStep(s);
    assert.equal(s.decision.consequence, DESSERT_OUTCOMES[letter]);
    assert.equal(n.video, `V0${["A", "B", "C", "D"].indexOf(letter) + 3}`);
    assert.ok(n.lines.every((id) => id.startsWith(`CH04_END_${letter}_`)));
    assert.equal(
      act(s, "decisionDraft", { patch: { selectedOption: "A" } }),
      s,
    );
    assert.ok(s.decision.evidenceCitations.length >= 2);
    assert.ok(s.decision.justification.length >= 60);
  });
test("decision rejects missing justification and citations; no unsupported result is committed", () => {
  let s = checkpoint("decision");
  s = act(s, "decisionDraft", {
    patch: { selectedOption: "A", justification: "short" },
  });
  assert.equal(
    act(s, "decide").notice,
    "Provide a justification of at least sixty characters.",
  );
  assert.equal(s.decision, null);
  s = act(s, "decisionDraft", {
    patch: {
      justification:
        "A scientifically defensible decision requires traceability, control of unknown ingredients and independently collected observations.",
    },
  });
  assert.equal(
    act(s, "decide").notice,
    "Select at least two pieces of evidence.",
  );
});
for (const wrong of [0, 1, 2])
  test(`five-question grading with ${wrong} wrong respects exact-once submission and pass/retry isolation`, () => {
    let s = checkpoint("assessment");
    const answers = { ...s.answers };
    for (let i = 0; i < wrong; i++) {
      const q = dessertScenario.exitTicket.mcqs[i];
      answers[q.id] = q.options.find((o) => !o.correct).id;
    }
    s = act({ ...s, answers }, "assess");
    assert.equal(s.result.score, 100 - 20 * wrong);
    assert.equal(s.result.passed, wrong < 2);
    assert.equal(act(s, "assess"), s);
    assert.equal(s.feedback, null);
    assert.equal(s.node, "done");
    assert.equal(s.completed, true);
    const done = ready(s);
    assert.equal(done.completed, true);
    assert.equal(done.result.mcq_answers.length, 5);
  });
test("old drafts retain genuine observations and assessed records; migration does not fabricate missing tests", () => {
  const old = checkpoint("ph"),
    record = dessertNotebook(old);
  delete record.dessertStory;
  const restored = restoreDessertState(record);
  assert.deepEqual(restored.investigation.evidence, old.investigation.evidence);
  assert.equal(restored.node, "n17");
  assert.equal(restored.investigation.identified, false);
  assert.equal(restoreDessertState({}).node, "n01");
});
