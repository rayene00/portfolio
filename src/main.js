/**
 * Entry point.
 * Styles are imported here so Vite bundles, minifies and hashes them.
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/portfolio.css';

import { initActiveNav, initScrollProgress } from './ui.js';

const getProgress = initScrollProgress();
initActiveNav();

// Three.js is loaded in a separate chunk so the page content renders first.
const canvas = document.getElementById('scene');
if (canvas) {
  import('./scene.js')
    .then(({ initScene }) => initScene(canvas, getProgress))
    .catch(() => canvas.remove());
}
