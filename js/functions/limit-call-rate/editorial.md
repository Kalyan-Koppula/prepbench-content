**Key insight:** a sliding-window limiter is a queue of timestamps of allowed calls. On each call, evict the ones that have left the window; the queue's length is the number of calls in the window.

## Approach

1. Keep `allowed: number[]` (timestamps, oldest first) in the closure.
2. On a call, `now = Date.now()`; shift timestamps `<= now - windowMs` off the front.
3. If `allowed.length >= limit`, return `undefined`.
4. Otherwise push `now` and return `fn.apply(this, args)`.

The queue never holds more than `limit` entries, so each call is O(limit) at worst (O(1) amortized with a ring buffer or index pointer).

## Pitfalls

- **Fixed windows** (reset a counter every `windowMs`): allows up to `2 × limit` calls around a boundary, e.g. two at t=900 and two at t=1000.
- Recording dropped calls too: a client that keeps retrying is locked out forever.
- Off-by-one at the boundary: `<` vs `<=` decides whether a call exactly `windowMs` later is allowed. Pick one, state it, test it.
- Using `setTimeout` to decrement a counter: works, but leaves timers behind and is harder to test.

## Follow-ups interviewers add

- **Queue instead of drop:** delay extra calls until a slot frees up and return a promise for the result.
- **Token bucket:** allow bursts up to `capacity` and refill at a steady rate; compare with the sliding log.
- **Per-key limits:** `rateLimit` per user ID or endpoint, with cleanup of idle keys.
- **Memory:** a sliding *counter* (current + weighted previous bucket) instead of storing every timestamp.
