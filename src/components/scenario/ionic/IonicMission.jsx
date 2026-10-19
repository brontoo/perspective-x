import { useState } from "react";
import { gradeIonic } from "@/data/ionicScience.mjs";
// Shared scientific decision and assessment activities rendered inside the cinematic stage.
export function MakeTheCall({
  scenario,
  responses,
  onComplete,
  isTeacher,
  onDraft,
}) {
  const [choice, setChoice] = useState(responses.decisionDraft?.choice || ""),
    [reason, setReason] = useState(responses.decisionDraft?.reason || ""),
    [cited, setCited] = useState(responses.decisionDraft?.cited || []);
  function update(patch) {
    const next = { choice, reason, cited, ...patch };
    setChoice(next.choice);
    setReason(next.reason);
    setCited(next.cited);
    onDraft?.(next);
  }
  const evidence = responses.investigation?.evidence || [];
  const ready =
    !!choice &&
    (isTeacher || (reason.trim().length >= 60 && cited.length >= 2));
  function submit(e) {
    e.preventDefault();
    if (!ready) return;
    const option = scenario.scenes[1].options.find((o) => o.id === choice);
    onComplete({
      selectedOption: choice,
      consequence: option.consequence,
      justification: reason,
      evidenceCitations: cited,
      formativeFeedback:
        "Review the observed consequences, then reflect on your evidence and uncertainty.",
    });
  }
  return (
    <form onSubmit={submit}>
      <header className="im-stage-header">
        <p className="im-eyebrow">Chapter 3 · Make the Call</p>
        <h2>The team is waiting for your recommendation.</h2>
        <p>{scenario.scenes[1].question}</p>
      </header>
      <fieldset className="im-decisions">
        <legend>Choose one professional response</legend>
        {scenario.scenes[1].options.map((o) => (
          <label
            key={o.id}
            className={`im-decision ${choice === o.id ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name="professional-decision"
              value={o.id}
              checked={choice === o.id}
              onChange={() => update({ choice: o.id })}
            />
            <span className="im-choice-letter">{o.id}</span>
            <span>{o.text}</span>
          </label>
        ))}
      </fieldset>
      <section className="im-instrument">
        <fieldset className="im-citations">
          <legend>
            Cite at least two observations from your investigation
          </legend>
          {evidence.map((e) => (
            <label key={e.id}>
              <input
                type="checkbox"
                checked={cited.includes(e.id)}
                onChange={(event) =>
                  update({
                    cited: event.target.checked
                      ? [...cited, e.id]
                      : cited.filter((id) => id !== e.id),
                  })
                }
              />
              <span>
                <strong>{e.label}</strong> — {e.observation}
              </span>
            </label>
          ))}
        </fieldset>
        {!evidence.length && (
          <p>
            {isTeacher
              ? "Teacher stage preview: no investigation evidence has been collected."
              : "Return to the investigation to collect evidence before making your call."}
          </p>
        )}
        <label>
          Your evidence-based justification
          <textarea
            rows="5"
            minLength={60}
            maxLength={4000}
            required={!isTeacher}
            value={reason}
            onChange={(e) => update({ reason: e.target.value })}
            placeholder="Explain what your cited results support, why this response follows, and one remaining uncertainty."
          />
        </label>
        <p>
          {reason.trim().length}/60 minimum characters · {cited.length}/2
          observations cited
        </p>
        <button type="submit" disabled={!ready}>
          Commit my decision →
        </button>
      </section>
    </form>
  );
}
export function Assessment({ scenario, responses, onDraft, onComplete }) {
  const questions = scenario.exitTicket.mcqs;
  const [answers, setAnswers] = useState(responses.assessmentDraft || {}),
    [result, setResult] = useState(null),
    [committed, setCommitted] = useState(false);
  const ready = questions.every((q) => answers[q.id]);
  function choose(id, value) {
    if (result) return;
    const next = { ...answers, [id]: value };
    setAnswers(next);
    onDraft(next);
  }
  function assess(e) {
    e.preventDefault();
    if (ready && !result) setResult(gradeIonic(questions, answers));
  }
  return (
    <form onSubmit={assess}>
      <header className="im-stage-header">
        <p className="im-eyebrow">Chapter 5 · Prove Your Expertise</p>
        <h2>Your evidence. Your expertise.</h2>
        <p>
          Five questions · At least 4 correct (80%) to pass · Feedback appears
          after submission.
        </p>
      </header>
      {questions.map((q, index) => (
        <fieldset key={q.id} className="im-assessment" disabled={!!result}>
          <legend>
            {index + 1}. {q.question}
          </legend>
          {q.options.map((o) => (
            <label key={o.id}>
              <input
                type="radio"
                name={q.id}
                value={o.id}
                checked={answers[q.id] === o.id}
                onChange={() => choose(q.id, o.id)}
              />
              <span>{o.text}</span>
            </label>
          ))}
          {result && (
            <div className="im-feedback">
              <strong>
                {q.options.some((o) => o.id === answers[q.id] && o.correct)
                  ? "Correct"
                  : "Review this concept"}
              </strong>
              <p>Supported answer: {q.options.find((o) => o.correct).text}</p>
              <p>{q.explanation}</p>
            </div>
          )}
        </fieldset>
      ))}
      {!result ? (
        <button type="submit" disabled={!ready}>
          Submit final assessment
        </button>
      ) : (
        <section className="im-assessment-result" aria-live="polite">
          <strong>
            {result.score}% ·{" "}
            {result.passed
              ? "Expertise demonstrated"
              : "Keep building your expertise"}
          </strong>
          <p>
            {result.passed
              ? `You earned the ${scenario.badge} badge. Save the result to record your achievement and progress.`
              : "No badge earned yet. Save this attempt, review the feedback, then replay to demonstrate your learning."}
          </p>
          <button
            type="button"
            disabled={committed}
            onClick={() => {
              setCommitted(true);
              onComplete(result);
            }}
          >
            {result.passed ? "Complete Mission" : "Save result and review"}
          </button>
        </section>
      )}
    </form>
  );
}
