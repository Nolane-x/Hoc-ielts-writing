import { buildSpokenSummary } from './companion-policy.mjs';

export const SPEECH_TEXT_LIMIT = 30000;
export const SPEECH_CHUNK_LIMIT = 1200;
const ALLOWED_LOCALES = new Set(['auto', 'en-GB', 'en-US', 'vi-VN']);

export function prepareSpeechText(value, maxLength = SPEECH_TEXT_LIMIT) {
  const requested = Number(maxLength);
  const limit = Number.isFinite(requested)
    ? Math.max(1, Math.min(SPEECH_TEXT_LIMIT, Math.floor(requested)))
    : SPEECH_TEXT_LIMIT;
  const cleaned = buildSpokenSummary(value, limit + 1);
  const truncated = cleaned.length > limit;
  const text = truncated ? cleaned.slice(0, Math.max(0, limit - 1)).trimEnd() + '…' : cleaned;
  return { text, truncated };
}

export function resolveSpeechLocale(value, preference = 'auto') {
  const selected = ALLOWED_LOCALES.has(preference) ? preference : 'auto';
  if (selected !== 'auto') return selected;
  const text = String(value || '');
  // Vietnamese tone marks and letters are a strong signal; English IELTS essays normally use plain Latin.
  return /[\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01A0\u01A1\u01AF\u01B0\u1EA0-\u1EF9]/u.test(text)
    ? 'vi-VN'
    : 'en-GB';
}

export function splitSpeechText(value, maxChunkLength = SPEECH_CHUNK_LIMIT) {
  const source = String(value || '').replace(/\s+/gu, ' ').trim().slice(0, SPEECH_TEXT_LIMIT);
  if (!source) return [];
  const requested = Number(maxChunkLength);
  const limit = Number.isFinite(requested)
    ? Math.max(80, Math.min(SPEECH_CHUNK_LIMIT, Math.floor(requested)))
    : SPEECH_CHUNK_LIMIT;
  const chunks = [];
  let offset = 0;
  while (offset < source.length) {
    let end = Math.min(source.length, offset + limit);
    if (end < source.length) {
      const window = source.slice(offset, end);
      const boundaries = ['. ', '! ', '? ', '; ', ': ']
        .map(separator => window.lastIndexOf(separator))
        .filter(index => index >= Math.floor(limit * 0.45));
      if (boundaries.length) {
        end = offset + Math.max(...boundaries) + 1;
      } else {
        const whitespace = source.lastIndexOf(' ', end);
        if (whitespace > offset + Math.floor(limit * 0.4)) end = whitespace;
      }
    }
    if (end <= offset) end = Math.min(source.length, offset + limit);
    const chunk = source.slice(offset, end).trim();
    if (chunk) chunks.push(chunk);
    offset = end;
    while (source[offset] === ' ') offset++;
  }
  return chunks;
}

