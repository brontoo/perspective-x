import { electronPair } from "../ionicScience.mjs";
export function dessertCheckpointReady(checkpoint, investigation = {}) {
  const evidence = new Set((investigation.evidence || []).map((e) => e.id));
  const conductivity =
    investigation.calibrated &&
    ["A", "B", "C"].every((s) => evidence.has(`${s}-conductivity`));
  const electron =
    conductivity &&
    investigation.electron?.kind === "NaCl" &&
    electronPair("NaCl", investigation.electron?.transferred || 0).complete;
  const clues =
    electron &&
    ["A", "B", "C"].every((s) =>
      ["pH", "fizz"].every((t) => evidence.has(`${s}-${t}`)),
    ) &&
    ["A", "B", "C"].every((s) => !!investigation.identities?.[s]);
  return (
    { conductivity: !!conductivity, electron: !!electron, clues: !!clues }[
      checkpoint
    ] || false
  );
}
export function phaseForScene(scene) {
  return (
    ["intro", "scene1", "scene2", "consequence", "exit"][scene.chapter] ||
    "intro"
  );
}
export function checkpointScene(manifest, checkpoint) {
  return Object.values(manifest.scenes).find(
    (s) => s.checkpoint === checkpoint,
  );
}
export function branchScene(manifest, consequence) {
  return manifest.branches[consequence] || null;
}
export function createRuntime(scene, interaction = false, completed = []) {
  return {
    version: 1,
    sceneId: scene.id,
    interaction: interaction ? scene.checkpoint : null,
    completedCheckpoints: completed,
  };
}
// Resume only meaningful scene/checkpoint identifiers. Elapsed clocks are intentionally not saved.
// Existing pre-cinema drafts remain readable; no completed attempt is migrated or overwritten.
export function restoreRuntime(
  manifest,
  phase,
  responses = {},
  teacher = false,
) {
  const saved = responses.cinematic;
  let scene = manifest.scenes[saved?.sceneId];
  let interaction = !!saved?.interaction;
  if (phase === "complete")
    return createRuntime(checkpointScene(manifest, "complete"), true);
  if (!scene) {
    if (phase === "exit") scene = checkpointScene(manifest, "assessment");
    else if (phase === "reflection")
      scene = checkpointScene(manifest, "reflection");
    else if (phase === "consequence")
      scene =
        manifest.scenes[branchScene(manifest, responses.scene2?.consequence)] ||
        checkpointScene(manifest, "decision");
    else if (phase === "scene2") scene = checkpointScene(manifest, "decision");
    else if (phase === "scene1" || responses.investigation)
      scene = checkpointScene(
        manifest,
        manifest.id === "ionic_dessert_mystery" ? "conductivity" : "mineral",
      );
    else scene = manifest.scenes[manifest.start];
    interaction = !!scene.checkpoint;
  }
  if (!teacher && manifest.id === "ionic_dessert_mystery") {
    const science = responses.investigation || {};
    const position = Object.keys(manifest.scenes).indexOf(scene.id);
    const requirements = [
      ["conductivity", "conductivity-clue"],
      ["electron", "second-test"],
      ["clues", "decision"],
    ];
    for (const [gate, next] of requirements) {
      if (
        position >= Object.keys(manifest.scenes).indexOf(next) &&
        !dessertCheckpointReady(gate, science)
      ) {
        scene = checkpointScene(manifest, gate);
        interaction = true;
        break;
      }
    }
  }
  if (!teacher && scene.chapter >= 3 && !responses.scene2?.selectedOption) {
    scene = checkpointScene(manifest, "decision");
    interaction = true;
  }
  if (!teacher && scene.chapter >= 4 && !responses.reflection) {
    scene = checkpointScene(manifest, "reflection");
    interaction = true;
  }
  return createRuntime(scene, interaction, saved?.completedCheckpoints || []);
}
export function nextRuntime(
  manifest,
  runtime,
  { checkpointComplete = false, consequence } = {},
) {
  const scene = manifest.scenes[runtime.sceneId];
  if (!scene || scene.checkpoint === "complete") return runtime;
  if (scene.checkpoint && !checkpointComplete)
    return createRuntime(scene, true, runtime.completedCheckpoints);
  const nextId = consequence ? branchScene(manifest, consequence) : scene.next;
  const next = manifest.scenes[nextId];
  if (!next) return runtime;
  const completed = checkpointComplete
    ? [...new Set([...runtime.completedCheckpoints, scene.checkpoint])]
    : runtime.completedCheckpoints;
  return createRuntime(
    next,
    next.duration === 0 && !!next.checkpoint,
    completed,
  );
}
