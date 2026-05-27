export function normalizeRoleThemeKey(roleId) {
    return String(roleId || '').replace(/_/g, '').toLowerCase();
}

export function toMetricRows(rawData) {
    if (!rawData) {
        return [];
    }

    if (typeof rawData === 'object' && !Array.isArray(rawData)) {
        return Object.entries(rawData).map(([label, value]) => [label, String(value)]);
    }

    if (typeof rawData !== 'string') {
        return [['Observation', String(rawData)]];
    }

    return rawData
        .split(/[.;]\s+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item, index) => {
            const [label, ...rest] = item.split(':');

            if (rest.length > 0) {
                return [label.trim(), rest.join(':').trim()];
            }

            return [`Observation ${index + 1}`, item];
        });
}

export function toMetricMap(rawData) {
    return Object.fromEntries(toMetricRows(rawData));
}

import { ADDITIONAL_QUESTIONS } from '../scenarios/additionalQuestions';
import { evaluateScenarioOutcome } from './scenarioAnswerKey';

export function normalizeExitTicketQuestions(exitTicket, scenarioId) {
    let baseQuestions = [];

    if (Array.isArray(exitTicket?.questions)) {
        baseQuestions = exitTicket.questions.map((question, index) => ({
            id: question.id || `q-${index + 1}`,
            prompt: question.text || question.question || '',
            options: Array.isArray(question.options) ? question.options : [],
        }));
    } else if (Array.isArray(exitTicket?.mcqs)) {
        baseQuestions = exitTicket.mcqs.map((question, index) => ({
            id: question.id || `q-${index + 1}`,
            prompt: question.text || question.question || '',
            options: Array.isArray(question.options) ? question.options : [],
        }));
    }

    if (scenarioId && ADDITIONAL_QUESTIONS[scenarioId]) {
        const extra = ADDITIONAL_QUESTIONS[scenarioId].map((q, idx) => ({
            id: `q-extra-${idx + 1}`,
            prompt: q.question || q.prompt || '',
            options: q.options || [],
        }));
        baseQuestions = [...baseQuestions, ...extra];
    }

    return baseQuestions;
}

export function getBadgeLevel(score, consequence, justification, scenarioId) {
    const numericScore = Number(score) || 0;

    // Platinum: Excellent performance (score = 100)
    if (numericScore === 100) {
        return 'Platinum';
    }

    // Gold: Correct choice (isSuccess is true) + strong reasoning
    const cleanJust = (justification || '')
        .replace(/- My evidence is:/g, '')
        .replace(/- This means:/g, '')
        .replace(/- My choice is:/g, '')
        .replace(/- One possible risk is:/g, '')
        .replace(/I chose this option because scientifically\.\.\./g, '')
        .replace(/This method generates oxygen through the chemical reaction\.\.\./g, '')
        .trim();

    const outcome = evaluateScenarioOutcome(scenarioId, consequence);
    const isCorrectChoice = outcome?.isSuccess === true;
    const hasStrongReasoning = cleanJust.length >= 60;

    if (numericScore >= 80 && isCorrectChoice && hasStrongReasoning) {
        return 'Gold';
    }

    // Silver: Passed with 80% or higher
    if (numericScore >= 80) {
        return 'Silver';
    }

    // Bronze: Completed mission
    return 'Bronze';
}

export const BADGE_LEVELS = {
    Bronze: { label: 'Bronze', color: 'text-amber-700 bg-amber-500/10 border-amber-500/20', badgeColor: 'bg-amber-600' },
    Silver: { label: 'Silver', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', badgeColor: 'bg-slate-400' },
    Gold: { label: 'Gold', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', badgeColor: 'bg-yellow-500' },
    Platinum: { label: 'Platinum', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', badgeColor: 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]' }
};