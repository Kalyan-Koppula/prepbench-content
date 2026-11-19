**Key insight:** a sliding-window limiter is a queue of timestamps of allowed calls. On each call, evict the ones that have left the window; the queue's length is the number of calls in the window.

## Approach

1. Keep `allowed: number[]` (timestamps, oldest first) in the closure.
2. On a call, `now = Date.now()`; shift timestamps `<= now - windowMs` off the front.
3. If `allowed.length >= limit`, return `undefined`.
4. Otherwise push `now` and return `fn.apply(this, args)`.

The queue never holds more than `limit` entries, so each call is O(limit) at worst (O(1) amortized with a ring buffer or index pointer).

## Walkthrough

`const ping = rateLimit(send, 3, 1000)` (at most 3 calls per rolling second):

| Time (ms) | `allowed` before | Pruned (≤ now − 1000) | Allowed? | `allowed` after |
| --- | --- | --- | --- | --- |
| 0 | [] | – | yes | [0] |
| 200 | [0] | – | yes | [0, 200] |
| 400 | [0, 200] | – | yes | [0, 200, 400] |
| 600 | [0, 200, 400] | – | **no** (3 already) | unchanged |
| 1000 | [0, 200, 400] | 0 | yes | [200, 400, 1000] |
| 1100 | [200, 400, 1000] | – | no | unchanged |

This is a **sliding-window log**: it remembers the timestamp of each allowed call and drops those older than the window.

## Complexity

Amortised `O(1)` per call (each timestamp is added and removed once); `O(limit)` memory. With a large limit, use an index pointer or a ring buffer instead of `shift()`, which is `O(n)` per call in JavaScript arrays.

## Edge cases to test

- Exactly `limit` calls inside one window are allowed; the next is rejected.
- A call exactly `windowMs` after the oldest one is allowed (boundary).
- Rejected calls don't consume slots.
- `this` and arguments are forwarded for allowed calls.

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

## In the interview

Name the algorithm (sliding-window log) and compare it with a fixed window (simple but allows bursts of 2× at window edges) and a token bucket (smooth rate, allows controlled bursts). Ask whether rejected calls should be dropped, queued, or return an error.
