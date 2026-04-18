import React from 'react';
import { motion } from 'framer-motion';
import WaterSystem from './WaterSystem';
import ReactorSystem from './ReactorSystem';
import GeneticsSystem from './GeneticsSystem';

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
                    default:
                        return <div className="text-slate-400 p-4">No visual available</div>;
                }
            })()}
        </motion.div>
    );
}
