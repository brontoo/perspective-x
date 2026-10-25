import CrystalView from "./CrystalView";
export function AtomSelect({ label, value, onChange, options, disabled = false }) {
  return <label className="px-atom-field"><span>{label}</span><select aria-label={label} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}>
    <option value="">Choose your explanation</option>
    {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
  </select></label>;
}

export function StructureModel({ kind, grayscale = false, formed = true, label, inspected = [] }) {
  return <CrystalView kind={kind} grayscale={grayscale} compact={!grayscale && kind === "metallic"} electrons={formed || inspected.includes("electrons")} localized={!formed} coreLabel={inspected.includes("cores")} label={label} />;
}

export function MetallicActivity({ value, send }) {
  const inspect = part => send({ type: "metalPatch", patch: { inspected: [...new Set([...value.inspected, part])] } });
  const ready = value.inspected.length === 2 && value.electrons && value.attraction && value.neutrality;
  return <section aria-label="Metallic reconstruction" className="px-atom-lab">
    <header><p className="px-atom-eyebrow">Atomic lens / Metallic reconstruction</p><h2>Build the explanation, one component at a time.</h2></header>
    <div className="px-atom-lab-grid"><div>
      <StructureModel kind="metallic" formed={value.electrons === "delocalized"} inspected={value.inspected} onInspect={inspect} />
      <p className="px-atom-model-note">Simplified monovalent metal: four 1+ cores and four valence electrons. Cores include the nucleus and inner electrons; they are not bare nuclei.</p>
      <div className="px-atom-actions"><button onClick={() => inspect("cores")} aria-pressed={value.inspected.includes("cores")}>Inspect ion cores</button>
        <button onClick={() => inspect("electrons")} aria-pressed={value.inspected.includes("electrons")}>Inspect valence electrons</button></div>
      <div className="px-atom-inspection" aria-live="polite">
        {value.inspected.includes("cores") && <p><strong>Ion core:</strong> nucleus and inner electrons, with a net positive charge.</p>}
        {value.inspected.includes("electrons") && <p><strong>Valence electron:</strong> an outer electron. Account for all four inside the specimen.</p>}
      </div>
    </div><div>
      <AtomSelect label="Where do the valence electrons belong?" value={value.electrons} onChange={electrons => send({ type: "metalPatch", patch: { electrons } })}
        options={[["transfer", "Transfer one-to-one to create negative metal ions"], ["delocalized", "Delocalized throughout the material"], ["escape", "Leave or disappear from the specimen"], ["pairs", "Fixed electron pairs between only two cores"]]} />
      <AtomSelect label="Which components attract?" value={value.attraction} onChange={attraction => send({ type: "metalPatch", patch: { attraction } })}
        options={[["positive-cores", "The positive cores attract one another alone"], ["cores-electrons", "Positive ion cores and delocalized negative electrons"]]} />
      <AtomSelect label="Explain the overall charge" value={value.neutrality} onChange={neutrality => send({ type: "metalPatch", patch: { neutrality } })}
        options={[["balanced", "Four 1+ cores and four electrons balance: net charge 0"], ["escape", "The electrons disappear, leaving the specimen positive"]]} />
      <button className="px-atom-primary" disabled={!ready} onClick={() => send({ type: "metalVerify" })}>Verify metallic reconstruction</button>
      <p className="px-atom-model-note">Inspect both components, reconstruct the model, then verify your reasoning. The scenic environment is an artistic simulation, not the particle diagram.</p>
    </div></div>
  </section>;
}

