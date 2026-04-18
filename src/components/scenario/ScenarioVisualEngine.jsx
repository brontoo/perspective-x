import React from 'react';

export default function ScenarioVisualEngine({ type, data }) {
    switch (type) {
        case 'water':
            return <div>Water Visual Placeholder</div>;
        case 'reactor':
            return <div>Reactor Visual Placeholder</div>;
        case 'genetics':
            return <div>Genetics Visual Placeholder</div>;
        default:
            return <div>Unknown Type</div>;
    }
}
