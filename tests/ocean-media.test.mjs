import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  OCEAN_DIALOGUE,
  OCEAN_VIDEOS,
  OCEAN_BRIEFING,
  OCEAN_INVESTIGATION,
  OCEAN_DECISION,
  OCEAN_ASSESSMENT,
  OCEAN_FIRST_FEEDBACK,
  oceanOutcome,
  oceanLines,
} from "../src/data/oceanDome.mjs";
import {
  IONIC_STORIES,
  storyImage,
  outcomeFilm,
} from "../src/data/ionicStories.mjs";
import { IONIC_SCENARIOS } from "../src/data/ionicMissions.mjs";
const root = new URL("../public/", import.meta.url);
const local = (path) => new URL(path.slice(1), root);
const inventory = JSON.parse(
  readFileSync(
    new URL("../docs/ocean-dome/asset-inventory.json", import.meta.url),
  ),
);

test("all imported originals retain their audited bytes, magic and dimensions/durations", () => {
  assert.equal(inventory.assets.length, 113);
  assert.equal(inventory.assets.filter((a) => a.kind === "image").length, 15);
  assert.equal(inventory.assets.filter((a) => a.kind === "video").length, 6);
  assert.equal(inventory.assets.filter((a) => a.kind === "audio").length, 92);
  for (const asset of inventory.assets) {
    const bytes = readFileSync(new URL("../" + asset.path, import.meta.url));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      asset.sha256,
    );
    if (asset.kind === "image") {
      assert.equal(bytes.subarray(0, 3).toString("hex"), "ffd8ff");
      assert.ok(asset.width >= 1376 && asset.height >= 768);
    } else assert.ok(asset.duration > 0);
    if (asset.kind === "video") {
      assert.equal(asset.videoCodec, "h264");
      assert.ok(asset.duration >= 10 && asset.duration < 10.1);
    }
  }
});
test("all twelve dedicated story images resolve including every early scene", () => {
  const s = IONIC_STORIES.ionic_aquarium_mystery;
  assert.equal(Object.keys(s.artMap).length, 12);
  for (const [art, file] of Object.entries(s.artMap)) {
    assert.ok(existsSync(local(storyImage("ionic_aquarium_mystery", art))));
    assert.equal(
      storyImage("ionic_aquarium_mystery", art),
      s.production.folder + file,
    );
    assert.ok(
      !storyImage("ionic_aquarium_mystery", art).includes("/images/ionic/"),
    );
  }
});
test("92 unique recordings match production scene/speaker order, actual paths and transcript audit", () => {
  const verification = JSON.parse(
    readFileSync(
      new URL("../docs/ocean-dome/audio-verification.json", import.meta.url),
    ),
  );
  assert.equal(OCEAN_DIALOGUE.length, 92);
  assert.equal(new Set(OCEAN_DIALOGUE.map((row) => row.id)).size, 92);
  assert.equal(verification.resolved, 92);
  assert.deepEqual(verification.unresolved, []);
  for (const row of OCEAN_DIALOGUE) {
    assert.match(
      row.id,
      new RegExp(
        `^OD_${row.sceneId}_${row.speakerCode}_${String(row.order).padStart(2, "0")}$`,
      ),
    );
    assert.ok(existsSync(local(row.audio)));
    assert.match(row.audio, new RegExp(`${row.id}.mp3.mp3$`));
    assert.ok(row.line.length > 10 && row.duration > 0);
    assert.equal(
      verification.recordings.find((r) => r.id === row.id).caption,
      row.line,
    );
  }
});
test("six films and all four endings map by consequence key, independent of choice lettering", () => {
  assert.equal(Object.keys(OCEAN_VIDEOS).length, 6);
  for (const path of Object.values(OCEAN_VIDEOS))
    assert.ok(existsSync(local(path)));
  const scenario = IONIC_SCENARIOS.ionic_aquarium_mystery;
  for (const choice of scenario.scenes[1].options) {
    const steps = oceanOutcome(choice.consequence);
    assert.equal(steps.length, 2);
    assert.equal(steps.filter((step) => step.video).length, 1);
    assert.equal(
      OCEAN_VIDEOS[steps[0].video],
      outcomeFilm(scenario.id, choice.consequence),
    );
    assert.ok(steps[0].lines.every((row) => row.branch === choice.consequence));
  }
  assert.equal(oceanOutcome(null).length, 0);
  assert.equal(oceanOutcome("incident").length, 0);
  assert.equal(
    oceanLines(14, [5, 6, 7])
      .map((r) => r.branch)
      .every((b) => b === "add-salt"),
    true,
  );
  assert.equal(
    oceanLines(14, [8, 9, 10])
      .map((r) => r.branch)
      .every((b) => b === "isolate-review"),
    true,
  );
});
test("the approved sequence reaches all 92 lines conditionally and gates experiments before feedback", () => {
  const lines = [
    ...OCEAN_BRIEFING,
    ...OCEAN_INVESTIGATION,
    ...OCEAN_DECISION,
    ...OCEAN_ASSESSMENT,
    ...Object.keys(OCEAN_VIDEOS).flatMap(oceanOutcome),
  ].flatMap((step) => [...step.lines, ...(step.after || [])]);
  lines.push(
    ...Object.values(OCEAN_FIRST_FEEDBACK).flat(),
    ...oceanLines(10, [4, 5, 6]),
    ...oceanLines(13, [3, 4, 5, 6, 7]),
    ...oceanLines(16, [2, 3, 4]),
  );
  assert.deepEqual(
    new Set(lines.map((line) => line.id)),
    new Set(OCEAN_DIALOGUE.map((line) => line.id)),
  );
  assert.deepEqual(
    OCEAN_BRIEFING.map((step) => step.scene),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    OCEAN_INVESTIGATION.map((step) => step.task),
    [
      "first",
      "calcium",
      "solubility",
      "carbonate",
      "interpret",
      "fingerprint",
      "formula",
      "crystal",
      "water",
      "identity",
    ],
  );
  const reaction = OCEAN_INVESTIGATION.findIndex(
    (step) => step.video === "carbonate",
  );
  assert.equal(OCEAN_INVESTIGATION[reaction - 1].task, "carbonate");
  assert.ok(
    OCEAN_ASSESSMENT.every((step) => step.lines.every((line) => !line.branch)),
  );
});
