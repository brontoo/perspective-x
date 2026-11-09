import { ATOM_MEDIA, ATOM_SPEAKERS } from "./atomDive.mjs";
import { recordSceneVisit } from "../lib/expedition/sceneTrail.mjs";

export const ATOM_REVISED_STILLS = ATOM_MEDIA.presentation.stills;
// The six IDs remain intact; five old visual compositions are deliberately not played.
export const ATOM_WITHHELD_VIDEOS = ATOM_MEDIA.presentation.withheldVideos;
export function atomMovie(id) {
  return id ? { ...ATOM_MEDIA.videos[id], id, withheld: !!ATOM_WITHHELD_VIDEOS[id] } : null;
}
export function atomVisual(scene, state, line) {
  if (["S04","S05","S10"].includes(scene)) return { kind: "metallic", electrons: state.metal.inspected.includes("electrons") || state.metal.verified || /delocalized throughout/.test(line?.text || ""), recovered: scene === "S10" };
  if (["S07","S08"].includes(scene)) return { kind: "ionic", electrons: false };
  if (scene === "S09") return { sides: state.comparison.sides };
  return null;
}
export function atomArt(scene) {
  if (["S04","S05","S07","S08","S10"].includes(scene)) return null;
  return ATOM_REVISED_STILLS[scene] || ATOM_MEDIA.story.story_sequence.find(item => item.id === scene)?.art;
}
export function atomSceneDescriptor(state, scene, line) {
  return { key: `atom_dive:${scene}`, title: `${scene} · ${ATOM_MEDIA.story.story_sequence.find(item => item.id === scene)?.function || "Your investigation"}`,
    art: atomArt(scene), visual: atomVisual(scene, state, line) };
}
export function atomReviewLine(line) {
  return line && { id: line.id, text: line.text, audio: line.audio, scene: line.scene, speaker: ATOM_SPEAKERS[line.speaker], video: atomMovie(line.video) };
}
export function atomTrailFromVisited(state) {
  return state.visited.reduce((trail, item) => {
    const line = ATOM_MEDIA.dialogue.find(row => row.id === item.id);
    if (!line) return trail;
    const scene = item.scene || (line.condition === "enter-metallic" ? "S04" : line.condition === "both-investigations-complete" ? "S09" : line.scene);
    return recordSceneVisit(trail, atomSceneDescriptor(state, scene, line), atomReviewLine(line));
  }, []);
}
