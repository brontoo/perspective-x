import { Link } from "react-router-dom";
import { getBadgeLevel } from "./scenarioHelpers";
export default function ScenarioComplete({
  scenario,
  responses,
  role,
  onShowCertificate,
  onRetry,
  onNotebook,
  onNext,
  attemptCount = 1,
  difficultyMode = "on-level",
  isTeacher = false,
  saveStatus = "",
  saveError = "",
  onRetrySave,
}) {
  const score = Number(responses.exitTicket?.score) || 0;
  const passed = responses.exitTicket?.passed === true;
  const level = getBadgeLevel(
    score,
    responses.scene2?.consequence,
    responses.scene2?.justification,
    scenario.id,
    difficultyMode,
  );
  return (
    <section className="xp-completion">
      <p className="px-eyebrow">
        Your professional mission summary{isTeacher ? " · Teacher preview" : ""}
      </p>
      <div
        className={`xp-achievement ${passed ? "is-earned" : ""}`}
        aria-hidden="true"
      >
        {passed ? scenario.badgeIcon : "↗"}
      </div>
      <h2>
        {passed ? "Mission accomplished" : "Keep building your expertise"}
      </h2>
      <p>{scenario.title}</p>
      <div className="xp-result-grid">
        <div>
          <strong>{score}%</strong>
          <span>Final-check result</span>
        </div>
        <div>
          <strong>{passed ? "Passed" : "Practice again"}</strong>
          <span>80% required to pass</span>
        </div>
        <div>
          <strong>{attemptCount}</strong>
          <span>Attempts this session</span>
        </div>
      </div>
      {passed ? (
        <div className="xp-earned-badge">
          <strong>
            {level} · {scenario.badge}
          </strong>
          <p>
            {isTeacher
              ? "Preview only; no student achievements are recorded."
              : "You earned this badge through your scientific assessment."}
          </p>
        </div>
      ) : (
        <p className="xp-improve">
          Revisit the evidence and reasoning before attempting the final check
          again. No badge or certificate is earned for an unsuccessful check.
        </p>
      )}
      {responses.scene2?.formativeFeedback && (
        <div className="xp-captured">
          <h3>Your scientific reasoning</h3>
          <p>{responses.scene2.formativeFeedback}</p>
        </div>
      )}
      <p role="status">{saveStatus}</p>
      {saveError && (
        <>
          <p className="px-error" role="alert">
            {saveError}
          </p>
          <button className="px-button" onClick={onRetrySave}>
            Retry saving result
          </button>
        </>
      )}
      <div className="xp-actions">
        <button className="px-button" onClick={onNotebook}>
          Open completed notebook
        </button>
        {passed && !saveError && !isTeacher && (
          <button className="px-outline-button" onClick={onShowCertificate}>
            View certificate
          </button>
        )}
        <button className="px-outline-button" onClick={onRetry}>
          Replay mission
        </button>
        {onNext && (
          <button className="px-button" onClick={onNext}>
            Next available mission →
          </button>
        )}
      </div>
      <div className="xp-actions">
        <Link className="px-text-button" to={`/RoleHub?role=${role.id}`}>
          Return to role
        </Link>
        <Link
          className="px-text-button"
          to={isTeacher ? "/TeacherDashboard" : "/Dashboard"}
        >
          Dashboard
        </Link>
        <Link className="px-text-button" to={`/RoleReflection?role=${role.id}`}>
          Reflect on this profession
        </Link>
      </div>
    </section>
  );
}
