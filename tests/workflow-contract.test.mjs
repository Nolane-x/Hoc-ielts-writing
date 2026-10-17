import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [releaseWorkflow, ciWorkflow, packageJson, visualWorkflow, visualSmoke] = await Promise.all([
  readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.github/workflows/visual-smoke.yml', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/visual-smoke.mjs', import.meta.url), 'utf8')
]);

test('release workflow waits for all three platform jobs before publishing', () => {
  assert.match(releaseWorkflow, /windows:\s*\n\s+(?:needs:[^\n]*\n\s+)?runs-on:\s*windows-latest/);
  assert.match(releaseWorkflow, /linux:\s*\n\s+(?:needs:[^\n]*\n\s+)?runs-on:\s*ubuntu-latest/);
  assert.match(releaseWorkflow, /android:\s*\n\s+(?:needs:[^\n]*\n\s+)?runs-on:\s*ubuntu-latest/);
  assert.match(releaseWorkflow, /needs:\s*\[verify, visual-smoke, windows, linux, android\]/);
  assert.match(releaseWorkflow, /permissions:\s*\n\s+contents:\s*write/);
  assert.match(releaseWorkflow, /prerelease:\s*true/);
});

test('release asset gate requires Windows, Linux and both Android packages', () => {
  for (const pattern of [
    /-name '\*\.exe'/,
    /-name '\*\.AppImage'/,
    /-name '\*\.deb'/,
    /release-assets\/WMR-Android-debug\.apk/,
    /release-assets\/WMR-Android-unsigned\.aab/
  ]) assert.match(releaseWorkflow, pattern);
  assert.match(releaseWorkflow, /Verify all platform deliverables are present/);
});

test('release tags and display labels derive from package.json version', () => {
  assert.match(releaseWorkflow, /id:\s*appmeta/);
  assert.match(releaseWorkflow, /node -p 'require\("\.\/package\.json"\)\.version'/);
  assert.match(releaseWorkflow, /tag_name:\s*wmr-v\$\{\{ steps\.appmeta\.outputs\.version \}\}-build\.\$\{\{ github\.run_number \}\}/);
  assert.match(releaseWorkflow, /name:\s*WMR Writing Mentor v\$\{\{ steps\.appmeta\.outputs\.version \}\}/);
  assert.equal(packageJson.version, '1.7.0');
});

test('CI is read-only, uses the lockfile and blocks high-severity dependency advisories', () => {
  assert.match(ciWorkflow, /permissions:\s*\n\s+contents:\s*read/);
  assert.match(ciWorkflow, /persist-credentials:\s*false/);
  assert.match(ciWorkflow, /npm ci --no-audit --no-fund/);
  assert.match(ciWorkflow, /npm audit --audit-level=high/);
  assert.doesNotMatch(ciWorkflow, /git push origin/);
  assert.doesNotMatch(ciWorkflow, /One-time lockfile version synchronization/);
});


test('Android release packages derive versionName and versionCode from package metadata', () => {
  const syncStep = releaseWorkflow.indexOf('node scripts/sync-android-version.mjs');
  const buildStep = releaseWorkflow.indexOf('- name: Build APK and Android App Bundle');
  assert.ok(syncStep >= 0, 'missing generated Android version alignment step');
  assert.ok(buildStep > syncStep, 'Android version alignment must occur before Gradle builds');
});


test('release packaging and publication are gated by reusable CI and Chromium smoke', () => {
  assert.match(ciWorkflow, /workflow_call:/, 'CI must be callable as a reusable workflow.');
  assert.match(visualWorkflow, /workflow_call:/, 'Visual smoke must be callable as a reusable workflow.');
  assert.match(releaseWorkflow, /verify:\s*\n\s+name: Required CI \(Node 22 and 24\)\s*\n\s+uses: \.\/\.github\/workflows\/ci\.yml/);
  assert.match(releaseWorkflow, /visual-smoke:\s*\n\s+name: Required Chromium desktop\/mobile smoke\s*\n\s+uses: \.\/\.github\/workflows\/visual-smoke\.yml/);
  for (const job of ['windows', 'linux', 'android']) {
    assert.match(releaseWorkflow, new RegExp(job + ':\\s*\\n\\s+needs:\\s*\\[verify, visual-smoke\\]'),
      job + ' packaging must wait for both quality gates.');
  }
  assert.match(releaseWorkflow, /needs:\s*\[verify, visual-smoke, windows, linux, android\]/,
    'Release publication must wait for both quality gates and all platform artifacts.');
  assert.match(visualWorkflow, /run: node scripts\/visual-smoke\.mjs/);
  assert.match(visualWorkflow, /if-no-files-found: warn/);
});

test('Chromium smoke exercises the local read-aloud playback lifecycle with a fake engine', () => {
  for (const id of ['speech-read', 'speech-pause', 'speech-resume', 'speech-stop', 'speech-status']) {
    assert.ok(visualSmoke.includes('#' + id), 'visual smoke must cover #' + id);
  }
  for (const state of ['pauseCount', 'resumeCount', 'cancelCount']) {
    assert.ok(visualSmoke.includes(state), 'visual smoke must verify speech lifecycle: ' + state);
  }
});
