import { ATOM_MEDIA } from "@/data/atomDive.mjs";
import CrystalView from "./CrystalView";

export default function AtomResultReview({ state }) {
  if (!state?.result) return null;
  return <section className="px-atom-completed-review" aria-label="ATOM DIVE assessment explanations">
    <h3>Review your five-question exit ticket</h3>
    {ATOM_MEDIA.assessment.questions.map((question,index) => <details key={question.id}><summary>{index + 1}. {question.prompt}</summary>
      <p>Your response: {question.options[state.answers[question.id]]}</p><p>Supported answer: {question.options[question.answer]}</p><p>{question.explanation}</p>
    </details>)}
    <details><summary>Review metallic bonding</summary><CrystalView kind="metallic" electrons coreLabel /></details>
    <details><summary>Review the ionic lattice</summary><CrystalView kind="ionic" /></details>
  </section>;
}
