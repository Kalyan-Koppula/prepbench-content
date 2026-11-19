**Key insight:** the result array is indexed by input position, and a counter (not `results.length`) tells you when everything has fulfilled. Rejection is just "pass `reject` straight through": a promise can only settle once, so later rejections are ignored for free.

## Approach

1. Return `new Promise((resolve, reject) => …)`.
2. Materialise the iterable with `Array.from` so you know its length and can index it.
3. If it is empty, resolve with `[]` straight away.
4. For each item, `Promise.resolve(item).then(value => { results[i] = value; if (--remaining === 0) resolve(results) }, reject)`.

## Walkthrough

`promiseAll([delay(30, 'a'), 'b', delay(10, 'c')])`:

| Time (ms) | Event | `results` | `remaining` |
| --- | --- | --- | --- |
| 0 | `'b'` is wrapped by `Promise.resolve`; its handler runs in a microtask | `[ , 'b', ]` | 2 |
| 10 | `'c'` fulfils | `[ , 'b', 'c']` | 1 |
| 30 | `'a'` fulfils | `['a', 'b', 'c']` | 0 → resolve |

Results go into `results[index]`, so the output follows **input order** even though `'c'` finished before `'a'`. If any input rejects, the outer promise rejects immediately; later settlements call `resolve`/`reject` again, which a settled promise ignores.

## Complexity

`O(n)` to attach handlers and collect results; total time is the slowest input (or the first rejection).

## Edge cases to test

- Empty input resolves to `[]` immediately.
- Non-promise values are passed through.
- Results keep input order regardless of completion order.
- The first rejection wins; later rejections are ignored.
- Any iterable works (a `Set`, a generator).

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

## In the interview

List the four requirements before coding (order, plain values, empty input, first rejection), then write it. A good follow-up to volunteer: `allSettled`, `any`, and a concurrency-limited version.
