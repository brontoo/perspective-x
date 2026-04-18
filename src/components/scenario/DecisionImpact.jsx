import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  BarChart2,
  RefreshCw
} from 'lucide-react';

export default function DecisionImpact({ 
  scenario, 
  studentChoice, 
  onImpactShown 
}) {
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  // Get consequence data based on student choice
  const consequence = scenario.consequences?.find(c => c.id === studentChoice) || 
    scenario.consequences?.[0];
  
  // Determine impact type (positive/negative/neutral)
  const impactType = consequence?.impactType || 'neutral';

  // Data comparison
  const beforeData = scenario.baselineData || {};
  const afterData = consequence?.newData || {};

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

  // Animate through steps
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      } else if (!isComplete) {
        setIsComplete(true);
        onImpactShown();
      }
    }, currentStep === 0 ? 1000 : 2000);

    return () => clearTimeout(timer);
  }, [currentStep, isComplete, onImpactShown]);

  // Show before/after after step 1
  useEffect(() => {
    if (currentStep >= 1) {
      setShowBeforeAfter(true);
    }
  }, [currentStep]);

  // Animated number component
  const AnimatedNumber = ({ value, duration = 1 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = value;
      const increment = end / (duration * 60); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 1000/60);

      return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{displayValue}</span>;
  };

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
                {Object.entries(beforeData).map(([key, value]) => (
                  <div key={`before-${key}`} className="flex justify-between items-center">
                    <span className="text-slate-400">{key}:</span>
                    <span className="font-mono text-white">
                      <AnimatedNumber value={value} />
                    </span>
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
                {Object.entries(afterData).map(([key, value]) => (
                  <div key={`after-${key}`} className="flex justify-between items-center">
                    <span className="text-slate-400">{key}:</span>
                    <span className="font-mono text-white">
                      <AnimatedNumber value={value} />
                    </span>
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
              onClick={() => onImpactShown()}
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
      </Card>
    </motion.div>
  );
}
