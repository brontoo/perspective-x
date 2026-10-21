import { useId, useRef, useState } from "react";
import { ArrowRight, FlaskConical, RotateCcw } from "lucide-react";
import { precipitationModel } from "@/data/ionicScience.mjs";
import "./water-chemistry-lab.css";

const REFERENCE = { pH: 8.1, calcium: 420, alkalinity: 2.4 };
const INCIDENT = { pH: 8.7, calcium: 610, alkalinity: 5.8 };
const FACTORS = [
  { key: "pH", label: "pH", min: 7.8, max: 9.2, step: 0.1,
    help: "How acidic or alkaline the sample is. In this model, higher pH favours carbonate precipitation." },
  { key: "calcium", label: "Calcium (mg/L)", min: 200, max: 650, step: 10,
    help: "Dissolved calcium ions (Ca²⁺): one building block of the solid." },
  { key: "alkalinity", label: "Alkalinity (meq/L)", min: 2, max: 8, step: 0.2,
    help: "Acid-neutralising capacity. This simplified model uses it as a carbonate-availability trend; it is not the same as pH." },
];
const same = (a, b) => FACTORS.every(({ key }) => a[key] === b[key]);
const settings = (v) => Object.fromEntries(FACTORS.map(({ key }) => [key, v[key]]));
const changed = (v) => FACTORS.filter(({ key }) => v[key] !== REFERENCE[key]);
const relative = (v) => v > 1.05 ? "more" : v < 0.95 ? "less" : "similar";

function Sample({ sample, title, trial = false, runNumber }) {
  const id = useId().replaceAll(":", "");
  const result = sample && precipitationModel(sample);
  const density = result?.cloudiness || 0;
  const count = Math.round(density * 55);
  return (
    <figure className={`wl-sample ${trial ? "is-trial" : ""}`}>
      <figcaption>
        <span>{title}</span>
        <b>{sample ? `${result.tendency.toFixed(2)}×` : "—"}</b>
      </figcaption>
      <svg viewBox="0 0 240 178" role="img"
        aria-label={sample ? `${title}: ${result.description}; relative tendency ${result.tendency.toFixed(2)}. Illustrative fresh sample.` : "Trial sample: run a test to reveal the result."}
        key={runNumber}>
        <defs>
          <linearGradient id={`water-${id}`} x2="0" y2="1">
            <stop stopColor="#238793" stopOpacity=".6" />
            <stop offset="1" stopColor="#0c465a" />
          </linearGradient>
          <clipPath id={`glass-${id}`}><path d="M39 25H201V140Q201 157 184 157H56Q39 157 39 140Z" /></clipPath>
        </defs>
        <g clipPath={`url(#glass-${id})`}>
          <rect x="39" y="49" width="162" height="109" fill={`url(#water-${id})`} />
          <rect className="wl-cloud" x="39" y="49" width="162" height="109" fill="#f0f3e5" opacity={sample ? density * .85 : 0} />
          {sample && Array.from({ length: count }, (_, i) => (
            <circle className="wl-particle" key={i}
              cx={48 + ((i * 43) % 142)} cy={58 + ((i * 29) % 88)}
              r={1.7 + (i % 3) * .55} fill="#fffbea"
              style={{ animationDelay: `${-(i % 7)}s` }} />
          ))}
          {sample && <path d={`M40 153 Q80 ${153 - density * 20} 120 153 T200 153V158H40Z`} fill="#e9eadb" opacity={density} />}
        </g>
        <path d="M32 25H208M39 25V140Q39 157 56 157H184Q201 157 201 140V25" fill="none" stroke="#abd8dc" strokeWidth="2.5" />
        <path d="M40 49Q80 45 120 49T200 49" fill="none" stroke="#9de7e6" opacity=".7" />
        {[70,90,110,130].map(y => <path key={y} d={`M186 ${y}h14`} stroke="#cce8e5" opacity=".5" />)}
        {!sample && <text x="120" y="108" textAnchor="middle" fill="#e8f8fa" fontSize="13">Run to reveal</text>}
      </svg>
      <p>{!sample ? "New, separate virtual sample" : density > .6 ? "Strong cloudiness + solid deposits" : density > .15 ? "Visible suspended solid particles" : density > .01 ? "Few visible solid particles" : "Appears clear in this model"}</p>
      <small>{sample ? `pH ${sample.pH} · Ca ${sample.calcium} mg/L · Alk ${sample.alkalinity} meq/L` : "No result until you run the test"}</small>
    </figure>
  );
}

