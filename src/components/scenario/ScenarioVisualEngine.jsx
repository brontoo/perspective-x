import React from 'react';
import WaterSystem from './WaterSystem';
import ReactorSystem from './ReactorSystem';
import GeneticsSystem from './GeneticsSystem';

export default function ScenarioVisualEngine({ type, data = {} }) {
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
}
