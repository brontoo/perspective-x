import { captionDuration } from "./CinematicAudioController.mjs";
export class CinematicDialogueEngine {
  constructor({ scene, audio, onLine, onEnd, onCue, onFallback = () => {} }) {
    Object.assign(this, { scene, audio, onLine, onEnd, onCue, onFallback });
    this.elapsed = 0;
    this.index = 0;
    this.busy = false;
    this.paused = true;
    this.cued = new Set();
    this.finished = false;
    this.generation = 0;
    this.currentLine = null;
  }
  setPaused(paused) {
    if (paused === this.paused) return;
    this.paused = paused;
    if (paused) {
      this.generation++;
      this.audio.cancel();
      this.busy = false;
      this.readUntil = null;
    }
  }
  tick(milliseconds) {
    if (this.paused || this.finished) return;
    this.elapsed += Math.max(0, Math.min(milliseconds, 250)) / 1000;
    for (const cue of this.scene.cues || [])
      if (this.elapsed >= cue.start && !this.cued.has(cue.id)) {
        this.cued.add(cue.id);
        this.onCue(cue.cue);
      }
    if (this.busy && this.readUntil != null && this.elapsed >= this.readUntil)
      this.completeLine();
    const event = this.scene.dialogue[this.index];
    if (!this.busy && event && this.elapsed >= event.start) {
      this.busy = true;
      this.currentLine = event;
      this.onLine(event);
      const generation = ++this.generation;
      this.audio.speak(
        event,
        () => {
          if (generation === this.generation && !this.paused)
            this.completeLine();
        },
        () => {
          if (generation === this.generation && !this.paused) {
            this.onFallback(event);
            this.readUntil =
              this.elapsed + captionDuration(event.text, event.rate) / 1000;
          }
        },
      );
    }
    if (
      !this.busy &&
      this.index >= this.scene.dialogue.length &&
      this.elapsed >= this.scene.duration
    ) {
      this.finished = true;
      this.audio.cancel();
      this.onEnd();
    }
  }
  completeLine() {
    this.index++;
    this.busy = false;
    this.readUntil = null;
  }
  replay() {
    this.generation++;
    this.audio.cancel();
    this.busy = false;
    this.readUntil = null;
    this.finished = false;
    const index = this.currentLine
      ? this.scene.dialogue.findIndex((e) => e.id === this.currentLine.id)
      : 0;
    this.index = Math.max(0, index);
    this.elapsed = Math.max(
      this.elapsed,
      this.scene.dialogue[this.index]?.start || 0,
    );
  }
  skip() {
    this.generation++;
    this.audio.cancel();
    this.finished = true;
    this.onEnd();
  }
  dispose() {
    this.generation++;
    this.audio.cancel();
    this.finished = true;
  }
}
