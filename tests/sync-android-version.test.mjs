import test from 'node:test';
import assert from 'node:assert/strict';
import {
  alignAndroidGradleVersion,
  calculateAndroidVersion
} from '../scripts/sync-android-version.mjs';

test('Android version code is deterministic for package semantic versions', () => {
  assert.deepEqual(calculateAndroidVersion('1.5.0'), {
    versionName: '1.5.0',
    versionCode: 1005000
  });
  assert.deepEqual(calculateAndroidVersion('2.7.19'), {
    versionName: '2.7.19',
    versionCode: 2007019
  });
});

test('invalid or unsupported Android release versions fail closed', () => {
  for (const version of ['', '1.5', '1.5.0-beta.1', 'v1.5.0', '1.x.0', '1000.0.0', '1.1000.0', '1.0.1000', '0.0.0']) {
    assert.throws(() => calculateAndroidVersion(version), undefined, version);
  }
});

test('Gradle versionCode and versionName are aligned while preserving unrelated settings', () => {
  const input = [
    'android {',
    '  defaultConfig {',
    '    applicationId "org.nolane.wmr"',
    '    minSdk 23',
    '    versionCode 1',
    "    versionName '1.0'",
    '  }',
    '}',
    ''
  ].join('\n');
  const result = alignAndroidGradleVersion(input, '1.5.0');
  assert.equal(result.versionCode, 1005000);
  assert.equal(result.versionName, '1.5.0');
  assert.match(result.content, /versionCode 1005000/);
  assert.match(result.content, /versionName "1.5.0"/);
  assert.match(result.content, /applicationId "org.nolane.wmr"/);
  assert.match(result.content, /minSdk 23/);
  assert.ok(result.content.endsWith('\n'));
});

test('missing or malformed Gradle version fields are rejected instead of silently publishing defaults', () => {
  assert.throws(() => alignAndroidGradleVersion('defaultConfig { }', '1.5.0'), /Could not locate/);
  assert.throws(() => alignAndroidGradleVersion('versionCode abc\nversionName "1.0"', '1.5.0'), /versionCode is not an integer/);
  assert.throws(() => alignAndroidGradleVersion('versionCode 1', '1.5.0'), /Could not locate/);
});
