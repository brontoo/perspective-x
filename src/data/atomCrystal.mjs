// Diagram conventions shared by lattice and ion-formation views.
export const ATOM_ION_COLORS = {
  cation: ["#d8efff", "#70bcf4", "#2c6fa5"],
  anion: ["#fff0cd", "#efb35c", "#9b5c24"],
};

export function crystalPoints(kind, compact = false) {
  if (kind === "metallic" && compact) return [[0,0,0],[0,1,1],[1,0,1],[1,1,0]].map(position => ({ position, positive: true }));
  const points = [];
  for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) for (let z = 0; z < 4; z++) {
    if (kind === "metallic" && (x + y + z) % 2) continue;
    points.push({ position: [x, y, z], positive: (x + y + z) % 2 === 0 });
  }
  return points;
}
