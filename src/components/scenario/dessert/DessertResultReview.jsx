import { DESSERT_MEDIA } from "@/data/dessertFlow.mjs";
import "./dessert.css";
export default function DessertResultReview({ state, scenario }) {
  if (!state?.result) return null;
  const outcome = scenario.scenes[2].consequences[state.decision?.consequence];
  return (
    <section
      className="px-dessert px-dessert-completed-review"
      aria-label="Dessert assessment and professional outcome"
    >
      <div
        className="px-dessert-result"
        style={{
          backgroundImage: `linear-gradient(#0c273ee8,#0c273ef5),url(${DESSERT_MEDIA.images.IMAGE_28.url})`,
          backgroundSize: "cover",
        }}
      >
        <h2>
          {state.result.passed
            ? "Ionic Evidence Investigator"
            : "Review and try again"}{" "}
          · {state.result.score}%
        </h2>
        {outcome && (
          <p>
            <b>Professional outcome:</b> {outcome.outcome}
          </p>
        )}
        <p>
          {state.result.passed
            ? "The five-question scientific assessment passed. Your professional decision and its consequence remain in your notebook."
            : "This attempt earns no badge or certificate. Review the explanations before starting an explicit new attempt."}
        </p>
        {scenario.exitTicket.mcqs.map((q, i) => (
          <details key={q.id}>
            <summary>
              {i + 1}. {q.question}
            </summary>
            <p>
              Your response:{" "}
              {q.options.find((o) => o.id === state.answers[q.id])?.text}
            </p>
            <p>Supported answer: {q.options.find((o) => o.correct).text}</p>
            <p>{q.explanation}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