export default function WaterChemistryLab({ value = { ...INCIDENT, tested: false }, onChange }) {
  const [prediction, setPrediction] = useState("");
  const [activeFactor, setActiveFactor] = useState(() => changed(value).length === 1 ? changed(value)[0].key : "pH");
  const observation = useRef(null);
  const trials = value.trials || (value.tested ? [{ ...settings(value), number: 1 }] : []);
  const last = trials.at(-1);
  const result = last && precipitationModel(last);
  const pending = !last || !same(value, last);
  const differences = changed(value);
  function update(patch) {
    onChange({ ...value, ...patch, trials, tested: false });
    setPrediction("");
  }
  function run() {
    const next = { ...settings(value), number: (last?.number || 0) + 1, prediction };
    onChange({ ...value, tested: true, trials: [...trials, next].slice(-6) });
    requestAnimationFrame(() => observation.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    }));
  }
  return (
    <section className="wl-lab" aria-label="Water chemistry simulator">
      <header className="wl-header">
        <div className="wl-eyebrow"><FlaskConical size={14} aria-hidden="true" /> Ocean Dome / Virtual water lab</div>
        <h3>What makes a fresh sample turn cloudy?</h3>
        <p>Change a condition, run the test, then compare with the reference. Precipitation means dissolved ions forming a solid.</p>
      </header>
      <ol className="wl-steps" aria-label="Experiment steps">
        <li><b>1</b> Choose a factor</li><li><b>2</b> Predict & run</li><li><b>3</b> Compare the result</li>
      </ol>
      <div className="wl-run-actions">
        <button onClick={run}>Run virtual water test</button>
        <p>{pending ? "Settings changed — run to reveal a new result." : "Result shown matches these settings."}</p>
      </div>
      <div className="wl-layout">
        <div className="wl-observation" ref={observation}>
          <div className="wl-samples">
            <Sample sample={REFERENCE} title="Starting reference" />
            <Sample sample={last} title={last ? `Trial ${last.number}` : "Your trial"} trial runNumber={last?.number} />
          </div>
          <p className="wl-scale-note">Relative precipitation tendency · Reference = 1.00×<br />Particles illustrate the trend; they are not measured turbidity.</p>
          <div className="wl-result im-reading" role="status" aria-live="polite" aria-atomic="true">
            {!last ? <><strong>Your first result awaits.</strong><p>Choose a one-factor experiment, or test the incident sample. Select Run virtual water test to reveal the comparison.</p></> : <>
              <strong>{result.description}</strong>
              <p className="wl-result-value">1.00× <ArrowRight size={18} aria-hidden="true" /> {result.tendency.toFixed(2)}× <span>{relative(result.tendency) === "similar" ? "Similar tendency" : relative(result.tendency) === "more" ? "Greater tendency" : "Lower tendency"}</span></p>
              <p>{changed(last).length === 1 ? `Only ${changed(last)[0].label} changed. The model predicts ${relative(result.tendency) === "similar" ? "a similar" : relative(result.tendency) === "more" ? "a greater" : "a lower"} tendency for new solid to form.` : changed(last).length > 1 ? "Several conditions changed together. This shows their combined effect; test one factor at a time to investigate its influence." : "The readings match the reference. The model predicts the same tendency."}</p>
              {last.prediction && <p className="wl-prediction-feedback">Your prediction: {last.prediction}. {last.prediction === relative(result.tendency) ? "The model supports your prediction." : "Compare your prediction with the measured model trend, then try another condition."}</p>}
            </>}
          </div>
          <p className="wl-fresh-note">Each run starts with a fresh virtual sample. Lowering a setting does not remove solid that has already formed.</p>
        </div>
        <div className="wl-experiment">
          <h4>Choose your experiment</h4>
          <div className="wl-factor-buttons">
            {FACTORS.map(factor => <button key={factor.key} className="im-secondary" aria-pressed={activeFactor === factor.key} onClick={() => {
              setActiveFactor(factor.key);
              update({ ...REFERENCE, [factor.key]: INCIDENT[factor.key] });
            }}>
              Investigate {factor.key === "pH" ? "pH" : factor.key}
            </button>)}
          </div>
          <p className="wl-factor-note">{differences.length === 1 ? `One-factor test: ${differences[0].label}. The other two readings match the reference.` : differences.length > 1 ? `${differences.length} factors differ from the reference. Use a one-factor button to make a fair comparison.` : "All readings match the reference. Choose a factor above to begin."}</p>
          {FACTORS.filter(factor => factor.key === activeFactor).map(({ key, label, min, max, step, help }) => <div className="wl-control" key={key}>
            <label><span>{label}</span><output>{value[key]}</output>
              <input aria-label={label} type="range" min={min} max={max} step={step} value={value[key]} onChange={e => update({ [key]: Number(e.target.value) })} />
            </label>
            <p>{help}</p>
          </div>)}
          <div className="wl-fixed-readings">
            <span>Held fixed while you move this slider</span>
            {FACTORS.filter(factor => factor.key !== activeFactor).map(({ key, label }) => <p key={key}>
              <span>{label}</span><output aria-label={`${label} held fixed`}>{value[key]}</output>
            </p>)}
          </div>
          <fieldset className="wl-prediction">
            <legend>Predict the tendency vs reference <span>(optional)</span></legend>
            {[["less", "Less"], ["similar", "About the same"], ["more", "More"]].map(([id, label]) => <label key={id}><input type="radio" name="water-prediction" value={id} checked={prediction === id} onChange={() => setPrediction(id)} />{label}</label>)}
          </fieldset>
          <div className="wl-presets">
            <button className="im-secondary" onClick={() => update(REFERENCE)}><RotateCcw size={12} aria-hidden="true" /> Load starting reference</button>
            <button className="im-secondary" onClick={() => update(INCIDENT)}>Load incident sample</button>
          </div>
        </div>
      </div>
      {!!trials.length && <details className="wl-history">
        <summary>Compare your runs · {trials.length} saved {trials.length === 1 ? "trial" : "trials"}</summary>
        <div className="wl-table-scroll"><table>
          <caption>Most recent six runs. Relative tendency is compared with the starting reference.</caption>
          <thead><tr><th>Trial</th><th>pH</th><th>Ca mg/L</th><th>Alk meq/L</th><th>Tendency</th></tr></thead>
          <tbody>{trials.map(trial => <tr key={trial.number}><th>{trial.number}</th><td>{trial.pH}</td><td>{trial.calcium}</td><td>{trial.alkalinity}</td><td>{precipitationModel(trial).tendency.toFixed(2)}×</td></tr>)}</tbody>
        </table></div>
      </details>}
      <details className="wl-explainer">
        <summary>What does “precipitation” mean here?</summary>
        <p>Dissolved calcium ions and carbonate ions can join an ionic solid: Ca²⁺(aq) + CO₃²⁻(aq) ⇌ CaCO₃(s). Tiny solid particles can make water look cloudy. A tendency is not a measured amount or speed of precipitation.</p>
        <p>This is a qualitative comparison, not a seawater saturation calculation or dosing guide. It cannot identify the mystery mineral by itself. Use your independent mineral tests.</p>
      </details>
      <footer>Isolated fictional samples only · Animal exhibits unaffected · Reference readings belong to this simulation, not the real aquarium.</footer>
    </section>
  );
}
