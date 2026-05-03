import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassCard({
    children,
    className = '',
    hover = true,
    glow = false,
    dark = false,
    as: Tag = 'div',
    animate = false,
    delay = 0,
    onClick,
    ...props
}) {
    const base = dark ? 'glass-dark' : 'glass-card';
    const glowClass = glow ? 'glass-card--glow' : '';

    const inner = (
        <Tag
            className={cn(base, glowClass, hover ? '' : 'hover:transform-none', className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </Tag>
    );

    if (!animate) return inner;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
            className="contents"
        >
            {inner}
        </motion.div>
    );
}
