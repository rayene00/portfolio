/**
 * Entry point.
 * Styles are imported here so Vite bundles, minifies and hashes them.
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';
import './styles/projects.css';

import { initMenu, initScrollProgress, initYear } from './ui.js';

const getProgress = initScrollProgress();
initMenu();
initYear();

// Three.js is loaded in a separate chunk so the page content renders first.
const canvas = document.getElementById('scene');
if (canvas) {
  import('./scene.js')
    .then(({ initScene }) => initScene(canvas, getProgress))
    .catch(() => canvas.remove());
}
