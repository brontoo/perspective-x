import React from 'react';
import WaterSystem from './WaterSystem';

export default function ScenarioVisualEngine({ type, data }) {
    switch (type) {
        case 'water':
            return <WaterSystem chloride={data.chloride} nitrate={data.nitrate} />;
        case 'reactor':
            return <div>Reactor Visual Placeholder</div>;
        case 'genetics':
            return <div>Genetics Visual Placeholder</div>;
        default:
            return <div>Unknown Type</div>;
    }
}
