import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const GlassInput = forwardRef(function GlassInput(
    { className = '', dark = false, label, error, ...props },
    ref
) {
    const inputClass = dark ? 'glass-input-dark' : 'glass-input';
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className={cn('text-sm font-medium', dark ? 'text-slate-400' : 'text-slate-600')}>
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={cn(
                    inputClass,
                    'w-full px-4 py-3 text-sm',
                    error && 'border-red-400/60 focus:border-red-400 focus:ring-red-400/20',
                    className,
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-400 mt-0.5">{error}</p>
            )}
        </div>
    );
});

export const GlassTextarea = forwardRef(function GlassTextarea(
    { className = '', dark = false, label, error, rows = 4, ...props },
    ref
) {
    const inputClass = dark ? 'glass-input-dark' : 'glass-input';
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className={cn('text-sm font-medium', dark ? 'text-slate-400' : 'text-slate-600')}>
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={cn(
                    inputClass,
                    'w-full px-4 py-3 text-sm resize-none',
                    error && 'border-red-400/60',
                    className,
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-400 mt-0.5">{error}</p>
            )}
        </div>
    );
});

export default GlassInput;
