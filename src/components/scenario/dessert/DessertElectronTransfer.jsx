import { useRef, useState } from "react";
import { electronPair } from "@/data/ionicScience.mjs";

export default function DessertElectronTransfer({ value, onChange, disabled }) {
  const pair = electronPair("NaCl", value.transferred),
    svg = useRef(null),
    [drag, setDrag] = useState(null);
  function transfer() {
    if (!disabled && !pair.complete) onChange({ kind: "NaCl", transferred: 1 });
  }
  function point(event) {
    const r = svg.current.getBoundingClientRect();
    return {
      x: ((event.clientX - r.left) / r.width) * 550,
      y: ((event.clientY - r.top) / r.height) * 215,
    };
  }
  return (
    <section className="im-instrument" aria-label="Electron-transfer model">
      <h2>Build an ion. Follow the electron.</h2>
      <p>
        Move sodium’s outer electron to chlorine. The nuclei stay unchanged.
      </p>
      <svg
        ref={svg}
        viewBox="0 0 550 215"
        role="img"
        aria-label={`Na has 11 protons and ${pair.electrons[0]} electrons; Cl has 17 protons and ${pair.electrons[1]} electrons`}
      >
        {[135, 415].map((x, index) => {
          const e = pair.electrons[index],
            shells = e > 10 ? [2, 8, e - 10] : [2, e - 2];
          return (
            <g key={index}>
              {shells.map((count, shell) => (
                <g key={shell}>
                  <circle
                    cx={x}
                    cy="93"
                    r={25 + shell * 22}
                    fill="none"
                    stroke="#518595"
                  />
                  {Array.from({ length: count }, (_, i) => {
                    const a = (2 * Math.PI * i) / count;
                    if (index === 0 && shell === 2 && i === 0 && !pair.complete)
                      return null;
                    return (
                      <circle
                        key={i}
                        cx={x + (25 + shell * 22) * Math.cos(a)}
                        cy={93 + (25 + shell * 22) * Math.sin(a)}
                        r="4"
                        fill={
                          shell === shells.length - 1 ? "#f7bf72" : "#78dcde"
                        }
                      />
                    );
                  })}
                </g>
              ))}
              <circle
                cx={x}
                cy="93"
                r="22"
                fill={
                  pair.complete
                    ? index === 0
                      ? "#986f36"
                      : "#286f80"
                    : "#143b4d"
                }
              />
              <text x={x} y="98" textAnchor="middle" fill="white" fontSize="14">
                {index === 0 ? "Na" : "Cl"}
                {pair.complete ? (index === 0 ? "⁺" : "⁻") : ""}
              </text>
              <text
                x={x}
                y="191"
                textAnchor="middle"
                fill="#e4f5f8"
                fontSize="12"
              >
                {pair.protons[index]} protons · {e} electrons ·{" "}
                {pair.complete ? (index === 0 ? "1+" : "1−") : "neutral"}
              </text>
            </g>
          );
        })}
        {!pair.complete && (
          <g
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-label="Drag sodium valence electron to chlorine"
            className="px-dessert-electron-handle"
            transform={`translate(${drag?.x ?? 204},${drag?.y ?? 93})`}
            onPointerDown={(event) => {
              if (disabled) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              setDrag(point(event));
            }}
            onPointerMove={(event) => {
              if (drag && !disabled) setDrag(point(event));
            }}
            onPointerUp={(event) => {
              if (!drag) return;
              const p = point(event);
              setDrag(null);
              if (p.x > 335 && p.x < 505 && p.y > 15 && p.y < 170) transfer();
            }}
            onPointerCancel={() => setDrag(null)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                transfer();
              }
            }}
          >
            <circle r="17" fill="#f8ca8533" stroke="#f8ca85" />
            <circle r="5" fill="#f7bf72" />
            <text y="-23" textAnchor="middle" fill="#f7bf72" fontSize="12">
              e⁻
            </text>
          </g>
        )}
        {!pair.complete && (
          <path d="M232 93h87m-8-7 8 7-8 7" stroke="#e6bc7a" fill="none" />
        )}
      </svg>
      <p role="status">
        {pair.transferred} of 1 valence electrons transferred.{" "}
        {pair.complete
          ? "The cation and anion have complete outer energy levels. Opposite charges attract: this is the ionic bond."
          : "Drag the highlighted electron or use Transfer one electron."}
      </p>
      <div className="im-actions">
        <button disabled={disabled || pair.complete} onClick={transfer}>
          Transfer one electron
        </button>
        <button
          disabled={disabled}
          onClick={() => onChange({ kind: "NaCl", transferred: 0 })}
        >
          Reset atoms
        </button>
      </div>
      <small>
        Formation from elements, not a food experiment. Dissolving an existing
        salt separates its ions; it does not repeat this electron transfer.
      </small>
    </section>
  );
}
