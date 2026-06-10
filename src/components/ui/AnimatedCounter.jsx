import React, { useState, useEffect } from 'react';

export default function AnimatedCounter({ value, duration = 1000, suffix = '' }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;
        const startValue = displayValue;
        const endValue = value;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return (
        <span>{displayValue}{suffix}</span>
    );
}