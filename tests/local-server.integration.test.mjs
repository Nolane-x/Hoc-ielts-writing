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
  const modelRequests = [];
  const providerServer = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    modelRequests.push(payload.messages);
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
      learningContext: {
        eligibleEssayCount: 1,
        criterionAverages: [{ id: 'grammar', mean: 6.5, count: 1 }],
        recentAssessments: [{ taskType: 'task2', wordCount: 280, criteria: [{ id: 'grammar', score: 7 }], issueCategories: ['grammar'], resolvedIssues: 1, unresolvedIssues: 2, essayText: 'old-essay-sentinel-should-be-dropped' }],
        extraField: 'ignore-this-field'
      },
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
  const upstreamText = JSON.stringify(modelRequests);
  assert.ok(upstreamText.includes('eligibleEssayCount'));
  assert.ok(upstreamText.includes('learningProgress'));
  assert.doesNotMatch(upstreamText, /old-essay-sentinel-should-be-dropped/);
  assert.doesNotMatch(upstreamText, /ignore-this-field/);
  assert.equal(outputs.length, 0);
});

test('disconnecting during task generation aborts the in-flight provider fetch', async t => {
  let resolveUpstreamStarted;
  const upstreamStarted = new Promise(resolve => { resolveUpstreamStarted = resolve; });
  let resolveUpstreamClosed;
  const upstreamClosed = new Promise(resolve => { resolveUpstreamClosed = resolve; });
  const providerServer = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    resolveUpstreamStarted(JSON.parse(body));
    res.on('close', () => resolveUpstreamClosed());
    // Intentionally leave the upstream response pending until the local client aborts.
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
      provider: 'ollama', baseUrl: providerBase, model: 'wmr-cancel-test-model',
      externalAllowed: true, dailyBudgetUsd: 1, maxCallUsd: 1,
      maxDailyCalls: 4, maxOutputTokens: 900
    })
  });
  assert.equal(saved.status, 200);

  const controller = new AbortController();
  const responsePromise = fetch(base + '/api/tasks/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    signal: controller.signal,
    body: JSON.stringify({ taskType: 'task2', topic: 'Synthetic cancellation test', learnerIdea: 'No personal essay.' })
  }).catch(error => error);
  let modelPayload;
  const started = await Promise.race([
    upstreamStarted.then(payload => { modelPayload = payload; return true; }),
    new Promise(resolve => setTimeout(() => resolve(false), 5000))
  ]);
  assert.equal(started, true, 'The model request should have reached the controlled test provider.');
  assert.ok(modelPayload.messages.some(message => message.role === 'system' && message.content.includes('You generate one original IELTS Writing practice prompt')));

  controller.abort();
  await responsePromise;
  const closed = await Promise.race([
    upstreamClosed.then(() => true),
    new Promise(resolve => setTimeout(() => resolve(false), 5000))
  ]);
  assert.equal(closed, true, 'Closing the local client response should abort the upstream model response.');
});

test('AI task generation route fails closed while provider consent is disabled', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  await fetch(base + '/api/settings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ provider: 'ollama', baseUrl: 'http://127.0.0.1:11434/v1', model: 'blocked-task-model', externalAllowed: false })
  });
  const response = await fetch(base + '/api/tasks/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ taskType: 'task2', topic: 'AI', learnerIdea: 'A practice question.' })
  });
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /Bật quyền gửi provider/);
});

