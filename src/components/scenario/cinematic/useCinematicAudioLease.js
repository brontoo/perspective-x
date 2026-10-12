import { useEffect, useState } from "react";
// Match the existing homepage's Web Lock without changing its track or controller.
// A mission keeps captions playable while another tab owns audio.
const AUDIO_LOCK = "perspective-x-homepage-soundtrack";
export default function useCinematicAudioLease(enabled) {
  const [status, setStatus] = useState("inactive");
  useEffect(() => {
    if (!enabled) {
      setStatus("inactive");
      return;
    }
    // The existing homepage fails closed without Web Locks, so it cannot overlap here.
    if (!navigator.locks?.request) {
      setStatus("granted");
      return;
    }
    let disposed = false,
      release;
    setStatus("pending");
    navigator.locks
      .request(AUDIO_LOCK, { ifAvailable: true }, async (lock) => {
        if (disposed) return;
        if (!lock) {
          setStatus("blocked");
          return;
        }
        setStatus("granted");
        await new Promise((resolve) => {
          release = resolve;
        });
      })
      .catch(() => {
        if (!disposed) setStatus("blocked");
      });
    return () => {
      disposed = true;
      release?.();
    };
  }, [enabled]);
  return status;
}
