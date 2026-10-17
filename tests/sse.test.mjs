import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeSSEStream } from '../web/sse.mjs';

function responseFromChunks(chunks) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({ start(controller) {
    for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
    controller.close();
  }}), { headers: { 'content-type': 'text/event-stream' } });
}

test('consumeSSEStream parses fragmented UTF-8 frames as separate events', async () => {
  const events = [];
  await consumeSSEStream(responseFromChunks([
    ': keep-alive\r\nevent: pro', 'gress\r\ndata: {"message":"Xin chào"}\r\n\r\nevent: result\ndata: {"ok":', 'true}\n\n'
  ]), item => events.push(item));
  assert.deepEqual(events, [
    { event: 'progress', data: '{"message":"Xin chào"}', id: '' },
    { event: 'result', data: '{"ok":true}', id: '' }
  ]);
});

test('consumeSSEStream joins multiple data lines and retains event id', async () => {
  const events = [];
  await consumeSSEStream(responseFromChunks(['id: session-123\nevent: trace\ndata: first\ndata: second\n\n']), item => events.push(item));
  assert.deepEqual(events, [{ event: 'trace', data: 'first\nsecond', id: 'session-123' }]);
});

test('consumeSSEStream rejects oversized frames', async () => {
  const encoder = new TextEncoder();
  const response = new Response(new ReadableStream({ start(controller) {
    controller.enqueue(encoder.encode('x'.repeat(1_000_001)));
    controller.close();
  }}));
  await assert.rejects(consumeSSEStream(response, () => {}), /maximum supported size/);
});


test('consumeSSEStream rejects oversized aggregate frames across individually bounded data lines', async () => {
  const response = responseFromChunks([
    'data: ' + 'a'.repeat(600_000) + '\n',
    'data: ' + 'b'.repeat(500_000) + '\n\n'
  ]);
  await assert.rejects(consumeSSEStream(response, () => {}), /SSE frame exceeds the maximum supported size/);
});
