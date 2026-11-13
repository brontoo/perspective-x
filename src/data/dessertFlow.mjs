import media from "./dessertMedia.json" with { type: "json" };
import { POWDER_READINGS, electronPair, gradeIonic } from "./ionicScience.mjs";
import legacyBeats from "./dessertLegacyBeats.json" with { type: "json" };
import {
  activeDessertLines,
  isDessertLineActive,
} from "./dessertEditorial.mjs";

export const DESSERT_MEDIA = media;
export const DESSERT_ID = "ionic_dessert_mystery";
export const DESSERT_SPEAKERS = {
  NARRATOR: "Narrator",
  HAMAD: "Hamad Al Zaabi",
  MARIAM: "Mariam Al Mansoori",
  SAEED: "Saeed Al Nuaimi",
  FATIMA: "Fatima",
  SYSTEM: "Investigation system",
};
const ids = (prefix) =>
  Object.keys(media.recordings)
    .filter((id) => id.startsWith(prefix))
    .sort();
// Explicit numeric dialogue order; filesystem and CSV row order are never used.
const story = (chapter, scene) =>
  ids(`CH${chapter}_SC${scene}_`)
    .filter((id) => /_\d{3}_/.test(id))
    .sort(
      (a, b) =>
        Number(a.match(/_(\d{3})_/)[1]) - Number(b.match(/_(\d{3})_/)[1]),
    );
const take = (c, s, from, to) =>
  story(c, s).filter((id) => {
    const ordinal = Number(id.match(/_(\d{3})_/)[1]);
    return ordinal >= from && ordinal <= to;
  });
