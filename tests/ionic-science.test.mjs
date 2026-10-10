import test from "node:test";
import assert from "node:assert/strict";
import {
  IONS,
  formulaResult,
  electronPair,
  rockSaltAtoms,
  calciteAtoms,
  calciteCoordination,
  CALCITE_CELL,
  projectAtom,
  precipitationModel,
  gradeIonic,
} from "../src/data/ionicScience.mjs";
import {
  HAMAD,
  IONIC_ROLE,
  IONIC_SCENARIOS,
} from "../src/data/ionicMissions.mjs";

test("every ion pair has exactly one simplest neutral ratio, preserving polyatomic groups", () => {
  for (const [p, cation] of Object.entries(IONS).filter(
    ([, i]) => i.charge > 0,
  )) {
    for (const [n, anion] of Object.entries(IONS).filter(
      ([, i]) => i.charge < 0,
    )) {
      const neutral = [];
      for (let a = 1; a <= 6; a++)
        for (let b = 1; b <= 6; b++) {
          const r = formulaResult(p, n, a, b);
          if (r.balanced) {
            assert.equal(cation.charge * a + anion.charge * b, 0);
            neutral.push([a, b]);
          }
        }
      assert.equal(neutral.length, 1, `${p}/${n}`);
    }
  }
  assert.equal(formulaResult("Ca", "CO3", 1, 1).formula, "CaCO3");
  assert.equal(formulaResult("Ca", "CO3", 2, 2).balanced, false);
  assert.equal(formulaResult("Al", "SO4", 2, 3).formula, "Al2(SO4)3");
  assert.equal(formulaResult("NH4", "CO3", 2, 1).formula, "(NH4)2CO3");
  assert.equal(formulaResult("Na", "HCO3", 1, 1).formula, "NaHCO3");
  for (const counts of [
    [0, 1],
    [1.5, 2],
    [-1, 1],
    [Infinity, 1],
    [7, 1],
  ])
    assert.equal(formulaResult("Na", "Cl", ...counts).balanced, false);
});
test("electron transfer conserves electrons and nuclei and produces full outer levels", () => {
  for (const kind of ["NaCl", "MgO"]) {
    const initial = electronPair(kind, 0),
      final = electronPair(kind, 99);
    assert.deepEqual(initial.protons, final.protons);
    assert.equal(
      initial.electrons.reduce((a, b) => a + b),
      final.electrons.reduce((a, b) => a + b),
    );
    assert.equal(
      final.charges.reduce((a, b) => a + b),
      0,
    );
    assert.equal(final.electrons[0], 10);
    assert.equal(final.electrons[1], kind === "NaCl" ? 18 : 10);
    assert.equal(final.complete, true);
    assert.equal(electronPair(kind, -4).transferred, 0);
  }
});
test("rock salt has a neutral 1:1 fragment and six unlike nearest neighbours in its interior", () => {
  const atoms = rockSaltAtoms();
  assert.equal(
    atoms.filter((a) => a.kind === "Na").length,
    atoms.filter((a) => a.kind === "Cl").length,
  );
  const nearest = atoms.filter(
    (a) => Math.abs(Math.hypot(...a.position) - 2.82) < 1e-8,
  );
  assert.equal(nearest.length, 6);
  assert.ok(nearest.every((a) => a.kind === "Cl"));
});
test("calcite is a 1:1 Ca/CO3 trigonal cell with planar intact carbonate and six oxygen neighbours", () => {
  const { atoms, bonds } = calciteAtoms();
  assert.deepEqual(
    ["Ca", "C", "O"].map((kind) => atoms.filter((a) => a.kind === kind).length),
    [6, 6, 18],
  );
  assert.equal(bonds.length, 18);
  for (const carbon of atoms.filter((a) => a.kind === "C")) {
    const oxygen = bonds
      .filter(([c]) => c === carbon.id)
      .map(([, o]) => atoms.find((a) => a.id === o));
    assert.equal(oxygen.length, 3);
    for (const o of oxygen) {
      assert.equal(o.position[1], carbon.position[1]);
      assert.ok(
        Math.abs(
          Math.hypot(...o.position.map((v, i) => v - carbon.position[i])) -
            CALCITE_CELL.a * CALCITE_CELL.oxygenX,
        ) < 1e-9,
      );
    }
    const vectors = oxygen.map((o) =>
      o.position.map((v, i) => v - carbon.position[i]),
    );
    const dot = vectors[0].reduce((s, v, i) => s + v * vectors[1][i], 0);
    assert.ok(
      Math.abs(
        dot / Math.hypot(...vectors[0]) / Math.hypot(...vectors[1]) + 0.5,
      ) < 1e-9,
    );
  }
  const coordination = calciteCoordination();
  assert.equal(coordination.neighbors.length, 6);
  assert.ok(
    coordination.neighbors.every((n) => n.distance > 2.3 && n.distance < 2.4),
  );
});
test("360 degree projection returns to its original view; educational trends respond to each variable", () => {
  const initial = projectAtom([3, 2, 1], 0, 18),
    rotated = projectAtom([3, 2, 1], 90, 18),
    full = projectAtom([3, 2, 1], 360, 18);
  assert.notEqual(initial.x, rotated.x);
  assert.ok(Math.abs(initial.x - full.x) < 1e-9);
  assert.ok(Math.abs(initial.y - full.y) < 1e-9);
  const base = { pH: 8.1, calcium: 420, alkalinity: 2.4 },
    reference = precipitationModel(base);
  for (const increase of [{ pH: 8.7 }, { calcium: 610 }, { alkalinity: 5.8 }])
    assert.ok(
      precipitationModel({ ...base, ...increase }).tendency >
        reference.tendency,
    );
});
test("two distinct fictional missions share one Hamad identity, four outcomes and five MCQs with 80% passing", () => {
  assert.equal(IONIC_ROLE.scenarios.length, 2);
  for (const s of Object.values(IONIC_SCENARIOS)) {
    assert.strictEqual(s.character, HAMAD);
    assert.match(s.fictionNotice, /did not occur/);
    assert.equal(s.scenes[1].options.length, 4);
    assert.equal(
      new Set(s.scenes[1].options.map((o) => o.consequence)).size,
      4,
    );
    assert.equal(s.exitTicket.mcqs.length, 5);
    for (const q of s.exitTicket.mcqs)
      assert.equal(q.options.filter((o) => o.correct).length, 1);
    const answers = Object.fromEntries(
      s.exitTicket.mcqs.map((q) => [q.id, q.options.find((o) => o.correct).id]),
    );
    const wrong = (q) => q.options.find((o) => !o.correct).id;
    answers[s.exitTicket.mcqs[0].id] = wrong(s.exitTicket.mcqs[0]);
    assert.equal(gradeIonic(s.exitTicket.mcqs, answers).score, 80);
    assert.equal(gradeIonic(s.exitTicket.mcqs, answers).passed, true);
    answers[s.exitTicket.mcqs[1].id] = wrong(s.exitTicket.mcqs[1]);
    assert.equal(gradeIonic(s.exitTicket.mcqs, answers).score, 60);
    assert.equal(gradeIonic(s.exitTicket.mcqs, answers).passed, false);
  }
});
