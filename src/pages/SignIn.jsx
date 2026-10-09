import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { savePhoto, savePreset } from "@/lib/perspective/avatar";
import AvatarPicker from "@/components/perspective/AvatarPicker";
import { Brand } from "@/components/perspective/Portal";

export default function SignIn() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState(
    () => localStorage.getItem("px-remembered-email") || "",
  );
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [picture, setPicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [destination, setDestination] = useState(null);
  const [providers, setProviders] = useState([]);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("recovery");
    });
    // Only render OAuth choices advertised as enabled by the actual Auth service.
    fetch(`${supabase.supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabase.supabaseKey },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((settings) =>
        setProviders(
          ["google", "azure"].filter((p) => settings?.external?.[p]),
        ),
      )
      .catch(() => {});
    return () => subscription.unsubscribe();
  }, []);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "reset") {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/SignIn`,
        });
        if (e) throw e;
        setSuccess(
          "If an account exists, a password-reset link has been sent.",
        );
        return;
      }
      if (mode === "recovery") {
        const { error: e } = await supabase.auth.updateUser({ password });
        if (e) throw e;
        setPassword("");
        setMode("signin");
        setSuccess("Your password was updated. You can now sign in.");
        return;
      }
      let authenticated;
      if (mode === "signup") {
        const { data, error: e } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: "student",
              ...(picture?.preset ? { px_avatar_id: picture.preset } : {}),
            },
          },
        });
        if (e) throw e;
        if (!data.session) {
          setSuccess(
            "Check your email to confirm your account, then sign in to finish your profile.",
          );
          return;
        }
        authenticated = data.user;
      } else {
        const { data, error: e } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (e) throw e;
        authenticated = data.user;
      }
      if (remember) localStorage.setItem("px-remembered-email", email);
      else localStorage.removeItem("px-remembered-email");
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id,role,full_name,avatar_path")
        .eq("id", authenticated.id)
        .maybeSingle();
      if (profileError)
        throw new Error(
          "Signed in, but your profile could not be loaded. Please try again.",
        );
      if (!profile) {
        const { data, error: e } = await supabase
          .from("profiles")
          .insert({
            id: authenticated.id,
            email: authenticated.email,
            full_name:
              mode === "signup"
                ? fullName.trim()
                : authenticated.user_metadata?.full_name || "",
            role: "student",
          })
          .select("id,role")
          .single();
        if (e)
          throw new Error(
            "Signed in, but profile setup is unavailable. Please contact your school.",
          );
        profile = data;
      }
      // Privileged routing is never inferred from editable auth metadata.
      const target =
        profile.role === "teacher" ? "/TeacherDashboard" : "/Dashboard";
      setDestination(target);
      if (picture?.file) await savePhoto(authenticated.id, picture.file);
      else if (picture?.preset)
        await savePreset(authenticated.id, picture.preset);
      window.location.assign(target);
    } catch (e) {
      setError(e.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  async function oauth(provider) {
    setError("");
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/Dashboard` },
    });
    if (e) setError(e.message);
  }
  const setup = mode === "signup",
    passwordMode = mode === "signin" || setup || mode === "recovery";
  return (
    <main className="px-ui px-signin-page">
      <div className="px-signin-frame">
        <section className="px-signin-form">
          <div className="px-signin-brand">
            <Brand />
            <Link to="/">Home</Link>
          </div>
          <p className="px-eyebrow">Welcome to Perspective X</p>
          <h1>
            {mode === "reset"
              ? "Reset your "
              : mode === "recovery"
                ? "Choose a new "
                : setup
                  ? "Let’s set up your "
                  : "Welcome back, "}
            <em>
              {mode === "reset" || mode === "recovery"
                ? "password"
                : setup
                  ? "profile"
                  : "future scientist."}
            </em>
          </h1>
          <p className="px-signin-description">
            {setup
              ? "Choose an avatar or upload your photo to get started."
              : mode === "signin"
                ? "Your next scientific adventure starts here."
                : "Continue your journey with a secure account."}
          </p>
          <form onSubmit={submit}>
            {setup && (
              <label>
                Full name
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                  maxLength={120}
                />
              </label>
            )}
            {mode !== "recovery" && (
              <label>
                Email
                <div className="px-input-icon">
                  <Mail size={19} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>
            )}
            {passwordMode && (
              <label>
                {mode === "recovery" ? "New password" : "Password"}
                <div className="px-input-icon">
                  <Lock size={19} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete={
                      setup || mode === "recovery"
                        ? "new-password"
                        : "current-password"
                    }
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>
            )}
            {mode === "signin" && (
              <div className="px-form-options">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember email
                </label>
                <button
                  type="button"
                  className="px-text-button"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
            {(setup || mode === "signin") && (
              <AvatarPicker
                value={picture}
                onChange={setPicture}
                disabled={loading}
              />
            )}
            {error && (
              <p className="px-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="px-success" role="status">
                {success}
              </p>
            )}
            <button
              type="submit"
              className="px-button px-signin-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait…"
                : setup
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset link"
                    : mode === "recovery"
                      ? "Update password"
                      : "Sign in"}
              <ArrowRight size={18} />
            </button>
            {destination && error && (
              <Link className="px-secondary-button" to={destination}>
                Continue without changing your picture
              </Link>
            )}
          </form>
          {mode === "signin" && providers.length > 0 && (
            <>
              <p className="px-auth-divider">or sign in with</p>
              <div className="px-oauth">
                {providers.map((provider) => (
                  <button key={provider} onClick={() => oauth(provider)}>
                    {provider === "azure" ? "Microsoft" : "Google"}
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="px-auth-switch">
            {setup ? "Already have an account?" : "New to Perspective X?"}{" "}
            <button
              className="px-text-button"
              onClick={() => {
                setMode(setup ? "signin" : "signup");
                setError("");
                setSuccess("");
                setDestination(null);
              }}
            >
              {setup ? "Sign in" : "Create an account"}
            </button>
            {(mode === "reset" || mode === "recovery") && (
              <button
                className="px-text-button"
                onClick={() => setMode("signin")}
              >
                Back to sign in
              </button>
            )}
          </p>
          <small className="px-muted">
            Teacher accounts are provisioned by your school.
          </small>
        </section>
        <aside
          className="px-signin-scene"
          aria-label="Student looking toward Zayed National Museum at sunrise"
        >
          <p className="px-scene-motto">Learn · Explore · Create · Impact</p>
          <div>
            <h2>
              A brighter
              <br />
              you through
              <br />
              <strong>knowledge.</strong>
            </h2>
            <span />
            <p>
              Learn. Explore. Create.
              <br />
              Make an impact.
            </p>
          </div>
        </aside>
      </div>
      <footer className="px-signin-footer">
        Perspective X · Real Science. Real Choices. Real Impact.
        <span>Riham Saleh — Portal Creator</span>
      </footer>
    </main>
  );
}
