import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LiquidButton({
    children,
    variant = 'default',   // 'default' | 'accent' | 'ghost' | 'danger'
    size = 'md',           // 'sm' | 'md' | 'lg'
    className = '',
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) {
    const rippleRef = useRef(null);

    const sizeClasses = {
        sm:  'px-4 py-2 text-xs gap-1.5',
        md:  'px-6 py-2.5 text-sm gap-2',
        lg:  'px-8 py-3.5 text-base gap-2.5',
    };

    const variantClass = {
        default: 'liquid-btn',
        accent:  'liquid-btn liquid-btn-accent',
        ghost:   'liquid-btn liquid-btn-ghost',
        danger:  'liquid-btn bg-red-500/80 border-red-400/50 text-white hover:bg-red-500/95',
    };

    const handleClick = (e) => {
        if (disabled) return;
        // Ripple effect
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const circle = document.createElement('span');
        const size = Math.max(rect.width, rect.height) * 2;
        circle.style.cssText = `
          position:absolute; width:${size}px; height:${size}px;
          border-radius:50%; pointer-events:none;
          left:${e.clientX - rect.left - size/2}px;
          top:${e.clientY - rect.top - size/2}px;
          background:rgba(255,255,255,0.25);
          animation:lx-ripple 0.5s ease-out forwards;
        `;
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
        onClick?.(e);
    };

    return (
        <motion.button
            type={type}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.01 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            onClick={handleClick}
            className={cn(
                variantClass[variant] || variantClass.default,
                sizeClasses[size],
                'font-semibold tracking-wide',
                disabled && 'opacity-50 cursor-not-allowed transform-none',
                className,
            )}
            ref={rippleRef}
            {...props}
        >
            {children}
        </motion.button>
    );
}
