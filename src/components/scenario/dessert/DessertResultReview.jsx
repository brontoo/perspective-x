import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  DESSERT_MEDIA,
  DESSERT_NODES,
  DESSERT_SPEAKERS,
} from "@/data/dessertFlow.mjs";
import { useSceneReview } from "../playback/ScenarioReview";
import { DESSERT_ENRICHMENT } from "@/data/dessertAssessment.mjs";
import { getBadgeLevel } from "../scenarioHelpers";
import "./dessert.css";

export default function DessertResultReview({
  state,
  scenario,
  completion = {},
}) {
  const [answersOpen, setAnswersOpen] = useState(false);
  const dialog = useRef(null),
    review = useSceneReview();
  useEffect(() => {
    if (answersOpen) dialog.current?.showModal();
    else dialog.current?.close();
  }, [answersOpen]);
  if (!state?.result) return null;
  const { score, passed } = state.result;
  const confirmed =
    completion.confirmed && !completion.saveError && !completion.isTeacher;
  const earned = passed && confirmed;
  const level = getBadgeLevel(
    score,
    state.decision?.consequence,
    state.decision?.justification,
    scenario.id,
    completion.mode,
  );
  function playRows(ids, title) {
    setAnswersOpen(false);
    review.openReview({
      key: "dessert-result:" + ids.join(":"),
      title,
      kind: "dessert",
      waitForArtwork: true,
      art: DESSERT_MEDIA.images.IMAGE_28.url,
      lines: ids.map((id) => ({
        ...DESSERT_MEDIA.recordings[id],
        speaker: DESSERT_SPEAKERS[DESSERT_MEDIA.recordings[id].speaker],
      })),
    });
  }
  return (
    <section
      className="px-dessert-completed-review px-dessert-results"
      aria-label="Dessert assessment and professional outcome"
    >
      <img
        className="px-dessert-results-art"
        src={DESSERT_MEDIA.images.IMAGE_28.url}
        alt="Ionic Evidence Investigator achievement artwork"
      />
      <div className="px-dessert-results-card">
        <small>
          YOUR SCIENTIFIC ACHIEVEMENT
          {completion.isTeacher ? " · TEACHER PREVIEW" : ""}
        </small>
        <h2>Assessment complete</h2>
        <div
          className="px-dessert-achievement-grid"
          style={{
            "--result-columns":
              confirmed && completion.totalPoints != null ? 3 : 2,
          }}
        >
          <div>
            <span>Assessment score</span>
            <strong className="px-dessert-score">{score}%</strong>
          </div>
          <div
            className="px-dessert-badge"
            data-earned={earned ? "true" : "false"}
          >
            <span>Badge earned</span>
            {earned ? (
              <>
                <img
                  src={scenario.badgeArtwork}
                  alt={scenario.badge}
                  width="76"
                  height="76"
                />
                <b>{scenario.badge}</b>
                <small>{level}</small>
              </>
            ) : (
              <>
                <strong>
                  {completion.isTeacher
                    ? "Preview only"
                    : passed
                      ? "Pending save"
                      : "Not yet earned"}
                </strong>
                <small>
                  {completion.isTeacher
                    ? "No student achievement is awarded."
                    : passed
                      ? "Confirm your saved result to earn the badge."
                      : "80% is required."}
                </small>
              </>
            )}
          </div>
          {confirmed && completion.totalPoints != null && (
            <div>
              <span>Total Points</span>
              <strong className="px-dessert-points">
                {completion.totalPoints}
              </strong>
            </div>
          )}
        </div>
        {state.result.enrichment?.attempted && (
          <div
            className="px-dessert-bonus"
            data-bonus-points={
              confirmed ? state.result.enrichment.bonusPoints : undefined
            }
          >
            <b>
              {completion.isTeacher ? "Enrichment preview" : "Enrichment bonus"}
              :{" "}
              {confirmed
                ? `${state.result.enrichment.bonusPoints} / 10 mission bonus points`
                : completion.isTeacher
                  ? `${state.result.enrichment.bonusPoints} / 10 potential points`
                  : "Pending save"}
            </b>
            <p>
              Recorded separately for this mission; the five-question
              percentage, badge threshold and cumulative Total Points are
              unchanged.
            </p>
          </div>
        )}
        <p>
          {passed
            ? "Your scientific assessment is complete."
            : "Review your evidence and try again when you are ready."}
        </p>
        {state.decision?.selectedOption !== "A" && (
          <p className="px-dessert-professional-status">
            Your professional decision still needs review in the notebook.
          </p>
        )}
        <p className="px-dessert-save-status" role="status">
          {completion.saveStatus || "Saving your result…"}
        </p>
        {completion.saveError && (
          <>
            <p role="alert">{completion.saveError}</p>
            <button onClick={completion.onRetrySave}>
              Retry saving result
            </button>
          </>
        )}
        <div className="px-dessert-result-actions">
          <button className="px-dessert-primary" onClick={completion.onFinish}>
            Finish mission
          </button>
          {!passed && <button onClick={completion.onRetry}>Try again</button>}
          {completion.onNext && (
            <button onClick={completion.onNext}>
              Next available mission →
            </button>
          )}
          <button onClick={() => setAnswersOpen(true)}>Review answers</button>
        </div>
        <details className="px-dessert-result-options">
          <summary>More result options</summary>
          <div className="px-dessert-result-actions">
            <button onClick={completion.onNotebook}>
              Open completed notebook
            </button>
            <button onClick={completion.onRetry}>Replay mission</button>
            {earned && (
              <button onClick={completion.onShowCertificate}>
                View certificate
              </button>
            )}
            {confirmed && (
              <button
                onClick={() =>
                  playRows(
                    DESSERT_NODES[passed ? "pass" : "retry"].lines,
                    "Completion message",
                  )
                }
              >
                Play completion message
              </button>
            )}
            {completion.role && (
              <>
                <Link to={`/RoleHub?role=${completion.role.id}`}>
                  Return to role
                </Link>
                <Link to={`/RoleReflection?role=${completion.role.id}`}>
                  Reflect on this profession
                </Link>
              </>
            )}
          </div>
        </details>
      </div>
      <dialog
        ref={dialog}
        className="px-dessert-answers-dialog"
        aria-label="Optional answer review"
        onCancel={(event) => {
          event.preventDefault();
          setAnswersOpen(false);
        }}
      >
        <header>
          <h2>Your scientific answers</h2>
          <button autoFocus onClick={() => setAnswersOpen(false)}>
            Close answer review
          </button>
        </header>
        <p>This review is optional. No recordings play automatically.</p>
        {(state.quizOrder?.questions || [0, 1, 2, 3, 4]).map((index, i) => {
          const q = scenario.exitTicket.mcqs[index];
          const correct = q.options.some(
            (o) => o.id === state.answers[q.id] && o.correct,
          );
          return (
            <section key={q.id}>
              <h3>
                {i + 1}. {q.question}
              </h3>
              <p>
                Your response:{" "}
                {q.options.find((o) => o.id === state.answers[q.id])?.text}
              </p>
              <p>Supported answer: {q.options.find((o) => o.correct).text}</p>
              <p>{q.explanation}</p>
              <button
                onClick={() =>
                  playRows(
                    [
                      `CH05_Q0${index + 1}_${correct ? "CORRECT" : "INCORRECT"}_HAMAD`,
                    ],
                    `Question ${i + 1} explanation`,
                  )
                }
              >
                Play explanation {i + 1}
              </button>
            </section>
          );
        })}
        {state.result.enrichment?.attempted && (
          <section>
            <h3>Advanced enrichment</h3>
            <p>{DESSERT_ENRICHMENT.question}</p>
            <p>
              Your response:{" "}
              {
                DESSERT_ENRICHMENT.options.find(
                  (o) => o.id === state.result.enrichment.answer,
                )?.text
              }
            </p>
            <p>{DESSERT_ENRICHMENT.explanation}</p>
          </section>
        )}
      </dialog>
    </section>
  );
}
