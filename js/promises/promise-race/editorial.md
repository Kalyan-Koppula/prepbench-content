**Key insight:** a promise ignores every `resolve`/`reject` after the first one, so a race is just "subscribe the outer `resolve` and `reject` to every input". No flags, no counters.

## Approach

1. Return `new Promise((resolve, reject) => …)`.
2. `for (const item of iterable) Promise.resolve(item).then(resolve, reject)`.
3. With no inputs nothing ever calls `resolve`, which is exactly the specified "pending forever".

## Pitfalls

- Calling `item.then` directly crashes on plain values.
- Adding a `settled` flag is harmless but signals you are not sure how promises work; interviewers notice.
- Checking for already-resolved values synchronously and resolving early changes the ordering rules; let `Promise.resolve(...).then` queue them in iteration order.

## Follow-ups interviewers add

- **Timeout helper:** `withTimeout(p, ms)` is a race against a rejecting timer, but remember to clear the timer when `p` wins.
- **Cancel the losers:** the race does not stop the slower operations; pass an `AbortSignal` if you need that.
- **`race` vs `any`:** `race` settles on the first rejection too, `any` waits for a fulfilment.
