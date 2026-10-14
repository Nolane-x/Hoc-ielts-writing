import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [packageJson, html, viteConfig, visualWorkflow, smokeScript] = await Promise.all([
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../web/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../vite.config.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/visual-smoke.yml', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/visual-smoke.mjs', import.meta.url), 'utf8')
]);

test('visible application version is generated from package.json at build time', () => {
  assert.match(html, /WMR · __APP_VERSION__ · Personal workspace/);
  assert.match(viteConfig, /transformIndexHtml\(html\)/);
  assert.match(viteConfig, /replaceAll\('__APP_VERSION__', packageJson\.version\)/);
  assert.doesNotMatch(html, /WMR · 1\.4\.0 · Personal workspace/);
  assert.match(packageJson.version, /^\d+\.\d+\.\d+$/);
});

test('visual smoke is wired to feature pushes, pull requests, and manual dispatch', () => {
  assert.match(visualWorkflow, /push:\s*\n\s+branches:\s*\['feat\/\*\*'\]/);
  assert.match(visualWorkflow, /pull_request:\s*\n\s+branches: \[main\]/);
  assert.match(visualWorkflow, /workflow_dispatch:/);
});

test('visual smoke captures workspace, agent, local report, learning, settings, and mobile UI', () => {
  for (const name of [
    '01-writing-workspace-desktop.png',
    '02-writing-agent-desktop.png',
    '03-local-report-desktop.png',
    '04-learning-dashboard-desktop.png',
    '05-settings-privacy-desktop.png',
    '06-writing-workspace-mobile.png',
    '07-mobile-navigation-open.png'
  ]) assert.ok(smokeScript.includes(name), `Missing screenshot: ${name}`);
  assert.match(smokeScript, /documentWidth <= geometry\.viewportWidth \+ 8/);
  assert.match(visualWorkflow, /actions\/upload-artifact@v4/);
  assert.match(visualWorkflow, /name: wmr-ui-screenshots/);
});
