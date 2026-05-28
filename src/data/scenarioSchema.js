/**
 * scenarioSchema.js
 *
 * Defines the clean, reusable schema for Perspective X Scenarios.
 * This serves as the foundation for the future Teacher Scenario Builder,
 * outlining how scenario data must be structured to be fully data-driven,
 * backward-compatible, and properly rendered by the player engine.
 */

export const ScenarioSchema = {
  id: "string (e.g., 'water_contamination')",
  title: "string (e.g., 'The Invisible Threat')",
  strand: "string (e.g., 'Chemistry', 'Physics', 'Biology', 'Earth Science')",
  difficulty: "string (e.g., 'Beginner', 'On-Track', 'Advanced')",
  estimatedTime: "number (minutes, e.g., 15)",
  role: "string (e.g., 'Environmental Chemist – Water Safety Specialist')",
  roleQuote: "string (e.g., 'Your job is to protect public health...')",
  context: "string (background text describing the starting state of the scenario)",
  scienceFocus: "array of strings (e.g., ['Water quality', 'Solubility & concentration'])",
  badge: "string (e.g., 'Water Safety Analyst')",
  badgeIcon: "string (emoji, e.g., '💧')",
  skills: "array of strings (e.g., ['data_interpretation', 'scientific_reasoning'])",

  scenes: [
    {
      id: "1",
      title: "string (e.g., 'Understanding the Problem')",
      narrative: "string (narrative description of Scene 1)",
      data: {
        type: "string (e.g., 'table_and_graph', 'table', 'text')",
        table: {
          headers: "array of strings (e.g., ['Substance', 'Measured (ppm)', 'Safe Limit (ppm)'])",
          rows: "array of arrays of strings (e.g., [['Nitrates', '55', '50'], ...])"
        },
        graphDescription: "string (optional description for rendering a bar graph)",
        mapNote: "string (optional note, e.g., 'Map shows factory upstream')"
      },
      question: "string (multiple choice question for Scene 1)",
      options: [
        {
          id: "string (e.g., 'A')",
          text: "string (option text)",
          correct: "boolean (is this option correct?)",
          feedback: "string (constructive feedback explaining why this is correct or incorrect)"
        }
      ],
      hints: "array of strings (optional scene-specific hints, e.g., ['Look at the Safe Limit...'])",
      learningObjective: "string (e.g., 'Identifying environmental risks using data')",
      guided: "object (optional overrides for beginner mode)",
      challenge: "object (optional overrides for advanced mode)"
    },
    {
      id: "2",
      title: "string (e.g., 'The Decision Point')",
      narrative: "string (narrative description of Scene 2)",
      question: "string (decision question, e.g., 'What should you recommend FIRST?')",
      options: [
        {
          id: "string (e.g., 'A')",
          text: "string (choice text)",
          icon: "string (emoji, e.g., '🧪')",
          tags: "array of strings (e.g., ['Fast solution', 'Higher cost'])",
          consequence: "string (unique key mapping to the consequence, e.g., 'treatment')",
          ethical: "string (optional category, e.g., 'economic')",
          misconception: {
            thought: "string (common misconception detail)",
            correction: "string (direct correction explaining the scientific truth)"
          },
          betterThinkingTip: "string (optional constructive tip for amber/red ratings)",
          rating: "string (optional rating: 'strong', 'risky', 'weak')"
        }
      ],
      hints: "array of strings (optional choice-specific hints)",
      evidence: "array of strings (optional reminder bullet points shown on the choice screen)"
    },
    {
      id: "3",
      title: "string (e.g., 'Consequences & Response')",
      consequences: {
        "[consequenceKey]": {
          outcome: "string (narrative of what happened after making this decision)",
          message: "string (scientific explanation of why this consequence occurred)",
          newData: "string (optional post-intervention measurements, e.g., 'Nitrates: 12 ppm')",
          rating: "string (optional rating: 'strong', 'risky', 'weak')",
          betterThinkingTip: "string (optional tip for improving student understanding)",
          misconception: {
            thought: "string (misconception summary)",
            correction: "string (scientific clarification)"
          }
        }
      }
    }
  ],

  reflection: [
    {
      id: "string (e.g., 'q1')",
      question: "string (e.g., 'Why did you make this choice?')",
      starter: "string (sentence starter, e.g., 'I chose this because ')"
    }
  ],

  exitTicket: {
    mcqs: [
      {
        question: "string (multiple choice question text)",
        options: [
          {
            id: "string (e.g., 'A')",
            text: "string (option text)",
            correct: "boolean (is this option correct?)"
          }
        ]
      }
    ]
  }
};

