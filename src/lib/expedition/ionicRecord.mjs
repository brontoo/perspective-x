// Display only the learner's saved hypothesis; this contains no sample answer key.
export function ionicHypothesisText(value) {
  if (typeof value === "string") return value.replaceAll("-", " ");
  if (!value || typeof value !== "object") return "";
  return Object.entries(value)
    .filter(([, identity]) => typeof identity === "string" && identity.trim())
    .map(
      ([sample, identity]) =>
        `Sample ${sample}: ${identity.replaceAll("-", " ")}`,
    )
    .join("\n");
}
