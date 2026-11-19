**Key insight:** map every input to a promise that *always fulfils* with an outcome object. Once rejections are turned into values, the problem is `Promise.all` with no reject path.

## Approach

1. Materialise the iterable with `Array.from`; resolve `[]` immediately if it is empty.
2. For each item, `Promise.resolve(item).then(onFulfilled, onRejected)`, where both handlers write an outcome at the item's index and decrement a counter.
3. Resolve with the array when the counter hits zero. There is no `reject` call anywhere.

A one-liner works too if you are allowed to use `Promise.all`: `Promise.all(items.map(p => Promise.resolve(p).then(value => ({ status: 'fulfilled', value }), reason => ({ status: 'rejected', reason })))).`

## Walkthrough

`promiseAllSettled([fetchOk(), fetchFails(), 42])`:

| Input | Settles as | Recorded |
| --- | --- | --- |
| 0 | fulfils with `{ id: 1 }` | `{ status: 'fulfilled', value: { id: 1 } }` |
| 1 | rejects with `Error('503')` | `{ status: 'rejected', reason: Error('503') }` |
| 2 | `42` (plain value) | `{ status: 'fulfilled', value: 42 }` |

The outer promise **never rejects**: it waits for every input and resolves with one outcome object per input, in input order.

## Complexity

`O(n)`; total time is the slowest input.

## Edge cases to test

- Mixed fulfilments and rejections.
- All rejected: still resolves.
- Empty input resolves to `[]`.
- Outcome objects have exactly `status` plus `value` or `reason`.

## Pitfalls

- Building outcomes as `{ status, value, reason }` with one of them `undefined`; consumers that check `'value' in outcome` get confused.
- Wiring `reject` into the returned promise out of habit; `allSettled` has no failure path, so an early rejection would cut the batch short.
- Pushing outcomes in settle order rather than writing them by index.

## Follow-ups interviewers add

- **Partition the results** into `{ values, errors }`.
- **Add a timeout per input** so one hanging request does not hold up the batch.
- **When would you use `allSettled` over `all`?** Independent requests on a dashboard, where one failure should not hide the others.

## In the interview

Point out the one structural difference from `all`: both handlers record and decrement, and nothing rejects. Mention when to prefer it (independent requests where partial success is useful).
