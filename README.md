# Rayene Medjtoh — Portfolio

Personal portfolio of Rayene Medjtoh, computer engineering student at CESI and software engineer at
Sopra Steria, looking for a Summer 2027 software engineering internship in the US or Canada.

**Live site:** https://rayene00.github.io/portfolio/

## Stack

- [Vite](https://vite.dev/) for the dev server and production build
- [Three.js](https://threejs.org/) for the animated node-network backdrop (lazy-loaded)
- Plain HTML, CSS and JavaScript: no framework

## Features

- Scroll-driven 3D intro that settles into an ambient background
- Sticky sidebar navigation with active-section tracking
- Sections: About, Experience, Skills, Projects
- Responsive layout (the sidebar stacks above the content on mobile)
- Respects `prefers-reduced-motion` and pauses the scene when the tab is hidden
- SEO: meta tags, Open Graph, JSON-LD, sitemap and robots.txt

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # build to dist/
npm run preview  # serve the production build locally
```

## Project structure

```
index.html          page markup and content
public/             static files copied as-is (favicon, resume, robots, sitemap)
src/main.js         entry point: imports styles, starts UI and the 3D scene
src/ui.js           scroll progress and active nav link
src/scene.js        Three.js backdrop
src/styles/         colors (tokens), reset (base) and page styles (portfolio)
```

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages through
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). In the repository settings, set
**Pages → Source** to **GitHub Actions**.