const sys = (name) => `SYSTEM_${name}_SYSTEM`;
const node = (scene, chapter, title, lines, next, task = null, extra = {}) => ({
  scene,
  chapter,
  title,
  art: `IMAGE_${String(scene).padStart(2, "0")}`,
  lines: activeDessertLines(lines),
  next,
  task,
  ...extra,
});
export const DESSERT_NODES = {
  n01: node(
    1,
    1,
    "Twelve minutes to the final",
    ["SYSTEM_SAFETY_DISCLAIMER_NARRATOR", ...story("01", "01")],
    "n02",
    null,
    { video: "V01", videoAt: "CH01_SC01_002_NARRATOR" },
  ),
  n02: node(2, 1, "Meet Mariam and Saeed", story("01", "02"), "n03"),
  n03: node(3, 1, "Three sealed containers", story("01", "03"), "n04"),
  n04: node(4, 1, "The labels fall", story("01", "04"), "n05", null, {
    video: "V02",
    videoAt: "CH01_SC04_002_NARRATOR",
  }),
  n05: node(5, 1, "The identity chain is broken", story("01", "05"), "n06"),
  n06: node(6, 1, "Preparation stops", story("01", "06"), "n07"),
  n07: node(7, 1, "Hamad takes the assignment", story("01", "07"), "first"),
  first: node(
    7,
    2,
    "How should the investigation begin?",
    take("02", "DEC01", 1, 2),
    "n11",
    "first",
  ),
  n08: node(
    8,
    2,
    "Appearance is insufficient",
    [...ids("CH02_DEC01_APPEARANCE_"), ...story("02", "08"), sys("TRY_AGAIN")],
    "first",
  ),
  n09: node(
    9,
    2,
    "Tasting is prevented",
    [
      sys("ACTION_NOT_PERMITTED"),
      ...ids("CH02_DEC01_TASTE_"),
      ...story("02", "09"),
      sys("TRY_AGAIN"),
    ],
    "first",
  ),
  n10: node(
    10,
    2,
    "Keep the samples separate",
    [
      sys("KEEP_SEPARATE"),
      ...ids("CH02_DEC01_MIX_"),
      ...story("02", "10"),
      sys("TRY_AGAIN"),
    ],
    "first",
  ),
  n11: node(11, 2, "The investigation laboratory", story("02", "11"), "n12"),
  n12: node(
    12,
    2,
    "Begin with a water-only control",
    take("02", "12", 1, 1),
    "n13",
    "calibrate",
  ),
  n13: node(13, 2, "Test Sample A", take("02", "13", 1, 2), "n14", "sample-a"),
  n14: node(
    14,
    2,
    "Compare the conductivity",
    take("02", "14", 1, 1),
    "n15",
    "conductivity",
  ),
  n15: node(
    15,
    2,
    "Follow one valence electron",
    take("02", "15", 1, 3),
    "n16",
    "electron",
  ),
  n16: node(16, 2, "One test is not enough", story("02", "16"), "n17"),
  n17: node(
    17,
    2,
    "A second independent clue",
    take("02", "17", 1, 2),
    "n18",
    "ph",
  ),
  n18: node(
    18,
    2,
    "A controlled virtual reaction",
    take("02", "18", 1, 3),
    "n19",
    "acid",
  ),
  n19: node(
    19,
    2,
    "Identify the three samples",
    take("02", "19", 1, 3),
    "n20",
    "identity",
  ),
  n20: node(20, 3, "The team needs a recommendation", story("03", "20"), "n22"),
  n22: node(
    22,
    3,
    "Make your professional call",
    story("03", "22"),
    "ending",
    "decision",
  ),
  endA: node(
    23,
    4,
    "A safe, traceable resolution",
    ids("CH04_END_A_"),
    "n27",
    null,
    { video: "V03", videoAt: "CH04_END_A_001_NARRATOR" },
  ),
  endB: node(
    24,
    4,
    "Conductivity cannot verify provenance",
    ids("CH04_END_B_"),
    "n27",
    null,
    { video: "V04", videoAt: "CH04_END_B_001_NARRATOR" },
  ),
  endC: node(
    25,
    4,
    "Unsafe tasting is prevented",
    ids("CH04_END_C_"),
    "n27",
    null,
    { video: "V05", videoAt: "CH04_END_C_001_NARRATOR" },
  ),
  endD: node(
    26,
    4,
    "Appearance fails the investigation",
    ids("CH04_END_D_"),
    "n27",
    null,
    { video: "V06", videoAt: "CH04_END_D_001_NARRATOR" },
  ),
  n27: node(
    27,
    5,
    "What does the evidence establish?",
    [...story("05", "27"), ...ids("CH05_REFLECTION_")],
    "quiz-intro",
    "reflection",
  ),
  "quiz-intro": node(
    27,
    5,
    "Prove your expertise",
    ["CH05_QUIZ_INTRO_NARRATOR"],
    "question1",
  ),
  ...Object.fromEntries(
    [1, 2, 3, 4, 5].map((i) => [
      `question${i}`,
      node(
        27,
        5,
        `Question ${i} of 5`,
        [`CH05_Q0${i}_QUESTION_NARRATOR`],
        i === 5 ? "assessment-submit" : `question${i + 1}`,
        "question",
        { question: i - 1 },
      ),
    ]),
  ),
  "assessment-submit": node(
    27,
    5,
    "Review your five answers",
    [],
    null,
    "assessment",
  ),
  pass: node(
    28,
    5,
    "Ionic Evidence Investigator",
    [...ids("CH05_SC28_PASS_"), sys("ACHIEVEMENT_EARNED")],
    "done",
  ),
  retry: node(
    28,
    5,
    "Review, reflect and try again",
    ids("CH05_SC28_RETRY_"),
    "done",
  ),
  done: node(28, 5, "Your scientific record", [], null, "done"),
};
// DEC01 is not a physical numbered scene; author names are retained exactly.
DESSERT_NODES.first.lines = activeDessertLines([
  "CH02_DEC01_001_HAMAD",
  "CH02_DEC01_002_NARRATOR",
]);
export const DESSERT_OUTCOMES = {
  A: "verify-replace",
  B: "conductivity-only",
  C: "taste",
  D: "appearance",
};
export const dessertLine = (id) => media.recordings[id];
export const dessertStep = (s) => DESSERT_NODES[s.node];
export function dessertActiveLine(s) {
  const id = s.feedback
    ? s.feedback.ids[s.feedback.cursor]
    : !s.ready
      ? dessertStep(s)?.lines[s.cursor]
      : null;
  return isDessertLineActive(id) ? dessertLine(id) : undefined;
}
export function dessertNextLine(s) {
  const seq = s.feedback?.ids || dessertStep(s).lines;
  const next = seq[(s.feedback?.cursor ?? s.cursor) + 1];
  if (next) return dessertLine(next);
  const target = s.feedback
    ? s.feedback.after
    : !dessertStep(s).task
      ? dessertStep(s).next
      : null;
  return target && target !== "ready"
    ? dessertLine(DESSERT_NODES[target]?.lines[0])
    : undefined;
}
const clone = (value) => JSON.parse(JSON.stringify(value));
export function createDessertState() {
  return {
    version: 4,
    node: "n01",
    cursor: 0,
    ready: false,
    feedback: null,
    lastLine: null,
    visited: [],
    videos: {},
    firstChoice: "",
    firstAttempts: [],
    investigation: {
      evidence: [],
      calibrated: false,
      electron: { kind: "NaCl", transferred: 0 },
      identities: { A: "", B: "", C: "" },
      conductivityConfirmed: false,
      identified: false,
      attempts: [],
      corrections: [],
    },
    decisionDraft: {
      selectedOption: "",
      justification: "",
      evidenceCitations: [],
    },
    decision: null,
    reflection: "",
    answers: {},
    result: null,
    answerIndex: 0,
    completed: false,
    notice: "",
  };
}
export function restoreDessertState(responses = {}) {
  const initial = createDessertState(),
    saved = responses.dessertStory;
  if (
    [2, 3, 4].includes(saved?.version) &&
    (DESSERT_NODES[saved.node] || saved.node === "n21")
  ) {
    const restored = {
      ...initial,
      ...clone(saved),
      investigation: {
        ...initial.investigation,
        ...clone(saved.investigation || {}),
      },
      decisionDraft: {
        ...initial.decisionDraft,
        ...clone(saved.decisionDraft || {}),
      },
    };
    return normalizeEditorialState(restored, saved.version);
  }
  // Preserve genuine old observations, selections and assessed records. Never invent readings.
  const inv = clone(responses.investigation || {});
  initial.investigation = {
    ...initial.investigation,
    ...inv,
    electron: { ...initial.investigation.electron, ...inv.electron },
    identities: { ...initial.investigation.identities, ...inv.identities },
  };
  initial.decisionDraft = {
    ...initial.decisionDraft,
    ...clone(responses.scene2 || {}),
  };
  initial.answers = { ...responses.assessmentDraft };
  initial.reflection = responses.reflection || "";
  if (responses.scene2?.consequence) {
    initial.decision = clone(responses.scene2);
    initial.node = initial.reflection ? "quiz-intro" : "n27";
  } else if (responses.scene1 && measurementsComplete(initial)) {
    initial.investigation.identified = identitiesCorrect(initial);
    initial.node = initial.investigation.identified ? "n20" : "n19";
  } else if (inv.evidence?.length || inv.calibrated)
    initial.node = !inv.calibrated
      ? "n12"
      : !hasDessertReading(initial, "A-conductivity")
        ? "n13"
        : !["B", "C"].every((a) =>
              hasDessertReading(initial, `${a}-conductivity`),
            )
          ? "n14"
          : initial.investigation.electron.kind !== "NaCl" ||
              !electronPair("NaCl", initial.investigation.electron.transferred)
                .complete
            ? "n15"
            : !["A", "B", "C"].every((a) =>
                  hasDessertReading(initial, `${a}-pH`),
                )
              ? "n17"
              : !["A", "B", "C"].every((a) =>
                    hasDessertReading(initial, `${a}-fizz`),
                  )
                ? "n18"
                : "n19";
  return initial;
}
export const hasDessertReading = (s, id) =>
  s.investigation.evidence.some((e) => e.id === id);
