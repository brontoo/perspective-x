import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, ChevronRight, FileText, BarChart3, CheckCircle2, 
  AlertTriangle, AlertCircle, Sparkles, Shield, Leaf, 
  DollarSign, Heart, Zap, Users, Lightbulb 
} from 'lucide-react';
import { evaluateScenarioOutcome } from './scenarioAnswerKey';

// Dictionary mapping Choice ID (A, B, C, D) or Consequence Key to choice strength
const OUTCOME_RATING_MAP = {
  water_contamination: {
    treatment: 'strong', A: 'strong',
    boil: 'weak', D: 'weak',
    monitor: 'risky', C: 'risky',
    shutdown: 'weak', B: 'weak'
  },
  reaction_gone_wrong: {
    quench: 'strong', D: 'strong',
    add_reactants: 'risky', A: 'risky',
    vent: 'risky', B: 'risky',
    cold_water: 'risky', C: 'risky'
  },
  acid_rain: {
    scrubbers: 'strong', A: 'strong',
    limestone: 'strong', B: 'strong',
    relocate: 'strong', C: 'strong',
    trading: 'strong', D: 'strong'
  },
  mutation_dilemma: {
    no_children: 'strong', A: 'strong',
    ivf_pgd: 'strong', B: 'strong',
    adoption: 'strong', C: 'strong',
    neutral: 'weak', D: 'weak'
  },
  reaction_time: {
    sleep_focus: 'strong', B: 'strong',
    meditation: 'strong', D: 'strong',
    intense: 'risky', A: 'risky',
    caffeine: 'weak', C: 'weak'
  },
  unstable_slope: {
    drainage: 'strong', C: 'strong',
    wall: 'strong', D: 'strong',
    wait: 'risky', A: 'risky',
    evacuate: 'weak', B: 'weak'
  },
  invasive_species: {
    biocontrol: 'strong', A: 'strong',
    manual: 'strong', C: 'strong',
    herbicide: 'risky', B: 'risky',
    drain: 'weak', D: 'weak'
  },
  power_grid: {
    rolling: 'strong', A: 'strong',
    import: 'strong', B: 'strong',
    appeal: 'strong', C: 'strong',
    diesel: 'strong', D: 'strong'
  },
  heat_loss: {
    new_windows: 'strong', A: 'strong',
    storm_windows: 'strong', B: 'strong',
    insulation: 'strong', C: 'strong',
    new_heater: 'weak', D: 'weak'
  },
  oxygen_failure: {
    candles: 'strong', A: 'strong',
    repair: 'strong', B: 'strong',
    peroxide: 'strong', D: 'strong',
    conserve: 'weak', C: 'weak'
  },
  aspirin_production: {
    partial: 'strong', B: 'strong',
    delay: 'strong', C: 'strong',
    underdose: 'risky', A: 'risky',
    filler: 'risky', D: 'risky'
  },
  fuelproduction: {
    fourmol: 'strong', C: 'strong',
    twomol: 'strong', B: 'strong',
    onemol: 'weak', A: 'weak',
    eightmol: 'weak', D: 'weak',
    oxygen: 'strong',
    neither: 'strong',
    sulfur: 'weak',
    so2: 'weak'
  },
  aspirin_percent_yield: {
    percent_yield: 'strong', A: 'strong',
    subtraction: 'strong', B: 'strong',
    wrong_formula: 'strong', C: 'strong',
    ignore: 'risky', D: 'risky'
  },
  gas_boyle_adnoc: {
    correct: 'strong', A: 'strong',
    too_low: 'strong', B: 'strong',
    no_change: 'strong', C: 'strong',
    too_high: 'risky', D: 'risky'
  },
  gas_charles_aviation: {
    correct: 'strong', A: 'strong',
    too_low: 'strong', B: 'strong',
    no_change: 'strong', C: 'strong',
    too_high: 'strong', D: 'strong'
  },
  gas_gaylussac_cylinder: {
    correct: 'strong', A: 'strong',
    too_low: 'strong', B: 'strong',
    no_change: 'strong', C: 'strong',
    too_high: 'risky', D: 'risky'
  }
};

