import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, BookOpen, AlertTriangle, CheckCircle2, AlertCircle, Sparkles, Check, HelpCircle } from 'lucide-react';
import { ScenarioVisualPanel } from './ScenarioPrimitives';
import useTypewriter from './useTypewriter';

/* ── Inline micro-helpers ─────────────────────────────────────────────────── */

function Panel({ children, className = '' }) {
    return (
        <div className={`glass-card border border-slate-200 bg-white/80 rounded-xl relative overflow-hidden shadow-lg p-5 ${className}`}>
            {children}
        </div>
    );
}

// 🔑 Evidence Reminder Database for all 16 scenarios
const SCENARIO_EVIDENCE_MAP = {
  water_contamination: [
    "Nitrate concentration is measured at 55 ppm, which is above the safe drinking limit of 50 ppm.",
    "Chlorides and heavy metals are currently within safe guidelines.",
    "The factory is located upstream of the town's groundwater flow."
  ],
  reaction_gone_wrong: [
    "The reactor temperature spiked from 80°C to 120°C in just 5 minutes.",
    "The runaway reaction is highly exothermic, meaning it produces its own heat.",
    "The cooling system has failed and is unable to remove heat from the vessel."
  ],
  acid_rain: [
    "Forest Zone A reports a highly acidic rainfall pH of 4.2.",
    "Atmospheric sulfur dioxide (SO₂) is elevated at 85 ppb near the affected trees.",
    "Prevailing wind patterns blow pollutants directly from the industrial zone toward the forest."
  ],
  mutation_dilemma: [
    "Both parents are heterozygous carriers (Aa) of the autosomal recessive condition.",
    "There is a 25% (1 in 4) chance that their child will inherit the condition (aa).",
    "There is a 50% chance the child will inherit one copy of the gene and be an unaffected carrier (Aa)."
  ],
  reaction_time: [
    "Sleep deprivation (5 hours of sleep) slowed the athlete's reaction time to 0.21s.",
    "Caffeine intake temporarily improved reaction time to 0.13s.",
    "High stress levels slowed reaction time to 0.19s."
  ],
  unstable_slope: [
    "The mountain slope has steep incline, clay-rich soil, and removed vegetation.",
    "Clay soil absorbs water and becomes extremely heavy and slippery when saturated.",
    "Recent heavy rainfall has drastically increased water pressure within the slope."
  ],
  invasive_species: [
    "Invasive water hyacinths block sunlight and deplete dissolved oxygen in the water.",
    "Decaying plant matter further consumes oxygen, leading to fish and native plant deaths.",
    "The invasive species lacks natural predators in this ecosystem, causing uncontrolled growth."
  ],
  power_grid: [
    "Electrical demand (18,000 MW) exceeds the power grid's capacity (15,000 MW).",
    "The supply deficit of 3,000 MW is causing the grid frequency to drop below safe levels.",
    "Unbalanced grid frequency can trigger automatic safety shutdowns and cascade blackouts."
  ],
  heat_loss: [
    "Windows account for the highest percentage of heat loss (35%) in the building through conduction.",
    "Air gaps in double/triple pane windows are poor conductors, significantly reducing heat transfer.",
    "Adding storm windows protects historic aesthetics while adding a protective insulating layer."
  ],
  oxygen_failure: [
    "The primary electrolysis system (2H₂O → 2H₂ + O₂) has failed.",
    "Four crew members require a total of 3.36 kg of oxygen per day (0.84 kg each).",
    "The spacecraft's backup oxygen supply will only last for 72 hours."
  ],
  aspirin_production: [
    "The tested batch of aspirin shows active ingredient purity at 94%.",
    "Medical and regulatory safety standards require a minimum purity of 99%.",
    "Patient health and safety must be prioritized over fulfilling the delivery volume."
  ],
  fuelproduction: [
    "The steam reforming reaction converts methane and water to hydrogen fuel.",
    "The chemical process operates on a strict 1:1 effective stoichiometric mole ratio.",
    "Exactly 2,000 kg of methane is required to yield the client's 1,000 kg hydrogen order."
  ],
  haber_process: [
    "The steam reforming reaction converts methane and water to hydrogen fuel.",
    "The chemical process operates on a strict 1:1 effective stoichiometric mole ratio.",
    "Exactly 2,000 kg of methane is required to yield the client's 1,000 kg hydrogen order."
  ],
  aspirin_percent_yield: [
    "Stoichiometric calculation predicted a theoretical yield of 180 grams.",
    "The actual product collected from the laboratory batch was 135 grams.",
    "The reaction efficiency (percent yield) was calculated to be 75%."
  ],
  gas_boyle_adnoc: [
    "Boyle's Law states pressure is inversely proportional to volume (P₁V₁ = P₂V₂) at constant temperature.",
    "The gas volume in the storage tank was compressed from 4.0 L to 2.0 L.",
    "Reducing the volume by half doubled the pressure from 100 kPa to 200 kPa."
  ],
  gas_charles_aviation: [
    "Charles's Law states volume is directly proportional to temperature (V₁/T₁ = V₂/T₂) at constant pressure.",
    "The ambient temperature of the system increased from 300 Kelvin to 600 Kelvin.",
    "Doubling the temperature (in Kelvin) doubled the gas volume from 3.0 L to 6.0 L."
  ],
  gas_gaylussac_cylinder: [
    "Gay-Lussac's Law states pressure is directly proportional to temperature (P₁/T₁ = P₂/T₂) in a sealed container.",
    "A sealed container has a constant volume, meaning thermal expansion builds pressure.",
    "Heating the cylinder from 300 K to 450 K raised the internal pressure from 150 kPa to 225 kPa."
  ]
};

