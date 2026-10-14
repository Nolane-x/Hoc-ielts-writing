import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitiseSettings } from '../server/index.mjs';

test('settings are bounded and invalid provider ids cannot enable arbitrary providers', () => {
  const settings = sanitiseSettings({ provider: 'not-real', model: 'x'.repeat(1000), maxDailyCalls: 999999, dailyBudgetUsd: 999999 });
  assert.equal(settings.provider, 'openai');
  assert.equal(settings.model.length, 160);
  assert.equal(settings.maxDailyCalls, 50);
  assert.equal(settings.dailyBudgetUsd, 10);
  assert.equal(settings.externalAllowed, false);
});

test('API keys are not represented in persisted settings model', () => {
  const settings = sanitiseSettings({ provider: 'openai', apiKey: 'SECRET', externalAllowed: true });
  assert.equal(Object.hasOwn(settings, 'apiKey'), false);
});

test('settings default to offline and conservative usage limits', () => {
  const settings = sanitiseSettings({});
  assert.equal(settings.externalAllowed, false);
  assert.equal(settings.maxDailyCalls, 8);
  assert.equal(settings.maxOutputTokens, 1800);
});
