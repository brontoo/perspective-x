/* Design tokens for Perspective X "Scientific Escape Interface".
   Use these constants to avoid hardcoded magic values in components. */

// ── Border radii ─────────────────────────────────────────────────────
export const radii = {
    xs:   '2px',
    sm:   '3px',
    md:   '4px',
    lg:   '6px',
    xl:   '8px',
    '2xl':'12px',
    '3xl':'16px',
    full: '9999px',
};

// ── Semantic colors (hex — use in inline styles where Tailwind can't reach) ─
export const colors = {
    // HUD / interface chrome
    hud:        '#06b6d4',   // cyan-500
    hudLight:   '#22d3ee',   // cyan-400
    hudDark:    '#0891b2',   // cyan-600

    // States
    success:    '#10b981',   // emerald-500
    successLt:  '#34d399',   // emerald-400
    danger:     '#ef4444',   // red-500
    dangerLt:   '#f87171',   // red-400
    warning:    '#f59e0b',   // amber-500
    warningLt:  '#fbbf24',   // amber-400
    info:       '#3b82f6',   // blue-500

    // Surfaces
    surface:    '#0f172a',   // slate-950
    panel:      '#1e293b',   // slate-800
    panelLight: '#f8fafc',   // slate-50
    border:     '#334155',   // slate-700
    borderLight:'#e2e8f0',   // slate-200
    muted:      '#475569',   // slate-600
    subtle:     '#94a3b8',   // slate-400
};

// ── Glow / shadow utilities (use in style={{ boxShadow: ... }}) ───────
export const shadows = {
    hud:        `0 0 12px rgba(6,182,212,0.3)`,
    hudStrong:  `0 0 24px rgba(6,182,212,0.5)`,
    success:    `0 0 20px rgba(16,185,129,0.35)`,
    danger:     `0 0 20px rgba(239,68,68,0.35)`,
    warning:    `0 0 20px rgba(245,158,11,0.35)`,
    card:       `0 4px 24px rgba(0,0,0,0.4)`,
    cardLight:  `0 2px 16px rgba(0,0,0,0.08)`,
    none:       'none',
};

export const glowFor = (hex, strength = 0.3, size = 20) =>
    `0 0 ${size}px rgba(${hexToRgb(hex)},${strength})`;

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
        : '0,0,0';
}

// ── Spacing scale (multiples of 4px) ────────────────────────────────
export const space = {
    1: '4px',   2: '8px',   3: '12px',  4: '16px',  5: '20px',
    6: '24px',  8: '32px', 10: '40px', 12: '48px', 16: '64px',
};

// ── Typography scales ────────────────────────────────────────────────
export const font = {
    mono:  "'Space Mono', 'Courier New', monospace",
    sans:  "'Space Grotesk', 'Inter', sans-serif",
    // HUD label: tiny all-caps mono
    hud:   { fontSize: '9px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase' },
    // Panel label: mono tracking
    label: { fontSize: '10px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase' },
};

// ── Z-index stack ────────────────────────────────────────────────────
export const z = {
    base:        0,
    raised:     10,
    sticky:     40,
    overlay:    50,
    hud:        60,
    modal:      70,
    toast:      80,
};
