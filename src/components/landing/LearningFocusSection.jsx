import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Scale, BarChart3, Lightbulb } from 'lucide-react';

const focuses = [
    {
        icon: Brain,
        title: 'Critical Thinking',
        description: 'Analyze complex situations and evaluate evidence',
        color: 'teal'
    },
    {
        icon: Target,
        title: 'Scientific Reasoning',
        description: 'Apply the scientific method to real problems',
        color: 'purple'
    },
    {
        icon: Scale,
        title: 'Ethical Decision-Making',
        description: 'Balance scientific facts with human values',
        color: 'amber'
    },
    {
        icon: BarChart3,
        title: 'Data Interpretation',
        description: 'Read graphs, tables, and scientific data',
        color: 'blue'
    },
    {
        icon: Lightbulb,
        title: 'Problem Solving',
        description: 'Find creative solutions under pressure',
        color: 'emerald'
    }
];

const colorClasses = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
};

export default function LearningFocusSection() {
    return (
        <section className="py-20 bg-slate-900/50">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Skills You'll Develop
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Each scenario is designed to strengthen specific scientific thinking skills
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {focuses.map((focus, index) => (
                        <motion.div
                            key={focus.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className={`p-6 rounded-2xl border ${colorClasses[focus.color]} text-center`}
                        >
                            <focus.icon className="w-8 h-8 mx-auto mb-3" />
                            <h3 className="font-semibold text-white text-sm mb-1">{focus.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{focus.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}