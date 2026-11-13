import { useRef, useState } from "react";

// A movable instrument; the same operation is available by pointer, touch or keyboard.
export default function DessertWorkbench({
  method,
  sample = "control",
  measured,
  disabled,
  onOperate,
  actionLabel,
}) {
  const canvas = useRef(null),
    grab = useRef(null),
    position = useRef({ x: 12, y: 0 });
  const [pos, setPos] = useState({ x: 12, y: 0 }),
    [held, setHeld] = useState(false),
    [hint, setHint] = useState("");
  const acid = method === "fizz",
    name = acid
      ? "Virtual acid dropper"
      : method === "pH"
        ? "pH probe"
        : "Conductivity probe";
  const destination =
    sample === "control" ? "water-only control" : `Sample ${sample}`;
  function move(next) {
    const value = {
      x: Math.max(0, Math.min(85, next.x)),
      y: Math.max(0, Math.min(28, next.y)),
    };
    position.current = value;
    setPos(value);
  }
  function operate() {
    if (disabled || measured) return;
    move({ x: 64, y: 10 });
    setHeld(false);
    setHint("");
    onOperate();
  }
  function down(event) {
    if (disabled || measured || event.button !== 0) return;
    const rect = canvas.current.getBoundingClientRect();
    grab.current = {
      x: ((event.clientX - rect.left) / rect.width) * 100 - pos.x,
      y: ((event.clientY - rect.top) / rect.height) * 100 - pos.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(true);
    setHint(
      `Move the ${acid ? "dropper" : "probe"} to the highlighted ${destination}.`,
    );
  }
  function drag(event) {
    if (!grab.current || disabled) return;
    const rect = canvas.current.getBoundingClientRect();
    move({
      x: ((event.clientX - rect.left) / rect.width) * 100 - grab.current.x,
      y: ((event.clientY - rect.top) / rect.height) * 100 - grab.current.y,
    });
  }
  function drop(event) {
    if (!grab.current) return;
    const rect = canvas.current.getBoundingClientRect();
    const raw = {
      x: ((event.clientX - rect.left) / rect.width) * 100 - grab.current.x,
      y: ((event.clientY - rect.top) / rect.height) * 100 - grab.current.y,
    };
    grab.current = null;
    if (raw.x >= 53 && raw.x <= 77 && raw.y >= -5 && raw.y <= 30) operate();
    else {
      setHeld(false);
      move({ x: 12, y: 0 });
      setHint(
        `No reading recorded. Place the tool over the highlighted ${destination}.`,
      );
    }
  }
  return (
    <div className="px-dessert-workbench">
      <p className="px-dessert-tool-instruction">
        {acid
          ? "Hold the dropper and add drops to the separate virtual sample."
          : "Hold the probe and lower its tip into the solution."}{" "}
        Drag the tool, or select it and then select the beaker.
      </p>
      <div
        ref={canvas}
        className={`px-dessert-tool-canvas ${held ? "is-holding" : ""} ${measured ? "is-tested" : ""}`}
      >
        <svg
          viewBox="0 0 480 245"
          role="img"
          aria-label={
            measured
              ? `${destination}: tool applied and observation recorded`
              : `${destination}: ready for the ${name.toLowerCase()}`
          }
        >
          <path d="M15 217H465" stroke="#567a8c" strokeWidth="2" />
          <path
            d="M279 63v123q0 20 20 20h77q20 0 20-20V63M269 63h137"
            fill="#77bbce12"
            stroke="#bce6ea"
            strokeWidth="3"
          />
          <path
            d="M283 119h109v65q0 18-18 18h-73q-18 0-18-18Z"
            fill={method === "pH" && measured ? "#69aab8" : "#3ca5c8"}
            opacity=".55"
          />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M283 ${91 + i * 26}h15`} stroke="#bce6ea" />
          ))}
          {acid &&
            measured &&
            sample === "B" &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <circle
                className="px-dessert-bubble"
                key={i}
                cx={300 + i * 14}
                cy={176 - (i % 3) * 20}
                r={3 + (i % 3)}
                stroke="#f6d59f"
                fill="none"
              />
            ))}
          {acid && measured && (
            <>
              <path
                className="px-dessert-drop"
                d="M336 94q-9 13 0 13q9 0 0-13Z"
                fill="#e9ce9a"
              />
              <text
                x="337"
                y="42"
                textAnchor="middle"
                fill="#f6d59f"
                fontSize="13"
              >
                Virtual drops applied
              </text>
            </>
          )}
          <text
            x="337"
            y="236"
            textAnchor="middle"
            fill="#e5f4f7"
            fontSize="14"
          >
            {destination}
          </text>
          <text x="63" y="236" textAnchor="middle" fill="#a9c7d6" fontSize="12">
            Tool tray
          </text>
        </svg>
        <button
          className="px-dessert-held-tool"
          aria-label={name}
          aria-pressed={held}
          disabled={disabled || measured}
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          onPointerDown={down}
          onPointerMove={drag}
          onPointerUp={drop}
          onPointerCancel={() => {
            grab.current = null;
            setHeld(false);
            move({ x: 12, y: 0 });
          }}
          onClick={(event) => {
            if (event.detail === 0 || !grab.current) {
              setHeld(true);
              setHint(`Tool selected. Select ${destination} to apply it.`);
            }
          }}
          onKeyDown={(event) => {
            if (event.key.startsWith("Arrow")) {
              event.preventDefault();
              setHeld(true);
              move({
                x:
                  pos.x +
                  (event.key === "ArrowRight"
                    ? 8
                    : event.key === "ArrowLeft"
                      ? -8
                      : 0),
                y:
                  pos.y +
                  (event.key === "ArrowDown"
                    ? 5
                    : event.key === "ArrowUp"
                      ? -5
                      : 0),
              });
            } else if (event.key === "Escape") {
              setHeld(false);
              move({ x: 12, y: 0 });
            }
          }}
        >
          <svg viewBox="0 0 55 145" aria-hidden="true">
            <rect
              x="15"
              y="8"
              width="25"
              height="44"
              rx="8"
              fill={acid ? "#f1c78a" : "#72d6d7"}
              stroke="#e5eff0"
            />
            <path
              d="M24 52h8v70l-4 14-4-14Z"
              fill={acid ? "#d6e9f2" : "#d6bb82"}
              stroke="#f5ead1"
            />
            {!acid && (
              <path d="M25 115v15m5-15v15" stroke="#134453" strokeWidth="2" />
            )}
          </svg>
        </button>
        <button
          className="px-dessert-beaker-target"
          aria-label={`Place ${name.toLowerCase()} in ${destination}`}
          disabled={!held || disabled || measured}
          onClick={operate}
        />
      </div>
      <p className="px-dessert-tool-status" role="status">
        {measured
          ? "Observation saved in your notebook. Select the next sample to compare."
          : hint || "No reading yet. Apply the instrument to collect evidence."}
      </p>
      <button
        className="px-dessert-primary"
        disabled={disabled || measured}
        onClick={operate}
      >
        {measured ? "Measurement recorded" : actionLabel}
      </button>
    </div>
  );
}
