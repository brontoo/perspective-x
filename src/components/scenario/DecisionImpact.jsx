import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toMetricMap } from './scenarioHelpers';
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  BarChart2,
  RefreshCw
} from 'lucide-react';

function deriveImpactType({ consequence, decisionOption, studentChoice }) {
  if (consequence?.impactType) {
    return consequence.impactType;
  }

  if (decisionOption?.correct === true || studentChoice === 'correct') {
    return 'positive';
  }

  if (decisionOption?.ethical === 'inefficient' || studentChoice === 'too_high') {
    return 'neutral';
  }

  return 'negative';
}

function normalizeConsequence(scenario, studentChoice, directConsequence) {
  if (directConsequence) {
    return directConsequence;
  }

  const consequences = scenario?.consequences;
  if (!consequences) {
    return null;
  }

  if (Array.isArray(consequences)) {
    return consequences.find((item) => item.id === studentChoice) || consequences[0] || null;
  }

  return consequences[studentChoice] || Object.values(consequences)[0] || null;
}

function formatMetricValue(value) {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return String(value);
}

function createImpactAnnouncement(impactType, consequence) {
  const prefix = impactType === 'positive'
    ? 'Success.'
    : impactType === 'negative'
      ? 'Failure.'
      : 'Caution.';

  return [prefix, consequence?.message || consequence?.outcome || 'Decision analysis ready.'].join(' ');
}

export default function DecisionImpact({ 
  scenario, 
  studentChoice, 
  consequence: directConsequence,
  decisionOption,
  baselineData,
  onImpactShown,
  onContinueToExit,
  onRetryScene1,
  onReplayVideo,
  isTeacher = false,
  theme = {}
}) {
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  // Get consequence data based on student choice
  const consequence = normalizeConsequence(scenario, studentChoice, directConsequence);
  
  // Determine impact type (positive/negative/neutral)
  const impactType = deriveImpactType({ consequence, decisionOption, studentChoice });

  // Data comparison
  const beforeData = toMetricMap(baselineData || scenario?.baselineData || scenario?.data?.baselineData);
  const afterData = toMetricMap(consequence?.newData);

  const handleContinue = () => {
    if (onContinueToExit) {
      onContinueToExit();
      return;
    }

    onImpactShown?.(consequence);
  };

  // Color scheme based on impact
  const colors = {
    positive: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: <CheckCircle className="w-6 h-6 text-emerald-500" />
    },
    negative: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: <XCircle className="w-6 h-6 text-red-500" />
    },
    neutral: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />
    }
  };

  const currentColor = colors[impactType];

  useEffect(() => {
    if (typeof window === 'undefined' || !(window.speechSynthesis && window.SpeechSynthesisUtterance) || !consequence) {
      return undefined;
    }

    const utterance = new SpeechSynthesisUtterance(createImpactAnnouncement(impactType, consequence));
    utterance.rate = impactType === 'negative' ? 0.92 : 0.98;
    utterance.pitch = impactType === 'positive' ? 1.08 : impactType === 'negative' ? 0.88 : 0.96;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [impactType, consequence]);

  // Animate through steps
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      } else if (!isComplete) {
        setIsComplete(true);
        if (!onContinueToExit) {
          onImpactShown?.(consequence);
        }
      }
    }, currentStep === 0 ? 1000 : 2000);

    return () => clearTimeout(timer);
  }, [currentStep, isComplete, onContinueToExit, onImpactShown, consequence]);

  // Show before/after after step 1
  useEffect(() => {
    if (currentStep >= 1) {
      setShowBeforeAfter(true);
    }
  }, [currentStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <Card className={`border ${currentColor.border} ${currentColor.bg} p-8`}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {currentColor.icon}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {consequence?.title || 'Impact Analysis'}
            </h2>
            <p className={`text-sm ${currentColor.text}`}>
              {impactType === 'positive' ? 'Positive Outcome' : 
               impactType === 'negative' ? 'Negative Consequence' : 'Neutral Impact'}
            </p>
          </div>
        </div>

        {/* Consequence Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <p className="text-slate-300 text-lg leading-relaxed">
            {consequence?.message || 'Your decision had an impact on the scenario.'}
          </p>
        </motion.div>

        {/* Before/After Comparison */}
        {showBeforeAfter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <Card className="border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-slate-400" />
                Before Decision
              </h3>
              <div className="space-y-3">
                {Object.keys(beforeData).length === 0 && (
                  <p className="text-slate-500 text-sm">No baseline data available.</p>
                )}
                {Object.entries(beforeData).map(([key, value]) => (
                  <div key={`before-${key}`} className="flex justify-between items-center">
                    <span className="text-slate-400">{key}:</span>
                    <span className="font-mono text-white">{formatMetricValue(value)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={`border ${currentColor.border} ${currentColor.bg} p-6`}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-slate-400" />
                After Decision
              </h3>
              <div className="space-y-3">
                {Object.keys(afterData).length === 0 && (
                  <p className="text-slate-500 text-sm">No post-decision data available.</p>
                )}
                {Object.entries(afterData).map(([key, value]) => (
                  <div key={`after-${key}`} className="flex justify-between items-center">
                    <span className="text-slate-400">{key}:</span>
                    <span className="font-mono text-white">{formatMetricValue(value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Follow-up Question */}
        {currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              Reflection Question:
            </h3>
            <p className="text-slate-300">
              {consequence?.followUpQuestion || 
               'How might you approach this differently next time?'}
            </p>
          </motion.div>
        )}

        {/* Continue Button */}
        {currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleContinue}
              className={`bg-gradient-to-r ${impactType === 'positive' ? 
                'from-emerald-500 to-teal-500' : 
                impactType === 'negative' ? 
                'from-red-500 to-rose-500' : 
                'from-amber-500 to-orange-500'}`}
            >
              Continue
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        )}

        {isTeacher && (onRetryScene1 || onReplayVideo) && (
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {onRetryScene1 && (
              <Button variant="outline" onClick={onRetryScene1} className="border-slate-600 text-slate-200">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry From Scene 1
              </Button>
            )}
            {onReplayVideo && (
              <Button variant="outline" onClick={onReplayVideo} className="border-slate-600 text-slate-200">
                Replay Intro Video
              </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