const SCENE_TWO_HINTS = {
  water_contamination: [
    "Identify which option is the most immediate safety measure to protect public health without causing major delays.",
    "Boiling water does not remove nitrates. Shutting down the factory immediately causes massive economic disruption.",
    "Increasing chemical treatment directly targets nitrates, and advising water safety handles immediate risk."
  ],
  reaction_gone_wrong: [
    "We need a measure that halts the runaway reaction immediately, prioritizing safety over financial loss.",
    "Venting releases toxic gases into the community, and injecting cold water risks thermal shock cracks.",
    "The emergency quench system stops the reaction completely, protecting lives at the cost of the batch."
  ],
  acid_rain: [
    "Find a solution that addresses the root cause of sulfur dioxide emissions, not just the local symptoms.",
    "Limestone treatment is reactive and temporary. Emisions trading works slowly.",
    "Mandating smokestack scrubbers is the most direct, long-term way to prevent SO₂ from forming acid rain."
  ],
  mutation_dilemma: [
    "A supportive genetic counseling method respects family choices and outlines medical options neutrally.",
    "Avoid telling the couple directly what they should or should not do, as that removes autonomy.",
    "Explaining preimplantation diagnosis (IVF) informs them about modern options to have healthy biological children."
  ],
  reaction_time: [
    "The sprinter's decline is caused by sleep deprivation. What training plan targets recovery?",
    "Caffeine creates dependency and anxiety. Overtraining causes physical fatigue and injury.",
    "Sleep optimization combined with moderate training is the most evidence-based way to restore reaction speed."
  ],
  unstable_slope: [
    "What action directly addresses the build-up of water pressure inside the slope?",
    "Retaining walls can collapse if water pressure builds. Evacuation is temporary and doesn't fix the landslide risk.",
    "Installing drainage pipes drains saturated water directly, relieving the slope pressure."
  ],
  invasive_species: [
    "Choose a control method that is targeted and doesn't pollute the lake or destroy the native habitat.",
    "Herbicides are toxic. Draining the lake destroys the entire ecosystem.",
    "Biological controls (plant-eating weevils) selectively eat water hyacinths, offering a sustainable solution."
  ],
  power_grid: [
    "We must reduce peak demand instantly to prevent the grid frequency from collapsing.",
    "Starting generators or requesting power takes time and may not match the massive 3,000 MW shortfall.",
    "Implementing temporary rolling blackouts immediately balances the load to protect the entire grid."
  ],
  heat_loss: [
    "Which insulation package targets the primary area of heat loss (windows) while preserving the historic look?",
    "Installing a bigger heater does not prevent heat loss. Triple-pane windows replace the historic exterior.",
    "Adding interior storm windows blocks conduction through air gaps and preserves the historic facade."
  ],
  oxygen_failure: [
    "Look for a backup chemical method that generates oxygen immediately with minimal setup.",
    "Reducing crew activity only delays the crisis. Repairing the complex system takes too long.",
    "Activating chemical oxygen candles (lithium perchlorate) generates oxygen immediately for the crew."
  ],
  aspirin_production: [
    "A quality assurance lead must prioritize consumer safety and ethical standards over immediate profits.",
    "Distributing low-purity aspirin or adding fake fillers violates medical regulations and risks lives.",
    "Produce only the correct-dose tablets and immediately report the shortage to be transparent."
  ],
  fuelproduction: [
    "Find the reactant that will be completely consumed first based on the available moles.",
    "Check the mole ratio. S and O₂ react in a 1:1 ratio. You have equal moles of both.",
    "Since the reaction uses equal moles and you have equal moles, both are consumed completely."
  ],
  haber_process: [
    "Find the reactant that will be completely consumed first based on the available moles.",
    "Check the mole ratio. S and O₂ react in a 1:1 ratio. You have equal moles of both.",
    "Since the reaction uses equal moles and you have equal moles, both are consumed completely."
  ],
  aspirin_percent_yield: [
    "Which formula compares the actual lab yield to the calculated theoretical yield?",
    "Percent yield measures the efficiency of a chemical reaction.",
    "Percent Yield = (Actual Yield / Theoretical Yield) * 100."
  ],
  gas_boyle_adnoc: [
    "Boyle's law: pressure is inversely proportional to volume (P₁V₁ = P₂V₂) at constant temperature.",
    "If volume is cut in half, the final pressure must double to balance the equation.",
    "Calculate: P₂ = (P₁ * V₁) / V₂ = (100 * 4.0) / 2.0 = 200 kPa."
  ],
  gas_charles_aviation: [
    "Charles's law: volume is directly proportional to temperature (V₁/T₁ = V₂/T₂) at constant pressure.",
    "Double the temperature (300 K to 600 K) under constant pressure doubles the volume.",
    "Calculate: V₂ = (V₁ * T₂) / T₁ = (3.0 * 600) / 300 = 6.0 L."
  ],
  gas_gaylussac_cylinder: [
    "Gay-Lussac's law: pressure is directly proportional to temperature (P₁/T₁ = P₂/T₂) in a sealed container.",
    "A sealed container has a constant volume, meaning thermal expansion builds pressure.",
    "Heating the cylinder from 300 K to 450 K raised the internal pressure from 150 kPa to 225 kPa."
  ]
};

