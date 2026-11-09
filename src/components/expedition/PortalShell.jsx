import { Link } from "react-router-dom";
import {
  PortalHeader,
  PortalFooter,
  LoadState,
} from "@/components/perspective/Portal";
import "./expedition.css";
import "./ionic-role-art.css";
export function DataState({ data }) {
  return <LoadState error={data.error} onRetry={data.refresh} />;
}
export default function PortalShell({
  data,
  children,
  back = "/Dashboard",
  backLabel = "Dashboard",
  className = "",
}) {
  return (
    <div className={`px-ui px-expedition ${className}`}>
      <PortalHeader
        user={data.user}
        profile={data.profile}
        teacherActions={[
          { label: "Home", to: "/" },
          { label: "Roles", to: "/Roles" },
          { label: "Learning Paths", to: "/LearningPath" },
          {
            label: "Dashboard",
            to:
              data.profile?.role === "teacher"
                ? "/TeacherDashboard"
                : "/Dashboard",
          },
          { label: "Leaderboard", to: "/leaderboard" },
        ]}
      />
      <main className="xp-main">
        <Link className="xp-back" to={back}>
          ← {backLabel}
        </Link>
        {children}
      </main>
      <PortalFooter />
    </div>
  );
}
export function Progress({ done, total, label = "Mission progress" }) {
  return (
    <div className="xp-progress">
      <div>
        <span>{label}</span>
        <strong>
          {done}/{total}
        </strong>
      </div>
      <progress aria-label={label} value={done} max={Math.max(total, 1)} />
    </div>
  );
}
export function RoleArtwork({ roleId, ...props }) {
  const src = roleId === "atomic_bonding_investigator"
    ? "/images/scenarios/atom_dive/characters/01_character_references/C_HAMAD.jpg"
    : `/images/roles/${roleId}.webp`;
  return <img src={src} {...props} />;
}
