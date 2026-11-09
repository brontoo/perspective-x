import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { crystalPoints } from "../src/data/atomCrystal.mjs";
import { recordSceneVisit, previousVisitedScene } from "../src/lib/expedition/sceneTrail.mjs";
import { atomMovie, ATOM_WITHHELD_VIDEOS, atomArt } from "../src/data/atomPresentation.mjs";

test("NaCl rock-salt fragment has equal populations, FCC sublattices and six nearest opposite neighbours", () => {
  const points = crystalPoints("ionic");
  assert.equal(points.length, 64);
  assert.equal(points.filter(p => p.positive).length, 32);
  const centre = points.find(p => p.position.join() === "1,1,1");
  const distance2 = p => p.position.reduce((sum, n, i) => sum + (n - centre.position[i]) ** 2, 0);
  const neighbours = points.filter(p => distance2(p) === 1);
  assert.equal(neighbours.length, 6);
  assert.ok(neighbours.every(p => p.positive !== centre.positive));
  assert.equal(points.filter(p => distance2(p) === 2 && p.positive === centre.positive).length, 12);
});
test("metal fragment and four-core reconstruction use FCC positions of one identical core type", () => {
  const metal = crystalPoints("metallic");
  assert.equal(metal.length, 32);
  assert.ok(metal.every(p => p.positive && p.position.reduce((a,b) => a+b,0) % 2 === 0));
  const compact = crystalPoints("metallic", true);
  assert.equal(compact.length, 4);
  assert.ok(compact.every(p => p.positive));
});
test("scene trail follows visited physical route, updates only current visit and never reveals future branches", () => {
  let trail = recordSceneVisit([], { key: "launch", title: "Choose route" }, { id: "choice", text: "Choose" });
  assert.equal(previousVisitedScene(trail), null);
  trail = recordSceneVisit(trail, { key: "ionic", title: "Ionic" }, { id: "ionic-entry", text: "Ions" });
  trail = recordSceneVisit(trail, { key: "ionic", title: "Ionic" }, { id: "ionic-feedback", text: "Verified" });
  assert.deepEqual(trail.map(s => s.key), ["launch", "ionic"]);
  assert.equal(previousVisitedScene(trail).key, "launch");
  const unchanged = recordSceneVisit(trail, { key: "ionic", title: "Ionic" }, { id: "ionic-feedback", text: "Verified" });
  assert.equal(unchanged, trail);
  trail = recordSceneVisit(trail, { key: "metallic", title: "Metallic" }, { id: "metal-entry", text: "Cores" });
  assert.equal(previousVisitedScene(trail).key, "ionic");
  assert.ok(!trail.flatMap(s => s.lines).some(line => line.id === "future-recovery"));
});
test("five conflicting movies are explicitly withheld and V06 is preserved; revised still files exist", () => {
  assert.equal(Object.keys(ATOM_WITHHELD_VIDEOS).length, 5);
  for (const id of Object.keys(ATOM_WITHHELD_VIDEOS)) assert.equal(atomMovie(id).withheld, true);
  assert.equal(atomMovie("AD_V06_homecoming.mp4").withheld, false);
  for (const scene of ["S02","S03"]) assert.ok(fs.existsSync("public" + atomArt(scene)));
  for (const scene of ["S04","S05","S07","S08","S10"]) assert.equal(atomArt(scene), null);
});
