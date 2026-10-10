import { setup } from "./fixtures";

export const MUTE = "px-home-music-muted";
export const launch = (policy) => ({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args: ["--no-sandbox", "--disable-dev-shm-usage", `--autoplay-policy=${policy}`] });

// Record native elements and calls, without replacing their decoding/playback.
export async function observe(page, { mute = false, fail = false, noLocks = false, delay = false, blockUntilGesture = false } = {}) {
  await page.addInitScript(({ mute, fail, noLocks, delay, blockUntilGesture }) => {
    if (mute) localStorage.setItem("px-home-music-muted", "true");
    let interacted = false;
    const gesture = event => { if (event.isTrusted) interacted = true; };
    document.addEventListener("pointerdown", gesture, true);
    document.addEventListener("keydown", gesture, true);
    window.homeAudio = [];
    const NativeAudio = window.Audio;
    window.Audio = function (...args) {
      const audio = new NativeAudio(...args);
      audio.attempts = 0;
      audio.playRequests = [];
      window.homeAudio.push(audio);
      return audio;
    };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      if (!this.src.includes("hopeful-cinematic-journey.mp3")) return play.apply(this, args);
      this.attempts++;
      this.playRequests.push({ volume: this.volume, muted: this.muted });
      // Exercise policy rejection deterministically; subsequent playback is native.
      if (blockUntilGesture && !interacted) return Promise.reject(new DOMException("Autoplay denied", "NotAllowedError"));
      if (fail) return Promise.reject(new DOMException("Unavailable test asset", "NotSupportedError"));
      const result = play.apply(this, args);
      if (delay && this.attempts === 1) {
        return new Promise((resolve, reject) => {
          window.settleHomePlay = () => result.then(resolve, reject);
          // Handle native cancellation immediately, even while the wrapper is pending.
          result.catch(() => {});
        });
      }
      return result;
    };
    if (noLocks) Object.defineProperty(navigator, "locks", { value: undefined });
  }, { mute, fail, noLocks, delay, blockUntilGesture });
  await setup(page);
}
export const control = (page) => page.locator(".home-music-control");
export const audioState = (page) => page.evaluate(() => {
  const audio = window.homeAudio.at(-1);
  return { count: window.homeAudio.length, paused: audio.paused, time: audio.currentTime, volume: audio.volume, duration: audio.duration, attempts: audio.attempts, loop: audio.loop, src: audio.getAttribute("src"), ready: audio.readyState };
});

