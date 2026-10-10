// Coordinates are intrinsic pixels in the unchanged 1448 × 1086 artwork.
// These conservative sky islands exclude the hair, mountains, sun and skyline.
export const HERO_SOURCE = { width: 1448, height: 1086 };
export const CLOUD_CYCLE_SECONDS = 48;
export const CLOUD_FEATHER_PIXELS = 24;
export const CLOUD_REGIONS = [
  { name: "western sunset clouds", points: [[20,24],[592,24],[627,135],[628,255],[615,382],[549,368],[473,334],[391,300],[312,273],[221,244],[120,221],[20,179]] },
  { name: "high central clouds", points: [[650,18],[1110,18],[1110,151],[1002,199],[950,189],[882,161],[778,167],[689,185],[648,123]] },
  { name: "eastern cloud bank", points: [[1000,232],[1430,198],[1430,314],[1360,325],[1294,325],[1275,393],[1198,400],[1118,413],[1035,400],[993,353]] },
];

export function regionBounds(points) {
  const xs = points.map(point => point[0]);
  const ys = points.map(point => point[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
}

// CSS percentage positions apply to the remaining space, including negative
// space when cover crops the image. Pixel positions are literal offsets.
function positionOffset(value, remaining) {
  if (value === "left" || value === "top") return 0;
  if (value === "center") return remaining / 2;
  if (value === "right" || value === "bottom") return remaining;
  if (/^-?\d+(\.\d+)?%$/.test(value)) return remaining * parseFloat(value) / 100;
  if (/^-?\d+(\.\d+)?px$/.test(value)) return parseFloat(value);
  throw new Error("Unsupported background position; retain the static artwork");
}

export function coverGeometry(width, height, imageWidth, imageHeight, position) {
  if (![width, height, imageWidth, imageHeight].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error("Invalid scenic dimensions");
  }
  const coordinates = position.trim().split(/\s+/);
  if (coordinates.length !== 2) throw new Error("Unsupported background position");
  const scale = Math.max(width / imageWidth, height / imageHeight);
  return {
    width, height, scale,
    offsetX: positionOffset(coordinates[0], width - imageWidth * scale),
    offsetY: positionOffset(coordinates[1], height - imageHeight * scale),
  };
}

export function polygonCoverage(x, y, points, feather = CLOUD_FEATHER_PIXELS) {
  let inside = false;
  let distance = Infinity;
  for (let index = 0, previous = points.length - 1; index < points.length; previous = index++) {
    const [ax, ay] = points[previous];
    const [bx, by] = points[index];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    distance = Math.min(distance, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  if (!inside) return 0;
  const amount = Math.min(1, distance / feather);
  return amount * amount * (3 - 2 * amount);
}
