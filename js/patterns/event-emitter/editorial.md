**Key insight:** a `Map` from event name to an array of listener **records**, and an `emit` that iterates a snapshot. Records (not bare functions) let one function be registered twice, let `off` find `once` listeners, and give the unsubscribe closure something unique to remove.

## Approach

1. `add(event, fn, once)` pushes `{ fn, once, fired: false }` and returns `() => remove(event, record)`. Removing by record identity makes the returned function idempotent and precise.
2. `off(event, fn)` scans from the end and splices the first record whose `fn` matches.
3. `emit` returns `false` if there are no records. Otherwise it loops over `[...list]`; for a `once` record it checks and sets `fired` and removes the record **before** calling it, then calls `fn.apply(this, args)`.

## Pitfalls

- Iterating the live array: a listener that removes itself shifts the next one into its index and it gets skipped; a listener added during emit runs immediately (or forever, if it keeps adding).
- Implementing `once` with a wrapper function: `off(event, original)` can't find it unless the wrapper remembers the original (`wrapper.listener = fn`, which is what Node does).
- Removing a `once` listener **after** calling it lets a re-entrant emit call it twice.
- Arrow-function listeners ignore `this`, but the emitter must still pass it; tests check with regular functions.
- `filter(l => l !== fn)` in `off` removes every registration of that function, not one.

## Follow-ups interviewers add

- **Error handling:** if a listener throws, should the others still run? (Node rethrows; DOM `dispatchEvent` reports and continues.) Implement "collect and rethrow after the loop".
- **Wildcard listeners** (`'*'`) and namespaced events (see "Pub/Sub with Wildcards").
- **Memory leaks:** warn when more than N listeners are added for one event, like Node's `maxListeners`.
- **Typed events:** `class Emitter<Events extends Record<string, unknown[]>>` so `emit('save', 1)` is a type error when `save` takes a string.
- **Async emit:** `emitAsync` that awaits listeners in order.
