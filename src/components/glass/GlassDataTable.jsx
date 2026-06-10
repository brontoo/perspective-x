import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassDataTable({ headers, rows, className = '' }) {
    return (
        <div className={cn('glass-card overflow-hidden', className)}>
            <div className="overflow-x-auto">
                <table className="glass-table">
                    {headers && (
                        <thead>
                            <tr>
                                {headers.map((h) => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {rows.map((row, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06, duration: 0.25 }}
                            >
                                {row.map((cell, j) => (
                                    <td
                                        key={j}
                                        className={j === 0 ? 'font-medium text-[var(--lx-text)]' : 'text-[var(--lx-text-sub)]'}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