// Friendly and constructive tips to guide students (not punitive)
const BETTER_THINKING_TIPS = {
  water_contamination: {
    shutdown: "Consider that shutting down a factory immediately can lead to sudden job losses and community conflict. A more gradual or treatment-focused approach might resolve the chemical levels first.",
    monitor: "While monitoring helps gather data, waiting too long when nitrate levels exceed safe limits can put vulnerable infants at risk. Immediate protective advisories or temporary treatment is safer."
  },
  reaction_gone_wrong: {
    add_reactants: "Diluting a mixture during a rapid temperature spike can accidentally provide more fuel for the exothermic reaction. Stopping the reaction using an inhibitor is safer.",
    vent: "Venting releases pressure but disperses toxic fumes into the surrounding environment. Try to neutralize the chemical reaction internally using quenching agents first.",
    cold_water: "Directly injecting cold water can cause thermal shock and crack the reactor walls. A controlled emergency quench system prevents structural failures."
  },
  mutation_dilemma: {
    neutral: "As a counselor, remaining completely neutral can leave anxious patients feeling overwhelmed and unsupported. Try to guide them gently through the pros and cons of available medical options."
  },
  reaction_time: {
    intense: "Overtraining sprinters without adequate rest can exhaust the nervous system and lead to injury. Focus on recovery and sleep for neural pathway consolidation.",
    caffeine: "Stimulant dependency can increase competition anxiety and lead to physical tolerance. Prioritize physiological recovery and consistent sleep schedules."
  },
  unstable_slope: {
    wait: "Waiting for more data while slope cracks are widening can leave residents exposed to sudden landslides. Implementing immediate drainage or evacuation is safer.",
    evacuate: "While evacuation protects lives, doing so immediately without starting physical stabilizing work like drainage pipes or retaining walls leaves properties vulnerable to destruction."
  },
  invasive_species: {
    herbicide: "Chemical herbicides can leach into the water, poisoning native fish and endangered salamander species. Look for targeted manual or biological control methods.",
    drain: "Draining a lake destroys the habitat of native species. The invasive plants can also regrow from seeds, leading to recurring ecological collapse."
  },
  heat_loss: {
    new_heater: "A larger heating system does not solve the root cause of heat escaping from un-insulated windows and drafts. It increases carbon emissions and electricity bills."
  },
  oxygen_failure: {
    conserve: "Simply conserving oxygen does not generate new breathable air for the crew. You must implement active chemical generation like oxygen candles or peroxide decomposition."
  },
  aspirin_production: {
    underdose: "Distributing lower-dose pills under the same label violates medical regulations and can fail to treat patients effectively. A partial delivery is more honest.",
    filler: "Adding unapproved filler material to make up weight compromises tablet safety and purity, which can trigger severe regulatory audits and fines."
  },
  fuelproduction: {
    onemol: "Ensure you calculate the limiting reactant by checking which reactant provides the lowest number of moles relative to the balanced equation.",
    eightmol: "A product cannot run out first; only reactants limit the yield of a chemical process. Check the moles of starting reactants."
  },
  aspirin_percent_yield: {
    ignore: "Ignoring the discrepancy between theoretical and actual yield prevents process optimization and can hide quality control issues from regulators."
  },
  gas_boyle_adnoc: {
    too_high: "Recall that Boyle's law is an inverse relationship. Compressing the gas by half (4.0 L to 2.0 L) doubles the pressure from 100 kPa to 200 kPa."
  },
  gas_gaylussac_cylinder: {
    too_high: "Recall that Gay-Lussac's Law is a direct relationship. Increasing temperature from 300 K to 450 K (a 1.5x increase) raises pressure by 1.5x (150 kPa to 225 kPa)."
  }
};

