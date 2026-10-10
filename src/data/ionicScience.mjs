/** Pure chemistry/geometry shared by the interactive instruments and tests. */
export const IONS = {
  Na: { label: "Na⁺", formula: "Na", charge: 1, name: "sodium" },
  Ca: { label: "Ca²⁺", formula: "Ca", charge: 2, name: "calcium" },
  Mg: { label: "Mg²⁺", formula: "Mg", charge: 2, name: "magnesium" },
  Al: { label: "Al³⁺", formula: "Al", charge: 3, name: "aluminium" },
  NH4: {
    label: "NH₄⁺",
    formula: "NH4",
    charge: 1,
    name: "ammonium",
    polyatomic: true,
  },
  Cl: { label: "Cl⁻", formula: "Cl", charge: -1, name: "chloride" },
  CO3: {
    label: "CO₃²⁻",
    formula: "CO3",
    charge: -2,
    name: "carbonate",
    polyatomic: true,
  },
  HCO3: {
    label: "HCO₃⁻",
    formula: "HCO3",
    charge: -1,
    name: "hydrogen carbonate",
    polyatomic: true,
  },
  OH: {
    label: "OH⁻",
    formula: "OH",
    charge: -1,
    name: "hydroxide",
    polyatomic: true,
  },
  SO4: {
    label: "SO₄²⁻",
    formula: "SO4",
    charge: -2,
    name: "sulfate",
    polyatomic: true,
  },
};
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
export function formulaResult(cation, anion, positives, negatives) {
  const p = IONS[cation],
    n = IONS[anion];
  if (
    !p ||
    !n ||
    p.charge <= 0 ||
    n.charge >= 0 ||
    !Number.isInteger(positives) ||
    !Number.isInteger(negatives) ||
    positives < 1 ||
    negatives < 1 ||
    positives > 6 ||
    negatives > 6
  )
    return { valid: false, balanced: false };
  const charge = p.charge * positives + n.charge * negatives;
  const minimal = gcd(positives, negatives) === 1;
  const part = (ion, count) =>
    `${ion.polyatomic && count > 1 ? `(${ion.formula})` : ion.formula}${count > 1 ? count : ""}`;
  return {
    valid: true,
    charge,
    balanced: charge === 0 && minimal,
    minimal,
    formula: part(p, positives) + part(n, negatives),
    name: `${p.name} ${n.name}`,
  };
}
export const POWDER_READINGS = {
  A: {
    conductivity: 4,
    pH: 7.0,
    fizz: "No bubbles observed",
    identity: "sugar",
  },
  B: {
    conductivity: 1100,
    pH: 8.3,
    fizz: "Bubbles of carbon dioxide detected",
    identity: "hydrogen-carbonate",
  },
  C: {
    conductivity: 1930,
    pH: 7.0,
    fizz: "No bubbles observed",
    identity: "sodium-chloride",
  },
};
export function electronPair(kind, transferred = 0) {
  const pair =
    kind === "MgO"
      ? {
          donor: "Mg",
          acceptor: "O",
          protons: [12, 8],
          initial: [12, 8],
          maximum: 2,
        }
      : {
          donor: "Na",
          acceptor: "Cl",
          protons: [11, 17],
          initial: [11, 17],
          maximum: 1,
        };
  const count = Math.max(
    0,
    Math.min(
      pair.maximum,
      Number.isFinite(transferred) ? Math.floor(transferred) : 0,
    ),
  );
  return {
    ...pair,
    transferred: count,
    electrons: [pair.initial[0] - count, pair.initial[1] + count],
    charges: [count, -count],
    complete: count === pair.maximum,
  };
}
export function precipitationModel({ pH, calcium, alkalinity }) {
  // Qualitative comparison against this fictional system's starting condition.
  // Not a saturation calculation, seawater equilibrium solver or dosing tool.
  const tendency = (calcium / 420) * (alkalinity / 2.4) * 10 ** (pH - 8.1);
  return {
    tendency,
    cloudiness: Math.max(0, Math.min(1, (tendency - 1) / 8)),
    description:
      tendency > 3
        ? "High precipitation tendency"
        : tendency > 1.5
          ? "Elevated precipitation tendency"
          : "Lower precipitation tendency",
  };
}
export function rockSaltAtoms() {
  const atoms = [];
  for (let x = -2; x <= 3; x++)
    for (let y = -2; y <= 3; y++)
      for (let z = -2; z <= 3; z++)
        atoms.push({
          id: `${x},${y},${z}`,
          kind: (x + y + z) % 2 === 0 ? "Na" : "Cl",
          position: [x * 2.82, y * 2.82, z * 2.82],
        });
  return atoms;
}
export const CALCITE_CELL = { a: 4.99, c: 17.061, oxygenX: 0.2578 };
export function calciteCartesian([x, y, z]) {
  return [
    CALCITE_CELL.a * (x - y / 2),
    CALCITE_CELL.c * z,
    (CALCITE_CELL.a * Math.sqrt(3) * y) / 2,
  ];
}
const centers = [
  [0, 0, 0],
  [2 / 3, 1 / 3, 1 / 3],
  [1 / 3, 2 / 3, 2 / 3],
];
const wrap = (x) => ((x % 1) + 1) % 1;
export function calciteAtoms() {
  const atoms = [],
    bonds = [];
  centers.forEach((r, i) => {
    [0, 0.5].forEach((z, j) =>
      atoms.push({
        id: `Ca-${i}-${j}`,
        kind: "Ca",
        position: calciteCartesian([r[0], r[1], wrap(r[2] + z)]),
      }),
    );
    [0.25, 0.75].forEach((z, j) => {
      const carbon = [r[0], r[1], wrap(r[2] + z)],
        id = `C-${i}-${j}`,
        sign = j === 0 ? 1 : -1,
        x = CALCITE_CELL.oxygenX * sign;
      atoms.push({ id, kind: "C", position: calciteCartesian(carbon) });
      [
        [x, 0],
        [0, x],
        [-x, -x],
      ].forEach(([dx, dy], k) => {
        const oxygenId = `O-${i}-${j}-${k}`;
        atoms.push({
          id: oxygenId,
          kind: "O",
          position: calciteCartesian([
            carbon[0] + dx,
            carbon[1] + dy,
            carbon[2],
          ]),
        });
        bonds.push([id, oxygenId]);
      });
    });
  });
  return { atoms, bonds };
}
export function calciteCoordination() {
  const origin = calciteCartesian([2 / 3, 1 / 3, 1 / 3]),
    neighbors = [];
  const { atoms } = calciteAtoms();
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) {
        const offset = calciteCartesian([i, j, k]);
        atoms
          .filter((a) => a.kind === "O")
          .forEach((atom) => {
            const position = atom.position.map((v, index) => v + offset[index]);
            neighbors.push({
              position,
              distance: Math.hypot(
                ...position.map((v, index) => v - origin[index]),
              ),
            });
          });
      }
  return {
    origin,
    neighbors: neighbors.sort((a, b) => a.distance - b.distance).slice(0, 6),
  };
}
export function projectAtom(position, yaw, pitch, size = 360, scale = 15) {
  const a = (yaw * Math.PI) / 180,
    b = (pitch * Math.PI) / 180;
  const [x, y, z] = position,
    rx = x * Math.cos(a) + z * Math.sin(a),
    rz = -x * Math.sin(a) + z * Math.cos(a);
  const ry = y * Math.cos(b) - rz * Math.sin(b),
    depth = y * Math.sin(b) + rz * Math.cos(b);
  const perspective = 50 / (50 + depth);
  return {
    x: size / 2 + rx * scale * perspective,
    y: size / 2 - ry * scale * perspective,
    depth,
    factor: perspective,
  };
}
export function gradeIonic(questions, answers) {
  const responses = questions.map((q) => ({
    questionId: q.id,
    selectedOption: answers[q.id] || null,
    isCorrect: q.options.some((o) => o.id === answers[q.id] && o.correct),
  }));
  const score = Math.round(
    (100 * responses.filter((r) => r.isCorrect).length) / questions.length,
  );
  return {
    score,
    passed: score >= 80,
    answers: responses,
    mcq_answers: responses.map((r, index) => ({
      questionId: index,
      option: r.selectedOption,
      isCorrect: r.isCorrect,
    })),
  };
}