export function TransferModel({ transferred, verified, attracting = false }) {
  function atom(x, name, protons, electrons) {
    const shells = electrons > 10 ? [2, 8, electrons - 10] : [2, 8];
    return <g key={name}>
      {shells.map((number, shell) => <g key={shell}><circle cx={x} cy="95" r={24 + shell * 21} fill="none" stroke="#7da4b2" />
        {Array.from({ length: number }, (_, i) => { const angle = i * Math.PI * 2 / number;
          return <circle key={i} cx={x + Math.cos(angle) * (24 + shell * 21)} cy={95 + Math.sin(angle) * (24 + shell * 21)} r="4" fill="#9adbe9" />; })}</g>)}
      <circle cx={x} cy="95" r="16" fill="#ddba7e" /><text x={x} y="99" textAnchor="middle" fill="#102837" fontSize="9">{protons} p⁺</text>
      <text x={x} y="186" textAnchor="middle" fill="#f4f8fa" fontSize="15">{name}{verified ? protons > electrons ? "⁺" : "⁻" : ""}</text>
      <text x={x} y="208" textAnchor="middle" fill="#c7e3ec" fontSize="12">{protons} protons · {electrons} electrons</text>
    </g>;
  }
  return <svg className="px-atom-structure" viewBox="0 0 500 230" role="img" aria-label={`Sodium: 11 protons, ${transferred ? 10 : 11} electrons. Chlorine: 17 protons, ${transferred ? 18 : 17} electrons. Nuclei unchanged.`}>
    {atom(125, "Na", 11, transferred ? 10 : 11)}{atom(375, "Cl", 17, transferred ? 18 : 17)}
    {!transferred && <path d="M220 95H280m-8-6 8 6-8 6" stroke="#f0cc90" fill="none" strokeWidth="2" />}
    {transferred && attracting && <path d="M207 95h32m-7-6 7 6-7 6M293 95h-32m7-6-7 6 7 6" stroke="#f0cc90" fill="none" strokeWidth="2" />}
  </svg>;
}

export function IonicActivity({ task, value, send }) {
  const patch = next => send({ type: "ionicPatch", patch: next });
  function drag(event, particle) { event.dataTransfer.setData("application/x-atom-particle", particle); }
  function transfer(particle) { send({ type: "ionicTransfer", particle }); }
  return <section aria-label="Ionic reconstruction" className="px-atom-lab">
    <header><p className="px-atom-eyebrow">Atomic lens / Ionic reconstruction</p><h2>{task === "transfer" ? "Follow one electron. Keep the nuclei unchanged." : task === "charges" ? "Count first. Then verify each charge." : task === "attraction" ? "Ion formation and ionic bonding are different steps." : "One ion pair is not the whole solid."}</h2></header>
    <div className="px-atom-lab-grid"><div>
      {task === "lattice" && value.extended ? <StructureModel kind="ionic" /> : <TransferModel transferred={value.transferred} verified={value.chargesVerified} attracting={value.attraction === "opposite-ions"} />}
      <p className="px-atom-model-note">Simplified Na/Cl formation model. Electron shells are a teaching representation; neutrons are not shown. The nucleus and proton count never move.</p>
      <p className="px-atom-counts">Na: 11 p⁺ / {value.transferred ? 10 : 11} e⁻<br />Cl: 17 p⁺ / {value.transferred ? 18 : 17} e⁻</p>
      {task === "lattice" && value.extended && <p>Two-dimensional slice of an extended three-dimensional lattice. Equal numbers of repeating positive and negative ions; not isolated NaCl molecules.</p>}
    </div><div>
      {task === "transfer" && <>
        <p>Drag the sodium valence electron to the chlorine target, or use the transfer button.</p>
        <div className="px-atom-actions"><button draggable onDragStart={e => drag(e, "electron")} onClick={() => transfer("electron")}>Transfer one electron</button>
          <button draggable onDragStart={e => drag(e, "proton")} onClick={() => transfer("proton")}>Try moving a proton</button></div>
        <button className="px-atom-transfer-target" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); transfer(e.dataTransfer.getData("application/x-atom-particle")); }} onClick={() => transfer("electron")}>Chlorine target · Accept one electron</button>
        <p className="px-atom-model-note">Both transfer buttons perform the same one-electron operation. Dragging is optional.</p>
      </>}
      {task === "charges" && <>
        <AtomSelect label="Sodium ion charge" value={value.sodium} onChange={sodium => patch({ sodium })} options={[["-1", "1−"], ["0", "0"], ["+1", "1+"]]} />
        <AtomSelect label="Chloride ion charge" value={value.chloride} onChange={chloride => patch({ chloride })} options={[["+1", "1+"], ["-1", "1−"], ["0", "0"]]} />
        <AtomSelect label="What happened to the nuclei?" value={value.nuclei} onChange={nuclei => patch({ nuclei })} options={[["changed", "Protons transferred between the nuclei"], ["unchanged", "11 and 17 protons remain; only electron counts changed"]]} />
        <button className="px-atom-primary" disabled={!value.sodium || !value.chloride || !value.nuclei} onClick={() => send({ type: "chargesVerify" })}>Verify charges and nuclei</button>
      </>}
      {task === "attraction" && <>
        <AtomSelect label="What holds this ionic structure together?" value={value.attraction} onChange={attraction => patch({ attraction })}
          options={[["electron-sea", "Positive cores and a delocalized electron sea"], ["opposite-ions", "Electrostatic attraction between opposite ions"]]} />
        <button className="px-atom-primary" disabled={!value.attraction} onClick={() => send({ type: "attractionVerify" })}>Verify ionic attraction</button>
      </>}
      {task === "lattice" && <>
        <p>Build the structure that represents the solid beyond the first sodium/chloride pair.</p>
        <button onClick={() => patch({ extended: true })} aria-pressed={value.extended}>Expand repeating lattice</button>
        <button className="px-atom-primary" disabled={!value.extended} onClick={() => send({ type: "latticeVerify", extended: true })}>Verify extended structure</button>
        <button onClick={() => send({ type: "latticeVerify", extended: false })}>Keep isolated NaCl molecules</button>
      </>}
    </div></div>
  </section>;
}

