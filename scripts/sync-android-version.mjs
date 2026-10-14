import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function isDecimalInteger(value) {
  return typeof value === 'string' && value.length > 0 &&
    [...value].every(character => character >= '0' && character <= '9');
}

export function calculateAndroidVersion(version) {
  const versionName = String(version || '');
  const parts = versionName.split('.');
  if (parts.length !== 3 || !parts.every(isDecimalInteger)) {
    throw new Error('package.json version must be a stable semantic version');
  }

  const [major, minor, patch] = parts.map(Number);
  if ([major, minor, patch].some(part => !Number.isSafeInteger(part) || part < 0 || part > 999)) {
    throw new Error('Version components must be between 0 and 999 for the Android version code mapping.');
  }

  const versionCode = major * 1_000_000 + minor * 1_000 + patch;
  if (!Number.isSafeInteger(versionCode) || versionCode < 1 || versionCode > 2_100_000_000) {
    throw new Error('Calculated Android versionCode is outside the supported range.');
  }
  return { versionName, versionCode };
}

export function alignAndroidGradleVersion(gradleText, packageVersion) {
  if (typeof gradleText !== 'string') throw new TypeError('gradleText must be a string');
  const { versionName, versionCode } = calculateAndroidVersion(packageVersion);
  let codeUpdated = false;
  let nameUpdated = false;

  const lines = gradleText.split('\n').map(line => line.endsWith('\r') ? line.slice(0, -1) : line);
  const output = lines.map(line => {
    const trimmed = line.trimStart();
    const indent = line.slice(0, line.length - trimmed.length);
    if (trimmed.startsWith('versionCode ')) {
      const current = trimmed.slice('versionCode '.length).trim();
      if (!isDecimalInteger(current)) throw new Error('Generated Android versionCode is not an integer.');
      codeUpdated = true;
      return indent + 'versionCode ' + versionCode;
    }
    if (trimmed.startsWith('versionName ')) {
      nameUpdated = true;
      return indent + 'versionName "' + versionName + '"';
    }
    return line;
  });

  if (!codeUpdated || !nameUpdated) {
    throw new Error('Could not locate generated Android versionCode and versionName fields.');
  }
  return { content: output.join('\n') + (gradleText.endsWith('\n') ? '\n' : ''), versionName, versionCode };
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
