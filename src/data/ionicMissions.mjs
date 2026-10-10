export const HAMAD = Object.freeze({
  name: "Hamad Al Zaabi",
  age: 27,
  nationality: "Emirati",
  title: "Applied Chemistry Field Investigator",
  portrait: "/images/ionic/hamad-al-zaabi.webp",
  personality: "Calm, curious, precise; evidence before assumptions.",
});
export const IONIC_ROLE = {
  id: "ionic_materials_specialist",
  title: "Ionic Materials Specialist",
  icon: "💠",
  color: "teal",
  description:
    "Investigate everyday materials and marine minerals through ionic chemistry.",
  difficulty: "Advanced",
  scenarios: ["ionic_dessert_mystery", "ionic_aquarium_mystery"],
};
const option = (id, text, correct = false) => ({ id, text, correct });
const question = (id, question, options, explanation) => ({
  id,
  question,
  options,
  explanation,
});
const decision = (id, text, consequence) => ({
  id,
  text,
  consequence,
  icon: "🔎",
  tags: [],
});
const outcome = (outcome, message, newData, rating) => ({
  outcome,
  message,
  newData,
  rating,
});
const core = {
  interactiveIonic: true,
  character: HAMAD,
  strand: "Chemistry",
  difficulty: "Advanced",
  skills: [
    "data_interpretation",
    "scientific_reasoning",
    "concept_application",
    "decision_making",
    "communication",
  ],
  glossaryTerms: [
    "cation",
    "anion",
    "ionic bond",
    "formula unit",
    "polyatomic ion",
  ],
  textbook:
    "UAE Inspire Science Chemistry, Student Edition 2025–26 · Chapter 3 · pp. 63–80",
  fictionNotice:
    "A fictional educational investigation at a real Abu Dhabi venue. This incident did not occur at the venue; no venue endorsement is implied.",
};
export const IONIC_SCENARIOS = {
  ionic_dessert_mystery: {
    ...core,
    id: "ionic_dessert_mystery",
    title: "The Final Dessert: 12 Minutes to Disaster",
    role: "Food Quality & Ingredient Verification Specialist",
    estimatedTime: 12,
    badge: "Ionic Evidence Investigator",
    badgeArtwork: "/images/ionic/ionic-evidence-badge.svg",
    badgeIcon: "🧪",
    location: "Umm Al Emarat Park, Abu Dhabi",
    atmosphere: "dessert",
    artwork: "/images/ionic/dessert-park.webp",
    introVideo: "/videos/scenarios/ionic_dessert_mystery.mp4",
    context:
      "In a fictional youth dessert competition at Umm Al Emarat Park, three identical white powders have lost their labels. The final round is due in 12 minutes. Hamad must establish what the evidence supports before any ingredient is used.",
    studentMission:
      "Work alongside Hamad: investigate Samples A, B and C, model ion formation, record a supported identification, and recommend how the fictional competition should proceed.",
    scienceFocus: [
      "Valence electrons, cations and anions",
      "Ionic bonding and mobile-ion conductivity",
      "Evidence-based compound identification",
    ],
    mentorQuote:
      "Three white powders can look identical. Let the measurements tell the story—and keep every unknown out of the dessert.",
    successConsequences: ["verify-replace"],
    successImpact:
      "You supported the identities with independent evidence and used traceable, sealed replacements.",
    failureImpact:
      "The fictional competition pauses because the recommendation did not establish a reliable, safe ingredient supply.",
    scenes: [
      {
        id: 1,
        title: "Find the Clues",
        question:
          "What does your combined evidence support about the three powders?",
        options: [
          option(
            "A",
            "An evidence-supported identification of all three samples",
            true,
          ),
          option("B", "My initial sample mapping needs revision"),
        ],
        learningObjective:
          "Explain why dissolved ionic compounds conduct and why appearance alone cannot identify a substance.",
      },
      {
        id: 2,
        title: "Make the Call",
        question: "How should Hamad advise the fictional competition team?",
        options: [
          decision(
            "A",
            "Record the evidence-supported identities, quarantine the unknowns, and use sealed, labelled food-grade replacements.",
            "verify-replace",
          ),
          decision(
            "B",
            "Use the powder with the weakest conductivity as the dessert ingredient without verifying its origin.",
            "conductivity-only",
          ),
          decision(
            "C",
            "Ask a contestant to taste the unlabelled powders so the competition can continue.",
            "taste",
          ),
          decision(
            "D",
            "Choose the whitest powder by appearance and return all three jars to the dessert station.",
            "appearance",
          ),
        ],
      },
      {
        id: 3,
        title: "See What Happens!",
        consequences: {
          "verify-replace": outcome(
            "The fictional final round resumes with traceable ingredients. Hamad records A as sugar, B as sodium hydrogen carbonate and C as sodium chloride; the unknown jars remain quarantined.",
            "Sugar dissolves as neutral molecules. The two salts release mobile ions; bicarbonate is distinguished from chloride by complementary pH and gas evidence. These educational tests suggest identity; they do not certify food safety.",
            "Evidence log complete · Sealed replacements verified · No unknown powder served",
            "strong",
          ),
          "conductivity-only": outcome(
            "The fictional team cannot verify the ingredient source. The final round is paused and a prepared batch is discarded.",
            "Low conductivity supports a molecular solute in this candidate set, but does not prove an unknown is sugar, food grade or uncontaminated. Several ionic solutes also have similar conductivity.",
            "Origin unverified · Ingredient release withheld",
            "risky",
          ),
          taste: outcome(
            "Hamad stops the fictional taste check before anyone samples an unknown. The team loses preparation time while replacement ingredients are obtained.",
            "Tasting is not an acceptable identification test for an unknown. White appearance and a familiar setting do not establish chemical identity or suitability for food.",
            "Unknowns isolated · No tasting carried out · Investigation restarted",
            "weak",
          ),
          appearance: outcome(
            "The fictional dessert fails quality verification. The team cannot distinguish the jars and must restart with labelled ingredients.",
            "Colour does not reveal bonding or composition. Sugar, sodium chloride and sodium hydrogen carbonate can all appear white. Independent evidence and traceability are needed.",
            "Sample identities unresolved · Competition delayed",
            "weak",
          ),
        },
      },
    ],
    exitTicket: {
      mcqs: [
        question(
          "d1",
          "A sodium atom loses one valence electron. What forms?",
          [
            option("A", "Na⁻"),
            option("B", "Na⁺", true),
            option("C", "A sodium atom with fewer protons"),
            option("D", "Na²⁺"),
          ],
          "Removing one negatively charged electron leaves one excess positive charge; the proton count does not change.",
        ),
        question(
          "d2",
          "A chlorine atom gains one electron. Which description is correct?",
          [
            option("A", "A positive cation forms"),
            option("B", "A proton is gained"),
            option("C", "A chloride anion forms", true),
            option("D", "The nucleus changes to a noble gas"),
          ],
          "The chloride ion has a 1− charge and a complete outer energy level; its element identity remains chlorine.",
        ),
        question(
          "d3",
          "Why does an aqueous sodium chloride solution conduct electricity?",
          [
            option("A", "Dissolved ions can move and carry charge", true),
            option("B", "Solid crystals contain moving electrons"),
            option("C", "Water creates sodium metal"),
            option("D", "Every dissolved molecule carries charge"),
          ],
          "NaCl dissociates into mobile Na⁺ and Cl⁻ ions. Dissolution does not repeat electron transfer from sodium metal to chlorine.",
        ),
        question(
          "d4",
          "Why does a pure sucrose solution conduct much less than a salt solution?",
          [
            option("A", "Sucrose cannot dissolve"),
            option("B", "Sucrose contains no electrons"),
            option("C", "Sucrose removes all ions from water"),
            option("D", "Dissolved sucrose remains neutral molecules", true),
          ],
          "Sucrose dissolves primarily as neutral molecules rather than producing mobile ions. Trace ions can still produce a small background reading.",
        ),
        question(
          "d5",
          "Both unknown salt solutions conduct. What is the strongest next step?",
          [
            option("A", "Assign names from conductivity alone"),
            option(
              "B",
              "Combine independent tests with known reference evidence",
              true,
            ),
            option("C", "Taste the samples"),
            option("D", "Assume all conducting solutions contain chloride"),
          ],
          "Conductivity detects mobile charge carriers, not a unique compound identity. Complementary tests distinguish candidates; food suitability still requires traceability.",
        ),
      ],
    },
  },
  ionic_aquarium_mystery: {
    ...core,
    id: "ionic_aquarium_mystery",
    title: "Ocean Dome: The Water Is Turning White!",
    role: "Marine Water Chemistry & Mineral Deposits Specialist",
    estimatedTime: 18,
    badge: "Marine Mineral Analyst",
    badgeArtwork: "/images/ionic/marine-mineral-badge.svg",
    badgeIcon: "💎",
    location: "The National Aquarium Abu Dhabi, Al Qana",
    atmosphere: "aquarium",
    artwork: "/images/ionic/aquarium-lab.webp",
    introVideo: "/videos/scenarios/ionic_aquarium_mystery.mp4",
    context:
      "An entirely fictional educational aquarium simulation at Al Qana develops cloudy water and white deposits in its isolated demonstration loop. Hamad investigates the mineral evidence. This is not a real incident at The National Aquarium Abu Dhabi.",
    studentMission:
      "Analyze the unknown deposit, construct a neutral ionic formula, explore crystal structures in 360°, test water-chemistry trends in a virtual sample, and justify a proportionate response.",
    scienceFocus: [
      "Repeating ionic crystal structures and properties",
      "Neutral ionic formulas and charge balancing",
      "Polyatomic ions and naming compounds",
    ],
    mentorQuote:
      "A cloudy sample is a clue, not a diagnosis. Build the mineral case before recommending a response.",
    successConsequences: ["isolate-review"],
    successImpact:
      "Your evidence supports calcium carbonate and a qualified, monitored response to the isolated demonstration loop.",
    failureImpact:
      "The chosen response did not address the mineral evidence or introduced an avoidable uncertainty.",
    scenes: [
      {
        id: 1,
        title: "Find the Clues",
        question:
          "Which mineral hypothesis is best supported by your independent evidence?",
        options: [
          option(
            "A",
            "A supported calcium carbonate hypothesis with a neutral formula",
            true,
          ),
          option("B", "The initial mineral hypothesis needs revision"),
        ],
        learningObjective:
          "Connect ionic composition, neutral formulas and crystal structure to mineral properties.",
      },
      {
        id: 2,
        title: "Make the Call",
        question:
          "What should Hamad recommend for this fictional demonstration loop?",
        options: [
          decision(
            "A",
            "Treat the deposit as sodium chloride and add more salt to the demonstration loop.",
            "add-salt",
          ),
          decision(
            "B",
            "Isolate the demonstration loop, confirm the calcium carbonate identification, and ask qualified staff to review calcium, alkalinity and pH with continued monitoring.",
            "isolate-review",
          ),
          decision(
            "C",
            "Add acid directly to an animal exhibit to dissolve the deposits immediately.",
            "acid-tank",
          ),
          decision(
            "D",
            "Remove the visible deposit and stop chemistry monitoring because the water looks clearer.",
            "appearance-only",
          ),
        ],
      },
      {
        id: 3,
        title: "See What Happens!",
        consequences: {
          "isolate-review": outcome(
            "The fictional demonstration loop remains isolated while the qualified chemistry team verifies the mineral and reviews its operating conditions. Animal exhibits are unaffected.",
            "The calcium signal, carbonate evidence, limited water solubility and reference fingerprint support CaCO₃. Ca²⁺ and CO₃²⁻ combine in a 1:1 neutral formula. Monitoring addresses the causes rather than merely hiding the deposit.",
            "Mineral identity confirmed in the simulation · Demonstration loop under review · Independent readings retained",
            "strong",
          ),
          "add-salt": outcome(
            "More dissolved salt increases the fictional demonstration loop’s ion load, but the white deposit remains. Staff return to the mineral evidence.",
            "Conductivity of marine water cannot identify a deposit; seawater already contains many ions. Sodium chloride is readily soluble and does not fit the calcium/carbonate evidence.",
            "Salinity trend disturbed · Mineral source unresolved",
            "weak",
          ),
          "acid-tank": outcome(
            "Hamad prevents the proposed direct dosing. Qualified staff keep the fictional animal exhibits separate while they inspect the decision.",
            "Acid can react with carbonate in a controlled isolated sample, but that observation is not permission to alter an animal system. Abrupt changes in pH can harm organisms.",
            "No animal-tank dosing carried out · Proposed intervention rejected",
            "weak",
          ),
          "appearance-only": outcome(
            "The fictional demonstration loop looks clearer briefly, then deposits reappear. The conditions that favoured precipitation were not investigated.",
            "Removing a deposit does not remove the cause of mineral formation. Clear appearance is not a substitute for measurements or trend monitoring.",
            "Cloudiness recurs · Chemistry trends were missed",
            "risky",
          ),
        },
      },
    ],
    exitTicket: {
      mcqs: [
        question(
          "a1",
          "Which simplest formula balances Ca²⁺ and CO₃²⁻?",
          [
            option("A", "CaCO₃", true),
            option("B", "Ca₂CO₃"),
            option("C", "Ca(CO₃)₂"),
            option("D", "Ca₂(CO₃)₂"),
          ],
          "A 1:1 ratio gives +2 + (−2) = 0. A 2:2 ratio is not the simplest formula unit.",
        ),
        question(
          "a2",
          "What is the neutral formula for Al³⁺ and SO₄²⁻?",
          [
            option("A", "AlSO₄"),
            option("B", "Al₃(SO₄)₂"),
            option("C", "Al₂(SO₄)₃", true),
            option("D", "Al₂SO₄₃"),
          ],
          "Two Al³⁺ ions and three sulfate ions give +6 − 6 = 0. Parentheses preserve the complete polyatomic ion when more than one is present.",
        ),
        question(
          "a3",
          "In the interior of a sodium chloride crystal, each Na⁺ is surrounded by how many nearest Cl⁻ ions?",
          [
            option("A", "One"),
            option("B", "Six", true),
            option("C", "Four"),
            option("D", "Eight"),
          ],
          "The rock-salt lattice has six nearest neighbours of opposite charge. Surface ions in a finite model have fewer visible neighbours.",
        ),
        question(
          "a4",
          "Why does a typical solid ionic crystal not conduct, while its melt can?",
          [
            option("A", "Its ions become electrons on melting"),
            option("B", "The solid has no charged particles"),
            option("C", "All ionic compounds are soluble"),
            option(
              "D",
              "Ions are fixed in the solid but mobile in the melt",
              true,
            ),
          ],
          "Charge carriers must move to conduct. Dissolved ionic compounds can also conduct when mobile ions are present; low solubility limits their contribution.",
        ),
        question(
          "a5",
          "What is the correct name for CaCO₃?",
          [
            option("A", "Calcium carbon trioxide"),
            option("B", "Calcium chloride"),
            option("C", "Calcium carbonate", true),
            option("D", "Calcium monocarbonate"),
          ],
          "Name the cation first and retain the polyatomic anion’s name. Carbonate is CO₃²⁻; it is not a set of separate monatomic ions.",
        ),
      ],
    },
  },
};

// Existing teacher guides and analytics read misconceptions from decision options.
for (const scenario of Object.values(IONIC_SCENARIOS)) {
  for (const option of scenario.scenes[1].options) {
    if (!scenario.successConsequences.includes(option.consequence)) {
      option.misconception = {
        thought: option.text,
        correction: scenario.scenes[2].consequences[option.consequence].message,
      };
    }
  }
}
