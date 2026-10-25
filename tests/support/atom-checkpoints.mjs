import { createAtomState, atomAction, ATOM_STEPS, atomNotebook } from "../../src/data/atomDive.mjs";
export const action = (s, type, fields = {}) => atomAction(s, { type, ...fields });
export function reachTask(s, task) {
  for (let i = 0; i < 100; i++) {
    if (ATOM_STEPS[s.step].task === task && !s.feedback) return s;
    s = action(s, "visit");
    const next = action(s, "continue");
    if (next === s) throw new Error(`Unfinished ${s.step} before ${task}`);
    s = next;
  }
  throw new Error("Unreachable fixture task");
}
export function checkpoint(target, reverse = false) {
  let s = reachTask(createAtomState(() => reverse ? .9 : .1), "order");
  if (target === "order") return s;
  s = action(s, "chooseOrder", { first: "metallic" });
  s = reachTask(s, "metal");
  if (target === "metal") return s;
  s = action(s, "metalPatch", { patch: { inspected: ["cores", "electrons"], electrons: "delocalized", attraction: "cores-electrons", neutrality: "balanced" } });
  s = reachTask(action(s, "metalVerify"), "transfer");
  if (target === "transfer") return s;
  s = reachTask(action(s, "ionicTransfer", { particle: "electron" }), "charges");
  if (target === "charges") return s;
  s = action(s, "ionicPatch", { patch: { sodium: "+1", chloride: "-1", nuclei: "unchanged" } });
  s = reachTask(action(s, "chargesVerify"), "attraction");
  if (target === "attraction") return s;
  s = action(s, "ionicPatch", { patch: { attraction: "opposite-ions" } });
  s = reachTask(action(s, "attractionVerify"), "lattice");
  if (target === "lattice") return s;
  s = reachTask(action(s, "latticeVerify", { extended: true }), "comparison");
  if (target === "comparison") return s;
  const metallic = String(s.comparison.sides.indexOf("metallic") + 1), ionic = metallic === "1" ? "2" : "1";
  s = action(s, "comparisonPatch", { patch: { world: metallic, particles: "cores-electrons", attraction: "cores-electrons", metalSequence: metallic, ionicSequence: ionic } });
  s = reachTask(action(s, "comparisonVerify"), "reflection");
  if (target === "reflection") return s;
  s = action(s, "reflectionPatch", { patch: { formation: "Metal valence electrons delocalize; this ionic example transfers an electron.", attraction: "Metal cores attract electrons, while cations and anions attract in the ionic lattice." } });
  return reachTask(action(s, "reflectionSave"), "assessment");
}
export function draftFor(state, studentId) {
  return { id: "atom-earlier-draft", student_id: studentId, scenario_id: "atom_dive", score: null, completed_at: null,
    answers: { ...atomNotebook(state), meta: { recordType: "mission_attempt", updatedAt: "2026-10-24T10:00:00Z" } } };
}
