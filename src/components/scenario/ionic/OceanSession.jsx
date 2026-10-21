import { createContext, useCallback, useEffect, useRef, useState } from "react";

export const OceanSessionContext = createContext(null);

// This host survives chapter remounts: fullscreen and the authorized audio element
// belong to the mission session rather than to an individual caption/chapter.
export default function OceanSession({
  children,
  onNotebook,
  completed = false,
}) {
  const host = useRef(null),
    player = useRef(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement === host.current) {
      await document.exitFullscreen();
      return;
    }
    if (expanded) {
      setExpanded(false);
      return;
    }
    try {
      if (!host.current.requestFullscreen) throw new Error("Use viewport mode");
      await host.current.requestFullscreen();
    } catch {
      setExpanded(true);
    }
  }, [expanded]);
  useEffect(() => {
    const changed = () =>
      setFullscreen(document.fullscreenElement === host.current);
    const escape = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };
    const hidden = () => {
      if (document.hidden) {
        player.current?.pause();
        setPaused(true);
      }
    };
    document.addEventListener("fullscreenchange", changed);
    document.addEventListener("keydown", escape);
    document.addEventListener("visibilitychange", hidden);
    const audio = player.current;
    return () => {
      document.removeEventListener("fullscreenchange", changed);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("visibilitychange", hidden);
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
    };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);
  useEffect(() => {
    if (!fullscreen && !expanded) return;
    const trap = (event) => {
      if (event.key !== "Tab" || document.querySelector("dialog[open]")) return;
      const elements = [
        ...host.current.querySelectorAll(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]',
        ),
      ].filter(
        (element) =>
          element.getClientRects().length &&
          !element.closest("[hidden],[inert]"),
      );
      const first = elements[0],
        last = elements.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !host.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !host.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [fullscreen, expanded]);
  return (
    <OceanSessionContext.Provider
      value={{
        player,
        started,
        setStarted,
        paused,
        setPaused,
        enabled,
        setEnabled,
        fullscreen: fullscreen || expanded,
        toggleFullscreen,
        onNotebook,
      }}
    >
      <div
        ref={host}
        className={`od-session ${fullscreen || expanded ? "is-fullscreen" : ""} ${expanded ? "is-expanded" : ""}`}
      >
        <audio
          ref={player}
          preload="none"
          aria-label="Approved character recording"
        />
        {completed && (fullscreen || expanded) && (
          <button className="od-completion-exit" onClick={toggleFullscreen}>
            Exit full screen
          </button>
        )}
        {children}
      </div>
    </OceanSessionContext.Provider>
  );
}
