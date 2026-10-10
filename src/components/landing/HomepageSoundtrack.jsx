import { useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import "./homepage-soundtrack.css";

const MUTE_KEY = "px-home-music-muted";
const LOCK_NAME = "perspective-x-homepage-soundtrack";
const TRACK = "/audio/homepage/hopeful-cinematic-journey.mp3";

function readMute() {
  try { return localStorage.getItem(MUTE_KEY) === "true"; }
  catch { return false; }
}

export default function HomepageSoundtrack() {
  const { pathname } = useLocation();
  const controller = useRef(null);
  const [status, setStatus] = useState("paused");

  useLayoutEffect(() => {
    if (pathname !== "/") return;
    const audio = new Audio();
    audio.preload = "none";
    audio.loop = true;
    audio.volume = 0;
    audio.src = TRACK;
    let disposed = false;
    let pageActive = true;
    let muted = readMute();
    let currentStatus = muted ? "muted" : "paused";
    let inFlight = false;
    let retryAfterRelease = false;
    let generation = 0;
    let releaseHold;
    let frame;

    function report(next) {
      currentStatus = next;
      if (!disposed) setStatus(next);
    }

    function canPlay() {
      return !disposed && pageActive && !muted && !document.hidden;
    }

    function stop(next = "paused", reset = false) {
      ++generation;
      retryAfterRelease = false;
      cancelAnimationFrame(frame);
      audio.muted = true;
      audio.pause();
      audio.volume = 0;
      if (reset) audio.currentTime = 0;
      releaseHold?.();
      report(next);
    }

    function fadeIn() {
      let started = performance.now();
      let previousTime = audio.currentTime;
      const step = (now) => {
        if (!canPlay() || audio.paused) return;
        // Native looping keeps one stream; taper its tail and ramp up after each wrap.
        if (audio.currentTime < previousTime - 0.25) started = now;
        previousTime = audio.currentTime;
        const fade = Math.max(0, Math.min(1, (now - started) / 3000));
        const tail = Number.isFinite(audio.duration)
          ? Math.max(0, Math.min(1, audio.duration - audio.currentTime)) : 1;
        audio.volume = 0.15 * Math.min(fade, tail);
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }

    function start() {
      if (!canPlay() || currentStatus === "playing" || currentStatus === "unavailable") return;
      if (inFlight) { retryAfterRelease = true; return; }
      // Fail closed on older browsers rather than risk two competing audio streams.
      if (!navigator.locks?.request) { report("unsupported"); return; }
      inFlight = true;
      const attempt = ++generation;
      report("starting");
      navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
        if (attempt !== generation || !canPlay()) return;
        if (!lock) { report("busy"); return; }
        const held = new Promise(resolve => { releaseHold = resolve; });
        try {
          // Ask for audible playback at the intended level, never muted autoplay.
          // A zero-volume play request can otherwise bypass the browser's initial gate.
          audio.volume = 0.15;
          audio.muted = false;
          await audio.play();
          if (attempt !== generation || !canPlay()) {
            audio.muted = true;
            audio.pause();
            return;
          }
          audio.volume = 0;
          report("playing");
          fadeIn();
          // Keep exclusive ownership through playback AND any pending play() promise.
          await held;
        } catch (error) {
          if (attempt === generation && canPlay()) {
            stop(error.name === "NotAllowedError" ? "blocked" : "unavailable");
          }
        } finally {
          releaseHold = undefined;
        }
      }).catch(() => {
        if (attempt === generation && canPlay()) stop("unsupported");
      }).finally(() => {
        inFlight = false;
        if (retryAfterRelease && canPlay()) {
          retryAfterRelease = false;
          start();
        }
      });
    }

    function toggle() {
      if (currentStatus === "playing" || currentStatus === "starting") {
        muted = true;
        try { localStorage.setItem(MUTE_KEY, "true"); } catch { /* memory preference still applies */ }
        stop("muted");
      } else {
        muted = false;
        try { localStorage.setItem(MUTE_KEY, "false"); } catch { /* storage may be unavailable */ }
        start();
      }
    }

    function interaction(event) {
      if (!event.isTrusted || event.target.closest?.(".home-music-control")) return;
      if (event.type === "keydown" && (event.repeat || event.ctrlKey || event.metaKey || event.altKey)) return;
      if (["blocked", "busy", "paused"].includes(currentStatus)) start();
    }
    function visibility() {
      if (document.hidden) stop(muted ? "muted" : "paused");
      else start();
    }
    function storage(event) {
      if (event.key !== MUTE_KEY && event.key !== null) return;
      muted = readMute();
      if (muted) stop("muted");
      else start();
    }
    function pageHide() { pageActive = false; stop(muted ? "muted" : "paused", true); }
    function pageShow() { pageActive = true; start(); }
    function mediaError() { stop("unavailable"); }
    function mediaPause() {
      if (audio.paused && currentStatus === "playing") stop(muted ? "muted" : "paused");
    }

    controller.current = { toggle };
    report(currentStatus);
    audio.addEventListener("error", mediaError);
    audio.addEventListener("pause", mediaPause);
    document.addEventListener("pointerdown", interaction, true);
    document.addEventListener("keydown", interaction, true);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("storage", storage);
    window.addEventListener("pagehide", pageHide);
    window.addEventListener("pageshow", pageShow);
    start();

    return () => {
      disposed = true;
      stop("paused", true);
      document.removeEventListener("pointerdown", interaction, true);
      document.removeEventListener("keydown", interaction, true);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("storage", storage);
      window.removeEventListener("pagehide", pageHide);
      window.removeEventListener("pageshow", pageShow);
      audio.removeEventListener("error", mediaError);
      audio.removeEventListener("pause", mediaPause);
      audio.removeAttribute("src");
      audio.load();
      controller.current = null;
    };
  }, [pathname]);

  if (pathname !== "/") return null;
  const playing = status === "playing";
  const unavailable = status === "unavailable" || status === "unsupported";
  const label = playing || status === "starting" ? "Mute homepage music" : "Play homepage music";
  const message = status === "busy" ? "Homepage music is playing in another tab."
    : status === "blocked" ? "Activate the speaker or interact with the homepage to start music."
    : status === "unsupported" ? "Homepage music is unavailable: this browser cannot coordinate audio across tabs."
    : status === "unavailable" ? "Homepage music is unavailable. Please try reloading the homepage."
    : playing ? "Homepage music is playing." : "Homepage music is paused.";
  return (
    <>
      <button type="button" className="home-music-control" aria-label={label}
        aria-pressed={playing} aria-describedby="home-music-status" title={unavailable ? message : label}
        disabled={unavailable} onClick={() => controller.current?.toggle()}>
        {playing ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
      </button>
      <span id="home-music-status" className="home-music-status" role="status">{message}</span>
    </>
  );
}
