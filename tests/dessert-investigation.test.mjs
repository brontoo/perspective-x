import test from "node:test";
import assert from "node:assert/strict";
import {
  createDessertOrder,
  restoreDessertOrder,
  gradeDessertEnrichment,
} from "../src/data/dessertAssessment.mjs";
import {
  createDessertState,
  dessertStep,
  dessertActiveLine,
  dessertNotebook,
  restoreDessertState,
} from "../src/data/dessertFlow.mjs";
import {
  dessertAct as act,
  dessertCheckpoint as checkpoint,
  dessertReady as ready,
  dessertScenario,
} from "./support/dessert-checkpoints.mjs";

test("independent attempts shuffle all five questions and four options without duplicates; saved order is stable", () => {
  const a = createDessertOrder({ seed: 17 }),
    b = createDessertOrder({ seed: 91 });
  assert.notDeepEqual(a.questions, b.questions);
  assert.deepEqual([...a.questions].sort(), [0, 1, 2, 3, 4]);
  for (const values of Object.values(a.options))
    assert.deepEqual([...values].sort(), [0, 1, 2, 3]);
  assert.notDeepEqual(a.options, b.options);
  const s = { ...checkpoint("question"), quizOrder: a };
  const restored = restoreDessertState(dessertNotebook(s));
  assert.deepEqual(restored.quizOrder, a);
  assert.equal(dessertStep(restored).question, a.questions[0]);
  assert.equal(
    dessertActiveLine({ ...restored, ready: false }).id,
    `CH05_Q0${a.questions[0] + 1}_QUESTION_NARRATOR`,
  );
});

test("legacy assessment drafts retain canonical order and selected answer IDs", () => {
  const s = checkpoint("question");
  delete s.quizOrder;
  s.answers = { d1: "B" };
  const restored = restoreDessertState({ dessertStory: s });
  assert.deepEqual(restored.quizOrder.questions, [0, 1, 2, 3, 4]);
  assert.deepEqual(restored.answers, s.answers);
  assert.deepEqual(
    restoreDessertOrder({ questions: [0, 0, 1, 2, 3] }).questions,
    [0, 1, 2, 3, 4],
  );
});

test("randomized assessment uses original question IDs, matching narration, and unchanged grading", () => {
  let s = {
    ...checkpoint("question"),
    quizOrder: createDessertOrder({ seed: 23 }),
  };
  const seen = [];
  while (dessertStep(s).task === "question") {
    const index = dessertStep(s).question,
      q = dessertScenario.exitTicket.mcqs[index];
    seen.push(q.id);
    s = act(s, "answer", { answer: q.options.find((o) => o.correct).id });
    s = ready(act(s, "recordAnswer"));
  }
  assert.equal(new Set(seen).size, 5);
  const done = act(s, "assess");
  assert.equal(done.result.score, 100);
  assert.equal(done.result.mcq_answers.length, 5);
  assert.equal(done.result.enrichment.bonusPoints, 0);
});

for (const [answer, expected] of [
  ["balanced-mobile-ions", 10],
  ["one-to-one", 0],
  [null, 0],
  ["invalid", 0],
])
  test(`enrichment ${answer} gives exactly ${expected} separate mission bonus points`, () => {
    assert.equal(gradeDessertEnrichment(answer).bonusPoints, expected);
  });

test("10 bonus points cannot change a failing percentage or the badge threshold; completion remains exact-once", () => {
  let s = checkpoint("assessment");
  for (const q of dessertScenario.exitTicket.mcqs.slice(0, 2))
    s.answers[q.id] = q.options.find((o) => !o.correct).id;
  s = act(s, "enrichmentAnswer", { answer: "balanced-mobile-ions" });
  const done = act(s, "assess");
  assert.equal(done.result.score, 60);
  assert.equal(done.result.passed, false);
  assert.equal(done.result.enrichment.bonusPoints, 10);
  assert.equal(act(done, "assess"), done);
  assert.deepEqual(
    restoreDessertState(dessertNotebook(done)).result,
    done.result,
  );
});

test("new attempts have independent presentation order and no inherited enrichment award", () => {
  const s = createDessertState({ seed: 2 });
  assert.equal(s.enrichment.answer, null);
  assert.equal(s.result, null);
});
