import { useEffect, useRef, useState } from "react";
export default function CinematicSceneRenderer({
  scene,
  frozen,
  playing,
  fallback,
}) {
  const [failed, setFailed] = useState(false);
  const last = useRef(scene),
    [previous, setPrevious] = useState(null);
  useEffect(() => setFailed(false), [scene.id]);
  useEffect(() => {
    if (last.current.id === scene.id) return;
    setPrevious({
      ...last.current,
      image: failed ? fallback : last.current.image,
      mobileImage: failed ? null : last.current.mobileImage,
    });
    last.current = scene;
    const timer = setTimeout(() => setPrevious(null), 700);
    return () => clearTimeout(timer);
  }, [scene.id]);
  // Preload only the runtime-selected successor; the player owns branch selection.
  return (
    <div className={`cm-environment ${frozen ? "is-frozen" : ""}`}>
      <picture
        key={scene.id}
        className={`cm-shot cm-camera-${scene.camera}`}
        style={{
          "--cm-duration": `${Math.max(12, scene.duration * 1.4)}s`,
          "--cm-position": scene.imagePosition,
          "--cm-mobile-position": scene.mobilePosition || scene.imagePosition,
          animationPlayState: playing && !frozen ? "running" : "paused",
        }}
      >
        {!failed && scene.mobileImage && (
          <source media="(max-width: 700px)" srcSet={scene.mobileImage} />
        )}
        <img
          src={failed ? fallback : scene.image}
          alt=""
          fetchPriority="high"
          onError={() => setFailed(true)}
        />
      </picture>
      {previous && (
        <picture
          key={`previous-${previous.id}`}
          className="cm-previous"
          style={{
            "--cm-position": previous.imagePosition,
            "--cm-mobile-position":
              previous.mobilePosition || previous.imagePosition,
          }}
        >
          {previous.mobileImage && (
            <source media="(max-width: 700px)" srcSet={previous.mobileImage} />
          )}
          <img src={previous.image} alt="" />
        </picture>
      )}
      <div className="cm-vignette" />
      {failed && (
        <p className="cm-missing" role="status">
          This scene photograph is unavailable. Existing mission artwork is
          shown temporarily; every activity remains playable.
        </p>
      )}
    </div>
  );
}