export const measurementsComplete = (s) =>
  s.investigation.calibrated &&
  ["A", "B", "C"].every((a) =>
    ["conductivity", "pH", "fizz"].every((t) =>
      hasDessertReading(s, `${a}-${t}`),
    ),
  ) &&
  s.investigation.electron.kind === "NaCl" &&
  electronPair("NaCl", s.investigation.electron.transferred).complete;
export const identitiesCorrect = (s) =>
  Object.entries(POWDER_READINGS).every(
    ([a, r]) => s.investigation.identities[a] === r.identity,
  );
function enter(s, name) {
  if (name === "n21") name = "n22";
  const n = DESSERT_NODES[name];
  if (!n) return s;
  return {
    ...s,
    node: name,
    cursor: 0,
    ready: !n.lines.length,
    feedback: null,
    lastLine: dessertActiveLine(s)?.id || s.lastLine,
  };
}
function queue(s, lines, after = "ready") {
  const ids = activeDessertLines(lines);
  const messages = lines
    .filter((id) => id.startsWith("SYSTEM_") && !isDessertLineActive(id))
    .map((id) => media.recordings[id]?.text)
    .filter(Boolean);
  const next = { ...s, notice: messages.join(" ") || s.notice };
  // Silent UI notifications are actual state transitions, never timed empty beats.
  if (!ids.length)
    return after === "ready"
      ? { ...next, feedback: null, ready: true }
      : enter(next, after);
  return { ...next, feedback: { ids, cursor: 0, after }, ready: false };
}

