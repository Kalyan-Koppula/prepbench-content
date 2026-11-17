**Key insight:** `Promise.any` is `Promise.all` with the roles swapped. Fulfilment short-circuits (pass `resolve` straight through), and rejections are what you collect by index and count.

## Approach

1. Materialise the iterable. If it is empty, reject with `new AggregateError([], msg)` right away.
2. For each item: `Promise.resolve(item).then(resolve, reason => { errors[i] = reason; if (--remaining === 0) reject(new AggregateError(errors, msg)) })`.
3. Because a promise settles only once, later fulfilments and rejections after the first fulfilment are ignored automatically.

## Pitfalls

- Pushing reasons in rejection order. The spec (and the tests) want input order, so write `errors[i]`.
- Rejecting with the last error or a plain `Error` instead of an `AggregateError`; callers inspect `err.errors`.
- Forgetting the empty case: with no inputs nothing ever rejects, so the promise hangs.
- Confusing `any` with `race`: `race` settles on the first *settlement*, including a rejection.

## Follow-ups interviewers add

- **Fastest mirror:** fire the same request at several hosts with `any`, then abort the losers with an `AbortController`.
- **Without `AggregateError`:** older runtimes lack it; build an `Error` with an `errors` property.
- **Hedged requests:** start the second request only if the first has not answered within N ms.
