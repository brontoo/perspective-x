import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader } from '@/components/ui/loader';

const MAX_RETRIES = 3;
const WORD_DELAY = 80;
const INITIAL_DELAY = 500;

export default function ScenarioNarrator({ scenario, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [loadingState, setLoadingState] = useState('idle');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced typewriter effect with error handling
  const startTypewriter = useCallback(() => {
    if (!scenario?.narrative) {
      setError('No narrative content found');
      return;
    }

    setLoadingState('loading');
    let i = 0;
    const words = scenario.narrative.split(' ');
    let currentSentence = '';

    const timer = setInterval(() => {
      try {
        if (i >= words.length) {
          clearInterval(timer);
          setIsComplete(true);
          setLoadingState('complete');
          return;
        }

        const word = words[i];
        // Add punctuation-aware spacing
        currentSentence += (word.match(/[.,!?]/) ? '' : ' ') + word;
        setDisplayedText(currentSentence.trim());
        i++;
      } catch (err) {
        clearInterval(timer);
        setError(err.message);
        setLoadingState('error');
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(startTypewriter, 1000);
        }
      }
    }, WORD_DELAY);

    return () => clearInterval(timer);
  }, [scenario?.narrative, retryCount]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTypewriter();
    }, INITIAL_DELAY);

    return () => clearTimeout(timeout);
  }, [startTypewriter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-900/50 border border-slate-700 rounded-xl p-8"
      aria-live="polite"
      aria-busy={!isComplete}
    >
      <div className="flex items-start gap-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-3xl relative"
        >
          {scenario.character?.avatar || '🧑‍🔬'}
          {loadingState === 'loading' && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Loader className="w-6 h-6 text-teal-500 animate-spin" />
            </div>
          )}
        </motion.div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-teal-400 mb-2">
            {scenario.character?.name || 'Scientist'}
          </h3>
          
          <div className="min-h-[120px]">
            {error ? (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300">{error}</p>
                {retryCount < MAX_RETRIES && (
                  <button
                    onClick={startTypewriter}
                    className="mt-2 px-3 py-1.5 text-sm bg-red-500/10 border border-red-500/30 rounded hover:bg-red-500/20"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed">
                {displayedText}
                {!isComplete && (
                  <span 
                    className="inline-block w-2 h-4 bg-teal-400 ml-1 animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </p>
            )}
          </div>
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
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity focus:ring-2 focus:ring-teal-500 focus:outline-none"
            aria-label="Continue to next section"
          >
            Continue to Decision
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