test('AI task generation uses a dedicated strict-schema route and excludes the current essay from provider context', async t => {
  const modelRequests = [];
  const providerServer = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    modelRequests.push(payload.messages);
    assert.equal(payload.model, 'wmr-test-model');
    assert.equal(payload.stream, false);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      model: 'wmr-test-model',
      choices: [{
        message: {
          content: JSON.stringify({
            title: 'Technology and independent learning',
            prompt: 'Some people believe artificial intelligence improves independent learning, while others think it reduces critical thinking. Discuss both views and give your own opinion.',
            goal: 'Evaluate both views and support a clear position with developed reasons.'
          })
        }
      }],
      usage: { prompt_tokens: 90, completion_tokens: 70 }
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
      provider: 'ollama', baseUrl: providerBase, model: 'wmr-test-model',
      externalAllowed: true, dailyBudgetUsd: 1, maxCallUsd: 1,
      maxDailyCalls: 4, maxOutputTokens: 900
    })
  });
  assert.equal(saved.status, 200);

  const response = await fetch(base + '/api/tasks/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({
      taskType: 'task2',
      topic: 'Technology and learning',
      learnerIdea: 'Discuss independent thinking.',
      essay: 'essay-private-sentinel-must-not-leave-device',
      taskPrompt: 'task-prompt-private-sentinel-must-not-leave-device',
      history: [{ role: 'assistant', content: 'history-private-sentinel' }]
    })
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.aiStatus, 'ai-complete');
  const generated = JSON.parse(result.answer);
  assert.equal(generated.taskType, 'task2');
  assert.equal(generated.provenance, 'ai-generated-unverified');
  assert.ok(generated.prompt.length >= 40);
  const upstreamText = JSON.stringify(modelRequests);
  assert.ok(upstreamText.includes('Technology and learning'));
  assert.ok(upstreamText.includes('Discuss independent thinking.'));
  assert.doesNotMatch(upstreamText, /essay-private-sentinel|task-prompt-private-sentinel|history-private-sentinel/);
  assert.match(upstreamText, /You generate one original IELTS Writing practice prompt/);
});


test('revoking provider consent aborts an active Writing Agent provider request', async t => {
  let resolveUpstreamStarted;
  const upstreamStarted = new Promise(resolve => { resolveUpstreamStarted = resolve; });
  let resolveUpstreamClosed;
  const upstreamClosed = new Promise(resolve => { resolveUpstreamClosed = resolve; });
  const providerServer = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    resolveUpstreamStarted(JSON.parse(body));
    res.on('close', () => resolveUpstreamClosed());
    // Keep the synthetic provider response pending until the application aborts it.
  });
  await new Promise((resolve, reject) => { providerServer.once('error', reject); providerServer.listen(0, '127.0.0.1', resolve); });
  t.after(async () => {
    providerServer.closeAllConnections?.();
    await new Promise(resolve => providerServer.close(resolve));
  });

  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const providerBase = 'http://127.0.0.1:' + providerServer.address().port + '/v1';
  const configured = {
    provider: 'ollama',
    baseUrl: providerBase,
    model: 'wmr-consent-revoke-agent-test',
    clearApiKey: true,
    externalAllowed: true,
    dailyBudgetUsd: 1,
    maxCallUsd: 1,
    maxAgentSessionUsd: 1,
    maxDailyCalls: 50,
    maxOutputTokens: 900
  };
  const saved = await fetch(base + '/api/settings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify(configured)
  });
  assert.equal(saved.status, 200);

  const agentResponse = await fetch(base + '/api/agent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({
      taskType: 'task2',
      taskPrompt: 'Discuss the benefits of public transport.',
      essay: 'Public transport can reduce traffic because buses carry many passengers. Governments should plan routes carefully and connect residential areas with workplaces.',
      message: 'Inspect the draft and suggest one next step.',
      sessionId: 'agent-consent-revocation-test-0001'
    })
  });
  assert.equal(agentResponse.status, 200);
  assert.match(agentResponse.headers.get('content-type') || '', /text\/event-stream/i);
  const started = await Promise.race([
    upstreamStarted.then(payload => ({ ok: true, payload })),
    new Promise(resolve => setTimeout(() => resolve({ ok: false }), 5000))
  ]);
  assert.equal(started.ok, true, 'The controlled provider must receive the active Agent request before consent is revoked.');

  const revoked = await fetch(base + '/api/settings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ ...configured, externalAllowed: false })
  });
  assert.equal(revoked.status, 200);
  assert.equal((await revoked.json()).externalAllowed, false);

  const closed = await Promise.race([
    upstreamClosed.then(() => true),
    new Promise(resolve => setTimeout(() => resolve(false), 5000))
  ]);
  assert.equal(closed, true, 'Revoking consent must abort the in-flight upstream Agent fetch, not only prevent the next call.');
  const events = await agentResponse.text();
  assert.match(events, /event: error/);
});

