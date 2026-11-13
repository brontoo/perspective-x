// The existing leaderboard view is authoritative. Never derive points from an assessment.
export function verifiedDessertTotal(record) {
  const value = record?.total_points;
  if (
    !["number", "string"].includes(typeof value) ||
    (typeof value === "string" && !value.trim())
  )
    return null;
  const total = Number(value);
  return Number.isFinite(total) ? total : null;
}
