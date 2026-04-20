import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
  const [feedback, setFeedback] = useState(null);
  
  // Get the formula and calculate the correct answer
  const getFormulaAndAnswer = () => {
    const { P1, V1, V2, T1, T2 } = knownValues;
    
    switch(lawType) {
      case 'boyle':
        return {
          formula: 'P₂ = (P₁ × V₁) / V₂',
          answer: ((P1 * V1) / V2).toFixed(1)
        };
      case 'charles':
        return {
          formula: 'V₂ = (V₁ × T₂) / T₁',
          answer: ((V1 * T2) / T1).toFixed(1)
        };
      case 'gayLussac':
        return {
          formula: 'P₂ = (P₁ × T₂) / T₁',
          answer: ((P1 * T2) / T1).toFixed(1)
        };
      default:
        return { formula: '', answer: 0 };
    }
  };
  
  const { formula, answer } = getFormulaAndAnswer();
  
  const handleCheckAnswer = () => {
    const numericAnswer = parseFloat(userAnswer);
    if (isNaN(numericAnswer)) {
      setFeedback({
        type: 'error',
        message: `❌ Please enter a valid number`
      });
      return;
    }
    
    if (Math.abs(numericAnswer - answer) <= 0.1) {
      setFeedback({
        type: 'success',
        message: `✅ Correct! ${unknownValue} = ${answer}`
      });
    } else {
      setFeedback({
        type: 'error',
        message: `❌ Try again! Hint: Use the formula ${formula}`
      });
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
      {/* Formula Display */}
      <div className="text-2xl font-mono font-bold text-indigo-700 mb-6">
        {formula}
      </div>
      
      {/* Known Values Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(knownValues).map(([key, value]) => (
          <div key={key} className="bg-white rounded p-3 text-center">
            <div className="text-sm text-gray-500">{key}</div>
            <div className="text-lg font-bold text-indigo-700">{value}</div>
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
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 flex-1"
          aria-label={`Enter your answer for ${unknownValue}`}
        />
        <button
          onClick={handleCheckAnswer}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Check
        </button>
      </div>
      
      {/* Feedback Message */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            feedback.type === 'success' 
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {feedback.message}
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveEquation;
