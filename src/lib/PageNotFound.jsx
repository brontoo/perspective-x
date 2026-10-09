import { Link } from "react-router-dom";
import usePortalData from "@/lib/expedition/usePortalData";
import PortalShell, { DataState } from "@/components/expedition/PortalShell";
export default function PageNotFound() {
  const data = usePortalData();
  if (data.loading || data.error) return <DataState data={data} />;
  return (
    <PortalShell data={data}>
      <section className="xp-completion">
        <p className="px-eyebrow">A new direction awaits</p>
        <h1>Page not found</h1>
        <p>
          This page is not part of the current portal. Choose a role or return
          to your learning space.
        </p>
        <div className="xp-actions">
          <Link className="px-button" to="/Roles">
            Explore scientific roles
          </Link>
          <Link
            className="px-outline-button"
            to={
              data.profile.role === "teacher"
                ? "/TeacherDashboard"
                : "/Dashboard"
            }
          >
            Your dashboard
          </Link>
          <Link className="px-text-button" to="/">
            Home
          </Link>
        </div>
      </section>
    </PortalShell>
  );
}
