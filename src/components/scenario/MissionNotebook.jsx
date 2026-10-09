import { useEffect, useRef } from "react";
import { answersOf } from "@/lib/perspective/progress.mjs";
import "@/components/expedition/expedition.css";
const SECTIONS = [
  ["evidenceNotes", "1. Scientific evidence"],
  ["thinkingNotes", "2. My explanations"],
  ["choiceNotes", "3. Professional decisions"],
  ["whatHappenedNotes", "4. Consequences"],
  ["learnedNotes", "5. Reflection & learning"],
];
export default function MissionNotebook({
  scenario,
  responses = {},
  onChange,
  onSave,
  isOpen,
  onClose,
  readOnly = false,
  saveStatus = "",
  saveError = "",
  feedback = [],
}) {
  const dialog = useRef(null);
  useEffect(() => {
    if (isOpen && !dialog.current.open) dialog.current.showModal();
    if (!isOpen && dialog.current.open) dialog.current.close();
  }, [isOpen]);
  const record = answersOf({ answers: responses });
  const first = scenario.scenes?.[0]?.options?.find(
    (o) => o.id === record.scene1?.selectedOption,
  );
  const second = scenario.scenes?.[1]?.options?.find(
    (o) => o.id === record.scene2?.selectedOption,
  );
  const consequence =
    scenario.scenes?.[2]?.consequences?.[
      record.scene2?.consequence || second?.consequence
    ];
  const collected = [
    first
      ? `${first.text}\n${record.scene1?.justification || ""}`
      : record.scene1?.justification,
    record.scene2?.justification,
    second?.text,
    consequence
      ? [consequence.outcome, consequence.message, consequence.newData]
          .filter(Boolean)
          .join("\n\n")
      : null,
    typeof record.reflection === "string" ? record.reflection : null,
  ];
  return (
    <dialog
      ref={dialog}
      className="px-ui px-expedition xp-notebook"
      onClose={onClose}
    >
      <header>
        <div>
          <p className="px-eyebrow">Your professional record</p>
          <h2>Mission Notebook</h2>
          <p>{scenario.title}</p>
        </div>
        <button
          autoFocus
          className="px-icon-button"
          aria-label="Close notebook"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <p className="px-muted">
        {readOnly
          ? "This saved record is read-only. Earlier answers remain preserved."
          : "Mission responses are captured automatically. Add your own notes below."}
      </p>
      {SECTIONS.map(([field, title], i) => (
        <details
          key={field}
          open={!!collected[i] || !!record.notebook?.[field] || i === 0}
        >
          <summary>{title}</summary>
          {collected[i] ? (
            <div className="xp-captured">
              <strong>Captured mission response</strong>
              <p>{collected[i]}</p>
            </div>
          ) : (
            <p className="px-muted">
              Your response will appear as you progress.
            </p>
          )}
          <label className="xp-field">
            {title} — personal notes
            <textarea
              rows={3}
              value={record.notebook?.[field] || ""}
              readOnly={readOnly}
              maxLength={5000}
              onChange={(e) =>
                onChange?.({ ...record.notebook, [field]: e.target.value })
              }
            />
          </label>
        </details>
      ))}
      {record.exitTicket?.score != null && (
        <p className="xp-captured">
          Final assessment: {record.exitTicket.score}%
        </p>
      )}
      {feedback.filter(
        (f) => !["difficulty_override", "path_recommendation"].includes(f.type),
      ).length > 0 && (
        <details>
          <summary>Teacher feedback</summary>
          {feedback
            .filter(
              (f) =>
                !["difficulty_override", "path_recommendation"].includes(
                  f.type,
                ),
            )
            .map((f, i) => (
              <p className="xp-teacher-note" key={f.id || i}>
                {f.message}
              </p>
            ))}
        </details>
      )}
      <footer>
        <p role="status">
          {saveStatus ||
            (readOnly
              ? "Saved record"
              : "Notes are not saved until the backend confirms.")}
        </p>
        {saveError && (
          <p className="px-error" role="alert">
            {saveError}
          </p>
        )}
        {!readOnly && (
          <button className="px-button" onClick={onSave}>
            Save notebook now
          </button>
        )}
        <button className="px-text-button" onClick={onClose}>
          Return to mission
        </button>
      </footer>
    </dialog>
  );
}
