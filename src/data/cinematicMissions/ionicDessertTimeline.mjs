const root = "/images/scenarios/ionic_dessert_mystery/cinematic/";
export const DESSERT_PHOTOGRAPHS = [
  "01_park_establishing.webp",
  "02_finalists_preparing.webp",
  "03_lost_labels.webp",
  "04_three_unknowns.webp",
  "05_stop_preparation.webp",
  "06_hamad_entrance.webp",
  "07_hamad_assignment.webp",
  "08_investigation_table.webp",
  "09_conductivity_clue.webp",
  "10_electron_challenge.webp",
  "11_second_test.webp",
  "12_final_decision.webp",
  "13_evidence_rescue.webp",
  "14_conductivity_only.webp",
  "15_unsafe_taste_stopped.webp",
  "16_appearance_guess.webp",
];
const dialogue = (scene, lines) =>
  lines.map(([start, speaker, text], index) => ({
    id: `${scene}-line-${index + 1}`,
    speaker,
    text,
    subtitle: text,
    start,
    voiceProfile: speaker,
    rate: {
      Hamad: 0.96,
      Mariam: 1.06,
      Saeed: 1.04,
      Fatima: 0.94,
      Narrator: 0.92,
    }[speaker],
    pitch: 1,
    recordedAudio: null,
  }));
