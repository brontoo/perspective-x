import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ScenarioNarrator({ scenario, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!scenario?.narrative) return;

    let i = 0;
    const words = scenario.narrative.split(' ');
    const timer = setInterval(() => {
      if (i < words.length) {
        setDisplayedText(prev => `${prev} ${words[i]}`.trim());
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, 80);

    return () => clearInterval(timer);
  }, [scenario]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-900/50 border border-slate-700 rounded-xl p-8"
    >
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-3xl">
          {scenario.character?.avatar || '🧑‍🔬'}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-teal-400 mb-2">
            {scenario.character?.name || 'Scientist'}
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {displayedText}
            <span className="inline-block w-2 h-4 bg-teal-400 ml-1 animate-pulse" />
          </p>
        </div>
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => onComplete({ narration: displayedText })}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            Continue to Decision
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
