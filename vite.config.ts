import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' plus HashRouter lets the site run from any GitHub Pages path.
export default defineConfig({ base: './', plugins: [react()] });
