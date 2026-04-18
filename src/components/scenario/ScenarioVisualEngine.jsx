import React from 'react';
import { motion } from 'framer-motion';
import WaterSystem from './WaterSystem';
import ReactorSystem from './ReactorSystem';
import GeneticsSystem from './GeneticsSystem';

// Component for energy scenarios
const EnergySystem = () => (
  <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded bg-gray-800/40 border border-gray-700">
        <p className="text-xs text-gray-400 mb-1">POWER GENERATION</p>
        <p className="text-sm font-mono text-gray-300">1.2 GW</p>
      </div>
      <div className="p-4 rounded bg-gray-800/40 border border-gray-700">
        <p className="text-xs text-gray-400 mb-1">EFFICIENCY</p>
        <p className="text-sm font-mono text-gray-300">78.5%</p>
      </div>
    </div>
  </div>
);

// Component for gas scenarios
const GasSystem = () => (
  <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
    <div className="mb-4">
      <p className="text-xs text-gray-400 mb-1">GAS PRESSURE</p>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: '65%' }} />
      </div>
    </div>
  </div>
);

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

export default function ScenarioVisualEngine({ type, data = {} }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ duration: 0.2, ease: 'easeOut' }}
        >
            {(() => {
                switch (type) {
                    case 'water':
                        return <WaterSystem chloride={data.chloride} nitrate={data.nitrate} />;
                    case 'reactor':
                        return <ReactorSystem initialTemp={data.temperature} maxTemp={data.maxTemp} />;
                    case 'genetics':
                        return <GeneticsSystem />;
                    case 'energy':
                        return <EnergySystem />;
                    case 'gas':
                        return <GasSystem />;
                    default:
                        return <div className="text-slate-400 p-4">No visual available</div>;
                }
            })()}
        </motion.div>
    );
}
