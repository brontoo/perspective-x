import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { startCloudMotion } from "./cinematicCloudRenderer";
import "./cinematic-motion.css";

export default function CinematicHeroMotion() {
  const ref = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || pathname !== "/") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = null;
    const applyPreference = () => {
      stop?.();
      stop = null;
      if (preference.matches) canvas.dataset.state = "reduced";
      else stop = startCloudMotion(canvas, canvas.parentElement);
    };
    preference.addEventListener("change", applyPreference);
    applyPreference();
    return () => {
      preference.removeEventListener("change", applyPreference);
      stop?.();
    };
  }, [pathname]);
  if (pathname !== "/") return null;
  return <canvas ref={ref} className="home-cinematic-motion" aria-hidden="true" />;
}
