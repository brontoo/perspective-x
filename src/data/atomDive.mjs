import media from "./atomDiveMedia.json" with { type: "json" };

export const ATOM_MEDIA = media;
export const ATOM_SPEAKERS = {
  NAR: "Narrator", HAM: "Hamad Al Zaabi", ALY: "Alya", RAS: "Rashid", ORB: "ORBIT",
};
export const ATOM_ATTEMPT_LABELS = {
  "metal-transfer-error": "Reconsidered one-to-one transfer between metal atoms",
  "metal-electrons-escape": "Reconsidered electrons leaving the material or charge imbalance",
  "metal-fixed-pair-error": "Reconsidered fixed electron pairs",
  "metal-attraction-error": "Reconsidered the components of metallic attraction",
  "ionic-proton-error": "Reconsidered moving protons or changing nuclei",
  "ionic-charge-error": "Reconsidered sodium and chloride charges",
  "ionic-electron-sea-error": "Reconsidered an electron sea in an ionic structure",
  "ionic-molecule-error": "Reconsidered isolated NaCl molecules as the solid",
  "final-wrong-world": "Reconsidered the selected model",
  "final-same-bond-error": "Reconsidered the charged components or formation matches",
  "final-colour-only": "Replaced colour-based reasoning with particle evidence",
  "final-no-evidence": "Added the required comparison evidence",
  "metal-complete": "Verified the metallic reconstruction and neutrality",
  "ionic-transfer-complete": "Transferred one electron while retaining the nuclei",
  "ionic-charge-complete": "Verified sodium and chloride charges",
  "ionic-attraction-complete": "Verified opposite-ion attraction",
  "ionic-lattice-complete": "Verified the extended ionic lattice",
  "final-supported": "Verified the location and both formation matches",
};
export const ATOM_ROLE = {
  id: "atomic_bonding_investigator", title: "Atomic Bonding Investigator", icon: "⚛️",
  color: "blue", difficulty: "Advanced",
  description: "Explore hidden atomic worlds and reconstruct the bonds that hold materials together.",
  scenarios: ["atom_dive"],
};
export const ATOM_SCENARIO = {
  id: "atom_dive", interactiveAtom: true, title: media.story.title, strand: "Chemistry",
  difficulty: "Advanced", estimatedTime: 13, roleId: ATOM_ROLE.id,
  role: "Virtual Materials Investigator", roleQuote: "Inspect before you decide. The first clue might not be the whole answer.",
  context: "At a fictional Masdar City learning studio, reconstruct metallic and ionic bonding models to restore virtual explorer ORBIT’s return map.",
  scienceFocus: media.story.scope, fictionNotice: media.story.fiction,
  artwork: media.images.AD_I01_lab.url, badge: "Bonding Route Navigator", badgeIcon: "⚛️",
  skills: ["concept_application", "scientific_reasoning", "data_interpretation", "communication"],
  glossaryTerms: ["metallic bonding", "delocalized electrons", "ion core", "ionic bonding", "ionic lattice"],
  character: { name: "Hamad Al Zaabi", title: "Applied Chemistry Field Investigator" },
  scenes: [
    { id: "1", title: "Reconstruct two bonding models", narrative: "Inspect both virtual specimens and collect verified model evidence.",
      question: "Which formation explanations did you verify?", options: [{ id: "both-models", text: "Metallic and ionic models verified", correct: true }],
      data: { type: "text", description: "Verified observations are recorded from the interactive scientific models." } },
    { id: "2", title: "Restore ORBIT’s route", question: "Which structure matches the final recorded evidence?",
      options: [{ id: "metallic", text: "Positive metal ion cores and delocalized electrons", consequence: "route-restored" },
        { id: "ionic", text: "An extended arrangement of cations and anions", consequence: "reconsider" }] },
    { id: "3", title: "Return to the research room", consequences: {
      "route-restored": { outcome: "ORBIT’s simulation route is restored.", message: "Particles, attraction and both formation sequences support the metallic model.", rating: "strong" },
      reconsider: { outcome: "More evidence is needed.", message: "Compare the charged components in both models.", rating: "weak" },
    } },
  ],
  reflection: [{ id: "formation", question: "Explain one difference in how the bonds form." },
    { id: "attraction", question: "Explain one difference in what holds the structures together." }],
  exitTicket: { passingScore: 80, mcqs: media.assessment.questions.map(q => ({
    id: q.id, question: q.prompt, options: Object.entries(q.options).map(([id, text]) => ({ id, text, correct: id === q.answer })),
    explanation: q.explanation,
  })) },
};

