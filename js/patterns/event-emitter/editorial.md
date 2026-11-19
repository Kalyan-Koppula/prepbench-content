**Key insight:** a `Map` from event name to an array of listener **records**, and an `emit` that iterates a snapshot. Records (not bare functions) let one function be registered twice, let `off` find `once` listeners, and give the unsubscribe closure something unique to remove.

## Approach

1. `add(event, fn, once)` pushes `{ fn, once, fired: false }` and returns `() => remove(event, record)`. Removing by record identity makes the returned function idempotent and precise.
2. `off(event, fn)` scans from the end and splices the first record whose `fn` matches.
3. `emit` returns `false` if there are no records. Otherwise it loops over `[...list]`; for a `once` record it checks and sets `fired` and removes the record **before** calling it, then calls `fn.apply(this, args)`.

## Walkthrough

```js
const bus = new EventEmitter()
const offA = bus.on('save', a)
bus.once('save', b)
bus.emit('save', doc) // a(doc), b(doc)
bus.emit('save', doc) // a(doc) only: b was a once-listener
offA()
bus.emit('save', doc) // nothing
```

| Emit | Listeners called | Listeners left |
| --- | --- | --- |
| 1st | a, b | a |
| 2nd | a | a |
| after `offA()` | – | none |

`emit` iterates over a **copy** of the listener list, so a listener that unsubscribes itself (or adds new ones) doesn't disturb the current emission.

## Complexity

`O(listeners)` per emit; `off` is `O(listeners)` for that event.

## Edge cases to test

- `on`, `once`, `off`, and the unsubscribe function returned by `on`.
- Arguments passed through to listeners.
- Removing a listener during emit.
- The same function registered twice.
- Emitting an event with no listeners.

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

## In the interview

Mention error isolation (should one throwing listener stop the rest?), memory leaks from listeners never removed, and the built-in `EventTarget` as an alternative in browsers.
