import React, { useState } from 'react';

/**
 * InteractiveEquation - An interactive gas law equation solver component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.lawType - Type of gas law ('boyle', 'charles', 'gayLussac')
 * @param {Object} props.knownValues - Known values for the equation
 * @param {string} props.unknownValue - The unknown variable to solve for
 * @returns {JSX.Element} Interactive equation solver component
 */
const InteractiveEquation = ({ lawType, knownValues, unknownValue }) => {
  const [userAnswer, setUserAnswer] = useState('');

  const getFormula = () => {
    switch(lawType) {
      case 'boyle': return 'P₂ = (P₁ × V₁) / V₂';
      case 'charles': return 'V₂ = (V₁ × T₂) / T₁';
      case 'gayLussac': return 'P₂ = (P₁ × T₂) / T₁';
      default: return '';
    }
  };

  const formula = getFormula();
  
  return (
    <div className="glass-card p-6">
      {/* Formula Display */}
      <div className="text-2xl font-mono font-bold text-[var(--lx-accent)] mb-6">
        {formula}
      </div>

      {/* Known Values Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(knownValues).map(([key, value]) => (
          <div key={key} className="glass-panel p-3 text-center" style={{ borderRadius: '4px' }}>
            <div className="text-sm text-[var(--lx-text-muted)]">{key}</div>
            <div className="text-lg font-bold text-[var(--lx-accent)]">{value}</div>
          </div>
        ))}
      </div>

      {/* Input and Check */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder={`Enter ${unknownValue}`}
          className="glass-input flex-1"
          aria-label={`Enter your answer for ${unknownValue}`}
        />
      </div>
    </div>
  );
};

export default InteractiveEquation;
