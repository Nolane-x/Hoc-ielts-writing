import test, { after } from 'node:test';
import http from 'node:http';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';

const dataDir = await mkdtemp(path.join(os.tmpdir(), 'wmr-integration-'));
process.env.WMR_DATA_DIR = dataDir;
const { createWmrServer, initialise } = await import('../server/index.mjs');
await initialise();
after(async () => { await rm(dataDir, { recursive: true, force: true }); });

test('local HTTP runtime binds to loopback, reports health, and defaults to opt-out', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
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


test('write endpoints reject unsupported media types before parsing request bodies', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const response = await fetch(base + '/api/settings', {
    method: 'POST', headers: { 'content-type': 'text/plain', origin: base }, body: 'externalAllowed=true'
  });
  assert.equal(response.status, 415);
});

test('write endpoints cap the request body size', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const body = JSON.stringify({ taskType: 'task2', essay: 'x'.repeat(120_000) });
  const response = await fetch(base + '/api/assessment', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body
  });
  assert.equal(response.status, 413);
});

test('encoded traversal paths cannot read files outside the built web root', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const response = await fetch(base + '/%2e%2e%2f%2e%2e%2fetc/passwd');
  assert.equal(response.status, 403);
});


test('writing agent route refuses provider execution when permission is disabled', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  await fetch(base + '/api/settings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ provider: 'ollama', baseUrl: 'http://127.0.0.1:11434/v1', model: 'blocked-test-model', externalAllowed: false })
  });
  const response = await fetch(base + '/api/agent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ taskType: 'task2', taskPrompt: 'Discuss a policy.', essay: 'A sufficiently long essay is not needed to verify a permission gate.', message: 'Inspect this draft.', sessionId: 'agent-permission-test-0001' })
  });
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'Hãy bật quyền gửi nội dung tới provider trong Settings trước khi chạy Agent AI.');
});

test('writing agent streams tool progress and final result from a configured local provider', async t => {
  const outputs = [
    JSON.stringify({ kind: 'tool_call', name: 'inspect_draft', arguments: {} }),
    JSON.stringify({ kind: 'final', message: 'Đã kiểm tra bài nháp trong workspace cục bộ.' })
  ];
  const providerServer = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    assert.equal(payload.model, 'wmr-test-model');
    assert.equal(payload.stream, false);
    const text = outputs.shift();
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      model: 'wmr-test-model',
      choices: [{ message: { content: text } }],
      usage: { prompt_tokens: 80, completion_tokens: 30 }
    }));
  });
  await new Promise((resolve, reject) => { providerServer.once('error', reject); providerServer.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => providerServer.close(resolve)); });

  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const providerBase = 'http://127.0.0.1:' + providerServer.address().port + '/v1';
  const saved = await fetch(base + '/api/settings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({
      provider: 'ollama',
      baseUrl: providerBase,
      model: 'wmr-test-model',
      externalAllowed: true,
      dailyBudgetUsd: 1,
      maxCallUsd: 1,
      maxDailyCalls: 4,
      maxOutputTokens: 900
    })
  });
  assert.equal(saved.status, 200);

  const response = await fetch(base + '/api/agent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({
      taskType: 'task2',
      taskPrompt: 'Discuss the benefits of public transport.',
      essay: 'Public transport can reduce traffic. It is important because buses carry many passengers. Governments should plan routes carefully.',
      message: 'Inspect my draft and summarise one next step.',
      sessionId: 'agent-stream-test-session-0001'
    })
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /text\/event-stream/i);
  const events = await response.text();
  assert.match(events, /event: progress/);
  assert.match(events, /event: tool/);
  assert.match(events, /event: result/);
  assert.match(events, /\"estimatedSessionCostUsd\":0/);
  assert.match(events, /\"maximumModelTurns\":10/);
  assert.match(events, /\"maximumToolCalls\":8/);
  assert.match(events, /Đã kiểm tra bài nháp trong workspace cục bộ/);
  assert.equal(outputs.length, 0);
});
