// Only this session's newly inserted draft may be updated. Earlier records stay immutable.
export function createAttemptWriter(
  client,
  { userId, scenarioId, title, preview = false },
) {
  let id = null;
  let revision = 0;
  let queue = Promise.resolve();
  const persist = (answers, assessment = null) => {
    const snapshot = structuredClone(answers);
    const run = async () => {
      if (preview) return { preview: true };
      const nextRevision = revision + 1;
      const payload = {
        answers: {
          ...snapshot,
          meta: {
            ...snapshot.meta,
            recordType: "mission_attempt",
            revision: nextRevision,
            updatedAt: new Date().toISOString(),
          },
        },
        score: assessment?.score ?? null,
        completed_at: assessment ? new Date().toISOString() : null,
      };
      let result;
      if (!id) {
        result = await client
          .from("student_progress")
          .insert({
            ...payload,
            student_id: userId,
            scenario_id: scenarioId,
            scenario_title: title,
          })
          .select("id")
          .single();
      } else {
        result = await client
          .from("student_progress")
          .update(payload)
          .eq("id", id)
          .eq("student_id", userId)
          .is("score", null)
          .eq("answers->meta->>revision", String(revision))
          .select("id")
          .single();
      }
      if (result.error || !result.data?.id)
        throw (
          result.error ||
          new Error(
            "This attempt changed elsewhere. Your work is retained locally; start a new attempt to save a separate copy.",
          )
        );
      id = result.data.id;
      revision = nextRevision;
      return { id, answers: payload.answers };
    };
    const pending = queue.then(run, run);
    queue = pending.catch(() => {});
    return pending;
  };
  return { persist };
}
export function draftKey(userId, scenarioId) {
  return `px-mission-draft:${userId}:${scenarioId}`;
}
export function latestDraft(rows, scenarioId) {
  return rows
    .filter(
      (r) =>
        r.scenario_id === scenarioId &&
        r.score == null &&
        r.answers?.meta?.recordType !== "role_reflection",
    )
    .sort(
      (a, b) =>
        Date.parse(b.answers?.meta?.updatedAt || b.completed_at || 0) -
        Date.parse(a.answers?.meta?.updatedAt || a.completed_at || 0),
    )[0];
}
