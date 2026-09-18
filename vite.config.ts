import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps assets relative so the build works on GitHub Pages,
// Cloudflare Pages, Vercel and Netlify without extra configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1600,
  },
});