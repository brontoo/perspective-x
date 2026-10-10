import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { HERO_SOURCE, CLOUD_REGIONS, coverGeometry, polygonCoverage } from "../src/components/landing/cinematicMotionGeometry.js";

test("the approved source remains byte-for-byte intact", async () => {
  assert.deepEqual(HERO_SOURCE, { width: 1448, height: 1086 });
  const image = await readFile(new URL("../public/images/perspective/home-cinematic.webp", import.meta.url));
  assert.equal(createHash("sha256").update(image).digest("hex"), "12f045eca29760bdddcb4bf6bdd6310d2378b52127f3c569b581fe55d3bc3203");
});

test("cover registration uses the CSS remaining-space rule on both crop axes", () => {
  const portrait = coverGeometry(390, 844, 1448, 1086, "60% 50%");
  assert.equal(portrait.scale, 844 / 1086);
  assert.equal(portrait.offsetY, 0);
  assert.equal(portrait.offsetX, (390 - 1448 * portrait.scale) * .6);
  const wide = coverGeometry(1920, 900, 1448, 1086, "50% 50%");
  assert.equal(wide.scale, 1920 / 1448);
  assert.equal(wide.offsetX, 0);
  assert.equal(wide.offsetY, (900 - 1086 * wide.scale) / 2);
  assert.equal(coverGeometry(800, 600, 1448, 1086, "12px -4px").offsetY, -4);
  assert.throws(() => coverGeometry(800, 600, 1448, 1086, "calc(50% + 2px) center"));
  assert.throws(() => coverGeometry(0, 600, 1448, 1086, "50% 50%"));
});

test("feathering stays inside the mask and all protected landmarks stay static", () => {
  const square = [[0,0],[100,0],[100,100],[0,100]];
  assert.equal(polygonCoverage(-1, 50, square), 0);
  assert.equal(polygonCoverage(0, 50, square), 0);
  assert.equal(polygonCoverage(50, 50, square), 1);
  assert.ok(polygonCoverage(5, 50, square) < polygonCoverage(15, 50, square));
  // Hair edges, face, ear, neck, body, sun, Burj Khalifa, mountains and flowers.
  for (const [x,y] of [[688,340],[920,365],[820,350],[748,378],[826,458],[880,650],[1102,512],[1320,370],[300,390],[250,760]]) {
    for (const { points } of CLOUD_REGIONS) assert.equal(polygonCoverage(x, y, points), 0);
  }
  for (let y = 215; y <= 950; y += 5) {
    for (let x = 640; x <= 990; x += 5) {
      for (const { points } of CLOUD_REGIONS) assert.equal(polygonCoverage(x, y, points), 0, `Protected character at ${x},${y}`);
    }
  }
});
