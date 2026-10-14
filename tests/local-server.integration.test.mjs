import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';

const dataDir = await mkdtemp(path.join(os.tmpdir(), 'wmr-integration-'));
process.env.WMR_DATA_DIR = dataDir;
const { createWmrServer, initialise } = await import('../server/index.mjs');
await initialise();

test('local HTTP runtime binds to loopback, reports health, and defaults to opt-out', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(dataDir, { recursive: true, force: true }); });
  const address = server.address();
  const base = 'http://127.0.0.1:' + address.port;
  const health = await fetch(base + '/api/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).mode, 'local-first');
  const settings = await fetch(base + '/api/settings');
  const data = await settings.json();
  assert.equal(data.externalAllowed, false);
  assert.equal(Object.hasOwn(data, 'apiKey'), false);
});

test('cross-origin JSON writes are rejected before the request body is processed', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const response = await fetch(base + '/api/settings', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
    body: JSON.stringify({ externalAllowed: true, provider: 'openai', model: 'm', apiKey: 'should-never-save' })
  });
  assert.equal(response.status, 403);
});

test('a configured key is not written to settings JSON or returned by the settings endpoint', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const write = await fetch(base + '/api/settings', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ externalAllowed: false, provider: 'openai', model: 'unit-test-model', apiKey: 'unique-test-secret', baseUrl: 'https://api.openai.com/v1' })
  });
  assert.equal(write.status, 200);
  const result = await (await fetch(base + '/api/settings')).json();
  assert.equal(result.hasApiKey, true);
  assert.equal(Object.hasOwn(result, 'apiKey'), false);
  const disk = await readFile(path.join(dataDir, 'settings.json'), 'utf8');
  assert.equal(disk.includes('unique-test-secret'), false);
});

test('opting out prevents provider transmission even if a client requests AI scoring', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const response = await fetch(base + '/api/assessment', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ taskType: 'task2', taskPrompt: 'Discuss both views.', essay: 'Some people believe education should focus on theory. Others prefer practical skills.', sendToProvider: true })
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.aiStatus, 'offline-by-choice');
  assert.equal(result.report.estimatedTaskBand, null);
});
