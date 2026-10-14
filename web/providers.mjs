export const PROVIDER_PRESETS = {
  openai: { label: 'OpenAI', kind: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4.1-mini' },
  anthropic: { label: 'Anthropic', kind: 'anthropic', baseUrl: 'https://api.anthropic.com', model: 'claude-3-7-sonnet-latest' },
  google: { label: 'Google Gemini', kind: 'google', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.5-flash' },
  openrouter: { label: 'OpenRouter', kind: 'openai', baseUrl: 'https://openrouter.ai/api/v1', model: '' },
  deepseek: { label: 'DeepSeek', kind: 'openai', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  groq: { label: 'Groq', kind: 'openai', baseUrl: 'https://api.groq.com/openai/v1', model: '' },
  together: { label: 'Together AI', kind: 'openai', baseUrl: 'https://api.together.xyz/v1', model: '' },
  mistral: { label: 'Mistral AI', kind: 'openai', baseUrl: 'https://api.mistral.ai/v1', model: 'mistral-small-latest' },
  ollama: { label: 'Ollama (local)', kind: 'openai', baseUrl: 'http://127.0.0.1:11434/v1', model: '' },
  lmstudio: { label: 'LM Studio (local)', kind: 'openai', baseUrl: 'http://127.0.0.1:1234/v1', model: '' },
  custom: { label: 'Custom OpenAI-compatible', kind: 'openai', baseUrl: '', model: '' }
};
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);

export function normaliseProviderConfig(input = {}) {
  const id = String(input.provider || 'openai');
  const preset = PROVIDER_PRESETS[id];
  if (!preset) return { ok: false, reason: 'Unknown provider.' };
  const baseUrl = String(input.baseUrl || preset.baseUrl || '').trim();
  const model = String(input.model || '').trim();
  const apiKey = String(input.apiKey || '').trim();
  if (baseUrl.length > 500 || model.length > 160 || apiKey.length > 4096) return { ok: false, reason: 'Provider settings exceed the allowed size.' };
  if (!model) return { ok: false, reason: 'Enter the exact model identifier supplied by your provider.' };
  if (!baseUrl) return { ok: false, reason: 'Enter a provider base URL.' };
  let parsed;
  try { parsed = new URL(baseUrl); } catch { return { ok: false, reason: 'Base URL must be valid.' }; }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) return { ok: false, reason: 'Only HTTP(S) URLs are supported.' };
  if (parsed.username || parsed.password || parsed.search || parsed.hash) return { ok: false, reason: 'Base URL cannot include credentials, query strings or fragments.' };
  const loopback = LOOPBACK.has(parsed.hostname.toLowerCase());
  if (parsed.protocol === 'http:' && !loopback) return { ok: false, reason: 'Remote provider URLs must use HTTPS; HTTP is allowed only on loopback.' };
  if (parsed.pathname.split('/').some(part => part === '..')) return { ok: false, reason: 'Base URL path cannot contain parent-directory segments.' };
  return {
    ok: true, provider: id, label: preset.label, kind: preset.kind,
    baseUrl: parsed.toString().replace(/\/+$/, ''), model, apiKey,
    localEndpoint: loopback, isConfigured: Boolean(model && apiKey),
    inputUsdPerMillion: validPrice(input.inputUsdPerMillion),
    outputUsdPerMillion: validPrice(input.outputUsdPerMillion)
  };
}

export function completionEndpoint(config) {
  if (config.kind === 'anthropic') return config.baseUrl.endsWith('/v1') ? config.baseUrl + '/messages' : config.baseUrl + '/v1/messages';
  if (config.kind === 'google') return config.baseUrl + '/models/' + encodeURIComponent(config.model) + ':generateContent';
  return config.baseUrl.endsWith('/chat/completions') ? config.baseUrl : config.baseUrl + '/chat/completions';
}

export async function requestCompletion(options) {
  const config = options.config;
  if (!config || !config.ok || !config.isConfigured) throw new Error('provider_not_configured');

  const controller = new AbortController();
  const timeoutMs = clampNumber(options.timeoutMs, 45000, 1000, 60000);
  const signal = options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal;
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('provider_timeout_or_cancelled'));
    }, timeoutMs);
  });

  const performRequest = async () => {
    const headers = { 'content-type': 'application/json' };
    const url = completionEndpoint(config);
    let body;
    if (config.kind === 'anthropic') {
      headers['x-api-key'] = config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      const system = options.messages.filter(x => x.role === 'system').map(x => x.content).join('\\n\\n');
      body = {
        model: config.model,
        max_tokens: clampNumber(options.maxOutputTokens, 1800, 80, 3000),
        system,
        messages: options.messages.filter(x => x.role !== 'system').map(x => ({ role: x.role, content: x.content }))
      };
    } else if (config.kind === 'google') {
      headers['x-goog-api-key'] = config.apiKey;
      body = {
        contents: options.messages.filter(x => x.role !== 'system').map(x => ({
          role: x.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: x.content }]
        })),
        systemInstruction: {
          parts: [{ text: options.messages.filter(x => x.role === 'system').map(x => x.content).join('\\n\\n') }]
        },
        generationConfig: {
          maxOutputTokens: clampNumber(options.maxOutputTokens, 1800, 80, 3000),
          temperature: 0.1
        }
      };
    } else {
      headers.authorization = 'Bearer ' + config.apiKey;
      body = {
        model: config.model,
        messages: options.messages,
        temperature: 0.1,
        max_tokens: clampNumber(options.maxOutputTokens, 1800, 80, 3000),
        stream: false
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
      redirect: 'error',
      cache: 'no-store',
      credentials: 'omit'
    });
    const length = Number(response.headers && response.headers.get('content-length'));
    if (Number.isFinite(length) && length > MAX_RESPONSE_CHARS) {
      await response.body?.cancel?.().catch(() => {});
      throw new Error('provider_response_too_large');
    }
    const raw = await readBoundedResponseText(response, MAX_RESPONSE_CHARS);
    if (!response.ok) {
      const error = new Error('provider_http_' + response.status);
      error.status = response.status;
      throw error;
    }
    let payload;
    try { payload = JSON.parse(raw); } catch { throw new Error('provider_invalid_json'); }

    let text;
    let usage;
    if (config.kind === 'anthropic') {
      text = (payload.content || []).filter(x => x.type === 'text').map(x => x.text).join('\\n');
      usage = payload.usage ? { prompt_tokens: payload.usage.input_tokens, completion_tokens: payload.usage.output_tokens } : null;
    } else if (config.kind === 'google') {
      text = (((payload.candidates || [])[0] || {}).content?.parts || []).map(x => x.text || '').join('');
      usage = payload.usageMetadata ? {
        prompt_tokens: payload.usageMetadata.promptTokenCount,
        completion_tokens: payload.usageMetadata.candidatesTokenCount
      } : null;
    } else {
      text = payload.choices?.[0]?.message?.content;
      usage = payload.usage ? { prompt_tokens: payload.usage.prompt_tokens, completion_tokens: payload.usage.completion_tokens } : null;
    }
    if (typeof text !== 'string' || !text.trim()) throw new Error('provider_empty_response');
    return { text: text.trim().slice(0, 60000), usage, model: String(payload.model || config.model).slice(0, 160) };
  };

  try {
    return await Promise.race([performRequest(), deadline]);
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('provider_') || Number.isInteger(error.status))) throw error;
    if (signal.aborted || controller.signal.aborted || error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw new Error('provider_timeout_or_cancelled');
    }
    throw new Error('provider_connection_failed');
  } finally {
    clearTimeout(timer);
    if (!controller.signal.aborted) controller.abort();
  }
}

async function readBoundedResponseText(response, maximumBytes) {
  if (!response.body || typeof response.body.getReader !== 'function') {
    const raw = await response.text();
    if (new TextEncoder().encode(raw).byteLength > maximumBytes) throw new Error('provider_response_too_large');
    return raw;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let output = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maximumBytes) {
        await reader.cancel().catch(() => {});
        throw new Error('provider_response_too_large');
      }
      output += decoder.decode(value, { stream: true });
    }
    output += decoder.decode();
    return output;
  } finally {
    try { reader.releaseLock(); } catch {}
  }
}

export function estimateCost(config, inputChars, outputTokens = 1800) {
  if (config.localEndpoint) return 0;
  const inputTokens = Math.ceil(Math.max(0, inputChars) / 3) + 1200;
  const output = clampNumber(outputTokens, 1800, 80, 3000);
  if (!(config.inputUsdPerMillion > 0 && config.outputUsdPerMillion > 0)) return null;
  return ((inputTokens * config.inputUsdPerMillion) + (output * config.outputUsdPerMillion)) / 1_000_000 * 1.5;
}
function validPrice(value) { const number = Number(value); return Number.isFinite(number) && number >= 0 && number <= 10000 ? number : 0; }
function clampNumber(value, fallback, min, max) { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
