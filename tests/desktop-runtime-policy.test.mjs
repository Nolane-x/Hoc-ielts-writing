import test from 'node:test';
import assert from 'node:assert/strict';
import policy from '../desktop/runtime-policy.cjs';

test('desktop utility process receives only an environment allowlist', () => {
  const env = policy.createRuntimeEnvironment({
    PATH: '/usr/bin', HOME: '/home/test', LANG: 'en_US.UTF-8',
    OPENAI_API_KEY: 'must-not-be-inherited', GH_TOKEN: 'must-not-be-inherited',
    AWS_SECRET_ACCESS_KEY: 'must-not-be-inherited', NODE_OPTIONS: '--require attacker.js',
    HOST: '0.0.0.0', PORT: '9999'
  }, '/home/test/.wmr', 4179);
  assert.equal(env.PATH, '/usr/bin');
  assert.equal(env.HOME, '/home/test');
  assert.equal(env.NODE_ENV, 'production');
  assert.equal(env.HOST, '127.0.0.1');
  assert.equal(env.PORT, '4179');
  assert.equal(env.WMR_DATA_DIR, '/home/test/.wmr');
  for (const key of ['OPENAI_API_KEY','GH_TOKEN','AWS_SECRET_ACCESS_KEY','NODE_OPTIONS']) assert.equal(Object.hasOwn(env, key), false);
});

test('desktop navigation accepts only the explicit loopback origin', () => {
  const base = 'http://127.0.0.1:4179';
  assert.equal(policy.isInternalNavigation(base + '/', base), true);
  assert.equal(policy.isInternalNavigation(base + '/report?x=1', base), true);
  assert.equal(policy.isInternalNavigation('https://127.0.0.1:4179/', base), false);
  assert.equal(policy.isInternalNavigation('http://localhost:4179/', base), false);
  assert.equal(policy.isInternalNavigation('http://127.0.0.1.evil.example:4179/', base), false);
  assert.equal(policy.isInternalNavigation('http://127.0.0.1:4179@evil.example/', base), false);
  assert.equal(policy.isInternalNavigation('javascript:alert(1)', base), false);
});
