import { useRef, useState } from "react";
import {
  POWDER_READINGS,
  electronPair,
  formulaResult,
} from "@/data/ionicScience.mjs";
import {
  ElectronTransfer,
  FormulaBuilder,
  CrystalExplorer,
  WaterSimulator,
} from "./IonicModels";
export function evidenceText(record) {
  return (record?.evidence || [])
    .map((e) => `${e.label}: ${e.observation}`)
    .join("\n");
}
const defaultRecord = (id) =>
  id === "ionic_dessert_mystery"
    ? {
        evidence: [],
        calibrated: false,
        electron: { kind: "NaCl", transferred: 0 },
        identities: { A: "", B: "", C: "" },
      }
    : {
        evidence: [],
        formula: {
          cation: "Ca",
          anion: "Cl",
          positives: 1,
          negatives: 1,
          checked: false,
        },
        crystal: { model: "NaCl", yaw: 30, pitch: 18, explored: false },
        water: { pH: 8.7, calcium: 610, alkalinity: 5.8, tested: false },
        mineral: "",
      };
const minerals = {
  calcium:
    "Calcium-ion screening signal: present in the isolated deposit extract",
  solubility: "Very little deposit dissolves in a water-only sample",
  carbonate:
    "Carbon dioxide detected during a controlled virtual dilute-acid test on a separate sample",
  fingerprint:
    "Three observed diffraction peaks: 29.4°, 39.4°, 43.1° (illustrative Cu Kα reference comparison)",
};
export default function IonicInvestigation({
  scenario,
  initialRecord,
  onDraft,
  onComplete,
  mode,
  station = "all",
  embedded = false,
  onInteraction,
  canContinue = true,
}) {
  const dessert = scenario.id === "ionic_dessert_mystery";
  const [draft, setDraft] = useState(() => ({
    ...defaultRecord(scenario.id),
    ...initialRecord,
  }));
  const current = useRef(draft),
    [sample, setSample] = useState("A");
  function update(patch) {
    const next = { ...current.current, ...patch };
    current.current = next;
    setDraft(next);
    onDraft(next);
    return next;
  }
  function collect(id, label, observation, patch = {}) {
    const evidence = [
      ...current.current.evidence.filter((e) => e.id !== id),
      { id, label, observation, collectedAt: new Date().toISOString() },
    ];
    const record = update({ ...patch, evidence, submitted: false });
    onInteraction?.({ type: id, record });
  }
  function measure(test) {
    const reading = POWDER_READINGS[sample];
    const observation =
      test === "conductivity"
        ? `${reading.conductivity} μS/cm in water; negligible conductivity as a dry solid`
        : test === "pH"
          ? `pH ${reading.pH.toFixed(1)}`
          : reading.fizz;
    collect(`${sample}-${test}`, `Sample ${sample} · ${test}`, observation);
  }
  const measured = (id) => draft.evidence.some((e) => e.id === id);
  const ready = dessert
    ? draft.calibrated &&
      ["A", "B", "C"].every((s) =>
        ["conductivity", "pH", "fizz"].every((t) => measured(`${s}-${t}`)),
      ) &&
      electronPair(draft.electron.kind, draft.electron.transferred).complete &&
      Object.values(draft.identities).every(Boolean)
    : Object.keys(minerals).every(measured) &&
      draft.formula.checked &&
      formulaResult(
        draft.formula.cation,
        draft.formula.anion,
        draft.formula.positives,
        draft.formula.negatives,
      ).balanced &&
      draft.crystal.explored &&
      draft.water.tested &&
      !!draft.mineral;
  const identified = dessert
    ? Object.entries(POWDER_READINGS).every(
        ([s, r]) => draft.identities[s] === r.identity,
      )
    : draft.mineral === "calcium-carbonate" &&
      draft.formula.cation === "Ca" &&
      draft.formula.anion === "CO3" &&
      draft.formula.positives === 1 &&
      draft.formula.negatives === 1;
  function submit(e) {
    e.preventDefault();
    if (ready) {
      const record = update({ submitted: true });
      onInteraction?.({ type: "identity", correct: identified, record });
    }
  }
  return (
    <div className="im-investigation">
      {!embedded && (
        <header className="im-stage-header">
          <p className="im-eyebrow">Chapter 2 · Find the Clues</p>
          <h2>
            {dessert
              ? "Evidence leaves a trail. Follow it."
              : "A white deposit. A mineral story."}
          </h2>
          <p>
            {dessert
              ? "Test each powder, investigate ion formation, then commit your own identification."
              : "Collect independent mineral evidence, build your hypothesis and explore the reference structures."}
          </p>
        </header>
      )}
      {mode === "beginner" && (
        <p className="im-guidance">
          Guided approach: collect an observation, explain what it supports,
          then compare it with a second independent test. Your initial
          hypothesis can change.
        </p>
      )}
      {mode === "high-achievers" && (
        <p className="im-guidance">
          Challenge: distinguish identification evidence from evidence that only
          narrows the candidates. Explain one uncertainty in your
          recommendation.
        </p>
      )}
      <div className="im-investigation-grid">
        <div className="im-stations">
          {dessert ? (
            <>
              <section
                className="im-instrument"
                aria-label="Virtual conductivity testing"
              >
                <div className="im-instrument-title">
                  <span className="im-station-number">01</span>
                  <div>
                    <h3>Three powders. No assumptions.</h3>
                    <p>0.10 g / 100 mL water · 25°C · Simulated readings</p>
                  </div>
                </div>
                <div className="im-actions">
                  <button
                    className="im-secondary"
                    onClick={() =>
                      collect(
                        "control",
                        "Water-only control",
                        "2 μS/cm background reading",
                        { calibrated: true },
                      )
                    }
                  >
                    {draft.calibrated
                      ? "Control recorded"
                      : "Calibrate with water-only control"}
                  </button>
                </div>
                <div
                  className="im-sample-tabs"
                  aria-label="Choose powder sample"
                >
                  {["A", "B", "C"].map((s) => (
                    <button
                      key={s}
                      aria-pressed={sample === s}
                      onClick={() => setSample(s)}
                    >
                      Sample {s}
                      <span className="im-powder-jar" aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <p>
                  White appearance is shared by every candidate. Use fresh
                  virtual aliquots for each test; never taste an unknown.
                </p>
                <div className="im-actions">
                  <button
                    disabled={!draft.calibrated}
                    onClick={() => measure("conductivity")}
                  >
                    Measure conductivity
                  </button>
                  <button onClick={() => measure("pH")}>Measure pH</button>
                  <button onClick={() => measure("fizz")}>
                    Run isolated acid test
                  </button>
                </div>
                <div className="im-measurements" aria-live="polite">
                  {draft.evidence
                    .filter((e) => e.id.startsWith(`${sample}-`))
                    .map((e) => (
                      <p key={e.id}>
                        <strong>{e.label}</strong>
                        <br />
                        {e.observation}
                      </p>
                    ))}
                </div>
                <small>
                  Conductivity indicates mobile charge carriers, not a unique
                  salt identity. Gas and pH tests are supporting evidence beyond
                  the chapter’s core ionic-bond model. Readings are
                  illustrative, not analytical specifications.
                </small>
              </section>
              <ElectronTransfer
                value={draft.electron}
                onChange={(value) => {
                  const pair = electronPair(value.kind, value.transferred);
                  if (pair.complete)
                    collect(
                      "electron",
                      "Ion formation model",
                      `${pair.donor}: ${pair.protons[0]} protons, ${pair.electrons[0]} electrons; ${pair.acceptor}: ${pair.protons[1]} protons, ${pair.electrons[1]} electrons. Electron loss produces the cation; electron gain produces the anion.`,
                      { electron: value },
                    );
                  else update({ electron: value, submitted: false });
                }}
              />
            </>
          ) : (
            <>
              {(station === "all" || Object.hasOwn(minerals, station)) && (
                <section
                  className="im-instrument"
                  aria-label="Mineral analysis"
                >
                  <div className="im-instrument-title">
                    <span className="im-station-number">01</span>
                    <div>
                      <h3>What is the deposit telling you?</h3>
                      <p>Isolated mineral sample · Not animal-tank testing</p>
                    </div>
                  </div>
                  <div className="im-actions">
                    {Object.keys(minerals)
                      .filter((key) => station === "all" || station === key)
                      .map((key) => (
                        <button
                          key={key}
                          onClick={() =>
                            collect(
                              key,
                              `${key[0].toUpperCase() + key.slice(1)} test`,
                              minerals[key],
                            )
                          }
                        >
                          {key === "calcium"
                            ? "Run calcium screening"
                            : key === "solubility"
                              ? "Test water solubility"
                              : key === "carbonate"
                                ? "Run isolated carbonate test"
                                : "Compare mineral fingerprint"}
                        </button>
                      ))}
                  </div>
                  <div className="im-measurements" aria-live="polite">
                    {draft.evidence
                      .filter((e) => Object.hasOwn(minerals, e.id))
                      .map((e) => (
                        <p key={e.id}>
                          <strong>{e.label}</strong>
                          <br />
                          {e.observation}
                        </p>
                      ))}
                  </div>
                  <details>
                    <summary>Candidate reference library</summary>
                    <table>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Composition / reference evidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Sodium chloride</td>
                          <td>
                            Na⁺ / Cl⁻; readily soluble; no carbonate gas signal;
                            peaks 27.4°, 31.7°, 45.4°
                          </td>
                        </tr>
                        <tr>
                          <td>Calcium carbonate (calcite reference)</td>
                          <td>
                            Ca²⁺ / CO₃²⁻; low water solubility; carbonate gas
                            signal; peaks 29.4°, 39.4°, 43.1°
                          </td>
                        </tr>
                        <tr>
                          <td>Calcium sulfate (gypsum reference)</td>
                          <td>
                            Calcium present; no carbonate gas signal; peaks
                            11.6°, 20.7°, 23.4°
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p>
                      These are candidate comparisons, not the unknown’s
                      identification. Chemistry and diffraction are simplified
                      reference evidence.
                    </p>
                  </details>
                  <small>
                    Marine water’s conductivity cannot identify the solid; it
                    already contains many dissolved ions. A calcium signal or
                    acid reaction alone is also insufficient.
                  </small>
                </section>
              )}
              {(station === "all" || station === "formula") && (
                <FormulaBuilder
                  value={draft.formula}
                  onChange={(value) => {
                    const r = formulaResult(
                      value.cation,
                      value.anion,
                      value.positives,
                      value.negatives,
                    );
                    if (value.checked)
                      collect(
                        "formula",
                        "Constructed formula",
                        `${r.formula}; net charge ${r.charge}; ${r.minimal ? "simplest ratio" : "ratio needs simplification"}`,
                        { formula: value },
                      );
                    else update({ formula: value, submitted: false });
                  }}
                />
              )}
              {(station === "all" || station === "crystal") && (
                <CrystalExplorer
                  value={draft.crystal}
                  onChange={(value) =>
                    collect(
                      "crystal",
                      "Crystal reference exploration",
                      `${value.model === "NaCl" ? "Rock-salt lattice" : "Calcite carbonate groups"} explored; horizontal rotation ${Math.round(value.yaw)}°.`,
                      { crystal: value },
                    )
                  }
                />
              )}
              {(station === "all" || station === "water") && (
                <WaterSimulator
                  value={draft.water}
                  onChange={(value) => {
                    if (value.tested)
                      collect(
                        "water",
                        "Virtual water chemistry",
                        `pH ${value.pH}; calcium ${value.calcium} mg/L; alkalinity ${value.alkalinity} meq/L. Qualitative trend only.`,
                        { water: value },
                      );
                    else update({ water: value, submitted: false });
                  }}
                />
              )}
            </>
          )}
          {(dessert || station === "all" || station === "identity") && (
            <form className="im-instrument" onSubmit={submit}>
              <h3>Commit your scientific hypothesis.</h3>
              {dessert ? (
                ["A", "B", "C"].map((s) => (
                  <label key={s}>
                    Proposed identity for Sample {s}
                    <select
                      value={draft.identities[s]}
                      required
                      disabled={draft.submitted}
                      onChange={(e) =>
                        update({
                          identities: {
                            ...draft.identities,
                            [s]: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Choose from the candidate set</option>
                      <option value="sugar">Sugar (sucrose)</option>
                      <option value="sodium-chloride">Sodium chloride</option>
                      <option value="hydrogen-carbonate">
                        Sodium hydrogen carbonate
                      </option>
                    </select>
                  </label>
                ))
              ) : (
                <label>
                  Proposed deposit identity
                  <select
                    value={draft.mineral}
                    required
                    disabled={draft.submitted}
                    onChange={(e) => update({ mineral: e.target.value })}
                  >
                    <option value="">Choose a mineral hypothesis</option>
                    <option value="sodium-chloride">Sodium chloride</option>
                    <option value="calcium-carbonate">Calcium carbonate</option>
                    <option value="calcium-sulfate">Calcium sulfate</option>
                  </select>
                </label>
              )}
              <p>
                {dessert
                  ? "Collect all nine sample readings and complete one electron-transfer model."
                  : "Collect all four mineral tests, check a neutral formula, explore the crystal and run the water simulator."}
              </p>
              {!draft.submitted && (
                <button type="submit" disabled={!ready}>
                  Submit identification
                </button>
              )}
              {draft.submitted && (
                <div className="im-feedback" role="status">
                  <strong>
                    {identified
                      ? "Your identification is supported."
                      : "Your initial hypothesis needs revision."}
                  </strong>
                  <p>
                    {dessert
                      ? "In this candidate set, A is sugar; B is sodium hydrogen carbonate; C is sodium chloride. Sugar produces few mobile ions. Both salts conduct; B’s alkaline pH and carbon dioxide signal distinguish it. Identity evidence does not certify food suitability."
                      : "The independent evidence supports calcium carbonate, CaCO₃. The 1:1 Ca²⁺ / CO₃²⁻ formula is neutral. Calcium screening, carbonate behaviour, limited solubility and the fingerprint work together; conductivity or appearance alone would be insufficient."}
                  </p>
                  <div className="im-actions">
                    <button
                      type="button"
                      disabled={!canContinue || (embedded && !identified)}
                      onClick={() =>
                        onComplete({
                          selectedOption: identified ? "A" : "B",
                          justification: evidenceText(draft),
                          identifications: dessert
                            ? draft.identities
                            : draft.mineral,
                          scientificFeedback: identified
                            ? "Supported hypothesis"
                            : "Initial hypothesis revised after feedback",
                        })
                      }
                    >
                      Continue to Make the Call →
                    </button>
                    <button
                      type="button"
                      className="im-secondary"
                      onClick={() => update({ submitted: false })}
                    >
                      Revisit my hypothesis
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
        {!embedded && (
          <aside className="im-evidence-ledger">
            <p className="im-eyebrow">Your evidence ledger</p>
            <h3>{draft.evidence.length} observations collected</h3>
            <p>
              Captured in your Mission Notebook and saved through your account’s
              existing mission record.
            </p>
            <ol>
              {draft.evidence.map((e) => (
                <li key={e.id}>
                  <strong>{e.label}</strong>
                  <p>{e.observation}</p>
                </li>
              ))}
            </ol>
            {!draft.evidence.length && (
              <p>Start with a controlled measurement.</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
