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

/** Highlights the menu link of the section currently in the middle of the screen. */
export function initActiveNav() {
  const links = new Map(
    [...document.querySelectorAll('.nav-link')].map((link) => [link.getAttribute('href').slice(1), link]),
  );
  if (!links.size || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link, id) => link.classList.toggle('active', id === entry.target.id));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );

  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}