// Comprehensive misconceptions database mapping scenarios to their choice-specific misconceptions
const MISCONCEPTIONS_DATABASE = {
  water_contamination: {
    boil: {
      thought: "boiling removes all contaminants",
      correction: "Boiling can help with some microbes, but it does not remove dissolved nitrates. In fact, it can concentrate them as water evaporates."
    },
    shutdown: {
      thought: "shutting down the factory immediately is the best way to clean the water supply",
      correction: "While a shutdown stops further emissions, it doesn't clean the existing groundwater and causes immediate economic and job losses. Immediate treatment of the municipal water is more effective."
    },
    monitor: {
      thought: "monitoring levels first is safe because more data is needed before acting",
      correction: "When nitrate levels already exceed safe limits, delaying action places vulnerable populations, especially infants, at immediate risk. Action must be taken alongside monitoring."
    }
  },
  reaction_gone_wrong: {
    add_reactants: {
      thought: "adding more reactants will dilute the runaway mixture and cool it down",
      correction: "Adding reactants in an exothermic reaction provides more fuel, which speeds up the reaction rate and escalates the thermal runaway."
    },
    vent: {
      thought: "venting is the safest way to prevent a reactor explosion without environmental consequences",
      correction: "Venting reduces pressure inside the reactor, but it releases hazardous, toxic gases directly into the environment, causing a serious air pollution incident."
    },
    cold_water: {
      thought: "injecting cold water directly is the fastest way to safely lower the temperature",
      correction: "Injecting cold water directly into a hot reactor shell can cause severe thermal shock, cracking the reactor walls and risking a major structural leak."
    }
  },
  mutation_dilemma: {
    neutral: {
      thought: "remaining completely neutral means not offering any guidance or medical options",
      correction: "A genetic counselor should be non-directive but must still explain and guide patients through their medical options (like IVF/PGD) to help them make informed choices, rather than leaving them in decision paralysis."
    }
  },
  reaction_time: {
    intense: {
      thought: "more intense training will continuously improve muscular reaction time",
      correction: "Overtraining without adequate recovery fatigues the central nervous system, which actually slows down neural pathways and degrades reaction times."
    },
    caffeine: {
      thought: "stimulants like caffeine are a safe way to permanently boost focus and speed",
      correction: "Caffeine provides a temporary spike but can increase heart rate, anxiety, and lead to physical tolerance, ultimately causing underperformance during crucial events."
    }
  },
  unstable_slope: {
    wait: {
      thought: "waiting for more slope data is safe because landslides are slow and predictable",
      correction: "When slope cracks are widening, a landslide is imminent and unpredictable. Waiting for more data puts lives at immediate risk instead of prioritizing safety."
    },
    drainage: {
      thought: "installing drainage systems during active movement can immediately stabilize the slope",
      correction: "Engineering controls like drainage are long-term solutions. They cannot be built quickly enough to stabilize a slope that is already showing active failure signs."
    },
    wall: {
      thought: "building a retaining wall can stop an active landslide in progress",
      correction: "Retaining walls take time to construct and cannot address immediate geological hazards when a slope is already failing."
    }
  },
  invasive_species: {
    herbicide: {
      thought: "chemical herbicides are safe because they only kill the target plants",
      correction: "Herbicides can leach into the water, poisoning non-target species, damaging salamander eggs, and disrupting the broader aquatic food web."
    },
    drain: {
      thought: "draining the lake is an effective way to completely destroy the invasive species",
      correction: "Draining destroys the entire aquatic habitat for native species. Furthermore, many invasive plants can regrow from hardy seeds left in the dry mud once the lake is refilled."
    }
  },
  heat_loss: {
    new_heater: {
      thought: "buying a bigger heating system is the best way to keep a drafty building warm",
      correction: "A larger heater doesn't stop heat from escaping through gaps and uninsulated windows. It only increases energy bills and carbon emissions without solving the draft problem."
    }
  },
  oxygen_failure: {
    conserve: {
      thought: "simply conserving oxygen can sustain the crew indefinitely",
      correction: "Conservation only slows down oxygen depletion; it does not replace the oxygen being consumed. You must activate chemical oxygen generators to sustain breathable levels."
    }
  },
  aspirin_production: {
    underdose: {
      thought: "releasing slightly under-dosed tablets under the standard label is safe because it is better than nothing",
      correction: "Distributing sub-therapeutic medication is illegal and medically dangerous because patients will not receive the expected therapeutic effect, leading to untreated pain or inflammation."
    },
    filler: {
      thought: "adding inert fillers is an acceptable way to make up the missing tablet weight",
      correction: "Adding unapproved ingredients to pharmaceutical products compromises purity and safety, violating strict regulatory laws and risking patient health."
    }
  },
  fuelproduction: {
    onemol: {
      thought: "reactant or product amounts can be selected without calculating the limiting reactant",
      correction: "Chemical reactions are governed by strict stoichiometric ratios. You must identify the limiting reactant first to calculate the maximum theoretical yield of product."
    },
    twomol: {
      thought: "reactant or product amounts can be selected without calculating the limiting reactant",
      correction: "Chemical reactions are governed by strict stoichiometric ratios. You must identify the limiting reactant first to calculate the maximum theoretical yield of product."
    },
    eightmol: {
      thought: "product amounts can be selected without calculating the limiting reactant",
      correction: "Chemical reactions are governed by strict stoichiometric ratios. You must identify the limiting reactant first to calculate the maximum theoretical yield of product."
    }
  },
  aspirin_percent_yield: {
    ignore: {
      thought: "percent yield is only an academic metric and doesn't matter in real production",
      correction: "Percent yield is crucial for industrial cost analysis and quality control. Ignoring discrepancies hides synthesis inefficiencies and equipment failures from regulators."
    }
  },
  gas_boyle_adnoc: {
    too_high: {
      thought: "pressure changes in a gas are independent of volume changes",
      correction: "According to Boyle's Law, pressure and volume are inversely proportional at constant temperature. Decreasing volume by half will double the pressure."
    }
  },
  gas_gaylussac_cylinder: {
    too_high: {
      thought: "heating a gas inside a rigid container does not increase its pressure",
      correction: "According to Gay-Lussac's Law, pressure is directly proportional to absolute temperature at constant volume. Increasing temperature will increase cylinder pressure."
    }
  }
};

