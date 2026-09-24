/**
 * Entry point.
 * Styles are imported here so Vite bundles, minifies and hashes them.
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';
import './styles/projects.css';

import {
  initActiveNav,
  initCardSpotlight,
  initMenu,
  initReveal,
  initScrollProgress,
  initYear,
} from './ui.js';

// Lets CSS know JS is running (reveal animations are skipped without it).
document.documentElement.classList.add('js');

const getProgress = initScrollProgress();
initMenu();
initReveal();
initActiveNav();
initCardSpotlight();
initYear();

// Three.js is loaded in a separate chunk so the page content renders first.
const canvas = document.getElementById('scene');
if (canvas) {
  import('./scene.js')
    .then(({ initScene }) => initScene(canvas, getProgress))
    .catch(() => canvas.remove());
}
