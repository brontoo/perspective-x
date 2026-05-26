import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GlassStepper({ steps, currentStep, className = '' }) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {steps.map((step, i) => {
                const isDone    = i < currentStep;
                const isActive  = i === currentStep;
                const isPending = i > currentStep;

                return (
                    <React.Fragment key={step.id ?? i}>
                        <div className="flex items-center gap-2">
                            <motion.div
                                className={cn(
                                    'w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all',
                                    isDone   && 'bg-[var(--lx-success)] border-[var(--lx-success)] text-white',
                                    isActive && 'glass-card border-[var(--lx-accent)] text-[var(--lx-accent)]',
                                    isPending && 'glass-panel border-[var(--lx-glass-border-sub)] text-[var(--lx-text-muted)]',
                                )}
                                animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                {isDone ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                            </motion.div>
                            {step.label && (
                                <span className={cn(
                                    'text-xs font-mono tracking-wide',
                                    isDone   && 'text-[var(--lx-success)]',
                                    isActive && 'text-[var(--lx-accent)]',
                                    isPending && 'text-[var(--lx-text-muted)]',
                                )}>
                                    {step.label}
                                </span>
                            )}
                        </div>
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-px">
                                <motion.div
                                    className="h-full bg-[var(--lx-accent)]"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: isDone ? 1 : 0 }}
                                    style={{ transformOrigin: 'left' }}
                                    transition={{ duration: 0.4 }}
                                />
                                <div className="h-full bg-[var(--lx-glass-border-sub)] -mt-px" />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