test('revoking provider consent aborts in-flight assessment, Mentor and task-generation calls', async t => {
  const server = createWmrServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;

  const scenarios = [
    {
      name: 'assessment',
      route: '/api/assessment',
      body: {
        taskType: 'task2',
        taskPrompt: 'Discuss both views.',
        essay: 'Some people believe education should focus on theory, while others prefer practical skills. Both approaches have advantages for learners.',
        sendToProvider: true
      }
    },
    {
      name: 'Mentor',
      route: '/api/coach',
      body: {
        taskType: 'task2',
        taskPrompt: 'Discuss both views.',
        essay: 'Some people believe education should focus on theory, while others prefer practical skills.',
        message: 'Help me develop one specific reason.'
      }
    },
    {
      name: 'task generation',
      route: '/api/tasks/generate',
      body: {
        taskType: 'task2',
        topic: 'Synthetic consent-revocation test',
        learnerIdea: 'Create a practice question only.'
      }
    }
  ];

  for (const scenario of scenarios) {
    let resolveUpstreamStarted;
    const upstreamStarted = new Promise(resolve => { resolveUpstreamStarted = resolve; });
    let resolveUpstreamClosed;
    const upstreamClosed = new Promise(resolve => { resolveUpstreamClosed = resolve; });
    const providerServer = http.createServer(async (req, res) => {
      let body = '';
      for await (const chunk of req) body += chunk;
      resolveUpstreamStarted(JSON.parse(body));
      res.on('close', () => resolveUpstreamClosed());
      // Deliberately hold the provider response until WMR aborts it.
    });
    await new Promise((resolve, reject) => { providerServer.once('error', reject); providerServer.listen(0, '127.0.0.1', resolve); });

    try {
      const providerBase = 'http://127.0.0.1:' + providerServer.address().port + '/v1';
      const configured = {
        provider: 'ollama',
        baseUrl: providerBase,
        model: 'wmr-consent-revoke-' + scenario.name.replace(/\s+/g, '-'),
        clearApiKey: true,
        externalAllowed: true,
        dailyBudgetUsd: 1,
        maxCallUsd: 1,
        maxDailyCalls: 50,
        maxOutputTokens: 900
      };
      const saved = await fetch(base + '/api/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: base },
        body: JSON.stringify(configured)
      });
      assert.equal(saved.status, 200, scenario.name + ': provider configuration should be accepted');

      const requestPromise = fetch(base + scenario.route, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: base },
        body: JSON.stringify(scenario.body)
      });
      const started = await Promise.race([
        upstreamStarted.then(payload => ({ ok: true, payload })),
        new Promise(resolve => setTimeout(() => resolve({ ok: false }), 5000))
      ]);
      assert.equal(started.ok, true, scenario.name + ': controlled provider must receive the request before revocation');

      const revoked = await fetch(base + '/api/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: base },
        body: JSON.stringify({ ...configured, externalAllowed: false })
      });
      assert.equal(revoked.status, 200, scenario.name + ': consent revocation should be saved');

      const closed = await Promise.race([
        upstreamClosed.then(() => true),
        new Promise(resolve => setTimeout(() => resolve(false), 5000))
      ]);
      assert.equal(closed, true, scenario.name + ': revoking consent must close the upstream provider request');
      const response = await requestPromise;
      assert.equal(response.status, 409, scenario.name + ': cancelled provider request should not be reported as success');
      assert.match((await response.json()).error, /thu hồi|hủy/i);
    } finally {
      providerServer.closeAllConnections?.();
      await new Promise(resolve => providerServer.close(resolve));
    }
  }
});
