const MAX_SSE_BUFFER_CHARS = 1_000_000;

/** Consume a Fetch Response using server-sent-events framing. */
export async function consumeSSEStream(response, onEvent) {
  if (!response?.body || typeof response.body.getReader !== 'function') throw new Error('SSE response body is not readable.');
  if (typeof onEvent !== 'function') throw new TypeError('onEvent must be a function.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', eventName = '', eventId = '', dataLines = [], frameChars = 0;
  const dispatch = async () => {
    if (dataLines.length) await onEvent({ event: eventName || 'message', data: dataLines.join('\n'), id: eventId });
    eventName = '';
    dataLines = [];
    frameChars = 0;
  };
  const processLine = async line => {
    frameChars += line.length + 1;
    if (frameChars > MAX_SSE_BUFFER_CHARS) throw new Error('SSE frame exceeds the maximum supported size.');
    if (line === '') { await dispatch(); return; }
    if (line.startsWith(':')) return;
    const colon = line.indexOf(':');
    const field = colon < 0 ? line : line.slice(0, colon);
    let value = colon < 0 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') eventName = value;
    else if (field === 'data') dataLines.push(value);
    else if (field === 'id' && !value.includes('\0')) eventId = value;
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      let newline = buffer.indexOf('\n');
      while (newline !== -1) {
        let line = buffer.slice(0, newline);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.length > MAX_SSE_BUFFER_CHARS) throw new Error('SSE line exceeds the maximum supported size.');
        buffer = buffer.slice(newline + 1);
        await processLine(line);
        newline = buffer.indexOf('\n');
      }
      if (buffer.length > MAX_SSE_BUFFER_CHARS) throw new Error('SSE frame exceeds the maximum supported size.');
      if (done) break;
    }
    if (buffer.length) {
      let lastLine = buffer;
      if (lastLine.endsWith('\r')) lastLine = lastLine.slice(0, -1);
      await processLine(lastLine);
    }
    await dispatch();
  } catch (error) {
    try { await reader.cancel(error); } catch {}
    throw error;
  } finally {
    reader.releaseLock?.();
  }
}
