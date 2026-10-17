import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechReader, inferSpeechLanguage, splitSpeechText } from '../web/speech.mjs';

test('speech text is normalized and split into bounded chunks without losing words', () => {
  const input = ('A careful sentence. ').repeat(120);
  const chunks = splitSpeechText(input, 180);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(chunk => chunk.length <= 180));
  assert.equal(chunks.join(' ').replace(/\s+/g, ' ').trim(), input.replace(/\s+/g, ' ').trim());
  assert.deepEqual(splitSpeechText('  \n  '), []);
});

test('speech language selection distinguishes Vietnamese teaching text from English essays', () => {
  assert.equal(inferSpeechLanguage('Hãy kiểm tra lập luận và bằng chứng.'), 'vi-VN');
  assert.equal(inferSpeechLanguage('The evidence supports a clear position.'), 'en-US');
});

test('reader speaks bounded chunks in order and announces completion', () => {
  class FakeUtterance {
    constructor(text) { this.text = text; }
  }
  const synthesis = {
    spoken: [],
    speak(utterance) { this.spoken.push(utterance); },
    cancel() {},
    pause() {},
    resume() {}
  };
  const states = [];
  const reader = createSpeechReader({ speechSynthesis: synthesis, SpeechSynthesisUtterance: FakeUtterance }, state => states.push(state));

  const text = 'First sentence. '.repeat(80).trim();
  const result = reader.read(text, { rate: 1.1 });
  assert.equal(result.ok, true);
  assert.ok(result.chunkCount > 1);
  assert.equal(synthesis.spoken.length, 1);
  assert.equal(synthesis.spoken[0].lang, 'en-US');
  assert.equal(synthesis.spoken[0].rate, 1.1);

  let spokenIndex = 0;
  while (reader.getState().state === 'speaking') {
    const utterance = synthesis.spoken[spokenIndex];
    assert.ok(utterance, 'expected next bounded speech chunk');
    utterance.onend();
    spokenIndex += 1;
  }
  assert.equal(synthesis.spoken.length, result.chunkCount);
  assert.equal(reader.getState().state, 'complete');
  assert.ok(states.some(item => item.state === 'speaking'));
});

test('reader pauses, resumes and stops; stale speech callbacks cannot restart cancelled text', () => {
  class FakeUtterance {
    constructor(text) { this.text = text; }
  }
  const synthesis = {
    spoken: [], cancelled: 0, paused: 0, resumed: 0,
    speak(utterance) { this.spoken.push(utterance); },
    cancel() { this.cancelled += 1; },
    pause() { this.paused += 1; },
    resume() { this.resumed += 1; }
  };
  const reader = createSpeechReader({ speechSynthesis: synthesis, SpeechSynthesisUtterance: FakeUtterance });
  reader.read('First sentence. Second sentence.');
  const stale = synthesis.spoken[0];

  assert.equal(reader.pause(), true);
  assert.equal(reader.getState().state, 'paused');
  assert.equal(reader.resume(), true);
  assert.equal(synthesis.resumed, 1);
  reader.stop();
  assert.equal(reader.getState().state, 'idle');
  const spokenCount = synthesis.spoken.length;
  stale.onend();
  assert.equal(synthesis.spoken.length, spokenCount);
  assert.ok(synthesis.cancelled >= 2);
});

test('reader fails safely when native speech is unavailable or text is empty', () => {
  const unsupported = createSpeechReader({ speechSynthesis: null, SpeechSynthesisUtterance: null });
  assert.equal(unsupported.supported, false);
  assert.equal(unsupported.read('Hello').reason, 'speech-not-supported');

  class FakeUtterance {}
  const synthesis = { speak() {}, cancel() {} };
  const reader = createSpeechReader({ speechSynthesis: synthesis, SpeechSynthesisUtterance: FakeUtterance });
  assert.equal(reader.read('   ').reason, 'empty-text');
});
