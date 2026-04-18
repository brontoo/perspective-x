import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ScenarioVisualEngine from './ScenarioVisualEngine';
import { supabase } from '@/lib/supabaseClient';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader } from '@/components/ui/loader';
import { validateScenarioData } from '@/lib/validators';

const PHASES = {
  NARRATION: 'narration',
  DECISION: 'decision',
  IMPACT: 'impact',
  REFLECTION: 'reflection',
  COMPLETION: 'completion'
};

const MAX_RETRIES = 3;
const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

export default function UnifiedScenarioView({ scenario, theme, onComplete }) {
  const [phase, setPhase] = useState(PHASES.NARRATION);
  const [scenarioData, setScenarioData] = useState(() => validateScenarioData(scenario));
  const [studentChoice, setStudentChoice] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [narrationText, setNarrationText] = useState('');
  const [isNarrationComplete, setIsNarrationComplete] = useState(false);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);

  // Enhanced typewriter effect with error handling
  const typewriterEffect = useCallback(() => {
    if (phase !== PHASES.NARRATION) return;

    setLoadingState(LOADING_STATES.LOADING);
    let i = 0;
    const timer = setInterval(() => {
      try {
        setNarrationText(prev => {
          const nextChar = scenario.narrative.charAt(i);
          if (!nextChar) throw new Error('Invalid character in narrative');
          return prev + nextChar;
        });
        i++;
        if (i >= scenario.narrative.length) {
          clearInterval(timer);
          setIsNarrationComplete(true);
          setLoadingState(LOADING_STATES.SUCCESS);
        }
      } catch (err) {
        clearInterval(timer);
        setError(err);
        setLoadingState(LOADING_STATES.ERROR);
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(typewriterEffect, 1000);
        }
      }
    }, 30);

    return () => clearInterval(timer);
  }, [phase, scenario.narrative, retryCount]);

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
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import ScenarioNarrator from './ScenarioNarrator';
import DecisionQuestion from './DecisionQuestion';
import DecisionImpact from './DecisionImpact';
import ExitTicket from './ExitTicket';

const PHASES = {
  NARRATION: 'narration',
  DECISION: 'decision',
  IMPACT: 'impact',
  REFLECTION: 'reflection'
};

export default function UnifiedScenarioView({ scenarioId, studentId, onComplete }) {
  // State management
  const [phase, setPhase] = useState(PHASES.NARRATION);
  const [scenarioData, setScenarioData] = useState(null);
  const [studentChoice, setStudentChoice] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load scenario data
  useEffect(() => {
    const loadScenario = async () => {
      try {
        const { data } = await supabase
          .from('scenarios')
          .select('*')
          .eq('id', scenarioId)
          .single();
        
        if (data) {
          setScenarioData(data);
          setLoading(false);
        } else {
          throw new Error('Scenario not found');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadScenario();
  }, [scenarioId]);

  // Save progress to database
  const saveProgress = async (phaseData = {}) => {
    try {
      await supabase
        .from('scenario_progress')
        .upsert({
          student_id: studentId,
          scenario_id: scenarioId,
          phase,
          data: phaseData,
          updated_at: new Date().toISOString()
        });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Phase transition handlers
  const moveToDecision = (narrationData) => {
    setAnswers(prev => ({ ...prev, narration: narrationData }));
    saveProgress({ narration: narrationData });
    setPhase(PHASES.DECISION);
  };

  const moveToImpact = (decisionData) => {
    setStudentChoice(decisionData.choice);
    setAnswers(prev => ({ ...prev, decision: decisionData }));
    saveProgress({ decision: decisionData });
    setPhase(PHASES.IMPACT);
  };

  const moveToReflection = (impactData) => {
    setAnswers(prev => ({ ...prev, impact: impactData }));
    saveProgress({ impact: impactData });
    setPhase(PHASES.REFLECTION);
  };

  const handleComplete = (finalScore) => {
    setScore(finalScore);
    onComplete({
      scenarioId,
      studentId,
      score: finalScore,
      answers
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-300 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded hover:bg-red-500/20 text-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {phase === PHASES.NARRATION && (
          <ScenarioNarrator 
            scenario={scenarioData}
            onComplete={moveToDecision}
          />
        )}

        {phase === PHASES.DECISION && (
          <DecisionQuestion 
            scenario={scenarioData}
            onDecisionMade={moveToImpact}
          />
        )}

        {phase === PHASES.IMPACT && (
          <DecisionImpact 
            scenario={scenarioData}
            studentChoice={studentChoice}
            onImpactShown={moveToReflection}
          />
        )}

        {phase === PHASES.REFLECTION && (
          <ExitTicket 
            scenario={scenarioData}
            studentChoice={studentChoice}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
