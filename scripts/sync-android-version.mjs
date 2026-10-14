import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function calculateAndroidVersion(version) {
  const value = String(version || '');
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error('package.json version must be a stable semantic version');

  const [, majorText, minorText, patchText] = match;
  const [major, minor, patch] = [majorText, minorText, patchText].map(Number);
  if ([major, minor, patch].some(part => !Number.isSafeInteger(part) || part < 0 || part > 999)) {
    throw new Error('Version components must be between 0 and 999 for the Android version code mapping.');
  }

  const versionCode = major * 1_000_000 + minor * 1_000 + patch;
  if (!Number.isSafeInteger(versionCode) || versionCode < 1 || versionCode > 2_100_000_000) {
    throw new Error('Calculated Android versionCode is outside the supported range.');
  }
  return { versionName: value, versionCode };
}

export function alignAndroidGradleVersion(gradleText, packageVersion) {
  if (typeof gradleText !== 'string') throw new TypeError('gradleText must be a string');
  const { versionName, versionCode } = calculateAndroidVersion(packageVersion);
  let codeUpdated = false;
  let nameUpdated = false;
  const content = gradleText
    .replace(/\\bversionCode\\s+\\d+\\b/, () => {
      codeUpdated = true;
      return 'versionCode ' + versionCode;
    })
    .replace(/\\bversionName\\s+(['"])[^'"\\r\\n]+\\1/, () => {
      nameUpdated = true;
      return 'versionName "' + versionName + '"';
    });
  if (!codeUpdated || !nameUpdated) {
    throw new Error('Could not locate generated Android versionCode and versionName fields.');
  }
  return { content, versionName, versionCode };
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
  const gradleText = await readFile(gradlePath, 'utf8');
  const result = alignAndroidGradleVersion(gradleText, packageJson.version);
  await writeFile(gradlePath, result.content);
  console.log('Android version ' + result.versionName + ' (versionCode ' + result.versionCode + ').');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
