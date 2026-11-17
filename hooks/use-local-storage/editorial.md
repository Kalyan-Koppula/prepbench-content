**Key insight:** `localStorage` is the source of truth, and there are two broadcast channels: the browser's `storage` event for other tabs, and your own subscriber list for this tab.

## Approach

Initialise state lazily with `read(key, initialValue)`, which returns the fallback for a missing key, invalid JSON, or storage that throws. `setValue` resolves an updater against the value *currently in storage* (so chained updaters and other instances agree), writes the JSON, sets local state, and calls every function in a module-level `subscribers` set with `(key, value)`. Browsers only fire `storage` in other documents, so this set is what reaches sibling instances in the same tab. An effect adds the instance to that set and also listens for `storage` on `window`. When `e.key` matches (or is `null`, which `localStorage.clear()` in another tab sends), it parses `newValue`, treating `null` as removed. The cleanup undoes both.

A common alternative is to dispatch a synthetic `new StorageEvent('storage', { key, newValue })` on `window` after writing, so one listener handles both cases. It works in a normal page, but it fakes a browser event, and other code listening for `storage` will see it too.

## Pitfalls

- Reading storage in the component body on every render instead of in a lazy initialiser.
- `JSON.parse` without try/catch: one corrupted entry crashes the page on load.
- Two components with the same key drift apart because nothing tells the second one about the change.
- Calling `setState` or dispatching events *inside* a `setState` updater: updaters must be pure and may run twice in Strict Mode.
- Closing over `initialValue` in a `[]` effect; keep it in a ref if the effect must not resubscribe.

## Follow-ups

- Handle `key` changing (re-read the new key).
- Make it SSR-safe (no `window` during server render) and rewrite it with `useSyncExternalStore`, whose `subscribe` is exactly the subscriber set plus the `storage` listener.
- Add a `remove()` function, or `serialize`/`deserialize` options for `Date`, `Map`, etc.
