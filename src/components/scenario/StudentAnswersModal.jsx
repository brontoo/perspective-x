import { useEffect, useRef } from "react";
import { SCENARIOS } from "@/components/scenarios/scenarioData";
import { UAE_SCENARIOS } from "@/components/scenarios/uaeScenarioData";
import {
  answersOf,
  formatDate,
  isAssessed,
} from "@/lib/perspective/progress.mjs";
import "@/components/expedition/expedition.css";
export default function StudentAnswersModal({
  isOpen,
  onClose,
  attempts = [],
  studentName,
}) {
  const dialog = useRef(null);
  useEffect(() => {
    if (isOpen && !dialog.current.open) dialog.current.showModal();
    if (!isOpen && dialog.current.open) dialog.current.close();
  }, [isOpen]);
  const rows = [...attempts]
    .filter((r) => r.scenario_id)
    .sort(
      (a, b) =>
        (Date.parse(b.completed_at) || 0) - (Date.parse(a.completed_at) || 0),
    );
  return (
    <dialog
      ref={dialog}
      className="px-ui px-expedition xp-answer-dialog"
      onClose={onClose}
    >
      <header>
        <div>
          <p className="px-eyebrow">Scientific work review</p>
          <h2>{studentName || "Student"} — mission submissions</h2>
          <p>Original responses, evidence, and assessed results.</p>
        </div>
        <button
          autoFocus
          className="px-icon-button"
          aria-label="Close student answers"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      {rows.length === 0 && (
        <p className="px-empty">No mission responses are available.</p>
      )}
      {rows.map((row) => {
        const a = answersOf(row);
        const s = {
          ...SCENARIOS[row.scenario_id],
          ...UAE_SCENARIOS[row.scenario_id],
        };
        return (
          <details key={row.id}>
            <summary>
              {s?.title || row.scenario_title || row.scenario_id} ·{" "}
              {isAssessed(row)
                ? `${row.score}% — ${row.score >= 80 ? "Passed" : "Practice again"}`
                : "Unassessed draft"}
              <small>{formatDate(row.completed_at || a.meta?.updatedAt)}</small>
            </summary>
            {["scene1", "scene2", "scene3"].map(
              (key, i) =>
                a[key] && (
                  <section className="xp-captured" key={key}>
                    <h3>
                      {i === 0
                        ? "Scientific evidence"
                        : i === 1
                          ? "Professional decision"
                          : "Additional response"}
                    </h3>
                    <p>
                      {s?.scenes?.[i]?.options?.find(
                        (o) =>
                          o.id ===
                          (a[key].selectedOption || a[key].decision_id),
                      )?.text ||
                        a[key].selectedOption ||
                        a[key].decision_id}
                    </p>
                    <p>{a[key].justification || a[key].reasoning}</p>
                    {a[key].formativeFeedback && (
                      <p>
                        <strong>Formative feedback</strong>
                        <br />
                        {a[key].formativeFeedback}
                      </p>
                    )}
                  </section>
                ),
            )}
            {a.reflection && (
              <section className="xp-captured">
                <h3>Reflection</h3>
                <p>
                  {typeof a.reflection === "string"
                    ? a.reflection
                    : JSON.stringify(a.reflection)}
                </p>
              </section>
            )}
            {Object.entries(a.notebook || {})
              .filter(([, v]) => typeof v === "string" && v.trim())
              .map(([key, v]) => (
                <section className="xp-captured" key={key}>
                  <h3>{key.replace(/([A-Z])/g, " $1")}</h3>
                  <p>{v}</p>
                </section>
              ))}
            {a.exitTicket && (
              <section className="xp-captured">
                <h3>Final assessment</h3>
                <p>Recorded result: {row.score ?? a.exitTicket.score}%</p>
                {(a.exitTicket.mcq_answers || []).map((answer, i) => (
                  <p key={i}>
                    Question {Number(answer.questionId ?? i) + 1}:{" "}
                    {answer.option} ·{" "}
                    {answer.isCorrect ? "Correct" : "Needs review"}
                  </p>
                ))}
              </section>
            )}
          </details>
        );
      })}
      <button className="px-button" onClick={onClose}>
        Done reviewing
      </button>
    </dialog>
  );
}
