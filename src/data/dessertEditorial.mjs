import editorial from "./dessertEditorial.json" with { type: "json" };

export const DESSERT_EDITORIAL = editorial;
const retained = new Set(editorial.keep);
export const isDessertLineActive = (id) => retained.has(id);
export const activeDessertLines = (ids) => ids.filter(isDessertLineActive);

// Preserve old scientific records, but never schedule CUT speech in live scene review.
export function sanitizeDessertTrail(trail = []) {
  if (!Array.isArray(trail)) return [];
  return trail.flatMap((visit) => {
    if (!visit || typeof visit !== "object") return [];
    if (
      /IMAGE_21(?:$|\D)/.test(visit.key || "") ||
      /IMAGE_21\./.test(visit.art || "")
    )
      return [];
    const lines = (Array.isArray(visit.lines) ? visit.lines : []).filter(
      (line) => isDessertLineActive(line?.id),
    );
    return lines.length
      ? [{ ...visit, kind: "dessert", waitForArtwork: true, maskForeground: false, lines }]
      : [];
  });
}
