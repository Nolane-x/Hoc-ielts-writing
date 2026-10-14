import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [releaseWorkflow, ciWorkflow, packageJson] = await Promise.all([
  readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse)
]);

test('release workflow waits for all three platform jobs before publishing', () => {
  assert.match(releaseWorkflow, /windows:\s*\n\s+runs-on:\s*windows-latest/);
  assert.match(releaseWorkflow, /linux:\s*\n\s+runs-on:\s*ubuntu-latest/);
  assert.match(releaseWorkflow, /android:\s*\n\s+runs-on:\s*ubuntu-latest/);
  assert.match(releaseWorkflow, /needs:\s*\[windows, linux, android\]/);
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
  assert.equal(packageJson.version, '1.5.0');
});

test('CI is read-only, uses the lockfile and blocks high-severity dependency advisories', () => {
  assert.match(ciWorkflow, /permissions:\s*\n\s+contents:\s*read/);
  assert.match(ciWorkflow, /persist-credentials:\s*false/);
  assert.match(ciWorkflow, /npm ci --no-audit --no-fund/);
  assert.match(ciWorkflow, /npm audit --audit-level=high/);
  assert.doesNotMatch(ciWorkflow, /git push origin/);
  assert.doesNotMatch(ciWorkflow, /One-time lockfile version synchronization/);
});
