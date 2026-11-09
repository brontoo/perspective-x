import { useId, useState } from "react";

import { ATOM_ION_COLORS, crystalPoints } from "@/data/atomCrystal.mjs";

export default function CrystalView({ kind = "metallic", grayscale = false, compact = false, electrons = false, localized = false, coreLabel = false, interactive = true, label }) {
  const id = useId().replace(/:/g, ""), metal = kind === "metallic";
  // Ionic charge types retain their colors even in a paired comparison/replay.
  const monochrome = grayscale && metal;
  const [angle, setAngle] = useState({ yaw: -.52, pitch: .32 }), [inspect, setInspect] = useState(false);
  const points = crystalPoints(kind, compact), centre = compact ? .5 : 1.5;
  function project([x,y,z]) {
    x -= centre; y -= centre; z -= centre;
    const u = x * Math.cos(angle.yaw) + z * Math.sin(angle.yaw), d = z * Math.cos(angle.yaw) - x * Math.sin(angle.yaw);
    return { x: 240 + u * (compact ? 112 : 65), y: 165 + (y * Math.cos(angle.pitch) - d * Math.sin(angle.pitch)) * (compact ? 100 : 62), depth: d * Math.cos(angle.pitch) + y * Math.sin(angle.pitch) };
  }
  const particle = p => p.join(","), selected = "1,1,1";
  const neighbours = p => p.reduce((sum, v, i) => sum + Math.abs(v - 1), 0) === 1;
  const description = metal ? `${points.length} identical positive monovalent metal ion cores in ${compact ? "an FCC motif" : "a face-centred cubic fragment"}. Each core includes its nucleus and inner electrons.${electrons ? ` ${points.length} ${localized ? "initially localized" : "delocalized"} valence electrons remain inside the specimen; net charge zero.` : " Valence electron inspection has not yet been revealed."}` : grayscale ? "A repeating three-dimensional fragment: equal populations of 1+ cations and 1− anions on alternating sites. Six nearest opposite-charge neighbours surround each interior ion; the structure continues beyond this fragment." : "Three-dimensional rock-salt NaCl fragment: 32 sodium cations and 32 chloride anions on alternating sites. Each interior ion has six nearest neighbours of the opposite charge; both sublattices are face-centred cubic. The lattice continues beyond the fragment.";
  const ordered = points.map(p => ({ ...p, ...project(p.position) })).sort((a,b) => a.depth - b.depth);
  return <div className={`px-atom-crystal ${monochrome ? "is-grayscale" : ""}`} data-world={kind}>
    <svg viewBox="0 0 480 340" role="img" aria-label={`${label || "ORBIT exploration camera"}: ${description}`}
      onPointerDown={event => { if (!interactive) return; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.dragX = event.clientX; }}
      onPointerMove={event => { if (!interactive || !event.currentTarget.hasPointerCapture(event.pointerId)) return; const delta = event.clientX - Number(event.currentTarget.dataset.dragX); event.currentTarget.dataset.dragX = event.clientX; setAngle(value => ({ ...value, yaw: value.yaw + delta * .009 })); }}>
      <title>{label || "ORBIT view"}</title><desc>{description}</desc>
      <defs>{["core","cation","anion"].map(name => {
        const colors = name === "core" ? monochrome ? ["#f3f4f5", "#aeb5ba", "#555f66"] : ["#e7e2d4", "#b8ad91", "#635d4f"] : ATOM_ION_COLORS[name];
        return <radialGradient key={name} id={`${id}-${name}`} cx="32%" cy="24%">{colors.map((color,i) => <stop key={i} offset={["0", ".55", "1"][i]} stopColor={color} />)}</radialGradient>;
      })}</defs>
      <rect width="480" height="340" rx="16" fill="#0a2234" />
      {ordered.map(p => {
        const highlighted = !metal && inspect && (particle(p.position) === selected || neighbours(p.position));
        const radius = (metal ? compact ? 33 : 24 : p.positive ? 16 : 22) * (1 + p.depth * .025);
        return <g key={particle(p.position)} opacity={inspect && !metal && !highlighted ? .2 : 1}>
          <circle cx={p.x} cy={p.y} r={radius} fill={`url(#${id}-${metal ? "core" : p.positive ? "cation" : "anion"})`} stroke={highlighted ? "#ffe1a1" : "#a7bec960"} strokeWidth={highlighted ? 2.5 : .7} />
          <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={compact ? 18 : 16} fill="#102938" fontWeight="bold">{metal || p.positive ? "1+" : "1−"}</text>
        </g>;
      })}
      {metal && electrons && points.map((p,index) => { const span = compact ? 1 : 3; const point = project(localized ? p.position.map((v,i) => v + (i === 0 ? .4 : i === 1 ? -.35 : .2)) : [(index * .618 + .12) % 1 * span,(index * .337 + .15) % 1 * span,(index * .791 + .3) % 1 * span]); return <g key={index} className={localized ? "" : "px-atom-delocalized-electron"}><circle cx={Math.min(461,Math.max(19,point.x))} cy={Math.min(316,Math.max(20,point.y))} r={compact ? 10 : 5} fill="#bdedf3"/>{compact && <text x={point.x} y={point.y + 3} fill="#102938" textAnchor="middle" fontSize="9">e−</text>}</g>; })}
      {!metal && <text x="16" y="324" fill="#d3e4ec" fontSize="11">{grayscale ? "1+ / 1− ions · extended fragment →" : "Na⁺ / Cl⁻ · repeating in three dimensions →"}</text>}
      {metal && coreLabel && <text x="16" y="324" fill="#e7e4d8" fontSize="12">Positive metal ion core · nucleus + inner electrons</text>}
    </svg>
    {!metal && <div className="px-atom-ion-key" aria-label="Ion color key">
      <span><i aria-hidden="true" style={{ background: ATOM_ION_COLORS.cation[1] }} />Na⁺ · Sodium · 1+</span>
      <span><i aria-hidden="true" style={{ background: ATOM_ION_COLORS.anion[1] }} />Cl⁻ · Chloride · 1−</span>
      <small>Colors are diagram conventions.</small>
    </div>}
    {interactive && <div className="px-atom-crystal-controls"><button onClick={() => setAngle(value => ({ ...value, yaw: value.yaw - .35 }))}>Rotate left</button><button onClick={() => setAngle(value => ({ ...value, yaw: value.yaw + .35 }))}>Rotate right</button>
      {!metal && <button aria-pressed={inspect} onClick={() => setInspect(value => !value)}>Inspect six neighbours</button>}</div>}
    {!metal && inspect && <p className="px-atom-model-note">Interior Cl⁻: six nearest Na⁺ neighbours, one along each positive and negative x, y and z direction. Highlights are viewing aids, not bonds or rods.</p>}
  </div>;
}
