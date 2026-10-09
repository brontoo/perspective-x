import test from "node:test";
import assert from "node:assert/strict";
import { createAttemptWriter } from "../src/lib/expedition/attempts.mjs";
function fakeClient({ fail = false } = {}) {
  const calls = [];
  const client = {
    from: () => {
      const call = { filters: [] };
      const q = {
        insert(value) {
          call.kind = "insert";
          call.value = value;
          return q;
        },
        update(value) {
          call.kind = "update";
          call.value = value;
          return q;
        },
        eq(key, value) {
          call.filters.push([key, value]);
          return q;
        },
        is(key, value) {
          call.filters.push([key, value]);
          return q;
        },
        select() {
          return q;
        },
        async single() {
          calls.push(call);
          await new Promise((r) => setTimeout(r, 2));
          return fail
            ? { error: { message: "Rejected write" } }
            : { data: { id: "new-owned-draft" } };
        },
      };
      return q;
    },
  };
  return { client, calls };
}
const identity = {
  userId: "owner",
  scenarioId: "water_contamination",
  title: "The Invisible Threat",
};
test("drafts use new records and cannot award completion", async () => {
  const { client, calls } = fakeClient();
  await createAttemptWriter(client, identity).persist({
    notebook: { evidenceNotes: "Original evidence" },
  });
  assert.equal(calls[0].kind, "insert");
  assert.equal(calls[0].value.score, null);
  assert.equal(calls[0].value.completed_at, null);
  assert.equal(calls[0].value.student_id, "owner");
  assert.equal(
    calls[0].value.answers.notebook.evidenceNotes,
    "Original evidence",
  );
});
test("queued saves update only the newly created owned unassessed draft with revision checks", async () => {
  const { client, calls } = fakeClient();
  const writer = createAttemptWriter(client, identity);
  await Promise.all([
    writer.persist({ notebook: { evidenceNotes: "Evidence" } }),
    writer.persist({ scene1: { selectedOption: "C" } }),
    writer.persist(
      {
        scene1: { selectedOption: "C" },
        exitTicket: { score: 100, passed: true },
      },
      { score: 100 },
    ),
  ]);
  assert.deepEqual(
    calls.map((c) => c.kind),
    ["insert", "update", "update"],
  );
  for (const call of calls.slice(1)) {
    assert.ok(
      call.filters.some(([k, v]) => k === "id" && v === "new-owned-draft"),
    );
    assert.ok(
      call.filters.some(([k, v]) => k === "student_id" && v === "owner"),
    );
    assert.ok(call.filters.some(([k, v]) => k === "score" && v === null));
  }
  assert.equal(calls[1].value.answers.meta.revision, 2);
  assert.deepEqual(
    calls[2].filters.find(([k]) => k === "answers->meta->>revision"),
    ["answers->meta->>revision", "2"],
  );
  assert.equal(calls[2].value.score, 100);
  assert.ok(calls[2].value.completed_at);
});
test("rejected persistence reports failure and cannot claim a saved result", async () => {
  const { client, calls } = fakeClient({ fail: true });
  await assert.rejects(
    createAttemptWriter(client, identity).persist(
      { exitTicket: { score: 100 } },
      { score: 100 },
    ),
    (e) => e.message === "Rejected write",
  );
  assert.equal(calls.length, 1);
});
test("teacher preview performs no persistence calls", async () => {
  const { client, calls } = fakeClient();
  const result = await createAttemptWriter(client, {
    ...identity,
    preview: true,
  }).persist({ exitTicket: { score: 100 } }, { score: 100 });
  assert.deepEqual(result, { preview: true });
  assert.equal(calls.length, 0);
});
