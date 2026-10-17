/** Best-effort transactional set of local Storage key updates with rollback. */
export function applyStorageTransaction(storage, updates) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function' || typeof storage.removeItem !== 'function') {
    throw new TypeError('A Web Storage-compatible object is required.');
  }
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) throw new TypeError('Storage updates must be an object.');
  const entries = Object.entries(updates);
  const previous = new Map(entries.map(([key]) => [key, storage.getItem(key)]));
  const touched = [];
  try {
    for (const [key, value] of entries) {
      touched.push(key);
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, String(value));
    }
  } catch (cause) {
    let rollbackError = null;
    for (const key of touched.reverse()) {
      try {
        const oldValue = previous.get(key);
        if (oldValue === null) storage.removeItem(key);
        else storage.setItem(key, oldValue);
      } catch (error) { rollbackError ||= error; }
    }
    const error = new Error(rollbackError ? 'storage_transaction_rollback_failed' : 'storage_transaction_failed', { cause });
    if (rollbackError) error.rollbackCause = rollbackError;
    throw error;
  }
  return { applied: entries.length };
}
