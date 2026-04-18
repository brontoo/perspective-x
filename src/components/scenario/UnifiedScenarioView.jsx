import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ScenarioVisualEngine from './ScenarioVisualEngine';
import { supabase } from '@/lib/supabaseClient';

const PHASES = {
  NARRATION: 'narration',
  DECISION: 'decision',
  IMPACT: 'impact',
  REFLECTION: 'reflection'
};

export default function UnifiedScenarioView({ scenario, theme, onComplete }) {
  const [phase, setPhase] = useState(PHASES.NARRATION);
  const [scenarioData, setScenarioData] = useState(scenario);
  const [studentChoice, setStudentChoice] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [narrationText, setNarrationText] = useState('');
  const [isNarrationComplete, setIsNarrationComplete] = useState(false);

  // Typewriter effect for narration
  useEffect(() => {
    if (phase !== PHASES.NARRATION) return;

    let i = 0;
    const timer = setInterval(() => {
      setNarrationText(prev => prev + scenario.narrative.charAt(i));
      i++;
      if (i >= scenario.narrative.length) {
        clearInterval(timer);
        setIsNarrationComplete(true);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [phase, scenario.narrative]);

  // Save phase progress to database
  const savePhaseProgress = async (phaseName, phaseData) => {
    try {
      await supabase
        .from('scenario_progress')
        .upsert({
          phase: phaseName,
          data: phaseData,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving phase progress:', error);
    }
  };

  // Phase transition handler
  const handlePhaseTransition = (nextPhase, phaseData = {}) => {
    savePhaseProgress(nextPhase, phaseData);
    setPhase(nextPhase);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {/* Narration Phase */}
        {phase === PHASES.NARRATION && (
          <motion.div
            key="narration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <ScenarioVisualEngine 
              type="water"
              data={{ chloride: 60, nitrate: 52 }}
            />
            
            <Card className={`border ${theme.border} bg-slate-900/50 p-8`}>
              <h3 className="text-2xl font-bold text-white mb-4">Scenario Introduction</h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                {narrationText}
              </p>
              {isNarrationComplete && (
                <Button
                  onClick={() => handlePhaseTransition(PHASES.DECISION)}
                  className={`mt-6 bg-gradient-to-r ${theme.accent}`}
                >
                  Continue to Decision
                </Button>
              )}
            </Card>
          </motion.div>
        )}

        {/* Decision Phase */}
        {phase === PHASES.DECISION && (
          <motion.div
            key="decision"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Decision UI will go here */}
          </motion.div>
        )}

        {/* Impact Phase */}
        {phase === PHASES.IMPACT && (
          <motion.div
            key="impact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Impact UI will go here */}
          </motion.div>
        )}

        {/* Reflection Phase */}
        {phase === PHASES.REFLECTION && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Reflection UI will go here */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
