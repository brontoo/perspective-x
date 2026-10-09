import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home, LogOut, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { presetFor, signedAvatar } from "@/lib/perspective/avatar";
import "./perspective.css";

export function Brand() {
  return (
    <Link className="px-brand" to="/" aria-label="Perspective X — Home">
      <img src="/logo.svg" alt="" />
      <span>Perspective X</span>
    </Link>
  );
}
export function Avatar({ user, profile, name, size = 40 }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const preset = presetFor(user);
  useEffect(() => {
    let active = true;
    setUrl(null);
    setFailed(false);
    if (!preset && profile?.avatar_path)
      signedAvatar(profile.avatar_path).then((value) => {
        if (active) setUrl(value);
      });
    return () => {
      active = false;
    };
  }, [profile?.avatar_path, preset?.id]);
  const label = name || profile?.full_name || "Your profile";
  const style = { width: size, height: size };
  if (preset)
    return (
      <span
        className="px-avatar px-avatar-preset"
        role="img"
        aria-label={`${label} avatar`}
        style={{
          ...style,
          backgroundPosition: `${(preset.index % 5) * 25}% ${preset.index < 5 ? 0 : 100}%`,
        }}
      />
    );
  return (
    <span className="px-avatar" style={style}>
      {url && !failed ? (
        <img
          src={url}
          alt={`${label} profile`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={label}>
          {label
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </span>
      )}
    </span>
  );
}
export function PortalHeader({ user, profile, teacherActions }) {
  const location = useLocation();
  const links = teacherActions || [
    { label: "Home", to: "/" },
    { label: "Dashboard", to: "/Dashboard" },
    { label: "Learning Paths", to: "/LearningPath" },
    { label: "Leaderboard", to: "/leaderboard" },
  ];
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.assign("/");
  }
  return (
    <header className="px-topbar">
      <Brand />
      <nav aria-label="Main navigation">
        {links.map((link) =>
          link.action ? (
            <button key={link.label} onClick={link.action}>
              {link.label}
            </button>
          ) : (
            <Link
              key={link.label}
              to={link.to}
              aria-current={location.pathname === link.to ? "page" : undefined}
            >
              {link.to === "/" && <Home size={14} />} {link.label}
            </Link>
          ),
        )}
      </nav>
      <div className="px-account">
        <Link to="/ProfileSettings" className="px-profile-link">
          <Avatar user={user} profile={profile} />
          <span>
            {profile?.full_name || "Your profile"}
            <small>{profile?.role === "teacher" ? "Teacher" : "Student"}</small>
          </span>
        </Link>
        <button
          className="px-icon-button"
          onClick={signOut}
          aria-label="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
export function PortalFooter() {
  return (
    <footer className="px-footer">
      <Brand />
      <span>Real Science. Real Choices. Real Impact.</span>
      <small>Um Al Emarat School · Riham Saleh — Portal Creator</small>
    </footer>
  );
}
export function Panel({ title, eyebrow, action, children, className = "" }) {
  return (
    <section className={`px-panel ${className}`}>
      {(title || eyebrow || action) && (
        <header className="px-panel-heading">
          <div>
            {eyebrow && <p className="px-eyebrow">{eyebrow}</p>}
            <h2>{title}</h2>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
export function Empty({ children }) {
  return <p className="px-empty">{children}</p>;
}
export function LoadState({
  error,
  onRetry,
  label = "Loading your learning space…",
}) {
  return (
    <div className="px-ui px-status" role={error ? "alert" : "status"}>
      <Brand />
      <h1>{error ? "We couldn’t load this page" : label}</h1>
      {error && (
        <>
          <p>{error}</p>
          <button className="px-button" onClick={onRetry}>
            Try again
          </button>
        </>
      )}
      <Link to="/">Back to Home</Link>
    </div>
  );
}
export function Journal({ dialogRef, row, scenario, answers, onClose }) {
  const notebook = answers?.notebook || {};
  return (
    <dialog ref={dialogRef} className="px-ui px-journal" onClose={onClose}>
      <header>
        <BookOpen />
        <h2>Mission Notebook</h2>
        <button
          autoFocus
          className="px-icon-button"
          onClick={() => dialogRef.current.close()}
          aria-label="Close notebook"
        >
          <X />
        </button>
      </header>
      <p>{scenario?.title || "Learning record"}</p>
      <p className="px-muted">
        Your saved work. Original answers are preserved.
      </p>
      {Object.keys(notebook).length === 0 &&
      !answers?.scene1 &&
      !answers?.scene2 &&
      !answers?.reflection ? (
        <Empty>No saved notes for this mission yet.</Empty>
      ) : (
        <>
          {Object.entries(notebook)
            .filter(([, value]) => typeof value === "string" && value.trim())
            .map(([key, value]) => (
              <section key={key}>
                <h3>{key.replace(/([A-Z])/g, " $1").replace(/Notes$/, "")}</h3>
                <p>{value}</p>
              </section>
            ))}
          {["scene1", "scene2"].map(
            (key, index) =>
              answers?.[key] && (
                <section key={key}>
                  <h3>Scene {index + 1}: Your decision</h3>
                  <p>
                    {scenario?.scenes?.[index]?.options?.find(
                      (option) => option.id === answers[key].selectedOption,
                    )?.text ||
                      answers[key].selectedOption ||
                      "No choice recorded"}
                  </p>
                  {answers[key].justification && (
                    <p>{answers[key].justification}</p>
                  )}
                </section>
              ),
          )}
          {answers?.reflection && (
            <section>
              <h3>What I learned</h3>
              <p>
                {typeof answers.reflection === "string"
                  ? answers.reflection
                  : "Reflection recorded"}
              </p>
            </section>
          )}
        </>
      )}
      {row?.score != null && <p>Assessment score: {row.score}%</p>}
    </dialog>
  );
}
