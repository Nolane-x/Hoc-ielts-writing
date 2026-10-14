import { defineConfig } from 'vite';

export default defineConfig({
  root: 'web',
  base: './',
  build: { outDir: '../dist', emptyOutDir: true, sourcemap: false, target: 'es2022' },
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4179',
        changeOrigin: false,
        secure: false
      }
    }
  }
});
