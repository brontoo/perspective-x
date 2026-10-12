import { useEffect, useRef } from "react";
export default function CinematicInteractionOverlay({
  checkpoint,
  prompt,
  children,
}) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
    const heading = ref.current?.querySelector("h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [checkpoint]);
  return (
    <section
      ref={ref}
      className="cm-interaction"
      data-checkpoint={checkpoint}
      aria-label={`${checkpoint} scientific interaction`}
    >
      <div className="cm-interaction-intro">
        <span className="cm-kicker">The story waits for your expertise</span>
        {prompt && (
          <p>
            <strong>Hamad</strong> — “{prompt}”
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
