---
title: Promise.allSettled
difficulty: Easy
order: 2
tags: [promises, polyfill]
frequency: medium
exports: [promiseAllSettled]
hints:
  - Unlike `Promise.all`, a rejection is not a reason to stop; it is just another outcome to record.
  - Convert each input into a promise that always fulfils with an outcome object, then wait for all of them.
---

Implement `promiseAllSettled(iterable)`, which behaves like `Promise.allSettled` without calling it.

The returned promise **never rejects**. Once every input has settled it fulfils with an array of outcome objects, in input order:

- `{ status: 'fulfilled', value }` for an input that fulfilled;
- `{ status: 'rejected', reason }` for an input that rejected.

```js
promiseAllSettled([
  fetchUser(1),               // fulfils with { id: 1 }
  Promise.reject(new Error('gone')),
  'cached',
]).then(console.log)
// [
//   { status: 'fulfilled', value: { id: 1 } },
//   { status: 'rejected', reason: Error('gone') },
//   { status: 'fulfilled', value: 'cached' },
// ]
```

## Notes

- Accept any iterable. Plain values count as fulfilled; thenables must be adopted.
- An empty iterable fulfils with `[]`.
- Outcome objects have exactly the two keys shown (no `value: undefined` on a rejected outcome).