/**
 * Validates a scenario object against the standard Scenario schema.
 * @param {object} scenario - The scenario to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateScenario(scenario) {
  const errors = [];

  if (!scenario) {
    return { valid: false, errors: ["Scenario is null or undefined"] };
  }

  // Core properties
  const requiredCore = ["id", "title", "role", "scenes"];
  requiredCore.forEach((prop) => {
    if (!scenario[prop]) {
      errors.push(`Missing core property: "${prop}"`);
    }
  });

  if (scenario.scenes) {
    if (!Array.isArray(scenario.scenes)) {
      errors.push('"scenes" must be an array');
    } else {
      if (scenario.scenes.length < 2) {
        errors.push('"scenes" must contain at least Scene 1 (Evidence) and Scene 2 (Decision)');
      } else {
        // Validate Scene 1
        const s1 = scenario.scenes[0];
        if (s1.id != 1 && s1.id !== "1") errors.push('Scene 1 must have id "1"');
        if (!s1.question) errors.push("Scene 1 must have a question");
        if (!Array.isArray(s1.options) || s1.options.length === 0) {
          errors.push("Scene 1 must have options");
        } else {
          s1.options.forEach((opt, idx) => {
            if (!opt.id) errors.push(`Scene 1 Option index ${idx} is missing id`);
            if (!opt.text) errors.push(`Scene 1 Option index ${idx} is missing text`);
            if (opt.correct === undefined) errors.push(`Scene 1 Option index ${idx} is missing correct flag`);
          });
        }

        // Validate Scene 2
        const s2 = scenario.scenes[1];
        if (s2.id != 2 && s2.id !== "2") errors.push('Scene 2 must have id "2"');
        if (!s2.question) errors.push("Scene 2 must have a question");
        if (!Array.isArray(s2.options) || s2.options.length === 0) {
          errors.push("Scene 2 must have options");
        } else {
          s2.options.forEach((opt, idx) => {
            if (!opt.id) errors.push(`Scene 2 Option index ${idx} is missing id`);
            if (!opt.text) errors.push(`Scene 2 Option index ${idx} is missing text`);
            if (!opt.consequence) errors.push(`Scene 2 Option index ${idx} is missing consequence key`);
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Normalizes a scenario, providing fallbacks for optional data-driven fields.
 * Ensures the scenario structure is fully safe to render inside the dashboard.
 * @param {object} scenario - The raw scenario object.
 * @returns {object} Normalized scenario.
 */
export function normalizeScenario(scenario) {
  if (!scenario) return null;

  // Create a deep-ish clone to avoid mutating the original scenario object
  const normalized = { ...scenario };

  // Ensure default metadata exists
  normalized.strand = normalized.strand || "Chemistry";
  normalized.difficulty = normalized.difficulty || "On-Level";
  normalized.estimatedTime = normalized.estimatedTime || 15;
  normalized.scienceFocus = normalized.scienceFocus || [];
  normalized.skills = normalized.skills || [];
  normalized.badge = normalized.badge || "Science Analyst";
  normalized.badgeIcon = normalized.badgeIcon || "🔬";

  // Ensure scenes are populated
  if (Array.isArray(normalized.scenes)) {
    normalized.scenes = normalized.scenes.map((scene) => {
      const normScene = { ...scene };
      if (!normScene.hints) normScene.hints = [];
      return normScene;
    });
  } else {
    normalized.scenes = [];
  }

  // Ensure exitTicket defaults
  if (!normalized.exitTicket) {
    normalized.exitTicket = { mcqs: [] };
  } else if (!normalized.exitTicket.mcqs && normalized.exitTicket.questions) {
    normalized.exitTicket.mcqs = normalized.exitTicket.questions;
  } else if (!normalized.exitTicket.mcqs) {
    normalized.exitTicket.mcqs = [];
  }

  // Ensure reflection questions fall back to standard if empty
  if (!normalized.reflection || !Array.isArray(normalized.reflection)) {
    normalized.reflection = [
      { id: "whyChoice", question: "Why did you make this choice?", starter: "I chose this because " },
      { id: "evidenceHelp", question: "What evidence helped you?", starter: "The evidence showed " },
      { id: "nextTime", question: "What would you do differently next time?", starter: "Next time, I would " }
    ];
  }

  return normalized;
}
