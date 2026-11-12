import { IONIC_SCENARIOS } from "../../src/data/ionicMissions.mjs";
import {
  createDessertState,
  dessertAction,
  dessertStep,
  dessertNotebook,
} from "../../src/data/dessertFlow.mjs";
export const dessertScenario = IONIC_SCENARIOS.ionic_dessert_mystery;
export const dessertAct = (s, type, fields = {}) =>
  dessertAction(s, { type, ...fields }, dessertScenario);
export function dessertReady(s) {
  for (let i = 0; i < 300; i++) {
    if (s.ready && !s.feedback) return s;
    s = dessertAct(s, "visit");
    const next = dessertAct(s, "continue");
    if (next === s) throw new Error(`Stalled ${s.node}`);
    s = next;
  }
  throw new Error("Narrative did not reach checkpoint");
}
export function dessertCheckpoint(target = "first", choice = "A") {
  let s = dessertReady(createDessertState());
  if (target === "first") return s;
  s = dessertReady(dessertAct(s, "firstChoice", { choice: "controlled" }));
  if (target === "calibrate") return s;
  s = dessertReady(dessertAct(s, "calibrate"));
  if (target === "sample-a") return s;
  s = dessertReady(dessertAct(s, "measure", { sample: "A" }));
  if (target === "conductivity") return s;
  for (const sample of ["B", "C"])
    s = dessertReady(dessertAct(s, "measure", { sample }));
  s = dessertReady(dessertAct(s, "conductivityConfirm", { confirmed: true }));
  if (target === "electron") return s;
  s = dessertReady(
    dessertAct(s, "electron", { value: { kind: "NaCl", transferred: 1 } }),
  );
  if (target === "ph") return s;
  for (const sample of ["A", "B", "C"])
    s = dessertReady(dessertAct(s, "measure", { sample }));
  if (target === "acid") return s;
  for (const sample of ["A", "B", "C"])
    s = dessertReady(dessertAct(s, "measure", { sample }));
  if (target === "identity") return s;
  s = dessertAct(s, "identities", {
    values: { A: "sugar", B: "hydrogen-carbonate", C: "sodium-chloride" },
  });
  s = dessertReady(dessertAct(s, "identify"));
  if (target === "decision") return s;
  s = dessertAct(s, "decisionDraft", {
    patch: {
      selectedOption: choice,
      justification:
        "The independent sample observations support chemical identities, but do not establish provenance, food grade or freedom from contamination.",
      evidenceCitations: ["A-conductivity", "B-pH"],
    },
  });
  s = dessertAct(s, "decide");
  if (target === "ending") {
    while (s.feedback) s = dessertAct(s, "continue");
    return s;
  }
  s = dessertReady(s);
  if (target === "reflection") return s;
  s = dessertAct(s, "reflection", {
    text: "I would preserve the measured evidence and isolate unknown ingredients because chemical identity does not verify food suitability.",
  });
  s = dessertReady(dessertAct(s, "reflect"));
  if (target === "question") return s;
  for (const q of dessertScenario.exitTicket.mcqs) {
    s = dessertAct(s, "answer", {
      answer: q.options.find((o) => o.correct).id,
    });
    s = dessertReady(dessertAct(s, "recordAnswer"));
  }
  return s;
}
export function dessertDraft(s, id) {
  return {
    id: "dessert-earlier-draft",
    student_id: id,
    scenario_id: "ionic_dessert_mystery",
    score: null,
    completed_at: null,
    answers: {
      ...dessertNotebook(s),
      meta: {
        recordType: "mission_attempt",
        updatedAt: "2026-11-11T09:00:00Z",
      },
    },
  };
}
export const dessertTask = (s) => dessertStep(s).task;
