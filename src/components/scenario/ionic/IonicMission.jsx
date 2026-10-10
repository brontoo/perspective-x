import { useEffect, useRef, useState } from "react";
import { HAMAD } from "@/data/ionicMissions.mjs";
import { gradeIonic } from "@/data/ionicScience.mjs";
import IonicInvestigation from "./IonicInvestigation";
import "./ionic-missions.css";
function Briefing({ scenario, onComplete }) {
  const [videoReady, setVideoReady] = useState(false),
    video = useRef(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch(scenario.introVideo, { method: "HEAD", signal: abort.signal })
      .then((response) => {
        if (!abort.signal.aborted)
          setVideoReady(
            response.ok &&
              (response.headers.get("content-type") || "").startsWith("video/"),
          );
      })
      .catch(() => {});
    const pause = () => {
      if (document.hidden) video.current?.pause();
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      abort.abort();
      document.removeEventListener("visibilitychange", pause);
      const player = video.current;
      if (player) {
        player.pause();
        player.removeAttribute("src");
        player.load();
      }
    };
  }, [scenario.introVideo]);
  return (
    <>
      <div className="im-cinema">
        <img className="im-location-art" src={scenario.artwork} alt="" />
        <img
          className="im-hamad"
          src={HAMAD.portrait}
          alt="Hamad Al Zaabi, the same fictional Emirati field investigator in both missions"
        />
        <div className="im-cinema-copy">
          <p className="im-eyebrow">Chapter 1 · You’re Needed</p>
          <h2>{scenario.title}</h2>
          <p>{scenario.location}</p>
          <span className="im-fiction-chip">Fictional educational mission</span>
        </div>
      </div>
      <div className="im-brief-grid">
        <section>
          <p className="im-eyebrow">Your assignment</p>
          <h3>{scenario.role}</h3>
          <p>{scenario.context}</p>
          <blockquote>
            “{scenario.mentorQuote}”<cite>Hamad Al Zaabi</cite>
          </blockquote>
          <p>{scenario.studentMission}</p>
          <button onClick={onComplete}>Accept assignment →</button>
          {scenario.id === "ionic_dessert_mystery" && (
            <small className="im-pace">
              The 12-minute deadline is a story device. Investigate at your own
              pace.
            </small>
          )}
        </section>
        <aside className="im-profile">
          <img src={HAMAD.portrait} alt="" />
          <div>
            <p className="im-eyebrow">Your investigator</p>
            <h3>{HAMAD.name}</h3>
            <p>
              {HAMAD.age} · {HAMAD.nationality}
            </p>
            <strong>{HAMAD.title}</strong>
            <p>{HAMAD.personality}</p>
            <span className="im-static-note">
              Your static briefing is ready. You can proceed normally.
            </span>
          </div>
        </aside>
      </div>
      {videoReady && (
        <section className="im-video">
          <h3>Cinematic introduction</h3>
          <video
            ref={video}
            controls
            playsInline
            preload="metadata"
            poster={scenario.artwork}
            src={scenario.introVideo}
            onError={() => setVideoReady(false)}
            aria-label={`${scenario.title} introduction`}
          />
          <p>
            Briefing transcript: {scenario.context} {scenario.studentMission}
          </p>
        </section>
      )}
      <section className="im-objectives">
        <h3>Scientific focus</h3>
        <ul>
          {scenario.scienceFocus.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p>{scenario.textbook}</p>
      </section>
    </>
  );
}
function MakeTheCall({ scenario, responses, onComplete, isTeacher }) {
  const [choice, setChoice] = useState(""),
    [reason, setReason] = useState(""),
    [cited, setCited] = useState([]);
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
              onChange={() => setChoice(o.id)}
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
                  setCited(
                    event.target.checked
                      ? [...cited, e.id]
                      : cited.filter((id) => id !== e.id),
                  )
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
            onChange={(e) => setReason(e.target.value)}
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
function Outcome({ scenario, responses, onComplete }) {
  const [reflection, setReflection] = useState("");
  const consequence =
    scenario.scenes[2].consequences[responses.scene2?.consequence];
  if (!consequence)
    return (
      <section className="im-instrument">
        <h2>A decision is needed before its outcome can unfold.</h2>
        <p>
          In teacher preview, return to Make the Call and choose a response.
        </p>
      </section>
    );
  const supported = consequence.rating === "strong";
  return (
    <>
      <header className="im-stage-header">
        <p className="im-eyebrow">Chapter 4 · See What Happens!</p>
        <h2>
          {supported
            ? "Evidence changed the outcome."
            : "The consequence brings a new clue."}
        </h2>
      </header>
      <div className="im-outcome">
        <img src={scenario.artwork} alt="Fictional mission location" />
        <div>
          <span className="im-fiction-chip">
            Fictional consequence ·{" "}
            {supported ? "Supported response" : "Review your response"}
          </span>
          <h3>{consequence.outcome}</h3>
          <p>{consequence.message}</p>
          <div className="im-reading">{consequence.newData}</div>
        </div>
      </div>
      <section className="im-instrument">
        <h3>Close the loop in your notebook.</h3>
        <label>
          What did the consequence teach you about your evidence and decision?
          <textarea
            rows="4"
            maxLength={4000}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Use at least one observation and explain what you would retain or change next time."
          />
        </label>
        <p>
          Write at least 40 characters. Your reflection is saved with this
          attempt.
        </p>
        <button
          disabled={reflection.trim().length < 40}
          onClick={() => onComplete(reflection)}
        >
          Continue to Prove Your Expertise →
        </button>
      </section>
    </>
  );
}
function Assessment({ scenario, responses, onDraft, onComplete }) {
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
export default function IonicMission({
  stage,
  scenario,
  responses = {},
  onComplete,
  onDraft,
  mode,
  isTeacher,
}) {
  return (
    <section className={`im-mission im-${scenario.atmosphere}`}>
      {stage === "briefing" && (
        <Briefing scenario={scenario} onComplete={onComplete} />
      )}
      {stage === "investigation" && (
        <IonicInvestigation
          scenario={scenario}
          initialRecord={responses.investigation}
          onDraft={onDraft}
          onComplete={onComplete}
          mode={mode}
        />
      )}
      {stage === "decision" && (
        <MakeTheCall
          scenario={scenario}
          responses={responses}
          onComplete={onComplete}
          isTeacher={isTeacher}
        />
      )}
      {stage === "outcome" && (
        <Outcome
          scenario={scenario}
          responses={responses}
          onComplete={onComplete}
        />
      )}
      {stage === "assessment" && (
        <Assessment
          scenario={scenario}
          responses={responses}
          onDraft={onDraft}
          onComplete={onComplete}
        />
      )}
      <footer className="im-disclaimer">{scenario.fictionNotice}</footer>
    </section>
  );
}
