import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import {
  ionicDessertTimeline,
  DESSERT_PHOTOGRAPHS,
} from "../src/data/cinematicMissions/ionicDessertTimeline.mjs";
import { ionicAquariumTimeline } from "../src/data/cinematicMissions/ionicAquariumTimeline.mjs";
import {
  restoreRuntime,
  nextRuntime,
  createRuntime,
  dessertCheckpointReady,
} from "../src/data/cinematicMissions/runtime.mjs";
import { CinematicDialogueEngine } from "../src/components/scenario/cinematic/CinematicDialogueEngine.mjs";
import {
  assignVoices,
  CinematicAudioController,
} from "../src/components/scenario/cinematic/CinematicAudioController.mjs";
const manifest = ionicDessertTimeline;
const evidence = [
  "control",
  ...["A", "B", "C"].flatMap((s) =>
    ["conductivity", "pH", "fizz"].map((t) => `${s}-${t}`),
  ),
].map((id) => ({ id }));
const investigation = {
  evidence,
  calibrated: true,
  electron: { kind: "NaCl", transferred: 1 },
  identities: { A: "sugar", B: "hydrogen-carbonate", C: "sodium-chloride" },
  submitted: true,
};

test("approved originals retain their exact hashes; every desktop/mobile derivative is genuine WebP", () => {
  const records = JSON.parse(
    fs.readFileSync("docs/ionic-cinematic/ASSETS.json", "utf8"),
  );
  assert.equal(records.length, 16);
  assert.equal(DESSERT_PHOTOGRAPHS.length, 16);
  for (const record of records) {
    assert.equal(
      crypto
        .createHash("sha256")
        .update(fs.readFileSync(record.source))
        .digest("hex"),
      record.sha256,
    );
    for (const path of [
      record.optimized,
      record.optimized.replace("/cinematic/", "/cinematic/mobile/"),
    ]) {
      const bytes = fs.readFileSync(path);
      assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
      assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
    }
  }
  for (const scene of Object.values(manifest.scenes)) {
    assert.ok(fs.existsSync("public" + scene.image));
    assert.ok(fs.existsSync("public" + scene.mobileImage));
  }
  assert.ok(
    Object.values(ionicAquariumTimeline.scenes).every(
      (s) => !s.image.includes("dessert"),
    ),
  );
});
test("narrative order stops at all four science/decision checkpoints and plays one outcome only", () => {
  let runtime = createRuntime(manifest.scenes.park);
  const order = [];
  for (let i = 0; i < 8; i++) {
    order.push(runtime.sceneId);
    runtime = nextRuntime(manifest, runtime);
  }
  assert.deepEqual(order, [
    "park",
    "finalists",
    "labels",
    "unknowns",
    "stop",
    "arrival",
    "assignment",
    "table",
  ]);
  assert.equal(runtime.interaction, "conductivity");
  assert.equal(nextRuntime(manifest, runtime).sceneId, "table");
  runtime = nextRuntime(manifest, runtime, { checkpointComplete: true });
  assert.equal(runtime.sceneId, "conductivity-clue");
  runtime = nextRuntime(manifest, runtime);
  runtime = nextRuntime(manifest, runtime);
  assert.equal(runtime.interaction, "electron");
  runtime = nextRuntime(manifest, runtime, { checkpointComplete: true });
  runtime = nextRuntime(manifest, runtime);
  assert.equal(runtime.interaction, "clues");
  runtime = nextRuntime(manifest, runtime, { checkpointComplete: true });
  runtime = nextRuntime(manifest, runtime);
  assert.equal(runtime.interaction, "decision");
  for (const key of [
    "verify-replace",
    "conductivity-only",
    "taste",
    "appearance",
  ]) {
    const branch = nextRuntime(manifest, runtime, {
      checkpointComplete: true,
      consequence: key,
    });
    assert.equal(branch.sceneId, key);
    assert.equal(nextRuntime(manifest, branch).sceneId, "reflection");
  }
  assert.equal(
    nextRuntime(manifest, runtime, {
      checkpointComplete: true,
      consequence: "invalid",
    }).sceneId,
    "decision",
  );
});
test("resume restores real evidence gates and cannot use elapsed clocks or fabricated completed checkpoints to skip science", () => {
  const forged = {
    cinematic: {
      sceneId: "decision",
      interaction: "decision",
      completedCheckpoints: ["conductivity", "electron", "clues"],
    },
    investigation: { ...investigation, evidence: [] },
  };
  assert.equal(
    restoreRuntime(manifest, "scene2", forged).interaction,
    "conductivity",
  );
  const partial = {
    ...investigation,
    electron: { kind: "NaCl", transferred: 0 },
  };
  assert.equal(
    restoreRuntime(manifest, "scene2", { ...forged, investigation: partial })
      .interaction,
    "electron",
  );
  assert.equal(dessertCheckpointReady("clues", investigation), true);
  assert.equal(
    restoreRuntime(manifest, "scene2", { ...forged, investigation })
      .interaction,
    "decision",
  );
  assert.equal(
    restoreRuntime(manifest, "exit", {
      investigation,
      scene2: { selectedOption: "A" },
    }).interaction,
    "reflection",
  );
  const restored = restoreRuntime(manifest, "scene1", {
    cinematic: { sceneId: "second-test", interaction: "clues" },
    investigation,
  });
  assert.equal(restored.sceneId, "second-test");
  assert.equal(restored.interaction, "clues");
  assert.equal(
    restoreRuntime(manifest, "scene2", {}, true).interaction,
    "decision",
  );
});
test("slow actual speech gates the image and next line; pause cancels speech and ignores stale completion", () => {
  const pending = [];
  let advances = 0,
    cancels = 0;
  const lines = [];
  const audio = {
    cancel() {
      cancels++;
    },
    speak(event, end, fallback) {
      pending.push({ event, end, fallback });
    },
  };
  const engine = new CinematicDialogueEngine({
    scene: {
      duration: 1,
      dialogue: [
        { id: "one", start: 0, text: "first sentence" },
        { id: "two", start: 0.5, text: "second sentence" },
      ],
    },
    audio,
    onLine: (e) => lines.push(e.id),
    onEnd: () => advances++,
    onCue: () => {},
  });
  engine.setPaused(false);
  for (let i = 0; i < 40; i++) engine.tick(100);
  assert.deepEqual(lines, ["one"]);
  assert.equal(advances, 0);
  engine.setPaused(true);
  pending[0].end();
  assert.equal(engine.index, 0);
  const elapsed = engine.elapsed;
  engine.tick(1000);
  assert.equal(engine.elapsed, elapsed);
  engine.setPaused(false);
  engine.tick(100);
  assert.deepEqual(lines, ["one", "one"]);
  pending[1].end();
  engine.tick(100);
  assert.deepEqual(lines, ["one", "one", "two"]);
  pending[2].end();
  engine.tick(100);
  assert.equal(advances, 1);
  assert.ok(cancels >= 2);
});
test("caption-only and muted story finish without speech, and voices are deterministic with graceful reuse", () => {
  const voices = [
    { name: "Samantha", lang: "en-US" },
    { name: "Daniel", lang: "en-GB" },
  ];
  assert.deepEqual(assignVoices(voices), assignVoices(voices));
  assert.equal(Object.values(assignVoices(voices)).filter(Boolean).length, 5);
  assert.ok(Object.values(assignVoices([])).every((v) => v === null));
  let done = 0;
  const audio = {
    cancel() {},
    speak(e, end, fallback) {
      fallback();
    },
  };
  const engine = new CinematicDialogueEngine({
    scene: {
      duration: 1,
      dialogue: [
        {
          start: 0,
          text: "Readable captions preserve the complete story.",
          rate: 1,
        },
      ],
    },
    audio,
    onLine() {},
    onEnd: () => done++,
    onCue() {},
  });
  engine.setPaused(false);
  for (let i = 0; i < 60; i++) engine.tick(100);
  assert.equal(done, 1);
});
test("owned browser speech cancels cleanly and never overlaps; missing speech falls back", async () => {
  const voices = [{ name: "Daniel", lang: "en-GB" }];
  let active = null,
    cancelCount = 0;
  const synth = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {
      active = null;
      cancelCount++;
    },
    speak(u) {
      assert.equal(active, null);
      active = u;
    },
  };
  class Utterance {
    constructor(text) {
      this.text = text;
    }
  }
  const audio = new CinematicAudioController({
    synthesis: synth,
    Utterance,
    Audio: null,
  });
  let completed = 0,
    fallback = 0;
  const event = { speaker: "Hamad", text: "Follow the evidence." };
  await audio.speak(
    event,
    () => completed++,
    () => fallback++,
  );
  const first = active;
  await audio.speak(
    event,
    () => completed++,
    () => fallback++,
  );
  assert.equal(first.onend, null);
  assert.ok(cancelCount > 0);
  active.onend();
  assert.equal(completed, 1);
  audio.configure({ muted: true, volume: 0.5 });
  await audio.speak(
    event,
    () => completed++,
    () => fallback++,
  );
  assert.equal(fallback, 1);
  audio.dispose();
  const missing = new CinematicAudioController({
    synthesis: null,
    Utterance: null,
    Audio: null,
  });
  await missing.speak(
    event,
    () => {},
    () => fallback++,
  );
  assert.equal(fallback, 2);
  missing.dispose();
});
test("recorded dialogue uses verified audio MIME and falls back to device voice when unavailable", async () => {
  let played = 0,
    spoken = 0;
  const voices = [{ name: "Daniel", lang: "en-GB" }];
  const synth = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {
      spoken++;
    },
  };
  class Utterance {}
  class Recording {
    constructor() {
      this.onended = null;
    }
    async play() {
      played++;
    }
    pause() {}
    removeAttribute() {}
    load() {}
  }
  const audio = new CinematicAudioController({
    synthesis: synth,
    Utterance,
    Audio: Recording,
    fetch: async () => ({ ok: true, headers: { get: () => "audio/mpeg" } }),
  });
  await audio.speak(
    {
      speaker: "Hamad",
      text: "Follow evidence.",
      recordedAudio: "/recordings/hamad.mp3",
    },
    () => {},
    () => {},
  );
  assert.equal(played, 1);
  assert.equal(spoken, 0);
  audio.cancel();
  audio.fetch = async () => ({
    ok: false,
    headers: { get: () => "text/html" },
  });
  await audio.speak(
    {
      speaker: "Hamad",
      text: "Follow evidence.",
      recordedAudio: "/missing.mp3",
    },
    () => {},
    () => {},
  );
  assert.equal(played, 1);
  assert.equal(spoken, 1);
  audio.dispose();
});

test('late voiceschanged loads device voices and exiting during voice loading cancels pending speech', async () => {
  const events = new EventTarget();
  let voices = [], spoken = 0;
  const synthesis = { getVoices: () => voices, addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events), cancel() {}, speak() { spoken++; } };
  class Utterance {}
  const audio = new CinematicAudioController({ synthesis, Utterance, Audio: null });
  const pending = audio.speak({ speaker: 'Hamad', text: 'Follow evidence.' }, () => {}, () => {});
  voices = [{ name: 'Daniel', lang: 'en-GB' }]; events.dispatchEvent(new Event('voiceschanged'));
  await pending; assert.equal(spoken, 1); audio.dispose();
  voices = [];
  const exiting = new CinematicAudioController({ synthesis, Utterance, Audio: null });
  const late = exiting.speak({ speaker: 'Hamad', text: 'Must not start after exit.' }, () => {}, () => {});
  exiting.dispose(); await late; assert.equal(spoken, 1);
});
