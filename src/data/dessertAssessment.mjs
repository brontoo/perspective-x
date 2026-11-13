// Presentation order is fixed for an attempt and saved with the existing notebook JSON.
const range = (n) => Array.from({ length: n }, (_, i) => i);
const valid = (values, n) =>
  Array.isArray(values) &&
  values.length === n &&
  new Set(values).size === n &&
  values.every((v) => Number.isInteger(v) && v >= 0 && v < n);
export function createDessertOrder({ shuffle = true, seed } = {}) {
  let value =
    seed ??
    globalThis.crypto?.getRandomValues(new Uint32Array(1))[0] ??
    Math.floor(Math.random() * 0xffffffff);
  const original = value >>> 0;
  const random = () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = (n) => {
    const a = range(n);
    if (shuffle)
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    return a;
  };
  return {
    seed: original,
    questions: order(5),
    options: Object.fromEntries(
      ["d1", "d2", "d3", "d4", "d5", "enrichment"].map((id) => [id, order(4)]),
    ),
  };
}
export function restoreDessertOrder(saved) {
  if (
    !valid(saved?.questions, 5) ||
    !["d1", "d2", "d3", "d4", "d5", "enrichment"].every((id) =>
      valid(saved?.options?.[id], 4),
    )
  )
    return createDessertOrder({ shuffle: false, seed: 0 });
  return saved;
}
export const DESSERT_ENRICHMENT = {
  id: "enrichment",
  title: "Beyond the evidence · Advanced enrichment",
  question:
    "Two salts contain Mg²⁺. One contains Cl⁻ and the other O²⁻. Which pair of neutral formulas and explanation of molten conductivity is correct?",
  options: [
    {
      id: "balanced-mobile-ions",
      text: "MgCl₂ and MgO; the molten salts conduct because their ions can move.",
    },
    {
      id: "one-to-one",
      text: "MgCl and MgO; equal numbers of ions always cancel the charges.",
    },
    {
      id: "electrons",
      text: "MgCl₂ and MgO; delocalized electrons carry charge through the molten salts.",
    },
    {
      id: "wrong-oxide",
      text: "MgCl₂ and MgO₂; both formulas need two anions for every cation.",
    },
  ],
  explanation:
    "One Mg²⁺ balances two Cl⁻ ions, but one Mg²⁺ balances one O²⁻ ion. In molten ionic compounds, mobile ions carry charge; delocalized electrons describe metallic bonding.",
};
export function gradeDessertEnrichment(answer) {
  const attempted = DESSERT_ENRICHMENT.options.some((o) => o.id === answer);
  const correct = attempted && answer === "balanced-mobile-ions";
  return {
    answer: attempted ? answer : null,
    attempted,
    correct,
    bonusPoints: correct ? 10 : 0,
    maximumBonusPoints: 10,
  };
}
