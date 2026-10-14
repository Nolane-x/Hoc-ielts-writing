import test from 'node:test';
import assert from 'node:assert/strict';
import { completionEndpoint, estimateCost, normaliseProviderConfig, PROVIDER_PRESETS } from '../web/providers.mjs';

test('provider registry covers popular native and OpenAI-compatible APIs', () => {
  for (const id of ['openai','anthropic','google','openrouter','deepseek','groq','together','mistral','ollama','lmstudio','custom']) assert.ok(PROVIDER_PRESETS[id], id);
});

test('rejects remote plaintext HTTP, URL credentials and query strings', () => {
  assert.equal(normaliseProviderConfig({ provider: 'custom', baseUrl: 'http://example.com/v1', model: 'm', apiKey: 'x' }).ok, false);
  assert.equal(normaliseProviderConfig({ provider: 'custom', baseUrl: 'https://u:p@example.com/v1', model: 'm', apiKey: 'x' }).ok, false);
  assert.equal(normaliseProviderConfig({ provider: 'custom', baseUrl: 'https://example.com/v1?key=leak', model: 'm', apiKey: 'x' }).ok, false);
});

test('allows loopback HTTP and requires a model id', () => {
  assert.equal(normaliseProviderConfig({ provider: 'ollama', model: 'qwen3', apiKey: 'local' }).ok, true);
  assert.equal(normaliseProviderConfig({ provider: 'custom', baseUrl: 'https://example.com/v1', apiKey: 'x' }).ok, false);
});

test('maps provider-specific completion endpoints', () => {
  assert.equal(completionEndpoint(normaliseProviderConfig({ provider: 'anthropic', model: 'claude', apiKey: 'x' })), 'https://api.anthropic.com/v1/messages');
  assert.equal(completionEndpoint(normaliseProviderConfig({ provider: 'google', model: 'gemini', apiKey: 'x' })), 'https://generativelanguage.googleapis.com/v1beta/models/gemini:generateContent');
  assert.equal(completionEndpoint(normaliseProviderConfig({ provider: 'openai', model: 'm', apiKey: 'x' })), 'https://api.openai.com/v1/chat/completions');
});

test('remote provider requests fail closed without explicit prices', () => {
  const local = normaliseProviderConfig({ provider: 'ollama', model: 'qwen3', apiKey: 'local' });
  const remote = normaliseProviderConfig({ provider: 'openai', model: 'model', apiKey: 'key' });
  assert.equal(estimateCost(local, 2000), 0);
  assert.equal(estimateCost(remote, 2000), null);
  const priced = normaliseProviderConfig({ provider: 'openai', model: 'model', apiKey: 'key', inputUsdPerMillion: 2, outputUsdPerMillion: 8 });
  assert.ok(estimateCost(priced, 2000) > 0);
});
