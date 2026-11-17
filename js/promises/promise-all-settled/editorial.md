**Key insight:** map every input to a promise that *always fulfils* with an outcome object. Once rejections are turned into values, the problem is `Promise.all` with no reject path.

## Approach

1. Materialise the iterable with `Array.from`; resolve `[]` immediately if it is empty.
2. For each item, `Promise.resolve(item).then(onFulfilled, onRejected)`, where both handlers write an outcome at the item's index and decrement a counter.
3. Resolve with the array when the counter hits zero. There is no `reject` call anywhere.

A one-liner works too if you are allowed to use `Promise.all`: `Promise.all(items.map(p => Promise.resolve(p).then(value => ({ status: 'fulfilled', value }), reason => ({ status: 'rejected', reason })))).`

## Pitfalls

- Building outcomes as `{ status, value, reason }` with one of them `undefined`; consumers that check `'value' in outcome` get confused.
- Wiring `reject` into the returned promise out of habit; `allSettled` has no failure path, so an early rejection would cut the batch short.
- Pushing outcomes in settle order rather than writing them by index.

## Follow-ups interviewers add

- **Partition the results** into `{ values, errors }`.
- **Add a timeout per input** so one hanging request does not hold up the batch.
- **When would you use `allSettled` over `all`?** Independent requests on a dashboard, where one failure should not hide the others.
