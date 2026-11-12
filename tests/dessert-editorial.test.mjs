import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import {
  DESSERT_EDITORIAL,
  isDessertLineActive,
  sanitizeDessertTrail,
} from "../src/data/dessertEditorial.mjs";
import {
  DESSERT_NODES,
  DESSERT_MEDIA,
  dessertAudioRoutes,
  restoreDessertState,
  dessertActiveLine,
  dessertNotebook,
} from "../src/data/dessertFlow.mjs";
import {
  dessertCheckpoint as checkpoint,
  dessertReady as ready,
  dessertAct as act,
} from "./support/dessert-checkpoints.mjs";

test("malformed historical review metadata remains readable without crashing or scheduling unknown media", () => {
  assert.deepEqual(sanitizeDessertTrail({ old: "format" }), []);
  assert.deepEqual(
    sanitizeDessertTrail([
      null,
      { lines: {} },
      { lines: [null, { id: "not-an-approved-recording" }] },
    ]),
    [],
  );
});

test("the authoritative 100 KEEP / 117 CUT partition preserves all original assets and exact source captions", () => {
  const { keep, cut, sourceHashes } = DESSERT_EDITORIAL;
  assert.equal(keep.length, 100);
  assert.equal(cut.length, 117);
  assert.equal(new Set([...keep, ...cut]).size, 217);
  assert.deepEqual(Object.keys(dessertAudioRoutes()).sort(), [...keep].sort());
  for (const [name, sha] of Object.entries(sourceHashes))
    assert.equal(
      createHash("sha256")
        .update(fs.readFileSync("production-archive/dessert/EDITORIAL/" + name))
        .digest("hex"),
      sha,
    );
  for (const id of [...keep, ...cut])
    assert.ok(fs.existsSync("public" + DESSERT_MEDIA.recordings[id].audio));
  assert.equal(DESSERT_NODES.n21, undefined);
  assert.equal(DESSERT_NODES.n20.next, "n22");
  assert.ok(
    Object.values(DESSERT_NODES).every(
      (n) => n.art !== "IMAGE_21" && n.lines.every(isDessertLineActive),
    ),
  );
});

test("silent validation stays visible without an empty audio beat, invented evidence or an automatic decision", () => {
  const s = checkpoint("decision");
  const missing = act(s, "decide");
  assert.equal(missing.feedback, null);
  assert.equal(missing.ready, true);
  assert.equal(dessertActiveLine(missing), undefined);
  assert.equal(missing.decision, null);
  assert.match(missing.notice, /Select an option/i);
  assert.deepEqual(missing.investigation, s.investigation);
  const question = checkpoint("question");
  const unselected = act(question, "recordAnswer");
  assert.equal(unselected.node, question.node);
  assert.equal(unselected.feedback, null);
  assert.equal(unselected.result, null);
  assert.match(unselected.notice, /Select an option/i);
});

for (const ending of ["A", "B", "C", "D"])
  test(`shortened ${ending} route preserves every action, has four ending lines, and schedules no CUT or scene 21`, () => {
    const done = ready(act(checkpoint("assessment", ending), "assess"));
    assert.equal(done.completed, true);
    assert.equal(done.result.score, 100);
    assert.equal(done.visited.length, 76);
    assert.ok(
      done.visited.every(
        (row) => isDessertLineActive(row.id) && row.scene !== 21,
      ),
    );
    const endingIds = done.visited
      .filter((row) => row.id.startsWith("CH04_END_"))
      .map((row) => row.id);
    assert.equal(endingIds.length, 4);
    assert.ok(endingIds.every((id) => id.startsWith(`CH04_END_${ending}_`)));
    assert.deepEqual(
      done.visited
        .filter((row) => [19, 20, 22].includes(row.scene))
        .map((row) => row.scene)
        .filter((v, i, a) => i === 0 || a[i - 1] !== v),
      [19, 20, 22],
    );
    assert.equal(
      done.investigation.evidence.filter((e) => /^[ABC]-/.test(e.id)).length,
      9,
    );
    assert.deepEqual(done.investigation.electron, {
      kind: "NaCl",
      transferred: 1,
    });
    const seconds = done.visited.reduce(
      (n, row) => n + DESSERT_MEDIA.recordings[row.id].duration,
      0,
    );
    assert.ok(seconds < 600);
    if (ending === "A") assert.ok(Math.abs(seconds - 571.899) < 0.01);
  });

for (const [node, cursor, expected, readyFlag] of [
  ["n01", 0, "n01", false],
  ["n01", 1, "n01", false],
  ["n04", 0, "n04", false],
  ["n14", 0, "n14", true],
  ["n12", 2, "n12", true],
  ["n21", 0, "n22", false],
])
  test(`version-2 ${node}/${cursor} resumes at a valid retained checkpoint without loss of scientific work`, () => {
    const original = {
      ...checkpoint("decision"),
      version: 2,
      node,
      cursor,
      ready: false,
      feedback: null,
      playback: { line: "CH03_SC21_001_HAMAD", time: 9 },
    };
    const migrated = restoreDessertState({ dessertStory: original });
    assert.equal(migrated.version, 3);
    assert.equal(migrated.node, expected);
    assert.equal(migrated.ready, readyFlag);
    assert.deepEqual(migrated.investigation, original.investigation);
    assert.equal(migrated.playback, null);
    if (!migrated.ready)
      assert.ok(isDessertLineActive(dessertActiveLine(migrated).id));
  });

test("a removed-only saved feedback queue moves to its real target without waiting; retained native positions survive reload", () => {
  const original = {
    ...checkpoint("decision"),
    version: 2,
    node: "n19",
    ready: false,
    feedback: {
      ids: [
        "SYSTEM_IDENTIFICATION_SUPPORTED_SYSTEM",
        "CH02_SC19_COMPLETE_NARRATOR",
      ],
      cursor: 0,
      after: "n20",
    },
  };
  const migrated = restoreDessertState({ dessertStory: original });
  assert.equal(migrated.node, "n20");
  assert.equal(migrated.feedback, null);
  assert.deepEqual(migrated.investigation, original.investigation);
  const kept = {
    ...checkpoint("decision"),
    node: "n20",
    cursor: 1,
    ready: false,
    feedback: null,
    playback: { line: "CH03_SC20_003_FATIMA", time: 1.2 },
  };
  const resumed = restoreDessertState(dessertNotebook(kept));
  assert.deepEqual(resumed.playback, kept.playback);
  assert.equal(dessertActiveLine(resumed).id, kept.playback.line);
});

test("old CUT dialogue remains archived while Previous Scene only receives retained audio and excludes IMAGE_21", () => {
  const cut = { id: "CH03_SC21_001_HAMAD", node: "n21", scene: 21 };
  const kept = { id: "CH03_SC20_001_MARIAM", node: "n20", scene: 20 };
  const migrated = restoreDessertState({
    dessertStory: {
      ...checkpoint("decision"),
      version: 2,
      visited: [kept, cut],
    },
  });
  assert.deepEqual(migrated.archivedDialogue, [cut]);
  assert.deepEqual(migrated.visited, [kept]);
  const trail = sanitizeDessertTrail([
    {
      key: "ionic_dessert_mystery:IMAGE_21",
      art: "/IMAGE_21.webp",
      lines: [cut],
    },
    {
      key: "ionic_dessert_mystery:IMAGE_20",
      lines: [kept, { id: "CH03_SC20_002_SAEED" }],
    },
  ]);
  assert.equal(trail.length, 1);
  assert.deepEqual(trail[0].lines, [kept]);
});
