/**
 * Original scientific mission content, adapted into five student-facing chapters.
 * This layer never changes existing video files, question keys or scenario IDs.
 */
export const MISSION_BLUEPRINTS = {
  "water_contamination": {
    "roleLead": "Layan Mansour",
    "signal": "Water-quality alert",
    "situation": "A community has reported unusual taste and odor in its drinking water; a water sample needs prompt review.",
    "stakes": "Public health depends on separating measured risk from speculation about the source.",
    "goal": "Find the concerning measurement and recommend an evidence-based first response.",
    "focusQuestion": "Which reading exceeds the scenario reference limit?",
    "outcomeLens": "Does the response protect residents while experts investigate the source?",
    "reflectionPrompt": "Which measurement best supports your recommendation, and what should happen next?",
    "objectives": [
      "Compare chemical measurements with stated reference values.",
      "Explain why boiling does not remove dissolved nitrate.",
      "Recommend prompt action using evidence and uncertainty."
    ]
  },
  "reaction_gone_wrong": {
    "roleLead": "Omar Al Khatib",
    "signal": "Process warning",
    "situation": "A production reactor's temperature is rising unexpectedly and a warning has interrupted operations.",
    "stakes": "A wrong assumption could expose workers to a serious hazard.",
    "goal": "Interpret reaction data and recommend a professionally managed safety response.",
    "focusQuestion": "What does the temperature trend reveal about heat and reaction rate?",
    "outcomeLens": "Does the response follow safe operating priorities?",
    "reflectionPrompt": "What evidence signals the growing hazard, and why does your action address it?",
    "objectives": [
      "Relate exothermic reactions and rates to temperature changes.",
      "Interpret industrial measurements as evidence of risk.",
      "Justify a safe action aligned with operating procedures."
    ]
  },
  "acid_rain": {
    "roleLead": "Layan Mansour",
    "signal": "Ecosystem alert",
    "situation": "Forests are deteriorating and lake organisms are declining downwind of industry.",
    "stakes": "The region needs a defensible explanation before decisions are made.",
    "goal": "Analyze acidity evidence and propose an effective environmental response.",
    "focusQuestion": "Which pH and environmental observations support concern about acid rain?",
    "outcomeLens": "Does the proposed action address monitoring and pollution?",
    "reflectionPrompt": "Which observation best links acidity to ecological harm?",
    "objectives": [
      "Interpret pH values and identify acidic conditions.",
      "Connect airborne pollutants to acid deposition.",
      "Evaluate a response considering ecosystem effects."
    ]
  },
  "mutation_dilemma": {
    "roleLead": "Rayan Al Hassan",
    "signal": "Genetic consultation",
    "situation": "Two prospective parents ask for help interpreting a genetic screening result.",
    "stakes": "They need accurate risk information without pressure over personal decisions.",
    "goal": "Calculate inheritance probability and explain choices respectfully.",
    "focusQuestion": "What probability is implied by the stated inheritance pattern?",
    "outcomeLens": "Does the explanation respect uncertainty and family autonomy?",
    "reflectionPrompt": "How does the inheritance evidence inform a respectful explanation of risk?",
    "objectives": [
      "Calculate genetic probabilities using an inheritance model.",
      "Distinguish probability from certainty.",
      "Communicate risk accurately and ethically."
    ]
  },
  "reaction_time": {
    "roleLead": "Rayan Al Hassan",
    "signal": "Performance consultation",
    "situation": "A sprinter's starts have slowed and the coach wants a scientific explanation.",
    "stakes": "Changes to training should be supported by controlled evidence.",
    "goal": "Analyze reaction-time measurements and recommend a testable improvement.",
    "focusQuestion": "Which measured factor is linked to the largest reaction-time change?",
    "outcomeLens": "Can the training recommendation be tested fairly?",
    "reflectionPrompt": "What evidence supports the proposed cause and how would you test it?",
    "objectives": [
      "Identify variables in reaction-time experiments.",
      "Compare observations and control confounding factors.",
      "Recommend a measurable response."
    ]
  },
  "unstable_slope": {
    "roleLead": "Zeina Abdelnour",
    "signal": "Slope hazard report",
    "situation": "Cracks have appeared near homes after sustained rainfall on a steep hillside.",
    "stakes": "Residents need a responsible assessment rather than an improvised fix.",
    "goal": "Identify geological warnings and escalate the appropriate response.",
    "focusQuestion": "Which combination of slope, rock or soil and water indicates danger?",
    "outcomeLens": "Does the decision prioritize public safety?",
    "reflectionPrompt": "Which observations most strongly affect your risk assessment?",
    "objectives": [
      "Explain rainfall and slope effects on mass movement.",
      "Interpret evidence of geological instability.",
      "Prioritize risk mitigation through qualified teams."
    ]
  },
  "invasive_species": {
    "roleLead": "Layan Mansour",
    "signal": "Biodiversity warning",
    "situation": "A rapidly spreading aquatic plant threatens a lake's native organisms.",
    "stakes": "Hasty control measures could damage the ecosystem further.",
    "goal": "Predict ecological effects and choose a responsible strategy.",
    "focusQuestion": "How could the invader change competition, light or oxygen?",
    "outcomeLens": "Does the selected control reduce harm to native organisms?",
    "reflectionPrompt": "Which ecosystem relationship best justifies your strategy?",
    "objectives": [
      "Analyze competition between native and invasive species.",
      "Predict food-web and biodiversity effects.",
      "Evaluate benefits and risks of control methods."
    ]
  },
  "power_grid": {
    "roleLead": "Aisha Rahman",
    "signal": "Grid operations alert",
    "situation": "Electricity demand exceeds supply during extreme heat and service is unstable.",
    "stakes": "Essential community services need reliable electricity.",
    "goal": "Analyze demand and supply data and recommend a proportionate response.",
    "focusQuestion": "What does the electricity balance reveal?",
    "outcomeLens": "Does the choice protect reliability and consider demand?",
    "reflectionPrompt": "Which measurement justified your priority and what trade-off remains?",
    "objectives": [
      "Interpret electrical load and power-supply measurements.",
      "Explain why demand above supply destabilizes a grid.",
      "Justify a response considering community needs."
    ]
  },
  "heat_loss": {
    "roleLead": "Aisha Rahman",
    "signal": "School energy challenge",
    "situation": "A historic school needs to reduce heating costs without harming its building.",
    "stakes": "The solution must balance efficiency, comfort, and preservation.",
    "goal": "Identify major heat-transfer losses and prioritize sensible upgrades.",
    "focusQuestion": "Where is thermal energy lost and by which mechanism?",
    "outcomeLens": "Does the recommendation balance cost, comfort and constraints?",
    "reflectionPrompt": "Which heat-transfer process best explains your choice?",
    "objectives": [
      "Distinguish conduction, convection and radiation.",
      "Interpret observations of heat transfer.",
      "Evaluate efficiency upgrades under constraints."
    ]
  },
  "aspirin_production": {
    "roleLead": "Yasmin Nader",
    "signal": "Pharmaceutical production hold",
    "situation": "An aspirin batch is delayed while a reactant calculation is checked.",
    "stakes": "Production should never rely on an unverified mass estimate.",
    "goal": "Check reactant quantities using stoichiometry before quality-controlled production.",
    "focusQuestion": "How do tablet mass, molar mass and reaction ratios connect?",
    "outcomeLens": "Does the choice demand verified calculations and quality controls?",
    "reflectionPrompt": "Which calculation must be checked before production proceeds?",
    "objectives": [
      "Convert mass and moles appropriately.",
      "Apply balanced mole ratios to a production target.",
      "Explain the need for pharmaceutical quality verification."
    ]
  },
  "fuelproduction": {
    "roleLead": "Khaled Al Mansoori",
    "signal": "Hydrogen supply request",
    "situation": "A clean-fuel facility must estimate material needs for a large hydrogen order.",
    "stakes": "A flawed estimate could waste resources or miss the order.",
    "goal": "Predict hydrogen production using a balanced equation and correct units.",
    "focusQuestion": "What mole ratio links methane consumed to hydrogen produced?",
    "outcomeLens": "Does the forecast acknowledge theoretical and practical constraints?",
    "reflectionPrompt": "Which mole ratio drove your estimate, and why could output differ?",
    "objectives": [
      "Interpret coefficients in chemical equations.",
      "Calculate mole and mass relationships.",
      "Explain theoretical versus real production."
    ]
  },
  "aspirin_percent_yield": {
    "roleLead": "Khaled Al Mansoori",
    "signal": "Batch efficiency review",
    "situation": "A pharmaceutical process needs an efficiency report after a production run.",
    "stakes": "An incorrect yield figure could mislead the quality team.",
    "goal": "Compute percent yield and explain what it means and does not mean.",
    "focusQuestion": "Which actual and theoretical yield values are needed?",
    "outcomeLens": "Does the response separate production yield from safety assurance?",
    "reflectionPrompt": "What does percent yield show and what does it not prove?",
    "objectives": [
      "Distinguish theoretical and actual yield.",
      "Calculate percentage yield.",
      "Interpret limitations of process-efficiency evidence."
    ]
  },
  "gas_boyle_adnoc": {
    "roleLead": "Anwar Mahdi",
    "signal": "Pressure-control review",
    "situation": "A gas-storage team needs a pressure estimate before further compression.",
    "stakes": "Safety staff must verify the calculation against operational limits.",
    "goal": "Apply Boyle's law with its assumptions to inform an engineering review.",
    "focusQuestion": "What changes when volume decreases at constant temperature?",
    "outcomeLens": "Is the calculation appropriate for the stated conditions?",
    "reflectionPrompt": "How did pressure-volume reasoning shape the choice?",
    "objectives": [
      "Explain the inverse pressure-volume relationship.",
      "Apply P1V1 = P2V2 at constant temperature.",
      "Identify operational safety limits of predictions."
    ]
  },
  "gas_charles_aviation": {
    "roleLead": "Anwar Mahdi",
    "signal": "Aviation equipment review",
    "situation": "Extreme airfield heat may change the volume of a gas in support equipment.",
    "stakes": "Maintenance decisions require correct temperature units and assumptions.",
    "goal": "Use absolute temperature to evaluate possible gas expansion.",
    "focusQuestion": "How does volume change with Kelvin temperature at constant pressure?",
    "outcomeLens": "Does the prediction reflect operating conditions?",
    "reflectionPrompt": "Why must this calculation use Kelvin rather than Celsius?",
    "objectives": [
      "Describe gas volume versus absolute temperature.",
      "Convert Celsius temperatures to Kelvin.",
      "Apply Charles's law and interpret results."
    ]
  },
  "gas_gaylussac_cylinder": {
    "roleLead": "Anwar Mahdi",
    "signal": "Cylinder safety alert",
    "situation": "A sealed cylinder is heating near process equipment.",
    "stakes": "Pressure can increase as temperature rises in a fixed volume.",
    "goal": "Predict the pressure trend and recommend review by safety personnel.",
    "focusQuestion": "What happens to pressure as Kelvin temperature rises at fixed volume?",
    "outcomeLens": "Does the response escalate risk safely?",
    "reflectionPrompt": "Which assumption is essential to the pressure prediction?",
    "objectives": [
      "Explain pressure-temperature proportionality.",
      "Apply P1/T1 = P2/T2 using Kelvin.",
      "Assess rising pressure and need for controls."
    ]
  },
  "oxygen_failure": {
    "roleLead": "Salim Haddad",
    "signal": "Spacecraft life-support alert",
    "situation": "A spacecraft's oxygen generation system has failed while backup supplies are limited.",
    "stakes": "The crew needs an evidence-based decision under strict safety constraints.",
    "goal": "Apply reaction chemistry and gas concepts to compare oxygen options.",
    "focusQuestion": "What reaction normally provides oxygen to the crew?",
    "outcomeLens": "Does the response respect feasibility and crew safety?",
    "reflectionPrompt": "Which chemical principle and operational condition support your decision?",
    "objectives": [
      "Explain chemical methods of oxygen production.",
      "Interpret chemical and gas-law constraints.",
      "Compare emergency options using evidence."
    ]
  }
};

