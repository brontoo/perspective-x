import React from 'react';
import { motion } from 'framer-motion';
import { Table, Activity } from 'lucide-react';

export default function DataDisplay({ data, className = '' }) {
    if (!data) return null;

    if (data.table) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`w-full ${className}`}
            >
                {/* Equation Banner */}
                {data.graphDescription && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-teal-900/60 to-cyan-900/60 border border-teal-500/40 text-center"
                    >
                        <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">⚗️ Chemical Equation</p>
                        <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
                            {data.graphDescription}
                        </p>
                    </motion.div>
                )}

                {/* Table */}
                <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center gap-3 border-b border-slate-700">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                            <Table className="w-5 h-5 text-teal-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Scientific Data</h3>
                    </div>
                    <div className="overflow-x-auto bg-slate-900/80">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-teal-500/30 bg-slate-800/60">
                                    {data.table.headers.map((header, i) => (
                                        <th key={i} className="text-left py-4 px-6 text-teal-300 font-bold text-base uppercase tracking-widest">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.table.rows.map((row, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + i * 0.12 }}
                                        className="border-b border-slate-800 hover:bg-teal-500/5 transition-colors"
                                    >
                                        {row.map((cell, j) => (
                                            <td key={j} className={`py-5 px-6 text-base ${j === 0 ? 'text-white font-bold text-lg' :
                                                    j === row.length - 1 ? 'text-teal-300 font-mono font-bold text-lg' :
                                                        'text-slate-300 text-base'
                                                }`}>
                                                {cell}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Map Note */}
                {data.mapNote && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 flex items-start gap-3"
                    >
                        <span className="text-2xl mt-0.5">💡</span>
                        <div>
                            <p className="text-blue-300 font-bold text-sm uppercase tracking-wider mb-1">Key Formula</p>
                            <p className="text-blue-100 text-base font-medium">{data.mapNote}</p>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        );
    }

    if (data.equation) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`w-full ${className}`}
            >
                <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-900/50 to-slate-900 border-2 border-teal-500/40 text-center shadow-2xl">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-4">⚗️ Balanced Equation</p>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-wider mb-6"
                    >
                        {data.equation}
                    </motion.p>
                    {data.note && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-block px-6 py-3 rounded-xl bg-teal-500/10 border border-teal-500/30"
                        >
                            <p className="text-teal-300 font-semibold text-lg">{data.note}</p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        );
    }

    if (data.steps) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full space-y-4 ${className}`}
            >
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">📐 Calculation Steps</p>
                {data.steps.map((step, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex items-start gap-4 p-5 rounded-xl bg-slate-800/60 border border-slate-700"
                    >
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 font-bold text-amber-400">
                            {i + 1}
                        </div>
                        <p className="text-white font-mono text-base pt-1">{step}</p>
                    </motion.div>
                ))}
                {data.table && (
                    <div className="mt-6 rounded-2xl overflow-hidden border border-slate-700">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-800 border-b border-slate-700">
                                    {data.table.headers.map((h, i) => (
                                        <th key={i} className="text-left py-4 px-5 text-teal-300 font-bold text-sm uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.table.rows.map((row, i) => (
                                    <tr key={i} className="border-b border-slate-800 bg-slate-900/60">
                                        {row.map((cell, j) => (
                                            <td key={j} className={`py-4 px-5 text-base ${j === 0 ? 'text-slate-400' : 'text-white font-bold'}`}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        );
    }

    if (data.readings) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full ${className}`}
            >
                <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                    <div className="bg-slate-800 px-6 py-4 flex items-center gap-3 border-b border-slate-700">
                        <Activity className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">Real-Time Measurements</h3>
                    </div>
                    <div className="bg-slate-900/80 p-4 space-y-3">
                        {data.readings.map((reading, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-6 p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800/80 transition-colors"
                            >
                                <span className="text-slate-400 font-mono text-sm w-20">{reading.time}</span>
                                <span className="text-amber-300 font-mono text-2xl font-bold">{reading.temp}</span>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${reading.pressure === 'Critical' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                                        reading.pressure === 'Elevated' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' :
                                            'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                    }`}>{reading.pressure}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    if (data.outcomes) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full ${className}`}
            >
                <div className="rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
                    <div className="bg-purple-900/30 px-6 py-4 flex items-center gap-3 border-b border-purple-500/20">
                        <span className="text-2xl">🧬</span>
                        <h3 className="text-lg font-bold text-white">Genetic Outcomes</h3>
                    </div>
                    <div className="bg-slate-900/80 p-4 space-y-3">
                        {data.outcomes.map((outcome, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex justify-between items-center p-5 rounded-xl bg-slate-800/60 hover:bg-slate-800/80 transition-colors"
                            >
                                <div>
                                    <span className="text-white font-mono text-2xl font-bold">{outcome.genotype}</span>
                                    <p className="text-slate-400 text-sm mt-1">{outcome.phenotype}</p>
                                </div>
                                <span className="text-teal-300 font-bold text-3xl">{outcome.probability}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    return null;
}