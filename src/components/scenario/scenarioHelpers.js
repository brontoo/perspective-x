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

export function normalizeExitTicketQuestions(exitTicket) {
    if (Array.isArray(exitTicket?.questions)) {
        return exitTicket.questions.map((question, index) => ({
            id: question.id || `q-${index + 1}`,
            prompt: question.text || question.question || '',
            options: Array.isArray(question.options) ? question.options : [],
        }));
    }

    if (Array.isArray(exitTicket?.mcqs)) {
        return exitTicket.mcqs.map((question, index) => ({
            id: question.id || `q-${index + 1}`,
            prompt: question.text || question.question || '',
            options: Array.isArray(question.options) ? question.options : [],
        }));
    }

    return [];
}