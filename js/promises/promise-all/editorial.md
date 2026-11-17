**Key insight:** the result array is indexed by input position, and a counter (not `results.length`) tells you when everything has fulfilled. Rejection is just "pass `reject` straight through": a promise can only settle once, so later rejections are ignored for free.

## Approach

1. Return `new Promise((resolve, reject) => …)`.
2. Materialise the iterable with `Array.from` so you know its length and can index it.
3. If it is empty, resolve with `[]` straight away.
4. For each item, `Promise.resolve(item).then(value => { results[i] = value; if (--remaining === 0) resolve(results) }, reject)`.

## Pitfalls

- Using `results.push(value)` stores values in settle order, not input order.
- Checking `results.length === items.length` breaks: assigning `results[2]` first makes the length 3 immediately.
- Forgetting the empty case leaves the promise pending forever.
- Calling `item.then(...)` directly crashes on plain values; `Promise.resolve(item)` handles values, promises and thenables uniformly.
- Iterating the iterable twice (once to count, once to subscribe) breaks for generators, which can only be consumed once.

## Follow-ups interviewers add

- **`Promise.allSettled`, `Promise.any`, `Promise.race`:** the same skeleton with different settle rules.
- **Concurrency limit:** run at most N of the tasks at once (see Async pool).
- **Cancellation:** when one rejects, abort the remaining work with an `AbortController`.
- **Why `Promise.resolve` rather than `instanceof Promise`?** Thenables from other libraries must be adopted too.