function normalizeEditorialState(s, previousVersion) {
  const archived = (s.visited || []).filter(
    (row) => !isDessertLineActive(row.id) || !DESSERT_NODES[row.node],
  );
  let next = {
    ...s,
    version: 4,
    archivedDialogue: [...(s.archivedDialogue || []), ...archived],
    visited: (s.visited || []).filter(
      (row) => isDessertLineActive(row.id) && DESSERT_NODES[row.node],
    ),
    lastLine: isDessertLineActive(s.lastLine) ? s.lastLine : null,
  };
  if (next.playback && !isDessertLineActive(next.playback.line))
    next.playback = null;
  if (next.result)
    return {
      ...next,
      node: "done",
      cursor: 0,
      ready: true,
      feedback: null,
      lastLine: null,
      playback: null,
      completed: true,
    };
  if (s.node === "n21") return enter({ ...next, playback: null }, "n22");
  const step = dessertStep(next);
  if (
    previousVersion >= 3 &&
    !s.ready &&
    !s.feedback &&
    step.lines.includes(s.beatId)
  )
    next.cursor = step.lines.indexOf(s.beatId);
  if (previousVersion === 2 && !s.ready && !s.feedback) {
    const remaining = (legacyBeats[s.node]?.lines || []).slice(s.cursor || 0);
    const id = remaining.find(isDessertLineActive);
    if (id && step.lines.includes(id)) next.cursor = step.lines.indexOf(id);
    else if (step.task) next = { ...next, cursor: 0, ready: true };
    else {
      next = enter({ ...next, playback: null }, step.next);
      if (step.next === "done") next.completed = !!next.result;
    }
  }
  if (s.feedback) {
    const remaining = s.feedback.ids.slice(s.feedback.cursor || 0);
    const after = s.feedback.after === "n21" ? "n22" : s.feedback.after;
    next = queue(next, remaining, after);
  }
  // Resume native audio only when the exact retained checkpoint still matches.
  if (next.playback?.line !== dessertActiveLine(next)?.id) next.playback = null;
  return next;
}
function addEvidence(s, id, label, observation, patch = {}) {
  return {
    ...s,
    investigation: {
      ...s.investigation,
      ...patch,
      evidence: [
        ...s.investigation.evidence.filter((e) => e.id !== id),
        { id, label, observation, collectedAt: new Date().toISOString() },
      ],
    },
  };
}
function noteAttempt(s, kind, detail) {
  return {
    ...s,
    investigation: {
      ...s.investigation,
      attempts: [
        ...s.investigation.attempts,
        { kind, detail, at: new Date().toISOString() },
      ],
    },
  };
}
function correction(s, kind, detail) {
  return {
    ...s,
    investigation: {
      ...s.investigation,
      corrections: [
        ...s.investigation.corrections,
        { kind, detail, at: new Date().toISOString() },
      ],
    },
  };
}
export function dessertAction(s, event, scenario) {
  const step = dessertStep(s),
    task = step.task;
  if (event.type === "playback") return { ...s, playback: event.value };
  if (event.type === "visit") {
    const line = dessertActiveLine(s);
    if (!line || s.visited.at(-1)?.id === line.id) return s;
    return {
      ...s,
      visited: [
        ...s.visited,
        {
          id: line.id,
          node: s.node,
          scene: step.scene,
          at: new Date().toISOString(),
        },
      ],
    };
  }
  if (event.type === "video" && step.video === event.id)
    return { ...s, videos: { ...s.videos, [s.node]: event.status } };
  if (event.type === "continue") {
    if (s.feedback) {
      const f = s.feedback;
      if (f.cursor < f.ids.length - 1)
        return { ...s, feedback: { ...f, cursor: f.cursor + 1 } };
      const next = { ...s, feedback: null, lastLine: f.ids.at(-1) };
      return f.after === "ready"
        ? { ...next, ready: true }
        : enter(next, f.after);
    }
    if (s.ready) return s;
    if (s.cursor < step.lines.length - 1) return { ...s, cursor: s.cursor + 1 };
    if (step.task) return { ...s, ready: true, lastLine: step.lines.at(-1) };
    if (step.next === "done") return { ...enter(s, "done"), completed: true };
    return enter(s, step.next);
  }
  if (s.feedback || !s.ready) return s;
  if (event.type === "firstChoice" && task === "first") {
    if (!["controlled", "appearance", "taste", "mix"].includes(event.choice))
      return queue(s, [sys("SELECT_OPTION")]);
    const next = {
      ...s,
      firstChoice: event.choice,
      firstAttempts: [
        ...s.firstAttempts,
        { choice: event.choice, at: new Date().toISOString() },
      ],
    };
    return event.choice === "controlled"
      ? queue(next, ["CH02_DEC01_CORRECT_HAMAD"], "n11")
      : enter(
          next,
          { appearance: "n08", taste: "n09", mix: "n10" }[event.choice],
        );
  }
  if (event.type === "calibrate" && task === "calibrate") {
    const next = addEvidence(
      s,
      "control",
      "Water-only control",
      "2 μS/cm background reading",
      { calibrated: true },
    );
    return queue(
      next,
      [
        sys("CALIBRATION_COMPLETE"),
        ...take("02", "12", 5, 5),
        ...take("02", "12", 3, 3),
        sys("EVIDENCE_ADDED"),
      ],
      "n13",
    );
  }
  if (
    event.type === "measure" &&
    ["sample-a", "conductivity", "ph", "acid"].includes(task)
  ) {
    const sample = event.sample;
    if (!Object.hasOwn(POWDER_READINGS, sample)) return s;
    const method = {
      "sample-a": "conductivity",
      conductivity: "conductivity",
      ph: "pH",
      acid: "fizz",
    }[task];
    if (method === "conductivity" && !s.investigation.calibrated)
      return queue(s, [sys("COMPLETE_MEASUREMENTS")]);
    if (task === "sample-a" && sample !== "A") return s;
    if (
      task === "conductivity" &&
      sample === "A" &&
      !hasDessertReading(s, "A-conductivity")
    )
      return s;
    if (hasDessertReading(s, `${sample}-${method}`)) return s;
    const r = POWDER_READINGS[sample],
      observation =
        method === "conductivity"
          ? `${r.conductivity} μS/cm in water; negligible conductivity as a dry solid`
          : method === "pH"
            ? `pH ${r.pH.toFixed(1)}`
            : r.fizz;
    let next = addEvidence(
      s,
      `${sample}-${method}`,
      `Sample ${sample} · ${method}`,
      observation,
    );
    let clips = [sys("MEASUREMENT_COMPLETE"), sys("EVIDENCE_ADDED")],
      after = "ready";
    if (task === "sample-a") {
      clips = [...take("02", "13", 3, 6), ...clips];
      after = "n14";
    }
    if (task === "conductivity" && sample !== "A")
      clips = [`CH02_SC14_00${sample === "B" ? 2 : 3}_SYSTEM`, ...clips];
    if (
      task === "ph" &&
      ["A", "B", "C"].every((a) => hasDessertReading(next, `${a}-pH`))
    ) {
      clips.push(...take("02", "17", 3, 5));
      after = "n18";
    }
    if (task === "acid") {
      clips.unshift(
        `CH02_SC18_00${sample === "A" ? 4 : sample === "B" ? 5 : 8}_SYSTEM`,
      );
      if (sample === "B") clips.push(...take("02", "18", 6, 7));
      if (["A", "B", "C"].every((a) => hasDessertReading(next, `${a}-fizz`))) {
        clips.push("CH02_SC18_009_HAMAD");
        after = "n19";
      }
    }
    return queue(next, clips, after);
  }
  if (event.type === "conductivityAcknowledgement" && task === "conductivity")
    return {
      ...s,
      investigation: {
        ...s.investigation,
        conductivityConfirmed: !!event.confirmed,
      },
    };
  if (event.type === "conductivityConfirm" && task === "conductivity") {
    if (
      !["A", "B", "C"].every((a) => hasDessertReading(s, `${a}-conductivity`))
    )
      return queue(s, [sys("COMPLETE_MEASUREMENTS")]);
    if (!event.confirmed) return queue(s, [sys("REVIEW_EVIDENCE")]);
    return queue(
      {
        ...s,
        investigation: { ...s.investigation, conductivityConfirmed: true },
      },
      take("02", "14", 4, 8),
      "n15",
    );
  }
  if (event.type === "electron" && task === "electron") {
    const value = event.value;
    if (value.kind !== "NaCl") return s;
    const pair = electronPair("NaCl", value.transferred);
    let next = {
      ...s,
      investigation: {
        ...s.investigation,
        electron: { kind: "NaCl", transferred: pair.transferred },
      },
    };
    if (!pair.complete) return next;
    next = addEvidence(
      next,
      "electron",
      "Ion formation model",
      "Na: 11 protons, 10 electrons (1+); Cl: 17 protons, 18 electrons (1−). Nuclei unchanged. Opposite ions attract. Dissolution separates existing ions, rather than repeating electron transfer.",
    );
    return queue(
      next,
      [...take("02", "15", 4, 9), sys("EVIDENCE_ADDED")],
      "n16",
    );
  }
  if (event.type === "identities" && task === "identity")
    return {
      ...s,
      investigation: {
        ...s.investigation,
        identities: { ...s.investigation.identities, ...event.values },
        identified: false,
      },
    };
  if (event.type === "identify" && task === "identity") {
    if (!measurementsComplete(s))
      return queue(s, [sys("COMPLETE_MEASUREMENTS")]);
    if (!identitiesCorrect(s))
      return queue(
        noteAttempt(s, "identification", clone(s.investigation.identities)),
        [
          sys("IDENTIFICATION_MISMATCH"),
          "CH02_SC19_WRONG_HAMAD",
          sys("TRY_AGAIN"),
        ],
      );
    let next = correction(
      { ...s, investigation: { ...s.investigation, identified: true } },
      "identification",
      clone(s.investigation.identities),
    );
    next = addEvidence(
      next,
      "identities",
      "Supported sample identification",
      "A: sucrose; B: sodium hydrogen carbonate; C: sodium chloride. Nine controlled readings and the Na/Cl formation model support these identities within the candidate set.",
    );
    return queue(
      next,
      ["A", "B", "C"]
        .flatMap((a) => [`CH02_SC19_${a}_SYSTEM`, `CH02_SC19_${a}_OK_HAMAD`])
        .concat([
          sys("IDENTIFICATION_SUPPORTED"),
          sys("EVIDENCE_ADDED"),
          "CH02_SC19_COMPLETE_NARRATOR",
        ]),
      "n20",
    );
  }
  if (event.type === "decisionDraft" && task === "decision" && !s.decision)
    return { ...s, decisionDraft: { ...s.decisionDraft, ...event.patch } };
  if (event.type === "reviewEvidence" && task === "decision")
    return queue(s, [sys("REVIEW_EVIDENCE")]);
  if (event.type === "decide" && task === "decision" && !s.decision) {
    const d = s.decisionDraft;
    if (!s.investigation.identified || !measurementsComplete(s))
      return queue(s, [sys("COMPLETE_MEASUREMENTS")]);
    if (!DESSERT_OUTCOMES[d.selectedOption])
      return queue(s, [sys("SELECT_OPTION")]);
    if (d.justification.trim().length < 60)
      return queue(s, [sys("JUSTIFICATION_MINIMUM")]);
    const citations = [...new Set(d.evidenceCitations)].filter((id) =>
      hasDessertReading(s, id),
    );
    if (citations.length < 2) return queue(s, [sys("SELECT_EVIDENCE")]);
    const decision = {
      ...clone(d),
      consequence: DESSERT_OUTCOMES[d.selectedOption],
      evidenceCitations: citations,
      committedAt: new Date().toISOString(),
    };
    return queue(
      { ...s, decision },
      [sys("RECOMMENDATION_SUBMITTED"), sys("RESPONSE_RECORDED")],
      `end${d.selectedOption}`,
    );
  }
  if (event.type === "reflection" && task === "reflection")
    return { ...s, reflection: event.text };
  if (
    event.type === "reflect" &&
    task === "reflection" &&
    s.reflection.trim().length >= 40
  )
    return queue(s, [sys("REFLECTION_SAVED")], "quiz-intro");
  if (event.type === "answer" && task === "question" && !s.result) {
    const q = scenario.exitTicket.mcqs[step.question];
    return q.options.some((o) => o.id === event.answer)
      ? { ...s, answers: { ...s.answers, [q.id]: event.answer } }
      : s;
  }
  if (event.type === "recordAnswer" && task === "question" && !s.result) {
    const q = scenario.exitTicket.mcqs[step.question];
    return s.answers[q.id]
      ? queue(s, [sys("RESPONSE_RECORDED")], step.next)
      : queue(s, [sys("SELECT_OPTION")]);
  }
  if (
    event.type === "editAnswer" &&
    task === "assessment" &&
    !s.result &&
    event.index >= 0 &&
    event.index < 5
  )
    return enter(s, `question${event.index + 1}`);
  if (
    event.type === "assess" &&
    task === "assessment" &&
    !s.result &&
    measurementsComplete(s) &&
    s.investigation.identified &&
    s.decision &&
    s.reflection.trim().length >= 40
  ) {
    if (!scenario.exitTicket.mcqs.every((q) => s.answers[q.id])) return s;
    const result = gradeIonic(scenario.exitTicket.mcqs, s.answers);
    return {
      ...enter(s, "done"),
      result,
      completed: true,
      lastLine: null,
      playback: null,
    };
  }
  return s;
}
export function dessertNotebook(s) {
  return {
    dessertStory: { ...s, beatId: dessertActiveLine(s)?.id || null },
    investigation: {
      ...s.investigation,
      firstChoice: s.firstChoice,
      firstAttempts: s.firstAttempts,
    },
    assessmentDraft: s.answers,
    ...(s.investigation.identified
      ? {
          scene1: {
            selectedOption: "A",
            identifications: s.investigation.identities,
            justification: s.investigation.evidence
              .map((e) => e.observation)
              .join("\n"),
            scientificFeedback: "Supported hypothesis",
          },
        }
      : {}),
    ...(s.decision ? { scene2: s.decision } : {}),
    ...(s.reflection ? { reflection: s.reflection } : {}),
  };
}
// Every approved KEEP clip has an active node or conditional action; CUT originals stay archived.
export function dessertAudioRoutes() {
  const map = {};
  const add = (id, route) => {
    if (!media.recordings[id]) throw new Error(`Missing recording ${id}`);
    if (!isDessertLineActive(id)) return;
    (map[id] ??= []).push(route);
  };
  for (const [key, n] of Object.entries(DESSERT_NODES))
    for (const id of n.lines)
      add(
        id,
        ["pass", "retry"].includes(key)
          ? `optional-completion:${key}`
          : `node:${key}`,
      );
  const conditions = {
    CH02_DEC01_CORRECT_HAMAD: "first:controlled",
    ...Object.fromEntries(
      [...take("02", "12", 5, 6), ...take("02", "12", 3, 3)].map((id) => [
        id,
        "calibrated",
      ]),
    ),
    ...Object.fromEntries(
      [...take("02", "13", 3, 6)].map((id) => [id, "measured:A-conductivity"]),
    ),
    ...Object.fromEntries(
      [...take("02", "14", 2, 3)].map((id, i) => [
        id,
        `measured:${i ? "C" : "B"}-conductivity`,
      ]),
    ),
    ...Object.fromEntries(
      [...take("02", "14", 4, 8)].map((id) => [id, "conductivity:confirmed"]),
    ),
    ...Object.fromEntries(
      [...take("02", "15", 4, 9)].map((id) => [id, "electron:NaCl-complete"]),
    ),
    ...Object.fromEntries(
      [...take("02", "17", 3, 5)].map((id) => [id, "measured:all-pH"]),
    ),
    ...Object.fromEntries(
      [...take("02", "18", 4, 9)].map((id) => [
        id,
        "measured:acid-conditional",
      ]),
    ),
    ...Object.fromEntries(
      ["A", "B", "C"].flatMap((a) => [
        [`CH02_SC19_${a}_SYSTEM`, "identified:correct"],
        [`CH02_SC19_${a}_OK_HAMAD`, "identified:correct"],
      ]),
    ),
    CH02_SC19_WRONG_HAMAD: "identified:incorrect",
    CH02_SC19_COMPLETE_NARRATOR: "identified:complete",
    ...Object.fromEntries(
      ["A", "B", "C", "D"].map((a) => [
        `CH03_SC22_OPTION_${a}_NARRATOR`,
        `read-option:${a}`,
      ]),
    ),
    ...Object.fromEntries(
      [1, 2, 3, 4, 5].flatMap((i) =>
        ["CORRECT", "INCORRECT"].map((c) => [
          `CH05_Q0${i}_${c}_HAMAD`,
          `optional-review:question${i}:${c}`,
        ]),
      ),
    ),
  };
  for (const [id, route] of Object.entries(conditions)) add(id, route);
  const system = {
    SELECT_OPTION: "attempted-submit:missing-choice",
    REVIEW_EVIDENCE: "review-evidence-request/unchecked-conductivity",
    RESPONSE_RECORDED: "committed-decision/recorded-quiz-answer",
    EVIDENCE_ADDED: "new-observation/model/identification",
    COMPLETE_MEASUREMENTS: "attempted-continue:missing-readings",
    ACTION_NOT_PERMITTED: "first:taste-prevented",
    KEEP_SEPARATE: "first:mix-prevented",
    CALIBRATION_COMPLETE: "calibrated",
    MEASUREMENT_COMPLETE: "actual-measurement",
    IDENTIFICATION_SUPPORTED: "identified:correct",
    IDENTIFICATION_MISMATCH: "identified:incorrect",
    JUSTIFICATION_MINIMUM: "attempted-decision:short-justification",
    SELECT_EVIDENCE: "attempted-decision:missing-citations",
    RECOMMENDATION_SUBMITTED: "decision-committed",
    REFLECTION_SAVED: "reflection-accepted",
    ASSESSMENT_COMPLETE: "assessment-submitted",
    ACHIEVEMENT_EARNED: "assessment-passed",
    TRY_AGAIN: "incorrect-investigation/identification",
  };
  for (const [id, route] of Object.entries(system)) add(sys(id), route);
  return map;
}

export function dessertTrailFromVisited(s) {
  const visits = [];
  for (const item of s.visited || []) {
    const n = DESSERT_NODES[item.node],
      line = media.recordings[item.id];
    if (!n || !line) continue;
    const key = `${DESSERT_ID}:IMAGE_${n.scene}`,
      last = visits.at(-1);
    const descriptor = {
      key,
      title: `Scene ${n.scene} · ${n.title}`,
      kind: "dessert",
      waitForArtwork: true,
      art: n.scene === 15 ? null : media.images[n.art].url,
      maskForeground: [3, 4].includes(n.scene),
      visual:
        n.scene === 15
          ? { ionicFormation: { transferred: /SC15_00[4-9]_/.test(item.id) } }
          : null,
    };
    const row = {
      id: line.id,
      text: line.text,
      audio: line.audio,
      speaker: DESSERT_SPEAKERS[line.speaker],
      scene: String(n.scene),
      video: n.video && n.videoAt === line.id ? media.videos[n.video] : null,
    };
    if (last?.key === key) {
      Object.assign(last, descriptor);
      if (!last.lines.some((x) => x.id === line.id)) last.lines.push(row);
    } else visits.push({ ...descriptor, lines: [row] });
  }
  return visits;
}