export const atomLine = id => media.dialogue.find(line => line.id === id);
const lines = (scene, condition = "story") => media.dialogue.filter(line => line.scene === scene && line.condition === condition)
  .sort((a, b) => a.order - b.order).map(line => line.id);
const conditionLines = condition => media.dialogue.filter(line => line.condition === condition).map(line => line.id);

// Task checkpoints have no automatic transition. Media events never earn science credit.
export const ATOM_STEPS = {
  opening: { scene: "S01", label: "The ordinary specimens", lines: lines("S01"), next: "signal" },
  signal: { scene: "S02", label: "The incomplete message", lines: lines("S02"), next: "launch", action: "Accept investigation" },
  launch: { scene: "S03", label: "Enter the simulation", lines: lines("S03"), next: "order", action: "Choose investigation order" },
  order: { scene: "S03", label: "Your investigation route", task: "order" },
  metalEntry: { scene: "S04", label: "The metallic world", lines: [...lines("S03", "enter-metallic"), ...lines("S04")], next: "metalBrief" },
  metalBrief: { scene: "S05", label: "Reconstruct metallic bonding", lines: lines("S05"), next: "metalTask", action: "Open metallic model" },
  metalTask: { scene: "S05", label: "Reconstruct metallic bonding", task: "metal" },
  metalSuccess: { scene: "S05", label: "Metallic evidence verified", lines: conditionLines("metal-complete"), next: "afterMetal" },
  bridge: { scene: "S06", label: "Keep the evidence", lines: lines("S06"), next: "ionicEntry" },
  ionicEntry: { scene: "S07", label: "A different arrangement", lines: [...lines("S07", "enter-ionic"), ...lines("S07")], next: "ionicTransfer", action: "Open ionic model" },
  ionicTransfer: { scene: "S08", label: "Follow one electron", task: "transfer" },
  transferFeedback: { scene: "S08", label: "Check the charged particles", lines: conditionLines("ionic-transfer-complete"), next: "ionicCharges" },
  ionicCharges: { scene: "S08", label: "Verify charges and nuclei", task: "charges" },
  chargeFeedback: { scene: "S08", label: "Ion formation verified", lines: conditionLines("ionic-charge-complete"), next: "ionicAttraction" },
  ionicAttraction: { scene: "S08", label: "What holds the ions together?", task: "attraction" },
  attractionFeedback: { scene: "S08", label: "Distinguish formation from bonding", lines: conditionLines("ionic-attraction-complete"), next: "ionicLattice" },
  ionicLattice: { scene: "S08", label: "Beyond one ion pair", task: "lattice" },
  ionicSuccess: { scene: "S08", label: "Ionic evidence verified", lines: conditionLines("ionic-lattice-complete"), next: "afterIonic" },
  comparisonBrief: { scene: "S09", label: "The final recorded clue", lines: [...conditionLines("both-investigations-complete"), ...lines("S09")], next: "comparisonTask", action: "Compare the grayscale models" },
  comparisonTask: { scene: "S09", label: "Restore the return map", task: "comparison" },
  comparisonSuccess: { scene: "S09", label: "Your evidence supports the route", lines: lines("S09", "final-supported"), next: "recovery" },
  recovery: { scene: "S10", label: "ORBIT recovered", lines: [...lines("S10", "final-supported"), ...lines("S10")], next: "homecoming" },
  homecoming: { scene: "S11", label: "Back to the ordinary world", lines: lines("S11"), next: "reflection", action: "Record your reflection" },
  reflection: { scene: "S11", label: "What can you explain now?", task: "reflection" },
  assessmentBrief: { scene: "S12", label: "Prove your understanding", lines: lines("S12"), next: "assessment", action: "Open the five-question exit ticket" },
  assessment: { scene: "S12", label: "Your evidence. Your understanding.", task: "assessment" },
  result: { scene: "S12", label: "Your mission record", task: "result" },
};

