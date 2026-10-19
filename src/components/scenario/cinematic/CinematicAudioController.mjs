export const VOICE_PROFILES = {
  Hamad: { prefer: /david|daniel|guy|ryan|aaron|james/i, rate: 0.96 },
  Mariam: { prefer: /jenny|samantha|aria|ava|emma|zira/i, rate: 1.06 },
  Saeed: { prefer: /alex|evan|mark|andrew|oliver/i, rate: 1.04 },
  Fatima: { prefer: /susan|karen|hazel|sonia|serena/i, rate: 0.94 },
  Narrator: { prefer: /george|thomas|brian|arthur|daniel/i, rate: 0.92 },
};
export function assignVoices(voices = []) {
  const english = voices.filter((v) => /^en(?:-|_)/i.test(v.lang || ""));
  const pool = english.length ? english : voices;
  const used = new Set();
  return Object.fromEntries(
    Object.entries(VOICE_PROFILES).map(([speaker, profile]) => {
      const voice =
        pool.find((v) => !used.has(v) && profile.prefer.test(v.name)) ||
        pool.find((v) => !used.has(v)) ||
        pool[0] ||
        null;
      if (voice) used.add(voice);
      return [speaker, voice];
    }),
  );
}
export function captionDuration(text, rate = 1) {
  return Math.max(
    2200,
    (text.trim().split(/\s+/).length / (2.6 * rate)) * 1000,
  );
}
// Owns only this player's speech and optional recorded voice. Device voices are a best effort,
// not a promise of an accent, age or gender. No external voice service or generated audio.
export class CinematicAudioController {
  constructor({
    synthesis = globalThis.speechSynthesis,
    Utterance = globalThis.SpeechSynthesisUtterance,
    Audio = globalThis.Audio,
    fetch = globalThis.fetch,
  } = {}) {
    this.synthesis = synthesis;
    this.Utterance = Utterance;
    this.Audio = Audio;
    this.fetch = fetch;
    this.voices = assignVoices(synthesis?.getVoices?.() || []);
    this.volume = 0.85;
    this.muted = false;
    this.generation = 0;
    this.active = null;
    this.recording = null;
    this.onVoices = () => {
      if (!this.voiceSessionChosen)
        this.voices = assignVoices(this.synthesis?.getVoices?.() || []);
    };
    synthesis?.addEventListener?.("voiceschanged", this.onVoices);
  }
  configure({ muted, volume }) {
    this.muted = muted;
    this.volume = volume;
    if (this.recording) this.recording.volume = muted ? 0 : volume;
  }
  async ready() {
    if (!this.synthesis || !this.Utterance) return;
    if (!this.synthesis.getVoices().length)
      await new Promise((resolve) => {
        const done = () => {
          clearTimeout(timer);
          this.synthesis.removeEventListener?.("voiceschanged", done);
          if (this.waitDone === done) this.waitDone = null;
          resolve();
        };
        const timer = setTimeout(done, 1200);
        this.waitDone = done;
        this.synthesis.addEventListener?.("voiceschanged", done, {
          once: true,
        });
      });
    if (!this.voiceSessionChosen) {
      this.voices = assignVoices(this.synthesis.getVoices());
      this.voiceSessionChosen = Object.values(this.voices).some(Boolean);
    }
  }
  cancel() {
    this.generation++;
    this.waitDone?.();
    clearTimeout(this.watchdog);
    if (this.active) {
      this.active.onend = null;
      this.active.onerror = null;
      this.synthesis?.cancel?.();
      this.active = null;
    }
    if (this.recording) {
      this.recording.pause();
      this.recording.removeAttribute("src");
      this.recording.load?.();
      this.recording = null;
    }
    this.abort?.abort();
  }
  async speak(event, onFinish, onFallback) {
    this.cancel();
    const generation = this.generation;
    let delivered = false;
    const finishOnce = () => {
      if (!delivered) {
        delivered = true;
        onFinish();
      }
    };
    const fallbackOnce = () => {
      if (!delivered) {
        delivered = true;
        onFallback();
      }
    };
    if (this.muted || this.volume === 0) {
      onFallback();
      return;
    }
    const valid = () => generation === this.generation;
    if (event.recordedAudio && this.Audio && this.fetch) {
      this.abort = new AbortController();
      try {
        const response = await this.fetch(event.recordedAudio, {
          method: "HEAD",
          signal: this.abort.signal,
        });
        if (!valid()) return;
        if (
          response.ok &&
          (response.headers.get("content-type") || "").startsWith("audio/")
        ) {
          const audio = new this.Audio(event.recordedAudio);
          this.recording = audio;
          audio.volume = this.volume;
          audio.onended = () => {
            if (valid()) {
              this.recording = null;
              finishOnce();
            }
          };
          audio.onerror = () => {
            if (valid()) {
              audio.pause();
              this.recording = null;
              this.speak(
                { ...event, recordedAudio: null },
                onFinish,
                onFallback,
              );
            }
          };
          await audio.play();
          return;
        }
      } catch {
        /* Missing/unplayable recordings fall back to local device speech. */
      }
    }
    await this.ready();
    if (!valid()) return;
    const voice = this.voices[event.voiceProfile || event.speaker];
    if (!this.synthesis || !this.Utterance || !voice) {
      fallbackOnce();
      return;
    }
    try {
      const line = new this.Utterance(event.text);
      line.voice = voice;
      line.lang = voice.lang;
      line.rate = event.rate || VOICE_PROFILES[event.speaker]?.rate || 1;
      line.pitch = event.pitch || 1;
      line.volume = this.volume;
      this.active = line;
      const finish = () => {
        if (valid()) {
          clearTimeout(this.watchdog);
          this.active = null;
          finishOnce();
        }
      };
      line.onend = finish;
      line.onerror = () => {
        if (valid()) {
          clearTimeout(this.watchdog);
          this.active = null;
          fallbackOnce();
        }
      };
      // Recover from a device that never emits onend; regular speech always gates advancement.
      this.watchdog = setTimeout(
        () => {
          if (valid()) {
            this.cancel();
            fallbackOnce();
          }
        },
        Math.max(45000, captionDuration(event.text, line.rate) * 4),
      );
      this.synthesis.speak(line);
    } catch {
      if (valid()) {
        this.active = null;
        fallbackOnce();
      }
    }
  }
  dispose() {
    this.cancel();
    this.synthesis?.removeEventListener?.("voiceschanged", this.onVoices);
  }
}