export const ROLE_LEADS = {
  "environmental_scientist": "Layan Mansour",
  "biomedical_researcher": "Rayan Al Hassan",
  "space_mission_chemist": "Salim Haddad",
  "energy_engineer": "Aisha Rahman",
  "industrial_chemist": "Omar Al Khatib",
  "pharmaceutical_scientist": "Yasmin Nader",
  "fertilizer_engineer": "Khaled Al Mansoori",
  "geologist": "Zeina Abdelnour",
  "process_safety_engineer": "Anwar Mahdi"
};

export const MISSION_CHAPTERS = [
  { id: 'briefing', title: "You're Needed", short: 'Assignment', description: 'Meet the situation and your responsibility.' },
  { id: 'scene1', title: 'Find the Clues', short: 'Evidence', description: 'Interpret the scientific evidence.' },
  { id: 'scene2', title: 'Make the Call', short: 'Decision', description: 'Choose an action and explain your reasoning.' },
  { id: 'consequence', title: 'See What Happens', short: 'Outcome', description: 'Explore the result and explain what you learned.' },
  { id: 'exit', title: 'Prove Your Expertise', short: 'Final Check', description: 'Apply the science independently.' }
];

export function getMissionBlueprint(scenario, roleId) {
  if (!scenario) return null;
  const authored = MISSION_BLUEPRINTS[scenario.id];
  if (authored) return { ...authored, roleLead: ROLE_LEADS[roleId] || authored.roleLead };
  return {
    roleLead: ROLE_LEADS[roleId] || scenario.character?.name || 'Scientific Specialist',
    signal: 'New professional assignment',
    situation: scenario.simpleContext || scenario.context || 'A scientific problem needs your help.',
    stakes: 'The team needs a decision based on evidence.',
    goal: scenario.studentMission || 'Examine the data and justify a decision.',
    focusQuestion: scenario.scenes?.[0]?.question || 'What does the evidence suggest?',
    outcomeLens: 'Consider the results and limitations of your choice.',
    reflectionPrompt: 'Which evidence supports your recommendation?',
    objectives: (scenario.scienceFocus || []).slice(0,3)
  };
}

export function validateMissionBlueprints(scenarioIds) {
  return scenarioIds.filter(id => !MISSION_BLUEPRINTS[id] || MISSION_BLUEPRINTS[id].objectives.length !== 3);
}
