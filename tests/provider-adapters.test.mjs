import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseProviderConfig, requestCompletion } from '../web/providers.mjs';

async function withMockFetch(mock, run) {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try { return await run(); } finally { globalThis.fetch = original; }
}

test('OpenAI-compatible adapter sends a bounded non-streaming request and parses usage', async () => {
  await withMockFetch(async (url, options) => {
    assert.equal(String(url), 'https://api.openai.com/v1/chat/completions');
    assert.equal(options.redirect, 'error');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.authorization, 'Bearer test-key');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'test-model');
    assert.equal(body.stream, false);
    assert.equal(body.max_tokens, 500);
    return new Response(JSON.stringify({
      model: 'test-model',
      choices: [{ message: { content: 'adapter ok' } }],
      usage: { prompt_tokens: 11, completion_tokens: 7 }
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }, async () => {
    const config = normaliseProviderConfig({ provider: 'openai', model: 'test-model', apiKey: 'test-key' });
    const result = await requestCompletion({ config, messages: [{ role: 'user', content: 'hello' }], maxOutputTokens: 500 });
    assert.equal(result.text, 'adapter ok');
    assert.equal(result.usage.prompt_tokens, 11);
  });
});

test('Anthropic Messages adapter uses the native message format and API headers', async () => {
  await withMockFetch(async (url, options) => {
    assert.equal(String(url), 'https://api.anthropic.com/v1/messages');
    assert.equal(options.headers['x-api-key'], 'anthropic-test-key');
    assert.equal(options.headers['anthropic-version'], '2023-06-01');
    const body = JSON.parse(options.body);
    assert.equal(body.system, 'Assess safely');
    assert.equal(body.messages[0].content, 'Check this paragraph');
    assert.equal(body.max_tokens, 240);
    return new Response(JSON.stringify({
      model: 'claude-test',
      content: [{ type: 'text', text: 'anthropic adapter ok' }],
      usage: { input_tokens: 12, output_tokens: 8 }
    }), { status: 200 });
  }, async () => {
    const config = normaliseProviderConfig({ provider: 'anthropic', model: 'claude-test', apiKey: 'anthropic-test-key' });
    const result = await requestCompletion({ config, maxOutputTokens: 240, messages: [{ role: 'system', content: 'Assess safely' }, { role: 'user', content: 'Check this paragraph' }] });
    assert.equal(result.text, 'anthropic adapter ok');
    assert.equal(result.usage.completion_tokens, 8);
  });
});

test('Gemini adapter keeps API key out of the URL and parses candidates', async () => {
  await withMockFetch(async (url, options) => {
    assert.equal(String(url), 'https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent');
    assert.equal(options.headers['x-goog-api-key'], 'gemini-test-key');
    assert.equal(String(url).includes('key='), false);
    const body = JSON.parse(options.body);
    assert.equal(body.systemInstruction.parts[0].text, 'Be precise');
    assert.equal(body.contents[0].parts[0].text, 'Explain the error');
    return new Response(JSON.stringify({
      model: 'gemini-test',
      candidates: [{ content: { parts: [{ text: 'gemini adapter ok' }] } }],
      usageMetadata: { promptTokenCount: 13, candidatesTokenCount: 9 }
    }), { status: 200 });
  }, async () => {
    const config = normaliseProviderConfig({ provider: 'google', model: 'gemini-test', apiKey: 'gemini-test-key' });
    const result = await requestCompletion({ config, messages: [{ role: 'system', content: 'Be precise' }, { role: 'user', content: 'Explain the error' }] });
    assert.equal(result.text, 'gemini adapter ok');
    assert.equal(result.usage.prompt_tokens, 13);
  });
});

test('provider errors are reduced to a safe status code and malformed JSON is rejected', async () => {
  await withMockFetch(async () => new Response('not-json', { status: 200 }), async () => {
    const config = normaliseProviderConfig({ provider: 'openai', model: 'test-model', apiKey: 'test-key' });
    await assert.rejects(requestCompletion({ config, messages: [{ role: 'user', content: 'hello' }] }), /provider_invalid_json/);
  });
});


test('provider timeout covers a response body that never finishes after headers', async () => {
  let cancelled = false;
  await withMockFetch(async (_url, options) => {
    let streamController;
    const body = new ReadableStream({
      start(controller) {
        streamController = controller;
        options.signal.addEventListener('abort', () => {
          cancelled = true;
          try { controller.error(new DOMException('aborted', 'AbortError')); } catch {}
        }, { once: true });
      },
      cancel() { cancelled = true; }
    });
    return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } });
  }, async () => {
    const config = normaliseProviderConfig({ provider: 'openai', model: 'test-model', apiKey: 'test-key' });
    await assert.rejects(
      requestCompletion({ config, messages: [{ role: 'user', content: 'hello' }], timeoutMs: 40 }),
      /provider_timeout_or_cancelled/
    );
    assert.equal(cancelled, true);
  });
});
