import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      consequence: selectedOption.consequence
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
          <div className="p-2 hud-panel border border-[var(--lx-glass-border-sub)]" style={{ borderRadius: '8px' }}>
            <AlertCircle className="w-5 h-5 text-[var(--lx-accent)]" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--lx-accent)]">
            Decision Point
          </h3>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
          {scenario.question}
        </h2>
        <p className="text-[var(--lx-text-muted)] text-lg">
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
              className={`text-left p-6 hud-panel border transition-all ${
                selectedOption?.id === option.id
                  ? 'border-[var(--lx-accent)] shadow-[var(--lx-shadow-glow)]'
                  : 'border-[var(--lx-glass-border-sub)] hover:border-[var(--lx-accent)]/50'
              } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ borderRadius: '12px' }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 flex items-center justify-center text-xl font-bold shrink-0 ${
                  selectedOption?.id === option.id
                    ? 'bg-[var(--lx-accent)] text-white'
                    : 'bg-[var(--lx-dark-glass)] text-[var(--lx-text-muted)]'
                }`} style={{ borderRadius: '8px' }}>
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
                        className="glass-badge flex items-center gap-1 px-2.5 py-1 text-xs font-medium"
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
            <div className="hud-panel border border-[var(--lx-glass-border-sub)] p-8" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[var(--lx-dark-glass)] border border-[var(--lx-glass-border-sub)]" style={{ borderRadius: '8px' }}>
                  <CheckCircle className="w-5 h-5 text-[var(--lx-accent)]" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--lx-accent)]">
                  Scientific Reasoning
                </h3>
              </div>

              <p className="text-[var(--lx-text-inv)] text-lg mb-6">
                I chose Option {String.fromCharCode(65 + scenario.options.findIndex(o => o.id === selectedOption.id))} because...
              </p>

              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain your scientific reasoning (minimum 15 characters)..."
                className="glass-input-dark w-full min-h-[120px] text-base resize-none"
                disabled={isSubmitted}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedOption || justification.length < 15}
              className={`w-full liquid-btn-accent py-3.5 text-sm font-bold tracking-widest uppercase ${(!selectedOption || justification.length < 15) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitted ? 'Decision Submitted' : 'Submit Decision'}
            </button>

            {selectedOption && justification.length < 15 && (
              <p className="text-[var(--lx-warning)] text-sm text-center">
                Please provide a more detailed justification (minimum 15 characters required)
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
