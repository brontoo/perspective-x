import { test } from "node:test";
import assert from "node:assert/strict";
import {
  answersOf,
  passedIds,
  nextMission,
  canOpenMission,
  missionState,
  rankRows,
} from "../src/lib/perspective/progress.mjs";
const scenarios = { a: { title: "A" }, b: { title: "B" }, c: { title: "C" } };
const roles = {
  r: { id: "r", scenarios: ["a", "b"] },
  s: { id: "s", scenarios: ["c"] },
};
const date = "2026-10-09T12:00:00Z";
test("notes, malformed scores and undated rows never award progress", () => {
  assert.deepEqual(
    passedIds(
      [
        {
          scenario_id: "a",
          answers: { notebook: { evidenceNotes: "note" } },
          completed_at: date,
        },
        { scenario_id: "a", score: null, completed_at: date },
        { scenario_id: "a", score: "not a score", completed_at: date },
        { scenario_id: "a", score: 100 },
      ],
      scenarios,
    ),
    [],
  );
  assert.equal(
    missionState({ score: null, completed_at: date }),
    "Saved notes",
  );
});
test("deduplicates passing missions without treating failed attempts as passes", () => {
  const rows = [
    { scenario_id: "a", score: 80, completed_at: date },
    { scenario_id: "a", score: 95, completed_at: date },
    { scenario_id: "b", score: 79, completed_at: date },
  ];
  assert.deepEqual(passedIds(rows, scenarios), ["a"]);
  assert.equal(nextMission(rows, scenarios, roles, {}).id, "b");
});
test("teacher locks win over passing history and sequential unlocks", () => {
  assert.equal(
    canOpenMission("a", roles, ["a"], { a: { is_locked: true } }),
    false,
  );
  assert.equal(canOpenMission("b", roles, [], {}), false);
  assert.equal(canOpenMission("b", roles, ["a"], {}), true);
  assert.equal(
    nextMission([], scenarios, roles, { a: { is_locked: true } }).id,
    "c",
  );
});
test("malformed historical answers remain readable and do not crash", () => {
  assert.deepEqual(answersOf({ answers: "broken json" }), {});
  assert.deepEqual(
    answersOf({ answers: '{"notebook":{"evidenceNotes":"original"}}' }),
    { notebook: { evidenceNotes: "original" } },
  );
});
test("rank sorting uses points and stable ID, never screenshot order", () => {
  const input = [
    { id: "b", total_points: 10 },
    { id: "a", total_points: 10 },
    { id: "c", total_points: 20 },
  ];
  assert.deepEqual(
    rankRows(input).map((r) => r.id),
    ["c", "a", "b"],
  );
  assert.equal(input[0].id, "b");
});
