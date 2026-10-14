const ENV_ALLOWLIST = [
  'PATH', 'Path', 'HOME', 'USERPROFILE', 'TEMP', 'TMP',
  'APPDATA', 'LOCALAPPDATA', 'SystemRoot', 'SYSTEMROOT', 'WINDIR',
  'LANG', 'LC_ALL'
];

function createRuntimeEnvironment(source, dataDirectory, port) {
  const env = {};
  for (const key of ENV_ALLOWLIST) {
    if (typeof source?.[key] === 'string' && source[key].length <= 32768) env[key] = source[key];
  }
  env.NODE_ENV = 'production';
  env.HOST = '127.0.0.1';
  env.PORT = String(port);
  env.WMR_DATA_DIR = String(dataDirectory);
  return env;
}

function isInternalNavigation(target, baseUrl) {
  try {
    const actual = new URL(target);
    const expected = new URL(baseUrl);
    return actual.protocol === 'http:' &&
      actual.origin === expected.origin &&
      actual.username === '' &&
      actual.password === '' &&
      actual.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

module.exports = { createRuntimeEnvironment, isInternalNavigation };
