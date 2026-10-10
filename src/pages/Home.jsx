import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ROLES, SCENARIOS } from "@/components/scenarios/scenarioData";
import { Avatar } from "@/components/perspective/Portal";
import HeroSection from "@/components/landing/HeroSection";
import OurStoryDialog from "@/components/landing/OurStoryDialog";
import "@/components/landing/homepage.css";

function ApprovedMark({ className, label, viewBox }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <image
        href="/images/perspective/home-branding-source.webp"
        width="1448"
        height="1086"
        filter={
          label
            ? "url(#home-approved-white-ink)"
            : "url(#home-approved-logo-ink)"
        }
      />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const storyDialog = useRef(null);
  const [account, setAccount] = useState({
    user: null,
    profile: null,
    loading: true,
  });
  const [students, setStudents] = useState(null);
  useEffect(() => {
    let active = true;
    let version = 0;
    async function loadAccount() {
      const request = ++version;
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          if (active && request === version)
            setAccount({ user: null, profile: null, loading: false });
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (active && request === version)
          setAccount({ user, profile, loading: false });
      } catch {
        if (active && request === version)
          setAccount({ user: null, profile: null, loading: false });
      }
    }
    loadAccount();
    // Defer querying outside the Supabase auth callback to avoid its session lock.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        if (active) loadAccount();
      }, 0);
    });
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .then(({ count, error }) => {
        if (active) setStudents(error || count == null ? null : count);
      })
      .catch(() => {
        if (active) setStudents(null);
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const enterPortal = () =>
    navigate(
      !account.user
        ? "/SignIn"
        : account.profile?.role === "teacher"
          ? "/TeacherDashboard"
          : "/Dashboard",
    );
  const name =
    account.profile?.full_name ||
    account.user?.user_metadata?.full_name ||
    account.user?.email?.split("@")[0] ||
    "Your profile";
  return (
    <main className="px-home">
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="home-approved-white-ink" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 1 1 0 -1.2"
            />
          </filter>
          <filter id="home-approved-logo-ink" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.333 1.333 1.333 0 -2.8"
            />
          </filter>
        </defs>
      </svg>
      <a className="home-skip" href="#home-intro">
        Skip to content
      </a>
      <div className="home-cinema">
        <div className="home-frame">
          <header className="home-nav">
            <Link
              to="/"
              className="home-brand"
              aria-label="Perspective X — Home"
            >
              <ApprovedMark className="home-logo" viewBox="126 147 50 43" />
              <span>Perspective X</span>
            </Link>
            <nav aria-label="Main navigation">
              <Link to="/Roles">Roles</Link>
              <Link to="/LearningPath">Learning Paths</Link>
              <Link to="/Roles">Worlds &amp; Missions</Link>
              <Link to="/TeacherDashboard">Teacher Dashboard</Link>
              <button type="button" onClick={() => {
                const dialog = storyDialog.current;
                dialog.showModal();
                // Keep the story opening visible rather than scrolling to Close on mobile.
                dialog.focus({ preventScroll: true });
                dialog.scrollTop = 0;
              }}>Our Story</button>
            </nav>
            <div className="home-account">
              {account.user && (
                <Link to="/ProfileSettings" className="home-profile">
                  <Avatar
                    user={account.user}
                    profile={account.profile}
                    name={name}
                    size={34}
                  />
                  <span>{name}</span>
                </Link>
              )}
              <button
                className="home-enter"
                disabled={account.loading}
                onClick={enterPortal}
              >
                {account.loading ? "Loading…" : "Enter Portal"}
              </button>
            </div>
          </header>
          <div className="home-scene">
          <HeroSection onStart={enterPortal} isLoading={account.loading} />
          <div className="home-bottom">
            <footer className="home-footer">
              <p>
                Trusted by educators, schools, and partners across the UAE
                <br className="home-desktop-break" /> and around the world.
              </p>
              <div className="home-branding">
                <ApprovedMark
                  className="home-institution home-uae"
                  label="UAE"
                  viewBox="102.5 893.75 118.75 82.5"
                />
                <ApprovedMark
                  className="home-institution home-ministry"
                  label="Ministry of Education"
                  viewBox="226.25 893.75 178.75 82.5"
                />
                <ApprovedMark
                  className="home-institution home-school"
                  label="Um Al Emarat School"
                  viewBox="400 893.75 155 82.5"
                />
                <span>
                  Riham Saleh<small>Portal Creator</small>
                </span>
              </div>
            </footer>
            <section className="home-stats" aria-label="Platform statistics">
              <div>
                <strong>{Object.keys(SCENARIOS).length}</strong>
                <span>Live Scenarios</span>
              </div>
              <div>
                <strong>{Object.keys(ROLES).length}</strong>
                <span>Role Paths</span>
              </div>
              <div>
                <strong>{students ?? "—"}</strong>
                <span>
                  {students == null
                    ? "Student count unavailable"
                    : "Registered Students"}
                </span>
              </div>
            </section>
          </div>
          </div>
        </div>
      </div>
      <OurStoryDialog ref={storyDialog} />
    </main>
  );
}
