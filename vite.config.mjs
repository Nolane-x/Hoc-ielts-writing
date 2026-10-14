import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  plugins: [{
    name: 'wmr-package-version',
    transformIndexHtml(html) {
      return html.replaceAll('__APP_VERSION__', packageJson.version);
    }
  }],
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
