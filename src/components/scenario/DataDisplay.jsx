import React from 'react';
import { motion } from 'framer-motion';
import { Table, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Centralized, responsive data display component
export default function DataDisplay({ data, className = '' }) {
    if (!data) return null;

    // Render table data
    if (data.table) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full flex justify-center ${className}`}
            >
                <Card className="bg-slate-900/95 border-slate-700 p-6 sm:p-8 shadow-2xl max-w-4xl w-full">
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                            <Table className="w-7 h-7 text-teal-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center">Scientific Data</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-teal-500/30">
                                    {data.table.headers.map((header, i) => (
                                        <th key={i} className="text-left py-4 px-4 text-teal-400 font-bold text-sm sm:text-base uppercase tracking-wide">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.table.rows.map((row, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                                    >
                                        {row.map((cell, j) => (
                                            <td key={j} className={`py-4 px-4 text-sm sm:text-base ${j === 0 ? 'text-white font-semibold' : 'text-slate-300'
                                                }`}>
                                                {cell}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {data.graphDescription && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-teal-500/20"
                        >
                            <BarChart3 className="w-5 h-5 text-teal-400 flex-shrink-0" />
                            <span className="text-slate-300 text-sm">{data.graphDescription}</span>
                        </motion.div>
                    )}

                    {data.mapNote && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
                        >
                            <span className="text-blue-300 text-sm">📍 {data.mapNote}</span>
                        </motion.div>
                    )}
                </Card>
            </motion.div>
        );
    }

    // Render time-series readings
    if (data.readings) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full flex justify-center ${className}`}
            >
                <Card className="bg-slate-900/95 border-slate-700 p-6 sm:p-8 shadow-2xl max-w-3xl w-full">
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <Activity className="w-7 h-7 text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center">Real-Time Measurements</h3>
                    </div>

                    <div className="space-y-3">
                        {data.readings.map((reading, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                            >
                                <span className="text-slate-500 text-sm font-mono w-20">{reading.time}</span>
                                <span className="text-amber-400 font-mono text-lg font-bold">{reading.temp}</span>
                                <span className={`text-sm px-3 py-1 rounded-full font-medium ${reading.pressure === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                        reading.pressure === 'Elevated' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
                                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                    }`}>
                                    {reading.pressure}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        );
    }

    // Render genetic outcomes
    if (data.outcomes) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full flex justify-center ${className}`}
            >
                <Card className="bg-slate-900/95 border-slate-700 p-6 sm:p-8 shadow-2xl max-w-3xl w-full">
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-3xl">
                            🧬
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center">Genetic Outcomes</h3>
                    </div>

                    <div className="space-y-3">
                        {data.outcomes.map((outcome, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                            >
                                <div>
                                    <span className="text-white font-mono text-lg font-bold">{outcome.genotype}</span>
                                    <span className="text-slate-400 ml-3 text-sm">{outcome.phenotype}</span>
                                </div>
                                <span className="text-teal-400 font-bold text-xl">{outcome.probability}</span>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        );
    }

    return null;
}