import dialogue from "./oceanDialogue.json" with { type: "json" };

export const OCEAN_DIALOGUE = dialogue;
export const OCEAN_SPEAKERS = {
  NAR: { name: "Narrator", role: "The Ocean Dome story", portrait: null },
  HAM: {
    name: "Hamad Al Zaabi",
    role: "Applied Chemistry Field Investigator",
    portrait: "HAMAD AL ZAABI.jpg",
  },
  NOO: {
    name: "Noora Al Mansoori",
    role: "Marine educator",
    portrait: "NOORA AL MANSOORI.jpg",
  },
  KHA: {
    name: "Khalid Al Suwaidi",
    role: "Technical supervisor",
    portrait: "KHALID AL SUWAIDI.jpg",
  },
};
export const oceanPortrait = (code) => {
  const portrait = OCEAN_SPEAKERS[code]?.portrait;
  return portrait
    ? `/images/scenarios/ionic_aquarium_mystery/characters/${portrait}`
    : "";
};
export const oceanVideo = (name) =>
  `/videos/scenarios/ionic_aquarium_mystery/Ocean_Dome_video/${name}.mp4.mp4`;
export const OCEAN_VIDEOS = {
  incident: oceanVideo("video_01_water_turns_white"),
  carbonate: oceanVideo("video_02_carbonate_reaction"),
  "add-salt": oceanVideo("ending-add-salt"),
  "isolate-review": oceanVideo("ending-isolate-review"),
  "acid-tank": oceanVideo("ending-acid-tank"),
  "appearance-only": oceanVideo("ending-appearance-only"),
};
export const oceanLines = (scene, orders) =>
  dialogue.filter(
    (row) => row.scene === scene && (!orders || orders.includes(row.order)),
  );
export const oceanLine = (id) => dialogue.find((row) => row.id === id);
const part = (id, scene, art, orders, extra = {}) => ({
  id,
  scene,
  art,
  lines: oceanLines(scene, orders),
  ...extra,
});
export const OCEAN_BRIEFING = [
  part("marine-world", 1, "aquarium"),
  part("preparations", 2, "loop"),
  part("incident", 3, "cloudy", null, { video: "incident" }),
  part("response", 4, "staff"),
  part("arrival", 5, "hamad"),
  part("assignment", 6, "hamad"),
];
export const OCEAN_INVESTIGATION = [
  part("first-decision", 7, "evidence", [1], { task: "first" }),
  part("calcium", 8, "evidence", [1, 2], {
    task: "calcium",
    after: oceanLines(8, [3, 4]),
  }),
  part("solubility", 8, "evidence", [5], {
    task: "solubility",
    after: oceanLines(8, [6, 7]),
  }),
  part("controlled-test", 8, "carbonate", [8], { task: "carbonate" }),
  part("reaction", 9, "carbonate", null, {
    video: "carbonate",
    task: "interpret",
  }),
  part("fingerprint", 8, "evidence", [9], {
    task: "fingerprint",
    after: oceanLines(8, [10, 11]),
  }),
  part("formula", 10, "formula", [1, 2, 3], { task: "formula" }),
  part("crystal", 11, "crystal", [1, 2, 3, 4, 5], {
    task: "crystal",
    after: oceanLines(11, [6]),
  }),
  part("water", 12, "water", [1, 2, 3], {
    task: "water",
    after: oceanLines(12, [4, 5, 6]),
  }),
  part("identification", 13, "evidence", [1, 2], { task: "identity" }),
];
export const OCEAN_DECISION = [
  part("professional-decision", 14, "decision", [1, 2, 3, 4], {
    task: "decision",
  }),
];
export function oceanOutcome(branch) {
  if (
    !Object.hasOwn(OCEAN_VIDEOS, branch) ||
    ["incident", "carbonate"].includes(branch)
  )
    return [];
  return [
    {
      ...part("chosen-ending", 14, "outcome", []),
      lines: oceanLines(14).filter((row) => row.branch === branch),
      video: branch,
    },
    part("reflection", 15, "outcome", null, { task: "reflection" }),
  ];
}
export const OCEAN_ASSESSMENT = [
  part("expertise", 16, "outcome", [1], { task: "assessment" }),
];
export const OCEAN_FIRST_FEEDBACK = {
  measure: oceanLines(7, [2]),
  appearance: oceanLines(7, [3, 4]),
  salt: oceanLines(7, [5, 6]),
  acid: oceanLines(7, [7, 8]),
};
