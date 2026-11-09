// Append a physical scene visit, preserving the actual chosen route and only spoken/seen lines.
export function recordSceneVisit(trail, scene, line) {
  if (!scene?.key) return trail;
  const previous = trail.at(-1);
  const lines = previous?.key === scene.key ? previous.lines || [] : [];
  const index = line ? lines.findIndex(item => item.id === line.id) : -1;
  const nextLines = !line ? lines : index < 0 ? [...lines, line] : lines.map((item,i) => i === index ? { ...item, ...line } : item);
  const next = { ...scene, lines: nextLines };
  if (previous?.key === scene.key) {
    if (JSON.stringify(previous) === JSON.stringify(next)) return trail;
    return [...trail.slice(0, -1), next];
  }
  return [...trail, next];
}

export function previousVisitedScene(trail) { return trail.length > 1 ? trail.at(-2) : null; }