function scene(
  id,
  photo,
  duration,
  chapter,
  next,
  lines,
  checkpoint = null,
  camera = "push",
) {
  const image = root + DESSERT_PHOTOGRAPHS[photo - 1];
  return {
    id,
    image,
    mobileImage: root + "mobile/" + DESSERT_PHOTOGRAPHS[photo - 1],
    duration,
    chapter,
    next,
    checkpoint,
    camera,
    imagePosition: "50% 50%",
    mobilePosition: `${[50, 50, 50, 50, 40, 67, 64, 58, 67, 70, 50, 70, 63, 66, 68, 61][photo - 1]}% 50%`,
    dialogue: dialogue(id, lines).map((event) => ({ ...event, image })),
    cues: [
      {
        id: `${id}-cue`,
        start: 0,
        cue:
          photo === 3
            ? "incident"
            : photo === 6
              ? "arrival"
              : photo >= 13
                ? photo === 13
                  ? "supported"
                  : "uncertain"
                : "atmosphere",
      },
    ],
  };
}
const scenes = [
  scene(
    "park",
    1,
    7,
    0,
    "finalists",
    [
      [
        2,
        "Narrator",
        "Abu Dhabi. One competition. Twelve minutes left on the clock.",
      ],
    ],
    null,
    "pan-left",
  ),
  scene(
    "finalists",
    2,
    10,
    0,
    "labels",
    [
      [
        2,
        "Mariam",
        "Saeed, batter in two minutes! Sugar and baking soda, please!",
      ],
      [6, "Saeed", "They're on the top shelf!"],
    ],
    null,
    "pan-right",
  ),
  scene(
    "labels",
    3,
    9,
    0,
    "unknowns",
    [[2, "Saeed", "Oh no! The labels! They all came off!"]],
    null,
    "detail",
  ),
  scene("unknowns", 4, 9, 0, "stop", [
    [0, "Mariam", "Which one is sugar? They look identical!"],
    [4, "Saeed", "And which one's the baking soda?"],
  ]),
  scene("stop", 5, 8, 0, "arrival", [
    [
      0,
      "Fatima",
      "Stop preparation. No unknown ingredients go into this dessert.",
    ],
  ]),
  scene(
    "arrival",
    6,
    10,
    0,
    "assignment",
    [
      [2, "Fatima", "Hamad, can you help us?"],
      [6, "Hamad", "Only if we follow the evidence."],
    ],
    null,
    "pan-left",
  ),
  scene("assignment", 7, 12, 0, "table", [
    [
      0,
      "Hamad",
      "Three white powders. One wrong assumption could ruin the final.",
    ],
    [
      6,
      "Hamad",
      "You're our investigator. Tell me what the measurements really mean.",
    ],
  ]),
  scene(
    "table",
    8,
    10,
    1,
    "conductivity-clue",
    [
      [0, "Hamad", "First, calibrate the sensor."],
      [3, "Hamad", "Then test each sample. Don't guess."],
    ],
    "conductivity",
    "detail",
  ),
  scene(
    "conductivity-clue",
    9,
    10,
    1,
    "electrons",
    [
      [2, "Hamad", "One sample barely conducts. Two conduct much more."],
      [6, "Hamad", "But the readings don't name the substances."],
    ],
    null,
    "pan-right",
  ),
  scene(
    "electrons",
    10,
    8,
    1,
    "second-test",
    [
      [0, "Hamad", "Let's find out why. What happens when electrons transfer?"],
      [4, "Hamad", "Build the ions."],
    ],
    "electron",
  ),
  scene(
    "second-test",
    11,
    11,
    1,
    "decision",
    [
      [0, "Hamad", "Now examine each sample again."],
      [
        3,
        "Hamad",
        "Check pH and the controlled gas test. Which result matters?",
      ],
    ],
    "clues",
    "detail",
  ),
  scene(
    "decision",
    12,
    14,
    2,
    null,
    [
      [0, "Fatima", "The judges are nearly here."],
      [3, "Mariam", "Can we return to baking?"],
      [
        7,
        "Hamad",
        "You've collected the evidence. What decision will you defend?",
      ],
    ],
    "decision",
  ),
  scene("verify-replace", 13, 20, 3, "reflection", [
    [
      3,
      "Hamad",
      "Your tests support the identities. But unverified jars stay isolated.",
    ],
    [8, "Fatima", "Fresh, labelled ingredients are ready."],
    [11, "Mariam", "Great! Now we can bake safely."],
    [15, "Hamad", "That's a scientist's job: follow evidence, protect people."],
  ]),
  scene("conductivity-only", 14, 20, 3, "reflection", [
    [0, "Saeed", "The weakest reading means sugar, doesn't it?"],
    [
      4,
      "Hamad",
      "It points to fewer mobile ions. It doesn't establish food safety.",
    ],
    [9, "Fatima", "Hold that batch. No serving."],
    [
      12,
      "Hamad",
      "One measurement can't confirm what an unknown jar contains.",
    ],
  ]),
  scene("taste", 15, 20, 3, "reflection", [
    [0, "Saeed", "Couldn't someone taste just a little?"],
    [4, "Hamad", "No. Keep it sealed."],
    [
      7,
      "Hamad",
      "Never taste an unknown. Evidence comes from controlled investigation.",
    ],
    [12, "Fatima", "We'll obtain sealed replacements."],
    [16, "Hamad", "Safety is part of scientific thinking."],
  ]),
  scene("appearance", 16, 20, 3, "reflection", [
    [0, "Mariam", "This one looks like sugar... doesn't it?"],
    [
      4,
      "Hamad",
      "Different compounds can look alike. White colour proves nothing.",
    ],
    [9, "Fatima", "The ingredients remain on hold."],
    [12, "Hamad", "Without reliable identification, we cannot use them."],
  ]),
  scene(
    "reflection",
    7,
    6,
    3,
    "assessment",
    [[2, "Hamad", "Every decision leaves a result. Can you explain yours?"]],
    "reflection",
  ),
  scene("assessment", 12, 0, 4, "complete", [], "assessment"),
  scene("complete", 13, 0, 4, null, [], "complete"),
];
// These are quiet abstract motifs, not artificial crowd or utensil imitations.
scenes.find((s) => s.id === "finalists").cues = [
  { id: "preparation", start: 0, cue: "preparation" },
];
for (const id of ["unknowns", "decision"]) {
  const scene = scenes.find((s) => s.id === id);
  scene.cues.push(
    ...[2, 4, 6].map((start) => ({
      id: `${id}-tick-${start}`,
      start,
      cue: "tick",
    })),
  );
}
for (const id of ["table", "electrons", "second-test"])
  scenes.find((s) => s.id === id).cues = [
    { id: `${id}-science`, start: 0, cue: "investigation" },
  ];
export const ionicDessertTimeline = {
  id: "ionic_dessert_mystery",
  version: 1,
  start: "park",
  scenes: Object.fromEntries(scenes.map((s) => [s.id, s])),
  branches: {
    "verify-replace": "verify-replace",
    "conductivity-only": "conductivity-only",
    taste: "taste",
    appearance: "appearance",
  },
  prompts: {
    conductivity:
      "Start with the water-only control. Then compare the conductivity of Samples A, B and C.",
    electron:
      "Show me how a sodium atom becomes a positive ion, and how chlorine becomes a negative ion.",
    clues:
      "Conductivity gave us our first clue. Now combine independent evidence. Which sample contains hydrogen carbonate ions?",
    decision:
      "Your decision has consequences. Use the evidence you've collected—and explain why you trust it.",
  },
};
