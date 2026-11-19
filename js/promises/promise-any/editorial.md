**Key insight:** `Promise.any` is `Promise.all` with the roles swapped. Fulfilment short-circuits (pass `resolve` straight through), and rejections are what you collect by index and count.

## Approach

1. Materialise the iterable. If it is empty, reject with `new AggregateError([], msg)` right away.
2. For each item: `Promise.resolve(item).then(resolve, reason => { errors[i] = reason; if (--remaining === 0) reject(new AggregateError(errors, msg)) })`.
3. Because a promise settles only once, later fulfilments and rejections after the first fulfilment are ignored automatically.

## Walkthrough

`promiseAny([reject(10, 'A'), resolve(30, 'B'), resolve(20, 'C')])`:

| Time | Event | Action |
| --- | --- | --- |
| 10 | A rejects | `errors[0] = 'A'`, remaining 2 |
| 20 | C fulfils | resolve with `'C'` |
| 30 | B fulfils | ignored (already settled) |

If all three had rejected, the outer promise would reject with an `AggregateError` whose `errors` array holds the reasons **in input order**.

## Complexity

`O(n)`; finishes at the first fulfilment or the last rejection.

## Edge cases to test

- The first fulfilment wins even if rejections came first.
- All rejected: `AggregateError` with ordered `errors`.
- Empty input rejects immediately with an `AggregateError`.
- Plain values count as immediate fulfilments.

## Pitfalls

- Pushing reasons in rejection order. The spec (and the tests) want input order, so write `errors[i]`.
- Rejecting with the last error or a plain `Error` instead of an `AggregateError`; callers inspect `err.errors`.
- Forgetting the empty case: with no inputs nothing ever rejects, so the promise hangs.
- Confusing `any` with `race`: `race` settles on the first *settlement*, including a rejection.

## Follow-ups interviewers add

- **Fastest mirror:** fire the same request at several hosts with `any`, then abort the losers with an `AbortController`.
- **Without `AggregateError`:** older runtimes lack it; build an `Error` with an `errors` property.
- **Hedged requests:** start the second request only if the first has not answered within N ms.

## In the interview

Describe it as "`all` with the roles of fulfilment and rejection swapped", including the empty-input behaviour, which is the mirror image of `all`'s.
