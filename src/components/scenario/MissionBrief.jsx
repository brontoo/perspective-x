import { ROLE_IDENTITIES } from "@/components/expedition/roleIdentity";
import { RoleArtwork } from "@/components/expedition/PortalShell";
export default function MissionBrief({ scenario, role, plan, onStart }) {
  const objectives = [
    ...new Set([
      ...(scenario.scienceFocus || []),
      ...scenario.scenes.map((s) => s.learningObjective).filter(Boolean),
    ]),
  ];
  const identity = ROLE_IDENTITIES[role.id];
  return (
    <section className="xp-assignment">
      <div className="xp-assignment-art">
        <RoleArtwork
          roleId={role.id}
          alt={`${identity.name}, fictional ${role.title} mentor`}
        />
        <span>Mission mentor · {identity.name}</span>
      </div>
      <div className="xp-assignment-copy">
        <p className="px-eyebrow">Chapter 1 · You’re Needed!</p>
        <h2>A scientific decision needs you</h2>
        <div className="xp-urgent">
          <strong>{plan.signal}</strong>
          <p>{scenario.simpleContext || scenario.context}</p>
        </div>
        <h3>Your professional responsibility</h3>
        <p>{scenario.studentMission || plan.goal}</p>
        <p className="xp-mentor-quote">
          “Look closely at the evidence. Explain your reasoning, then make a
          professional recommendation.”
        </p>
        <small>{identity.name} · Fictional role mentor</small>
        <h3>Scientific learning objectives</h3>
        <ul>
          {objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <button className="px-button" onClick={onStart}>
          Accept assignment →
        </button>
      </div>
    </section>
  );
}
