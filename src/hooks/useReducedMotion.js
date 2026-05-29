import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (e) => setReduced(e.matches);
    mql.addEventListener('change', handler);

    // Sync attribute on <html> for CSS selectors
    document.documentElement.setAttribute(
      'data-reduced-motion',
      mql.matches ? 'true' : 'false'
    );

    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-reduced-motion',
      reduced ? 'true' : 'false'
    );
  }, [reduced]);

  return reduced;
}

// Helper: returns animation props only when motion is allowed
export function safeMotion(props, reduced) {
  if (reduced) {
    return {
      initial: false,
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    };
  }
  return props;
}

// Constant for instant transitions
export const INSTANT = { duration: 0 };
