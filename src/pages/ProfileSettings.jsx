import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Avatar } from "@/components/perspective/Portal";
import AvatarPicker from "@/components/perspective/AvatarPicker";
import { ownUser, savePreset, savePhoto } from "@/lib/perspective/avatar";
import PortalShell, { DataState } from "@/components/expedition/PortalShell";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    loading: true,
    user: null,
    profile: null,
    error: null,
  });
  const [name, setName] = useState("");
  const [picture, setPicture] = useState(null);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [visible, setVisible] = useState({});
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState({});
  const [error, setError] = useState({});
  async function load() {
    try {
      const {
        data: { user },
        error: e,
      } = await supabase.auth.getUser();
      if (e || !user) {
        navigate("/SignIn", { replace: true });
        return;
      }
      const { data: profile, error: p } = await supabase
        .from("profiles")
        .select("id,full_name,role,avatar_path")
        .eq("id", user.id)
        .single();
      if (p) throw p;
      setData({ user, profile, loading: false, error: null });
      setName(profile.full_name || "");
    } catch (e) {
      setData((s) => ({ ...s, loading: false, error: e.message }));
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function act(section, work) {
    setBusy(section);
    setError((s) => ({ ...s, [section]: "" }));
    setMessage((s) => ({ ...s, [section]: "" }));
    try {
      await ownUser(data.user.id);
      await work();
    } catch (e) {
      setError((s) => ({
        ...s,
        [section]: e.message || "Unable to save. Please try again.",
      }));
    } finally {
      setBusy("");
    }
  }
  function saveName() {
    return act("name", async () => {
      const { error: e, data: saved } = await supabase
        .from("profiles")
        .update({ full_name: name.trim() })
        .eq("id", data.user.id)
        .select("id")
        .single();
      if (e || !saved)
        throw e || new Error("Your profile could not be updated.");
      await load();
      setMessage((s) => ({ ...s, name: "Name updated successfully!" }));
    });
  }
  function savePicture() {
    return act("avatar", async () => {
      if (picture?.file) await savePhoto(data.user.id, picture.file);
      else if (picture?.preset) await savePreset(data.user.id, picture.preset);
      await load();
      setPicture(null);
      setMessage((s) => ({ ...s, avatar: "Your profile picture is saved." }));
    });
  }
  function removePicture() {
    return act("avatar", async () => {
      const { error: e } = await supabase
        .from("profiles")
        .update({ avatar_path: null })
        .eq("id", data.user.id)
        .select("id")
        .single();
      if (e) throw e;
      await savePreset(data.user.id, null);
      await load();
      setPicture(null);
      setMessage((s) => ({ ...s, avatar: "Using your initials." }));
    });
  }
  function savePassword() {
    return act("password", async () => {
      if (passwords.next.length < 6)
        throw new Error("Password must be at least 6 characters.");
      if (passwords.next !== passwords.confirm)
        throw new Error("Passwords do not match.");
      const { error: auth } = await supabase.auth.signInWithPassword({
        email: data.user.email,
        password: passwords.current,
      });
      if (auth) throw new Error("Current password is incorrect.");
      const { error: e } = await supabase.auth.updateUser({
        password: passwords.next,
      });
      if (e) throw e;
      setPasswords({ current: "", next: "", confirm: "" });
      setMessage((s) => ({ ...s, password: "Password updated successfully!" }));
    });
  }
  const notice = (section) => (
    <>
      {error[section] && (
        <p className="px-error" role="alert">
          {error[section]}
        </p>
      )}
      {message[section] && (
        <p className="px-success" role="status">
          {message[section]}
        </p>
      )}
    </>
  );
  if (data.loading || data.error)
    return <DataState data={{ ...data, refresh: load }} />;
  return (
    <PortalShell
      data={data}
      back={
        data.profile.role === "teacher" ? "/TeacherDashboard" : "/Dashboard"
      }
      className="xp-profile-page"
    >
      <section className="xp-catalogue-heading">
        <p className="px-eyebrow">Make this learning space yours</p>
        <h1>Account Settings</h1>
        <p>
          Manage your identity and security. Your scientific journey stays with
          your account.
        </p>
      </section>
      <div className="xp-profile-layout">
        <aside className="xp-profile-summary">
          <Avatar
            user={data.user}
            profile={data.profile}
            name={data.profile.full_name}
            size={100}
          />
          <h2>{data.profile.full_name || "Your profile"}</h2>
          <p>{data.user.email}</p>
          <span className="xp-difficulty">
            {data.profile.role === "teacher" ? "Teacher" : "Student"}
          </span>
          <p>
            Account role and email are managed through your school’s authorized
            account process.
          </p>
          <button
            className="px-text-button"
            onClick={async () => {
              const { error: e } = await supabase.auth.signOut();
              if (e) setError((s) => ({ ...s, account: e.message }));
              else navigate("/SignIn");
            }}
          >
            Sign out
          </button>
          {notice("account")}
        </aside>
        <div className="xp-profile-forms">
          <section className="xp-form-panel">
            <h2>Profile Picture</h2>
            <p>Choose a preset or a private photo. Optional · 2 MB maximum.</p>
            <AvatarPicker
              value={picture}
              onChange={setPicture}
              disabled={!!busy}
            />
            <div className="xp-actions">
              <button
                className="px-button"
                disabled={!picture || !!busy}
                onClick={savePicture}
              >
                {busy === "avatar" ? "Saving…" : "Save picture"}
              </button>
              <button
                className="px-text-button"
                disabled={!!busy}
                onClick={removePicture}
              >
                Remove picture
              </button>
            </div>
            {notice("avatar")}
          </section>
          <section className="xp-form-panel">
            <h2>Full Name</h2>
            <label className="xp-field">
              Display Name
              <input
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <button
              className="px-button"
              disabled={!name.trim() || !!busy}
              onClick={saveName}
            >
              {busy === "name" ? "Saving…" : "Save Name"}
            </button>
            {notice("name")}
          </section>
          <section className="xp-form-panel">
            <h2>Change Password</h2>
            {[
              ["current", "Current Password"],
              ["next", "New Password"],
              ["confirm", "Confirm New Password"],
            ].map(([key, label]) => (
              <label className="xp-field" key={key}>
                {label}
                <span className="xp-password">
                  <input
                    aria-label={label}
                    type={visible[key] ? "text" : "password"}
                    value={passwords[key]}
                    onChange={(e) =>
                      setPasswords((s) => ({ ...s, [key]: e.target.value }))
                    }
                    autoComplete={
                      key === "current" ? "current-password" : "new-password"
                    }
                  />
                  <button
                    type="button"
                    aria-label={`${visible[key] ? "Hide" : "Show"} ${label.toLowerCase()}`}
                    onClick={() =>
                      setVisible((s) => ({ ...s, [key]: !s[key] }))
                    }
                  >
                    {visible[key] ? "Hide" : "Show"}
                  </button>
                </span>
              </label>
            ))}
            <p className="px-muted">
              At least 6 characters. Your current password is verified before
              changing it.
            </p>
            <button
              className="px-button"
              disabled={
                !!busy ||
                !passwords.current ||
                !passwords.next ||
                !passwords.confirm
              }
              onClick={savePassword}
            >
              {busy === "password" ? "Updating…" : "Update Password"}
            </button>
            {notice("password")}
          </section>
          <details className="xp-form-panel">
            <summary>Privacy and account support</summary>
            <p>
              Profile photos use the existing private storage checks. For
              account deletion, contact your school administrator so your
              authentication account and retained educational records can be
              handled together. This page does not delete student work.
            </p>
          </details>
        </div>
      </div>
    </PortalShell>
  );
}