export function createSpeechReader({
  speechSynthesis = globalThis.speechSynthesis,
  SpeechSynthesisUtterance = globalThis.SpeechSynthesisUtterance,
  onState = () => {}
} = {}) {
  let generation = 0;
  let active = false;
  let paused = false;
  let currentIndex = 0;
  let currentTotal = 0;
  let currentUtterance = null;
  let state = {
    status: 'idle',
    message: 'Sẵn sàng đọc bài viết, đề IELTS hoặc nội dung đang chọn.',
    currentChunk: 0,
    totalChunks: 0,
    truncated: false
  };

  function emit(next) {
    state = { ...state, ...next };
    try { onState({ ...state }); } catch { /* UI feedback must not interrupt playback. */ }
  }

  function cancelNativeSpeech() {
    try { speechSynthesis?.cancel?.(); } catch { /* Browser speech may be unavailable or locked. */ }
  }

  function chooseVoice(locale) {
    let voices = [];
    try { voices = speechSynthesis?.getVoices?.() || []; } catch { voices = []; }
    const exact = voices.find(voice => String(voice.lang || '').toLowerCase() === locale.toLowerCase());
    if (exact) return exact;
    const language = locale.split('-')[0].toLowerCase();
    return voices.find(voice => String(voice.lang || '').toLowerCase().startsWith(language + '-')) || null;
  }

  function stop() {
    generation += 1;
    active = false;
    paused = false;
    currentIndex = 0;
    currentTotal = 0;
    currentUtterance = null;
    cancelNativeSpeech();
    emit({
      status: 'stopped',
      message: 'Đã dừng đọc thành tiếng.',
      currentChunk: 0,
      totalChunks: 0,
      truncated: false
    });
    return true;
  }

  function speak(value, options = {}) {
    generation += 1;
    const runId = generation;
    active = false;
    paused = false;
    currentUtterance = null;
    cancelNativeSpeech();

    const prepared = prepareSpeechText(value);
    if (!prepared.text) {
      currentIndex = 0;
      currentTotal = 0;
      emit({
        status: 'empty',
        message: 'Chưa có nội dung để đọc. Hãy nhập bài viết hoặc chọn một đoạn văn.',
        currentChunk: 0,
        totalChunks: 0,
        truncated: false
      });
      return false;
    }
    if (!speechSynthesis || typeof speechSynthesis.speak !== 'function' || typeof SpeechSynthesisUtterance !== 'function') {
      currentIndex = 0;
      currentTotal = 0;
      emit({
        status: 'unsupported',
        message: 'Trình duyệt hoặc hệ điều hành này chưa hỗ trợ đọc thành tiếng. Nội dung vẫn nằm trên thiết bị.',
        currentChunk: 0,
        totalChunks: 0,
        truncated: false
      });
      return false;
    }

    const locale = resolveSpeechLocale(prepared.text, options.language);
    const rawRate = Number(options.rate);
    const rate = Number.isFinite(rawRate) ? Math.max(0.75, Math.min(1.5, rawRate)) : 1;
    const chunks = splitSpeechText(prepared.text);
    currentIndex = 0;
    currentTotal = chunks.length;
    active = true;
    paused = false;

    function playNext() {
      if (runId !== generation || !active) return;
      if (currentIndex >= chunks.length) {
        active = false;
        paused = false;
        currentUtterance = null;
        emit({
          status: 'complete',
          message: prepared.truncated
            ? 'Đã đọc xong phần nội dung giới hạn 30.000 ký tự.'
            : 'Đã đọc xong nội dung.',
          currentChunk: currentTotal,
          totalChunks: currentTotal,
          truncated: prepared.truncated
        });
        return;
      }

      let utterance;
      try {
        utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
        utterance.lang = locale;
        utterance.rate = rate;
        utterance.pitch = 1;
        const voice = chooseVoice(locale);
        if (voice) utterance.voice = voice;
        utterance.onend = () => {
          if (runId !== generation || !active) return;
          currentIndex += 1;
          playNext();
        };
        utterance.onerror = event => {
          if (runId !== generation) return;
          active = false;
          paused = false;
          currentUtterance = null;
          const failure = String(event?.error || '');
          emit({
            status: 'error',
            message: failure === 'not-allowed'
              ? 'Trình duyệt chặn phát giọng nói. Hãy bấm nút đọc trực tiếp sau khi tương tác với trang.'
              : 'Không thể tiếp tục phát giọng nói trên thiết bị này. Hãy thử đọc lại hoặc kiểm tra cài đặt âm thanh.',
            currentChunk: currentIndex + 1,
            totalChunks: currentTotal,
            truncated: prepared.truncated
          });
        };
        currentUtterance = utterance;
        emit({
          status: 'speaking',
          message: 'Đang đọc đoạn ' + (currentIndex + 1) + '/' + currentTotal +
            (prepared.truncated ? ' · nội dung dài đã được giới hạn' : ''),
          currentChunk: currentIndex + 1,
          totalChunks: currentTotal,
          truncated: prepared.truncated
        });
        speechSynthesis.speak(utterance);
      } catch {
        active = false;
        paused = false;
        currentUtterance = null;
        emit({
          status: 'error',
          message: 'Thiết bị không thể khởi chạy giọng đọc. Hãy kiểm tra cài đặt âm thanh hoặc thử trình duyệt khác.',
          currentChunk: currentIndex + 1,
          totalChunks: currentTotal,
          truncated: prepared.truncated
        });
      }
    }

    playNext();
    return active;
  }

  function pause() {
    if (!active || paused || typeof speechSynthesis?.pause !== 'function') return false;
    try {
      speechSynthesis.pause();
      paused = true;
      emit({
        status: 'paused',
        message: 'Đang tạm dừng ở đoạn ' + Math.max(1, currentIndex + 1) + '/' + currentTotal + '.',
        currentChunk: Math.max(1, currentIndex + 1),
        totalChunks: currentTotal,
        truncated: Boolean(state.truncated)
      });
      return true;
    } catch {
      return false;
    }
  }

  function resume() {
    if (!active || !paused || typeof speechSynthesis?.resume !== 'function') return false;
    try {
      speechSynthesis.resume();
      paused = false;
      emit({
        status: 'speaking',
        message: 'Tiếp tục đọc đoạn ' + Math.max(1, currentIndex + 1) + '/' + currentTotal + '.',
        currentChunk: Math.max(1, currentIndex + 1),
        totalChunks: currentTotal,
        truncated: Boolean(state.truncated)
      });
      return true;
    } catch {
      return false;
    }
  }

  return {
    speak,
    pause,
    resume,
    stop,
    isActive: () => active,
    getState: () => ({ ...state })
  };
}
