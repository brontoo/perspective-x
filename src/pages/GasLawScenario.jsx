import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GasParticleSimulation from '@/components/scenario/GasParticleSimulation';
import InteractiveGauge from '@/components/scenario/InteractiveGauge';
import InteractiveEquation from '@/components/scenario/InteractiveEquation';

const SCENARIOS = {
  boyle: {
    title: 'Pressure Control at ADNOC Gas Storage',
    lawType: 'boyle',
    narration: "I am Aisha Al Mansoori. We are compressing gas at ADNOC. Initial pressure is 100 kPa, initial volume is 4.0 liters, final volume is 2.0 liters. Using Boyle's law, final pressure is 200 kPa.",
    initialValues: { P1: 100, V1: 4.0, V2: 2.0 },
    unknown: 'P2'
  },
  charles: {
    title: 'Gas Expansion in UAE Aviation',
    lawType: 'charles',
    narration: "I am Aisha Al Mansoori. At Abu Dhabi airport, heat expands gas volumes. V1 is 3.0 liters, T1 is 300 Kelvin, T2 is 600 Kelvin. Charles's law gives V2 equals 6.0 liters.",
    initialValues: { V1: 3.0, T1: 300, T2: 600 },
    unknown: 'V2'
  },
  gayLussac: {
    title: 'Pressure Build-Up in Sealed Cylinder',
    lawType: 'gayLussac',
    narration: "I am Aisha Al Mansoori. A sealed cylinder in high-heat zone has rising pressure. Initial pressure is 150 kPa, T1 is 300 K, T2 is 450 K. Gay Lussac's law gives final pressure 225 kPa.",
    initialValues: { P1: 150, T1: 300, T2: 450 },
    unknown: 'P2'
  }
};

export default function GasLawScenario() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get('scenario') || 'boyle';
  const scenario = SCENARIOS[scenarioId] || SCENARIOS.boyle;
  
  const [temperature, setTemperature] = useState(scenario.initialValues.T1 || 300);
  const [pressure, setPressure] = useState(scenario.initialValues.P1 || 100);
  const [volume, setVolume] = useState(scenario.initialValues.V1 || 4.0);

  useEffect(() => {
    // Update state when scenario changes
    setTemperature(scenario.initialValues.T1 || 300);
    setPressure(scenario.initialValues.P1 || 100);
    setVolume(scenario.initialValues.V1 || 4.0);
  }, [scenario]);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">{scenario.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Simulation Section */}
          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Gas Particle Simulation</h2>
            <GasParticleSimulation 
              temperature={temperature}
              pressure={pressure}
              volume={volume}
              lawType={scenario.lawType}
            />
          </div>

          {/* Equation Solver Section */}
          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Interactive Equation Solver</h2>
            <InteractiveEquation
              lawType={scenario.lawType}
              knownValues={scenario.initialValues}
              unknownValue={scenario.unknown}
            />
          </div>
        </div>

        {/* Gauges Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <InteractiveGauge
            label="Temperature"
            value={temperature}
            min={200}
            max={600}
            unit="K"
            color="red"
          />
          <InteractiveGauge
            label="Pressure"
            value={pressure}
            min={50}
            max={300}
            unit="kPa"
            color="blue"
          />
          <InteractiveGauge
            label="Volume"
            value={volume}
            min={1}
            max={10}
            unit="L"
            color="green"
          />
        </div>

        {/* Narration Section */}
        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Scenario Narration</h2>
          <p className="text-slate-300 leading-relaxed">{scenario.narration}</p>
        </div>
      </div>
    </div>
  );
}
