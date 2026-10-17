const DEFAULT_MAX_CHUNK = 900;

export function splitSpeechText(value, maxChunkLength = DEFAULT_MAX_CHUNK) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  const limit = Number.isFinite(maxChunkLength) ? Math.max(80, Math.floor(maxChunkLength)) : DEFAULT_MAX_CHUNK;
  if (!text) return [];

  const chunks = [];
  let rest = text;
  while (rest.length > limit) {
    const window = rest.slice(0, limit + 1);
    const sentenceBreak = Math.max(
      window.lastIndexOf('. '),
      window.lastIndexOf('? '),
      window.lastIndexOf('! '),
      window.lastIndexOf('; ')
    );
    const spaceBreak = window.lastIndexOf(' ');
    const cut = sentenceBreak >= Math.floor(limit * 0.45)
      ? sentenceBreak + 1
      : spaceBreak >= Math.floor(limit * 0.45)
        ? spaceBreak
        : limit;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks.filter(Boolean);
}

export function inferSpeechLanguage(value) {
  const text = String(value ?? '');
  if (/[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/iu.test(text)) {
    return 'vi-VN';
  }
  return 'en-US';
}

/**
 * Adapter around the browser's native Web Speech API.
 * No text is sent to a remote speech provider; callers can inject a fake
 * synthesis implementation to test the lifecycle without a browser.
 */
export function createSpeechReader(environment = {}, onStateChange = () => {}) {
  const speechSynthesis = Object.hasOwn(environment, 'speechSynthesis')
    ? environment.speechSynthesis
    : globalThis.speechSynthesis;
  const Utterance = Object.hasOwn(environment, 'SpeechSynthesisUtterance')
    ? environment.SpeechSynthesisUtterance
    : globalThis.SpeechSynthesisUtterance;
  const supported = Boolean(speechSynthesis && typeof speechSynthesis.speak === 'function' &&
    typeof speechSynthesis.cancel === 'function' && typeof Utterance === 'function');

  let generation = 0;
  let chunks = [];
  let chunkIndex = 0;
  let currentUtterance = null;
  let state = 'idle';
  let lastMessage = supported
    ? 'Sử dụng giọng đọc có sẵn trên thiết bị; văn bản không được gửi tới dịch vụ TTS bên ngoài.'
    : 'Trình duyệt hoặc thiết bị này chưa hỗ trợ đọc thành tiếng.';

  function publish(nextState, message) {
    state = nextState;
    if (typeof message === 'string') lastMessage = message;
    try {
      onStateChange({ state, message: lastMessage, supported });
    } catch {
      // UI observers must not break speech playback.
    }
  }

  function clearQueue() {
    generation += 1;
    chunks = [];
    chunkIndex = 0;
    currentUtterance = null;
    if (supported) {
      try { speechSynthesis.cancel(); } catch {}
    }
  }

  function speakNext(runId, language, rate) {
    if (runId !== generation) return;
    if (chunkIndex >= chunks.length) {
      currentUtterance = null;
      publish('complete', 'Đã đọc xong.');
      return;
    }

    let utterance;
    try {
      utterance = new Utterance(chunks[chunkIndex]);
      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.onend = () => {
        if (runId !== generation) return;
        chunkIndex += 1;
        speakNext(runId, language, rate);
      };
      utterance.onerror = event => {
        if (runId !== generation || event?.error === 'canceled' || event?.error === 'interrupted') return;
        currentUtterance = null;
        publish('error', 'Giọng đọc không thể tiếp tục. Hãy thử lại hoặc chọn giọng đọc khác trong thiết bị.');
      };
      currentUtterance = utterance;
      speechSynthesis.speak(utterance);
      publish('speaking', 'Đang đọc đoạn ' + (chunkIndex + 1) + '/' + chunks.length + ' · ' + language + '.');
    } catch {
      currentUtterance = null;
      publish('error', 'Không thể khởi chạy giọng đọc trên thiết bị này.');
    }
  }

  function read(value, options = {}) {
    if (!supported) {
      publish('unsupported', 'Trình duyệt hoặc thiết bị này chưa hỗ trợ đọc thành tiếng.');
      return { ok: false, reason: 'speech-not-supported' };
    }
    const nextChunks = splitSpeechText(value);
    if (!nextChunks.length) {
      publish('idle', 'Không có nội dung để đọc.');
      return { ok: false, reason: 'empty-text' };
    }

    clearQueue();
    chunks = nextChunks;
    chunkIndex = 0;
    const runId = generation;
    const language = String(options.lang || inferSpeechLanguage(value)).slice(0, 35);
    const requestedRate = Number(options.rate);
    const rate = Number.isFinite(requestedRate) ? Math.max(0.7, Math.min(1.3, requestedRate)) : 1;
    speakNext(runId, language, rate);
    return { ok: true, chunkCount: chunks.length, language, rate };
  }

  function pause() {
    if (!supported || state !== 'speaking' || typeof speechSynthesis.pause !== 'function') return false;
    try {
      speechSynthesis.pause();
      publish('paused', 'Đã tạm dừng đọc.');
      return true;
    } catch {
      publish('error', 'Không thể tạm dừng giọng đọc.');
      return false;
    }
  }

  function resume() {
    if (!supported || state !== 'paused' || typeof speechSynthesis.resume !== 'function') return false;
    try {
      speechSynthesis.resume();
      publish('speaking', 'Đang tiếp tục đọc.');
      return true;
    } catch {
      publish('error', 'Không thể tiếp tục giọng đọc.');
      return false;
    }
  }

  function stop() {
    clearQueue();
    publish(supported ? 'idle' : 'unsupported', supported ? 'Đã dừng đọc.' : 'Trình duyệt hoặc thiết bị này chưa hỗ trợ đọc thành tiếng.');
  }

  return {
    get supported() { return supported; },
    getState() { return { state, message: lastMessage, supported, chunkIndex, chunkCount: chunks.length }; },
    read,
    pause,
    resume,
    stop
  };
}
