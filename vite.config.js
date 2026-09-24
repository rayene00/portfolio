import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works both at https://<user>.github.io/
  // and under a project sub-path such as https://<user>.github.io/portfolio/.
  base: './',
  build: {
    target: 'es2020',
  },
});
