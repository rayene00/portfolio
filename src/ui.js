/**
 * DOM interactions that don't depend on WebGL.
 */

/**
 * Tracks how far the intro (first viewport) has been scrolled, from 0 to 1.
 * Exposes it to CSS as `--p` on <html> and returns a getter for the 3D scene.
 */
export function initScrollProgress() {
  const root = document.documentElement;
  let progress = 0;
  let ticking = false;

  const update = () => {
    ticking = false;
    progress = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
    root.style.setProperty('--p', progress.toFixed(3));
  };

  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  update();

  return () => progress;
}

/** Keeps the copyright year in the footer current. */
export function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

/** Mobile menu: toggles the sidebar body and closes it after a link is chosen. */
export function initMenu() {
  const sidebar = document.querySelector('.sidebar');
  const toggle = sidebar?.querySelector('.menu-toggle');
  if (!sidebar || !toggle) return;

  const setOpen = (open) => {
    sidebar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!sidebar.classList.contains('is-open')));

  sidebar.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}
