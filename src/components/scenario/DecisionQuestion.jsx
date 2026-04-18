import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const THINK_TIME = 120; // seconds

export default function DecisionQuestion({ scenario, onDecisionMade, theme }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [justification, setJustification] = useState('');
  const [showThinkTimer, setShowThinkTimer] = useState(true);
  const [thinkTime, setThinkTime] = useState(THINK_TIME);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (showThinkTimer && thinkTime > 0) {
      const timer = setTimeout(() => setThinkTime(thinkTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (thinkTime === 0) {
      setShowThinkTimer(false);
    }
  }, [showThinkTimer, thinkTime]);

  const handleSelect = (option) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption || justification.length < 15) return;
    
    setIsSubmitted(true);
    onDecisionMade({
      choice: selectedOption.id,
      justification: justification,
      isCorrect: selectedOption.correct
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Question */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
          {scenario.question}
        </h2>
        <p className={`text-base ${theme.text} font-medium`}>
          Select the best option below:
        </p>
      </div>

      {/* Think Timer */}
      {showThinkTimer && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-amber-200 text-base font-medium">
              Critical Thinking Phase: <span className="font-bold text-amber-400">{thinkTime}s</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Options List */}
      <div className="space-y-4">
        {scenario.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            disabled={isSubmitted}
            className={`w-full text-left p-5 rounded-xl border transition-all ${
              selectedOption?.id === option.id
                ? `border-2 ${theme.border} bg-slate-800/50` 
                : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/30'
            } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <p className="font-medium text-white text-lg leading-snug">{option.text}</p>
          </button>
        ))}
      </div>

      {/* Justification */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <Card className={`border ${theme.border} bg-slate-900/50 p-8`}>
            <h4 className="font-bold text-white text-xl mb-4">Scientific Justification</h4>
            <p className="text-slate-400 text-base mb-4">
              {scenario.justificationStarter || 'Explain your reasoning:'}
            </p>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Enter your scientific reasoning..."
              className="bg-slate-950/50 border-slate-700 text-white min-h-[120px] text-base"
              disabled={isSubmitted}
            />
          </Card>

          {/* Feedback */}
          {isSubmitted && (
            <div className={`p-5 rounded-xl border ${
              selectedOption.correct 
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' 
                : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
            }`}>
              <p className="text-base leading-relaxed">{selectedOption.feedback}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="pt-6 space-y-4">
        {!isSubmitted ? (
          <>
            <Button
              onClick={handleSubmit}
              disabled={!selectedOption || justification.length < 15}
              size="lg"
              className={`w-full bg-gradient-to-r ${theme.accent}`}
            >
              Confirm Decision
            </Button>

            {selectedOption && justification.length < 15 && (
              <p className="text-amber-500/80 text-sm text-center">
                Please provide a more detailed justification (min 15 characters)
              </p>
            )}
          </>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="w-full border-dashed border-purple-500/50 text-purple-400"
            onClick={() => window.location.reload()}
          >
            Start New Scenario
          </Button>
        )}
      </div>
    </motion.div>
  );
}
