import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSpeechReader,
  prepareSpeechText,
  resolveSpeechLocale,
  splitSpeechText
} from '../web/speech-reader.mjs';

class FakeUtterance {
  constructor(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1;
    this.pitch = 1;
    this.voice = null;
  }
}

function makeSpeechEnvironment(voices = [{ name: 'British English', lang: 'en-GB' }, { name: 'Vietnamese', lang: 'vi-VN' }]) {
  const utterances = [];
  const calls = { cancel: 0, pause: 0, resume: 0 };
  const speechSynthesis = {
    getVoices: () => voices,
    cancel: () => { calls.cancel++; },
    speak: utterance => { utterances.push(utterance); },
    pause: () => { calls.pause++; },
    resume: () => { calls.resume++; }
  };
  return { speechSynthesis, utterances, calls };
}

test('speech preparation strips URLs and redacts credential-like text before playback', () => {
  const result = prepareSpeechText('Read this https://example.test/page api_key=abc123 and continue.');
  assert.match(result.text, /Read this/);
  assert.doesNotMatch(result.text, /example\.test|abc123/);
  assert.match(result.text, /đã ẩn thông tin nhạy cảm/);
  assert.equal(result.truncated, false);
  assert.equal(prepareSpeechText('   ').text, '');
});

test('speech preparation limits long content without making an unbounded utterance', () => {
  const result = prepareSpeechText('Useful words '.repeat(2500), 1000);
  assert.equal(result.truncated, true);
  assert.ok(result.text.length <= 1000);
  assert.ok(result.text.endsWith('…'));
});

test('automatic locale distinguishes Vietnamese from English while explicit locale wins', () => {
  assert.equal(resolveSpeechLocale('Bài viết này có nhiều ý tưởng.'), 'vi-VN');
  assert.equal(resolveSpeechLocale('The essay discusses education and technology.'), 'en-GB');
  assert.equal(resolveSpeechLocale('Đề bài tiếng Việt', 'en-US'), 'en-US');
  assert.equal(resolveSpeechLocale('Hello', 'bad-locale'), 'en-GB');
});

test('long text is split into bounded, non-empty utterances at readable boundaries', () => {
  const text = ('This is a complete sentence about IELTS writing. ').repeat(100);
  const chunks = splitSpeechText(text, 180);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(chunk => chunk.length <= 180 && chunk.length > 0));
  assert.ok(chunks.every(chunk => !chunk.startsWith(' ')));
  assert.ok(chunks[0].endsWith('.'));
});

test('reader queues chunks sequentially and supports pause, resume and completion', () => {
  const env = makeSpeechEnvironment();
  const states = [];
  const reader = createSpeechReader({ ...env, SpeechSynthesisUtterance: FakeUtterance, onState: state => states.push(state) });
  const result = reader.speak(('This is a full IELTS sentence for listening practice. ').repeat(70), { language: 'en-GB', rate: 1.25 });
  assert.equal(result, true);
  assert.equal(env.utterances.length, 1, 'only one utterance should be active at a time');
  assert.equal(env.utterances[0].lang, 'en-GB');
  assert.equal(env.utterances[0].rate, 1.25);
  assert.equal(env.utterances[0].voice.name, 'British English');
  assert.equal(reader.isActive(), true);
  assert.equal(reader.pause(), true);
  assert.equal(env.calls.pause, 1);
  assert.equal(reader.getState().status, 'paused');
  assert.equal(reader.resume(), true);
  assert.equal(env.calls.resume, 1);
  assert.equal(reader.getState().status, 'speaking');

  let safety = 0;
  while (reader.isActive() && safety++ < 20) env.utterances[env.utterances.length - 1].onend();
  assert.equal(reader.isActive(), false);
  assert.equal(reader.getState().status, 'complete');
  assert.ok(states.some(state => state.status === 'complete'));
});

test('stopping playback invalidates stale utterance callbacks', () => {
  const env = makeSpeechEnvironment();
  const reader = createSpeechReader({ ...env, SpeechSynthesisUtterance: FakeUtterance });
  reader.speak('A useful English sentence.');
  const stale = env.utterances[0];
  reader.stop();
  stale.onend();
  assert.equal(env.utterances.length, 1);
  assert.equal(reader.isActive(), false);
  assert.equal(reader.getState().status, 'stopped');
});

test('reader fails closed when Web Speech APIs are unavailable', () => {
  const states = [];
  const reader = createSpeechReader({
    speechSynthesis: null,
    SpeechSynthesisUtterance: null,
    onState: state => states.push(state)
  });
  assert.equal(reader.speak('An IELTS practice sentence.'), false);
  assert.equal(reader.getState().status, 'unsupported');
  assert.match(states.at(-1).message, /chưa hỗ trợ/);
});
