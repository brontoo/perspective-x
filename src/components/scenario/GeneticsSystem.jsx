import React from 'react';

export default function GeneticsSystem() {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Genetic Probability Distribution</h3>
      
      {/* Probability Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Unaffected */}
        <div className="text-center">
          <div className="h-24 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-green-800">25%</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Unaffected</p>
        </div>
        
        {/* Carrier */}
        <div className="text-center">
          <div className="h-24 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-800">50%</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Carrier</p>
        </div>
        
        {/* Affected */}
        <div className="text-center">
          <div className="h-24 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-red-800">25%</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Affected</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          This shows the typical inheritance pattern for autosomal recessive conditions:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
          <li>25% chance of being unaffected</li>
          <li>50% chance of being a carrier</li>
          <li>25% chance of being affected</li>
        </ul>
      </div>
    </div>
  );
}
