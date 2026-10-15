import {
  HERO_SOURCE,
  CLOUD_REGIONS,
  CLOUD_CYCLE_SECONDS,
  coverGeometry,
  regionBounds,
  polygonCoverage,
} from "./cinematicMotionGeometry";

const DEFAULT_ARTWORK = {
  url: "/images/perspective/home-cinematic.webp",
  source: HERO_SOURCE,
  regions: CLOUD_REGIONS,
};

const vertexSource = `
  attribute vec2 aPosition;
  void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;
const fragmentSource = `
  precision highp float;
  uniform sampler2D uArtwork;
  uniform sampler2D uMask;
  uniform vec2 uSourceSize;
  uniform vec2 uContainer;
  uniform vec2 uResolution;
  uniform vec2 uOffset;
  uniform float uCoverScale;
  uniform float uTime;
  void main() {
    vec2 screen = gl_FragCoord.xy / uResolution * uContainer;
    screen.y = uContainer.y - screen.y;
    vec2 source = (screen - uOffset) / uCoverScale;
    vec2 uv = source / uSourceSize;
    vec3 islands = texture2D(uMask, uv).rgb;
    float coverage = max(islands.r, max(islands.g, islands.b));
    if (coverage < 0.004) discard;
    float phaseOffset = dot(islands, vec3(0.0, 1.2, 2.4)) / max(dot(islands, vec3(1.0)), 0.001);
    float phase = uTime * 6.28318530718 / ${CLOUD_CYCLE_SECONDS.toFixed(1)} + phaseOffset;
    float entry = smoothstep(0.0, 3.0, uTime);
    // At most 8 horizontal and 0.45 vertical CSS pixels. The traveling
    // texture field closes continuously after 48 seconds; no rectangular crop moves.
    vec2 drift = vec2(8.0 * sin(phase - uv.x * 2.4 - uv.y * 1.5), 0.45 * sin(phase + 0.9));
    vec2 sampleUV = (source + drift * entry / uCoverScale) / uSourceSize;
    gl_FragColor = vec4(texture2D(uArtwork, sampleUV).rgb, coverage);
  }
