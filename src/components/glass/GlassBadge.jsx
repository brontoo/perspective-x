import React from 'react';
import { cn } from '@/lib/utils';

const variantMap = {
    default:  'glass-badge',
    accent:   'glass-badge glass-badge-accent',
    success:  'glass-badge glass-badge-success',
    warning:  'glass-badge glass-badge-warning',
    danger:   'glass-badge glass-badge-danger',
};

export default function GlassBadge({ children, variant = 'default', className = '', dot, ...props }) {
    return (
        <span className={cn(variantMap[variant] || variantMap.default, className)} {...props}>
            {dot && (
                <span className={cn(
                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                    variant === 'success' ? 'bg-emerald-400' :
                    variant === 'warning' ? 'bg-amber-400' :
                    variant === 'danger'  ? 'bg-red-400' :
                    'bg-cyan-400',
                )} />
            )}
            {children}
        </span>
    );
}
