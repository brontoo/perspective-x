import { useEffect, useRef } from "react";

// Legacy cinematic/quiz timers retain their remaining delay while a scene review
// or notebook is open. Their original callbacks and assessment rules stay intact.
export default function usePausableTimers(held) {
  const state = useRef({ held, jobs: new Map(), serial: 0, pausedAt: held ? performance.now() : null, elapsedPause: 0 });
  const api = useRef(null);
  if (!api.current) {
    const arm = job => {
      if (state.current.held) return;
      job.began = performance.now();
      job.native = window.setTimeout(() => {
        if (state.current.held || !state.current.jobs.has(job.id)) return;
        if (!job.repeat) state.current.jobs.delete(job.id);
        job.callback();
        if (job.repeat && state.current.jobs.has(job.id)) { job.remaining = job.delay; arm(job); }
      }, job.remaining);
    };
    const create = (callback, delay, repeat) => {
      const job = { id: ++state.current.serial, callback, delay, remaining: delay, repeat, native: null };
      state.current.jobs.set(job.id, job); arm(job); return job.id;
    };
    const clear = id => { const job = state.current.jobs.get(id); if (job) window.clearTimeout(job.native); state.current.jobs.delete(id); };
    api.current = { setTimeout: (fn, delay = 0) => create(fn, delay, false), setInterval: (fn, delay = 0) => create(fn, delay, true), clearTimeout: clear, clearInterval: clear,
      now: () => performance.now() - state.current.elapsedPause - (state.current.pausedAt === null ? 0 : performance.now() - state.current.pausedAt), arm };
  }
  useEffect(() => {
    const current = state.current;
    if (current.held === held) return;
    current.held = held;
    if (held) {
      current.pausedAt = performance.now();
      for (const job of current.jobs.values()) { window.clearTimeout(job.native); job.remaining = Math.max(0, job.remaining - (performance.now() - job.began)); }
    } else {
      current.elapsedPause += performance.now() - current.pausedAt; current.pausedAt = null;
      for (const job of current.jobs.values()) api.current.arm(job);
    }
  }, [held]);
  useEffect(() => () => { for (const job of state.current.jobs.values()) window.clearTimeout(job.native); state.current.jobs.clear(); }, []);
  return api.current;
}
