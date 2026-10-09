// Read-only adapters: never modify mission scores, answers or stored attempts.
export const CHAPTERS = [
  "You're Needed",
  "Find the Clues",
  "Make the Call",
  "See What Happens",
  "Prove Your Expertise",
];
export function answersOf(row) {
  try {
    const value =
      typeof row?.answers === "string" ? JSON.parse(row.answers) : row?.answers;
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
}
export function isAssessed(row) {
  return (
    row?.score !== null &&
    row?.score !== undefined &&
    Number.isFinite(Number(row.score)) &&
    !!row.completed_at &&
    Number.isFinite(Date.parse(row.completed_at))
  );
}
export function passedIds(rows, scenarios) {
  return [
    ...new Set(
      rows
        .filter(
          (row) =>
            scenarios[row.scenario_id] &&
            isAssessed(row) &&
            Number(row.score) >= 80,
        )
        .map((row) => row.scenario_id),
    ),
  ];
}
export function canOpenMission(id, roles, passed, settings) {
  if (settings[id]?.is_locked) return false;
  const role = Object.values(roles).find((r) => r.scenarios.includes(id));
  const index = role?.scenarios.indexOf(id) ?? -1;
  return (
    index >= 0 &&
    (index === 0 ||
      passed.includes(id) ||
      role.scenarios
        .slice(0, index)
        .every((previous) => passed.includes(previous)))
  );
}
export function nextMission(rows, scenarios, roles, settings) {
  const passed = passedIds(rows, scenarios);
  const allowed = (id) =>
    scenarios[id] &&
    !passed.includes(id) &&
    canOpenMission(id, roles, passed, settings);
  const recent = [...rows]
    .sort(
      (a, b) =>
        (Date.parse(b.completed_at) || 0) - (Date.parse(a.completed_at) || 0),
    )
    .find((row) => allowed(row.scenario_id));
  const id =
    recent?.scenario_id ||
    Object.values(roles)
      .flatMap((r) => r.scenarios)
      .find(allowed);
  return id
    ? {
        ...scenarios[id],
        id,
        role: Object.values(roles).find((r) => r.scenarios.includes(id)),
        attempt: recent?.scenario_id === id ? recent : null,
      }
    : null;
}
export function missionState(row) {
  if (!row) return "Not started";
  if (!isAssessed(row)) return "Saved notes";
  return Number(row.score) >= 80 ? "Passed" : "Practice again";
}
export function rankRows(rows) {
  return [...rows].sort(
    (a, b) =>
      Number(b.total_points || 0) - Number(a.total_points || 0) ||
      String(a.id).localeCompare(String(b.id)),
  );
}
export function formatDate(value) {
  return value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeZone: "Asia/Dubai",
      }).format(new Date(value))
    : "Date unavailable";
}
