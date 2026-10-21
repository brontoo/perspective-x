import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const { PNG } = createRequire(import.meta.url)("../node_modules/playwright-core/lib/utilsBundle.js");
const load = async path => PNG.sync.read(await readFile(new URL(path, import.meta.url)));
const inside = (x, y, [left, top, right, bottom]) => x >= left && x <= right && y >= top && y <= bottom;

test("homepage flyaway retouch preserves every pixel outside its local masks and the protected portrait", async () => {
  const sourcePath = new URL("../public/images/perspective/home-hijab-reference-hd.png", import.meta.url);
  assert.equal(createHash("sha256").update(await readFile(sourcePath)).digest("hex"), "9325005d7e7eb26ae870acd81d19473b28460fd5915c11a3c90a31533387dbf1");
  const [before, after, mask] = await Promise.all([
    load("../public/images/perspective/home-hijab-reference-hd.png"),
    load("../public/images/perspective/home-hijab-retouched.png"),
    load("../docs/homepage-retouch/selection-mask.png"),
  ]);
  for (const image of [before, after, mask]) assert.deepEqual([image.width, image.height], [1888, 833]);
  const allowed = [[625, 270, 960, 620], [940, 10, 1245, 255]];
  const protectedAreas = [[1000, 90, 1200, 310], [970, 310, 1410, 750], [800, 512, 1015, 740]];
  let changed = 0;
  for (let y = 0; y < before.height; y++) for (let x = 0; x < before.width; x++) {
    const index = (y * before.width + x) * 4;
    if (mask.data[index] > 0) {
      assert.ok(allowed.some(rect => inside(x, y, rect)), `Retouch mask escaped the hair regions at ${x},${y}`);
      assert.ok(!protectedAreas.some(rect => inside(x, y, rect)), `Retouch mask overlaps the protected portrait at ${x},${y}`);
    }
    if ([0, 1, 2, 3].some(channel => before.data[index + channel] !== after.data[index + channel])) {
      changed++;
      assert.ok(mask.data[index] > 0, `Unrelated pixel changed at ${x},${y}`);
    }
  }
  assert.ok(changed > 0, "The asset must contain the actual cleanup");
  assert.ok(changed < before.width * before.height * 0.06, "Cleanup must remain local to the flyaways");
});

test("remaining crown, temple, and scarf strands are cleaned without altering face or unrelated pixels", async () => {
  const source = new URL("../public/images/perspective/home-hijab-retouched.png", import.meta.url);
  assert.equal(createHash("sha256").update(await readFile(source)).digest("hex"), "7d610f1e5d4f5b52e2d3dd8a93641047304727415b31f29d1009be80ea035794");
  const [before, after, mask, face] = await Promise.all([
    load("../public/images/perspective/home-hijab-retouched.png"),
    load("../public/images/perspective/home-hijab-clean.png"),
    load("../docs/homepage-retouch/remaining-strands-selection-mask.png"),
    load("../docs/homepage-retouch/protected-face-mask.png"),
  ]);
  for (const image of [before, after, mask, face]) assert.deepEqual([image.width, image.height], [1888, 833]);
  const allowed = [[880, 0, 1280, 345], [765, 325, 965, 525]];
  const protectedAreas = [[1050, 350, 1410, 750], [800, 512, 1015, 740]];
  let changed = 0;
  for (let y = 0; y < before.height; y++) for (let x = 0; x < before.width; x++) {
    const index = (y * before.width + x) * 4;
    if (mask.data[index] > 0) {
      assert.ok(allowed.some(rect => inside(x, y, rect)), `Cleanup escaped the head/scarf at ${x},${y}`);
      assert.equal(face.data[index], 0, `Cleanup touches the original face at ${x},${y}`);
      assert.ok(!protectedAreas.some(rect => inside(x, y, rect)), `Cleanup touches body or tablet at ${x},${y}`);
    }
    if ([0, 1, 2, 3].some(channel => before.data[index + channel] !== after.data[index + channel])) {
      changed++;
      assert.ok(mask.data[index] > 0, `Unrelated pixel changed at ${x},${y}`);
      assert.equal(face.data[index], 0, `Facial pixel changed at ${x},${y}`);
    }
  }
  assert.ok(changed > 0 && changed < before.width * before.height * 0.08);
});
