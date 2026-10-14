import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEssayAnnotations, renderAnnotatedEssayText } from '../web/essay-annotations.mjs';

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

test('highlights a unique exact quote at its true source position', () => {
  const essay = 'The policy creates a serious problem for rural families.';
  const result = buildEssayAnnotations(essay, [{
    quote: 'serious problem', severity: 'high', category: 'task-response'
  }]);
  assert.deepEqual(result.spans.map(({ start, end, quote }) => ({ start, end, quote })), [
    { start: 24, end: 39, quote: 'serious problem' }
  ]);
  assert.equal(result.unavailable.length, 0);
  const html = renderAnnotatedEssayText(essay, result, escapeHtml);
  assert.match(html, /data-annotation-issue="0"/);
  assert.match(html, /serious problem/);
});

test('repeated phrases are not assigned a guessed location', () => {
  const result = buildEssayAnnotations('Good transport helps people. Good transport helps families.', [
    { quote: 'Good transport', severity: 'high' }
  ]);
  assert.equal(result.spans.length, 0);
  assert.equal(result.unavailable[0].reason, 'ambiguous');
});

test('not-found and too-short quotes are returned as explicitly unavailable', () => {
  const result = buildEssayAnnotations('The original essay stays unchanged.', [
    { quote: 'not in the essay', severity: 'critical' },
    { quote: 'no', severity: 'low' },
    { severity: 'medium' }
  ]);
  assert.equal(result.spans.length, 0);
  assert.deepEqual(result.unavailable.map(item => item.reason), ['not-found', 'missing', 'missing']);
});

test('overlapping quote candidates resolve deterministically in favor of severity and specificity', () => {
  const essay = 'This is a notably weak argument for the policy.';
  const result = buildEssayAnnotations(essay, [
    { quote: 'weak argument', severity: 'low' },
    { quote: 'notably weak argument', severity: 'high' }
  ]);
  assert.equal(result.spans.length, 1);
  assert.equal(result.spans[0].quote, 'notably weak argument');
  assert.deepEqual(result.unavailable.map(item => item.reason), ['overlap']);
});

test('annotated rendering escapes all essay text and only decorates validated ranges', () => {
  const essay = '<img src=x onerror=alert(1)> is not an essay instruction.';
  const result = buildEssayAnnotations(essay, [{ quote: '<img src=x onerror=alert(1)>', severity: 'medium' }]);
  assert.equal(result.spans.length, 1);
  const html = renderAnnotatedEssayText(essay, result, escapeHtml);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img/);
  assert.equal((html.match(/data-annotation-issue=/g) || []).length, 1);
});

test('malformed inputs do not throw or manufacture ranges', () => {
  const result = buildEssayAnnotations(null, [{ quote: 23 }, null, 'bad']);
  assert.equal(result.spans.length, 0);
  assert.equal(result.issueCount, 3);
  assert.equal(result.unavailable.length, 3);
});