`;

function createMask(source, regions, cloudBounds) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Mask rendering unavailable");
  const pixels = context.createImageData(canvas.width, canvas.height);
  regions.forEach(({ points }, channel) => {
    const bounds = cloudBounds[channel];
    for (let y = bounds.y; y < bounds.bottom; y++) {
      for (let x = bounds.x; x < bounds.right; x++) {
        const index = (y * canvas.width + x) * 4;
        pixels.data[index + channel] = Math.round(
          polygonCoverage(x + 0.5, y + 0.5, points) * 255,
        );
        pixels.data[index + 3] = 255;
      }
    }
  });
  context.putImageData(pixels, 0, 0);
  return canvas;
}

// This function owns one player and returns its complete synchronous cleanup,
// including when loading or graphics initialization has not finished yet.
export function startCloudMotion(canvas, scene, artwork = DEFAULT_ARTWORK) {
  const { source, regions, url } = artwork;
  const cloudBounds = regions.map(({ points }) => regionBounds(points));
  let stopped = false,
    ready = false,
    frame = null,
    observer = null;
  let gl = null,
    program = null,
    buffer = null,
    geometry = null;
  let elapsed = 0,
    previousTime = null,
    lastDraw = -Infinity;
  const shaders = [],
    textures = [];
  const image = new Image();
  const uniforms = {};
  const setState = (state) => {
    canvas.dataset.state = state;
  };

  function cancelFrame() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
  }
  function stop() {
    if (stopped) return;
    stopped = true;
    cancelFrame();
    observer?.disconnect();
    document.removeEventListener("visibilitychange", visibilityChanged);
    window.removeEventListener("resize", measure);
    canvas.removeEventListener("webglcontextlost", contextLost);
    image.onload = null;
    image.onerror = null;
    if (gl) {
      gl.useProgram(null);
      textures.forEach((texture) => gl.deleteTexture(texture));
      shaders.forEach((shader) => gl.deleteShader(shader));
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    }
    setState("static");
    canvas.width = canvas.height = 1;
  }
  function fallback() {
    stop();
    setState("unavailable");
  }
  function contextLost(event) {
    event.preventDefault();
    fallback();
  }

  function shader(type, source) {
    const result = gl.createShader(type);
    if (!result) throw new Error("Shader unavailable");
    shaders.push(result);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS))
      throw new Error("Shader compilation unavailable");
    return result;
  }
  function texture(source, unit, name) {
    const result = gl.createTexture();
    if (!result) throw new Error("Texture unavailable");
    textures.push(result);
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, result);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.uniform1i(gl.getUniformLocation(program, name), unit);
  }
  function measure() {
    if (!ready || stopped) return;
    try {
      const { width, height } = scene.getBoundingClientRect();
      const style = getComputedStyle(scene);
      if (
        style.backgroundSize !== "cover" ||
        !style.backgroundImage.includes(url)
      )
        throw new Error("Background sizing changed");
      geometry = coverGeometry(
        width,
        height,
        image.naturalWidth,
        image.naturalHeight,
        style.backgroundPosition,
      );
      // Mobile keeps its existing pixel budget. Desktop supports Retina clarity
      // without unbounded allocations on very large or high-DPR displays.
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        width <= 800 ? 1 : 2,
        Math.sqrt(8300000 / (width * height)),
      );
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uContainer, width, height);
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uOffset, geometry.offsetX, geometry.offsetY);
      gl.uniform1f(uniforms.uCoverScale, geometry.scale);
      if (!document.hidden) draw();
    } catch {
      fallback();
    }
  }
  function draw() {
    if (!geometry || stopped) return;
    gl.disable(gl.SCISSOR_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.uTime, elapsed / 1000);
    gl.enable(gl.SCISSOR_TEST);
    // Shade only the three cloud bounding boxes, not every scene pixel.
    for (const bounds of cloudBounds) {
      const xRatio = canvas.width / geometry.width,
        yRatio = canvas.height / geometry.height;
      const left = Math.max(
        0,
        Math.floor((bounds.x * geometry.scale + geometry.offsetX) * xRatio),
      );
      const right = Math.min(
        canvas.width,
        Math.ceil((bounds.right * geometry.scale + geometry.offsetX) * xRatio),
      );
      const top = Math.max(
        0,
        Math.floor((bounds.y * geometry.scale + geometry.offsetY) * yRatio),
      );
      const bottom = Math.min(
        canvas.height,
        Math.ceil((bounds.bottom * geometry.scale + geometry.offsetY) * yRatio),
      );
      if (right > left && bottom > top) {
        gl.scissor(left, canvas.height - bottom, right - left, bottom - top);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }
  }
  function tick(timestamp) {
    frame = null;
    if (stopped || document.hidden) return;
    if (gl.isContextLost()) {
      fallback();
      return;
    }
    if (previousTime !== null)
      elapsed += Math.min(100, timestamp - previousTime);
    previousTime = timestamp;
    if (
      timestamp - lastDraw >=
      (geometry.width <= 800 ? 1000 / 30 : 1000 / 60) - 1
    ) {
      draw();
      lastDraw = timestamp;
    }
    frame = requestAnimationFrame(tick);
  }
  function visibilityChanged() {
    cancelFrame();
    if (!ready || stopped) return;
    if (document.hidden) setState("paused");
    else {
      setState("running");
      frame = requestAnimationFrame(tick);
    }
  }

  setState("loading");
  image.onload = () => {
    if (stopped) return;
    try {
      if (
        image.naturalWidth !== source.width ||
        image.naturalHeight !== source.height
      )
        throw new Error("Artwork dimensions changed");
      gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
      if (!gl || gl.getParameter(gl.MAX_TEXTURE_SIZE) < source.width)
        throw new Error("Graphics unavailable");
      canvas.addEventListener("webglcontextlost", contextLost);
      program = gl.createProgram();
      if (!program) throw new Error("Program unavailable");
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Program linking unavailable");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      if (!buffer) throw new Error("Buffer unavailable");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      for (const name of [
        "uSourceSize",
        "uContainer",
        "uResolution",
        "uOffset",
        "uCoverScale",
        "uTime",
      ])
        uniforms[name] = gl.getUniformLocation(program, name);
      gl.uniform2f(uniforms.uSourceSize, source.width, source.height);
      texture(image, 0, "uArtwork");
      texture(createMask(source, regions, cloudBounds), 1, "uMask");
      if (gl.getError() !== gl.NO_ERROR)
        throw new Error("Texture upload unavailable");
      ready = true;
      measure();
      if (stopped) return;
      observer = new ResizeObserver(measure);
      observer.observe(scene);
      window.addEventListener("resize", measure);
      document.addEventListener("visibilitychange", visibilityChanged);
      visibilityChanged();
    } catch {
      fallback();
    }
  };
  image.onerror = fallback;
  image.src = url;
  return stop;
}