// Lookup dictionary of impact categories and HSL tags for each scenario
const SCENARIO_IMPACT_CATEGORIES = {
  water_contamination: [
    { label: 'Health', icon: <Heart className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    { label: 'Cost', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' }
  ],
  reaction_gone_wrong: [
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'People', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Cost', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' }
  ],
  acid_rain: [
    { label: 'Environment', icon: <Leaf className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Cost', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' }
  ],
  mutation_dilemma: [
    { label: 'People', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Health', icon: <Heart className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  ],
  reaction_time: [
    { label: 'Efficiency', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    { label: 'People', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
  ],
  unstable_slope: [
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'People', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
  ],
  invasive_species: [
    { label: 'Environment', icon: <Leaf className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Health', icon: <Heart className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  ],
  power_grid: [
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Cost', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Efficiency', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
  ],
  heat_loss: [
    { label: 'Cost', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Environment', icon: <Leaf className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  ],
  oxygen_failure: [
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'People', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
  ],
  aspirin_production: [
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Health', icon: <Heart className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Cost', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' }
  ],
  fuelproduction: [
    { label: 'Efficiency', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    { label: 'Cost', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' }
  ],
  aspirin_percent_yield: [
    { label: 'Efficiency', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    { label: 'Cost', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' }
  ],
  gas_boyle_adnoc: [
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Efficiency', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
  ],
  gas_charles_aviation: [
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Efficiency', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
  ],
  gas_gaylussac_cylinder: [
    { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Efficiency', icon: <Zap className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
  ]
};

export default function ConsequenceViewer({ scenario, consequenceKey, onNext, isTeacher, theme }) {
    // Find the decision scene (usually scene index 1, i.e., scene2)
    const decisionScene = scenario.scenes[1];
    
    // Find the selected option to show its text
    const selectedOption = decisionScene?.options?.find(opt => opt.consequence === consequenceKey || opt.id === consequenceKey);
    const selectedChoiceId = selectedOption?.id || '';

    // Get consequences from scene 3 (usually index 2, i.e. scene3)
    const consequenceScene = scenario.scenes[2];
    const consequence = consequenceScene?.consequences?.[consequenceKey] || 
                        consequenceScene?.consequences?.[selectedOption?.consequence] || 
                        Object.values(consequenceScene?.consequences || {})[0];

    // Determine the rating (strong, risky, weak) using either the consequence key or the choice letter ID
    const scenarioRatingMap = OUTCOME_RATING_MAP[scenario.id] || {};
    const rating = scenarioRatingMap[consequenceKey] || scenarioRatingMap[selectedChoiceId] || 'strong';

    // Get scientific impact text
    const outcomeData = evaluateScenarioOutcome(scenario.id, consequenceKey || selectedOption?.consequence);
    const impactText = outcomeData.impactText;

    // Get the Better Thinking tip if option was weak or risky
    const scenarioTips = BETTER_THINKING_TIPS[scenario.id] || {};
    const betterThinkingTip = scenarioTips[consequenceKey] || scenarioTips[selectedChoiceId] || null;

    // Retrieve misconception feedback if available
    const getMisconceptionFeedback = () => {
        // 1. Check custom misconception field on option or consequence
        const customMisconception = selectedOption?.misconception || consequence?.misconception;
        if (customMisconception && customMisconception.thought && customMisconception.correction) {
            return {
                thought: customMisconception.thought,
                correction: customMisconception.correction
            };
        }
        
        // 2. Check local database
        const scenarioMisconceptions = MISCONCEPTIONS_DATABASE[scenario.id] || {};
        const localMisconception = scenarioMisconceptions[consequenceKey] || scenarioMisconceptions[selectedChoiceId];
        if (localMisconception) {
            return localMisconception;
        }

        // 3. Fallback logic if rating is not strong
        if (rating === 'strong') {
            return null;
        }

        // Fallback fields
        const fallbackCorrection = betterThinkingTip || consequence?.message || "Ensure you carefully evaluate all evidence and safety variables before choosing.";
        const optionName = selectedOption?.text ? `"${selectedOption.text.toLowerCase().replace(/[.,!]/g, '')}"` : "this action";
        
        return {
            thought: `taking ${optionName} was the best response`,
            correction: fallbackCorrection
        };
    };

    const misconceptionFeedback = getMisconceptionFeedback();

    // Get impact categories
    const impactTags = SCENARIO_IMPACT_CATEGORIES[scenario.id] || [
      { label: 'Safety', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
    ];

    // Color theme variables based on rating
    const ratingThemes = {
      strong: {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-50/20',
        cardBg: 'bg-emerald-50/40 border-emerald-100',
        text: 'text-emerald-800',
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
        badgeText: 'Strong Choice',
        badgeColor: 'bg-emerald-500 text-white shadow-emerald-500/20'
      },
      risky: {
        border: 'border-amber-500/30',
        bg: 'bg-amber-50/20',
        cardBg: 'bg-amber-50/40 border-amber-100',
        text: 'text-amber-800',
        icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
        badgeText: 'Acceptable but Risky',
        badgeColor: 'bg-amber-500 text-white shadow-amber-500/20'
      },
      weak: {
        border: 'border-rose-500/30',
        bg: 'bg-rose-50/20',
        cardBg: 'bg-rose-50/40 border-rose-100',
        text: 'text-rose-800',
        icon: <AlertCircle className="w-6 h-6 text-rose-500" />,
        badgeText: 'Unsafe or Weak Choice',
        badgeColor: 'bg-rose-500 text-white shadow-rose-500/20'
      }
    };

    const ratingTheme = ratingThemes[rating] || ratingThemes.strong;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            {/* ── Header / Banner ── */}
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6]" />
                <span className="text-xs font-mono text-[#14b8a6] tracking-widest uppercase select-none font-bold">
                    Result
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#14b8a6]/40 to-transparent" />
            </div>

            <div className={`glass-card border ${ratingTheme.border} ${ratingTheme.bg} rounded-xl overflow-hidden shadow-2xl transition-all duration-300`}>
                
                {/* Visual Header */}
                <div className="bg-white/80 p-6 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {ratingTheme.icon}
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide font-sans">
                            Operation Result
                        </h2>
                    </div>
                    <span className={`text-[10px] font-mono font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm ${ratingTheme.badgeColor}`}>
                        {ratingTheme.badgeText}
                    </span>
                </div>

                <div className="p-8 space-y-6">

                    {/* 1. Your Choice */}
                    {selectedOption && (
                        <div className="bg-white/90 border border-slate-200/60 rounded-xl p-5 shadow-sm">
                            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase block mb-1 font-bold">
                                Your Choice
                            </span>
                            <p className="text-slate-800 text-base font-bold leading-snug font-sans">
                                {selectedOption.text}
                            </p>
                        </div>
                    )}

                    {/* 2. What Happened */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                            <FileText className="w-4 h-4 text-cyan-600" />
                            <span className="text-xs font-mono tracking-widest uppercase">
                                What Happened
                            </span>
                        </div>
                        <p className="text-lg text-slate-800 leading-relaxed font-sans font-medium">
                            {consequence?.outcome || "No outcome data logged for this choice."}
                        </p>
                    </div>

                    {/* 3. Why It Happened (Science explanation) */}
                    {consequence?.message && (
                        <div className="border-l-4 border-cyan-500 bg-cyan-50/40 p-5 rounded-r-xl border-t border-b border-r border-cyan-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-cyan-600" />
                                <span className="text-[10px] font-mono text-cyan-700 tracking-widest uppercase block font-bold">
                                    Why It Happened (Scientific Explanation)
                                </span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                {consequence.message}
                            </p>
                        </div>
                    )}

                    {/* Resulting Data Metrics */}
                    {consequence?.newData && (
                        <div className="bg-white/90 border border-slate-200/60 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 mb-2.5 font-bold">
                                <BarChart3 className="w-4 h-4 text-amber-600" />
                                <span className="text-[10px] font-mono tracking-widest uppercase">
                                    Post-Intervention Data
                                </span>
                            </div>
                            <p className="text-sm text-amber-800 font-mono bg-amber-50/30 p-3 rounded-lg border border-amber-200/50 leading-relaxed shadow-inner font-semibold">
                                {consequence.newData}
                            </p>
                        </div>
                    )}

                    {/* 4. Impact */}
                    <div className="bg-white/90 border border-slate-200/60 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-600" />
                                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">
                                    System Impact
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {impactTags.map(tag => (
                                    <span key={tag.label} className={`flex items-center gap-1 border rounded px-2 py-0.5 text-[10px] font-semibold font-mono ${tag.color}`}>
                                        {tag.icon}
                                        {tag.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {impactText || "Your choice has altered the operational parameters of the system."}
                        </p>
                    </div>

                    {/* Misconception-based Feedback */}
                    {misconceptionFeedback && (
                        <div className="p-6 border rounded-xl bg-sky-50/30 border-sky-100/80 shadow-sm space-y-3">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-4.5 h-4.5 text-sky-600" />
                                <span className="text-[10px] font-mono text-sky-700 tracking-widest uppercase block font-bold">
                                    Scientific Thinking Check
                                </span>
                            </div>
                            <div className="space-y-2.5 pl-4 border-l-2 border-sky-200">
                                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                    This choice may show that you thought <span className="font-semibold text-sky-900">{misconceptionFeedback.thought}</span>.
                                </p>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {misconceptionFeedback.correction}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 5. Better Thinking (Constructive feedback cards for Amber or Red outcomes) */}
                    {betterThinkingTip && (
                        <div className={`p-5 border rounded-xl bg-amber-50/30 border-amber-200/60 text-slate-800`}>
                            <div className="flex items-center gap-2 mb-2.5">
                                <Sparkles className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
                                <span className="text-[10px] font-mono text-amber-700 tracking-widest uppercase block font-bold">
                                    Better Thinking (Tips for Next Time)
                                </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                {betterThinkingTip}
                            </p>
                        </div>
                    )}
                    
                    {/* CTAs */}
                    <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row gap-3 justify-end">
                        {isTeacher && (
                            <button
                                onClick={onNext}
                                className="px-6 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-lg text-xs font-mono tracking-wider transition-colors font-bold cursor-pointer"
                            >
                                SKIP PREVIEW
                            </button>
                        )}
                        <button
                            onClick={onNext}
                            className="px-8 py-3.5 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold rounded-lg uppercase tracking-widest transition-colors flex items-center gap-2 font-sans text-sm shadow-lg shadow-[#14b8a6]/20 cursor-pointer"
                        >
                            <span>Reflect</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
