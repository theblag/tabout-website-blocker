import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'public/popup.html'),
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  root: '.',
  publicDir: 'public',  // Important: disable public dir copying
});