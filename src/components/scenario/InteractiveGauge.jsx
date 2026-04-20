import React from 'react';
import { motion } from 'framer-motion';

/**
 * InteractiveGauge - An animated gauge component for displaying scientific measurements
 * 
 * @param {Object} props - Component properties
 * @param {string} props.label - Display name of the measurement
 * @param {number} props.value - Current value to display
 * @param {number} props.min - Minimum value of the range
 * @param {number} props.max - Maximum value of the range
 * @param {string} props.unit - Unit of measurement
 * @param {string} props.color - Color theme ('blue', 'red', 'green', 'orange')
 * @returns {JSX.Element} Interactive gauge component
 */
const InteractiveGauge = ({ 
  label, 
  value, 
  min = 0, 
  max = 100, 
  unit = '', 
  color = 'blue' 
}) => {
  // Calculate percentage for progress bar
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Get gradient class based on color prop
  const getGradientClass = () => {
    switch(color) {
      case 'red':
        return 'from-red-500 to-red-600';
      case 'green':
        return 'from-green-500 to-green-600';
      case 'orange':
        return 'from-orange-500 to-orange-600';
      default: // blue
        return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-lg"
      aria-label={`${label} gauge showing ${value} ${unit}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <motion.span
          className="text-lg font-bold text-gray-800"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          key={value}
        >
          {value} {unit}
        </motion.span>
      </div>

      <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-1">
        <motion.div
          className={`h-full bg-gradient-to-r ${getGradientClass()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-xs text-gray-500">{min} {unit}</span>
        <span className="text-xs text-gray-500">{max} {unit}</span>
      </div>
    </div>
  );
};

export default InteractiveGauge;
