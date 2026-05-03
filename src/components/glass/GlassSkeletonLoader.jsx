import React from 'react';
import { cn } from '@/lib/utils';

export function GlassSkeleton({ className = '', ...props }) {
    return <div className={cn('glass-skeleton', className)} {...props} />;
}

export default function GlassSkeletonLoader({ rows = 3, className = '' }) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="glass-card p-4 space-y-2.5">
                    <GlassSkeleton className="h-4 w-2/3 rounded" />
                    <GlassSkeleton className="h-3 w-full rounded" />
                    <GlassSkeleton className="h-3 w-4/5 rounded" />
                </div>
            ))}
        </div>
    );
}
