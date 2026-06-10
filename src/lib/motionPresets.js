/* Unified motion system for Perspective X.
   Import these instead of writing inline transition objects so the whole
   product feels like one cohesive system. */

// ── Easing curves ────────────────────────────────────────────────────
export const ease = {
    out:     [0.0, 0.0, 0.2, 1.0],   // material decelerate
    in:      [0.4, 0.0, 1.0, 1.0],   // material accelerate
    inOut:   [0.4, 0.0, 0.2, 1.0],   // material standard
    sharp:   [0.4, 0.0, 0.6, 1.0],   // quick & precise
    smooth:  'easeOut',
};

// ── Duration steps ────────────────────────────────────────────────────
export const dur = {
    instant: 0.1,
    fast:    0.15,
    base:    0.25,
    panel:   0.35,
    phase:   0.2,
    slow:    0.5,
    crawler: 3.0,   // scan lines, infinite loops
};

// ── Named transition presets ──────────────────────────────────────────
export const t = {
    // Standard UI response
    fast:      { duration: dur.fast,  ease: ease.smooth },
    base:      { duration: dur.base,  ease: ease.smooth },
    // Panel/card reveals
    panel:     { duration: dur.panel, ease: ease.out },
    // Phase-level page transitions (inside AnimatePresence mode="wait")
    phase:     { duration: dur.phase, ease: ease.smooth },
    // Progress bars and fill animations
    fill:      { duration: 0.4, ease: ease.out },
    // Spring for interactive elements (hover lift, scale)
    spring:    { type: 'spring', stiffness: 400, damping: 30 },
    springLow: { type: 'spring', stiffness: 260, damping: 26 },
    bounce:    { type: 'spring', stiffness: 300, damping: 20, bounce: 0.4 },
    // Stagger helper — returns a transition with delay
    stagger:   (i, step = 0.08)   => ({ duration: dur.panel, ease: ease.out, delay: i * step }),
    staggerFast: (i, step = 0.05) => ({ duration: dur.base,  ease: ease.smooth, delay: i * step }),
    // Infinite loops
    pulse:     { duration: 0.9, repeat: Infinity },
    scan:      { duration: dur.crawler, repeat: Infinity, repeatDelay: 8, ease: 'linear' },
    spin:      { duration: 1.2, repeat: Infinity, ease: 'linear' },
};

// ── Variant objects (use with motion.div variants prop) ───────────────
export const variants = {
    // Simple opacity fade
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit:    { opacity: 0 },
    },
    // Slide up from below (card / panel entrance)
    slideUp: {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0  },
        exit:    { opacity: 0, y: -8 },
    },
    // Phase-level transition (matches ScenarioPlayer's AnimatePresence)
    phase: {
        initial: { opacity: 0, y: 8  },
        animate: { opacity: 1, y: 0  },
        exit:    { opacity: 0, y: -8 },
    },
    // Scale pop (modals, badges, keys)
    scalePop: {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1    },
        exit:    { opacity: 0, scale: 0.92 },
    },
    // Subtle slide from right (detail panels)
    slideIn: {
        initial: { opacity: 0, x: 12  },
        animate: { opacity: 1, x: 0   },
        exit:    { opacity: 0, x: -12 },
    },
    // HUD / overlay reveal
    hudReveal: {
        initial: { opacity: 0, y: 8, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1     },
        exit:    { opacity: 0, y: 4, scale: 0.98  },
    },
};

// ── Hover / tap gestures (spread into motion components) ─────────────
export const hover = {
    lift:     { whileHover: { y: -2 },        transition: t.spring },
    scale:    { whileHover: { scale: 1.02 },  transition: t.spring },
    scaleSm:  { whileHover: { scale: 1.01 },  transition: t.spring },
    tap:      { whileTap:   { scale: 0.97 } },
    tapSm:    { whileTap:   { scale: 0.99 } },
    glow: (color = 'rgba(6,182,212,0.3)') => ({
        whileHover: { boxShadow: `0 0 16px ${color}` },
    }),
};
