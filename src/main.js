/**
 * Entry point.
 * Styles are imported here so Vite bundles, minifies and hashes them.
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';
import './styles/projects.css';

import { initMenu } from './ui.js';

initMenu();
