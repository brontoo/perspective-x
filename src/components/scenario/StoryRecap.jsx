import React from 'react';
import { Button } from '@/components/ui/button';

/**
 * StoryRecap component displays a brief recap of the scenario before the student proceeds to their role.
 * It pulls data from the `scenario` prop.
 * Expected `scenario` shape includes:
 *  - `title`: mission title
 *  - `context`: story narrative (use first sentence as summary)
 *  - `scienceFocus`: array of key evidence topics
 *  - `roleQuote` or `role`: brief task description
 */
export default function StoryRecap({ scenario, onContinue, theme }) {
  // Helper to extract a short summary from the context
  const summary = scenario.context ? scenario.context.split('. ')[0] + '.' : '';
  // Use scienceFocus array if available for key points
  const keyPoints = Array.isArray(scenario.scienceFocus) ? scenario.scienceFocus.slice(0, 4) : [];
  const task = scenario.roleQuote || scenario.role || '';

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-2 text-slate-800">Story Recap</h2>
      <p className="text-sm text-slate-700 mb-3"><strong>What happened?</strong> {summary}</p>
      {keyPoints.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-700 mb-1">What matters?</p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {keyPoints.map((pt, idx) => (
              <li key={idx}>{pt}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-slate-700 mb-4"><strong>Your task:</strong> {task}</p>
      <Button variant="default" size="default" onClick={onContinue} className="bg-[#14b8a6] hover:bg-[#0f9d8a] text-white">
        Continue to Your Role
      </Button>
    </div>
  );
}
