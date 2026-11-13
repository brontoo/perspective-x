import { useRef, useState } from "react";

// Two layers keep the last decoded illustration visible until the target is presentable.
export default function DessertArtwork({
  image,
  scene,
  title,
  onReady,
  children,
}) {
  const [shown, setShown] = useState(null);
  const [failed, setFailed] = useState(null);
  const current = useRef(image.url);
  current.current = image.url;
  async function loaded(event) {
    const element = event.currentTarget,
      url = image.url;
    try {
      await element.decode();
    } catch {
      /* a cached frame may already be decoded */
    }
    requestAnimationFrame(() => {
      if (!element.isConnected || current.current !== url) return;
      setShown(image);
      setFailed(null);
      onReady(url);
    });
  }
  const ready = shown?.url === image.url;
  return (
    <div
      className="px-dessert-art"
      data-art-ready={ready ? "true" : "false"}
      data-art-scene={scene}
    >
      {failed === image.url ? (
        <p className="px-dessert-art-unavailable">
          Scene {scene}: {title}. Scene artwork is unavailable. The recorded
          story and scientific controls remain available.
        </p>
      ) : (
        <>
          {shown && !ready && (
            <img
              className="px-dessert-retained-image"
              src={shown.url}
              srcSet={`${shown.smallUrl} 768w, ${shown.url} 1376w`}
              sizes="(max-width: 768px) 100vw, 1376px"
              alt="Previous scene retained while the next illustration loads"
            />
          )}
          <img
            key={image.url}
            className="px-dessert-scene-image"
            src={image.url}
            srcSet={`${image.smallUrl} 768w, ${image.url} 1376w`}
            sizes="(max-width: 768px) 100vw, 1376px"
            loading="eager"
            fetchPriority={scene === 1 ? "high" : "auto"}
            alt={`Scene ${scene}: ${title}`}
            style={{ opacity: ready ? 1 : 0 }}
            onLoad={loaded}
            onError={() => {
              if (current.current !== image.url) return;
              setFailed(image.url);
              onReady(image.url);
            }}
          />
        </>
      )}
      {children}
    </div>
  );
}
