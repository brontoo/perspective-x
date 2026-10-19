// An intentionally separate, expandable manifest. No dessert photographs are used here.
const image = "/images/ionic/aquarium-lab.webp";
const node = (id, chapter, next, checkpoint, text, duration = 7) => ({
  id,
  image,
  duration,
  chapter,
  next,
  checkpoint,
  camera: "push",
  imagePosition: "60% 50%",
  dialogue: text
    ? [
        {
          id: `${id}-hamad`,
          speaker: "Hamad",
          voiceProfile: "Hamad",
          text,
          subtitle: text,
          start: 0,
          image,
          rate: 0.96,
          pitch: 1,
          recordedAudio: null,
        },
      ]
    : [],
  cues: [{ id: `${id}-cue`, start: 0, cue: "atmosphere" }],
});
export const ionicAquariumTimeline = {
  id: "ionic_aquarium_mystery",
  version: 1,
  start: "aquarium-briefing",
  provisionalArtwork: true,
  scenes: {
    "aquarium-briefing": node(
      "aquarium-briefing",
      0,
      "aquarium-lab",
      null,
      "A cloudy sample is a clue, not a diagnosis. Join me at this fictional demonstration loop. We will build the mineral case before recommending a response.",
      12,
    ),
    "aquarium-lab": node(
      "aquarium-lab",
      1,
      "aquarium-decision",
      "mineral",
      "Collect independent mineral evidence. Build a neutral formula, explore the crystal, and compare water-chemistry trends.",
    ),
    "aquarium-decision": node(
      "aquarium-decision",
      2,
      null,
      "decision",
      "The evidence is ready. Which response will you defend for this isolated demonstration loop?",
    ),
    "isolate-review": node(
      "isolate-review",
      3,
      "aquarium-reflection",
      null,
      "The demonstration loop stays isolated. Qualified staff verify the mineral and review its operating conditions. Animal exhibits are unaffected.",
    ),
    "add-salt": node(
      "add-salt",
      3,
      "aquarium-reflection",
      null,
      "Adding salt changes the ion load, but the deposit remains. We must return to the mineral evidence.",
    ),
    "acid-tank": node(
      "acid-tank",
      3,
      "aquarium-reflection",
      null,
      "Stop. An isolated acid test is not permission to dose an animal exhibit. Qualified staff keep the systems separate.",
    ),
    "appearance-only": node(
      "appearance-only",
      3,
      "aquarium-reflection",
      null,
      "The deposits return. Clear appearance cannot replace chemistry measurements and monitoring.",
    ),
    "aquarium-reflection": node(
      "aquarium-reflection",
      3,
      "aquarium-assessment",
      "reflection",
      "Every decision leaves a result. Connect what happened to the evidence you collected.",
      6,
    ),
    "aquarium-assessment": node(
      "aquarium-assessment",
      4,
      "aquarium-complete",
      "assessment",
      "",
      0,
    ),
    "aquarium-complete": node("aquarium-complete", 4, null, "complete", "", 0),
  },
  branches: {
    "isolate-review": "isolate-review",
    "add-salt": "add-salt",
    "acid-tank": "acid-tank",
    "appearance-only": "appearance-only",
  },
  prompts: {
    mineral:
      "Analyze the isolated deposit. Keep the mineral evidence separate from the animal exhibits.",
  },
};
