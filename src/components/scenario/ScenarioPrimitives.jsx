import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ScenarioVisual from './ScenarioVisual';

const TIMER_TONES = {
    amber: {
        card: 'bg-amber-500/10 border-amber-500/30',
        icon: 'text-amber-400',
        label: 'text-amber-200',
        value: 'text-amber-400',
    },
    purple: {
        card: 'bg-purple-500/10 border-purple-500/30',
        icon: 'text-purple-400',
        label: 'text-purple-300',
        value: 'text-purple-400',
    },
};

export function ScenarioStageHeader({ sceneNumber, title, subtitle, border, text, align = 'center', className = '' }) {
    const alignment = align === 'left' ? 'text-left' : 'text-center';
    const justify = align === 'left' ? 'justify-start' : 'justify-center';

    return (
        <div className={`${alignment} ${className}`.trim()}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${border} bg-slate-900/50 text-sm mb-4 ${justify}`}>
                {sceneNumber && <span className={`font-bold ${text}`}>{sceneNumber}</span>}
                {sceneNumber && title && <span className="text-slate-600">•</span>}
                {title && <span className="text-slate-300">{title}</span>}
            </div>
            {subtitle && <h2 className="text-2xl font-bold text-white">{subtitle}</h2>}
        </div>
    );
}

export function ScenarioVisualPanel({
    scenarioId,
    sceneIndex,
    avatar,
    title,
    subtitle,
    dataTable,
    border,
    heightClass = 'h-48',
    className = '',
}) {
    return (
        <div className={`bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center ${heightClass} ${className}`.trim()}>
            <div className={`w-full h-full ${border ? `border ${border}` : ''}`.trim()}>
                <ScenarioVisual
                    scenarioId={scenarioId}
                    sceneIndex={sceneIndex}
                    avatar={avatar}
                    title={title}
                    subtitle={subtitle}
                    dataTable={dataTable}
                />
            </div>
        </div>
    );
}

export function ScenarioThinkTimer({ show, time, icon: Icon, label, tone = 'amber', className = '' }) {
    if (!show) {
        return null;
    }

    const styles = TIMER_TONES[tone] || TIMER_TONES.amber;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={className}>
            <Card className={`${styles.card} p-4`}>
                <div className="flex items-center justify-center gap-4">
                    {Icon && <Icon className={`w-5 h-5 ${styles.icon}`} />}
                    <span className={styles.label}>{label}</span>
                    <span className={`text-2xl font-bold font-mono w-12 ${styles.value}`}>{time}s</span>
                </div>
            </Card>
        </motion.div>
    );
}

export function ScenarioLearningObjective({ value, border, text, className = '' }) {
    if (!value) {
        return null;
    }

    return (
        <div className={`text-center ${className}`.trim()}>
            <div className={`p-4 rounded-xl bg-slate-800/50 border ${border} inline-block`}>
                <span className="text-slate-500 text-sm">Learning Objective: </span>
                <span className={`${text} text-sm font-medium`}>{value}</span>
            </div>
        </div>
    );
}

export function ScenarioResponseCard({
    icon: Icon,
    title,
    prompt,
    value,
    onChange,
    placeholder,
    border,
    text,
    className = '',
    minHeightClass = 'min-h-[120px]',
    footer,
}) {
    return (
        <Card className={`bg-slate-900/50 border ${border} p-6 ${className}`.trim()}>
            <div className="flex items-center gap-2 mb-4">
                {Icon && <Icon className={`w-5 h-5 ${text}`} />}
                <h4 className="font-semibold text-white">{title}</h4>
            </div>
            {prompt && <p className="text-slate-400 text-sm mb-3">{prompt}</p>}
            <Textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none ${minHeightClass}`.trim()}
            />
            {footer}
        </Card>
    );
}