import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

// High-quality scientific graph component
export default function ScientificGraph({ data, type = 'bar', title, xLabel, yLabel }) {
    if (!data) return null;

    const renderBarChart = () => {
        const maxValue = Math.max(...data.values);

        return (
            <div className="space-y-6">
                {/* Chart area */}
                <div className="relative h-64 flex items-end justify-around gap-3 px-4 pb-2 border-b-2 border-l-2 border-slate-600">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-500 pr-2">
                        <span>{maxValue}</span>
                        <span>{Math.round(maxValue * 0.75)}</span>
                        <span>{Math.round(maxValue * 0.5)}</span>
                        <span>{Math.round(maxValue * 0.25)}</span>
                        <span>0</span>
                    </div>

                    {/* Bars */}
                    {data.labels.map((label, i) => {
                        const height = (data.values[i] / maxValue) * 100;
                        const color = data.colors?.[i] || 'teal';

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2" style={{ marginLeft: i === 0 ? '3rem' : '0' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.15 }}
                                    className={`w-full rounded-t-lg bg-gradient-to-t from-${color}-600 to-${color}-400 shadow-lg relative group`}
                                    style={{
                                        background: `linear-gradient(to top, var(--${color}-600), var(--${color}-400))`
                                    }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                                        {data.values[i]} {data.unit || ''}
                                    </div>
                                </motion.div>
                                <span className="text-xs text-slate-400 text-center mt-1">{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* X-axis label */}
                {xLabel && (
                    <p className="text-center text-sm text-slate-500 font-medium">{xLabel}</p>
                )}
            </div>
        );
    };

    const renderLineChart = () => {
        const maxValue = Math.max(...data.values);
        const minValue = Math.min(...data.values);
        const range = maxValue - minValue;

        const points = data.values.map((value, i) => {
            const x = (i / (data.values.length - 1)) * 100;
            const y = 100 - ((value - minValue) / range) * 100;
            return { x, y, value };
        });

        const pathData = points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
        ).join(' ');

        return (
            <div className="space-y-6">
                <div className="relative h-64 px-4 pb-8">
                    {/* Grid lines */}
                    <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--teal-500)" />
                                <stop offset="100%" stopColor="var(--emerald-500)" />
                            </linearGradient>
                        </defs>
                        {[0, 25, 50, 75, 100].map(y => (
                            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#334155" strokeWidth="0.2" />
                        ))}

                        {/* Line */}
                        <motion.path
                            d={pathData}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="1.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5 }}
                        />

                        {/* Data points */}
                        {points.map((p, i) => (
                            <motion.circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="1.5"
                                fill="white"
                                stroke="var(--teal-500)"
                                strokeWidth="0.8"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 * i }}
                            />
                        ))}
                    </svg>

                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-slate-500">
                        <span>{maxValue.toFixed(1)}</span>
                        <span>{(minValue + range * 0.75).toFixed(1)}</span>
                        <span>{(minValue + range * 0.5).toFixed(1)}</span>
                        <span>{(minValue + range * 0.25).toFixed(1)}</span>
                        <span>{minValue.toFixed(1)}</span>
                    </div>

                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-16 right-0 flex justify-between text-xs text-slate-500">
                        {data.labels.map((label, i) => (
                            <span key={i} className="text-center">{label}</span>
                        ))}
                    </div>
                </div>

                {xLabel && (
                    <p className="text-center text-sm text-slate-500 font-medium">{xLabel}</p>
                )}
            </div>
        );
    };

    return (
        <Card className="bg-slate-900/90 border-slate-700 p-6 shadow-2xl">
            <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    {type === 'line' ? <TrendingUp className="w-6 h-6 text-teal-400" /> : <BarChart3 className="w-6 h-6 text-teal-400" />}
                </div>
                {title && <h3 className="text-xl font-bold text-white text-center">{title}</h3>}
                {yLabel && <p className="text-sm text-slate-400 -mt-2">{yLabel}</p>}
            </div>

            {type === 'line' ? renderLineChart() : renderBarChart()}

            {/* Data legend */}
            {data.legend && (
                <div className="mt-6 pt-4 border-t border-slate-700 flex flex-wrap justify-center gap-4">
                    {data.legend.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} style={{ background: `var(--${item.color}-500)` }} />
                            <span className="text-xs text-slate-400">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}