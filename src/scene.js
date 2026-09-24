/**
 * Hero backdrop: a slowly rotating "node network" sphere drawn with Three.js.
 *
 * - Scroll progress (0 → 1 over the first viewport) dives the camera into the
 *   sphere while the nodes spread out, then the scene settles as an ambient
 *   background behind the content.
 * - The pointer gently tilts the sphere.
 * - Lighter on small screens, static when the user prefers reduced motion,
 *   paused while the tab is hidden.
 *
 * This module is lazy-loaded from main.js so Three.js never blocks first paint.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';

const ACCENT = new Color('#7c6cf2');
const ACCENT_2 = new Color('#c4b5fd');

const RADIUS = 60;
const CAMERA_START_Z = 170;
const CAMERA_END_Z = 28;

/** Soft round sprite so points render as glowing dots instead of squares. */
function createDotTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/** Evenly spreads `count` points on a sphere (Fibonacci lattice), with a little jitter. */
function fibonacciSphere(count, radius, jitter) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const d = radius + (Math.random() - 0.5) * jitter;

    positions[i * 3] = Math.cos(theta) * r * d;
    positions[i * 3 + 1] = y * d;
    positions[i * 3 + 2] = Math.sin(theta) * r * d;
  }
  return positions;
}

/** Colors each node along a vertical gradient between the two accent colors. */
function gradientColors(positions, radius) {
  const colors = new Float32Array(positions.length);
  const c = new Color();
  for (let i = 0; i < positions.length; i += 3) {
    const t = (positions[i + 1] / radius + 1) / 2;
    c.copy(ACCENT).lerp(ACCENT_2, t);
    colors[i] = c.r;
    colors[i + 1] = c.g;
    colors[i + 2] = c.b;
  }
  return colors;
}

/**
 * Links a random subset of nodes to their nearest neighbours.
 * O(n²) on a small subset, computed once at start-up.
 */
function buildLinks(positions, sampleSize, maxDist, linksPerNode) {
  const total = positions.length / 3;
  const picked = [];
  for (let i = 0; i < sampleSize; i++) picked.push(Math.floor(Math.random() * total));

  const segments = [];
  const maxDistSq = maxDist * maxDist;

  for (const a of picked) {
    const ax = positions[a * 3];
    const ay = positions[a * 3 + 1];
    const az = positions[a * 3 + 2];
    const nearest = [];

    for (const b of picked) {
      if (a === b) continue;
      const dx = positions[b * 3] - ax;
      const dy = positions[b * 3 + 1] - ay;
      const dz = positions[b * 3 + 2] - az;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < maxDistSq) nearest.push([distSq, b]);
    }

    nearest.sort((m, n) => m[0] - n[0]);
    for (const [, b] of nearest.slice(0, linksPerNode)) {
      segments.push(ax, ay, az, positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
    }
  }
  return new Float32Array(segments);
}

/** Random faint dust filling a large box around the sphere. */
function dustField(count, spread) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < positions.length; i++) {
    positions[i] = (Math.random() - 0.5) * spread;
  }
  return positions;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {() => number} getProgress returns the intro scroll progress in [0, 1]
 */
export function initScene(canvas, getProgress) {
  const isSmall = window.matchMedia('(max-width: 720px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  } catch {
    // No WebGL: the CSS background alone still looks fine.
    canvas.remove();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = CAMERA_START_Z;

  const dot = createDotTexture();

  // --- Node sphere ---
  const nodeCount = isSmall ? 900 : 1800;
  const nodePositions = fibonacciSphere(nodeCount, RADIUS, 6);
  const nodeGeometry = new BufferGeometry();
  nodeGeometry.setAttribute('position', new Float32BufferAttribute(nodePositions, 3));
  nodeGeometry.setAttribute('color', new Float32BufferAttribute(gradientColors(nodePositions, RADIUS), 3));

  const nodes = new Points(
    nodeGeometry,
    new PointsMaterial({
      size: isSmall ? 2.4 : 2.1,
      map: dot,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );

  // --- Links between nearby nodes ---
  const linkGeometry = new BufferGeometry();
  linkGeometry.setAttribute(
    'position',
    new Float32BufferAttribute(buildLinks(nodePositions, isSmall ? 180 : 360, 26, 2), 3),
  );
  const links = new LineSegments(
    linkGeometry,
    new LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );

  const sphere = new Group();
  sphere.add(nodes, links);
  scene.add(sphere);

  // --- Ambient dust ---
  const dustGeometry = new BufferGeometry();
  dustGeometry.setAttribute('position', new Float32BufferAttribute(dustField(isSmall ? 500 : 1100, 520), 3));
  const dust = new Points(
    dustGeometry,
    new PointsMaterial({
      size: 1.4,
      map: dot,
      color: ACCENT_2,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  scene.add(dust);

  // --- Sizing ---
  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  // --- Pointer tilt (smoothed) ---
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  window.addEventListener(
    'pointermove',
    (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );

  // --- Render loop ---
  let progress = getProgress();
  let frameId = 0;
  let last = performance.now();
  let elapsed = 0;

  const render = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;

    // Ease scroll progress so fast scrolling still feels smooth
    progress = MathUtils.damp(progress, getProgress(), 6, dt);
    const eased = progress * progress * (3 - 2 * progress); // smoothstep

    camera.position.z = MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, eased);

    tilt.x = MathUtils.damp(tilt.x, pointer.y * 0.25, 3, dt);
    tilt.y = MathUtils.damp(tilt.y, pointer.x * 0.35, 3, dt);

    const breathe = 1 + Math.sin(elapsed * 0.8) * 0.015;
    sphere.scale.setScalar(breathe * (1 + eased * 0.9));
    sphere.rotation.y = elapsed * 0.06 + tilt.y;
    sphere.rotation.x = tilt.x;

    dust.rotation.y = elapsed * 0.01;

    renderer.render(scene, camera);
  };

  const loop = (now) => {
    render(now);
    frameId = requestAnimationFrame(loop);
  };

  if (reducedMotion) {
    // No continuous animation: redraw only when something changes.
    const draw = () => requestAnimationFrame(render);
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
    return;
  }

  frameId = requestAnimationFrame(loop);

  // Pause while the tab is hidden to save battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else {
      last = performance.now();
      frameId = requestAnimationFrame(loop);
    }
  });
}