function HintSystem({ scenarioId, scene, hintCount, setHintCount }) {
    const customHints = SCENE_TWO_HINTS[scenarioId] || [
        "Read the choice options and tags carefully.",
        "Check how each choice interacts with the scientific principles identified in the evidence stage.",
        "Consider which choice offers the most balanced and direct scientific solution to the core problem."
    ];

    return (
        <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">
                    Need Help?
                </span>
                {hintCount < 3 && (
                    <button
                        onClick={() => setHintCount(prev => prev + 1)}
                        className="text-xs font-mono text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 border border-slate-200 rounded"
                    >
                        <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
                        Need a Hint? ({hintCount}/3)
                    </button>
                )}
                {hintCount >= 3 && (
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        All hints revealed
                    </span>
                )}
            </div>

            {hintCount > 0 && (
                <div className="space-y-2">
                    {customHints.slice(0, hintCount).map((hint, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-slate-700 bg-white border border-slate-100 p-2.5 rounded flex gap-2"
                        >
                            <span className="text-cyan-500 font-bold font-mono">Hint {idx + 1}:</span>
                            <span className="font-sans font-medium">{hint}</span>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SceneTwo({ scene, scenarioId, scenarioTitle: _scenarioTitle, onComplete, isTeacher = false, theme = {} }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [hintCount, setHintCount] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    
    // Structured Reasoning Scaffold States
    const [evidenceText, setEvidenceText] = useState('');
    const [meansText, setMeansText] = useState('');
    const [choiceText, setChoiceText] = useState('');
    const [riskText, setRiskText] = useState('');

    const displayedNarrative = useTypewriter(scene.narrative || '');

    const handleConfirmSubmit = () => {
        // Concatenate structured reasoning into a single formatted justification string
        const combinedJustification = [
            `- My evidence is: ${evidenceText.trim()}`,
            `- This means: ${meansText.trim()}`,
            `- My choice is: ${choiceText.trim()}`,
            `- One possible risk is: ${riskText.trim()}`
        ].join('\n');

        onComplete({
            selectedOption: selectedOption.id,
            consequence: selectedOption.consequence,
            justification: combinedJustification,
            hintsUsed: hintCount,
        });
    };

    const handleContinue = () => {
        if (isTeacher) {
            handleConfirmSubmit();
        } else {
            setShowConfirm(true);
        }
    };

    const handleTeacherSkip = () => {
        const defaultOption = scene.options[0];
        onComplete({
            selectedOption: defaultOption.id,
            consequence: defaultOption.consequence,
            justification: '- My evidence is: Teacher preview skip\n- This means: Skip\n- My choice is: Skip\n- One possible risk is: Skip',
            hintsUsed: 0,
        });
    };

    const letters = ['A', 'B', 'C', 'D'];

    // Validation rule: basic response (at least 3 characters) in both "My evidence is" and "My choice is"
    const isReasoningValid = evidenceText.trim().length >= 3 && choiceText.trim().length >= 3;
    const canSubmit = selectedOption && (isReasoningValid || isTeacher);

    // Fetch key evidence points with fallback
    const evidencePoints = SCENARIO_EVIDENCE_MAP[scenarioId] || [
        "Review the observations, logs, and measurements collected in the previous scene.",
        "Verify the scientific limits and parameters of the system.",
        "Consider the public safety, economic, and environmental trade-offs."
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto px-4 py-4 pb-12"
        >
            {/* ── Phase label row ── */}
            <div className="flex items-center gap-3 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
                <span className="text-xs font-mono text-cyan-700 tracking-widest uppercase select-none font-bold">
                    Make Your Choice
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#14b8a6]/40 to-transparent" />
            </div>

            {/* ══════════════════  2-COLUMN GRID  ══════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">

                {/* ═══════════ LEFT COLUMN: MAIN DECISION WORKSPACE ═══════════ */}
                <div className="flex flex-col gap-6">

                    {/* 1. Question Panel */}
                    <div className="hud-panel p-6 border-cyan-500/30 bg-cyan-50/10">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4.5 h-4.5 text-cyan-600" />
                            <span className="text-xs font-mono text-cyan-700 tracking-widest uppercase font-bold">Decision Point</span>
                        </div>
                        <h2 className="text-xl md:text-2xl text-slate-900 font-extrabold leading-snug tracking-tight">
                            {scene.question}
                        </h2>
                    </div>

                    {/* 2. Evidence Reminder */}
                    <Panel className="border-teal-500/20 bg-teal-50/10">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-teal-200/40">
                            <Sparkles className="w-4.5 h-4.5 text-[#14b8a6]" />
                            <span className="text-xs font-mono text-teal-700 tracking-widest uppercase font-bold">Evidence Reminder</span>
                        </div>
                        <ul className="space-y-3">
                            {evidencePoints.map((point, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-bold mt-0.5">
                                        {index + 1}
                                    </span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>

                    {/* 3. Choice Cards */}
                    <div>
                        <h3 className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-3 font-bold">
                            Select an Option
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {scene.options.map(({ id, text, tags, ethical }, idx) => {
                                const isSelected = selectedOption?.id === id;
                                const letter = letters[idx] ?? String.fromCharCode(65 + idx);
                                return (
                                    <motion.button
                                        key={id}
                                        whileHover={{ scale: 1.015 }}
                                        whileTap={{ scale: 0.985 }}
                                        onClick={() => setSelectedOption(scene.options.find(o => o.id === id))}
                                        className={`w-full text-left p-5 border rounded-xl transition-all cursor-pointer ${
                                            isSelected
                                                ? 'border-cyan-500 bg-cyan-50/60 shadow-lg shadow-cyan-500/10'
                                                : 'bg-white border-slate-200 hover:border-cyan-400 hover:bg-slate-50/80'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Large active letter badge */}
                                            <span className={`shrink-0 w-10 h-10 rounded-lg text-base font-mono font-black flex items-center justify-center transition-all ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/20'
                                                    : 'bg-slate-100 border border-slate-200 text-slate-500'
                                            }`}>{letter}</span>

                                            <div className="flex-1 min-w-0">
                                                <p className={`text-base font-bold leading-snug mb-3 ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>{text}</p>
                                                {Array.isArray(tags) && tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                                        {tags.map(tag => (
                                                            <span key={tag} className="text-[10px] font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {ethical && (
                                                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5 font-semibold">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                        {ethical} analysis
                                                    </span>
                                                )}
                                            </div>

                                            {/* Check indicator */}
                                            <div className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                                isSelected 
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                                                    : 'border-slate-300'
                                            }`}>
                                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progressive Hint System */}
                    <HintSystem scenarioId={scenarioId} scene={scene} hintCount={hintCount} setHintCount={setHintCount} />

                    {/* 4. Reason Box (Structured Reasoning Scaffold) */}
                    <AnimatePresence>
                        {selectedOption && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <Panel className="p-6 border-slate-200">
                                    <div className="mb-4">
                                        <h3 className="text-xs font-mono text-slate-500 tracking-widest uppercase font-bold mb-1">
                                            Structured Reasoning Scaffold
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Use scientific evidence and key facts to justify your choice. Fields marked with <span className="text-red-500 font-bold">*</span> are required.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Scaffold Field 1: My evidence is */}
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-bold text-slate-700">
                                                My evidence is: <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <textarea
                                                value={evidenceText}
                                                onChange={e => setEvidenceText(e.target.value)}
                                                placeholder="What scientific measurements, logs, or facts did you collect?"
                                                className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none resize-none font-sans"
                                                style={{ minHeight: '80px' }}
                                            />
                                        </div>

                                        {/* Scaffold Field 2: This means */}
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-bold text-slate-700">
                                                This means:
                                            </label>
                                            <textarea
                                                value={meansText}
                                                onChange={e => setMeansText(e.target.value)}
                                                placeholder="How do you interpret this data? What scientific concept explains this?"
                                                className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none resize-none font-sans"
                                                style={{ minHeight: '80px' }}
                                            />
                                        </div>

                                        {/* Scaffold Field 3: My choice is */}
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-bold text-slate-700">
                                                My choice is: <span className="text-red-500 font-bold">*</span>
                                            </label>
                                            <textarea
                                                value={choiceText}
                                                onChange={e => setChoiceText(e.target.value)}
                                                placeholder="Why does this choice best address the scientific issue?"
                                                className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none resize-none font-sans"
                                                style={{ minHeight: '80px' }}
                                            />
                                        </div>

                                        {/* Scaffold Field 4: One possible risk is */}
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-bold text-slate-700">
                                                One possible risk is:
                                            </label>
                                            <textarea
                                                value={riskText}
                                                onChange={e => setRiskText(e.target.value)}
                                                placeholder="What is a potential trade-off, cost, or risk of your recommendation?"
                                                className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none resize-none font-sans"
                                                style={{ minHeight: '80px' }}
                                            />
                                        </div>
                                    </div>
                                </Panel>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 5. Submit Choice Button */}
                    <motion.button
                        whileHover={canSubmit ? { scale: 1.01 } : {}}
                        whileTap={canSubmit ? { scale: 0.99 } : {}}
                        onClick={canSubmit ? handleContinue : undefined}
                        disabled={!canSubmit}
                        className={`w-full relative overflow-hidden py-4 text-sm font-bold tracking-widest uppercase transition-all rounded-lg py-5 ${
                            canSubmit
                                ? 'bg-[#14b8a6] hover:bg-[#0f766e] text-white cursor-pointer shadow-lg shadow-[#14b8a6]/20'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                    >
                        <div className="relative flex items-center justify-center gap-2">
                            <Play className="w-4 h-4 fill-current" />
                            <span>Submit Choice</span>
                        </div>
                    </motion.button>

                    {/* Validation Warnings */}
                    {selectedOption && !isReasoningValid && !isTeacher && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                                Please type a basic response in both <strong className="font-bold">"My evidence is"</strong> and <strong className="font-bold">"My choice is"</strong> to enable the submit button.
                            </p>
                        </div>
                    )}

                    {/* Teacher skip */}
                    {isTeacher && !selectedOption && (
                        <button
                            onClick={handleTeacherSkip}
                            className="w-full py-3 text-xs font-mono text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100/50 transition-colors rounded-lg font-bold"
                        >
                            SKIP PREVIEW
                        </button>
                    )}
                </div>

                {/* ═══════════ RIGHT COLUMN: REFERENCE HUB ═══════════ */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500 tracking-widest uppercase font-bold">Reference Hub</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* Scenario Visual */}
                    <Panel className="p-0 overflow-hidden">
                        <div className="h-44 overflow-hidden">
                            <ScenarioVisualPanel
                                scenarioId={scenarioId}
                                sceneIndex={1}
                                avatar={scene.avatar}
                                title={scene.title}
                                subtitle={scene.question}
                                border="border-transparent"
                            />
                        </div>
                    </Panel>

                    {/* Narrative */}
                    <Panel className="p-5">
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <BookOpen className="w-4 h-4 text-[#14b8a6]" />
                                <span className="text-xs font-mono text-slate-500 tracking-widest uppercase font-bold">Story Context</span>
                            </div>
                            <div className="text-slate-800 text-sm leading-relaxed min-h-[80px] font-sans">
                                {displayedNarrative}
                                {displayedNarrative.length < (scene.narrative || '').length && (
                                    <span className="inline-block w-1.5 h-3.5 bg-[#14b8a6] ml-0.5 animate-pulse" />
                                )}
                            </div>
                        </div>
                    </Panel>

                    {/* Evidence data table */}
                    {scene.data?.table?.rows?.length > 0 && (
                        <Panel className="p-5">
                            <div className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-3 pb-2 border-b border-slate-200 font-bold">
                                Collected Data Logs
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-xs border-collapse">
                                    {scene.data.table.headers && (
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                {scene.data.table.headers.map((h, i) => (
                                                    <th key={i} className="text-left py-2 px-3 text-[10px] font-mono text-slate-700 uppercase tracking-wider font-bold">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                    )}
                                    <tbody>
                                        {scene.data.table.rows.map((row, i) => (
                                            <motion.tr
                                                key={i}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors"
                                            >
                                                {row.map((cell, j) => (
                                                    <td key={j} className="py-2.5 px-3 text-xs font-sans text-slate-700">{cell}</td>
                                                ))}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>
                    )}
                </div>
            </div>

            {/* ── Confirmation Checkpoint Modal ── */}
            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConfirm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6"
                        >
                            {/* Header */}
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                    Before you submit:
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    Review this quick checklist to ensure a thoughtful decision:
                                </p>
                            </div>

                            {/* Checklist */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-xl shrink-0 select-none">🔍</span>
                                    <span className="text-sm font-semibold text-slate-700">1. Did you check the evidence?</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-xl shrink-0 select-none">✍️</span>
                                    <span className="text-sm font-semibold text-slate-700">2. Did you explain your reason?</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <span className="text-xl shrink-0 select-none">🚀</span>
                                    <span className="text-sm font-semibold text-slate-700">3. Are you ready to see the result?</span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-3 text-sm font-bold tracking-wider uppercase border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirm(false);
                                        handleConfirmSubmit();
                                    }}
                                    className="flex-1 py-3 text-sm font-bold tracking-wider uppercase bg-[#14b8a6] hover:bg-[#0f766e] text-white rounded-lg transition-colors cursor-pointer shadow-lg shadow-[#14b8a6]/10"
                                >
                                    Submit My Choice
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
