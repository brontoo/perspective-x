import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  AlertCircle,
  Zap,
  Shield,
  DollarSign,
  Leaf,
  FlaskConical,
  Gauge,
  HardHat
} from 'lucide-react';

const OPTION_ICONS = {
  fast: <Zap className="w-4 h-4" />,
  safe: <Shield className="w-4 h-4" />,
  economic: <DollarSign className="w-4 h-4" />,
  eco: <Leaf className="w-4 h-4" />,
  technical: <FlaskConical className="w-4 h-4" />,
  efficient: <Gauge className="w-4 h-4" />,
  practical: <HardHat className="w-4 h-4" />
};

export default function DecisionQuestion({ scenario, onDecisionMade, theme }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [justification, setJustification] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      {/* Question Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg bg-slate-800 ${theme.text}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>
            Decision Point
          </h3>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
          {scenario.question}
        </h2>
        <p className="text-slate-400 text-lg">
          Analyze the options and select the most scientifically sound approach:
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenario.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index);
          return (
            <motion.button
              key={option.id}
              onClick={() => handleSelect(option)}
              disabled={isSubmitted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`text-left p-6 rounded-xl border transition-all ${
                selectedOption?.id === option.id
                  ? `border-2 ${theme.border} bg-slate-800/50 shadow-lg ${theme.glow}`
                  : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/30'
              } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold ${
                  selectedOption?.id === option.id 
                    ? `bg-gradient-to-br ${theme.accent} text-white`
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {optionLetter}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {option.text}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {option.tags?.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/50 border border-slate-700 flex items-center gap-1"
                      >
                        {OPTION_ICONS[tag.toLowerCase()] || <CheckCircle className="w-3 h-3" />}
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Justification Section */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className={`border ${theme.border} bg-slate-900/50 p-8`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-slate-800 ${theme.text}`}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>
                  Scientific Reasoning
                </h3>
              </div>
              
              <p className="text-slate-300 text-lg mb-6">
                I chose Option {String.fromCharCode(65 + scenario.options.findIndex(o => o.id === selectedOption.id))} because...
              </p>
              
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain your scientific reasoning (minimum 15 characters)..."
                className="bg-slate-950/50 border-slate-700 text-white min-h-[120px] text-base"
                disabled={isSubmitted}
              />
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={!selectedOption || justification.length < 15}
              size="lg"
              className={`w-full bg-gradient-to-r ${theme.accent} shadow-lg`}
            >
              {isSubmitted ? 'Decision Submitted' : 'Submit Decision'}
            </Button>

            {selectedOption && justification.length < 15 && (
              <p className="text-amber-500/80 text-sm text-center">
                Please provide a more detailed justification (minimum 15 characters required)
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
