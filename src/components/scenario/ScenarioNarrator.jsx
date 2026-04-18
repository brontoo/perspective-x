import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

const WORD_DELAY = 80;
const INITIAL_DELAY = 1500;

export default function ScenarioNarrator({ scenario, onNarrationComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);
  const [progress, setProgress] = useState(0);

  // Typewriter effect
  const startNarration = useCallback(() => {
    if (!scenario?.narrative) return;

    const words = scenario.narrative.split(' ');
    let i = 0;
    let currentSentence = '';

    const timer = setInterval(() => {
      if (i >= words.length) {
        clearInterval(timer);
        setIsComplete(true);
        onNarrationComplete();
        return;
      }

      const word = words[i];
      // Add punctuation-aware spacing
      currentSentence += (word.match(/[.,!?]/) ? '' : ' ') + word;
      setDisplayedText(currentSentence.trim());
      setProgress((i / words.length) * 100);
      i++;
    }, WORD_DELAY);

    return () => clearInterval(timer);
  }, [scenario?.narrative, onNarrationComplete]);

  // Show character info after delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowCharacter(true);
    }, INITIAL_DELAY);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-black/90 border-2 border-emerald-500/30 rounded-xl p-8 max-w-3xl mx-auto"
    >
      {/* Character Info */}
      <AnimatePresence>
        {showCharacter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-6 mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-3xl">
              {scenario.character?.avatar || '🧑‍🔬'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {scenario.character?.name || 'Scientist'}
              </h2>
              <p className="text-emerald-400 text-sm mt-1">
                {scenario.character?.title || 'Researcher'}
              </p>
              <p className="text-emerald-400 text-sm mt-1">
                {scenario.character?.titleAr || 'باحث'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narration Text */}
      <div className="min-h-[200px]">
        <p className="text-white text-lg leading-relaxed">
          {displayedText}
          {!isComplete && (
            <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
          )}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-emerald-500/10 rounded-full overflow-hidden mt-6">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Play Button */}
      {!isComplete && (
        <motion.button
          onClick={startNarration}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-6 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg text-emerald-400 font-medium flex items-center gap-2 hover:bg-emerald-500/20 transition-colors"
        >
          <Play className="w-5 h-5" />
          Play Narration
        </motion.button>
      )}
    </motion.div>
  );
}
