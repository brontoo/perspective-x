import { Link } from "react-router-dom";
import { ROLES } from "@/components/scenarios/scenarioData";
import usePortalData from "@/lib/expedition/usePortalData";
import PortalShell, {
  DataState,
  Progress,
  RoleArtwork,
} from "@/components/expedition/PortalShell";
import { ROLE_IDENTITIES } from "@/components/expedition/roleIdentity";
export default function Roles() {
  const data = usePortalData();
  if (data.loading || data.error) return <DataState data={data} />;
  return (
    <PortalShell data={data} className="xp-roles-page">
      <section className="xp-catalogue-heading">
        <p className="px-eyebrow">Your future starts with a perspective</p>
        <h1>Choose your role</h1>
        <p>
          Nine scientific professions. Real evidence. Decisions that matter.
        </p>
        <div className="xp-chips">
          <span>Explore authentic challenges</span>
          <span>Build scientific skills</span>
          <span>Make a positive impact</span>
        </div>
      </section>
      <div className="xp-role-grid">
        {Object.values(ROLES).map((role) => {
          const done = role.scenarios.filter((id) =>
            data.passed.includes(id),
          ).length;
          return (
            <article className="xp-role-card" key={role.id}>
              <div className="xp-role-art">
                <RoleArtwork
                  roleId={role.id}
                  alt={`${ROLE_IDENTITIES[role.id].name}, fictional ${role.title} mentor`}
                  loading="lazy"
                />
                <span className="xp-difficulty">{role.difficulty}</span>
              </div>
              <div className="xp-card-body">
                <p className="px-eyebrow">
                  {role.scenarios.length}{" "}
                  {role.scenarios.length === 1 ? "mission" : "missions"}
                </p>
                <h2>{role.title}</h2>
                <p>{role.description}</p>
                <Progress done={done} total={role.scenarios.length} />
                <Link className="px-button" to={`/RoleHub?role=${role.id}`}>
                  Explore Role <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </PortalShell>
  );
}