export function createAtomState(random = Math.random) {
  return { version: 1, step: "opening", cursor: 0, lastLine: null, feedback: null,
    order: [], visited: [], videos: {}, attempts: [], corrections: [], evidence: [],
    metal: { inspected: [], electrons: "", attraction: "", neutrality: "", verified: false },
    ionic: { transferred: false, sodium: "", chloride: "", nuclei: "", chargesVerified: false, attraction: "", attractionVerified: false, extended: false, verified: false },
    comparison: { sides: random() < .5 ? ["metallic", "ionic"] : ["ionic", "metallic"], world: "", particles: "", attraction: "", metalSequence: "", ionicSequence: "", supported: false },
    reflection: { formation: "", attraction: "" }, answers: {}, result: null };
}
export function restoreAtomState(saved) {
  if (!saved || saved.version !== 1 || !ATOM_STEPS[saved.step]) return createAtomState();
  const initial = createAtomState(() => 0);
  const merged = { ...initial, ...saved, metal: { ...initial.metal, ...saved.metal }, ionic: { ...initial.ionic, ...saved.ionic },
    comparison: { ...initial.comparison, ...saved.comparison }, reflection: { ...initial.reflection, ...saved.reflection } };
  if (!Array.isArray(merged.comparison.sides) || merged.comparison.sides.length !== 2 || new Set(merged.comparison.sides).size !== 2 || !merged.comparison.sides.includes("metallic") || !merged.comparison.sides.includes("ionic")) merged.comparison.sides = initial.comparison.sides;
  return merged;
}
export function activeAtomLine(state) {
  return atomLine(state.feedback ? state.feedback.ids[state.feedback.cursor] : ATOM_STEPS[state.step].lines?.[state.cursor] || state.lastLine);
}
export function nextAtomLine(state) {
  const sequence = state.feedback?.ids || ATOM_STEPS[state.step].lines || [];
  return atomLine(sequence[(state.feedback?.cursor ?? state.cursor) + 1]);
}
export function metalError(metal) {
  if (metal.electrons === "transfer") return "metal-transfer-error";
  if (metal.electrons === "escape" || metal.neutrality === "escape") return "metal-electrons-escape";
  if (metal.electrons === "pairs") return "metal-fixed-pair-error";
  if (metal.attraction !== "cores-electrons") return "metal-attraction-error";
  return null;
}
export function metalSupported(m) {
  return m.inspected.includes("cores") && m.inspected.includes("electrons") && m.electrons === "delocalized" && m.attraction === "cores-electrons" && m.neutrality === "balanced";
}
export function ionicSupported(i) {
  return i.transferred && i.sodium === "+1" && i.chloride === "-1" && i.nuclei === "unchanged" && i.chargesVerified && i.attraction === "opposite-ions" && i.attractionVerified && i.extended;
}
export function comparisonError(s) {
  const c = s.comparison;
  if (c.world && c.sides[Number(c.world) - 1] !== "metallic") return "final-wrong-world";
  if (c.particles === "colour") return "final-colour-only";
  if (c.attraction === "identical") return "final-same-bond-error";
  if (!c.world || !c.particles || !c.attraction || !c.metalSequence || !c.ionicSequence) return "final-no-evidence";
  if (c.particles !== "cores-electrons" || c.attraction !== "cores-electrons" ||
    c.sides[Number(c.metalSequence) - 1] !== "metallic" || c.sides[Number(c.ionicSequence) - 1] !== "ionic") return "final-same-bond-error";
  return null;
}
export const bothModelsVerified = s => s.metal.verified && s.ionic.verified && metalSupported(s.metal) && ionicSupported(s.ionic);
export const recoverySupported = s => bothModelsVerified(s) && s.comparison.supported && !comparisonError(s);
export function gradeAtom(answers) {
  if (!media.assessment.questions.every(q => Object.hasOwn(q.options, answers[q.id]))) return null;
  const mcq_answers = media.assessment.questions.map((q, i) => ({ questionId: i, questionKey: q.id, question: q.prompt,
    option: answers[q.id], isCorrect: answers[q.id] === q.answer }));
  const score = mcq_answers.filter(a => a.isCorrect).length * 20;
  return { score, passed: score >= 80, mcq_answers, correctCount: score / 20, total: 5 };
}

