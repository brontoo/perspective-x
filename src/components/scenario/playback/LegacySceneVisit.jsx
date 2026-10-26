import { useEffect } from "react";
import { useSceneReview } from "./ScenarioReview";

export default function LegacySceneVisit({ scenario, phase, responses }) {
  const { recordScene, reviewing } = useSceneReview();
  useEffect(() => {
    if (reviewing) return;
    const first = scenario.scenes?.[0], second = scenario.scenes?.[1];
    const outcome = scenario.scenes?.[2]?.consequences?.[responses.scene2?.consequence];
    const titles = { intro: "Your assignment", scene1: first?.title || "Find the clues", scene2: second?.title || "Make the call", consequence: "See what happens", reflection: "Reflect on the evidence", exit: "Your final check", complete: "Mission record" };
    const text = phase === "intro" ? scenario.context : phase === "scene1" ? first?.narrative || first?.question : phase === "scene2" ? second?.narrative || second?.question : ["consequence","reflection"].includes(phase) ? [outcome?.outcome,outcome?.message].filter(Boolean).join(" ") : titles[phase];
    const art = scenario.artwork || document.querySelector(".xp-mission-workspace img")?.getAttribute("src");
    recordScene({ key: `${scenario.id}:${phase}`, title: titles[phase] || phase, art,
      response: responses[phase]?.justification || (phase === "reflection" ? responses.reflection : null) },
      { id: `${scenario.id}:${phase}`, text: typeof text === "string" ? text : titles[phase], audio: null, speaker: scenario.character?.name || "Your mission" });
  }, [scenario.id, phase, reviewing, recordScene]);
  return null;
}
