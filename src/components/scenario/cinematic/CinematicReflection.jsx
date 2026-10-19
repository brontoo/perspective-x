import { useState } from "react";
export default function CinematicReflection({
  scenario,
  responses,
  onDraft,
  onComplete,
}) {
  const [text, setText] = useState(responses.reflectionDraft?.text || ""),
    [evidenceId, setEvidenceId] = useState(
      responses.reflectionDraft?.evidenceId || "",
    );
  const consequence =
    scenario.scenes[2].consequences[responses.scene2?.consequence];
  function update(patch) {
    const next = { text, evidenceId, ...patch };
    setText(next.text);
    setEvidenceId(next.evidenceId);
    onDraft(next);
  }
  return (
    <div className="cm-reflection">
      <header className="im-stage-header">
        <p className="im-eyebrow">Chapter 4 · See What Happens!</p>
        <h2>
          {consequence?.rating === "strong"
            ? "Evidence changed the outcome."
            : "The consequence brings a new clue."}
        </h2>
      </header>
      {consequence && (
        <section className="im-instrument cm-outcome-feedback">
          <span className="cm-kicker">
            Your confirmed decision · {responses.scene2.selectedOption}
          </span>
          <h3>{consequence.outcome}</h3>
          <p>{consequence.message}</p>
          <p className="im-reading">{consequence.newData}</p>
          {scenario.id === "ionic_dessert_mystery" && (
            <details>
              <summary>Review the compound evidence</summary>
              <p>
                In this candidate set, A is sugar (sucrose), B is sodium
                hydrogen carbonate, and C is sodium chloride. A contributes few
                mobile ions. The two salts conduct; B’s alkaline pH and carbon
                dioxide signal distinguish it. These tests support an identity
                hypothesis, not food suitability. Your original hypothesis and
                confirmed decision remain in the notebook.
              </p>
            </details>
          )}
        </section>
      )}
      <form
        className="im-instrument"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim().length >= 40 && evidenceId)
            onComplete(text, evidenceId);
        }}
      >
        <h3>Close the loop in your notebook.</h3>
        <label>
          Observation supporting your reflection
          <select
            required
            value={evidenceId}
            onChange={(e) => update({ evidenceId: e.target.value })}
          >
            <option value="">Choose an observation you collected</option>
            {(responses.investigation?.evidence || []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}: {e.observation}
              </option>
            ))}
          </select>
        </label>
        <label>
          What did the consequence teach you about your evidence and decision?
          <textarea
            rows="4"
            minLength={40}
            maxLength={4000}
            required
            value={text}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Connect your selected observation to the outcome. Explain what you would retain or change next time."
          />
        </label>
        <p>At least 40 characters, linked to one collected observation.</p>
        <button disabled={text.trim().length < 40 || !evidenceId}>
          Continue to Prove Your Expertise →
        </button>
      </form>
    </div>
  );
}