function enter(s, step) {
  if (["comparisonBrief", "comparisonTask", "comparisonSuccess"].includes(step) && !bothModelsVerified(s)) return s;
  if (["recovery", "homecoming", "reflection", "assessmentBrief", "assessment", "result"].includes(step) && !recoverySupported(s)) return s;
  return { ...s, step, cursor: 0, feedback: null, lastLine: activeAtomLine(s)?.id || s.lastLine };
}
function evidence(s, id, label, observation) {
  return [...s.evidence.filter(e => e.id !== id), { id, label, observation }];
}
function hint(s, condition, detail) {
  return { ...s, feedback: { ids: conditionLines(condition), cursor: 0 }, attempts: [...s.attempts,
    { task: ATOM_STEPS[s.step].task, condition, detail, at: new Date().toISOString() }] };
}
function corrected(s, condition, detail) {
  return { ...s, corrections: [...s.corrections, { condition, detail, at: new Date().toISOString() }] };
}
export function atomAction(s, event) {
  const task = ATOM_STEPS[s.step].task;
  if (event.type === "readQuestion" && ["assessment", "result"].includes(task)) {
    const line = atomLine(event.id);
    if (!line?.condition.startsWith("question-") || s.visited.at(-1)?.id === line.id) return s;
    return { ...s, visited: [...s.visited, { id: line.id, at: new Date().toISOString() }] };
  }
  if (event.type === "visit") {
    const current = activeAtomLine(s);
    if (!current || s.visited.at(-1)?.id === current.id) return s;
    return { ...s, visited: [...s.visited, { id: current.id, at: new Date().toISOString() }] };
  }
  if (event.type === "video") {
    if (activeAtomLine(s)?.video !== event.id) return s;
    return { ...s, videos: { ...s.videos, [event.id]: event.status } };
  }
  if (event.type === "continue") {
    if (s.feedback) {
      if (s.feedback.cursor < s.feedback.ids.length - 1) return { ...s, feedback: { ...s.feedback, cursor: s.feedback.cursor + 1 } };
      return { ...s, lastLine: s.feedback.ids.at(-1), feedback: null };
    }
    const step = ATOM_STEPS[s.step];
    if (!step.lines) return s;
    if (s.cursor < step.lines.length - 1) return { ...s, cursor: s.cursor + 1 };
    const next = step.next === "afterMetal" ? bothModelsVerified(s) ? "comparisonBrief" : "bridge"
      : step.next === "afterIonic" ? bothModelsVerified(s) ? "comparisonBrief" : "metalEntry" : step.next;
    return enter(s, next);
  }
  if (s.feedback) return s;
  if (event.type === "chooseOrder" && task === "order" && ["metallic", "ionic"].includes(event.first)) {
    return enter({ ...s, order: [event.first, event.first === "metallic" ? "ionic" : "metallic"] }, event.first === "metallic" ? "metalEntry" : "ionicEntry");
  }
  if (event.type === "metalPatch" && task === "metal") return { ...s, metal: { ...s.metal, ...event.patch, verified: false } };
  if (event.type === "metalVerify" && task === "metal") {
    if (metalSupported(s.metal)) return enter(corrected({ ...s, metal: { ...s.metal, verified: true },
      evidence: evidence(s, "metallic", "Metallic reconstruction", "Positive metal ion cores (nucleus and inner electrons) attract delocalized valence electrons. All four electrons remain inside the sample; four 1+ cores and four electrons balance to zero net charge.") }, "metal-complete", s.metal), "metalSuccess");
    const error = metalError(s.metal);
    return error ? hint(s, error, { ...s.metal }) : s;
  }
  if (event.type === "ionicTransfer" && task === "transfer") {
    if (event.particle !== "electron") return hint(s, "ionic-proton-error", event.particle);
    return enter(corrected({ ...s, ionic: { ...s.ionic, transferred: true } }, "ionic-transfer-complete", "One electron moved; nuclei retained."), "transferFeedback");
  }
  if (event.type === "ionicPatch" && ["charges", "attraction", "lattice"].includes(task)) return { ...s, ionic: { ...s.ionic, ...event.patch, verified: false } };
  if (event.type === "chargesVerify" && task === "charges") {
    if (s.ionic.nuclei !== "unchanged") return hint(s, "ionic-proton-error", { ...s.ionic });
    if (s.ionic.sodium !== "+1" || s.ionic.chloride !== "-1") return hint(s, "ionic-charge-error", { ...s.ionic });
    return enter(corrected({ ...s, ionic: { ...s.ionic, chargesVerified: true } }, "ionic-charge-complete", s.ionic), "chargeFeedback");
  }
  if (event.type === "attractionVerify" && task === "attraction") {
    if (s.ionic.attraction !== "opposite-ions") return hint(s, "ionic-electron-sea-error", s.ionic.attraction);
    return enter(corrected({ ...s, ionic: { ...s.ionic, attractionVerified: true } }, "ionic-attraction-complete", s.ionic.attraction), "attractionFeedback");
  }
  if (event.type === "latticeVerify" && task === "lattice") {
    if (!event.extended) return hint(s, "ionic-molecule-error", "isolated-pairs");
    const ionic = { ...s.ionic, extended: true };
    if (!ionicSupported(ionic)) return s;
    return enter(corrected({ ...s, ionic: { ...ionic, verified: true }, evidence: evidence(s, "ionic", "Ionic reconstruction",
      "One electron transferred from Na to Cl. Sodium has 11 protons and 10 electrons (1+); chloride has 17 protons and 18 electrons (1−). Nuclei are unchanged. Opposite ions attract in an extended repeating lattice; transfer forms ions, while electrostatic attraction is ionic bonding.") }, "ionic-lattice-complete", ionic), "ionicSuccess");
  }
  if (event.type === "comparisonPatch" && task === "comparison") return { ...s, comparison: { ...s.comparison, ...event.patch, sides: s.comparison.sides, supported: false } };
  if (event.type === "comparisonVerify" && task === "comparison" && bothModelsVerified(s)) {
    const error = comparisonError(s);
    if (error) return hint(s, error, { ...s.comparison });
    return enter(corrected({ ...s, comparison: { ...s.comparison, supported: true }, evidence: evidence(s, "comparison", "Grayscale evidence comparison",
      `Model ${s.comparison.world === "1" ? "A" : "B"} matches ORBIT’s log: positive metal ion cores and delocalized electrons, attracted electrostatically. Both formation sequences were matched to their resulting structures.`) }, "final-supported", s.comparison), "comparisonSuccess");
  }
  if (event.type === "reflectionPatch" && task === "reflection") return { ...s, reflection: { ...s.reflection, ...event.patch } };
  if (event.type === "reflectionSave" && task === "reflection" && Object.values(s.reflection).every(v => v.trim().length >= 12)) return enter(s, "assessmentBrief");
  if (event.type === "answer" && task === "assessment" && !s.result) {
    const q = media.assessment.questions.find(q => q.id === event.id);
    return q && Object.hasOwn(q.options, event.answer) ? { ...s, answers: { ...s.answers, [event.id]: event.answer } } : s;
  }
  if (event.type === "assess" && task === "assessment" && !s.result && recoverySupported(s)) {
    const result = gradeAtom(s.answers);
    if (!result) return s;
    return { ...enter({ ...s, result }, "result"), feedback: { ids: conditionLines(result.passed ? "assessment-pass" : "assessment-review"), cursor: 0 } };
  }
  return s;
}

export function atomNotebook(state) {
  return {
    atomDive: state,
    investigation: { evidence: state.evidence, metallic: state.metal, ionic: state.ionic, attempts: state.attempts, corrections: state.corrections, investigationOrder: state.order },
    ...(bothModelsVerified(state) ? { scene1: { selectedOption: "both-models", justification: state.evidence.filter(e => e.id !== "comparison").map(e => e.observation).join("\n") } } : {}),
    ...(recoverySupported(state) ? { scene2: { selectedOption: "metallic", consequence: "route-restored", justification: state.evidence.find(e => e.id === "comparison")?.observation } } : {}),
    reflection: Object.entries(state.reflection).map(([k, v]) => v && `${k}: ${v}`).filter(Boolean).join("\n"),
  };
}
