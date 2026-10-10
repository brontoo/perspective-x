import { useId, useMemo, useRef, useState } from "react";
import {
  IONS,
  formulaResult,
  electronPair,
  rockSaltAtoms,
  calciteAtoms,
  calciteCoordination,
  calciteCartesian,
  projectAtom,
  precipitationModel,
} from "@/data/ionicScience.mjs";
const sub = (value) =>
  String(value).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);
const chargeLabel = (charge) =>
  charge === 0
    ? "neutral"
    : `${Math.abs(charge) === 1 ? "" : Math.abs(charge)}${charge > 0 ? "+" : "−"}`;
export function ElectronTransfer({
  value = { kind: "NaCl", transferred: 0 },
  onChange,
}) {
  const pair = electronPair(value.kind, value.transferred);
  function atom(index, x) {
    const e = pair.electrons[index],
      shells = e > 10 ? [2, 8, e - 10] : e > 2 ? [2, e - 2] : [e];
    return (
      <g key={index}>
        {shells.map((count, shell) => (
          <g key={shell}>
            <circle
              cx={x}
              cy="98"
              r={25 + shell * 22}
              fill="none"
              stroke="#518595"
              strokeWidth="1.5"
            />
            {Array.from({ length: count }, (_, i) => {
              const a = (2 * Math.PI * i) / count;
              return (
                <circle
                  key={i}
                  cx={x + (25 + shell * 22) * Math.cos(a)}
                  cy={98 + (25 + shell * 22) * Math.sin(a)}
                  r="4"
                  fill={shell === shells.length - 1 ? "#f7bf72" : "#78dcde"}
                />
              );
            })}
          </g>
        ))}
        <circle cx={x} cy="98" r="15" fill="#143b4d" />
        <text x={x} y="103" textAnchor="middle" fill="white" fontSize="13">
          {index === 0 ? pair.donor : pair.acceptor}
        </text>
        <text x={x} y="193" textAnchor="middle" fill="#e4f5f8" fontSize="14">
          {pair.protons[index]} protons · {e} electrons ·{" "}
          {chargeLabel(pair.charges[index])}
        </text>
      </g>
    );
  }
  return (
    <section className="im-instrument" aria-label="Electron-transfer model">
      <div className="im-instrument-title">
        <span className="im-station-number">02</span>
        <div>
          <h3>Build an ion. Follow the electron.</h3>
          <p>Chapter 3 · Ion formation · pp. 63–68</p>
        </div>
      </div>
      <label>
        Reference pair{" "}
        <select
          value={value.kind}
          onChange={(e) => onChange({ kind: e.target.value, transferred: 0 })}
        >
          <option value="NaCl">Sodium + chlorine</option>
          <option value="MgO">Magnesium + oxygen</option>
        </select>
      </label>
      <svg
        viewBox="0 0 550 215"
        role="img"
        aria-label={`${pair.donor} has ${pair.electrons[0]} electrons and charge ${chargeLabel(pair.charges[0])}; ${pair.acceptor} has ${pair.electrons[1]} electrons and charge ${chargeLabel(pair.charges[1])}`}
      >
        {atom(0, 135)}
        {atom(1, 415)}
        <path d="M224 98 H326" stroke="#f7bf72" strokeWidth="2" />
        <path
          d="m318 90 10 8-10 8"
          fill="none"
          stroke="#f7bf72"
          strokeWidth="2"
        />
      </svg>
      <p role="status">
        {pair.transferred} of {pair.maximum} valence electrons transferred.{" "}
        {pair.complete
          ? "The cation and anion now have complete outer energy levels. Proton counts stayed unchanged. Opposite charges attract: this electrostatic attraction is the ionic bond."
          : "Move only the outer electron(s). The nucleus stays unchanged."}
      </p>
      <div className="im-actions">
        <button
          onClick={() =>
            onChange({ ...value, transferred: pair.transferred + 1 })
          }
          disabled={pair.complete}
        >
          Transfer one electron
        </button>
        <button
          className="im-secondary"
          onClick={() => onChange({ ...value, transferred: 0 })}
        >
          Reset atoms
        </button>
      </div>
      <small>
        This models formation from elements, not a food experiment. Dissolving
        an existing salt separates its ions; it does not repeat this electron
        transfer.
      </small>
    </section>
  );
}
export function FormulaBuilder({
  value = {
    cation: "Ca",
    anion: "Cl",
    positives: 1,
    negatives: 1,
    checked: false,
  },
  onChange,
}) {
  const result = formulaResult(
    value.cation,
    value.anion,
    value.positives,
    value.negatives,
  );
  function choose(key) {
    const positive = IONS[key].charge > 0;
    onChange({
      ...value,
      [positive ? "cation" : "anion"]: key,
      [positive ? "positives" : "negatives"]: 1,
      checked: false,
    });
  }
  function drop(event, positive) {
    event.preventDefault();
    const key = event.dataTransfer.getData("text/plain");
    if (IONS[key] && IONS[key].charge > 0 === positive) choose(key);
  }
  return (
    <section className="im-instrument" aria-label="Ionic formula builder">
      <div className="im-instrument-title">
        <span className="im-station-number">02</span>
        <div>
          <h3>A formula that balances.</h3>
          <p>Chapter 3 · Formula units · pp. 75–80</p>
        </div>
      </div>
      <p>
        Drag an ion into its tray, or choose it with a button. Build the
        simplest neutral ratio for your proposed mineral.
      </p>
      <div className="im-ion-bank">
        {Object.entries(IONS).map(([key, ion]) => (
          <button
            className="im-ion-chip"
            key={key}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", key)}
            onClick={() => choose(key)}
            aria-label={`Choose ${ion.name} ion`}
          >
            {ion.label}
          </button>
        ))}
      </div>
      <div className="im-formula-trays">
        {[true, false].map((positive) => {
          const ion = IONS[value[positive ? "cation" : "anion"]],
            field = positive ? "positives" : "negatives";
          return (
            <div
              key={String(positive)}
              className="im-drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => drop(e, positive)}
              aria-label={positive ? "Cation drop zone" : "Anion drop zone"}
            >
              <span>{positive ? "Cation" : "Anion"}</span>
              <strong>{ion.label}</strong>
              <div className="im-count">
                <button
                  aria-label={`Remove ${positive ? "cation" : "anion"}`}
                  disabled={value[field] <= 1}
                  onClick={() =>
                    onChange({
                      ...value,
                      [field]: value[field] - 1,
                      checked: false,
                    })
                  }
                >
                  −
                </button>
                <output aria-label={`${positive ? "Cation" : "Anion"} count`}>
                  {value[field]}
                </output>
                <button
                  aria-label={`Add ${positive ? "cation" : "anion"}`}
                  disabled={value[field] >= 6}
                  onClick={() =>
                    onChange({
                      ...value,
                      [field]: value[field] + 1,
                      checked: false,
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => onChange({ ...value, checked: true })}>
        Check charge balance
      </button>
      {value.checked && (
        <div className="im-reading" role="status">
          <strong>
            {sub(result.formula)} · Net charge{" "}
            {result.charge === 0 ? "0" : chargeLabel(result.charge)}
          </strong>
          <p>
            {result.balanced
              ? `Neutral, simplest ratio · ${result.name}.`
              : result.charge === 0
                ? "Neutral, but simplify the ion ratio."
                : "The charges do not balance. Adjust the number of ions."}
          </p>
          <small>
            Your constructed formula is a hypothesis, not confirmation of the
            unknown deposit.
          </small>
        </div>
      )}
    </section>
  );
}
const colours = {
  Na: "#f7b765",
  Cl: "#64e0ca",
  Ca: "#bba4f4",
  C: "#e3edf0",
  O: "#f98c9d",
};
const radii = { Na: 6, Cl: 9, Ca: 8, C: 4, O: 6 };
export function CrystalExplorer({
  value = { model: "NaCl", yaw: 30, pitch: 18, explored: false },
  onChange,
}) {
  const gradient = useId().replaceAll(":", ""),
    pointer = useRef(null);
  const [angle, setAngle] = useState({ yaw: value.yaw, pitch: value.pitch });
  const [coordination, setCoordination] = useState(false),
    [shear, setShear] = useState(false);
  const model = value.model || "NaCl";
  const structure = useMemo(
    () =>
      model === "NaCl" ? { atoms: rockSaltAtoms(), bonds: [] } : calciteAtoms(),
    [model],
  );
  const center =
    model === "NaCl" ? [1.41, 1.41, 1.41] : calciteCartesian([0.5, 0.5, 0.5]);
  const selected = model === "NaCl" ? [0, 0, 0] : calciteCoordination().origin;
  const neighbors =
    model === "NaCl"
      ? [
          [2.82, 0, 0],
          [-2.82, 0, 0],
          [0, 2.82, 0],
          [0, -2.82, 0],
          [0, 0, 2.82],
          [0, 0, -2.82],
        ]
      : calciteCoordination().neighbors.map((n) => n.position);
  const atoms = [...structure.atoms];
  if (coordination && model !== "NaCl")
    neighbors.forEach((position, i) => {
      if (
        !atoms.some(
          (a) =>
            Math.hypot(...a.position.map((v, k) => v - position[k])) < 0.001,
        )
      )
        atoms.push({
          id: `periodic-${i}`,
          kind: "O",
          position,
          periodic: true,
        });
    });
  const project = (position) =>
    projectAtom(
      position.map((v, i) => v - center[i]),
      angle.yaw,
      angle.pitch,
      360,
      13,
    );
  const projected = atoms
    .map((a) => ({
      ...a,
      screen: project(
        a.position.map(
          (v, i) =>
            v +
            (shear && model === "NaCl" && a.position[1] >= 0 && i === 0
              ? 2.82
              : 0),
        ),
      ),
    }))
    .sort((a, b) => b.screen.depth - a.screen.depth);
  const map = Object.fromEntries(projected.map((a) => [a.id, a.screen]));
  function rotate(next) {
    setAngle(next);
    onChange({ ...value, ...next, explored: true });
  }
  function down(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointer.current = { x: e.clientX, y: e.clientY, ...angle };
  }
  function move(e) {
    if (pointer.current)
      setAngle({
        yaw:
          (((pointer.current.yaw + (e.clientX - pointer.current.x) * 0.7) %
            360) +
            360) %
          360,
        pitch: Math.max(
          -60,
          Math.min(
            60,
            pointer.current.pitch + (e.clientY - pointer.current.y) * 0.4,
          ),
        ),
      });
  }
  function up() {
    if (pointer.current) {
      pointer.current = null;
      onChange({ ...value, ...angle, explored: true });
    }
  }
  return (
    <section
      className="im-instrument"
      aria-label="360 degree ionic crystal explorer"
    >
      <div className="im-instrument-title">
        <span className="im-station-number">03</span>
        <div>
          <h3>Inside the crystal.</h3>
          <p>Rotate real 3D coordinates · Drag, touch or use the controls</p>
        </div>
      </div>
      <label>
        Structure reference{" "}
        <select
          value={model}
          onChange={(e) => {
            setShear(false);
            setCoordination(false);
            onChange({ ...value, model: e.target.value, explored: true });
          }}
        >
          <option value="NaCl">Sodium chloride · rock salt</option>
          <option value="calcite">Calcium carbonate · calcite</option>
        </select>
      </label>
      <svg
        className="im-crystal-view"
        data-yaw={angle.yaw}
        data-pitch={angle.pitch}
        viewBox="0 0 360 360"
        role="img"
        aria-label={`${model === "NaCl" ? "NaCl rock-salt lattice" : "Calcite trigonal crystal with planar carbonate groups"}, rotation ${Math.round(angle.yaw)} degrees`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onLostPointerCapture={up}
      >
        <defs>
          {Object.entries(colours).map(([kind, colour]) => (
            <radialGradient
              key={kind}
              id={`${gradient}-${kind}`}
              cx="30%"
              cy="25%"
            >
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.3" stopColor={colour} />
              <stop offset="1" stopColor={colour} stopOpacity="0.65" />
            </radialGradient>
          ))}
        </defs>
        {structure.bonds.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={map[a].x}
            y1={map[a].y}
            x2={map[b].x}
            y2={map[b].y}
            stroke="#d2e8ef"
            strokeWidth="2.5"
          />
        ))}
        {coordination &&
          neighbors.map((n, i) => {
            const a = project(selected),
              b = project(n);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#ffe0a5"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            );
          })}
        {projected.map((a) => (
          <circle
            key={a.id}
            data-kind={a.kind}
            cx={a.screen.x}
            cy={a.screen.y}
            r={radii[a.kind] * a.screen.factor}
            fill={`url(#${gradient}-${a.kind})`}
            stroke={colours[a.kind]}
            strokeWidth="0.65"
            opacity={a.periodic ? 0.55 : 1}
          />
        ))}
      </svg>
      <div className="im-legend">
        {(model === "NaCl" ? ["Na", "Cl"] : ["Ca", "C", "O"]).map((kind) => (
          <span key={kind}>
            <i style={{ background: colours[kind] }} />
            {kind === "Na"
              ? "Na⁺"
              : kind === "Cl"
                ? "Cl⁻"
                : kind === "Ca"
                  ? "Ca²⁺"
                  : `${kind} within CO₃²⁻`}
          </span>
        ))}
      </div>
      <label>
        Horizontal rotation{" "}
        <input
          type="range"
          min="0"
          max="360"
          value={angle.yaw}
          onChange={(e) => rotate({ ...angle, yaw: Number(e.target.value) })}
        />
      </label>
      <label>
        Tilt{" "}
        <input
          type="range"
          min="-60"
          max="60"
          value={angle.pitch}
          onChange={(e) => rotate({ ...angle, pitch: Number(e.target.value) })}
        />
      </label>
      <div className="im-actions">
        <button
          onClick={() => rotate({ ...angle, yaw: (angle.yaw + 90) % 360 })}
        >
          Rotate 90°
        </button>
        <button
          className="im-secondary"
          disabled={shear}
          onClick={() => {
            setCoordination((v) => !v);
            onChange({ ...value, explored: true });
          }}
        >
          {coordination ? "Hide coordination" : "Show coordination"}
        </button>
        <button
          className="im-secondary"
          onClick={() => {
            setShear(false);
            rotate({ yaw: 30, pitch: 18 });
          }}
        >
          Reset view
        </button>
      </div>
      <p>
        {model === "NaCl"
          ? "A repeating 1:1 lattice, not isolated NaCl molecules. Each interior ion has six nearest opposite-charge neighbours; surface ions have fewer visible neighbours."
          : "Calcite: a trigonal crystal in a hexagonal conventional cell (R−3c). Planar CO₃²⁻ groups contain covalent C–O bonds; Ca²⁺ and carbonate interact ionically. This is not a cubic NaCl lattice."}
      </p>
      {coordination && (
        <p role="status">
          {model === "NaCl"
            ? "Six nearest opposite-charge ions surround the selected interior Na⁺."
            : "Six oxygen neighbours from carbonate groups surround the selected Ca²⁺. Periodic neighbours beyond the cell are translucent."}
        </p>
      )}
      {model === "NaCl" && (
        <>
          <button
            className="im-secondary"
            onClick={() => {
              setCoordination(false);
              setShear((v) => !v);
              onChange({ ...value, explored: true });
            }}
          >
            {shear ? "Restore lattice" : "Apply shear to NaCl model"}
          </button>
          {shear && (
            <p role="status">
              The upper layers shifted by one ion spacing. Like charges now line
              up across the slip plane; repulsion explains ionic brittleness.
              The unshifted crystal was ordered.
            </p>
          )}
        </>
      )}
      <small>
        Ball sizes are illustrative; positions follow the structure. Calcite is
        an extension reference. The textbook’s aragonite is a different CaCO₃
        crystal form.
      </small>
    </section>
  );
}
export function WaterSimulator({
  value = { pH: 8.7, calcium: 610, alkalinity: 5.8, tested: false },
  onChange,
}) {
  const result = precipitationModel(value);
  return (
    <section className="im-instrument" aria-label="Water chemistry simulator">
      <div className="im-instrument-title">
        <span className="im-station-number">04</span>
        <div>
          <h3>Test the trend, not the tank.</h3>
          <p>Isolated virtual sample · Fictional measurements</p>
        </div>
      </div>
      <div className="im-water-layout">
        <div className="im-water-vial">
          <div
            style={{
              background: `rgba(232,248,250,${0.12 + result.cloudiness * 0.7})`,
            }}
          />
          <span>Virtual sample</span>
        </div>
        <div>
          {[
            ["pH", "pH", 7.8, 9.2, 0.1],
            ["calcium", "Calcium (mg/L)", 200, 650, 10],
            ["alkalinity", "Alkalinity (meq/L)", 2, 8, 0.2],
          ].map(([key, label, min, max, step]) => (
            <label key={key}>
              {label} <output>{value[key]}</output>
              <input
                aria-label={label}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[key]}
                onChange={(e) =>
                  onChange({
                    ...value,
                    [key]: Number(e.target.value),
                    tested: false,
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>
      <div className="im-actions">
        <button onClick={() => onChange({ ...value, tested: true })}>
          Run virtual water test
        </button>
        <button
          className="im-secondary"
          onClick={() =>
            onChange({ pH: 8.1, calcium: 420, alkalinity: 2.4, tested: false })
          }
        >
          Load starting reference
        </button>
        <button
          className="im-secondary"
          onClick={() =>
            onChange({ pH: 8.7, calcium: 610, alkalinity: 5.8, tested: false })
          }
        >
          Load incident sample
        </button>
      </div>
      {value.tested && (
        <p className="im-reading" role="status">
          {result.description}. Relative tendency: {result.tendency.toFixed(2)}.
          Sample pH {value.pH}; calcium {value.calcium} mg/L; alkalinity{" "}
          {value.alkalinity} meq/L.
        </p>
      )}
      <small>
        A qualitative educational trend model, not a seawater saturation
        calculation, dosing guide or animal-care tool. Reference readings belong
        to this fictional simulation, not the real aquarium.
      </small>
    </section>
  );
}
