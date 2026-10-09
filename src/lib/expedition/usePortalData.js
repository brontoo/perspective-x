import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { SCENARIOS } from "@/components/scenarios/scenarioData";
import { passedIds } from "@/lib/perspective/progress.mjs";

export default function usePortalData() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    error: null,
    user: null,
    profile: null,
    rows: [],
    settings: {},
    feedback: [],
    passed: [],
  });
  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate("/SignIn", { replace: true });
        return;
      }
      const results = await Promise.all([
        supabase
          .from("profiles")
          .select("id,full_name,role,avatar_path")
          .eq("id", user.id)
          .single(),
        supabase.from("student_progress").select("*").eq("student_id", user.id),
        supabase.from("scenario_settings").select("*"),
        supabase
          .from("teacher_feedback")
          .select("*")
          .eq("student_email", user.email)
          .order("created_at", { ascending: false }),
      ]);
      const failure = results.find((r) => r.error);
      if (failure) throw failure.error;
      const [profile, progress, settings, feedback] = results.map(
        (r) => r.data,
      );
      setState({
        loading: false,
        error: null,
        user,
        profile,
        rows: progress || [],
        settings: Object.fromEntries(
          (settings || []).map((s) => [s.scenario_id, s]),
        ),
        feedback: feedback || [],
        passed: passedIds(progress || [], SCENARIOS),
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e.message || "Unable to load your learning space.",
      }));
    }
  }, [navigate]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { ...state, refresh };
}
