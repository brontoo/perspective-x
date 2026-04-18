import React, { useState, useEffect } from 'react';

export default function ReactorSystem({ initialTemp = 300, maxTemp = 1000 }) {
  const [temperature, setTemperature] = useState(initialTemp);
  const [warningLevel, setWarningLevel] = useState(0);

  useEffect(() => {
    const tempInterval = setInterval(() => {
      setTemperature(prev => {
        const change = Math.random() * 10 - 5; // Random fluctuation
        return Math.max(300, Math.min(maxTemp, prev + change));
      });
    }, 1000);

    return () => clearInterval(tempInterval);
  }, [maxTemp]);

  useEffect(() => {
    if (temperature > 900) {
      setWarningLevel(3);
    } else if (temperature > 750) {
      setWarningLevel(2);
    } else if (temperature > 600) {
      setWarningLevel(1);
    } else {
      setWarningLevel(0);
    }
  }, [temperature]);

  const getWarningColor = () => {
    switch (warningLevel) {
      case 3: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 1: return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      {/* Temperature Display */}
      <div className="mb-4">
        <div className="flex justify-between text-sm font-mono mb-1">
          <span className="text-gray-400">REACTOR TEMP</span>
          <span className="text-gray-300">{Math.round(temperature)}°C</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getWarningColor()} transition-all`}
            style={{ width: `${(temperature / maxTemp) * 100}%` }}
          />
        </div>
      </div>

      {/* Warning System */}
      {warningLevel > 0 && (
        <div className={`p-3 rounded ${getWarningColor()}/10 border ${getWarningColor()}/30`}>
          <p className="text-sm font-mono text-gray-300">
            {warningLevel === 3 && 'CRITICAL: Reactor temperature exceeding safe limits'}
            {warningLevel === 2 && 'WARNING: Reactor temperature approaching critical'}
            {warningLevel === 1 && 'CAUTION: Reactor temperature rising'}
          </p>
        </div>
      )}

      {/* System Status */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 rounded bg-gray-800/30 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">COOLANT PRESSURE</p>
          <p className="text-sm font-mono text-gray-300">4.2 MPa</p>
        </div>
        <div className="p-3 rounded bg-gray-800/30 border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">POWER OUTPUT</p>
          <p className="text-sm font-mono text-gray-300">850 MW</p>
        </div>
      </div>
    </div>
  );
}
