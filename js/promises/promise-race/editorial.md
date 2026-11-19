**Key insight:** a promise ignores every `resolve`/`reject` after the first one, so a race is just "subscribe the outer `resolve` and `reject` to every input". No flags, no counters.

## Approach

1. Return `new Promise((resolve, reject) => …)`.
2. `for (const item of iterable) Promise.resolve(item).then(resolve, reject)`.
3. With no inputs nothing ever calls `resolve`, which is exactly the specified "pending forever".

## Walkthrough

`promiseRace([delay(50, 'slow'), delayReject(20, 'boom'), delay(30, 'mid')])`:

| Time | Event | Outer promise |
| --- | --- | --- |
| 20 | second input rejects | rejects with `'boom'` |
| 30, 50 | the others settle | ignored |

Every input calls the same `resolve` and `reject`; the first call settles the outer promise and the rest are no-ops. The losers keep running: `race` doesn't cancel anything.

## Complexity

`O(n)` to attach handlers.

## Edge cases to test

- The first to settle wins, whether it fulfils or rejects.
- A plain value wins against pending promises (it settles in the next microtask).
- Empty input stays pending forever.

## Pitfalls

- Calling `item.then` directly crashes on plain values.
- Adding a `settled` flag is harmless but signals you are not sure how promises work; interviewers notice.
- Checking for already-resolved values synchronously and resolving early changes the ordering rules; let `Promise.resolve(...).then` queue them in iteration order.

## Follow-ups interviewers add

- **Timeout helper:** `withTimeout(p, ms)` is a race against a rejecting timer, but remember to clear the timer when `p` wins.
- **Cancel the losers:** the race does not stop the slower operations; pass an `AbortSignal` if you need that.
- **`race` vs `any`:** `race` settles on the first rejection too, `any` waits for a fulfilment.

## In the interview

Explain why it's only a few lines (a promise can only settle once), mention the empty-input behaviour, and note the common use (timeouts) and its limitation (no cancellation without `AbortSignal`).
