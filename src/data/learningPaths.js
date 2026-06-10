/**
 * Learning Paths — curated sequences of existing scenarios grouped by science subject.
 * Scenario IDs are UNCHANGED. This file is purely additive.
 */

export const LEARNING_PATHS = {

    chemistry: {
        id: 'chemistry',
        title: 'Chemistry Path',
        emoji: '⚗️',
        color: 'blue',
        colorClasses: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            badge: 'bg-blue-100 text-blue-700 border-blue-200',
            bar: 'from-blue-500 to-cyan-500',
            icon: 'bg-blue-100 text-blue-600',
            heading: 'text-blue-700',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            soft: 'bg-blue-50/60 border-blue-100',
        },
        description: 'Explore chemical reactions, industrial processes, stoichiometry, and pharmaceutical chemistry through real-world scenarios.',
        difficulty: 'Beginner → Advanced',
        estimatedMinutes: 75,
        scenarios: [
            'water_contamination',
            'reaction_gone_wrong',
            'aspirin_production',
            'aspirin_percent_yield',
            'fuelproduction',
        ],
        skills: ['scientific_reasoning', 'concept_application', 'data_interpretation', 'risk_analysis'],
        completionBadge: '🧪 Master Chemist',
        completionNote: 'Complete all 5 Chemistry missions to earn the Master Chemist distinction.',
    },

    biology: {
        id: 'biology',
        title: 'Biology Path',
        emoji: '🧬',
        color: 'green',
        colorClasses: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            badge: 'bg-green-100 text-green-700 border-green-200',
            bar: 'from-green-500 to-emerald-500',
            icon: 'bg-green-100 text-green-600',
            heading: 'text-green-700',
            button: 'bg-green-600 hover:bg-green-700 text-white',
            soft: 'bg-green-50/60 border-green-100',
        },
        description: 'Investigate genetics, inheritance patterns, human physiology, and ecosystem biology through scientific cases.',
        difficulty: 'Beginner → On-Track',
        estimatedMinutes: 45,
        scenarios: [
            'mutation_dilemma',
            'reaction_time',
            'invasive_species',
        ],
        skills: ['data_interpretation', 'ethical_reasoning', 'communication', 'decision_making'],
        completionBadge: '🧬 Biology Explorer',
        completionNote: 'Complete all 3 Biology missions to earn the Biology Explorer distinction.',
    },

    physics: {
        id: 'physics',
        title: 'Physics Path',
        emoji: '⚡',
        color: 'amber',
        colorClasses: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            badge: 'bg-amber-100 text-amber-700 border-amber-200',
            bar: 'from-amber-500 to-yellow-400',
            icon: 'bg-amber-100 text-amber-600',
            heading: 'text-amber-700',
            button: 'bg-amber-500 hover:bg-amber-600 text-white',
            soft: 'bg-amber-50/60 border-amber-100',
        },
        description: 'Apply gas laws, thermodynamics, and electrical systems to real engineering and energy problems.',
        difficulty: 'On-Track → Advanced',
        estimatedMinutes: 90,
        scenarios: [
            'heat_loss',
            'power_grid',
            'gas_boyle_adnoc',
            'gas_charles_aviation',
            'gas_gaylussac_cylinder',
            'oxygen_failure',
        ],
        skills: ['scientific_reasoning', 'concept_application', 'risk_analysis', 'decision_making'],
        completionBadge: '⚡ Physics Specialist',
        completionNote: 'Complete all 6 Physics missions to earn the Physics Specialist distinction.',
    },

    earth_science: {
        id: 'earth_science',
        title: 'Earth Science Path',
        emoji: '🌍',
        color: 'emerald',
        colorClasses: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            bar: 'from-emerald-500 to-teal-500',
            icon: 'bg-emerald-100 text-emerald-600',
            heading: 'text-emerald-700',
            button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            soft: 'bg-emerald-50/60 border-emerald-100',
        },
        description: 'Investigate water contamination, acid rain, and geological hazards to understand how human activity shapes our planet.',
        difficulty: 'Beginner → On-Track',
        estimatedMinutes: 45,
        scenarios: [
            'water_contamination',
            'acid_rain',
            'unstable_slope',
        ],
        skills: ['data_interpretation', 'ethical_reasoning', 'risk_analysis', 'reflection'],
        completionBadge: '🌍 Earth Scientist',
        completionNote: 'Complete all 3 Earth Science missions to earn the Earth Scientist distinction.',
    },

    sustainability: {
        id: 'sustainability',
        title: 'Sustainability Path',
        emoji: '🌱',
        color: 'teal',
        colorClasses: {
            bg: 'bg-teal-50',
            border: 'border-teal-200',
            badge: 'bg-teal-100 text-teal-700 border-teal-200',
            bar: 'from-teal-500 to-cyan-400',
            icon: 'bg-teal-100 text-teal-600',
            heading: 'text-teal-700',
            button: 'bg-teal-600 hover:bg-teal-700 text-white',
            soft: 'bg-teal-50/60 border-teal-100',
        },
        description: 'Tackle environmental challenges including ecosystem protection, water safety, energy efficiency, and responsible resource use.',
        difficulty: 'Beginner → On-Track',
        estimatedMinutes: 75,
        scenarios: [
            'water_contamination',
            'acid_rain',
            'invasive_species',
            'heat_loss',
            'power_grid',
        ],
        skills: ['ethical_reasoning', 'decision_making', 'reflection', 'risk_analysis'],
        completionBadge: '🌱 Sustainability Champion',
        completionNote: 'Complete all 5 Sustainability missions to earn the Sustainability Champion distinction.',
    },

    uae_innovation: {
        id: 'uae_innovation',
        title: 'UAE Innovation Path',
        emoji: '🏅',
        color: 'rose',
        colorClasses: {
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            badge: 'bg-rose-100 text-rose-700 border-rose-200',
            bar: 'from-rose-500 to-pink-500',
            icon: 'bg-rose-100 text-rose-600',
            heading: 'text-rose-700',
            button: 'bg-rose-600 hover:bg-rose-700 text-white',
            soft: 'bg-rose-50/60 border-rose-100',
        },
        description: 'Inspired by UAE industrial innovation: apply gas laws and life-support science to real contexts in aviation, oil & gas, and space.',
        difficulty: 'On-Track → Advanced',
        estimatedMinutes: 60,
        scenarios: [
            'gas_boyle_adnoc',
            'gas_charles_aviation',
            'gas_gaylussac_cylinder',
            'oxygen_failure',
        ],
        skills: ['scientific_reasoning', 'concept_application', 'risk_analysis', 'decision_making'],
        completionBadge: '🏅 UAE Innovator',
        completionNote: 'Complete all 4 UAE Innovation missions to earn the UAE Innovator distinction.',
    },

};

/** Ordered array of paths for display */
export const LEARNING_PATHS_LIST = Object.values(LEARNING_PATHS);

/**
 * Given a student's completed scenario IDs, calculate progress for a path.
 * Returns { completed, total, pct, nextScenarioId }
 */
export function getPathProgress(pathId, completedScenarios = []) {
    const path = LEARNING_PATHS[pathId];
    if (!path) return { completed: 0, total: 0, pct: 0, nextScenarioId: null };

    const done = path.scenarios.filter(sid => completedScenarios.includes(sid));
    const remaining = path.scenarios.filter(sid => !completedScenarios.includes(sid));
    const pct = path.scenarios.length > 0
        ? Math.round((done.length / path.scenarios.length) * 100)
        : 0;

    return {
        completed: done.length,
        total: path.scenarios.length,
        pct,
        nextScenarioId: remaining[0] || null,
        isComplete: remaining.length === 0,
    };
}
