import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [releaseWorkflow, ciWorkflow, packageJson, visualWorkflow, visualSmoke, app] = await Promise.all([
  readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.github/workflows/visual-smoke.yml', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/visual-smoke.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../web/app.mjs', import.meta.url), 'utf8')
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

test('Chromium smoke exercises the local Read Aloud playback lifecycle with a fake engine', () => {
  for (const id of ['speech-reader-panel', 'speech-reader-pause', 'speech-reader-resume', 'speech-reader-stop', 'speech-reader-status']) {
    assert.ok(visualSmoke.includes('#' + id), 'visual smoke must cover #' + id);
  }
  assert.match(visualSmoke, /data-speech-read=.*essay/,
    'Visual smoke must exercise read-aloud playback for the essay.');
  for (const state of ['pauses', 'resumes', 'cancels']) {
    assert.ok(visualSmoke.includes(state), 'visual smoke must verify speech lifecycle: ' + state);
  }
});


test('Chromium smoke audits WCAG 2.1 A/AA accessibility on desktop and mobile', () => {
  assert.match(visualWorkflow, /npm install --no-save --package-lock=false playwright axe-core/);
  assert.match(visualSmoke, /new URL\('\/axe\.min\.js', baseUrl\)/);
  assert.match(visualWorkflow, /cp node_modules\/axe-core\/axe\.min\.js dist\/axe\.min\.js/);
  assert.match(visualSmoke, /wcag2a/);
  assert.match(visualSmoke, /wcag2aa/);
  assert.match(visualSmoke, /wcag21a/);
  assert.match(visualSmoke, /wcag21aa/);
  for (const flow of [
    "desktop-writing-workspace",
    "desktop-report",
    "desktop-learning-dashboard",
    "desktop-settings-privacy",
    "desktop-exam-practice",
    "mobile-writing-workspace-390x844",
    "mobile-exam-practice-390x844"
  ]) assert.ok(visualSmoke.includes("'" + flow + "'"), 'Missing accessibility scan for ' + flow);
  assert.match(visualSmoke, /impact === 'critical' \|\| item\.impact === 'serious'/);
  assert.match(visualSmoke, /accessibilityChecks/);
  assert.equal((visualSmoke.match(/writeFile\(path\.join\(outputDir, 'visual-smoke-manifest\.json'/g) || []).length, 1,
    'A single manifest writer must preserve accessibility results in both pass and fail paths.');
  assert.match(visualSmoke, /failure: failure \? String\(failure\.stack \|\| failure\) : null/);
  const finalManifestStart = visualSmoke.lastIndexOf("status: failure ? 'failed' : 'passed'");
  const finalManifestEnd = visualSmoke.indexOf("failure: failure ?", finalManifestStart);
  assert.ok(finalManifestStart >= 0 && finalManifestEnd > finalManifestStart);
  assert.ok(visualSmoke.slice(finalManifestStart, finalManifestEnd).includes('accessibilityChecks'),
    'Final manifest written from finally must retain every Axe scan result.');
});


test('report filters expose toggle semantics instead of an incomplete ARIA tablist', () => {
  assert.match(app, /report-filter-bar\" role=\"group\" aria-label=\"Lọc lỗi theo tiêu chí/);
  assert.match(app, /aria-pressed=\"' \+ String\(activeReportFilter === key\)/);
  assert.doesNotMatch(app, /report-filter-bar\" role=\"tablist\"/);
});


test('Chromium smoke runs keyboard-only skip-navigation and native Space activation checks', () => {
  assert.match(visualSmoke, /Keyboard-only smoke starts in an isolated browser context/);
  assert.match(visualSmoke, /skipMetadata\.tabIndex, 0/);
  assert.match(visualSmoke, /keyboardPage\.keyboard\.press\('Tab'\)/);
  assert.match(visualSmoke, /keyboardPage\.keyboard\.press\('Enter'\)/);
  assert.match(visualSmoke, /keyboardPage\.keyboard\.press\('Space'\)/);
  assert.match(visualSmoke, /skip-link-keyboard-focus\.png/);
  assert.match(visualSmoke, /visible focus indicator/);
});
