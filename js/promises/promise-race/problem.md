---
title: Promise.race
difficulty: Easy
order: 4
tags: [promises, polyfill]
frequency: medium
exports: [promiseRace]
hints:
  - A promise can only settle once, so you can hand the same `resolve` and `reject` to every input.
  - Wrap each input with `Promise.resolve` so plain values and thenables join the race too.
---

Implement `promiseRace(iterable)`, which behaves like `Promise.race` without calling it.

The returned promise settles the same way as the **first input to settle**: it fulfils if that input fulfils, and rejects if it rejects. Everything that settles afterwards is ignored.

```js
const timeout = new Promise((_, reject) => setTimeout(reject, 1000, new Error('timeout')))
promiseRace([fetchReport(), timeout])
  .then(render)
  .catch(showError) // 'timeout' if the report takes more than a second
```

## Notes

- Accept any iterable. Thenables must be adopted.
- Plain values join the race as already fulfilled, but they still settle asynchronously, in iteration order with other already-settled inputs: `promiseRace([Promise.resolve('a'), 'b'])` fulfils with `'a'`.
- An empty iterable returns a promise that stays pending forever.
