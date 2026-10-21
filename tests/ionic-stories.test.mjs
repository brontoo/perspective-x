import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { IONIC_SCENARIOS } from "../src/data/ionicMissions.mjs";
import { IONIC_STORIES, storyImage, outcomeFilm } from "../src/data/ionicStories.mjs";

test("both chemistry missions have complete visual-novel chapters and evidence-first scripts", () => {
  assert.deepEqual(Object.keys(IONIC_STORIES).sort(), Object.keys(IONIC_SCENARIOS).sort());
  for (const [id, scenario] of Object.entries(IONIC_SCENARIOS)) {
    const script = IONIC_STORIES[id];
    assert.ok(script.intro.length >= 7);
    assert.ok(script.investigation.length >= 6);
    assert.ok(script.decision.length >= 2);
    assert.ok(script.ending.length);
    assert.equal(script.firstChoices.filter(o => o.correct).length, 1);
    assert.equal(script.firstChoices.length, 4);
    for (const [key, outcome] of Object.entries(scenario.scenes[2].consequences)) {
      assert.ok(script.outcomes[key]?.length >= 2, id + " missing outcome " + key);
      assert.match(outcome.message, /./);
      assert.match(outcomeFilm(id, key), /\.mp4$/);
    }
    for (const line of [...script.intro, ...script.investigation, ...script.decision, ...script.ending, ...Object.values(script.outcomes).flat()]) {
      assert.ok(line.id && line.art && line.speaker && line.line, "Incomplete dialogue line");
      assert.ok(storyImage(id, line.art).startsWith("/images/"));
      assert.ok(!/<script|<iframe/i.test(line.line));
    }
    assert.equal(script.production.scenes.length >= 10, true);
  }
});
test("aquarium remains fictional at Al Qana; success requires isolated evidence-based review", () => {
  const aquarium = IONIC_STORIES.ionic_aquarium_mystery;
  assert.match(aquarium.location, /Al Qana/);
  assert.match(aquarium.intro.map(b => b.line).join(" "), /animal exhibits are unaffected/);
  assert.match(aquarium.outcomes["acid-tank"].map(b => b.line).join(" "), /blocks the proposed acid/);
  assert.match(aquarium.outcomes["isolate-review"].map(b => b.line).join(" "), /qualified staff/);
  assert.ok(!aquarium.location.includes("Yas Island"));
});
test("dessert keeps original jars sealed and the verified ingredient outcome", () => {
  const dessert = IONIC_STORIES.ionic_dessert_mystery;
  assert.match(dessert.intro.map(b => b.line).join(" "), /sealed jars/);
  assert.match(dessert.outcomes["verify-replace"].map(b => b.line).join(" "), /traceable food-grade/);
  assert.match(dessert.outcomes.taste.map(b => b.line).join(" "), /before anybody opens/);
});
test("story widget is mounted at every ionic stage without changing assessment or decisions", async () => {
  const source = await readFile(new URL("../src/components/scenario/ionic/IonicMission.jsx", import.meta.url), "utf8");
  assert.match(source, /<IonicStory scenario=\{scenario\} stage="briefing"/);
  assert.match(source, /stage=\{stage\} responses=\{responses\}/);
  assert.match(source, /<IonicInvestigation/);
  assert.match(source, /<MakeTheCall/);
  assert.match(source, /<Outcome/);
  assert.match(source, /<Assessment/);
  assert.match(source, /Accept assignment →/);
});
