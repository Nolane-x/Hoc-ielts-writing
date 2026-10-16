import test from 'node:test';
import assert from 'node:assert/strict';
import { applyStorageTransaction } from '../web/storage-transaction.mjs';

class MemoryStorage {
  #data = new Map();
  failKey = null;
  failuresRemaining = 0;
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) {
    if (this.failKey === key && this.failuresRemaining > 0) { this.failuresRemaining -= 1; throw new Error('quota exceeded'); }
    this.#data.set(key, String(value));
  }
  removeItem(key) { this.#data.delete(key); }
}

test('applyStorageTransaction applies writes and removals', () => {
  const storage = new MemoryStorage();
  storage.setItem('draft', 'old');
  storage.setItem('obsolete', 'x');
  assert.deepEqual(applyStorageTransaction(storage, { draft: 'new', obsolete: null, history: '[]' }), { applied: 3 });
  assert.equal(storage.getItem('draft'), 'new');
  assert.equal(storage.getItem('obsolete'), null);
  assert.equal(storage.getItem('history'), '[]');
});

test('applyStorageTransaction rolls touched keys back after a failed write', () => {
  const storage = new MemoryStorage();
  storage.setItem('a', 'original-a');
  storage.setItem('b', 'original-b');
  storage.failKey = 'b';
  storage.failuresRemaining = 1;
  assert.throws(() => applyStorageTransaction(storage, { a: 'changed-a', b: 'changed-b', c: 'new-c' }), /storage_transaction_failed/);
  assert.equal(storage.getItem('a'), 'original-a');
  assert.equal(storage.getItem('b'), 'original-b');
  assert.equal(storage.getItem('c'), null);
});

test('applyStorageTransaction reports when rollback itself cannot complete', () => {
  const storage = new MemoryStorage();
  storage.setItem('a', 'original-a');
  storage.setItem('b', 'original-b');
  storage.failKey = 'b';
  storage.failuresRemaining = 2;
  assert.throws(() => applyStorageTransaction(storage, { b: 'changed-b', a: 'changed-a' }), /storage_transaction_rollback_failed/);
});
