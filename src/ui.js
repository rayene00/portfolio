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

/**
 * Fades elements with `.reveal` in as they enter the viewport.
 * Siblings get an increasing delay so groups cascade in.
 */
export function initReveal() {
  const items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((child) => child.classList.contains('reveal'));
    el.style.setProperty('--delay', `${Math.min(siblings.indexOf(el), 6) * 70}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );

  items.forEach((el) => observer.observe(el));
}

/** Highlights the sidebar link of the section currently in the middle of the screen. */
export function initActiveNav() {
  const links = new Map(
    [...document.querySelectorAll('.nav__link')].map((link) => [link.getAttribute('href').slice(1), link]),
  );
  if (!links.size || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link, id) => {
          const active = id === entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );

  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
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
