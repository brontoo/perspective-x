import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassTabs({ tabs, active, onChange, className = '' }) {
    return (
        <div className={cn('glass-tabs', className)}>
            {tabs.map((tab) => {
                const isActive = tab.id === active;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn('glass-tab', isActive && 'active')}
                    >
                        {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
