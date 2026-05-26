/**
 * scenarioAnswerKey.js
 *
 * Defines which Scene 2 consequence keys lead to SUCCESS vs FAILURE
 * for every scenario. Also stores the success/failure narrative text
 * used in the ImpactDecision page.
 *
 * Structure per scenario:
 *  successConsequences : string[]  — at least one of these → SUCCESS
 *  failureConsequences : string[]  — any of these → FAILURE
 *  allSuccess          : boolean   — if true, every choice is a success
 *  successImpact       : string    — what the student's choice saved/protected
 *  failureImpact       : string    — what the student's choice damaged/caused
 */

export const SCENARIO_ANSWER_KEY = {

  // 1 ─ The Invisible Threat (water_contamination)
  water_contamination: {
    successConsequences: ['treatment'],
    failureConsequences: ['shutdown', 'monitor', 'boil'],
    allSuccess: false,
    successImpact: 'You protected public health by choosing the correct chemical treatment to reduce nitrate exposure in the community\'s drinking water.',
    failureImpact: 'Your decision failed to protect the community. Boiling doesn\'t remove nitrates, delay led to infant illness, or shutdown caused severe economic division. Families suffered because of your choice.',
  },

  // 2 ─ The Reaction Gone Wrong (reaction_gone_wrong)
  reaction_gone_wrong: {
    successConsequences: ['quench'],
    failureConsequences: ['add_reactants', 'vent', 'cold_water'],
    allSuccess: false,
    successImpact: 'You stopped the runaway reaction safely using the emergency quench system. The facility\'s workers are safe and the safety record is maintained.',
    failureImpact: 'Your decision triggered an escalation — workers were injured, toxic fumes were released, or equipment was severely damaged. The plant was shut down and millions of dollars in damage resulted from your choice.',
  },

  // 3 ─ Acid Rain Alert (acid_rain)
  acid_rain: {
    successConsequences: ['scrubbers', 'limestone', 'relocate', 'trading'],
    failureConsequences: [],
    allSuccess: true,
    successImpact: 'You took meaningful action against acid rain — your recommendation helped protect forests, lakes, and communities from long-term environmental damage.',
    failureImpact: '',
  },

  // 4 ─ The Mutation Dilemma (mutation_dilemma)
  mutation_dilemma: {
    successConsequences: ['no_children', 'ivf_pgd', 'adoption'],
    failureConsequences: ['neutral'],
    allSuccess: false,
    successImpact: 'You provided informed, compassionate genetic counseling — the couple felt supported and empowered to make their own reproductive decisions based on scientific knowledge.',
    failureImpact: 'Your purely neutral approach left the couple overwhelmed and without proper guidance. Their anxiety increased and they experienced decision paralysis. As a counselor, you failed to support your patient in a critical moment.',
  },

  // 5 ─ The Reaction Time Test (reaction_time)
  reaction_time: {
    successConsequences: ['sleep_focus', 'meditation'],
    failureConsequences: ['intense', 'caffeine'],
    allSuccess: false,
    successImpact: 'Your evidence-based training protocol helped the athlete optimize their nervous system performance — they achieved their personal best reaction time at the competition.',
    failureImpact: 'Your protocol led to overtraining fatigue or stimulant tolerance. The athlete underperformed at the competition, and your intervention actually worsened their results.',
  },

  // 6 ─ The Unstable Slope (unstable_slope)
  unstable_slope: {
    successConsequences: ['evacuate'],
    failureConsequences: ['wait', 'drainage', 'wall'],
    allSuccess: false,
    successImpact: 'Your quick decision to evacuate saved lives! While property was lost, all 15 families are safe because you prioritized human safety over secondary fixes.',
    failureImpact: 'Your decision led to unnecessary risk and injuries. Waiting for data or attempting slow engineering fixes while a landslide was imminent left families in danger and workers injured. Human lives were put at risk because of your choice.',
  },

  // 7 ─ Invasive Species Crisis (invasive_species)
  invasive_species: {
    successConsequences: ['manual', 'biocontrol'],
    failureConsequences: ['herbicide', 'drain'],
    allSuccess: false,
    successImpact: 'Your conservation strategy protected the endangered lake salamander and began restoring the ecosystem. Native species populations are recovering thanks to your scientifically sound decision.',
    failureImpact: 'Your aggressive intervention caused collateral ecological damage. Herbicide poisoned native fish reproduction, or draining the lake killed native species and the invasive plant regrew anyway. The salamander is now critically endangered.',
  },

  // 8 ─ Power Grid Failure (power_grid)
  power_grid: {
    successConsequences: ['rolling', 'import', 'appeal', 'diesel'],
    failureConsequences: [],
    allSuccess: true,
    successImpact: 'Your quick decision stabilized the power grid and prevented a total blackout — millions of homes and hospitals kept their power supply thanks to your action.',
    failureImpact: '',
  },

  // 9 ─ Heat Loss in Buildings (heat_loss)
  heat_loss: {
    successConsequences: ['new_windows', 'storm_windows', 'insulation'],
    failureConsequences: ['new_heater'],
    allSuccess: false,
    successImpact: 'Your upgrade recommendation reduced the building\'s heat loss significantly — the school is saving thousands of dollars per year and its historic character is preserved.',
    failureImpact: 'Installing a more powerful heater didn\'t address the root problem. The school\'s bills actually increased to $52,000/year and carbon emissions rose. You wasted $100,000 of the school board\'s budget without solving the heat loss problem.',
  },

  // 10 ─ Mission Oxygen Failure (oxygen_failure)
  oxygen_failure: {
    successConsequences: ['candles', 'repair', 'peroxide'],
    failureConsequences: ['conserve'],
    allSuccess: false,
    successImpact: 'Your decision generated oxygen for the crew — you extended their survival window and gave time for the primary system to be repaired. The crew is safe.',
    failureImpact: 'Conservation alone cannot solve a supply problem. Without active oxygen generation, the crew\'s situation became critical. Your passive response put 4 lives at risk in the vacuum of space.',
  },

  // 11 ─ The Aspirin Crisis (aspirin_production)
  aspirin_production: {
    successConsequences: ['partial', 'delay'],
    failureConsequences: ['underdose', 'filler'],
    allSuccess: false,
    successImpact: 'You made the scientifically and ethically correct decision — patients received properly dosed medication and the hospital was informed of the shortage. No patient was harmed.',
    failureImpact: 'Your decision put patients in danger. Under-dosed tablets failed to control pain, or pharmaceutical fraud triggered a criminal investigation. Three patients suffered, the entire batch was destroyed, and the company faces a €500,000 fine because of your choice.',
  },

  // 12 ─ Fuel Production Optimization (fuelproduction)
  fuelproduction: {
    successConsequences: ['fourmol'],
    failureConsequences: ['onemol', 'twomol', 'eightmol'],
    allSuccess: false,
    successImpact: 'Your accurate stoichiometric calculation secured the UAE transport fuel contract — the facility produced exactly 8 g of hydrogen per cycle and delivery was approved on time.',
    failureImpact: 'Your incorrect mole calculation caused the facility to under-promise or over-promise supply. The client lost confidence, the contract was at risk, and the entire fuel delivery estimate had to be revised. UAE transport operators were left without accurate supply data.',
  },

  // 13 ─ The Efficiency Report (aspirin_percent_yield)
  aspirin_percent_yield: {
    successConsequences: ['percent_yield'],
    failureConsequences: ['ignore', 'subtraction', 'wrong_formula'],
    allSuccess: false,
    successImpact: 'You correctly evaluated the production efficiency and reported accurate industrial data — the company can now improve its processes and maintain pharmaceutical compliance.',
    failureImpact: 'Your reporting was inaccurate or missing. Ignoring the efficiency gap or using unscientific metrics led to a regulatory audit. The company\'s production license is now under review and faces an AED 50,000 fine because you failed to apply standard stoichiometry.',
  },

  // 14 ─ Pressure Control at ADNOC Gas Storage (gas_boyle_adnoc)
  gas_boyle_adnoc: {
    successConsequences: ['correct'],
    failureConsequences: ['too_low', 'no_change', 'too_high'],
    allSuccess: false,
    successImpact: 'Your pressure calculation was accurate — the ADNOC gas transfer completed safely, the batch was delivered on schedule, and zero safety violations were recorded.',
    failureImpact: 'Your calculation error caused an operational incident. Underestimating pressure led to an emergency shutdown, or overestimating caused unnecessary costs and delays. Your failure to correctly apply Boyle\'s Law disrupted UAE industrial operations.',
  },

  // 15 ─ Gas Expansion in UAE Aviation (gas_charles_aviation)
  gas_charles_aviation: {
    successConsequences: ['correct'],
    failureConsequences: ['too_low', 'no_change', 'too_high'],
    allSuccess: false,
    successImpact: 'Your thermal expansion analysis helped aviation engineers keep the airport\'s pressurized systems safe during the UAE summer heatwave — zero line failures were recorded.',
    failureImpact: 'Your expansion estimate was incorrect. Underestimating led to equipment stress and potential seal failure, while ignoring the temperature effect caused repeated safety alarms. Your failure to apply Charles\'s Law correctly put aviation reliability at risk.',
  },

  // 16 ─ Pressure Build-Up in Sealed Cylinder (gas_gaylussac_cylinder)
  gas_gaylussac_cylinder: {
    successConsequences: ['correct'],
    failureConsequences: ['too_low', 'no_change', 'too_high'],
    allSuccess: false,
    successImpact: 'Your Gay-Lussac\'s Law calculation correctly identified the pressure-temperature relationship — the cylinder was cooled and isolated before reaching critical levels. No injuries, no losses, full compliance.',
    failureImpact: 'Your pressure projection was inaccurate. Underestimating the risk led to dangerous overheating, while overestimating caused a costly and unnecessary production stop. Your failure to use Gay-Lussac\'s Law correctly cost the facility time and safety overhead.',
  },
};

/**
 * Returns whether a given consequence key is a success or failure for the scenario.
 * @param {string} scenarioId
 * @param {string} consequenceKey  — the value from scene2 response (e.g. "quench", "treatment")
 * @returns {{ isSuccess: boolean, impactText: string }}
 */
export function evaluateScenarioOutcome(scenarioId, consequenceKey) {
  const key = SCENARIO_ANSWER_KEY[scenarioId];

  if (!key) {
    // Unknown scenario — default to success to avoid blocking
    return { isSuccess: true, impactText: 'Your decision had a positive outcome.' };
  }

  if (key.allSuccess) {
    return { isSuccess: true, impactText: key.successImpact };
  }

  const isSuccess = key.successConsequences.includes(consequenceKey);
  return {
    isSuccess,
    impactText: isSuccess ? key.successImpact : key.failureImpact,
  };
}
