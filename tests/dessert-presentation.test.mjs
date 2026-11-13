import test from "node:test";
import assert from "node:assert/strict";
import { verifiedDessertTotal } from "../src/data/dessertAwards.mjs";
import {
  dessertCheckpoint,
  dessertAct,
} from "./support/dessert-checkpoints.mjs";
import {
  dessertNextLine,
  restoreDessertState,
} from "../src/data/dessertFlow.mjs";

test("verified cumulative points never use assessment percentage or an assumed per-mission award", () => {
  assert.equal(verifiedDessertTotal({ score: 100, points_awarded: 37 }), null);
  assert.equal(verifiedDessertTotal({ total_points: 150, score: 80 }), 150);
  assert.equal(verifiedDessertTotal({ total_points: "0", score: 100 }), 0);
  for (const value of [true, false, [], {}, " ", null, "not numeric", Infinity])
    assert.equal(verifiedDessertTotal({ total_points: value }), null);
  assert.equal(verifiedDessertTotal({ total_points: -5 }), -5);
});

test("assessment completes directly once and old narrated results resume at the concise result without replay", () => {
  const submitted = dessertAct(dessertCheckpoint("assessment"), "assess");
  assert.equal(submitted.node, "done");
  assert.equal(submitted.completed, true);
  assert.equal(submitted.feedback, null);
  assert.equal(submitted.result.mcq_answers.length, 5);
  assert.equal(dessertAct(submitted, "assess"), submitted);
  const old = {
    ...submitted,
    version: 3,
    completed: false,
    node: "assessment-submit",
    feedback: { ids: ["CH05_Q01_CORRECT_HAMAD"], cursor: 0, after: "pass" },
  };
  const restored = restoreDessertState({ dessertStory: old });
  assert.equal(restored.node, "done");
  assert.equal(restored.feedback, null);
  assert.deepEqual(restored.result, old.result);
  assert.deepEqual(restored.investigation, old.investigation);
});

test("next-recording preparation crosses a known narrative scene boundary but never guesses a decision branch", () => {
  const s = {
    ...dessertCheckpoint("first"),
    node: "n02",
    cursor: 1,
    ready: false,
    feedback: null,
  };
  assert.equal(dessertNextLine(s).id, "CH01_SC03_001_NARRATOR");
  const choice = dessertCheckpoint("decision");
  assert.equal(dessertNextLine(choice), undefined);
});
