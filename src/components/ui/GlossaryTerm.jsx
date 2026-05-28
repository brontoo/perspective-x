import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

/**
 * GlossaryTerm Component
 * Wraps a keyword or phrase, making it clickable to show a science definition
 * in a student-friendly popover tooltip.
 */
export default function GlossaryTerm({ term, definition }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-baseline font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 border-b border-dashed border-cyan-400/80 hover:border-cyan-600 cursor-pointer focus:outline-none transition-colors align-baseline p-0 bg-transparent text-left font-sans"
        >
          {term}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        className="w-64 p-3.5 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-xl z-50 text-left pointer-events-auto"
      >
        <span className="block text-[9px] font-mono font-bold text-cyan-600 uppercase tracking-widest mb-1">
          Science Glossary
        </span>
        <span className="block text-sm font-bold text-slate-900 mb-1">
          {term}
        </span>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {definition}
        </p>
      </PopoverContent>
    </Popover>
  );
}
