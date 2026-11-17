---
title: Promise.all
difficulty: Medium
order: 1
tags: [promises, polyfill, iterables]
frequency: high
exports: [promiseAll]
hints:
  - Return a new Promise and count how many inputs have fulfilled; resolve when the count reaches the number of inputs.
  - Store each value at its input index, not in the order the promises happen to settle.
  - Wrap every item with `Promise.resolve` so plain values and thenables are handled the same way as promises.
---

Implement `promiseAll(iterable)`, which behaves like `Promise.all` without calling it.

It returns a promise that:

- fulfils with an array of every input's value, **in input order**, once all inputs have fulfilled;
- rejects with the reason of the **first input to reject** (first in time, not first in the list), without waiting for the rest.

```js
const slow = new Promise((r) => setTimeout(r, 200, 'slow'))
const fast = new Promise((r) => setTimeout(r, 50, 'fast'))

promiseAll([slow, fast, 42]).then(console.log)
// after 200ms: ['slow', 'fast', 42]
```

## Notes

- The input can be any iterable (an array, a `Set`, a generator), not just an array.
- Items that are not promises count as already fulfilled. Thenables (objects with a `then` method) must be adopted.
- An empty iterable fulfils with `[]`.
- Always return a promise; never throw synchronously for promise inputs.