export function ComparisonActivity({ value, send, showInputs = true, expanded = true }) {
  const patch = next => send({ type: "comparisonPatch", patch: next });
  return <section aria-label="Grayscale final comparison" className="px-atom-lab">
    <header><p className="px-atom-eyebrow">Evidence gate / Both investigations verified</p><h2>Which model matches ORBIT’s recording?</h2>
      <blockquote>“I am beside positive metal ion cores, with electrons delocalized throughout the surrounding structure.”</blockquote></header>
    <div className="px-atom-comparison-models">{value.sides.map((kind, i) => <div key={i}>
      <h3>Model {i === 0 ? "A" : "B"}</h3><StructureModel kind={kind} grayscale label={`Model ${i === 0 ? "A" : "B"}`} />
      <button aria-pressed={value.world === String(i + 1)} onClick={() => patch({ world: String(i + 1) })}>Choose Model {i === 0 ? "A" : "B"}</button>
    </div>)}</div>
    <p className="px-atom-model-note">Unfamiliar monochrome models. Use charge signs and particle descriptions, not illustration colours. Model A/B positions stay fixed for this attempt.</p>
    {showInputs && <details className="px-atom-comparison-response" open={expanded}><summary>Your comparison response</summary><div className="px-atom-lab-grid">
      <AtomSelect label="Particle evidence for your location" value={value.particles} onChange={particles => patch({ particles })}
        options={[["opposite-ions", "A repeating arrangement of cations and anions"], ["cores-electrons", "Positive ion cores with delocalized electrons"], ["colour", "The illustration’s colour identifies the location"]]} />
      <AtomSelect label="Attractive interaction supporting your location" value={value.attraction} onChange={attraction => patch({ attraction })}
        options={[["cores-electrons", "Positive ion cores attract delocalized electrons"], ["opposite-ions", "Cations attract anions"], ["identical", "The charged components are identical in both bonding types"]]} />
      <AtomSelect label="Match: valence electrons become delocalized among positive cores" value={value.metalSequence} onChange={metalSequence => patch({ metalSequence })} options={[["1", "Model A"], ["2", "Model B"]]} />
      <AtomSelect label="Match: electron transfer forms opposite ions in a repeating lattice" value={value.ionicSequence} onChange={ionicSequence => patch({ ionicSequence })} options={[["1", "Model A"], ["2", "Model B"]]} />
    </div>
    <button className="px-atom-primary" onClick={() => send({ type: "comparisonVerify" })}>Verify location and both formation matches</button></details>}
  </section>;
}
