/**
 * DOM interactions that don't depend on WebGL.
 */

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
