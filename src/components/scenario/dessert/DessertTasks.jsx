import { useState } from "react";
import { POWDER_READINGS } from "@/data/ionicScience.mjs";
import {
  DESSERT_OUTCOMES,
  hasDessertReading,
  measurementsComplete,
} from "@/data/dessertFlow.mjs";
import { ElectronTransfer } from "../ionic/IonicModels";

function SampleInstrument({ task, state, send }) {
  const inv = state.investigation,
    method = task === "ph" ? "pH" : task === "acid" ? "fizz" : "conductivity";
  const available =
    task === "sample-a"
      ? ["A"]
      : task === "conductivity"
        ? ["B", "C"]
        : ["A", "B", "C"];
  const [sample, setSample] = useState(
    available.find((a) => !hasDessertReading(state, `${a}-${method}`)) ||
      available[0],
  );
  const measured = hasDessertReading(state, `${sample}-${method}`),
    reading = POWDER_READINGS[sample];
  const label =
    method === "pH"
      ? "Measure pH"
      : method === "fizz"
        ? "Run controlled virtual acid test"
        : "Measure conductivity";
  return (
    <section
      className="px-dessert-lab"
      aria-label={`${method} sample investigation`}
    >
      <header>
        <small>Separate virtual aliquots · Equal conditions</small>
        <h2>
          {task === "sample-a"
            ? "Begin with Sample A"
            : task === "conductivity"
              ? "Compare Samples B and C"
              : task === "ph"
                ? "Measure each solution’s pH"
                : "Observe each isolated sample"}
        </h2>
        <p>0.10 g per 100 mL water · 25°C · Educational reference readings</p>
      </header>
      <div className="px-dessert-sample-tabs" aria-label="Choose powder sample">
        {available.map((a) => (
          <button
            key={a}
            onClick={() => setSample(a)}
            aria-pressed={sample === a}
          >
            Sample {a}
            {hasDessertReading(state, `${a}-${method}`) ? " · Recorded" : ""}
          </button>
        ))}
      </div>
      <div className="px-dessert-instrument-grid">
        <div
          className={`px-dessert-beaker ${measured ? "is-measured" : ""}`}
          aria-label={`Virtual Sample ${sample}`}
        >
          <svg
            viewBox="0 0 320 205"
            role="img"
            aria-label={
              measured
                ? `Recorded Sample ${sample}: ${method === "fizz" ? reading.fizz : method === "pH" ? `pH ${reading.pH.toFixed(1)}` : `${reading.conductivity} microsiemens per centimetre`}`
                : `Sample ${sample} awaits a measurement`
            }
          >
            <defs>
              <linearGradient id={`dessert-water-${method}`} x2="1" y2="1">
                <stop stopColor="#63c4d2" />
                <stop offset="1" stopColor="#1b708c" />
              </linearGradient>
            </defs>
            <path
              d="M94 24v138q0 20 20 20h92q20 0 20-20V24M82 24h156"
              stroke="#d1eced"
              fill="none"
              strokeWidth="4"
            />
            <path
              d="M97 100h126v61q0 17-18 17h-90q-18 0-18-17Z"
              fill={`url(#dessert-water-${method})`}
              opacity=".78"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M97 ${56 + i * 22}h${i % 2 ? 12 : 20}`}
                stroke="#a0c4ce"
              />
            ))}
            <path d="M180 3v115" stroke="#dcbd87" strokeWidth="8" />
            <circle cx="180" cy="120" r="6" fill="#f6d59f" />
            {measured &&
              method === "fizz" &&
              sample === "B" &&
              [0, 1, 2, 3, 4].map((i) => (
                <circle
                  className="px-dessert-bubble"
                  key={i}
                  cx={125 + i * 17}
                  cy={153 - (i % 3) * 13}
                  r={3 + (i % 2) * 2}
                  fill="none"
                  stroke="#f3e7c9"
                />
              ))}
            <text
              x="160"
              y="198"
              textAnchor="middle"
              fill="#e9f2f6"
              fontSize="12"
            >
              Fresh virtual aliquot · Sample {sample}
            </text>
          </svg>
        </div>
        <div className="px-dessert-meter" aria-live="polite">
          <span>
            {method === "conductivity"
              ? "Conductivity meter"
              : method === "pH"
                ? "pH meter"
                : "Controlled reaction monitor"}
          </span>
          <strong>
            {!measured
              ? "Awaiting test"
              : method === "conductivity"
                ? `${reading.conductivity} µS/cm`
                : method === "pH"
                  ? `pH ${reading.pH.toFixed(1)}`
                  : sample === "B"
                    ? "CO₂ detected"
                    : "No bubbles"}
          </strong>
          <p>
            {!measured
              ? "Operate the instrument to collect an observation."
              : method === "fizz"
                ? reading.fizz
                : "Observation recorded in your Mission Notebook."}
          </p>
          <button
            className="px-dessert-primary"
            disabled={
              measured || (method === "conductivity" && !inv.calibrated)
            }
            onClick={() => send({ type: "measure", sample })}
          >
            {measured ? "Measurement recorded" : label}
          </button>
        </div>
      </div>
      <div
        className="px-dessert-reading-log"
        aria-label="Recorded observations"
      >
        {inv.evidence
          .filter((e) => e.id.endsWith(`-${method}`))
          .map((e) => (
            <p key={e.id}>
              <b>{e.label}</b> · {e.observation}
            </p>
          ))}
      </div>
      {task === "conductivity" && (
        <section className="px-dessert-conclusion">
          <label>
            <input
              type="checkbox"
              checked={!!inv.conductivityConfirmed}
              onChange={(e) =>
                send({
                  type: "conductivityAcknowledgement",
                  confirmed: e.target.checked,
                })
              }
            />
            Conductivity provides evidence of mobile charge carriers; it does
            not establish a unique identity or food safety.
          </label>
          <button
            className="px-dessert-primary"
            onClick={() =>
              send({
                type: "conductivityConfirm",
                confirmed: inv.conductivityConfirmed,
              })
            }
          >
            Record conductivity findings
          </button>
        </section>
      )}
      <small>
        {method === "fizz"
          ? "This is an isolated virtual test. The original unknown containers remain sealed; no real tasting or mixing is performed."
          : "Simulated values are not laboratory certification. Test each sample separately."}
      </small>
    </section>
  );
}
export default function DessertTasks({ state, node, scenario, send }) {
  const inv = state.investigation,
    task = node.task;
  if (["sample-a", "conductivity", "ph", "acid"].includes(task))
    return (
      <SampleInstrument key={task} task={task} state={state} send={send} />
    );
  if (task === "first")
    return (
      <section
        className="px-dessert-lab"
        aria-label="Initial investigation decision"
      >
        <small>Your first professional decision</small>
        <h2>How should the investigation begin?</h2>
        <p>Choose an approach. The story waits for your decision.</p>
        <div className="px-dessert-choices">
          {[
            ["controlled", "Use controlled scientific measurements"],
            ["appearance", "Identify the powders by appearance"],
            ["taste", "Taste an unknown powder"],
            ["mix", "Mix the samples together"],
          ].map(([id, text], i) => (
            <button
              key={id}
              onClick={() => send({ type: "firstChoice", choice: id })}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{text}</b>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>
    );
  if (task === "calibrate")
    return (
      <section className="px-dessert-lab" aria-label="Water-only calibration">
        <small>Establish the reference</small>
        <h2>Calibrate before testing the unknowns.</h2>
        <p>
          Place the virtual probe in the water-only control. No powder is added.
        </p>
        <div className="px-dessert-meter">
          <span>Control conductivity</span>
          <strong>{inv.calibrated ? "2 µS/cm" : "Awaiting calibration"}</strong>
        </div>
        <button
          className="px-dessert-primary"
          onClick={() => send({ type: "calibrate" })}
        >
          Calibrate with water-only control
        </button>
      </section>
    );
  if (task === "electron")
    return (
      <div
        className="px-dessert-lab"
        aria-label="Atomic formation investigation"
      >
        <ElectronTransfer
          value={
            inv.electron.kind === "NaCl"
              ? inv.electron
              : { kind: "NaCl", transferred: 0 }
          }
          referencePairs={["NaCl"]}
          onChange={(value) => send({ type: "electron", value })}
        />
      </div>
    );
  if (task === "identity")
    return (
      <section
        className="px-dessert-lab"
        aria-label="Scientific sample identification"
      >
        <small>Combine independent evidence</small>
        <h2>Which substance matches each sample?</h2>
        <p>
          Use all nine readings and your ion-formation model. No single
          measurement establishes an identity.
        </p>
        <div className="px-dessert-reading-log">
          {inv.evidence
            .filter((e) => /^\w-(conductivity|pH|fizz)$/.test(e.id))
            .map((e) => (
              <p key={e.id}>
                <b>{e.label}</b> · {e.observation}
              </p>
            ))}
        </div>
        <div className="px-dessert-three">
          {["A", "B", "C"].map((a) => (
            <label key={a}>
              Identity of Sample {a}
              <select
                aria-label={`Identity of Sample ${a}`}
                value={inv.identities[a]}
                onChange={(e) =>
                  send({ type: "identities", values: { [a]: e.target.value } })
                }
              >
                <option value="">Choose a supported identity</option>
                <option value="sugar">Sucrose / table sugar</option>
                <option value="hydrogen-carbonate">
                  Sodium hydrogen carbonate / baking soda
                </option>
                <option value="sodium-chloride">
                  Sodium chloride / table salt
                </option>
              </select>
            </label>
          ))}
        </div>
        {!measurementsComplete(state) && (
          <p>
            Complete all sample measurements and the sodium/chlorine formation
            model before identifying the unknowns.
          </p>
        )}
        <button
          className="px-dessert-primary"
          onClick={() => send({ type: "identify" })}
        >
          Check all three identifications
        </button>
      </section>
    );
  if (task === "decision")
    return (
      <section
        className="px-dessert-lab"
        aria-label="Final professional decision"
      >
        <small>Identity is not food-safety verification</small>
        <h2>The team is waiting for your recommendation.</h2>
        <p>{scenario.scenes[1].question}</p>
        <div className="px-dessert-final-choices">
          {scenario.scenes[1].options.map((o) => (
            <div key={o.id}>
              <label
                className={
                  state.decisionDraft.selectedOption === o.id
                    ? "is-selected"
                    : ""
                }
              >
                <input
                  type="radio"
                  name="dessert-decision"
                  checked={state.decisionDraft.selectedOption === o.id}
                  onChange={() =>
                    send({
                      type: "decisionDraft",
                      patch: { selectedOption: o.id },
                    })
                  }
                />
                <b>{o.id}</b>
                <span>{o.text}</span>
              </label>
            </div>
          ))}
        </div>
        <fieldset className="px-dessert-citations">
          <legend>Cite at least two observations</legend>
          {inv.evidence.map((e) => (
            <label key={e.id}>
              <input
                type="checkbox"
                checked={state.decisionDraft.evidenceCitations.includes(e.id)}
                onChange={(event) =>
                  send({
                    type: "decisionDraft",
                    patch: {
                      evidenceCitations: event.target.checked
                        ? [...state.decisionDraft.evidenceCitations, e.id]
                        : state.decisionDraft.evidenceCitations.filter(
                            (id) => id !== e.id,
                          ),
                    },
                  })
                }
              />
              <span>
                {e.label} · {e.observation}
              </span>
            </label>
          ))}
        </fieldset>
        <label>
          Your evidence-based justification
          <textarea
            aria-label="Your evidence-based justification"
            rows={4}
            maxLength={4000}
            value={state.decisionDraft.justification}
            onChange={(e) =>
              send({
                type: "decisionDraft",
                patch: { justification: e.target.value },
              })
            }
          />
        </label>
        <p>
          {state.decisionDraft.justification.trim().length}/60 minimum
          characters · {state.decisionDraft.evidenceCitations.length}/2
          observations
        </p>
        <div className="px-dessert-actions">
          <button onClick={() => send({ type: "reviewEvidence" })}>
            Review evidence
          </button>
          <button
            className="px-dessert-primary"
            onClick={() => send({ type: "decide" })}
          >
            Commit my decision
          </button>
        </div>
      </section>
    );
  if (task === "reflection")
    return (
      <section className="px-dessert-lab" aria-label="Mission reflection">
        <small>Close the evidence loop</small>
        <h2>What would you retain or change?</h2>
        {state.decision && (
          <div className="px-dessert-outcome">
            <b>
              {state.decision.selectedOption === "A"
                ? "Traceable replacement chosen"
                : "Professional outcome to review"}
            </b>
            <p>
              {
                scenario.scenes[2].consequences[
                  DESSERT_OUTCOMES[state.decision.selectedOption] ||
                    state.decision.consequence
                ]?.message
              }
            </p>
          </div>
        )}
        <label>
          What did the consequence teach you about your evidence and decision?
          <textarea
            aria-label="What did the consequence teach you about your evidence and decision?"
            rows={4}
            maxLength={4000}
            value={state.reflection}
            onChange={(e) => send({ type: "reflection", text: e.target.value })}
          />
        </label>
        <p>
          Refer to at least one observation and one remaining uncertainty. Write
          at least 40 characters.
        </p>
        <button
          className="px-dessert-primary"
          disabled={state.reflection.trim().length < 40}
          onClick={() => send({ type: "reflect" })}
        >
          Save reflection
        </button>
      </section>
    );
  if (task === "question") {
    const q = scenario.exitTicket.mcqs[node.question];
    return (
      <section
        className="px-dessert-lab"
        aria-label={`Assessment question ${node.question + 1}`}
      >
        <small>
          Question {node.question + 1} / 5 · Feedback follows submission
        </small>
        <h2>{q.question}</h2>
        <fieldset className="px-dessert-quiz-options">
          <legend>Choose your answer</legend>
          {q.options.map((o) => (
            <label key={o.id}>
              <input
                type="radio"
                name={q.id}
                checked={state.answers[q.id] === o.id}
                onChange={() => send({ type: "answer", answer: o.id })}
              />
              <span>{o.text}</span>
            </label>
          ))}
        </fieldset>
        <button
          className="px-dessert-primary"
          onClick={() => send({ type: "recordAnswer" })}
        >
          Record answer
        </button>
      </section>
    );
  }
  if (task === "assessment")
    return (
      <section
        className="px-dessert-lab"
        aria-label="Five-question assessment submission"
      >
        <small>Your scientific record</small>
        <h2>Review your five responses.</h2>
        <p>
          At least four correct answers (80%) earn the achievement. Explanations
          appear after submission.
        </p>
        {scenario.exitTicket.mcqs.map((q, i) => (
          <div className="px-dessert-answer" key={q.id}>
            <b>
              {i + 1}. {q.question}
            </b>
            <p>
              {q.options.find((o) => o.id === state.answers[q.id])?.text ||
                "No response recorded"}
            </p>
            <button onClick={() => send({ type: "editAnswer", index: i })}>
              Edit answer {i + 1}
            </button>
          </div>
        ))}
        <button
          className="px-dessert-primary"
          disabled={!scenario.exitTicket.mcqs.every((q) => state.answers[q.id])}
          onClick={() => send({ type: "assess" })}
        >
          Submit final assessment
        </button>
      </section>
    );
  return null;
}
